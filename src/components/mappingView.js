/* ═══════════════════════════════════════════════════════════════════════════
   mappingView.js — Business ⇄ System mapping matrix + inline link editor

   Read-only view: matrix table (rows = business domains, cols = system modules).
   Edit mode: accordion card layout per business domain — each card lists L3
   processes with editable link chips (coverage select + remove) and a
   searchable combobox to add new links.
   ═══════════════════════════════════════════════════════════════════════════ */

import { state } from '../state.js';
import { ALL_DATA, MODULE_CONFIG } from '../data/index.js';
import { BUSINESS_DATA, BUSINESS_CONFIG, BUSINESS_MODULES } from '../data/business/index.js';
import {
  buildMappingMatrix, cellPairs, COVERAGE, COVERAGE_ORDER, coverageTooltip,
  addLink, removeLink, setLinkCoverage, getLinks,
} from '../data/links.js';

let onNavigate = () => {};
export function initMappingView({ navigate }) { onNavigate = navigate || (() => {}); }

let lastCell = null;

// Expand state persists across re-renders while the view is mounted
const expandedDomains = new Set();

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const dirty = () => document.dispatchEvent(new CustomEvent('mri:versionDirty'));

function cellCoverage(links) {
  const set = new Set(links.map(l => l.coverage || 'untagged'));
  if (set.size === 1) { const k = [...set][0]; return COVERAGE[k] ? COVERAGE[k].color : 'var(--border2)'; }
  return '#b8860b';
}
function covCounts(links) {
  const c = { full: 0, partial: 0, outside: 0, untagged: 0 };
  links.forEach(l => { const k = l.coverage || 'untagged'; c[k] = (c[k] || 0) + 1; });
  return c;
}

/** Flat list of every system process (and sub) for the add-link combobox. */
function buildSystemCandidates() {
  const out = [];
  Object.keys(ALL_DATA).forEach(mod => {
    const modLabel = MODULE_CONFIG[mod]?.label || mod;
    (ALL_DATA[mod] || []).forEach(col => {
      (col.processes || []).forEach(p => {
        out.push({ id: p.id, mod, title: p.title, label: `${modLabel} › ${col.title}` });
        (p.subs || []).forEach(s =>
          out.push({ id: s.id, mod, title: s.title, label: `${modLabel} › ${col.title} › ${p.title}` }));
      });
    });
  });
  return out;
}

function resolveSysFromCandidates(id, candidates) {
  const c = candidates.find(x => x.id === id);
  if (!c) return null;
  return { ...c, shortMod: c.mod.toUpperCase() };
}

/** L3 business processes belonging to a domain (column). */
function getDomainProcesses(domainId) {
  for (const mod of BUSINESS_MODULES) {
    const col = (BUSINESS_DATA[mod] || []).find(c => c.id === domainId);
    if (col) return col.processes || [];
  }
  return [];
}

