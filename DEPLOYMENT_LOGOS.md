# 🎨 Logo Deployment Guide

## Problem
Logo files are not showing in production for:
- Contracts
- Invoices  
- Certificates
- Emails

This happens because the `server/uploads/` folder is in `.gitignore`, so logo files aren't deployed via git.

## ✅ Solution Implemented

### Automatic Logo Copying
The server **automatically copies logos** from `client/public/` to `server/uploads/` on startup. This ensures logos are always available in production.

**How it works:**
1. On server startup, `ensureLogosInUploads()` runs automatically
2. It checks if logos exist in `server/uploads/`
3. If not found, it copies them from `client/public/`
4. Logs are printed showing which logos were copied

### Manual Copy Script (Optional)
If you want to copy logos before deployment, you can run:

```bash
node scripts/copy-logos.js
```

This will copy:
- `logo-bg.png` → `server/uploads/logo-bg.png`
- `logo-white.png` → `server/uploads/logo-white.png`
- `logo.png` → `server/uploads/logo.png`

## 📋 Deployment Checklist

### Before Deploying:
1. ✅ Ensure logo files exist in `client/public/`:
   - `logo-bg.png` (for contracts, invoices)
   - `logo-white.png` (for emails)
   - `logo.png` (fallback)

2. ✅ Deploy your code (logos will be auto-copied on first server start)

### After Deploying:
1. ✅ Check server logs on startup - you should see:
   ```
   ✅ Copied logo-bg.png to server/uploads/
   ✅ Copied logo-white.png to server/uploads/
   ```

2. ✅ Verify logos are accessible:
   - Generate a test contract
   - Generate a test invoice
   - Send a test email

## 🔧 Environment Variables (Advanced)

If you need to override logo paths in production, you can set:

```bash
# In your .env file or production environment
LOGO_BG_PATH=/absolute/path/to/logo-bg.png
LOGO_WHITE_PATH=/absolute/path/to/logo-white.png
```

Or use remote URLs:
```bash
LOGO_URL=https://yourdomain.com/logo-white.png
MAIL_LOGO_URL=https://yourdomain.com/logo-white.png
```

## 📁 Logo Priority Order

The system checks logos in this order:

1. **Environment variables** (`LOGO_BG_PATH`, `LOGO_WHITE_PATH`)
2. **`server/uploads/logo-bg.png`** (production location)
3. **`client/public/logo-bg.png`** (fallback)

## 🐛 Troubleshooting

### Logos still not showing?

1. **Check server logs** on startup:
   ```bash
   # Look for logo copy messages
   ✅ Copied logo-bg.png to server/uploads/
   ```

2. **Verify files exist** on production server:
   ```bash
   ls -la /path/to/server/uploads/logo-bg.png
   ls -la /path/to/server/uploads/logo-white.png
   ```

3. **Check file permissions**:
   ```bash
   chmod 644 /path/to/server/uploads/logo-*.png
   ```

4. **Check server logs** when generating contracts/invoices:
   ```
   Logo loaded from: /path/to/logo-bg.png
   ```

5. **Manual copy** if auto-copy didn't work:
   ```bash
   # On production server
   cp /path/to/client/public/logo-*.png /path/to/server/uploads/
   ```

## 📝 Files Modified

- ✅ `server/utils/logoResolver.js` - New centralized logo utility
- ✅ `server/server.js` - Auto-copy logos on startup
- ✅ `server/controllers/contractController.js` - Uses centralized utility
- ✅ `server/controllers/invoiceController.js` - Uses centralized utility
- ✅ `scripts/copy-logos.js` - Manual copy script (optional)

## ✨ Benefits

1. **Automatic** - No manual steps needed
2. **Consistent** - All controllers use the same logo resolution logic
3. **Flexible** - Environment variables for custom paths
4. **Production-ready** - Works in both dev and production

---

**Note:** The automatic copying happens on every server startup, so even if logos are deleted, they'll be restored on the next restart (as long as they exist in `client/public/`).

