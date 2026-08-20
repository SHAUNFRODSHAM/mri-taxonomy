import { state, ALL_DATA, MODULE_CONFIG, isModuleVisible } from '../state.js';
import { BUSINESS_DATA, BUSINESS_CONFIG, BUSINESS_MODULES, MARKETS, VERTICALS } from '../data/business/index.js';
import { effectiveScope } from './grid.js';
import { linkedSystemIds, systemLinksFor, COVERAGE } from '../data/links.js';
import { generateDocx, generateBusinessDocx } from './docxExport.js';
import { matchesCoverage, matchesVerticals } from './businessView.js';

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
  document.getElementById('gen-overlay').classList.add('open');
  document.getElementById('doc-out').innerHTML =
    '<p style="color:#aaa;font-style:italic;font-size:0.8rem">Select your options above and click Generate to build your document.</p>';
}

export function closeGenModal() {
  document.getElementById('gen-overlay').classList.remove('open');
}

// ── Scope helpers ──────────────────────────────────────────────────────────────
const SCOPE_LABELS = {
  'core':         '● CORE',
  'custom':       '● CUSTOM',
  'out-of-scope': '● OUT OF SCOPE',
};

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

// ── Scope summary table ────────────────────────────────────────────────────────
function buildScopeSummary(tabs, includes) {
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
  return `
    <table class="scope-summary-table">
      <thead><tr><th>Scope</th><th>Total processes</th><th>In this document</th></tr></thead>
      <tbody>
        <tr><td>● CORE</td>           <td>${counts.core}</td>           <td>${included.core}</td></tr>
        <tr><td>● CUSTOM</td>         <td>${counts.custom}</td>         <td>${included.custom}</td></tr>
        <tr><td>● OUT OF SCOPE</td>   <td>${counts['out-of-scope']}</td><td>${included['out-of-scope']}</td></tr>
        <tr><td>Untagged</td>         <td>${counts.untagged}</td>       <td>${included.untagged}</td></tr>
        <tr><td><strong>Total</strong></td><td><strong>${totalAll}</strong></td><td><strong>${totalIncluded}</strong></td></tr>
      </tbody>
    </table>`;
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

  let html = `<h1>MRI ERP Implementation — Process Summary Document</h1>
    <p style="color:#888;font-size:0.72rem;margin-bottom:8px;">
      Generated: ${dateStr} · Scope: ${e(scopeStr)}
    </p>
    ${buildScopeSummary(tabs, includes)}`;

  tabs.forEach(tab => {
    if (!ALL_DATA[tab]) return;
    const cfg = MODULE_CONFIG[tab];
    html += `<h2 class="mod-heading">${e(cfg?.label || tab)}</h2>`;

    ALL_DATA[tab].forEach(col => {
      html += `<h3 class="col-heading">${e(col.title)}</h3>`;

      let procIdx = 0;
      col.processes.forEach(proc => {
        if (!scopeIncluded(proc, includes, null, linkedSet)) return;
        procIdx++;
        html += renderProcessPreview(proc, procIdx, false, inclOverview, inclActivities, inclPrereqs, inclAssoc);

        let subIdx = 0;
        (proc.subs || []).forEach(sub => {
          if (!scopeIncluded(sub, includes, proc, linkedSet)) return;
          subIdx++;
          html += renderProcessPreview(sub, subIdx, true, inclOverview, inclActivities, inclPrereqs, inclAssoc);
        });
      });
    });
  });

  document.getElementById('doc-out').innerHTML = html;
  _previewReady = true;
}

function scopeChip(item) {
  if (!item.scope) return '';
  const colours = {
    'core':         { bg: 'rgba(143,184,58,0.15)', color: '#4a7010' },
    'custom':       { bg: 'rgba(200,168,90,0.15)', color: '#7a5818' },
    'out-of-scope': { bg: 'rgba(150,150,150,0.12)', color: '#666' },
  };
  const c = colours[item.scope] || {};
  return ` <span style="font-size:0.6rem;font-weight:700;padding:1px 6px;border-radius:8px;background:${c.bg};color:${c.color};vertical-align:middle;">${SCOPE_LABELS[item.scope]}</span>`;
}

