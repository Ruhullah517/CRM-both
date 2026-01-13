const path = require('path');
const fs = require('fs');

const LOGO_FILE_NAME = 'logo-white.png';
// Prefer server/uploads first (since that's where the user placed the logo), then client/public
const DEFAULT_LOGO_PATHS = [
  path.join(__dirname, '..', 'uploads', LOGO_FILE_NAME),
  path.join(__dirname, '..', '..', 'client', 'public', LOGO_FILE_NAME),
];

/**
 * Resolve the logo attachment for emails.
 * - Prefer explicit env override: MAIL_LOGO_PATH/LOGO_PATH or MAIL_LOGO_URL/LOGO_URL
 * - Fallback to the old client/public location when it exists
 * - Return null if nothing is reachable so email sending does not crash
 */
function getLogoAttachment(cid = 'company-logo') {
  const envFilePath = process.env.MAIL_LOGO_PATH || process.env.LOGO_PATH;
  const envUrlPath = process.env.MAIL_LOGO_URL || process.env.LOGO_URL;
  const candidates = [
    envFilePath,
    envUrlPath,
    ...DEFAULT_LOGO_PATHS,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;

    // Allow remote URL for hosted assets
    if (candidate.startsWith('http://') || candidate.startsWith('https://')) {
      return { filename: LOGO_FILE_NAME, path: candidate, cid };
    }

    // Local file path fallback
    if (fs.existsSync(candidate)) {
      return { filename: LOGO_FILE_NAME, path: candidate, cid };
    }
  }

  console.warn('Logo attachment not found; skipping. Checked:', candidates.filter(Boolean));
  return null;
}

module.exports = { getLogoAttachment };

