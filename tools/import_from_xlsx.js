// tools/import_from_xlsx.js
// Reads MRI_Taxonomy_Content.xlsx and writes updated JS data files back to src/data/*.js
// Run from the project root: node tools/import_from_xlsx.js
//
// The script:
//  - Reads each sheet (one per module)
//  - Skips the header row and merged column-title rows (Item Type = '')
//  - Groups Process and Sub rows under their parent column
//  - Reconstructs arrays from numbered multi-line fields
//  - Writes src/data/{moduleKey}.js with the correct export const name

import ExcelJS from 'exceljs';
import { MODULE_CONFIG } from '../src/data/index.js';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const inPath  = join(__dirname, '..', 'MRI_Taxonomy_Content.xlsx');
const dataDir = join(__dirname, '..', 'src', 'data');

// Map sheet name → module key
const sheetToKey = {};
for (const [key, cfg] of Object.entries(MODULE_CONFIG)) {
  const sheetName = (cfg.label || key).substring(0, 31);
  sheetToKey[sheetName] = key;
}

/** Parse a numbered multiline string back to an array: "1. foo\n2. bar" → ['foo','bar'] */
function parseNumbered(str) {
  if (!str || !str.trim()) return [];
  return str
    .split('\n')
    .map(line => line.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean);
}

/** Reconstruct mri_assoc from parallel name/desc arrays */
function parseAssoc(namesStr, descsStr) {
  const names = parseNumbered(namesStr);
  const descs = parseNumbered(descsStr);
  const len = Math.max(names.length, descs.length);
  const result = [];
  for (let i = 0; i < len; i++) {
    result.push({ name: names[i] || '', desc: descs[i] || '' });
  }
  return result;
}

function cellText(row, colIndex) {
  const cell = row.getCell(colIndex);
  const v = cell.value;
  if (v === null || v === undefined) return '';
  if (typeof v === 'object' && v.richText) {
    return v.richText.map(r => r.text).join('');
  }
  return String(v);
}

/** Serialise JS data array to a JS module string */
function toJsModule(exportName, data) {
  const json = JSON.stringify(data, null, 2);
  // Convert JSON to JS: remove quotes from keys that don't need them
  const js = json
    .replace(/"([a-zA-Z_][a-zA-Z0-9_]*)"\s*:/g, '$1:')   // unquote simple keys
    .replace(/"/g, "'");                                    // single quotes for strings
  return `export const ${exportName} = ${js};\n`;
}

async function main() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(inPath);

  let totalSheets = 0;

  for (const worksheet of workbook.worksheets) {
    const sheetName = worksheet.name;
    const moduleKey = sheetToKey[sheetName];

    if (!moduleKey) {
      console.warn(`  Skipping unknown sheet: "${sheetName}"`);
      continue;
    }

    const columns = [];
    let currentColumn = null;
    let currentProcess = null;
    let rowsRead = 0;

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header

      const itemType   = cellText(row, 1).trim();
      const colTitle   = cellText(row, 2).trim();
      const itemId     = cellText(row, 3).trim();
      const title      = cellText(row, 4).trim().replace(/^\s+/, ''); // strip indent
      const desc       = cellText(row, 5).trim();
      const activities = parseNumbered(cellText(row, 6));
      const mriTitle   = cellText(row, 7).trim();
      const mriPrereqs = parseNumbered(cellText(row, 8));
      const mriAssoc   = parseAssoc(cellText(row, 9), cellText(row, 10));

      // Column header rows have itemType = '' (merged cell) or 'Column'
      if (!itemType || itemType === 'Column') {
        // Use colTitle from col 2, or from the merged cell value in col 1 if col 2 empty
        const resolvedTitle = colTitle || cellText(row, 1).trim();
        if (resolvedTitle) {
          currentColumn = { id: itemId || '', title: resolvedTitle, processes: [] };
          columns.push(currentColumn);
          currentProcess = null;
        }
        return;
      }

      // Ensure we have a column (safety fallback)
      if (!currentColumn) {
        currentColumn = { id: '', title: colTitle || 'Unknown', processes: [] };
        columns.push(currentColumn);
      }

      if (itemType === 'Process') {
        currentProcess = {
          id: itemId,
          title,
          type: 'process',
          desc,
          activities,
          mri_title: mriTitle,
          mri_prereqs: mriPrereqs,
          mri_assoc: mriAssoc,
          subs: [],
        };
        currentColumn.processes.push(currentProcess);
        rowsRead++;
      } else if (itemType === 'Sub') {
        if (!currentProcess) {
          console.warn(`  Row ${rowNumber}: Sub without parent process — skipping`);
          return;
        }
        currentProcess.subs.push({
          id: itemId,
          title,
          desc,
          activities,
          mri_title: mriTitle,
          mri_prereqs: mriPrereqs,
          mri_assoc: mriAssoc,
        });
        rowsRead++;
      }
    });

    // Strip empty subs arrays for cleanliness
    for (const col of columns) {
      for (const proc of col.processes) {
        if (proc.subs && proc.subs.length === 0) delete proc.subs;
      }
    }

    const outFile = join(dataDir, `${moduleKey}.js`);
    const jsContent = toJsModule(moduleKey, columns);
    writeFileSync(outFile, jsContent, 'utf8');
    console.log(`  ${sheetName} → src/data/${moduleKey}.js (${rowsRead} process/sub rows)`);
    totalSheets++;
  }

  console.log(`\nDone. Updated ${totalSheets} module file(s).`);
}

main().catch((err) => { console.error(err); process.exit(1); });
