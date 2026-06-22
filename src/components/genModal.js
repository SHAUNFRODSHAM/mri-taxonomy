import { state, ALL_DATA, MODULE_CONFIG, isModuleVisible } from '../state.js';
import { BUSINESS_DATA, BUSINESS_CONFIG, BUSINESS_MODULES, MARKETS, VERTICALS } from '../data/business/index.js';

// ── Module scope helpers ─────────────────────────────────────────────────────
// "All Modules" respects the per-version visibility selection: hidden modules
// are excluded from the generated document, the same as they are from the tab
// bar. "Current Tab" is always a visible module.

/** The tabs to include in the document, in registration order. */
function getDocTabs(scopeAll) {
  return scopeAll
    ? Object.keys(ALL_DATA).filter(isModuleVisible)
    : [state.currentTab];
}

/** Human-readable scope label for the document header. */
function getScopeStr(scopeAll) {
  if (!scopeAll) return MODULE_CONFIG[state.currentTab]?.label || state.currentTab;
  const total   = Object.keys(ALL_DATA).length;
  const visible = Object.keys(ALL_DATA).filter(isModuleVisible).length;
  return visible === total ? 'All Modules' : `Visible Modules (${visible} of ${total})`;
}

export function openGenModal() {
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

function scopeIncluded(item, includes) {
  const scope = item.scope || null;
  if (!scope)                     return includes.untagged;
  if (scope === 'core')           return includes.core;
  if (scope === 'custom')         return includes.custom;
  if (scope === 'out-of-scope')   return includes['out-of-scope'];
  return true;
}

function buildScopeSummary(tabs, includes) {
  const counts = { core: 0, custom: 0, 'out-of-scope': 0, untagged: 0 };
  const included = { core: 0, custom: 0, 'out-of-scope': 0, untagged: 0 };

  tabs.forEach(tab => {
    (ALL_DATA[tab] || []).forEach(col => {
      col.processes.forEach(proc => {
        tallyItem(proc, counts, included, includes);
        (proc.subs || []).forEach(sub => tallyItem(sub, counts, included, includes));
      });
    });
  });

  const totalAll      = Object.values(counts).reduce((a, b) => a + b, 0);
  const totalIncluded = Object.values(included).reduce((a, b) => a + b, 0);

  return `
    <table class="scope-summary-table">
      <thead>
        <tr>
          <th>Scope</th>
          <th>Total processes</th>
          <th>In this document</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>● CORE</td>           <td>${counts.core}</td>           <td>${included.core}</td></tr>
        <tr><td>● CUSTOM</td>         <td>${counts.custom}</td>         <td>${included.custom}</td></tr>
        <tr><td>● OUT OF SCOPE</td>   <td>${counts['out-of-scope']}</td><td>${included['out-of-scope']}</td></tr>
        <tr><td>Untagged</td>         <td>${counts.untagged}</td>       <td>${included.untagged}</td></tr>
        <tr><td><strong>Total</strong></td><td><strong>${totalAll}</strong></td><td><strong>${totalIncluded}</strong></td></tr>
      </tbody>
    </table>`;
}

function tallyItem(item, counts, included, includes) {
  const key = item.scope || 'untagged';
  if (key in counts) counts[key]++;
  if (scopeIncluded(item, includes) && key in included) included[key]++;
}

// ── BUILD PREVIEW ──────────────────────────────────────────────────────────────

// ── Business document helpers ────────────────────────────────────────────────

const eB = s => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

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

/** Shared body HTML for the business document (preview + PDF share this). */
function buildBusinessBody(inclOverview, inclActivities) {
  const tabs    = businessDocTabs(document.getElementById('gscope-all').checked);
  const markets = state.markets || [];
  const sectors = (state.verticals && state.verticals.length)
    ? state.verticals : VERTICALS.filter(v => v !== 'All');
  let html = '';

  tabs.forEach(tab => {
    const cfg = BUSINESS_CONFIG[tab];
    html += `<h1>${eB(cfg?.label || tab)}</h1>`;
    (BUSINESS_DATA[tab] || []).forEach(col => {
      html += `<h2>${eB(col.title)}</h2>`;
      col.processes.forEach(proc => {
        html += `<h3>${eB(proc.title)}</h3>`;
        if (inclOverview && proc.desc) html += `<p>${eB(proc.desc)}</p>`;
        (proc.subs || []).forEach(sub => {
          html += `<h4>${eB(sub.title)}</h4>`;
          if (inclOverview && sub.desc) html += `<p>${eB(sub.desc)}</p>`;
          if (inclActivities && sub.activities?.length) {
            html += `<ul>${sub.activities.map(a => `<li>${eB(a)}</li>`).join('')}</ul>`;
          }
          if (sub.market) {
            markets.filter(k => sub.market[k]).forEach(k => {
              const label = (MARKETS.find(m => m.key === k) || {}).label || k;
              html += `<div class="prereq-sec"><div class="prereq-sec-title">Market Variation — ${eB(label)}</div>
                <p>${eB(sub.market[k])}</p></div>`;
            });
          }
          if (sub.vertical) {
            const rows = sectors.filter(s => sub.vertical[s])
              .map(s => `<div class="assoc-row"><strong>${s}:</strong> ${eB(sub.vertical[s])}</div>`).join('');
            if (rows) html += `<div class="assoc-sec"><div class="assoc-sec-title">Vertical Detail</div>${rows}</div>`;
          }
          if (sub.standards?.length) {
            html += `<p style="font-size:0.72rem;color:#5a7a1e;"><strong>Standards:</strong> ${eB(sub.standards.join(' · '))}</p>`;
          }
        });
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
}

export function buildDoc() {
  if (state.viewMode === 'business') return buildBusinessPreview();
  const inclOverview    = document.getElementById('gopt-overview').checked;
  const inclActivities  = document.getElementById('gopt-activities').checked;
  const inclPrereqs     = document.getElementById('gopt-prereqs').checked;
  const inclAssoc       = document.getElementById('gopt-assoc').checked;
  const scopeAll        = document.getElementById('gscope-all').checked;
  const includes        = getScopeIncludes();

  const tabs      = getDocTabs(scopeAll);
  const colClasses = { cm: '', gl: 'gl-col', ap: 'ap-col' };

  const dateStr   = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const scopeStr  = getScopeStr(scopeAll);

  let html = `<h1>MRI ERP Implementation — Process Summary Document</h1>
    <p style="color:#888;font-size:0.72rem;margin-bottom:8px;">
      Generated: ${dateStr} · Scope: ${scopeStr}
    </p>
    ${buildScopeSummary(tabs, includes)}`;

  tabs.forEach(tab => {
    if (!ALL_DATA[tab]) return;
    const data = ALL_DATA[tab];
    const cfg  = MODULE_CONFIG[tab];
    const cls  = colClasses[tab] || '';

    html += `<h2 class="${cls}">${cfg?.label || tab}</h2>`;

    data.forEach(col => {
      html += `<h3>${col.title}</h3>`;
      col.processes.forEach(proc => {
        if (!scopeIncluded(proc, includes)) return;
        html += renderItemHTML(proc, 'h4', inclOverview, inclActivities, inclPrereqs, inclAssoc);
        (proc.subs || []).forEach(sub => {
          if (!scopeIncluded(sub, includes)) return;
          html += renderItemHTML(sub, 'h4', inclOverview, inclActivities, inclPrereqs, inclAssoc, true);
        });
      });
    });
  });

  document.getElementById('doc-out').innerHTML = html;
}

function renderItemHTML(item, tag, overview, activities, prereqs, assoc, isSub = false) {
  const style = isSub ? ' style="background:#f0f0f0;color:#333;border-left:3px solid #c8a85a;"' : '';
  const scopeLabel = item.scope ? ` <span style="font-size:0.6rem;font-weight:700;padding:1px 6px;border-radius:8px;background:${scopeBgColor(item.scope)};color:${scopeTextColor(item.scope)};vertical-align:middle;">${SCOPE_LABELS[item.scope]}</span>` : '';
  let out = `<${tag}${style}>${item.title}${scopeLabel}</${tag}>`;
  if (overview && item.desc) out += `<p>${item.desc}</p>`;
  if (activities && item.activities?.length) {
    out += `<ul>${item.activities.map(a => `<li>${a}</li>`).join('')}</ul>`;
  }
  if (prereqs && item.mri_prereqs?.length) {
    out += `<div class="prereq-sec"><div class="prereq-sec-title">Setup Prerequisites</div>
      ${item.mri_prereqs.map(p => `<div style="font-size:0.73rem;color:#4a4a4a;margin:2px 0;padding-left:12px;position:relative;"><span style="position:absolute;left:0;color:#c8a85a">⚙</span>${p}</div>`).join('')}</div>`;
  }
  if (assoc && item.mri_assoc?.length) {
    out += `<div class="assoc-sec"><div class="assoc-sec-title">Associated Processes</div>
      ${item.mri_assoc.map(a => `<div class="assoc-row"><strong>${a.name}:</strong> ${a.desc}</div>`).join('')}</div>`;
  }
  return out;
}

function scopeBgColor(scope) {
  if (scope === 'core')         return 'rgba(143,184,58,0.15)';
  if (scope === 'custom')       return 'rgba(200,168,90,0.15)';
  if (scope === 'out-of-scope') return 'rgba(150,150,150,0.12)';
  return 'transparent';
}
function scopeTextColor(scope) {
  if (scope === 'core')         return '#4a7010';
  if (scope === 'custom')       return '#7a5818';
  if (scope === 'out-of-scope') return '#666';
  return '#888';
}

// ── DOWNLOAD WORD ──────────────────────────────────────────────────────────────

function downloadBusinessWord() {
  const inclOverview   = document.getElementById('gopt-overview').checked;
  const inclActivities = document.getElementById('gopt-activities').checked;
  const scopeAll = document.getElementById('gscope-all').checked;
  const dateStr  = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const marketLabel = selectedMarketLabels().join(', ') || '—';
  const body = buildBusinessBody(inclOverview, inclActivities);

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8">
<style>
  body { font-family:Calibri,sans-serif;font-size:11pt;color:#1a1a1a;margin:2.5cm;line-height:1.5; }
  h1 { font-size:18pt;font-weight:bold;color:#2a2a2a;border-bottom:2pt solid #8fb83a;padding-bottom:4pt;margin-top:24pt;page-break-before:always; }
  h1:first-of-type { page-break-before:avoid; }
  h2 { font-size:14pt;font-weight:bold;color:#4a7a1e;margin-top:18pt; }
  h3 { font-size:12pt;font-weight:bold;color:#c8a85a;margin-top:14pt;border-left:4pt solid #c8a85a;padding-left:8pt; }
  h4 { font-size:11pt;font-weight:bold;color:#3a5a10;margin-top:10pt;padding-left:16pt; }
  p { margin:4pt 0 6pt; } ul { margin:2pt 0 8pt 20pt; } li { font-size:10pt; }
  .prereq-sec,.assoc-sec { margin:6pt 0;padding:6pt 10pt;border-radius:4pt; }
  .prereq-sec { background:#fff7ed;border:1pt solid #fce4bb; }
  .assoc-sec { background:#f0f7e6;border:1pt solid #c5de8a; }
  .prereq-sec-title,.assoc-sec-title { font-size:8pt;font-weight:bold;text-transform:uppercase; }
  @page { margin:2.5cm;size:A4 portrait; }
</style></head>
<body>
<h1 style="page-break-before:avoid;border-bottom:3pt solid #2a2a2a;">Business Process Taxonomy &mdash; Summary</h1>
<p style="font-size:9pt;color:#888;">Generated: ${dateStr} &nbsp;&bull;&nbsp; Scope: ${eB(businessScopeStr(scopeAll))} &nbsp;&bull;&nbsp; Market: ${eB(marketLabel)}</p>
${body}
</body></html>`;

  const blob = new Blob(['﻿' + html], { type: 'application/vnd.ms-word;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `Business_Process_Taxonomy_${new Date().toISOString().slice(0, 10)}.doc`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadWord() {
  const preview = document.getElementById('doc-out').innerHTML;
  if (preview.includes('Select your options') || preview.includes('click Generate')) {
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

  const e = s => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const bullets = items => items.map(i => `<li>${e(i)}</li>`).join('');

  // Scope summary table for Word
  const wordSummary = buildWordScopeTable(tabs, includes, e);

  let body = wordSummary;

  tabs.forEach(tab => {
    if (!ALL_DATA[tab]) return;
    body += `<h1>${e(MODULE_CONFIG[tab]?.label || tab)}</h1>`;
    ALL_DATA[tab].forEach(col => {
      body += `<h2>${e(col.title)}</h2>`;
      col.processes.forEach(proc => {
        if (!scopeIncluded(proc, includes)) return;
        body += wordItem(proc, 'h3', e, bullets, inclOverview, inclActivities, inclPrereqs, inclAssoc);
        (proc.subs || []).forEach(sub => {
          if (!scopeIncluded(sub, includes)) return;
          body += wordItem(sub, 'h4', e, bullets, inclOverview, inclActivities, inclPrereqs, inclAssoc);
        });
      });
    });
  });

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:w="urn:schemas-microsoft-com:office:word"
    xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8">
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument></xml><![endif]-->
<style>
  body  { font-family:Calibri,sans-serif;font-size:11pt;color:#1a1a1a;margin:2.5cm;line-height:1.5; }
  h1    { font-size:18pt;font-weight:bold;color:#2a2a2a;border-bottom:2pt solid #8fb83a;padding-bottom:4pt;margin-top:24pt;margin-bottom:6pt;page-break-before:always; }
  h1:first-of-type { page-break-before:avoid; }
  h2    { font-size:14pt;font-weight:bold;color:#4a7a1e;margin-top:18pt;margin-bottom:4pt; }
  h3    { font-size:12pt;font-weight:bold;color:#c8a85a;margin-top:14pt;margin-bottom:4pt;border-left:4pt solid #c8a85a;padding-left:8pt; }
  h4    { font-size:11pt;font-weight:bold;color:#3a5a10;margin-top:10pt;margin-bottom:2pt;padding-left:16pt; }
  p     { margin:4pt 0 6pt 0;font-size:10.5pt; }
  ul    { margin:2pt 0 8pt 0;padding-left:20pt; }
  li    { font-size:10pt;margin-bottom:3pt;line-height:1.4; }
  p.meta{ font-size:9pt;color:#888888;margin-bottom:18pt; }
  strong{ font-weight:bold; }
  table { border-collapse:collapse;width:100%;margin-bottom:16pt;font-size:10pt; }
  th    { background:#f0f0f0;padding:5pt 10pt;text-align:left;font-size:8pt;text-transform:uppercase;border-bottom:2pt solid #ccc; }
  td    { padding:4pt 10pt;border-bottom:1pt solid #ddd; }
  .scope-core   { color:#4a7010; font-weight:bold; }
  .scope-custom { color:#7a5818; font-weight:bold; }
  .scope-oos    { color:#666;    font-weight:bold; }
  @page { margin:2.5cm;size:A4 portrait; }
</style>
</head>
<body>
<h1 style="page-break-before:avoid;border-bottom:3pt solid #2a2a2a;">MRI ERP Implementation &mdash; Process Summary</h1>
<p class="meta">Generated: ${dateStr} &nbsp;&bull;&nbsp; Scope: ${e(scopeStr)}</p>
${body}
</body></html>`;

  const blob = new Blob(['﻿' + html], { type: 'application/vnd.ms-word;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `MRI_Process_Summary_${new Date().toISOString().slice(0, 10)}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function buildWordScopeTable(tabs, includes, e) {
  const counts   = { core: 0, custom: 0, 'out-of-scope': 0, untagged: 0 };
  const included = { core: 0, custom: 0, 'out-of-scope': 0, untagged: 0 };
  tabs.forEach(tab => {
    (ALL_DATA[tab] || []).forEach(col => {
      col.processes.forEach(proc => {
        tallyItem(proc, counts, included, includes);
        (proc.subs || []).forEach(sub => tallyItem(sub, counts, included, includes));
      });
    });
  });
  const totalAll      = Object.values(counts).reduce((a, b) => a + b, 0);
  const totalIncluded = Object.values(included).reduce((a, b) => a + b, 0);
  return `
    <table>
      <thead><tr><th>Scope</th><th>Total processes</th><th>In this document</th></tr></thead>
      <tbody>
        <tr><td class="scope-core">● CORE</td>           <td>${counts.core}</td>           <td>${included.core}</td></tr>
        <tr><td class="scope-custom">● CUSTOM</td>       <td>${counts.custom}</td>         <td>${included.custom}</td></tr>
        <tr><td class="scope-oos">● OUT OF SCOPE</td>    <td>${counts['out-of-scope']}</td><td>${included['out-of-scope']}</td></tr>
        <tr><td>Untagged</td>                             <td>${counts.untagged}</td>       <td>${included.untagged}</td></tr>
        <tr><td><strong>Total</strong></td>               <td><strong>${totalAll}</strong></td><td><strong>${totalIncluded}</strong></td></tr>
      </tbody>
    </table>`;
}

function wordItem(item, tag, e, bullets, overview, activities, prereqs, assoc) {
  const scopeStr = item.scope ? ` [${SCOPE_LABELS[item.scope] || item.scope}]` : '';
  let out = `<${tag}>${e(item.title)}${e(scopeStr)}</${tag}>`;
  if (overview && item.desc)                out += `<p>${e(item.desc)}</p>`;
  if (activities && item.activities?.length) out += `<p><strong>Core Activities</strong></p><ul>${bullets(item.activities)}</ul>`;
  if (prereqs && item.mri_prereqs?.length)   out += `<p><strong>MRI Setup Prerequisites</strong></p><ul>${bullets(item.mri_prereqs)}</ul>`;
  if (assoc && item.mri_assoc?.length) {
    out += `<p><strong>MRI Associated Processes</strong></p><ul>`;
    item.mri_assoc.forEach(a => { out += `<li><strong>${e(a.name)}:</strong> ${e(a.desc)}</li>`; });
    out += `</ul>`;
  }
  return out;
}

// ── DOWNLOAD PDF ───────────────────────────────────────────────────────────────

export function downloadPDF() {
  const preview = document.getElementById('doc-out').innerHTML;
  if (preview.includes('Select your options') || preview.includes('click Generate')) {
    alert('Please click Generate Preview first, then Download PDF.');
    return;
  }

  const dateStr   = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const scopeAll  = document.getElementById('gscope-all').checked;
  const scopeStr  = state.viewMode === 'business' ? businessScopeStr(scopeAll) : getScopeStr(scopeAll);
  const previewHTML = document.getElementById('doc-out').innerHTML;

  const win = window.open('', '_blank', 'width=960,height=800');
  win.document.write(`<!DOCTYPE html><html><head>
<meta charset="UTF-8">
<title>MRI Process Summary</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Segoe UI',Arial,sans-serif;font-size:10pt;color:#2a2a2a;background:#f0f2f5;line-height:1.6;}
.page-wrap{max-width:21cm;margin:0 auto;background:#fff;padding:2cm 2.2cm 2.5cm;min-height:100vh;}
.cover{background:#2a2a2a;color:#fff;padding:18pt 22pt;border-radius:6pt;margin-bottom:22pt;border-bottom:4pt solid #8fb83a;}
.cover h1{font-size:18pt;font-weight:700;letter-spacing:0.02em;margin-bottom:5pt;color:#fff;border:none;background:none;padding:0;}
.cover .meta{font-size:8.5pt;color:rgba(255,255,255,0.55);letter-spacing:0.08em;text-transform:uppercase;}
.cover .scope-badge{display:inline-block;margin-top:8pt;background:#8fb83a;color:#fff;font-size:8pt;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:3pt 10pt;border-radius:3pt;}
.doc-out h1{font-size:14pt;font-weight:700;color:#fff;background:#2a2a2a;padding:8pt 14pt;margin:26pt 0 8pt;border-radius:4pt;border-bottom:3pt solid #8fb83a;letter-spacing:0.06em;text-transform:uppercase;page-break-before:always;}
.doc-out h1:first-child{page-break-before:avoid;}
.doc-out h2{font-size:12pt;font-weight:700;color:#4a7a1e;margin:18pt 0 5pt;padding-bottom:4pt;border-bottom:1.5pt solid #c8e07a;}
.doc-out h2.gl-col{color:#3b6d11;}
.doc-out h2.ap-col{color:#1a5fa8;}
.doc-out h3{font-size:10.5pt;font-weight:700;color:#fff;background:#c8a85a;padding:5pt 11pt;margin:13pt 0 5pt;border-radius:3pt;}
.doc-out h4{font-size:10pt;font-weight:700;color:#3a5a10;margin:10pt 0 4pt 18pt;padding-left:9pt;border-left:3pt solid #8fb83a;background:#f5f9ec;padding-top:3pt;padding-bottom:3pt;border-radius:0 3pt 3pt 0;}
.doc-out h4[style*="f0f0f0"]{background:#f0f0f0;border-left-color:#c8a85a;color:#333;}
.doc-out p{font-size:9.5pt;color:#4a4a4a;margin:3pt 0 5pt;}
.doc-out ul{list-style:none;padding:0;margin:0 0 9pt 0;}
.doc-out ul li{font-size:9pt;color:#4a4a4a;padding:3pt 8pt 3pt 20pt;background:#f8f9fa;border-radius:3pt;margin-bottom:3pt;position:relative;line-height:1.4;}
.doc-out ul li::before{content:'→';position:absolute;left:7pt;color:#8fb83a;font-size:8pt;}
.doc-out .prereq-sec{background:#fff7ed;border:1pt solid #fce4bb;border-radius:4pt;padding:6pt 10pt;margin:6pt 0;}
.doc-out .prereq-sec-title{font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#c8a85a;margin-bottom:3pt;}
.doc-out .assoc-sec{background:#f0f7e6;border:1pt solid #c5de8a;border-radius:4pt;padding:6pt 10pt;margin:6pt 0;}
.doc-out .assoc-sec-title{font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#5a7a1e;margin-bottom:3pt;}
.doc-out .assoc-row{font-size:9pt;color:#3a5a10;margin:2pt 0;padding-left:10pt;position:relative;}
.doc-out .assoc-row::before{content:'↗';position:absolute;left:0;}
/* Scope summary table */
.doc-out table{border-collapse:collapse;width:100%;margin:8pt 0 16pt;font-size:9pt;}
.doc-out th{background:#f4f6f8;padding:5pt 10pt;text-align:left;font-size:7.5pt;text-transform:uppercase;letter-spacing:0.07em;color:#666;border-bottom:2pt solid #ddd;}
.doc-out td{padding:4pt 10pt;border-bottom:1pt solid #eee;}
.doc-out tr:last-child td{font-weight:700;border-top:2pt solid #ddd;border-bottom:none;}
.print-bar{position:fixed;bottom:0;left:0;right:0;background:#2a2a2a;border-top:3pt solid #8fb83a;padding:10pt 20pt;display:flex;align-items:center;justify-content:space-between;z-index:999;}
.print-bar span{color:rgba(255,255,255,0.5);font-size:8.5pt;letter-spacing:0.06em;}
.print-bar button{background:#c0392b;color:#fff;border:none;padding:8pt 20pt;font-size:10pt;font-weight:700;border-radius:5pt;cursor:pointer;font-family:inherit;}
.print-bar button:hover{background:#a93226;}
@media print{
  body{background:#fff;}
  .print-bar{display:none;}
  .page-wrap{padding:0;max-width:100%;min-height:auto;}
  .cover,.doc-out h1,.doc-out h3,.doc-out h4,.doc-out .prereq-sec,.doc-out .assoc-sec,.doc-out ul li{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  .doc-out h1{page-break-before:always;}
  .doc-out h1:first-child{page-break-before:avoid;}
  .doc-out h3,.doc-out h4{page-break-after:avoid;}
  @page{margin:1.5cm;size:A4 portrait;}
}
</style>
</head><body>
<div class="print-bar">
  <span>When the print dialog opens, set Destination to "Save as PDF"</span>
  <button onclick="window.print()">🖨 Save as PDF</button>
</div>
<div class="page-wrap">
  <div class="cover">
    <h1>MRI ERP Implementation — Process Summary</h1>
    <div class="meta">Generated: ${dateStr}</div>
    <div class="scope-badge">${scopeStr}</div>
  </div>
  <div class="doc-out">${previewHTML}</div>
</div>
<script>window.onload=function(){setTimeout(function(){window.print();},800);};<\/script>
</body></html>`);
  win.document.close();
}
