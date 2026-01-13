# 📍 Centralized URL Configuration Guide

## Overview

All URLs in the CRM application are now managed from **two central configuration files**:

1. **Server (Backend):** `server/config/urls.js`
2. **Client (Frontend):** `client/src/config/urls.js`

## ✨ Benefits

- ✅ **Single Source of Truth** - Change URLs in one place
- ✅ **Automatic Environment Detection** - Switches between development and production automatically
- ✅ **Easy Updates** - No need to search through multiple files
- ✅ **Environment Variable Support** - Override URLs using `.env` files

---

## 🎯 How to Change URLs

### Option 1: Edit Configuration Files (Recommended)

#### For Backend URLs:
Edit: `server/config/urls.js`

```javascript
const URL_CONFIG = {
  FRONTEND_URL: process.env.FRONTEND_URL || (
    isDevelopment 
      ? 'http://localhost:5173'                              // ← Change development URL here
      : 'http://crm.blackfostercarersalliance.co.uk'         // ← Change production URL here
  ),
  
  SERVER_URL: process.env.SERVER_URL || (
    isDevelopment 
      ? 'http://localhost:5000'                              // ← Change development URL here
      : 'http://backendcrm.blackfostercarersalliance.co.uk'  // ← Change production URL here
  ),
};
```

#### For Frontend URLs:
Edit: `client/src/config/urls.js`

```javascript
export const URL_CONFIG = {
  FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || (
    isDevelopment()
      ? 'http://localhost:5173'                              // ← Change development URL here
      : 'http://crm.blackfostercarersalliance.co.uk'         // ← Change production URL here
  ),

  SERVER_URL: import.meta.env.VITE_SERVER_URL || (
    isDevelopment()
      ? 'http://localhost:5000'                              // ← Change development URL here
      : 'http://backendcrm.blackfostercarersalliance.co.uk'  // ← Change production URL here
  ),
};
```

### Option 2: Use Environment Variables

Create `.env` files (from templates):

#### Server `.env`:
```bash
cd server
copy env.template .env    # Windows
# OR
cp env.template .env      # Mac/Linux
```

Edit `server/.env`:
```env
FRONTEND_URL=http://crm.blackfostercarersalliance.co.uk
SERVER_URL=http://backendcrm.blackfostercarersalliance.co.uk
```

#### Client `.env`:
```bash
cd client
copy env.template .env    # Windows
# OR
cp env.template .env      # Mac/Linux
```

Edit `client/.env`:
```env
VITE_FRONTEND_URL=http://crm.blackfostercarersalliance.co.uk
VITE_SERVER_URL=http://backendcrm.blackfostercarersalliance.co.uk
```

---

## 📂 Files That Use Centralized URLs

### Backend Files (Using `server/config/urls.js`)

✅ `server/server.js` - CORS configuration
✅ `server/controllers/trainingController.js` - Training booking emails
✅ `server/controllers/userController.js` - Password reset emails
✅ `server/controllers/freelancerController.js` - Freelancer form links
✅ `server/controllers/contractController.js` - Contract document URLs
✅ `server/routes/adobe.js` - Adobe Sign integration
✅ `server/utils/emailTemplates.js` - Email template links

### Frontend Files (Using `client/src/config/urls.js`)

✅ `client/src/config/api.js` - API configuration
✅ `client/src/components/AdobeSignConnect.jsx` - Adobe Sign redirect
✅ `client/src/pages/AdobeCallback.jsx` - Adobe callback
✅ `client/vite.config.js` - Proxy configuration

---

## 🔧 Configuration API

### Server (Node.js)

```javascript
// Import the configuration
const { getFrontendUrl, getServerUrl, getApiBaseUrl } = require('./config/urls');

// Use in your code
const frontendUrl = getFrontendUrl();
const serverUrl = getServerUrl();
const apiUrl = getApiBaseUrl();
```

### Client (React/Vite)

```javascript
// Import the configuration
import { getFrontendUrl, getServerUrl, getApiBaseUrl } from './config/urls';

// Use in your code
const frontendUrl = getFrontendUrl();
const serverUrl = getServerUrl();
const apiUrl = getApiBaseUrl();
```

---

## 🚀 Deployment Scenarios

### Scenario 1: New Domain

**Before:**
- Frontend: `http://crm.blackfostercarersalliance.co.uk`
- Backend: `http://backendcrm.blackfostercarersalliance.co.uk`

