// tools/dump_data.js
// Dumps ALL_DATA to tools/data_dump.json for use by export/import scripts.
// Run from the project root: node tools/dump_data.js

import { ALL_DATA } from '../src/data/index.js';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, 'data_dump.json');

writeFileSync(outPath, JSON.stringify(ALL_DATA, null, 2), 'utf8');
console.log(`Written: ${outPath}`);