export function renderMapping() {
  const { systemModules, rows } = buildMappingMatrix();

  const header     = document.getElementById('main-header');
  const headerText = document.getElementById('main-header-text');
  if (header)     { header.className = 'main-header map-header'; header.style.background = ''; }
  if (headerText) headerText.textContent = 'Business ⇄ MRI PMX System — Coverage Map';

  const grid = document.getElementById('grid');

  if (state.editMode) {
    renderMappingEditMode(grid, rows);
    return;
  }

  // ── Read-only matrix ──────────────────────────────────────────────────────
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

// ── Edit mode: domain card layout ────────────────────────────────────────────

function renderMappingEditMode(grid, rows) {
  grid.className = 'grid grid-mapping-edit';
  grid.innerHTML = '';

  const sysCandidates = buildSystemCandidates();
  const linkedDomains = rows.filter(r => !r.gap).length;
  const totalLinks    = rows.reduce((a, r) => a + r.total, 0);

  const hdr = document.createElement('div');
  hdr.className = 'map-edit-header';
  hdr.innerHTML = `
    <span class="map-edit-header-title">Edit Process Links</span>
    <span class="map-edit-header-stat">${linkedDomains}/${rows.length} domains mapped · ${totalLinks} links total</span>
    <span class="map-edit-header-hint">Expand a domain to edit its MRI PMX system links</span>`;
  grid.appendChild(hdr);

  let lastModule = null;
  rows.forEach(row => {
    if (row.module !== lastModule) {
      lastModule = row.module;
      const groupEl = document.createElement('div');
      groupEl.className = 'map-edit-group-hdr';
      const cfg = BUSINESS_CONFIG[row.module] || {};
      groupEl.innerHTML = `<span class="map-edit-group-icon">${cfg.icon || ''}</span>${esc(row.moduleLabel)}`;
      grid.appendChild(groupEl);
    }
    grid.appendChild(buildDomainCard(row, sysCandidates));
  });
}

function buildDomainCard(row, sysCandidates) {
  const domainProcs = getDomainProcesses(row.domainId);
  const isExpanded  = expandedDomains.has(row.domainId);

  const card = document.createElement('div');
  card.className = `map-edit-card${row.gap ? ' map-edit-card-gap' : ''}`;

  const cardHdr = document.createElement('div');
  cardHdr.className = 'map-edit-card-hdr';

  const toggleBtn = document.createElement('button');
  toggleBtn.type = 'button';
  toggleBtn.className = 'map-edit-card-toggle';

  const titleEl = document.createElement('span');
  titleEl.className = 'map-edit-card-title';
  titleEl.textContent = row.domainTitle;

  const countEl = document.createElement('span');
  countEl.className = 'map-edit-card-count';

  const modsEl = document.createElement('span');
  modsEl.className = 'map-edit-card-mods';

  cardHdr.appendChild(toggleBtn);
  cardHdr.appendChild(titleEl);
  cardHdr.appendChild(countEl);
  cardHdr.appendChild(modsEl);

  const cardBody = document.createElement('div');
  cardBody.className = 'map-edit-card-body';
  cardBody.style.display = isExpanded ? 'block' : 'none';

  function refreshHeader() {
    const procIds = new Set(domainProcs.map(p => p.id));
    const domainLinks = getLinks().filter(l => procIds.has(l.b));
    const count = domainLinks.length;

    const linkedMods = [...new Set(domainLinks.map(l => {
      for (const mod of Object.keys(ALL_DATA)) {
        for (const col of (ALL_DATA[mod] || [])) {
          if ((col.processes || []).some(p =>
            p.id === l.s || (p.subs || []).some(s => s.id === l.s))) return mod;
        }
      }
      return null;
    }).filter(Boolean))];

    countEl.textContent = `${count} link${count !== 1 ? 's' : ''}`;
    modsEl.innerHTML = linkedMods.map(m =>
      `<span class="map-edit-mod-badge">${esc(m.toUpperCase())}</span>`).join('');
    toggleBtn.textContent = expandedDomains.has(row.domainId) ? '▾' : '▸';
  }

  cardHdr.addEventListener('click', () => {
    if (expandedDomains.has(row.domainId)) {
      expandedDomains.delete(row.domainId);
      cardBody.style.display = 'none';
    } else {
      expandedDomains.add(row.domainId);
      cardBody.style.display = 'block';
      renderCardBody();
    }
    refreshHeader();
  });

  function renderCardBody() {
    cardBody.innerHTML = '';

    if (!domainProcs.length) {
      const msg = document.createElement('div');
      msg.className = 'map-edit-empty';
      msg.textContent = 'No processes in this domain.';
      cardBody.appendChild(msg);
      return;
    }

    domainProcs.forEach(proc => {
      const procRow = document.createElement('div');
      procRow.className = 'map-proc-row';

      const nameEl = document.createElement('div');
      nameEl.className = 'map-proc-name';
      nameEl.textContent = proc.title;
      procRow.appendChild(nameEl);

      const linksArea = document.createElement('div');
      linksArea.className = 'map-proc-links';

      function refreshLinks() {
        linksArea.innerHTML = '';
        const curLinks = getLinks().filter(l => l.b === proc.id);

        if (!curLinks.length) {
          const emptyEl = document.createElement('span');
          emptyEl.className = 'map-proc-empty';
          emptyEl.textContent = 'No links';
          linksArea.appendChild(emptyEl);
        }

        curLinks.forEach(link => {
          const resolved = resolveSysFromCandidates(link.s, sysCandidates);
          if (!resolved) return;

          const chip = document.createElement('div');
          chip.className = `map-chip map-chip-${link.coverage || 'full'}`;

          const covSel = document.createElement('select');
          covSel.className = 'map-chip-cov';
          covSel.title = 'Set coverage level';
          COVERAGE_ORDER.forEach(key => {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = COVERAGE[key].short;
            if (key === (link.coverage || 'full')) opt.selected = true;
            covSel.appendChild(opt);
          });
          covSel.addEventListener('change', e => {
            e.stopPropagation();
            setLinkCoverage(proc.id, link.s, covSel.value);
            chip.className = `map-chip map-chip-${covSel.value}`;
            dirty();
          });

          const lbl = document.createElement('span');
          lbl.className = 'map-chip-label';
          lbl.textContent = `${resolved.shortMod} › ${resolved.title}`;
          lbl.title = `${resolved.label} › ${resolved.title}`;

          const delBtn = document.createElement('button');
          delBtn.type = 'button';
          delBtn.className = 'map-chip-del';
          delBtn.textContent = '×';
          delBtn.title = 'Remove this link';
          delBtn.addEventListener('click', e => {
            e.stopPropagation();
            removeLink(proc.id, link.s);
            refreshLinks();
            refreshHeader();
            dirty();
          });

          chip.appendChild(covSel);
          chip.appendChild(lbl);
          chip.appendChild(delBtn);
          linksArea.appendChild(chip);
        });

        linksArea.appendChild(buildAddCombo(proc.id, sysCandidates, () => {
          refreshLinks();
          refreshHeader();
        }));
      }

      refreshLinks();
      procRow.appendChild(linksArea);
      cardBody.appendChild(procRow);
    });
  }

  refreshHeader();
  if (isExpanded) renderCardBody();

  card.appendChild(cardHdr);
  card.appendChild(cardBody);
  return card;
}

// ── Add-link combobox (3-step drill-down: Module → Process → Sub-process) ───

function buildAddCombo(businessId, candidates, onAdded) {
  const wrap = document.createElement('div');
  wrap.className = 'map-add-wrap';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'map-add-btn';
  btn.textContent = '+ Add link';

  btn.addEventListener('click', e => {
    e.stopPropagation();
    openComboDropdown(btn, businessId, onAdded);
  });

  wrap.appendChild(btn);
  return wrap;
}

function openComboDropdown(anchor, businessId, onAdded) {
  document.querySelectorAll('.map-combo-drop').forEach(d => d.remove());

  const currentLinked = new Set(getLinks().filter(l => l.b === businessId).map(l => l.s));

  const drop = document.createElement('div');
  drop.className = 'map-combo-drop';
  document.body.appendChild(drop);

  const rect = anchor.getBoundingClientRect();
  drop.style.top  = `${rect.bottom + 4}px`;
  drop.style.left = `${rect.left}px`;

  let selectedMod  = null;
  let selectedProc = null;

  function renderStep1() {
    drop.innerHTML = `
      <div class="map-combo-hdr">Select a module</div>
      <div class="map-combo-list" id="map-combo-inner"></div>`;

    const list = drop.querySelector('#map-combo-inner');
    Object.keys(ALL_DATA).forEach(mod => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'map-combo-item map-combo-module-item';
      btn.innerHTML = `
        <span class="map-combo-item-title">${esc(MODULE_CONFIG[mod]?.label || mod)}</span>
        <span class="map-combo-item-arrow">›</span>`;
      btn.addEventListener('mousedown', e => {
        e.preventDefault(); e.stopPropagation();
        selectedMod = mod;
        renderStep2();
      });
      list.appendChild(btn);
    });
  }

  function renderStep2() {
    drop.innerHTML = `
      <div class="map-combo-nav">
        <button type="button" class="map-combo-back">‹</button>
        <span class="map-combo-nav-bc">${esc(MODULE_CONFIG[selectedMod]?.label || selectedMod)}</span>
      </div>
      <input type="text" class="map-combo-search" placeholder="Search processes…">
      <div class="map-combo-list" id="map-combo-inner"></div>`;

    drop.querySelector('.map-combo-back').addEventListener('mousedown', e => {
      e.preventDefault(); e.stopPropagation(); renderStep1();
    });

    const searchInput = drop.querySelector('.map-combo-search');
    const list = drop.querySelector('#map-combo-inner');

    function renderProcs(q) {
      list.innerHTML = '';
      const lower = q.toLowerCase();

      (ALL_DATA[selectedMod] || []).forEach(col => {
        const procs = (col.processes || []).filter(p =>
          !q ||
          p.title.toLowerCase().includes(lower) ||
          (p.subs || []).some(s => s.title.toLowerCase().includes(lower)));
        if (!procs.length) return;

        const grp = document.createElement('div');
        grp.className = 'map-combo-group';
        grp.textContent = col.title;
        list.appendChild(grp);

        procs.forEach(proc => {
          const hasSubs = (proc.subs || []).length > 0;
          const alreadyLinked = currentLinked.has(proc.id);
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'map-combo-item' + (alreadyLinked && !hasSubs ? ' map-combo-item-linked' : '');
          btn.disabled = alreadyLinked && !hasSubs;
          btn.innerHTML = `
            <span class="map-combo-item-title">${esc(proc.title)}</span>
            ${hasSubs
              ? `<span class="map-combo-item-arrow">›</span>`
              : alreadyLinked
                ? `<span class="map-combo-item-linked-badge">linked</span>`
                : ''}`;

          btn.addEventListener('mousedown', e => {
            e.preventDefault(); e.stopPropagation();
            if (hasSubs) {
              selectedProc = { ...proc, colTitle: col.title };
              renderStep3();
            } else if (!alreadyLinked) {
              addLink(businessId, proc.id, 'full');
              currentLinked.add(proc.id);
              drop.remove();
              dirty();
              onAdded();
            }
          });
          list.appendChild(btn);
        });
      });

      if (!list.children.length) {
        list.innerHTML = '<div class="map-combo-empty">No matches found</div>';
      }
    }

    renderProcs('');
    searchInput.addEventListener('input', () => renderProcs(searchInput.value.trim()));
    searchInput.focus();
  }

  function renderStep3() {
    const subs = selectedProc.subs || [];
    drop.innerHTML = `
      <div class="map-combo-nav">
        <button type="button" class="map-combo-back">‹</button>
        <span class="map-combo-nav-bc">${esc(selectedProc.title)}</span>
      </div>
      <input type="text" class="map-combo-search" placeholder="Search sub-processes…">
      <div class="map-combo-list" id="map-combo-inner"></div>`;

    drop.querySelector('.map-combo-back').addEventListener('mousedown', e => {
      e.preventDefault(); e.stopPropagation(); renderStep2();
    });

    const searchInput = drop.querySelector('.map-combo-search');
    const list = drop.querySelector('#map-combo-inner');

    function renderSubs(q) {
      list.innerHTML = '';
      const lower = q.toLowerCase();

      const procLinked = currentLinked.has(selectedProc.id);
      const procBtn = document.createElement('button');
      procBtn.type = 'button';
      procBtn.className = 'map-combo-item map-combo-proc-direct' + (procLinked ? ' map-combo-item-linked' : '');
      procBtn.disabled = procLinked;
      procBtn.innerHTML = `
        <span class="map-combo-item-bc">Link to entire process</span>
        <span class="map-combo-item-title">${esc(selectedProc.title)}</span>
        ${procLinked ? '<span class="map-combo-item-linked-badge">linked</span>' : ''}`;
      procBtn.addEventListener('mousedown', e => {
        e.preventDefault(); e.stopPropagation();
        if (!procLinked) {
          addLink(businessId, selectedProc.id, 'full');
          currentLinked.add(selectedProc.id);
          drop.remove();
          dirty();
          onAdded();
        }
      });
      list.appendChild(procBtn);

      if (subs.length) {
        const grp = document.createElement('div');
        grp.className = 'map-combo-group';
        grp.textContent = 'Sub-processes';
        list.appendChild(grp);
      }

      const filtered = q ? subs.filter(s => s.title.toLowerCase().includes(lower)) : subs;

      if (!filtered.length && q) {
        const msg = document.createElement('div');
        msg.className = 'map-combo-empty';
        msg.textContent = 'No sub-processes match';
        list.appendChild(msg);
        return;
      }

      filtered.forEach(sub => {
        const alreadyLinked = currentLinked.has(sub.id);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'map-combo-item' + (alreadyLinked ? ' map-combo-item-linked' : '');
        btn.disabled = alreadyLinked;
        btn.innerHTML = `
          <span class="map-combo-item-title">${esc(sub.title)}</span>
          ${alreadyLinked ? '<span class="map-combo-item-linked-badge">linked</span>' : ''}`;
        btn.addEventListener('mousedown', e => {
          e.preventDefault(); e.stopPropagation();
          if (!alreadyLinked) {
            addLink(businessId, sub.id, 'full');
            currentLinked.add(sub.id);
            drop.remove();
            dirty();
            onAdded();
          }
        });
        list.appendChild(btn);
      });
    }

    renderSubs('');
    searchInput.addEventListener('input', () => renderSubs(searchInput.value.trim()));
    searchInput.focus();
  }

  renderStep1();

  function closeHandler(e) {
    if (!drop.contains(e.target) && e.target !== anchor) {
      drop.remove();
      document.removeEventListener('mousedown', closeHandler);
    }
  }
  setTimeout(() => document.addEventListener('mousedown', closeHandler), 10);
}