**After:**
- Frontend: `http://newdomain.com`
- Backend: `http://api.newdomain.com`

**Steps:**
1. Edit `server/config/urls.js` - Update production URLs
2. Edit `client/src/config/urls.js` - Update production URLs
3. Rebuild frontend: `npm run build`
4. Restart backend: `npm start`

✅ **Done!** All URLs updated across entire application.

### Scenario 2: Adding HTTPS

**Change:**
- `http://` → `https://`

**Steps:**
1. Edit both config files and replace `http://` with `https://`
2. Rebuild and restart

### Scenario 3: Different Ports

**Change:**
- Backend port from `5000` to `8080`

**Steps:**
1. Edit `server/config/urls.js` - Update `localhost:5000` to `localhost:8080`
2. Edit `client/src/config/urls.js` - Update `localhost:5000` to `localhost:8080`
3. Update `server/server.js` - Change `const port = 5000` to `const port = 8080`

---

## 🔍 Verification

After changing URLs, verify the configuration:

### Check Backend URLs:
```bash
cd server
npm start
```

Look for this output:
```
📍 URL Configuration Loaded:
   Environment: production
   Frontend URL: http://crm.blackfostercarersalliance.co.uk
   Server URL: http://backendcrm.blackfostercarersalliance.co.uk
   API Base URL: http://backendcrm.blackfostercarersalliance.co.uk/api
```

### Check Frontend URLs:
Open browser console at your frontend URL and look for:
```
📍 URL Configuration Loaded:
   Environment: production
   Frontend URL: http://crm.blackfostercarersalliance.co.uk
   Server URL: http://backendcrm.blackfostercarersalliance.co.uk
   API Base URL: http://backendcrm.blackfostercarersalliance.co.uk/api
```

---

## ⚠️ Important Notes

### 1. Environment Variables Take Priority
If you set URLs in `.env` files, they will override the URLs in the config files.

**Priority Order:**
1. `.env` file variables (highest priority)
2. Config file URLs
3. Default localhost URLs (lowest priority)

### 2. Rebuild After Changes
- **Frontend:** Always run `npm run build` after changing URLs
- **Backend:** Restart the server with `npm start`

### 3. CORS Configuration
The backend automatically allows:
- Development URLs (`localhost:5173`, `localhost:3000`)
- Production URL from config
- Both HTTP and HTTPS versions of production URL

### 4. Don't Mix Approaches
Choose one method:
- Either use config files (recommended)
- Or use environment variables
- Don't mix both to avoid confusion

---

## 🆘 Troubleshooting

### Issue: "Cannot connect to API"
**Solution:**
1. Check browser console for the API URL being used
2. Verify backend is running on that URL
3. Check CORS errors in browser console

### Issue: "URLs not updating"
**Solution:**
1. Clear browser cache
2. Rebuild frontend: `cd client && npm run build`
3. Restart backend: `cd server && npm start`
4. Hard refresh browser (Ctrl+Shift+R)

### Issue: "Email links pointing to wrong URL"
**Solution:**
1. Check `server/config/urls.js` is properly configured
2. Restart the backend server
3. Check environment variables: `echo $FRONTEND_URL`

---

## 📝 Quick Reference

### Current Production URLs:
- **Frontend:** `http://crm.blackfostercarersalliance.co.uk`
- **Backend:** `http://backendcrm.blackfostercarersalliance.co.uk`
- **API:** `http://backendcrm.blackfostercarersalliance.co.uk/api`

### Development URLs:
- **Frontend:** `http://localhost:5173`
- **Backend:** `http://localhost:5000`
- **API:** `http://localhost:5000/api`

### Configuration Files:
- **Server Config:** `server/config/urls.js`
- **Client Config:** `client/src/config/urls.js`
- **API Config:** `client/src/config/api.js` (imports from urls.js)
- **Vite Config:** `client/vite.config.js`

---

## 🎉 Summary

**To change URLs for the entire CRM application:**

1. Edit `server/config/urls.js` (2 places)
2. Edit `client/src/config/urls.js` (2 places)
3. Rebuild frontend and restart backend
4. Done! ✅

**Total files to edit: 2**
**Total lines to change: ~4**
**Time required: < 2 minutes**

This centralized approach saves you from updating URLs in 15+ different files!




