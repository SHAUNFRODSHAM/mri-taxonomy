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
import { marketNoteHTML } from './marketNote.js';
import {
  COVERAGE, COVERAGE_ORDER, businessHasLink, coverageTooltip,
  PROPOSED, isProposed, proposedTooltip, businessHasProposedLink,
  refreshDerivedProposals, proposedVia, derivedTooltip,
} from '../data/links.js';
import { MARKETS, matchesMarkets } from '../data/markets.js';
import {
  BUSINESS_DATA, BUSINESS_CONFIG, BUSINESS_MODULES, VERTICALS, findBusinessItem,
} from '../data/business/index.js';

const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const COVERAGE_KEYS = ['full', 'partial', 'outside'];
/** Does an item match the selected coverage filter? Untagged handled explicitly.
 *  Exported so the document export can filter identically to the on-screen grid. */
export function matchesCoverage(item) {
  // Proposed Scope is an orthogonal axis, so it narrows the coverage selection
  // rather than being one of its values.
  // Shows the whole proposal footprint — direct and link-derived.
  if (state.proposedOnly && !isProposed(item) && !proposedVia(item.id, 'business')) return false;
  const sel = state.coverageFilters;
  if (!sel || !sel.length) return true;
  return sel.includes(item.coverage || 'untagged');
}

/** Toggle an item's Proposed Scope marker. Leaves the coverage tag untouched —
 *  the delta between "what happens today" and "what we propose" is the point. */
function toggleProposed(item) {
  snapshot();
  if (item.proposed) { delete item.proposed; delete item.proposed_note; }
  else item.proposed = true;
  renderBusinessGrid();
  document.dispatchEvent(new CustomEvent('mri:versionDirty'));
}

