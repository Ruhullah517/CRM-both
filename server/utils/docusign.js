const axios = require('axios');
const fs = require('fs');
const path = require('path');

class DocuSignService {
  constructor() {
    this.baseUrl = process.env.DOCUSIGN_BASE_URL || 'https://demo.docusign.net/restapi';
    this.clientId = process.env.DOCUSIGN_CLIENT_ID;
    this.clientSecret = process.env.DOCUSIGN_CLIENT_SECRET;
    this.privateKey = process.env.DOCUSIGN_PRIVATE_KEY;
    this.impersonatedUserId = process.env.DOCUSIGN_IMPERSONATED_USER_ID;
    this.accountId = process.env.DOCUSIGN_ACCOUNT_ID;
    this.rsaKeyId = process.env.DOCUSIGN_RSA_KEY_ID;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  // Get access token using JWT authentication
  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(`${this.baseUrl}/oauth2/token`, {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: this.generateJWT()
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000) - 60000); // 1 minute buffer
      
      return this.accessToken;
    } catch (error) {
      console.error('DocuSign authentication error:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with DocuSign');
    }
  }

  // Generate JWT for DocuSign authentication
  generateJWT() {
    const jwt = require('jsonwebtoken');
    
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: this.clientId,
      sub: this.impersonatedUserId,
      aud: 'account-d.docusign.com',
      iat: now,
      exp: now + 3600, // 1 hour
      scope: 'signature impersonation'
    };

    try {
      // Sign with the private key
      return jwt.sign(payload, this.privateKey, { 
        algorithm: 'RS256',
        header: {
          kid: this.rsaKeyId // RSA Key ID from DocuSign
        }
      });
    } catch (error) {
      console.error('JWT generation error:', error);
      throw new Error('Failed to generate JWT token');
    }
  }

  // Send envelope for signature
  async sendEnvelope(contractData) {
    try {
      const accessToken = await this.getAccessToken();
      
      const envelope = {
        emailSubject: `Contract: ${contractData.name}`,
        documents: [{
          documentId: '1',
          name: `${contractData.name}.pdf`,
          fileExtension: 'pdf',
          documentBase64: contractData.pdfBase64
        }],
        recipients: {
          signers: [{
            email: contractData.recipientEmail,
            name: contractData.recipientName,
            recipientId: '1',
            routingOrder: '1',
            tabs: {
              signHereTabs: [{
                documentId: '1',
                pageNumber: '1',
                xPosition: '100',
                yPosition: '100'
              }]
            }
          }]
        },
        status: 'sent'
      };

      const response = await axios.post(
        `${this.baseUrl}/v2.1/accounts/${this.accountId}/envelopes`,
        envelope,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        envelopeId: response.data.envelopeId,
        status: response.data.status,
        statusDateTime: response.data.statusDateTime
      };

    } catch (error) {
      console.error('DocuSign send envelope error:', error.response?.data || error.message);
      throw new Error('Failed to send contract for signature');
    }
  }

  // Get envelope status
  async getEnvelopeStatus(envelopeId) {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await axios.get(
        `${this.baseUrl}/v2.1/accounts/${this.accountId}/envelopes/${envelopeId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        envelopeId: response.data.envelopeId,
        status: response.data.status,
        statusDateTime: response.data.statusDateTime,
        completedDateTime: response.data.completedDateTime
      };

    } catch (error) {
      console.error('DocuSign get status error:', error.response?.data || error.message);
      throw new Error('Failed to get envelope status');
    }
  }

  // Download completed document
  async downloadDocument(envelopeId) {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await axios.get(
        `${this.baseUrl}/v2.1/accounts/${this.accountId}/envelopes/${envelopeId}/documents/combined`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/pdf'
          },
          responseType: 'arraybuffer'
        }
      );

      return response.data;

    } catch (error) {
      console.error('DocuSign download error:', error.response?.data || error.message);
      throw new Error('Failed to download signed document');
    }
  }

  // Process webhook events
  async processWebhookEvent(eventData) {
    try {
      const { event, envelopeId, status } = eventData;
      
      // Map DocuSign status to our contract status
      const statusMap = {
        'sent': 'sent',
        'delivered': 'delivered',
        'completed': 'signed',
        'declined': 'declined',
        'voided': 'cancelled',
        'expired': 'expired'
      };

      return {
        envelopeId,
        status: statusMap[status] || status,
        event,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('DocuSign webhook processing error:', error);
      throw new Error('Failed to process webhook event');
    }
  }
}

module.exports = new DocuSignService();
