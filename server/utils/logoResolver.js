/**
 * Centralized Logo Resolver for Production
 * 
 * This utility ensures logos are accessible across all controllers
 * (contracts, invoices, certificates, emails) in both development and production.
 * 
 * Priority order:
 * 1. Environment variable LOGO_PATH (for production overrides)
 * 2. server/uploads/logo-bg.png (production deployment location)
 * 3. client/public/logo-bg.png (fallback if client is deployed alongside server)
 * 4. Environment variable LOGO_URL (for remote hosted logos)
 */

const path = require('path');
const fs = require('fs');

/**
 * Get the absolute path to logo-bg.png
 * @returns {string|null} Absolute path to logo file or null if not found
 */
function getLogoBgPath() {
  // Priority 1: Environment variable (explicit override)
  if (process.env.LOGO_BG_PATH) {
    if (fs.existsSync(process.env.LOGO_BG_PATH)) {
      return process.env.LOGO_BG_PATH;
    }
  }

  // Priority 2: server/uploads/logo-bg.png (production location)
  const uploadsPath = path.join(__dirname, '../uploads/logo-bg.png');
  if (fs.existsSync(uploadsPath)) {
    return uploadsPath;
  }

  // Try uppercase variant
  const uploadsPathUpper = path.join(__dirname, '../uploads/logo-bg.PNG');
  if (fs.existsSync(uploadsPathUpper)) {
    return uploadsPathUpper;
  }

  // Priority 3: client/public/logo-bg.png (fallback)
  const clientPublicPath = path.join(__dirname, '../../client/public/logo-bg.png');
  if (fs.existsSync(clientPublicPath)) {
    return clientPublicPath;
  }

  // Try uppercase variant
  const clientPublicPathUpper = path.join(__dirname, '../../client/public/logo-bg.PNG');
  if (fs.existsSync(clientPublicPathUpper)) {
    return clientPublicPathUpper;
  }

  return null;
}

/**
 * Get the absolute path to logo-white.png
 * @returns {string|null} Absolute path to logo file or null if not found
 */
function getLogoWhitePath() {
  // Priority 1: Environment variable
  if (process.env.LOGO_WHITE_PATH) {
    if (fs.existsSync(process.env.LOGO_WHITE_PATH)) {
      return process.env.LOGO_WHITE_PATH;
    }
  }

  // Priority 2: server/uploads/logo-white.png
  const uploadsPath = path.join(__dirname, '../uploads/logo-white.png');
  if (fs.existsSync(uploadsPath)) {
    return uploadsPath;
  }

  // Try uppercase variant
  const uploadsPathUpper = path.join(__dirname, '../uploads/logo-white.PNG');
  if (fs.existsSync(uploadsPathUpper)) {
    return uploadsPathUpper;
  }

  // Priority 3: client/public/logo-white.png
  const clientPublicPath = path.join(__dirname, '../../client/public/logo-white.png');
  if (fs.existsSync(clientPublicPath)) {
    return clientPublicPath;
  }

  // Try uppercase variant
  const clientPublicPathUpper = path.join(__dirname, '../../client/public/logo-white.PNG');
  if (fs.existsSync(clientPublicPathUpper)) {
    return clientPublicPathUpper;
  }

  return null;
}

/**
 * Get logo paths array (for backward compatibility with existing code)
 * Returns array of possible paths in priority order
 * @param {string} logoType - 'bg' or 'white'
 * @returns {string[]} Array of possible logo paths
 */
function getLogoPaths(logoType = 'bg') {
  const logoName = logoType === 'white' ? 'logo-white' : 'logo-bg';
  const paths = [];

  // Environment variable override
  if (process.env[`LOGO_${logoType.toUpperCase()}_PATH`]) {
    paths.push(process.env[`LOGO_${logoType.toUpperCase()}_PATH`]);
  }

  // server/uploads (production location)
  paths.push(
    path.join(__dirname, `../uploads/${logoName}.png`),
    path.join(__dirname, `../uploads/${logoName}.PNG`)
  );

  // client/public (fallback)
  paths.push(
    path.join(__dirname, `../../client/public/${logoName}.png`),
    path.join(__dirname, `../../client/public/${logoName}.PNG`)
  );

  return paths;
}

/**
 * Ensure logo files exist in server/uploads by copying from client/public if needed
 * This should be called during server startup or deployment
 */
function ensureLogosInUploads() {
  const uploadsDir = path.join(__dirname, '../uploads');
  
  // Ensure uploads directory exists
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const logosToCopy = [
    { from: 'logo-bg.png', to: 'logo-bg.png' },
    { from: 'logo-white.png', to: 'logo-white.png' },
    { from: 'logo.png', to: 'logo.png' }
  ];

  logosToCopy.forEach(({ from, to }) => {
    const sourcePath = path.join(__dirname, '../../client/public', from);
    const destPath = path.join(uploadsDir, to);

    // Only copy if source exists and destination doesn't
    if (fs.existsSync(sourcePath) && !fs.existsSync(destPath)) {
      try {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`✅ Copied ${from} to server/uploads/`);
      } catch (error) {
        console.warn(`⚠️  Failed to copy ${from}:`, error.message);
      }
    }
  });
}

module.exports = {
  getLogoBgPath,
  getLogoWhitePath,
  getLogoPaths,
  ensureLogosInUploads
};