/** Mark/clear Proposed Scope on every process + sub in a value-stream column. */
function bulkProposeCoverage(col, proposed) {
  snapshot();
  col.processes.forEach(proc => {
    const apply = it => {
      if (proposed) it.proposed = true;
      else { delete it.proposed; delete it.proposed_note; }
    };
    apply(proc);
    (proc.subs || []).forEach(apply);
  });
  renderBusinessGrid();
  document.dispatchEvent(new CustomEvent('mri:versionDirty'));
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

/** Does an item match the selected verticals? Vertical-agnostic items always show.
 *  Exported alongside matchesCoverage so exports mirror the grid's filtering. */
export function matchesVerticals(item) {
  if (!item.vertical) return true;                    // no sector data → always relevant
  const sel = state.verticals;
  if (!sel || !sel.length) return true;               // nothing selected → don't hide
  if (sel.length === SECTORS.length) return true;      // all selected → show all
  return sel.some(v => item.vertical[v]);
}

/** The full business-grid filter: market applicability + vertical + coverage.
 *  Exported so the document export filters identically to the on-screen grid. */
export function matchesItem(item) {
  return matchesMarkets(item) && matchesVerticals(item) && matchesCoverage(item);
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

  bar.appendChild(makeProposedToggle(refreshBusinessAfterFilter));
}

/** "Proposed Scope only" toggle — a separate axis from System Coverage, so it is
 *  a single toggle rather than another value in that multi-select. Shared by both
 *  views (the System view mounts the same control). */
export function makeProposedToggle(onChange) {
  const btn = document.createElement('button');
  btn.className = 'prop-filter-btn' + (state.proposedOnly ? ' active' : '');
  btn.textContent = `${PROPOSED.mark} Proposed Scope`;
  btn.title = state.proposedOnly
    ? 'Showing only items Open Box has proposed. Click to show everything.'
    : `Show only Proposed Scope items — ${PROPOSED.desc}`;
  btn.addEventListener('click', () => {
    state.proposedOnly = !state.proposedOnly;
    onChange();
  });
  return btn;
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
  if (headerText) {
    headerText.textContent = cfg.label;
    let sub = header.querySelector('.main-header-sub');
    if (cfg.note) {
      if (!sub) { sub = document.createElement('div'); sub.className = 'main-header-sub'; header.appendChild(sub); }
      sub.textContent = cfg.note;
    } else if (sub) {
      sub.remove();
    }
  }

  const grid = document.getElementById('grid');
  grid.className = 'grid' + (state.editMode ? ' edit-active' : '');
  grid.innerHTML = '';

  refreshDerivedProposals();   // one-hop proposal derivation, per render
  const edit = state.editMode;

  data.forEach(col => {
    const colEl = document.createElement('div');
    colEl.className = 'col';

    const colHeader = document.createElement('div');
    colHeader.className = 'col-header biz-col-header';
    if (col.note) colHeader.title = col.note;   // L2 hover tooltip
    colHeader.innerHTML = `<span class="col-header-title">${esc(col.title)}</span>`;
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
        // Proposed Scope — separate axis, leaves the coverage tags alone.
        { propose: true,  label: `${PROPOSED.mark} Propose all`, cls: 'scope-menu-propose',
          tip: 'Mark every process in this domain as Proposed Scope (Open Box recommendation). Keeps the existing coverage tags.' },
        { propose: false, label: `${PROPOSED.mark} Clear proposals`, cls: 'scope-menu-clear',
          tip: 'Remove the Proposed Scope marker from every process in this domain.' },
      ].forEach(({ cov, label, cls, propose, tip }) => {
        const b = document.createElement('button');
        b.textContent = label;
        b.title = tip || (cov ? coverageTooltip(cov) : 'Remove the system-coverage tag from every process in this domain.');
        if (cls) b.className = cls;
        b.addEventListener('click', e => {
          e.stopPropagation();
          scopeMenu.classList.remove('open');
          if (propose === undefined) bulkTagCoverage(col, cov);
          else bulkProposeCoverage(col, propose);
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
      // Market applicability gates the whole subtree: a sub inherits its
      // parent's markets, so an out-of-market process hides its subs too.
      if (!edit && !matchesMarkets(proc)) return;
      // Otherwise a process shows if it (or any of its subs) matches the
      // market + vertical + coverage selection.
      const procMatches = matchesItem(proc);
      const subs = proc.subs || [];
      const matchingSubs = subs.filter(matchesItem);
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
          if (!edit && !matchesItem(sub)) return;
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
      msg.textContent = 'No items match the selected filters';
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
  const derivedFrom = isProposed(item) ? null : proposedVia(item.id, 'business');
  if (isProposed(item))  el.classList.add('is-proposed');
  else if (derivedFrom)  el.classList.add('is-proposed-derived');
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
    // Warn when FULL/PARTIAL but not yet linked to a system process. A PROPOSED
    // link is not an answer here — it is our recommendation, not agreed scope —
    // so the warning stands, but we say so rather than looking like a plain gap.
    if (coverageNeedsLink(item)) {
      const warn = document.createElement('span');
      warn.className = 'cov-warn';
      if (businessHasProposedLink(item.id)) {
        warn.textContent = '⚠ proposed link only';
        warn.title = 'Tagged Full/Partial with no agreed MRI PMX link — only a proposed (Open Box recommended) link exists.';
      } else {
        warn.textContent = '⚠ link needed';
        warn.title = 'Tagged Full/Partial but not linked to any MRI PMX system process';
      }
      el.appendChild(warn);
    }

    // Proposed Scope marker — rendered alongside the coverage badge so the card
    // reads "Outside today ✦ PROPOSED", which is the value-add story in one line.
    if (isProposed(item)) {
      const pb = document.createElement('span');
      pb.className = 'prop-badge';
      pb.textContent = `${PROPOSED.mark} ${PROPOSED.short.toUpperCase()}`;
      pb.title = proposedTooltip(item) + (state.editMode ? '\n\nClick to remove the proposal.' : '');
      if (state.editMode) {
        pb.classList.add('prop-editable');
        pb.addEventListener('click', e => { e.stopPropagation(); toggleProposed(item); });
      }
      el.appendChild(pb);
    } else if (derivedFrom) {
      // Implied by a proposed MRI PMX process linked to this card.
      const pb = document.createElement('span');
      pb.className = 'prop-badge prop-badge-derived';
      pb.textContent = `○ ${PROPOSED.short.toUpperCase()} (linked)`;
      pb.title = derivedTooltip(derivedFrom, 'business');
      el.appendChild(pb);
    } else if (state.editMode) {
      const pb = document.createElement('span');
      pb.className = 'prop-badge prop-badge-add prop-editable';
      pb.textContent = `${PROPOSED.mark} Propose`;
      pb.title = 'Flag as Proposed Scope — Open Box has identified potential value add here. Keeps the existing coverage tag.';
      pb.addEventListener('click', e => { e.stopPropagation(); toggleProposed(item); });
      el.appendChild(pb);
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
     + (isProposed(item)
         ? `<span class="badge badge-proposed" title="${PROPOSED.desc}">${PROPOSED.mark} ${PROPOSED.short}</span>`
         : (proposedVia(item.id, 'business')
             ? `<span class="badge badge-proposed-derived" title="${esc(derivedTooltip(proposedVia(item.id, 'business'), 'business'))}">○ ${PROPOSED.short} (linked)</span>` : ''))
     + (item.needsEnrichment ? '<span class="badge badge-enrich">Needs enrichment</span>' : '')
     + (coverageNeedsLink(item) ? '<span class="badge badge-enrich" title="Tagged Full/Partial but not linked to a system process">⚠ link needed</span>' : '');

  let html = `
    <div class="psec">
      <div class="psec-label">Overview</div>
      <p class="psec-text">${esc(item.desc || '')}</p>
    </div>`;

  // Open Box proposal — stated up front, and explicitly labelled as ours so it
  // can never be mistaken for agreed client scope.
  if (isProposed(item)) {
    html += `
    <div class="psec psec-proposed">
      <div class="psec-label">${PROPOSED.mark} Proposed Scope — Open Box recommendation</div>
      <p class="psec-text">${item.proposed_note
        ? esc(item.proposed_note)
        : '<em>No rationale captured yet. Add the value add identified in discovery via Edit Mode.</em>'}</p>
      <p class="psec-note">Current state: ${item.coverage
        ? COVERAGE[item.coverage].label
        : 'untagged'}. This is an Open Box recommendation, not agreed scope.</p>
    </div>`;
  } else {
    // Derived: implied by a proposed MRI PMX process on the other side of a link.
    const via = proposedVia(item.id, 'business');
    if (via) {
      html += `
    <div class="psec psec-proposed psec-proposed-derived">
      <div class="psec-label">○ Proposed Scope (linked)</div>
      <p class="psec-text">This process is not itself proposed, but it is linked to
        ${via.length > 1 ? 'MRI PMX processes that are' : 'an MRI PMX process that is'}:</p>
      <ul class="act-list">${via.map(o =>
        `<li>${esc(o.moduleLabel)} › ${esc(o.title)}${o.note ? ` — ${esc(o.note)}` : ''}</li>`).join('')}</ul>
      <p class="psec-note">Shown as part of that proposal. Flag this process directly if it
        warrants a separate case.</p>
    </div>`;
    }
  }

  if (item.activities && item.activities.length) {
    html += `
    <div class="psec">
      <div class="psec-label">Core Activities</div>
      <ul class="act-list">${item.activities.map(a => `<li>${esc(a)}</li>`).join('')}</ul>
    </div>`;
  }

  html += clientNoteHTML(item);

  // Market Notes — one block per selected market that has content
  html += marketNoteHTML(item);

  // Vertical Detail — one colour-tagged row per selected sector that has content
  if (item.vertical) {
    const sel = (state.verticals && state.verticals.length) ? state.verticals : SECTORS;
    const rows = sel.filter(v => item.vertical[v]).map(v =>
      `<div class="biz-vert-row"><span class="biz-vert-tag vert-${v.toLowerCase()}">${esc(v)}</span><span>${esc(item.vertical[v])}</span></div>`).join('');
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
      <div class="biz-std-grid">${item.standards.map(s => `<span class="biz-std-chip">${esc(s)}</span>`).join('')}</div>
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