function renderProcessPreview(item, idx, isSub, overview, activities, prereqs, assoc) {
  const tag      = isSub ? 'h5' : 'h4';
  const prefix   = isSub ? '' : `${idx}. `;
  let out = `<${tag}>${e(prefix + item.title)}${scopeChip(item)}</${tag}>`;

  if (item.mri_title) {
    out += `<p class="mri-title-label"><strong>MRI Module:</strong> ${e(item.mri_title)}</p>`;
  }
  if (overview && item.desc) {
    out += `<p class="item-desc">${e(item.desc)}</p>`;
  }
  if (activities && item.activities?.length) {
    out += `<div class="activities-sec">
      <div class="sec-label">Core Activities</div>
      <ul>${item.activities.map(a => `<li>${e(a)}</li>`).join('')}</ul>
    </div>`;
  }
  if (prereqs && item.mri_prereqs?.length) {
    out += `<div class="prereq-sec">
      <div class="prereq-sec-title">MRI Setup Prerequisites</div>
      ${item.mri_prereqs.map(p => `<div class="prereq-row"><span class="prereq-icon">⚙</span>${e(p)}</div>`).join('')}
    </div>`;
  }
  if (assoc && item.mri_assoc?.length) {
    out += `<div class="assoc-sec">
      <div class="assoc-sec-title">Associated MRI Screens</div>
      <table class="assoc-table">
        <thead><tr><th>MRI Screen</th><th>Description</th></tr></thead>
        <tbody>
          ${item.mri_assoc.map(a => `<tr><td><strong>${e(a.name)}</strong></td><td>${e(a.desc)}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>`;
  }
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

function buildBusinessBody(inclOverview, inclActivities) {
  const tabs    = businessDocTabs(document.getElementById('gscope-all').checked);
  const markets = state.markets || [];
  const sectors = (state.verticals && state.verticals.length)
    ? state.verticals : VERTICALS.filter(v => v !== 'All');
  let html = '';
  tabs.forEach(tab => {
    const cfg = BUSINESS_CONFIG[tab];
    html += `<h2 class="mod-heading">${e(cfg?.label || tab)}</h2>`;
    (BUSINESS_DATA[tab] || []).forEach(col => {
      html += `<h3 class="col-heading">${e(col.title)}</h3>`;
      col.processes.forEach(proc => {
        html += `<h4>${e(proc.title)}</h4>`;
        if (inclOverview && proc.desc) html += `<p class="item-desc">${e(proc.desc)}</p>`;
        if (inclActivities && proc.activities?.length) {
          html += `<ul>${proc.activities.map(a => `<li>${e(a)}</li>`).join('')}</ul>`;
        }
      });
    });
  });
  return html;
}

function buildBusinessPreview() {
  const inclOverview   = document.getElementById('gopt-overview').checked;
  const inclActivities = document.getElementById('gopt-activities').checked;
  const scopeAll = document.getElementById('gscope-all').checked;
  const dateStr  = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const marketLabel = selectedMarketLabels().join(', ') || '—';
  const html = `<h1>Business Process Taxonomy — Summary</h1>
    <p style="color:#888;font-size:0.72rem;margin-bottom:8px;">
      Generated: ${dateStr} · Scope: ${businessScopeStr(scopeAll)} · Markets: ${marketLabel}
    </p>
    ${buildBusinessBody(inclOverview, inclActivities)}`;
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
export function downloadPDF() {
  if (!_previewReady) {
    alert('Please click Generate Preview first, then Download PDF.');
    return;
  }

  const dateStr  = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const scopeAll = document.getElementById('gscope-all').checked;
  const scopeStr = state.viewMode === 'business' ? businessScopeStr(scopeAll) : getScopeStr(scopeAll);
  const versionName = state.activeVersionName || 'Original';
  const previewHTML = document.getElementById('doc-out').innerHTML;

  const win = window.open('', '_blank', 'width=960,height=800');
  win.document.write(`<!DOCTYPE html><html><head>
<meta charset="UTF-8">
<title>MRI Process Summary</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Segoe UI',Calibri,Arial,sans-serif;font-size:10pt;color:#2a2a2a;background:#f0f2f5;line-height:1.6;}
.page-wrap{max-width:21cm;margin:0 auto;background:#fff;padding:0;min-height:100vh;}

/* Cover */
.cover{background:#373C3C;color:#fff;padding:40pt 32pt 28pt;border-bottom:5pt solid #BCD727;}
.cover-title{font-size:22pt;font-weight:700;color:#fff;line-height:1.2;margin-bottom:8pt;}
.cover-scope{font-size:10pt;color:rgba(255,255,255,0.65);margin:6pt 0 0;}
.cover-meta{font-size:8.5pt;color:rgba(255,255,255,0.4);margin-top:18pt;letter-spacing:0.06em;text-transform:uppercase;}
.doc-body{padding:24pt 32pt 40pt;}

/* Headings */
.doc-out h1{font-size:14pt;font-weight:700;color:#fff;background:#373C3C;
  padding:8pt 14pt;margin:32pt -32pt 12pt;border-bottom:3pt solid #BCD727;
  letter-spacing:0.05em;text-transform:uppercase;page-break-before:always;}
.doc-out h1:first-child{page-break-before:avoid;}
.doc-out h2{font-size:12pt;font-weight:700;color:#373C3C;margin:22pt 0 6pt;
  padding-bottom:4pt;border-bottom:2pt solid #BCD727;}
.doc-out h3{font-size:10.5pt;font-weight:700;color:#373C3C;
  margin:16pt 0 5pt;border-left:4pt solid #BCD727;padding:5pt 11pt;
  background:#f8f9f0;border-radius:0 3pt 3pt 0;}
.doc-out h4{font-size:10pt;font-weight:700;color:#555;
  margin:10pt 0 4pt 22pt;border-left:3pt solid #6E7878;
  padding:3pt 9pt;background:#f5f5f5;border-radius:0 3pt 3pt 0;}
.doc-out h5{font-size:9.5pt;font-weight:700;color:#666;
  margin:8pt 0 3pt 36pt;border-left:2pt solid #aaa;
  padding:2pt 8pt;background:#fafafa;border-radius:0 3pt 3pt 0;}

/* Body text */
.doc-out p{font-size:9.5pt;color:#4a4a4a;margin:3pt 0 6pt;}
.doc-out p.mri-title-label{font-size:9pt;color:#6E7878;margin:2pt 0 5pt;}
.doc-out p.item-desc{color:#333;}

/* Activities */
.doc-out .activities-sec{margin:5pt 0 8pt;}
.doc-out .sec-label{font-size:7.5pt;font-weight:700;text-transform:uppercase;
  letter-spacing:0.08em;color:#373C3C;margin-bottom:4pt;}
.doc-out ul{list-style:none;padding:0;margin:0 0 8pt;}
.doc-out ul li{font-size:9pt;color:#3a3a3a;padding:3pt 8pt 3pt 20pt;
  background:#f8f9fa;border-radius:3pt;margin-bottom:3pt;position:relative;line-height:1.4;}
.doc-out ul li::before{content:'→';position:absolute;left:7pt;color:#BCD727;font-size:8pt;font-weight:700;}

/* Prerequisites */
.doc-out .prereq-sec{background:#fff8f0;border:1pt solid #e8d4b0;border-radius:4pt;
  padding:8pt 12pt;margin:6pt 0 10pt;}
.doc-out .prereq-sec-title{font-size:7.5pt;font-weight:700;text-transform:uppercase;
  letter-spacing:0.08em;color:#8a6020;margin-bottom:5pt;}
.doc-out .prereq-row{font-size:9pt;color:#4a4a4a;margin:3pt 0;padding-left:14pt;position:relative;}
.doc-out .prereq-icon{position:absolute;left:0;color:#c8a85a;}

/* Associated screens table */
.doc-out .assoc-sec{margin:6pt 0 12pt;}
.doc-out .assoc-sec-title{font-size:7.5pt;font-weight:700;text-transform:uppercase;
  letter-spacing:0.08em;color:#4a6a10;margin-bottom:5pt;}
.doc-out .assoc-table{border-collapse:collapse;width:100%;font-size:9pt;}
.doc-out .assoc-table th{background:#f0f5e6;color:#3a5a10;padding:5pt 10pt;
  text-align:left;font-size:7.5pt;text-transform:uppercase;letter-spacing:0.05em;
  border-bottom:2pt solid #BCD727;}
.doc-out .assoc-table td{padding:5pt 10pt;border-bottom:1pt solid #e0ead0;vertical-align:top;}
.doc-out .assoc-table td:first-child{font-weight:700;color:#3a5a10;width:38%;}

/* Scope summary */
.doc-out table.scope-summary-table{border-collapse:collapse;width:100%;margin:8pt 0 16pt;font-size:9pt;}
.doc-out table.scope-summary-table th{background:#373C3C;color:#fff;padding:5pt 10pt;
  text-align:left;font-size:7.5pt;text-transform:uppercase;letter-spacing:0.07em;}
.doc-out table.scope-summary-table td{padding:4pt 10pt;border-bottom:1pt solid #eee;}
.doc-out table.scope-summary-table tr:last-child td{font-weight:700;border-top:2pt solid #ddd;border-bottom:none;}

/* Module heading override for PDF */
.doc-out h2.mod-heading{color:#fff;background:#373C3C;padding:7pt 14pt;margin:28pt -32pt 10pt;
  border-bottom:3pt solid #BCD727;text-transform:uppercase;letter-spacing:0.06em;font-size:12pt;}
.doc-out h3.col-heading{font-size:11pt;border-left:4pt solid #6E7878;background:#f2f4f5;
  color:#373C3C;padding:5pt 11pt;}

/* Print bar */
.print-bar{position:fixed;bottom:0;left:0;right:0;background:#373C3C;border-top:3pt solid #BCD727;
  padding:10pt 20pt;display:flex;align-items:center;justify-content:space-between;z-index:999;}
.print-bar span{color:rgba(255,255,255,0.5);font-size:8.5pt;letter-spacing:0.06em;}
.print-bar button{background:#BCD727;color:#373C3C;border:none;padding:8pt 20pt;
  font-size:10pt;font-weight:700;border-radius:5pt;cursor:pointer;font-family:inherit;}

@media print{
  body{background:#fff;}
  .print-bar{display:none;}
  .page-wrap{padding:0;max-width:100%;min-height:auto;}
  .cover,.doc-body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  .doc-out h1,.doc-out h2.mod-heading{-webkit-print-color-adjust:exact;print-color-adjust:exact;page-break-before:always;}
  .doc-out h1:first-child,.doc-out h2.mod-heading:first-child{page-break-before:avoid;}
  .doc-out h2,.doc-out h3,.doc-out h4,.doc-out h5{page-break-after:avoid;}
  .doc-out .prereq-sec,.doc-out .assoc-table,.doc-out ul li{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  @page{margin:1.5cm;size:A4 portrait;}
}
</style>
</head><body>
<div class="print-bar">
  <span>Set Destination to "Save as PDF" in the print dialog</span>
  <button onclick="window.print()">🖨 Save as PDF</button>
</div>
<div class="page-wrap">
  <div class="cover">
    <div class="cover-title">MRI ERP Implementation<br>Process Summary Document</div>
    <div class="cover-scope">${e(scopeStr)}</div>
    <div class="cover-meta">Version: ${e(versionName)} &nbsp;·&nbsp; Generated: ${dateStr}</div>
  </div>
  <div class="doc-body">
    <div class="doc-out">${previewHTML}</div>
  </div>
</div>
<script>window.onload=function(){setTimeout(function(){window.print();},800);};<\/script>
</body></html>`);
  win.document.close();
}
