/* ═══════════════════════════════════════════════════════════════════════════
   businessView.js — Business-process view renderer (the "what/why" perspective)

   Self-contained: reuses the shared #grid / #panel / #main-header containers but
   reads from BUSINESS_DATA and renders the business dimensions (market, vertical,
   standards). The system (MRI PMX) view is untouched. Read-only in this phase.

   Linkage to the system view (cross-references + jump-through) is layered on in
   Phase 2 via setLinkRenderer().
   ═══════════════════════════════════════════════════════════════════════════ */

import { state, snapshot } from '../state.js';
import { makeMultiSelect } from './multiSelect.js';
import { clientNoteHTML } from './clientNote.js';
import { COVERAGE, COVERAGE_ORDER, businessHasLink, coverageTooltip } from '../data/links.js';
import {
  BUSINESS_DATA, BUSINESS_CONFIG, BUSINESS_MODULES, MARKETS, VERTICALS, findBusinessItem,
} from '../data/business/index.js';

const COVERAGE_KEYS = ['full', 'partial', 'outside'];
/** Does an item match the selected coverage filter? Untagged handled explicitly. */
function matchesCoverage(item) {
  const sel = state.coverageFilters;
  if (!sel || !sel.length) return true;
  return sel.includes(item.coverage || 'untagged');
}
/** Cycle an item's coverage tag: none → full → partial → outside → none. */
function cycleCoverage(item) {
  const order = [null, 'full', 'partial', 'outside'];
  snapshot();
  item.coverage = order[(order.indexOf(item.coverage || null) + 1) % order.length];
  renderBusinessGrid();
  document.dispatchEvent(new CustomEvent('mri:versionDirty'));
}
/** True when a FULL/PARTIAL item still needs a system link (warn-but-allow). */
function coverageNeedsLink(item) {
  return (item.coverage === 'full' || item.coverage === 'partial') && !businessHasLink(item.id);
}
/** Set the coverage tag on every process + sub in a value-stream column. */
function bulkTagCoverage(col, coverage) {
  snapshot();
  col.processes.forEach(proc => {
    proc.coverage = coverage;
    (proc.subs || []).forEach(sub => { sub.coverage = coverage; });
  });
  renderBusinessGrid();
  document.dispatchEvent(new CustomEvent('mri:versionDirty'));
}

// Per-vertical colour coding (used by the filter swatch and the detail panel)
const VERTICAL_COLOURS = {
  All: 'var(--green)', Retail: '#c0440e', Industrial: '#1a5fa8',
  Office: '#5b4acb', Residential: '#1a8a4a',
};

const SECTORS = VERTICALS.filter(v => v !== 'All'); // Retail/Industrial/Office/Residential

/** Ensure the active business tab is valid (value-stream ids). */
function ensureBusinessTab() {
  if (!BUSINESS_DATA[state.businessTab]) state.businessTab = BUSINESS_MODULES[0];
}

/** Does an item match the selected verticals? Vertical-agnostic items always show. */
function matchesVerticals(item) {
  if (!item.vertical) return true;                    // no sector data → always relevant
  const sel = state.verticals;
  if (!sel || !sel.length) return true;               // nothing selected → don't hide
  if (sel.length === SECTORS.length) return true;      // all selected → show all
  return sel.some(v => item.vertical[v]);
}

// Phase-2 hook: main.js injects a function that returns link-section HTML for an
// item id (and wires click handlers). Null = no link UI yet.
let linkRenderer = null;
export function setBusinessLinkRenderer(fn) { linkRenderer = fn; }

let onSwitchBusinessTab = () => {};
let onEditItem = () => {};
let onRemoveItem = () => {};
let onAddItem = () => {};
export function initBusinessView({ onTabSwitch, onEdit, onRemove, onAdd }) {
  onSwitchBusinessTab = onTabSwitch || (() => {});
  onEditItem   = onEdit   || (() => {});
  onRemoveItem = onRemove || (() => {});
  onAddItem    = onAdd    || (() => {});
}

