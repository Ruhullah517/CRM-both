/**
 * Deployment Script: Copy Logos to Production (Server-only context)
 *
 * This script copies logo files from the client/public folder into
 * server/uploads. It is located inside the server folder so it will
 * be included when you upload only the backend.
 *
 * Usage (run from project root or from server folder):
 *   From project root:  node server/scripts/copy-logos.js
 *   From server folder: node scripts/copy-logos.js
 */

const fs = require('fs');
const path = require('path');

const logosToCopy = ['logo-bg.png', 'logo-white.png', 'logo.png'];

// When run from within server/, client is one level up
const clientPublicDir = path.join(__dirname, '../../client/public');
const serverUploadsDir = path.join(__dirname, '../uploads');

console.log('📋 Copying logo files for production deployment...\n');

// Ensure server/uploads directory exists
if (!fs.existsSync(serverUploadsDir)) {
  fs.mkdirSync(serverUploadsDir, { recursive: true });
  console.log('✅ Created server/uploads directory');
}

let copiedCount = 0;
let skippedCount = 0;

logosToCopy.forEach((logoFile) => {
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

