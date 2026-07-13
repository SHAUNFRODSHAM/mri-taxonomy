// tools/export_to_xlsx.js
// Exports all module data to MRI_Taxonomy_Content.xlsx in the project root.
// Run from the project root: node tools/export_to_xlsx.js

import ExcelJS from 'exceljs';
import { ALL_DATA, MODULE_CONFIG } from '../src/data/index.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, '..', 'MRI_Taxonomy_Content.xlsx');

const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1a3a5c' } };
const COL_ROW_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } };
const SUB_ROW_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F8FF' } };
const WHITE_FILL   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };

const COL_WIDTHS = [12, 25, 25, 35, 50, 45, 35, 45, 45, 45];
const HEADERS = [
  'Item Type', 'Column Title', 'Item ID', 'Title',
  'Description', 'Activities',
  'MRI Title', 'MRI Prerequisites',
  'MRI Associated Screens - Names', 'MRI Associated Screens - Descriptions',
];

function numbered(arr) {
  if (!arr || arr.length === 0) return '';
  return arr.map((v, i) => `${i + 1}. ${v}`).join('\n');
}

function numberedAssocNames(arr) {
  if (!arr || arr.length === 0) return '';
  return arr.map((v, i) => `${i + 1}. ${v.name || ''}`).join('\n');
}

function numberedAssocDescs(arr) {
  if (!arr || arr.length === 0) return '';
  return arr.map((v, i) => `${i + 1}. ${v.desc || ''}`).join('\n');
}

function baseFont(bold = false) {
  return { name: 'Arial', size: 10, bold };
}

function applyDataCell(cell, value, fill, bold = false) {
  cell.value = value ?? '';
  cell.font = baseFont(bold);
  cell.fill = fill;
  cell.alignment = { wrapText: true, vertical: 'top' };
  cell.border = {
    bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
  };
}

function writeSheet(workbook, moduleKey, columns) {
  const config = MODULE_CONFIG[moduleKey] || {};
  const sheetName = (config.label || moduleKey).substring(0, 31); // Excel 31-char limit
  const ws = workbook.addWorksheet(sheetName);

  // Column widths
  ws.columns = HEADERS.map((h, i) => ({ width: COL_WIDTHS[i] }));

  // Header row
  const headerRow = ws.addRow(HEADERS);
  headerRow.height = 20;
  headerRow.eachCell((cell) => {
    cell.value = typeof cell.value === 'string' ? cell.value : HEADERS[cell.col - 1];
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = HEADER_FILL;
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: false };
  });

  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 10 } };
  ws.views = [{ state: 'frozen', ySplit: 1 }];

  let rowCount = 0;

  for (const col of columns) {
    // Column header row — merged across A-J
    const colRow = ws.addRow([col.title, '', '', '', '', '', '', '', '', '']);
    ws.mergeCells(colRow.number, 1, colRow.number, 10);
    const colCell = colRow.getCell(1);
    colCell.value = col.title;
    colCell.font = baseFont(true);
    colCell.fill = COL_ROW_FILL;
    colCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: false };
    colCell.border = { bottom: { style: 'thin', color: { argb: 'FFAAAAAA' } } };
    colRow.height = 18;
    rowCount++;

    for (const proc of (col.processes || [])) {
      // Process row
      const pValues = [
        'Process',
        col.title,
        proc.id || '',
        proc.title || '',
        proc.desc || '',
        numbered(proc.activities),
        proc.mri_title || '',
        numbered(proc.mri_prereqs),
        numberedAssocNames(proc.mri_assoc),
        numberedAssocDescs(proc.mri_assoc),
      ];
      const pRow = ws.addRow(pValues);
      pRow.eachCell((cell) => applyDataCell(cell, cell.value, WHITE_FILL));
      rowCount++;

      for (const sub of (proc.subs || [])) {
        const sValues = [
          'Sub',
          col.title,
          sub.id || '',
          '    ' + (sub.title || ''),  // indent
          sub.desc || '',
          numbered(sub.activities),
          sub.mri_title || '',
          numbered(sub.mri_prereqs),
          numberedAssocNames(sub.mri_assoc),
          numberedAssocDescs(sub.mri_assoc),
        ];
        const sRow = ws.addRow(sValues);
        sRow.eachCell((cell) => applyDataCell(cell, cell.value, SUB_ROW_FILL));
        rowCount++;
      }
    }
  }

  console.log(`  ${sheetName}: ${rowCount} data rows`);
  return rowCount;
}

async function main() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'MRI Taxonomy Export';
  workbook.created = new Date();

  const modules = Object.keys(ALL_DATA);
  let totalRows = 0;

  for (const key of modules) {
    const columns = ALL_DATA[key];
    if (!Array.isArray(columns)) continue;
    const count = writeSheet(workbook, key, columns);
    totalRows += count;
  }

  await workbook.xlsx.writeFile(outPath);
  console.log(`\nExcel file written: ${outPath}`);
  console.log(`Total data rows (excl. header): ${totalRows}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
