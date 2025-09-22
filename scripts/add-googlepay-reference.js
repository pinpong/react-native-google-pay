import fs from 'fs';
import path from 'path';

const file = path.join('lib', 'typescript', 'src', 'index.d.ts');
const content = fs.readFileSync(file, 'utf8');

if (!content.startsWith('/// <reference types="googlepay" />')) {
  fs.writeFileSync(file, `/// <reference types="googlepay" />\n${content}`);
  console.log('✅ Added googlepay type reference to index.d.ts');
}