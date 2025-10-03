# DocuSign Integration Setup Guide

## ✅ What We've Implemented

### **Backend Integration Complete:**
1. **Updated Contract Model** - Added DocuSign-specific fields
2. **DocuSign Service** - Complete API integration service
3. **Updated Controllers** - Send for signature, status tracking, webhooks
4. **API Endpoints** - All necessary routes for contract management

### **Contract Generation Flow:**
1. **Select Template** → **Fill Data** → **Generate PDF** → **Send for E-Signature** → **Track Status** → **Store Signed Contract**

## 🔧 DocuSign Setup Required

### **Step 1: Create DocuSign Developer Account**
1. Go to https://developers.docusign.com/
2. Sign up for free developer account
3. Create a new application

### **Step 2: Get API Credentials**
1. **Client ID** - From your DocuSign app
2. **Client Secret** - From your DocuSign app  
3. **Impersonated User ID** - Your DocuSign user ID
4. **Account ID** - Your DocuSign account ID
5. **Private Key** - Generate RSA key pair for JWT authentication

### **Step 3: Add Environment Variables to Render**
Add these to your Render environment variables:

```
DOCUSIGN_BASE_URL=https://demo.docusign.net/restapi
DOCUSIGN_CLIENT_ID=your_client_id_here
DOCUSIGN_CLIENT_SECRET=your_client_secret_here
DOCUSIGN_IMPERSONATED_USER_ID=your_user_id_here
DOCUSIGN_ACCOUNT_ID=your_account_id_here
DOCUSIGN_PRIVATE_KEY=your_private_key_here
```

### **Step 4: Set Up Webhook (Optional)**
1. In DocuSign admin, go to **Connect** → **Event Notifications**
2. Add webhook URL: `https://your-domain.com/api/contracts/webhook/docusign`
3. Select events: `envelope-sent`, `envelope-delivered`, `envelope-completed`, `envelope-declined`, `envelope-voided`

## 📋 API Endpoints Available

### **Contract Templates:**
- `GET /api/contract-templates` - List all templates
- `POST /api/contract-templates` - Create template
- `PUT /api/contract-templates/:id` - Update template
- `DELETE /api/contract-templates/:id` - Delete template

### **Contract Generation:**
- `POST /api/contracts/generate` - Generate contract from template
- `GET /api/contracts` - List all contracts
- `GET /api/contracts/:id` - Get contract details
- `GET /api/contracts/:id/status` - Get signature status
- `GET /api/contracts/:id/download` - Download contract PDF

### **E-Signature:**
- `POST /api/contracts/:id/send-signature` - Send for DocuSign signature
- `POST /api/contracts/webhook/docusign` - DocuSign webhook handler

## 🎯 Contract Types Supported

1. **Freelancer Contracts** - Independent contractor agreements
2. **Mentor Contracts** - Mentoring service agreements  
3. **Delivery Contracts** - Service delivery agreements
4. **Company Contracts** - Business partnership agreements

## 📝 Template Placeholders

Templates support dynamic placeholders like:
- `{{name}}` - Recipient name
- `{{email}}` - Recipient email
- `{{company}}` - Company name
- `{{date}}` - Contract date
- `{{amount}}` - Payment amount
- `{{duration}}` - Contract duration

## 🚀 Next Steps

1. **Set up DocuSign credentials** (see steps above)
2. **Create frontend interface** for contract management
3. **Test contract generation** workflow
4. **Set up webhook** for real-time status updates

## 🔍 Testing

Once DocuSign is configured, you can test the flow:

1. **Create a contract template** with placeholders
2. **Generate a contract** with real data
3. **Send for signature** via DocuSign
4. **Track status** and receive signed document
5. **Store signed contract** in contact profile

The system is now ready for DocuSign integration! 🎉
