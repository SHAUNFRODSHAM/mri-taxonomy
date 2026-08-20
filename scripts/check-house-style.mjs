/* ═══════════════════════════════════════════════════════════════════════════
   check-house-style.mjs — guards the single source of truth.

   The Word export, the Generate Preview pane and the PDF export must all render
   the Open Box house style identically. They do that by deriving everything from
   SPEC in src/components/obDocStyle.js:

     SPEC ──┬─→ documentStyles / numberingConfig ──→ .docx
            └─→ houseStyleCSS()                  ──→ preview + PDF

   This script fails if that wiring is broken — i.e. if someone hardcodes a font,
   size or brand colour in the docx generator or the preview/PDF markup instead
   of taking it from SPEC. It is a static check: no browser or Word needed.

     node scripts/check-house-style.mjs
   ═══════════════════════════════════════════════════════════════════════════ */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');

const STYLE  = read('src/components/obDocStyle.js');
const DOCX   = read('src/components/docxExport.js');
const MODAL  = read('src/components/genModal.js');
const CSS    = read('src/styles/main.css');

let pass = 0, fail = 0;
const check = (name, ok, detail = '') => {
  ok ? pass++ : fail++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${ok || !detail ? '' : `\n          ${detail}`}`);
};

// ── 1. SPEC is the single source of truth ─────────────────────────────────────
console.log('\n1. SPEC is canonical');
check('obDocStyle.js exports SPEC',          /export const SPEC\s*=/.test(STYLE));
check('obDocStyle.js exports houseStyleCSS', /export function houseStyleCSS/.test(STYLE));
check('documentStyles derives from SPEC',    /SPEC\.(body|h1)/.test(STYLE));
check('houseStyleCSS derives from SPEC',     /const S = SPEC/.test(STYLE));

// ── 2. Both docx generators share one shell ───────────────────────────────────
console.log('\n2. One branded shell for both views');
check('buildBrandedDocument() exists',       /function buildBrandedDocument/.test(DOCX));
const shellUses = (DOCX.match(/buildBrandedDocument\(/g) || []).length;
// 1 definition + 2 call sites (system + business)
check('both generators call it', shellUses >= 3, `found ${shellUses} references, expected >= 3`);
check('system generator exported',   /export async function generateDocx/.test(DOCX));
check('business generator exported', /export async function generateBusinessDocx/.test(DOCX));
// only ONE place may construct the Document / headers / footers
check('single Document construction', (DOCX.match(/new Document\(/g) || []).length === 1);
check('single Footer construction',   (DOCX.match(/new Footer\(/g) || []).length === 1);

// ── 3. Preview + PDF use the generated CSS ────────────────────────────────────
console.log('\n3. Preview and PDF use houseStyleCSS()');
check('genModal imports houseStyleCSS', /import \{ houseStyleCSS \}/.test(MODAL));
check('preview injects it',   /houseStyleCSS\('#doc-out'\)/.test(MODAL));
check('PDF injects it',       /houseStyleCSS\("\.doc-out", \{ print: true \}\)/.test(MODAL));
check('main.css has no .doc-out element rules',
  !/\.doc-out\s+(h[1-6]|p|ul|li|table|th|td)\b/.test(CSS),
  'element-level rules there bleed into the preview and break the match');

// ── 4. No hardcoded typography outside obDocStyle.js ──────────────────────────
console.log('\n4. No hardcoded typography outside obDocStyle.js');

/* Brand colours must come from OB/SPEC. We allow them inside obDocStyle.js and
   in the PDF's print-bar chrome (which is app UI, not document content). */
const brandHex = /#?(BCD727|6E7878|373C3C)/gi;

const docxHits = [...DOCX.matchAll(brandHex)];
check('docxExport.js hardcodes no brand colours', docxHits.length === 0,
  docxHits.length ? `found: ${[...new Set(docxHits.map(m => m[0]))].join(', ')}` : '');

const fontHits = [...DOCX.matchAll(/['"](Verdana|Calibri|Arial|Segoe UI)['"]/g)];
check('docxExport.js hardcodes no font names', fontHits.length === 0,
  fontHits.length ? `found: ${[...new Set(fontHits.map(m => m[0]))].join(', ')}` : '');

/* Point sizes: hp(n)/tw(n) calls in docxExport are suspicious unless they are
   spacing-only. Font sizes must come from SPEC, so flag hp() with a literal
   that is not derived from SPEC. Cover/heading sizes are the usual offenders. */
const hpLiterals = [...DOCX.matchAll(/hp\((\d+(?:\.\d+)?)\)/g)].map(m => m[1]);
check('docxExport.js takes font sizes from SPEC, not hp() literals',
  hpLiterals.length === 0,
  hpLiterals.length ? `hardcoded hp() sizes: ${[...new Set(hpLiterals)].join(', ')}` : '');

// The old MSO-HTML export must be gone — it was the source of the mismatch
check('no MSO-HTML Word export remains',
  !/urn:schemas-microsoft-com:office/.test(MODAL),
  'the legacy .doc path produces unbranded output');
check('Word downloads are .docx',
  !/\.download = `[^`]*\.doc`/.test(MODAL));

// ── 5. Preview blocks mirror the docx blocks ──────────────────────────────────
console.log('\n5. Preview blocks mirror the document blocks');
for (const [label, docxFn, htmlCls] of [
  ['captions',   'caption(',   'ob-caption'],
  ['field lines', 'fieldLine(', 'ob-field'],
  ['sub-labels', 'subLabel(',  'ob-label'],
]) {
  check(`${label} exist in both`, DOCX.includes(docxFn) && MODAL.includes(htmlCls));
}
check('both number captions "Table N:"',
  /Table \$\{nextTableNo\(\)\}/.test(DOCX) && /Table \$\{\+\+n\}/.test(MODAL));
check('preview cover block matches docx cover',
  /ob-title/.test(MODAL) && /OBDocumentTitle/.test(DOCX));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