// ── Read-only detail panel (cell click) ──────────────────────────────────────

function showCell(domainId, sysMod) {
  const pairs = cellPairs(domainId, sysMod);
  if (!pairs.length) { lastCell = null; document.getElementById('panel-overlay').classList.remove('open'); return; }
  lastCell = { domainId, sysMod };
  const domainTitle = pairs[0].b.domain.domainTitle;
  const sysLabel    = pairs[0].s.moduleLabel;

  state.openPanelId = null;
  document.getElementById('panel-bc').textContent = 'Coverage Map';
  document.getElementById('panel-title').textContent = `${domainTitle} ⇄ ${sysLabel}`;
  document.getElementById('panel-badges').innerHTML =
    `<span class="badge badge-business">Business</span><span class="badge badge-mri">MRI PMX</span>
     <span class="badge">${pairs.length} link${pairs.length > 1 ? 's' : ''}</span>`;

  // Group pairs by business process id so each biz row shows all its system chips
  const byBiz = new Map();
  pairs.forEach(p => {
    if (!byBiz.has(p.b.id)) byBiz.set(p.b.id, { biz: p.b, sys: [] });
    byBiz.get(p.b.id).sys.push({ s: p.s, coverage: p.coverage || 'full' });
  });

  // Build flow rows
  const flowRows = [...byBiz.values()].map(({ biz, sys }) => {
    const chips = sys.map(({ s, coverage }) => {
      const cov = COVERAGE[coverage] || COVERAGE.full;
      return `<button class="cell-flow-chip cell-flow-chip-${coverage}" data-xview="system" data-xid="${esc(s.id)}"
        title="${esc(s.breadcrumb)} · ${esc(coverageTooltip(coverage))}">
        <span class="cell-flow-chip-top">
          <span class="cell-flow-cov-tag cell-flow-cov-tag-${coverage}">${esc(cov.short)}</span>
          <span class="cell-flow-chip-mod">${esc(s.moduleLabel)}</span>
        </span>
        <span class="cell-flow-chip-title">${esc(s.title)}</span>
      </button>`;
    }).join('');

    return `
      <div class="cell-flow-row">
        <button class="cell-flow-biz" data-xview="business" data-xid="${esc(biz.id)}">
          <span class="cell-flow-biz-bc">${esc(biz.breadcrumb)}</span>
          <span class="cell-flow-biz-title">${esc(biz.title)}</span>
        </button>
        <span class="cell-flow-conn"><span class="cell-flow-conn-line"></span><span class="cell-flow-conn-arrow">›</span></span>
        <div class="cell-flow-sys">${chips}</div>
      </div>`;
  }).join('');

  // Legend
  const covCounts = { full: 0, partial: 0, outside: 0 };
  pairs.forEach(p => { const k = p.coverage || 'full'; if (k in covCounts) covCounts[k]++; });
  const legendParts = COVERAGE_ORDER
    .filter(k => covCounts[k] > 0)
    .map(k => `<span class="cell-flow-legend-item">
      <span class="cell-flow-pip cell-flow-pip-${k}"></span>${esc(COVERAGE[k].label)} <strong>${covCounts[k]}</strong>
    </span>`).join('');

  document.getElementById('panel-body').innerHTML = `
    <div class="psec">
      <div class="psec-label">
        Business Process → System Coverage
        <span class="xlink-count">${pairs.length}</span>
      </div>
      <div class="cell-flow-legend">${legendParts}</div>
      <div class="cell-flow-list">${flowRows}</div>
    </div>`;

  // Wire up navigation clicks — close modal then navigate to the specific item
  document.getElementById('panel-body').querySelectorAll('[data-xview]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('panel-overlay').classList.remove('open');
      onNavigate(btn.dataset.xview, btn.dataset.xid);
    });
  });

  document.getElementById('panel-overlay').classList.add('open');
}
