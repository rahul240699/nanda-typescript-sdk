#!/usr/bin/env node
//
// Prepend a shebang to dist/index.js if it's not already there.
//
import { readFileSync, writeFileSync, existsSync } from 'fs';
const file = './dist/index.js';
const shebang = '#!/usr/bin/env node\n';

if (!existsSync(file)) {
  console.error(`Error: ${file} not found. Run tsc first.`);
  process.exit(1);
}

let content = readFileSync(file, 'utf8');
if (!content.startsWith(shebang)) {
  writeFileSync(file, shebang + content, 'utf8');
}