/** Render the value-stream tab bar (one tab per value stream, with its tag). */
function renderBusinessTabs() {
  ensureBusinessTab();
  const tabBar = document.getElementById('business-tabbar');
  tabBar.innerHTML = '';
  BUSINESS_MODULES.forEach(mod => {
    const cfg = BUSINESS_CONFIG[mod];
    const btn = document.createElement('button');
    btn.className = 'biz-tab-btn' + (mod === state.businessTab ? ' active' : '')
      + (cfg.supporting ? ' biz-tab-conditional' : '');
    btn.dataset.btab = mod;
    btn.title = cfg.note || '';
    btn.innerHTML = `<span class="tab-icon">${cfg.icon}</span>${cfg.label}`;
    btn.addEventListener('click', () => onSwitchBusinessTab(mod));
    tabBar.appendChild(btn);
  });
}

/** Render the Market / Vertical multi-select filter bar (shared component). */
function renderBusinessFilters() {
  const bar = document.getElementById('business-filterbar');
  bar.innerHTML = '';

  bar.appendChild(makeMultiSelect('Market',
    MARKETS.map(m => ({ value: m.key, label: m.label, short: m.key })),
    'markets', { onChange: refreshBusinessAfterFilter }));

  bar.appendChild(makeMultiSelect('Vertical',
    SECTORS.map(v => ({ value: v, label: v, short: v })),
    'verticals',
    { swatch: v => VERTICAL_COLOURS[v] || 'var(--border2)', onChange: refreshBusinessAfterFilter }));

  bar.appendChild(makeMultiSelect('System Coverage',
    [{ value: 'full', label: 'Full', short: 'Full' },
     { value: 'partial', label: 'Partial', short: 'Partial' },
     { value: 'outside', label: 'Outside', short: 'Outside' },
     { value: 'untagged', label: 'Untagged', short: 'Untagged' }],
    'coverageFilters',
    { swatch: v => (COVERAGE[v] ? COVERAGE[v].color : 'var(--border2)'), onChange: refreshBusinessAfterFilter }));
}

/** Refresh tabs + grid + any open panel after a filter change (popover stays). */
function refreshBusinessAfterFilter() {
  renderBusinessTabs();
  renderBusinessGrid();
  if (state.openPanelId) showBusinessPanel(state.openPanelId);
}

/** Render the full business view (tabs + filters + grid). */
export function renderBusiness() {
  renderBusinessTabs();
  renderBusinessFilters();
  renderBusinessGrid();
}

