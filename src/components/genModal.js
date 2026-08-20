import { state, ALL_DATA, MODULE_CONFIG, isModuleVisible } from '../state.js';
import { BUSINESS_DATA, BUSINESS_CONFIG, BUSINESS_MODULES, MARKETS } from '../data/business/index.js';
import { effectiveScope } from './grid.js';
import { linkedSystemIds, systemLinksFor, COVERAGE } from '../data/links.js';
import { generateDocx, generateBusinessDocx } from './docxExport.js';
import { houseStyleCSS } from './obDocStyle.js';
import { matchesCoverage, matchesVerticals } from './businessView.js';

/* Cover-page identity. The app has no document-level client/project field yet
   (only per-item clientNote), so these are the shared defaults used by the
   preview, the PDF and the .docx alike — change them in one place. */
const CLIENT_NAME  = 'Client Name';
const PROJECT_NAME = 'MRI ERP Implementation';

/* The preview pane is styled from the same SPEC as the .docx. Injected once,
   scoped to #doc-out, so it overrides the generic app styling in main.css. */
function ensurePreviewStyle() {
  if (document.getElementById('ob-preview-style')) return;
  const el = document.createElement('style');
  el.id = 'ob-preview-style';
  el.textContent = houseStyleCSS('#doc-out');
  document.head.appendChild(el);
}

// ── Escape helpers ─────────────────────────────────────────────────────────────
const eB = s => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const e  = s => eB(s);

let _previewReady = false;

// ── Module scope helpers ───────────────────────────────────────────────────────
function getDocTabs(scopeAll) {
  return scopeAll
    ? Object.keys(ALL_DATA).filter(isModuleVisible)
    : [state.currentTab];
}

function getScopeStr(scopeAll) {
  if (!scopeAll) return MODULE_CONFIG[state.currentTab]?.label || state.currentTab;
  const total   = Object.keys(ALL_DATA).length;
  const visible = Object.keys(ALL_DATA).filter(isModuleVisible).length;
  return visible === total ? 'All Modules' : `Visible Modules (${visible} of ${total})`;
}

export function openGenModal() {
  _previewReady = false;
  ensurePreviewStyle();
  document.getElementById('gen-overlay').classList.add('open');
  document.getElementById('doc-out').innerHTML =
    '<p style="color:#aaa;font-style:italic;font-size:0.8rem">Select your options above and click Generate to build your document.</p>';
}

export function closeGenModal() {
  document.getElementById('gen-overlay').classList.remove('open');
}

// ── Scope helpers ──────────────────────────────────────────────────────────────

function getScopeIncludes() {
  return {
    core:          document.getElementById('gscope-inc-core')?.checked   ?? true,
    custom:        document.getElementById('gscope-inc-custom')?.checked ?? true,
    'out-of-scope':document.getElementById('gscope-inc-oos')?.checked    ?? true,
    untagged:      document.getElementById('gscope-inc-untag')?.checked  ?? true,
  };
}

function effKey(item, parentProcess, linkedSet) {
  return effectiveScope(item, parentProcess, linkedSet).scope || null;
}

function scopeIncluded(item, includes, parentProcess, linkedSet) {
  const scope = effKey(item, parentProcess, linkedSet);
  if (!scope)                     return includes.untagged;
  if (scope === 'core')           return includes.core;
  if (scope === 'custom')         return includes.custom;
  if (scope === 'out-of-scope')   return includes['out-of-scope'];
  return true;
}

function tallyItem(item, counts, included, includes, parentProcess, linkedSet) {
  const key = effKey(item, parentProcess, linkedSet) || 'untagged';
  if (key in counts) counts[key]++;
  if (scopeIncluded(item, includes, parentProcess, linkedSet) && key in included) included[key]++;
}

// ── Shared preview building blocks ─────────────────────────────────────────────
/* These mirror docxExport.js block-for-block. The CSS that styles them comes
   from houseStyleCSS() in obDocStyle.js — the same SPEC that drives the .docx —
   so the preview, the PDF and the Word document stay identical by construction.
   If you add a block here, add the matching one in docxExport.js. */

