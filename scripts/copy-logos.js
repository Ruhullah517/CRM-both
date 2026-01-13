/**
 * Deployment Script: Copy Logos to Production
 * 
 * This script ensures logo files are copied from client/public to server/uploads
 * before deployment. Run this before deploying to production.
 * 
 * Usage:
 *   node scripts/copy-logos.js
 */

const fs = require('fs');
const path = require('path');

const logosToCopy = [
  'logo-bg.png',
  'logo-white.png',
  'logo.png'
];

const clientPublicDir = path.join(__dirname, '../client/public');
const serverUploadsDir = path.join(__dirname, '../server/uploads');

console.log('📋 Copying logo files for production deployment...\n');

// Ensure server/uploads directory exists
if (!fs.existsSync(serverUploadsDir)) {
  fs.mkdirSync(serverUploadsDir, { recursive: true });
  console.log('✅ Created server/uploads directory');
}

let copiedCount = 0;
let skippedCount = 0;

logosToCopy.forEach(logoFile => {
  const sourcePath = path.join(clientPublicDir, logoFile);
  const destPath = path.join(serverUploadsDir, logoFile);

  if (fs.existsSync(sourcePath)) {
    try {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✅ Copied ${logoFile}`);
      copiedCount++;
    } catch (error) {
      console.error(`❌ Failed to copy ${logoFile}:`, error.message);
    }
  } else {
    console.log(`⚠️  Source file not found: ${logoFile}`);
    skippedCount++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Copied: ${copiedCount} files`);
console.log(`   ⚠️  Skipped: ${skippedCount} files`);
console.log(`\n✨ Logo files are ready for production deployment!`);