/** Render the taxonomy grid + banner for the active business module. */
function renderBusinessGrid() {
  const cfg  = BUSINESS_CONFIG[state.businessTab] || {};
  const data = BUSINESS_DATA[state.businessTab] || [];

  // Banner — colour comes from the module config (covers the expanded areas too)
  const header     = document.getElementById('main-header');
  const headerText = document.getElementById('main-header-text');
  if (header) {
    header.className = 'main-header';
    header.style.background = cfg.color || '#2d4a0a';
  }
  if (headerText) headerText.textContent = cfg.label;

  const grid = document.getElementById('grid');
  grid.className = 'grid' + (state.editMode ? ' edit-active' : '');
  grid.innerHTML = '';

  const edit = state.editMode;

  data.forEach(col => {
    const colEl = document.createElement('div');
    colEl.className = 'col';

    const colHeader = document.createElement('div');
    colHeader.className = 'col-header biz-col-header';
    if (col.note) colHeader.title = col.note;   // L2 hover tooltip
    colHeader.innerHTML = `<span class="col-header-title">${col.title}</span>`;
    if (edit) {
      // Bulk-tag coverage dropdown (mirrors the system view's "Tag all")
      const scopeWrap = document.createElement('div');
      scopeWrap.className = 'col-scope-wrap';

      const scopeBtn = document.createElement('button');
      scopeBtn.className = 'col-scope-btn';
      scopeBtn.textContent = '⚐ Tag all ▾';
      scopeWrap.appendChild(scopeBtn);

      const scopeMenu = document.createElement('div');
      scopeMenu.className = 'col-scope-menu';
      [
        { cov: 'full',    label: '● Tag all: FULL' },
        { cov: 'partial', label: '● Tag all: PARTIAL' },
        { cov: 'outside', label: '● Tag all: OUTSIDE' },
        { cov: null,      label: '✕ Clear all tags', cls: 'scope-menu-clear' },
      ].forEach(({ cov, label, cls }) => {
        const b = document.createElement('button');
        b.textContent = label;
        b.title = cov ? coverageTooltip(cov) : 'Remove the system-coverage tag from every process in this domain.';
        if (cls) b.className = cls;
        b.addEventListener('click', e => {
          e.stopPropagation();
          scopeMenu.classList.remove('open');
          bulkTagCoverage(col, cov);
        });
        scopeMenu.appendChild(b);
      });
      scopeWrap.appendChild(scopeMenu);

      scopeBtn.addEventListener('click', e => {
        e.stopPropagation();
        document.querySelectorAll('.col-scope-menu.open').forEach(m => {
          if (m !== scopeMenu) m.classList.remove('open');
        });
        scopeMenu.classList.toggle('open');
      });
      colHeader.appendChild(scopeWrap);

      const del = document.createElement('span');
      del.className = 'col-del-btn';
      del.textContent = '×';
      del.title = 'Remove domain';
      del.addEventListener('click', e => { e.stopPropagation(); onRemoveItem('col', col.id); });
      colHeader.appendChild(del);
    }
    colEl.appendChild(colHeader);

    const colBody = document.createElement('div');
    colBody.className = 'col-body';
    let visible = 0;

    col.processes.forEach(proc => {
      // A process shows if it (or any of its subs) matches the vertical +
      // coverage selection.
      const procMatches = matchesVerticals(proc) && matchesCoverage(proc);
      const subs = proc.subs || [];
      const matchingSubs = subs.filter(s => matchesVerticals(s) && matchesCoverage(s));
      // In edit mode show everything (so empty processes can be edited/filled).
      if (!edit && !procMatches && matchingSubs.length === 0) return;

      const hasSubs  = subs.length > 0;
      const expanded = !!state.expandedProcs[proc.id];
      const subToggle = hasSubs
        ? { count: subs.length, expanded, onToggle: () => toggleBizExpand(proc.id) }
        : null;

      colBody.appendChild(makeBizCard(proc, 'process-box biz-card', true, col.id, null, subToggle));
      visible++;

      if (expanded) {
        subs.forEach(sub => {
          if (!edit && !matchesVerticals(sub)) return;
          colBody.appendChild(makeBizCard(sub, 'sub-box biz-card is-nested', false, col.id, proc.id, null));
          visible++;
        });
      }

      if (edit && (expanded || !hasSubs)) {
        const addSub = document.createElement('button');
        addSub.className = 'add-row-btn';
        addSub.textContent = '+ Add Sub-Process';
        addSub.addEventListener('click', () => { state.expandedProcs[proc.id] = true; onAddItem('sub', col.id, proc.id); });
        colBody.appendChild(addSub);
      }
    });

    if (visible === 0 && !edit) {
      const msg = document.createElement('div');
      msg.className = 'empty-filter-msg';
      msg.textContent = 'No items for this vertical';
      colBody.appendChild(msg);
    }

    if (edit) {
      const addProc = document.createElement('button');
      addProc.className = 'add-row-btn';
      addProc.textContent = '+ Add Process';
      addProc.addEventListener('click', () => onAddItem('process', col.id));
      colBody.appendChild(addProc);
    }

    colEl.appendChild(colBody);
    grid.appendChild(colEl);
  });

  if (edit) {
    const addColEl = document.createElement('div');
    addColEl.className = 'col col-add-domain';
    const btn = document.createElement('button');
    btn.className = 'add-row-btn add-domain-btn';
    btn.textContent = '+ Add Domain';
    btn.addEventListener('click', () => onAddItem('col'));
    addColEl.appendChild(btn);
    grid.appendChild(addColEl);
  }

  // Close open bulk-tag menus when clicking elsewhere
  document.addEventListener('click', () => {
    document.querySelectorAll('.col-scope-menu.open').forEach(m => m.classList.remove('open'));
  }, { once: true });

  // Equalise column header heights (same as system grid)
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const headers = grid.querySelectorAll('.col-header');
    headers.forEach(h => { h.style.height = ''; });
    let maxH = 0;
    headers.forEach(h => { maxH = Math.max(maxH, h.offsetHeight); });
    if (maxH > 0) headers.forEach(h => { h.style.height = maxH + 'px'; });
  }));
}

