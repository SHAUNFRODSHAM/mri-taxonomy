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

// ── Helpers ─────────────────────────────────────────────────────────────────

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

// ── Main entry ───────────────────────────────────────────────────────────────

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

  renderMappingFlowView(grid, rows);
}

// ── Read-only flow view ───────────────────────────────────────────────────────

function renderMappingFlowView(grid, rows) {
  grid.className = 'grid grid-mapping-flow';
  grid.innerHTML = '';

  // Build link lookup: bizId → [{sysId, coverage}]
  const links = getLinks();
  const linkMap = {};
  links.forEach(l => {
    if (!linkMap[l.b]) linkMap[l.b] = [];
    linkMap[l.b].push({ sysId: l.s, coverage: l.coverage || 'full' });
  });

  // System process lookup by id
  const sysCandidates = buildSystemCandidates();
  const sysLookup = {};
  sysCandidates.forEach(c => { sysLookup[c.id] = c; });

  // Stats
  const allBizIds = new Set();
  rows.forEach(r => getDomainProcesses(r.domainId).forEach(p => allBizIds.add(p.id)));
  const mappedCount = [...allBizIds].filter(id => linkMap[id]?.length).length;
  const gapCount    = allBizIds.size - mappedCount;

  // ── Summary bar ──
  const summaryEl = document.createElement('div');
  summaryEl.className = 'map-flow-summary';
  summaryEl.innerHTML = `
    <span class="map-flow-summary-stat">${mappedCount} <span>linked</span></span>
    <span class="map-flow-summary-gap">${gapCount} <span>gaps</span></span>
    <span class="map-flow-summary-legend">
      <span class="map-flow-cov-pip map-flow-cov-pip-full"></span>Full
      <span class="map-flow-cov-pip map-flow-cov-pip-partial"></span>Partial
      <span class="map-flow-cov-pip map-flow-cov-pip-outside"></span>Outside system
      <span class="map-flow-cov-pip map-flow-cov-pip-gap"></span>Gap — no link defined
    </span>`;
  grid.appendChild(summaryEl);

  // ── Column headers (pinned) ──
  const colHdr = document.createElement('div');
  colHdr.className = 'map-flow-col-hdr';
  colHdr.innerHTML = `
    <div class="map-flow-col-biz">Business Process</div>
    <div class="map-flow-col-conn"></div>
    <div class="map-flow-col-sys">MRI PMX System Coverage</div>`;
  grid.appendChild(colHdr);

  // ── Value stream sections ──
  let lastModule = null;
  let sectionEl  = null;

  rows.forEach(row => {
    const domainProcs = getDomainProcesses(row.domainId);
    if (!domainProcs.length) return;

    // Value stream section header
    if (row.module !== lastModule) {
      lastModule = row.module;
      const cfg = BUSINESS_CONFIG[row.module] || {};
      sectionEl = document.createElement('div');
      sectionEl.className = 'map-flow-section';

      const sHdr = document.createElement('div');
      sHdr.className = 'map-flow-section-hdr';
      sHdr.innerHTML = `
        <span class="map-flow-section-icon">${cfg.icon || '●'}</span>
        <span class="map-flow-section-title">${esc(row.moduleLabel)}</span>
        <span class="map-flow-section-tag">Value Stream</span>`;
      sectionEl.appendChild(sHdr);
      grid.appendChild(sectionEl);
    }

    // Domain block
    const domainEl = document.createElement('div');
    domainEl.className = 'map-flow-domain' + (row.gap ? ' map-flow-domain-gap' : '');

    const domainHdr = document.createElement('div');
    domainHdr.className = 'map-flow-domain-hdr';
    domainHdr.innerHTML = `<span class="map-flow-domain-title">${esc(row.domainTitle)}</span>`;
    domainEl.appendChild(domainHdr);

    // Process rows
    domainProcs.forEach(proc => {
      const procLinks = linkMap[proc.id] || [];
      const isGap = procLinks.length === 0;

      const rowEl = document.createElement('div');
      rowEl.className = 'map-flow-row' + (isGap ? ' map-flow-row-gap' : '');

      // Business side
      const bizEl = document.createElement('div');
      bizEl.className = 'map-flow-biz';
      bizEl.innerHTML = `<span class="map-flow-biz-title">${esc(proc.title)}</span>`;

      // Connector
      const connEl = document.createElement('div');
      connEl.className = 'map-flow-conn' + (isGap ? ' map-flow-conn-gap' : '');
      connEl.innerHTML = isGap
        ? `<span class="map-flow-conn-line map-flow-conn-line-gap"></span>`
        : `<span class="map-flow-conn-line"></span><span class="map-flow-conn-arrow">›</span>`;

      // System side
      const sysEl = document.createElement('div');
      sysEl.className = 'map-flow-sys';

      if (isGap) {
        sysEl.innerHTML = `<span class="map-flow-gap-label">⚠ No system coverage defined</span>`;
      } else {
        procLinks.forEach(link => {
          const resolved = sysLookup[link.sysId];
          if (!resolved) return;

          const chip = document.createElement('div');
          chip.className = `map-flow-chip map-flow-chip-${link.coverage}`;
          chip.title = `${MODULE_CONFIG[resolved.mod]?.label || resolved.mod} › ${resolved.label.split(' › ').slice(1).join(' › ')} › ${resolved.title}`;
          chip.innerHTML = `
            <span class="map-flow-cov-tag map-flow-cov-tag-${link.coverage}">${COVERAGE[link.coverage]?.short || link.coverage}</span>
            <span class="map-flow-chip-mod">${esc(resolved.mod.toUpperCase())}</span>
            <span class="map-flow-chip-sep">·</span>
            <span class="map-flow-chip-title">${esc(resolved.title)}</span>`;

          chip.addEventListener('click', () => {
            onNavigate('system', resolved.mod, resolved.id);
          });
          sysEl.appendChild(chip);
        });
      }

      rowEl.appendChild(bizEl);
      rowEl.appendChild(connEl);
      rowEl.appendChild(sysEl);
      domainEl.appendChild(rowEl);
    });

    sectionEl.appendChild(domainEl);
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

  // ── Card header elements ──
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

  // ── Card body ──
  const cardBody = document.createElement('div');
  cardBody.className = 'map-edit-card-body';
  cardBody.style.display = isExpanded ? 'block' : 'none';

  // ── Header refresh (count + module badges + toggle icon) ──
  function refreshHeader() {
    const procIds = new Set(domainProcs.map(p => p.id));
    const domainLinks = getLinks().filter(l => procIds.has(l.b));
    const count = domainLinks.length;

    // Unique system modules referenced
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

  // ── Toggle expand / collapse ──
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

  // ── Card body: process rows ──
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

          // Coverage dropdown
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

          // Label
          const lbl = document.createElement('span');
          lbl.className = 'map-chip-label';
          lbl.textContent = `${resolved.shortMod} › ${resolved.title}`;
          lbl.title = `${resolved.label} › ${resolved.title}`;

          // Remove button
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

        // Add-link combobox
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
  let selectedProc = null; // { id, title, subs, colTitle }

  // ── Step 1: Module list ──────────────────────────────────────────────────
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

  // ── Step 2: Process list (grouped by column) ─────────────────────────────
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

  // ── Step 3: Sub-process list (+ option to link process directly) ─────────
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

      // Link to the process itself
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

      // Sub-processes
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

  const covBadge = (cov) => {
    if (!cov || !COVERAGE[cov]) return '';
    const c = COVERAGE[cov];
    return `<span class="cov-badge" style="--cov:${c.color}" title="System coverage: ${esc(coverageTooltip(cov))}">${esc(c.short)}</span>`;
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

  document.getElementById('panel-overlay').classList.add('open');
}
