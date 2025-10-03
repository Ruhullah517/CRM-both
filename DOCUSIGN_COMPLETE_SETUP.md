# DocuSign Complete Setup Guide

## 🎯 Your DocuSign Configuration

### **✅ What You Have:**
- **Integration Key:** `6e880718-a44f-42e7-9f50-9b6954bd8437`
- **Integration Type:** Private custom integration ✅
- **Authentication:** Authorization Code Grant ✅
- **Secret Key:** Available ✅

## 🔧 **Step-by-Step Setup:**

### **Step 1: Generate RSA Keypair**
1. In your DocuSign app settings, click **"Generate RSA"**
2. **Download the private key** (save as `docusign_private_key.pem`)
3. **Copy the Key ID** (you'll need this)

### **Step 2: Get Account Information**
1. **Account ID:** 
   - Go to DocuSign Admin → Account → Account Information
   - Copy the Account ID (looks like: `12345678-1234-1234-1234-123456789012`)

2. **User ID:**
   - Go to DocuSign Admin → Users
   - Find your user → Copy the User ID (usually your email)

### **Step 3: Add CORS Origins**
In your DocuSign app settings, add these origin URLs:
```
https://crm-both.vercel.app
https://your-render-domain.onrender.com
http://localhost:3000
```

### **Step 4: Add Environment Variables to Render**

Go to your Render dashboard → Your service → Environment tab → Add these variables:

```bash
# DocuSign Configuration
DOCUSIGN_BASE_URL=https://demo.docusign.net/restapi
DOCUSIGN_CLIENT_ID=6e880718-a44f-42e7-9f50-9b6954bd8437
DOCUSIGN_CLIENT_SECRET=your_secret_key_here
DOCUSIGN_IMPERSONATED_USER_ID=your_user_id_here
DOCUSIGN_ACCOUNT_ID=your_account_id_here
DOCUSIGN_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_CONTENT_HERE\n-----END PRIVATE KEY-----
DOCUSIGN_RSA_KEY_ID=your_rsa_key_id_here
```

### **Step 5: Format Private Key Correctly**

The private key needs to be formatted with `\n` for line breaks:

```bash
# Example format:
DOCUSIGN_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----
```

### **Step 6: Test the Integration**

Once all environment variables are set:

1. **Deploy your changes** to Render
2. **Test contract generation** via API
3. **Check logs** for any authentication errors

## 🚀 **API Testing**

### **Test Contract Generation:**
```bash
POST /api/contracts/generate
{
  "name": "Test Contract",
  "templateId": "template_id_here",
  "roleType": "freelancer",
  "generatedBy": "user_id_here",
  "filledData": {
    "name": "John Doe",
    "email": "john@example.com",
    "company": "Test Company"
  }
}
```

### **Test Sending for Signature:**
```bash
POST /api/contracts/{contract_id}/send-signature
{
  "recipientEmail": "signer@example.com",
  "recipientName": "John Signer"
}
```

## 🔍 **Troubleshooting**

### **Common Issues:**

1. **JWT Authentication Error:**
   - Check private key format (must have `\n` for line breaks)
   - Verify RSA Key ID is correct
   - Ensure User ID is correct

2. **CORS Errors:**
   - Add your domain to CORS origins in DocuSign
   - Check that origin URLs match exactly

3. **Account ID Errors:**
   - Verify Account ID is correct
   - Make sure you're using the right DocuSign environment (demo vs production)

### **Debug Steps:**
1. Check Render logs for authentication errors
2. Verify all environment variables are set correctly
3. Test with a simple API call first

## ✅ **Ready to Use!**

Once configured, your contract generation system will:
- ✅ Generate professional PDF contracts
- ✅ Send them via DocuSign for e-signature
- ✅ Track signature status in real-time
- ✅ Store signed contracts automatically

## 📞 **Need Help?**

If you encounter issues:
1. Check the Render logs for specific error messages
2. Verify all environment variables are set correctly
3. Test with DocuSign's API explorer first

The system is now ready for DocuSign integration! 🎉