/** Auto-numbered "Table N: …" caption. Sits ABOVE its table, as in Word. */
function makeCaptioner() {
  let n = 0;
  return text => `<p class="ob-caption">Table ${++n}: ${e(text)}</p>`;
}

const obField = (label, value) => `<p class="ob-field"><b>${e(label)}:</b> ${e(value)}</p>`;
const obLabel = text => `<p class="ob-label">${e(text)}</p>`;
const obBullets = items => `<ul>${items.map(i => `<li>${e(i)}</li>`).join('')}</ul>`;

/** Open Box table: green header row, slate borders, no banding. */
function obTableHTML(headers, rows) {
  const head = headers.map(h => `<th>${e(h)}</th>`).join('');
  const body = rows.map(r => {
    const cls = r.isTotal ? ' class="ob-total"' : '';
    return `<tr${cls}>${r.map(v => `<td>${e(String(v))}</td>`).join('')}</tr>`;
  }).join('');
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

/** The branded cover block, matching the .docx cover page. */
function obCoverHTML({ docTitle, versionName, dateStr, clientName, projectName }) {
  return `<p class="ob-title">${e(docTitle)}</p>
    <p class="ob-date">${e(versionName)} &nbsp;|&nbsp; ${e(dateStr)}</p>
    <p class="ob-client">${e(clientName)}</p>
    <p class="ob-project">${e(projectName)}</p>`;
}

// ── Scope summary table ────────────────────────────────────────────────────────
function buildScopeSummary(tabs, includes, caption, scopeStr, versionName, dateStr) {
  const counts  = { core: 0, custom: 0, 'out-of-scope': 0, untagged: 0 };
  const included = { core: 0, custom: 0, 'out-of-scope': 0, untagged: 0 };
  const linkedSet = linkedSystemIds();
  tabs.forEach(tab => {
    (ALL_DATA[tab] || []).forEach(col => {
      col.processes.forEach(proc => {
        tallyItem(proc, counts, included, includes, null, linkedSet);
        (proc.subs || []).forEach(sub => tallyItem(sub, counts, included, includes, proc, linkedSet));
      });
    });
  });
  const totalAll      = Object.values(counts).reduce((a, b) => a + b, 0);
  const totalIncluded = Object.values(included).reduce((a, b) => a + b, 0);

  const totalRow = ['Total', totalAll, totalIncluded];
  totalRow.isTotal = true;

  return `<h1>Scope Summary</h1>
    <p>This document covers ${e(scopeStr)}. The counts below reflect the
       "${e(versionName)}" version as at ${e(dateStr)}.</p>
    ${caption('Process count by scope classification')}
    ${obTableHTML(
      ['Scope classification', 'Total processes', 'Included here'],
      [
        ['Core',         counts.core,            included.core],
        ['Custom',       counts.custom,          included.custom],
        ['Out of scope', counts['out-of-scope'], included['out-of-scope']],
        ['Untagged',     counts.untagged,        included.untagged],
        totalRow,
      ],
    )}`;
}

// ── BUILD PREVIEW ──────────────────────────────────────────────────────────────

export function buildDoc() {
  if (state.viewMode === 'business') return buildBusinessPreview();

  const inclOverview    = document.getElementById('gopt-overview').checked;
  const inclActivities  = document.getElementById('gopt-activities').checked;
  const inclPrereqs     = document.getElementById('gopt-prereqs').checked;
  const inclAssoc       = document.getElementById('gopt-assoc').checked;
  const scopeAll        = document.getElementById('gscope-all').checked;
  const includes        = getScopeIncludes();
  const tabs            = getDocTabs(scopeAll);
  const dateStr         = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const scopeStr        = getScopeStr(scopeAll);
  const linkedSet       = linkedSystemIds();

  const versionName = state.activeVersionName || 'Original';
  const caption     = makeCaptioner();

  let html = obCoverHTML({
    docTitle: 'Process Summary', versionName, dateStr,
    clientName: CLIENT_NAME, projectName: PROJECT_NAME,
  });
  html += buildScopeSummary(tabs, includes, caption, scopeStr, versionName, dateStr);

  tabs.forEach(tab => {
    if (!ALL_DATA[tab]) return;
    const cfg = MODULE_CONFIG[tab];
    html += `<h1>${e(cfg?.label || tab)}</h1>`;

    ALL_DATA[tab].forEach(col => {
      const visible = col.processes.filter(p => scopeIncluded(p, includes, null, linkedSet));
      if (!visible.length) return;

      html += `<h2>${e(col.title)}</h2>`;

      visible.forEach(proc => {
        html += renderProcessPreview(proc, 'h3', caption, inclOverview, inclActivities, inclPrereqs, inclAssoc);

        (proc.subs || []).forEach(sub => {
          if (!scopeIncluded(sub, includes, proc, linkedSet)) return;
          html += renderProcessPreview(sub, 'h4', caption, inclOverview, inclActivities, inclPrereqs, inclAssoc);
        });
      });
    });
  });

  document.getElementById('doc-out').innerHTML = html;
  _previewReady = true;
}

/* Mirrors processBlock() in docxExport.js — same fields, same order, same
   labels, so the preview and the .docx read identically. */
function renderProcessPreview(item, tag, caption, overview, activities, prereqs, assoc) {
  let out = `<${tag}>${e(item.title)}</${tag}>`;

  if (item.mri_title)             out += obField('MRI module', item.mri_title);
  if (overview && item.desc)      out += `<p>${e(item.desc)}</p>`;

  if (activities && item.activities?.length) {
    out += obLabel('Core activities') + obBullets(item.activities);
  }
  if (prereqs && item.mri_prereqs?.length) {
    out += obLabel('MRI setup prerequisites') + obBullets(item.mri_prereqs);
  }
  if (assoc && item.mri_assoc?.length) {
    out += caption(`Associated MRI screens — ${item.title}`)
         + obTableHTML(['MRI screen', 'Purpose in this process'],
                       item.mri_assoc.map(a => [a.name, a.desc]));
  }
  if (item.clientNote) out += obField('Client note', item.clientNote);

  return out;
}

// ── Business view preview ──────────────────────────────────────────────────────

function businessDocTabs(scopeAll) {
  return scopeAll ? BUSINESS_MODULES : [state.businessTab];
}
function businessScopeStr(scopeAll) {
  if (!scopeAll) return BUSINESS_CONFIG[state.businessTab]?.label || state.businessTab;
  return 'All Business Modules';
}
function selectedMarketLabels() {
  return (state.markets || []).map(k => (MARKETS.find(m => m.key === k) || {}).label || k);
}

/* Mirrors streamBlock() in generateBusinessDocx(). */
function renderStreamPreview(item, tag, caption, overview, activities) {
  let out = `<${tag}>${e(item.title)}</${tag}>`;

  if (item.coverage)         out += obField('System coverage', COVERAGE[item.coverage]?.label || item.coverage);
  if (overview && item.desc) out += `<p>${e(item.desc)}</p>`;
  if (activities && item.activities?.length) {
    out += obLabel('Core activities') + obBullets(item.activities);
  }

  const links = systemLinksFor(item.id);
  if (links.length) {
    out += caption(`Supporting MRI PMX processes — ${item.title}`)
         + obTableHTML(['MRI PMX module', 'Supporting system process'],
             links.map(l => [l.moduleLabel, l.breadcrumb ? `${l.breadcrumb} › ${l.title}` : l.title]));
  }
  if (item.clientNote) out += obField('Client note', item.clientNote);

  return out;
}

function buildBusinessPreview() {
  const inclOverview   = document.getElementById('gopt-overview').checked;
  const inclActivities = document.getElementById('gopt-activities').checked;
  const scopeAll       = document.getElementById('gscope-all').checked;
  const dateStr        = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const marketLabel    = selectedMarketLabels().join(', ') || '—';
  const versionName    = state.activeVersionName || 'Original';
  const scopeStr       = businessScopeStr(scopeAll);
  const tabs           = businessDocTabs(scopeAll);
  const caption        = makeCaptioner();
  const itemFilter     = it => matchesCoverage(it) && matchesVerticals(it);

  // Coverage summary — same counts and table as generateBusinessDocx()
  const counts = { full: 0, partial: 0, outside: 0, untagged: 0 };
  let shown = 0, total = 0;
  tabs.forEach(tab => (BUSINESS_DATA[tab] || []).forEach(col => col.processes.forEach(proc => {
    [proc, ...(proc.subs || [])].forEach(it => {
      const k = it.coverage || 'untagged';
      if (k in counts) counts[k]++;
      total++;
      if (itemFilter(it)) shown++;
    });
  })));
  const totalRow = ['Total', total];
  totalRow.isTotal = true;

  let html = obCoverHTML({
    docTitle: 'Business Process Taxonomy', versionName, dateStr,
    clientName: CLIENT_NAME, projectName: PROJECT_NAME,
  });

  html += `<h1>Coverage Summary</h1>
    <p>This document covers ${e(scopeStr)}. Markets: ${e(marketLabel)}. The counts
       below reflect the "${e(versionName)}" version as at ${e(dateStr)};
       ${shown} of ${total} processes match the active filters.</p>
    ${caption('Process count by system-coverage classification')}
    ${obTableHTML(['Coverage classification', 'Processes'], [
      [COVERAGE.full?.label    || 'full',    counts.full],
      [COVERAGE.partial?.label || 'partial', counts.partial],
      [COVERAGE.outside?.label || 'outside', counts.outside],
      ['Untagged',                           counts.untagged],
      totalRow,
    ])}`;

  tabs.forEach(tab => {
    if (!BUSINESS_DATA[tab]) return;
    html += `<h1>${e(BUSINESS_CONFIG[tab]?.label || tab)}</h1>`;

    BUSINESS_DATA[tab].forEach(col => {
      const visible = col.processes.filter(p => itemFilter(p) || (p.subs || []).some(itemFilter));
      if (!visible.length) return;

      html += `<h2>${e(col.title)}</h2>`;
      visible.forEach(proc => {
        if (itemFilter(proc)) html += renderStreamPreview(proc, 'h3', caption, inclOverview, inclActivities);
        (proc.subs || []).forEach(sub => {
          if (itemFilter(sub)) html += renderStreamPreview(sub, 'h4', caption, inclOverview, inclActivities);
        });
      });
    });
  });

  document.getElementById('doc-out').innerHTML = html;
  _previewReady = true;
}

// ── DOWNLOAD WORD (System view) ────────────────────────────────────────────────

export async function downloadWord() {
  if (!_previewReady) {
    alert('Please click Generate Preview first, then Download Word.');
    return;
  }
  if (state.viewMode === 'business') return downloadBusinessWord();

  const inclOverview    = document.getElementById('gopt-overview').checked;
  const inclActivities  = document.getElementById('gopt-activities').checked;
  const inclPrereqs     = document.getElementById('gopt-prereqs').checked;
  const inclAssoc       = document.getElementById('gopt-assoc').checked;
  const scopeAll        = document.getElementById('gscope-all').checked;
  const includes        = getScopeIncludes();
  const tabs            = getDocTabs(scopeAll);
  const dateStr         = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const scopeStr        = getScopeStr(scopeAll);
  const linkedSet       = linkedSystemIds();
  const versionName     = state.activeVersionName || 'Original';

  const wordBtn = document.getElementById('gen-word-btn');
  const orig = wordBtn.textContent;
  wordBtn.textContent = '⏳ Building…';
  wordBtn.disabled = true;

  try {
    const blob = await generateDocx({
      tabs, allData: ALL_DATA, moduleConfig: MODULE_CONFIG,
      inclOverview, inclActivities, inclPrereqs, inclAssoc,
      includes, linkedSet, scopeStr, versionName, dateStr,
      effectiveScopeFn: effectiveScope,
    });
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href = url;
    a.download = `MRI_Process_Summary_${new Date().toISOString().slice(0, 10)}.docx`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } finally {
    wordBtn.textContent = orig;
    wordBtn.disabled = false;
  }
}


// ── DOWNLOAD Word (Business view) ──────────────────────────────────────────────

/* Uses the same branded generator as the System view, so both views produce
   documents in the Open Box house style. Filtering is delegated to the grid's
   own predicates so the document matches exactly what is on screen. */
async function downloadBusinessWord() {
  const inclOverview   = document.getElementById('gopt-overview').checked;
  const inclActivities = document.getElementById('gopt-activities').checked;
  const scopeAll       = document.getElementById('gscope-all').checked;
  const dateStr        = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const marketLabel    = selectedMarketLabels().join(', ') || '—';
  const versionName    = state.activeVersionName || 'Original';

  const wordBtn = document.getElementById('gen-word-btn');
  const orig = wordBtn.textContent;
  wordBtn.textContent = '⏳ Building…';
  wordBtn.disabled = true;

  try {
    const blob = await generateBusinessDocx({
      tabs: businessDocTabs(scopeAll),
      businessData: BUSINESS_DATA,
      businessConfig: BUSINESS_CONFIG,
      inclOverview, inclActivities,
      scopeStr: businessScopeStr(scopeAll),
      versionName, dateStr, marketLabel,
      itemFilter:    item => matchesCoverage(item) && matchesVerticals(item),
      linksFor:      systemLinksFor,
      coverageLabel: k => COVERAGE[k]?.label || k,
      docTitle: 'Business Process Taxonomy',
    });
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href = url;
    a.download = `Business_Process_Taxonomy_${new Date().toISOString().slice(0, 10)}.docx`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } finally {
    wordBtn.textContent = orig;
    wordBtn.disabled = false;
  }
}

// ── DOWNLOAD PDF ───────────────────────────────────────────────────────────────
/* Opens a print window whose stylesheet is houseStyleCSS() — the same SPEC that
   drives the .docx — so "Save as PDF" produces the Open Box house style rather
   than a separate look. The preview markup is reused verbatim. */
export function downloadPDF() {
  if (!_previewReady) {
    alert('Please click Generate Preview first, then Download PDF.');
    return;
  }

  const previewHTML = document.getElementById('doc-out').innerHTML;
  const docTitle = state.viewMode === 'business'
    ? 'Business Process Taxonomy' : 'Process Summary';

  const win = window.open('', '_blank', 'width=960,height=800');
  win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>${docTitle}</title>
<style>
*,*::before,*::after{box-sizing:border-box;}
html,body{margin:0;padding:0;background:#f0f2f5;}
.page-wrap{max-width:21cm;margin:0 auto;background:#fff;padding:1in;min-height:100vh;}

/* The Open Box house style, generated from the same spec as the Word export */
${houseStyleCSS(".doc-out", { print: true })}

.print-bar{position:fixed;bottom:0;left:0;right:0;background:#373C3C;
  border-top:3pt solid #BCD727;padding:10pt 20pt;display:flex;
  align-items:center;justify-content:space-between;z-index:999;}
.print-bar span{color:rgba(255,255,255,0.55);font-size:8.5pt;
  font-family:Verdana,sans-serif;letter-spacing:0.05em;}
.print-bar button{background:#BCD727;color:#373C3C;border:none;padding:8pt 20pt;
  font-size:10pt;font-weight:700;border-radius:5pt;cursor:pointer;
  font-family:Verdana,sans-serif;}
@media print{
  body{background:#fff;}
  .print-bar{display:none;}
  .page-wrap{padding:0;max-width:100%;min-height:auto;}
}
</style></head><body>
<div class="print-bar">
  <span>Set Destination to "Save as PDF" in the print dialog</span>
  <button onclick="window.print()">Save as PDF</button>
</div>
<div class="page-wrap"><div class="doc-out">${previewHTML}</div></div>
<script>window.onload=function(){setTimeout(function(){window.print();},600);};<\/script>
</body></html>`);
  win.document.close();
}
