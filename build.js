const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

// Ensure clean public directory
if (fs.existsSync(publicDir)) {
  fs.rmSync(publicDir, { recursive: true, force: true });
}
fs.mkdirSync(publicDir, { recursive: true });

// Files and directories to copy
const itemsToCopy = [
  'index.html',
  'styles.css',
  'app.js',
  'assets',
  'home video'
];

itemsToCopy.forEach(item => {
  const src = path.join(__dirname, item);
  const dest = path.join(publicDir, item);

  if (fs.existsSync(src)) {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
      fs.cpSync(src, dest, { recursive: true });
    } else {
      fs.copyFileSync(src, dest);
    }
  }
});

console.log('Build completed successfully: Output directory "public" populated.');
