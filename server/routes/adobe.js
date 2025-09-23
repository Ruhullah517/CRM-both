require('dotenv').config();
const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const qs = require('qs'); // Add this at the top if not already
const { authenticate, authorize } = require('../middleware/auth');

const CLIENT_ID = process.env.ADOBE_CLIENT_ID;
const CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;
const REDIRECT_URI = 'https://backendcrm.blackfostercarersalliance.co.uk/api/adobe/callback';

// Step 1: Redirect to Adobe Sign
router.get('/auth', (req, res) => {
    const authURL = `https://secure.sg1.adobesign.com/public/oauth/v2?redirect_uri=${REDIRECT_URI}&response_type=code&client_id=${CLIENT_ID}&scope=user_login:self+agreement_send:account+agreement_write:account`;
    res.redirect(authURL);
});

// Step 2: Handle callback and exchange code for access_token
router.get('/callback', async (req, res) => {
    const code = req.query.code;

    if (!code) {
        return res.status(400).send('Missing authorization code');
    }

    try {
        const tokenRes = await axios.post(
            'https://secure.sg1.adobesign.com/oauth/v2/token',
            qs.stringify({
                grant_type: 'authorization_code',
                code,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                redirect_uri: REDIRECT_URI,
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        const accessToken = tokenRes.data.access_token;
        const refreshToken = tokenRes.data.refresh_token;
        res.send({
            success: true,
            accessToken,
            refreshToken,
        });
    } catch (err) {
        console.error('Token exchange error:', err.response?.data || err.message);
        res.status(500).json({ error: 'Token exchange failed', details: err.response?.data || err.message });
    }
});

// POST /api/adobe/exchange-token (admin only)
router.post('/exchange-token', authenticate, authorize('admin'), async (req, res) => {
    const { code, redirectUri } = req.body;

    try {
        const response = await axios.post('https://api.adobesign.com/oauth/token', null, {
            params: {
                code,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code'
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const { access_token, refresh_token, expires_in } = response.data;

        // TODO: Save tokens to DB (under a single settings/config table or collection)
        console.log('Adobe Sign Access Token:', access_token);

        res.status(200).json({ message: 'Adobe Sign connected successfully', access_token, refresh_token, expires_in });
    } catch (err) {
        console.error('Adobe token exchange failed:', err.response?.data || err.message);
        res.status(500).json({ error: 'Token exchange failed' });
    }
});

// Helper: Read PDF and encode as base64
function getBase64(filePath) {
  const file = fs.readFileSync(filePath);
  return file.toString('base64');
}

// POST /api/adobe/send-agreement (admin or staff)
router.post('/send-agreement', authenticate, authorize('admin', 'manager', 'staff'), async (req, res) => {
  const { accessToken, recipientEmail, contractPath, contractName } = req.body;

  // 1. Read and encode the contract PDF
  const fileBase64 = getBase64(contractPath);

  // 2. Prepare the agreement payload
  const agreementPayload = {
    fileInfos: [
      {
        name: contractName || 'Contract.pdf',
        file: fileBase64,
      },
    ],
    name: contractName || 'Contract for Signature',
    participantSetsInfo: [
      {
        memberInfos: [{ email: recipientEmail }],
        order: 1,
        role: 'SIGNER',
      },
    ],
    signatureType: 'ESIGN',
    state: 'IN_PROCESS', // Send immediately
  };

  try {
    // 3. Call Adobe Sign API to create the agreement
    const response = await axios.post(
      'https://api.adobesign.com/api/rest/v6/agreements',
      agreementPayload,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // 4. Respond with agreementId and status
    res.json({ success: true, agreementId: response.data.id, status: response.data.status });
  } catch (err) {
    console.error('Adobe Sign agreement error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to send agreement', details: err.response?.data || err.message });
  }
});

// Webhook to receive Adobe agreement status updates
router.post('/webhook', async (req, res) => {
  try {
    const event = req.body;
    // Expect minimal body: { agreementId, status }
    if (!event || !event.agreementId) return res.status(400).json({ msg: 'Invalid webhook payload' });
    const GeneratedContract = require('../models/Contract');
    const contract = await GeneratedContract.findOne({ externalAgreementId: event.agreementId });
    if (contract) {
      if (event.status && event.status.toLowerCase() === 'signed') {
        contract.status = 'signed';
      } else if (event.status && event.status.toLowerCase() === 'cancelled') {
        contract.status = 'cancelled';
      }
      await contract.save();
    }
    res.json({ ok: true });
  } catch (e) {
    console.error('Adobe webhook error:', e.message);
    res.status(200).json({ ok: true });
  }
});


module.exports = router;
