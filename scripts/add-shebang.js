#!/usr/bin/env node
// Postbuild script to ensure dist/index.js begins with the correct shebang
const fs = require('fs');
const file = './dist/index.js';
const shebang = '#!/usr/bin/env node\n';

try {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.startsWith(shebang)) {
    fs.writeFileSync(file, shebang + content, 'utf8');
  }
} catch (err) {
  console.error(`Error prepending shebang to ${file}:`, err);
  process.exit(1);
}