/** Toggle a business process's expanded (sub-processes revealed) state. */
function toggleBizExpand(id) {
  if (state.expandedProcs[id]) delete state.expandedProcs[id];
  else state.expandedProcs[id] = true;
  renderBusinessGrid();
}

function makeBizCard(item, baseClass, isProcess, colId, procId, subToggle) {
  const el = document.createElement('div');
  el.className = baseClass;
  el.dataset.id = item.id;

  const title = document.createElement('span');
  title.className = 'card-title';
  title.textContent = item.title;
  el.appendChild(title);

  // Sub-process expand/collapse toggle
  if (subToggle) {
    el.classList.add('has-subs');
    const tog = document.createElement('span');
    tog.className = 'sub-toggle' + (subToggle.expanded ? ' open' : '');
    tog.textContent = (subToggle.expanded ? '− ' : '+ ') + subToggle.count;
    tog.title = subToggle.expanded
      ? 'Collapse sub-processes'
      : `Show ${subToggle.count} sub-process${subToggle.count > 1 ? 'es' : ''}`;
    tog.addEventListener('click', e => { e.stopPropagation(); subToggle.onToggle(); });
    el.appendChild(tog);
  }

  // Coverage tag (FULL / PARTIAL / OUTSIDE) — process cards only
  if (isProcess) {
    if (item.coverage) {
      const cov = COVERAGE[item.coverage];
      const badge = document.createElement('span');
      badge.className = 'cov-badge';
      badge.style.setProperty('--cov', cov.color);
      badge.textContent = cov.short;
      if (state.editMode) {
        badge.classList.add('cov-editable');
        badge.title = coverageTooltip(item.coverage) + '\n\nClick to change system coverage.';
        badge.addEventListener('click', e => { e.stopPropagation(); cycleCoverage(item); });
      } else {
        badge.title = coverageTooltip(item.coverage);
      }
      el.appendChild(badge);
    } else if (state.editMode) {
      const badge = document.createElement('span');
      badge.className = 'cov-badge cov-editable cov-badge-untagged';
      badge.textContent = '+ Coverage';
      badge.title = 'Set system coverage — how much of this process lives in MRI PMX (Full / Partial / Outside). Click to set.';
      badge.addEventListener('click', e => { e.stopPropagation(); cycleCoverage(item); });
      el.appendChild(badge);
    }
    // Warn when FULL/PARTIAL but not yet linked to a system process
    if (coverageNeedsLink(item)) {
      const warn = document.createElement('span');
      warn.className = 'cov-warn';
      warn.textContent = '⚠ link needed';
      warn.title = 'Tagged Full/Partial but not linked to any MRI PMX system process';
      el.appendChild(warn);
    }
  }

  // Standards chips give an at-a-glance signal of the regulatory weight
  if (item.standards && item.standards.length) {
    const chip = document.createElement('span');
    chip.className = 'biz-std-count';
    chip.textContent = item.standards.length + ' std';
    chip.title = item.standards.join(' · ');
    el.appendChild(chip);
  }
  // Flag cards seeded from the reference guide that still need enrichment
  if (item.needsEnrichment) {
    const flag = document.createElement('span');
    flag.className = 'biz-enrich-flag';
    flag.textContent = 'enrich';
    flag.title = 'Seeded from the reference guide — Market / Vertical / Standards detail to be added';
    el.appendChild(flag);
  }

  if (state.editMode) {
    const del = document.createElement('span');
    del.className = 'del-btn';
    del.textContent = '×';
    del.addEventListener('click', e => {
      e.stopPropagation();
      onRemoveItem(isProcess ? 'process' : 'sub', colId, isProcess ? item.id : procId, isProcess ? null : item.id);
    });
    el.appendChild(del);
    el.addEventListener('click', () => onEditItem(item.id));
  } else {
    el.addEventListener('click', () => showBusinessPanel(item.id));
  }
  return el;
}

// ── Detail panel ────────────────────────────────────────────────────────────

