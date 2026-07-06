/* ═══════════════════════════════════════════════════════════════════════════
   mappingView.js — Business ⇄ System mapping matrix (the bird's-eye view)

   Rows = business domains (grouped by business module); columns = MRI PMX
   system modules. Cells show the number of links in that intersection; domains
   with zero links are flagged as coverage gaps. Clicking a populated cell opens
   the detail panel listing the specific business↔system pairs, each navigable.

   Reads entirely from the link registry (../data/links.js) — pure visualisation,
   no new data.
   ═══════════════════════════════════════════════════════════════════════════ */

import { state } from '../state.js';
import { BUSINESS_CONFIG } from '../data/business/index.js';
import { buildMappingMatrix, cellPairs, COVERAGE } from '../data/links.js';

let onNavigate = () => {};
export function initMappingView({ navigate }) { onNavigate = navigate || (() => {}); }

let lastCell = null;

/** Dominant coverage colour for a set of links in a cell (by item coverage). */
function cellCoverage(links) {
  const set = new Set(links.map(l => l.coverage || 'untagged'));
  if (set.size === 1) { const k = [...set][0]; return COVERAGE[k] ? COVERAGE[k].color : 'var(--border2)'; }
  return '#b8860b'; // mixed → amber
}
function covCounts(links) {
  const c = { full: 0, partial: 0, outside: 0, untagged: 0 };
  links.forEach(l => { const k = l.coverage || 'untagged'; c[k] = (c[k] || 0) + 1; });
  return c;
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function renderMapping() {
  const { systemModules, rows } = buildMappingMatrix();

  // Banner
  const header     = document.getElementById('main-header');
  const headerText = document.getElementById('main-header-text');
  if (header)     { header.className = 'main-header map-header'; header.style.background = ''; }
  if (headerText) headerText.textContent = 'Business ⇄ MRI PMX System — Coverage Map';

  const grid = document.getElementById('grid');
  grid.className = 'grid grid-mapping';

  const linkedDomains = rows.filter(r => !r.gap).length;
  const totalLinks    = rows.reduce((a, r) => a + r.total, 0);

  let html = `
    <div class="map-legend">
      <span class="map-legend-item"><span class="map-cell-demo has-links">12</span> links in intersection</span>
      <span class="map-legend-item"><span class="map-cell-demo gap-demo">—</span> no links yet</span>
      <span class="map-legend-stat">${linkedDomains}/${rows.length} domains mapped · ${totalLinks} links</span>
    </div>
    <div class="map-scroll">
    <table class="map-table">
      <thead>
        <tr>
          <th class="map-corner">Business domain ↓ · System module →</th>
          ${systemModules.map(sm => `<th class="map-col-head">${esc(sm.label)}</th>`).join('')}
        </tr>
      </thead>
      <tbody>`;

  let lastModule = null;
  rows.forEach(row => {
    // Group header per business module
    if (row.module !== lastModule) {
      lastModule = row.module;
      html += `<tr class="map-group-row">
        <td colspan="${systemModules.length + 1}">
          <span class="map-group-icon">${BUSINESS_CONFIG[row.module]?.icon || ''}</span>
          ${esc(row.moduleLabel)} <span class="map-group-tag">Business</span>
        </td></tr>`;
    }

    html += `<tr class="${row.gap ? 'map-row-gap' : ''}">
      <th class="map-row-head">
        ${esc(row.domainTitle)}
        ${row.gap ? '<span class="map-gap-badge">unmapped</span>' : ''}
      </th>`;
    systemModules.forEach(sm => {
      const cellLinks = row.cells[sm.id];
      const n = cellLinks.length;
      if (n) {
        const cc = covCounts(cellLinks);
        const tip = `${n} link${n > 1 ? 's' : ''} — Full ${cc.full} · Partial ${cc.partial} · Outside ${cc.outside} (click to view)`;
        html += `<td class="map-cell has-links" data-domain="${esc(row.domainId)}" data-sysmod="${esc(sm.id)}"
          style="--cov:${cellCoverage(cellLinks)}" title="${esc(tip)}">${n}</td>`;
      } else {
        html += `<td class="map-cell empty">·</td>`;
      }
    });
    html += `</tr>`;
  });

  html += `</tbody></table></div>`;
  grid.innerHTML = html;

  // Cell clicks → open the pair list in the detail panel
  grid.querySelectorAll('.map-cell.has-links').forEach(td => {
    td.addEventListener('click', () => showCell(td.dataset.domain, td.dataset.sysmod));
  });
}

function showCell(domainId, sysMod) {
  const pairs = cellPairs(domainId, sysMod);
  if (!pairs.length) { lastCell = null; document.getElementById('panel').classList.remove('open'); return; }
  lastCell = { domainId, sysMod };
  const domainTitle = pairs[0].b.domain.domainTitle;
  const sysLabel    = pairs[0].s.moduleLabel;

  state.openPanelId = null;
  document.getElementById('panel-bc').textContent = 'Coverage Map';
  document.getElementById('panel-title').textContent = `${domainTitle} ⇄ ${sysLabel}`;
  document.getElementById('panel-badges').innerHTML =
    `<span class="badge badge-business">Business</span><span class="badge badge-mri">MRI PMX</span>
     <span class="badge">${pairs.length} link${pairs.length > 1 ? 's' : ''}</span>`;

  const covBadge = (cov) => {
    if (!cov || !COVERAGE[cov]) return '';
    const c = COVERAGE[cov];
    return `<span class="cov-badge" style="--cov:${c.color}" title="${esc(c.label)}">${esc(c.short)}</span>`;
  };

  const rows = pairs.map(p => `
    <div class="map-pair">
      ${p.coverage ? `<div class="map-pair-head">${covBadge(p.coverage)}</div>` : ''}
      <button class="xlink" data-xview="business" data-xid="${esc(p.b.id)}">
        <span class="xlink-mod">Business</span><span class="xlink-arrow">→</span>
        <span class="xlink-body"><span class="xlink-title">${esc(p.b.title)}</span>
          <span class="xlink-bc">${esc(p.b.breadcrumb)}</span></span>
      </button>
      <span class="map-pair-link">⇄</span>
      <button class="xlink" data-xview="system" data-xid="${esc(p.s.id)}">
        <span class="xlink-mod">${esc(p.s.moduleLabel)}</span><span class="xlink-arrow">→</span>
        <span class="xlink-body"><span class="xlink-title">${esc(p.s.title)}</span>
          <span class="xlink-bc">${esc(p.s.breadcrumb)}</span></span>
      </button>
    </div>`).join('');

  document.getElementById('panel-body').innerHTML = `
    <div class="psec">
      <div class="psec-label">Linked Process Pairs <span class="xlink-count">${pairs.length}</span></div>
      <div class="map-pair-list">${rows}</div>
    </div>`;

  document.getElementById('overlay').classList.add('open');
  document.getElementById('panel').classList.add('open');
}