export function showBusinessPanel(id) {
  const found = findBusinessItem(id);
  if (!found) return;
  const { item, breadcrumb, isProcess } = found;
  state.openPanelId = id;

  document.getElementById('panel-bc').textContent = breadcrumb;
  document.getElementById('panel-title').textContent = item.title;
  const covBadge = item.coverage
    ? `<span class="badge" style="background:${COVERAGE[item.coverage].color};color:#fff" title="System coverage: ${coverageTooltip(item.coverage)}">${COVERAGE[item.coverage].short}</span>`
    : '';
  document.getElementById('panel-badges').innerHTML =
    `<span class="badge ${isProcess ? 'badge-process' : 'badge-sub'}">${isProcess ? 'Process' : 'Sub-Process'}</span>
     <span class="badge badge-business">Business</span>${covBadge}`
     + (item.needsEnrichment ? '<span class="badge badge-enrich">Needs enrichment</span>' : '')
     + (coverageNeedsLink(item) ? '<span class="badge badge-enrich" title="Tagged Full/Partial but not linked to a system process">⚠ link needed</span>' : '');

  let html = `
    <div class="psec">
      <div class="psec-label">Overview</div>
      <p class="psec-text">${item.desc || ''}</p>
    </div>`;

  if (item.activities && item.activities.length) {
    html += `
    <div class="psec">
      <div class="psec-label">Core Activities</div>
      <ul class="act-list">${item.activities.map(a => `<li>${a}</li>`).join('')}</ul>
    </div>`;
  }

  html += clientNoteHTML(item);

  // Market Variation — one block per selected market that has content
  if (item.market) {
    (state.markets || []).forEach(k => {
      if (!item.market[k]) return;
      const label = (MARKETS.find(m => m.key === k) || {}).label || k;
      html += `
    <div class="psec">
      <div class="psec-label">Market Variation — ${label}</div>
      <div class="biz-market-block">${item.market[k]}</div>
    </div>`;
    });
  }

  // Vertical Detail — one colour-tagged row per selected sector that has content
  if (item.vertical) {
    const sel = (state.verticals && state.verticals.length) ? state.verticals : SECTORS;
    const rows = sel.filter(v => item.vertical[v]).map(v =>
      `<div class="biz-vert-row"><span class="biz-vert-tag vert-${v.toLowerCase()}">${v}</span><span>${item.vertical[v]}</span></div>`).join('');
    if (rows) {
      html += `
    <div class="psec">
      <div class="psec-label">Vertical Detail</div>
      ${rows}
    </div>`;
    }
  }

  if (item.standards && item.standards.length) {
    html += `
    <div class="psec">
      <div class="psec-label">Standards &amp; Frameworks</div>
      <div class="biz-std-grid">${item.standards.map(s => `<span class="biz-std-chip">${s}</span>`).join('')}</div>
    </div>`;
  }

  // Value-stream context (name + note)
  const vsCfg = BUSINESS_CONFIG[found.module] || {};
  if (vsCfg.note || vsCfg.label) {
    html += `<div class="psec">
      <div class="psec-label">Value Stream</div>
      <div class="biz-stream-class">
        <span class="biz-stream-mark">${vsCfg.icon || ''}</span>
        <div>
          <div class="biz-stream-name">${vsCfg.label}${vsCfg.supporting ? ' <span class="biz-stream-supporting">supporting</span>' : ''}</div>
          ${vsCfg.note ? `<div class="biz-stream-note">${vsCfg.note}</div>` : ''}
        </div>
      </div>
    </div>`;
  }

  if (item.needsEnrichment) {
    html += `<div class="psec"><div class="biz-enrich-note">⚠ Powered L3 process — Market, Vertical and Standards detail to be added during discovery. Use Edit Mode to enrich, and the System view linkage to map it to MRI PMX.</div></div>`;
  }

  // Phase-2 linkage section (system cross-references)
  if (linkRenderer) {
    const linkHtml = linkRenderer(id, 'business');
    if (linkHtml) html += linkHtml;
  }

  document.getElementById('panel-body').innerHTML = html;
  document.getElementById('panel-overlay').classList.add('open');
}
