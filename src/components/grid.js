import { state, currentData, MODULE_CONFIG, triggerRender } from '../state.js';
import {
  linkedSystemIds, PROPOSED, isProposed, proposedTooltip,
  refreshDerivedProposals, proposedVia, derivedTooltip,
} from '../data/links.js';

/** Toggle a process's expanded (sub-processes revealed) state. */
function toggleExpand(id) {
  if (state.expandedProcs[id]) delete state.expandedProcs[id];
  else state.expandedProcs[id] = true;
  triggerRender();
}

// ── Scope config ──────────────────────────────────────────────────────────────
const SCOPE_ORDER  = [null, 'core', 'custom', 'out-of-scope'];
const SCOPE_LABELS = {
  'core':         '● CORE',
  'custom':       '● CUSTOM',
  'out-of-scope': '● OUT OF SCOPE',
};

// ── Effective scope ─────────────────────────────────────────────────────────────
// A system item's scope is its manual tag if set; otherwise, if it is NOT linked
// to any value stream it defaults to "Out of Scope (auto)" pending review. Subs
// inherit their parent process's link status.
function isConnected(item, parentProcess, linkedSet) {
  if (linkedSet.has(item.id)) return true;
  if (parentProcess) {
    return linkedSet.has(parentProcess.id) || (parentProcess.subs || []).some(s => linkedSet.has(s.id));
  }
  return (item.subs || []).some(s => linkedSet.has(s.id));
}

/** @returns {{scope: string|null, auto: boolean}} */
export function effectiveScope(item, parentProcess, linkedSet) {
  if (item.scope) return { scope: item.scope, auto: false };
  // Discovery Baseline: everything reads Untagged — suppress the auto
  // out-of-scope derivation so nothing is pre-decided before discovery.
  if (state.suppressAutoScope) return { scope: null, auto: false };
  const set = linkedSet || linkedSystemIds();
  if (isConnected(item, parentProcess, set)) return { scope: null, auto: false };
  return { scope: 'out-of-scope', auto: true };
}

/** Does an item pass the scope filter AND the "Proposed only" toggle?
 *  The two are separate axes: Proposed Scope is orthogonal to core/custom/OOS,
 *  so it narrows the selection rather than replacing it. */
function matchesScope(item, parentProcess, linkedSet, filters) {
  // The filter shows the whole proposal footprint — direct and derived — so you
  // can see everything a recommendation touches, not just where it was flagged.
  if (state.proposedOnly && !isProposed(item) && !proposedVia(item.id, 'system')) return false;
  return filters.includes(effectiveScope(item, parentProcess, linkedSet).scope || 'untagged');
}

/**
 * render(callbacks)
 * Rebuilds the taxonomy grid from current state.
 *
 * callbacks: { onItemClick, onEditClick, onRemoveItem, onAddModal, onScopeChange,
 *              onBulkTag, onProposeToggle, onBulkPropose }
 */
export function render(callbacks) {
  const { onItemClick, onEditClick, onRemoveItem, onAddModal, onScopeChange, onBulkTag,
          onProposeToggle, onBulkPropose } = callbacks;

  const grid = document.getElementById('grid');
  const cfg  = MODULE_CONFIG[state.currentTab] || {};
  grid.innerHTML = '';
  grid.className = 'grid' + (state.editMode ? ' edit-active' : '');

  // Update canvas header
  const header     = document.getElementById('main-header');
  const headerText = document.getElementById('main-header-text');
  if (header)     { header.className = 'main-header ' + (cfg.headerClass || 'cm-header'); header.style.background = ''; }
  if (headerText) headerText.textContent = cfg.headerText || cfg.label || state.currentTab;
  const existingSub = header && header.querySelector('.main-header-sub');
  if (existingSub) existingSub.remove();

  const ALL_SCOPE_KEYS = ['core', 'custom', 'out-of-scope', 'untagged'];
  const filters = Array.isArray(state.scopeFilters) ? state.scopeFilters : ALL_SCOPE_KEYS;
  const showingAll = ALL_SCOPE_KEYS.every(k => filters.includes(k)) && !state.proposedOnly;
  const linkedSet = linkedSystemIds();   // system ids linked to a value stream
  refreshDerivedProposals();             // one-hop proposal derivation, per render
  let renderedCols = 0;

  currentData().forEach(col => {
    const colEl = document.createElement('div');
    colEl.className = 'col';

    // ── Column header ──
    const colHeader = document.createElement('div');
    colHeader.className = cfg.colHeaderClass
      ? `col-header ${cfg.colHeaderClass}`
      : 'col-header';

    const titleSpan = document.createElement('span');
    titleSpan.className = 'col-header-title';
    titleSpan.textContent = col.title;
    colHeader.appendChild(titleSpan);

    // Bulk-tag dropdown (edit mode only — shown via CSS)
    const scopeWrap = document.createElement('div');
    scopeWrap.className = 'col-scope-wrap';

    const scopeBtn = document.createElement('button');
    scopeBtn.className = 'col-scope-btn';
    scopeBtn.textContent = '⚐ Tag all ▾';
    scopeWrap.appendChild(scopeBtn);

    const scopeMenu = document.createElement('div');
    scopeMenu.className = 'col-scope-menu';
    [
      { scope: 'core',         label: '● Tag all: CORE' },
      { scope: 'custom',       label: '● Tag all: CUSTOM' },
      { scope: 'out-of-scope', label: '● Tag all: OUT OF SCOPE' },
      { scope: null,           label: '✕ Clear all tags', cls: 'scope-menu-clear' },
      // Proposed Scope is a separate axis — these leave the scope tags alone.
      { propose: true,  label: `${PROPOSED.mark} Propose all`, cls: 'scope-menu-propose',
        tip: 'Mark every process in this column as Proposed Scope (Open Box recommendation). Leaves the existing scope tags intact.' },
      { propose: false, label: `${PROPOSED.mark} Clear proposals`, cls: 'scope-menu-clear',
        tip: 'Remove the Proposed Scope marker from every process in this column.' },
    ].forEach(({ scope, label, cls, propose, tip }) => {
      const btn = document.createElement('button');
      btn.textContent = label;
      if (cls) btn.className = cls;
      if (tip) btn.title = tip;
      btn.addEventListener('click', e => {
        e.stopPropagation();
        scopeMenu.classList.remove('open');
        if (propose === undefined) onBulkTag(col.id, scope);
        else onBulkPropose(col.id, propose);
      });
      scopeMenu.appendChild(btn);
    });
    scopeWrap.appendChild(scopeMenu);

    scopeBtn.addEventListener('click', e => {
      e.stopPropagation();
      // Close all other open menus first
      document.querySelectorAll('.col-scope-menu.open').forEach(m => {
        if (m !== scopeMenu) m.classList.remove('open');
      });
      scopeMenu.classList.toggle('open');
    });

    colHeader.appendChild(scopeWrap);

    // Delete column button
    const colDelBtn = document.createElement('span');
    colDelBtn.className = 'col-del-btn';
    colDelBtn.textContent = '×';
    colDelBtn.addEventListener('click', e => {
      e.stopPropagation();
      onRemoveItem('col', col.id);
    });
    colHeader.appendChild(colDelBtn);
    colEl.appendChild(colHeader);

    // ── Column body ──
    const colBody = document.createElement('div');
    colBody.className = 'col-body';
    let visibleCount = 0;

    col.processes.forEach(proc => {
      const subs    = proc.subs || [];
      const hasSubs = subs.length > 0;

      // A process shows if it, or any of its sub-processes, matches the filter.
      const procMatches = matchesScope(proc, null, linkedSet, filters);
      const subMatches  = subs.some(s => matchesScope(s, proc, linkedSet, filters));
      if (!showingAll && !procMatches && !subMatches && !state.editMode) return; // hide non-matching process

      // Collapse is respected during filtering (no force-expand).
      const expanded = !!state.expandedProcs[proc.id];
      const subToggle = hasSubs
        ? { count: subs.length, expanded, onToggle: () => toggleExpand(proc.id) }
        : null;

      colBody.appendChild(makeItemEl(proc, 'process-box', onItemClick, onEditClick,
        () => onRemoveItem('proc', col.id, proc.id),
        onScopeChange, null, linkedSet, subToggle, onProposeToggle));
      visibleCount++;

      if (expanded) {
        subs.forEach(sub => {
          if (!showingAll && !matchesScope(sub, proc, linkedSet, filters) && !state.editMode) return; // skip non-matching sub
          const cls = sub.type === 'process' ? 'process-box' : 'sub-box';
          colBody.appendChild(makeItemEl(sub, cls + ' is-nested', onItemClick, onEditClick,
            () => onRemoveItem('sub', col.id, proc.id, sub.id),
            onScopeChange, proc, linkedSet, null, onProposeToggle));
          visibleCount++;
        });
      }

      // Add sub-process button (edit mode) — when expanded, or when there are
      // no subs yet so the first one can be added.
      if (state.editMode && (expanded || !hasSubs)) {
        const addSubBtn = document.createElement('button');
        addSubBtn.className = 'add-row-btn';
        addSubBtn.textContent = '+ Add Sub-Process';
        addSubBtn.addEventListener('click', () => { state.expandedProcs[proc.id] = true; onAddModal('sub', col.id, proc.id); });
        colBody.appendChild(addSubBtn);
      }
    });

    // Hide a whole column when a scope filter is active and nothing matches
    // (in edit mode keep columns so they remain editable / can be populated).
    if (!showingAll && visibleCount === 0 && !state.editMode) {
      return; // skip this column entirely
    }

    // Add process button
    const addProcBtn = document.createElement('button');
    addProcBtn.className = 'add-row-btn';
    addProcBtn.textContent = '+ Add Process';
    addProcBtn.addEventListener('click', () => onAddModal('process', col.id));
    colBody.appendChild(addProcBtn);

    colEl.appendChild(colBody);
    grid.appendChild(colEl);
    renderedCols++;
  });

  // Grid-level empty state when the filter hides everything
  if (renderedCols === 0) {
    const msg = document.createElement('div');
    msg.className = 'empty-filter-msg grid-empty-msg';
    msg.textContent = 'No items match the selected scope(s).';
    grid.appendChild(msg);
  }

  // Equalise column header heights
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const headers = grid.querySelectorAll('.col-header');
    headers.forEach(h => { h.style.height = ''; });
    let maxH = 0;
    headers.forEach(h => { maxH = Math.max(maxH, h.offsetHeight); });
    if (maxH > 0) headers.forEach(h => { h.style.height = maxH + 'px'; });
  }));

  // Close open bulk-tag menus when clicking elsewhere
  document.addEventListener('click', () => {
    document.querySelectorAll('.col-scope-menu.open').forEach(m => m.classList.remove('open'));
  }, { once: true });

  // Update scope filter counts
  updateFilterBar();
}

// ── makeItemEl ────────────────────────────────────────────────────────────────

function makeItemEl(item, baseClass, onItemClick, onEditClick, onRemove, onScopeChange, parentProcess, linkedSet, subToggle, onProposeToggle) {
  const eff   = effectiveScope(item, parentProcess, linkedSet);
  const scope = eff.scope;   // effective scope (manual tag, or auto Out-of-Scope)
  const auto  = eff.auto;    // true when defaulted because nothing is linked

  // Visibility is decided by the caller (matching items are the only ones rendered).
  const el = document.createElement('div');
  el.className = baseClass;
  if (scope === 'out-of-scope') el.classList.add('scope-oos');
  if (auto) el.classList.add('scope-oos-auto');
  const derivedFrom = isProposed(item) ? null : proposedVia(item.id, 'system');
  if (isProposed(item))    el.classList.add('is-proposed');
  else if (derivedFrom)    el.classList.add('is-proposed-derived');
  el.dataset.id = item.id;

  // Title
  const titleSpan = document.createElement('span');
  titleSpan.className = 'card-title';
  titleSpan.textContent = item.title;
  el.appendChild(titleSpan);

  // Sub-process expand/collapse toggle (processes with subs)
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

  // Scope badge — manual tag, or the auto Out-of-Scope default (shown in all modes)
  if (scope) {
    const badge = document.createElement('span');
    badge.className = `scope-badge scope-badge-${scope}` + (auto ? ' scope-badge-auto' : '');
    badge.textContent = auto ? '○ OUT OF SCOPE' : (SCOPE_LABELS[scope] || scope);
    badge.title = auto
      ? 'Auto — not yet linked to a value stream. Review & link, or tag manually.'
      : (state.editMode ? 'Click to cycle scope' : '');
    if (state.editMode) {
      badge.addEventListener('click', e => { e.stopPropagation(); onScopeChange(item); });
    }
    el.appendChild(badge);
  } else if (state.editMode) {
    // Show a subtle "+ Tag" prompt in edit mode so it's easy to start tagging
    const badge = document.createElement('span');
    badge.className = 'scope-badge scope-badge-untagged';
    badge.textContent = '+ Tag';
    badge.title = 'Click to set scope';
    badge.addEventListener('click', e => { e.stopPropagation(); onScopeChange(item); });
    el.appendChild(badge);
  }

  // Proposed Scope marker — sits ALONGSIDE the scope badge, never replacing it,
  // so the current-state → proposed delta stays readable on the card.
  if (isProposed(item)) {
    const pb = document.createElement('span');
    pb.className = 'prop-badge';
    pb.textContent = `${PROPOSED.mark} ${PROPOSED.short.toUpperCase()}`;
    pb.title = proposedTooltip(item)
      + (state.editMode ? '\n\nClick to remove the proposal.' : '');
    if (state.editMode) {
      pb.classList.add('prop-editable');
      pb.addEventListener('click', e => { e.stopPropagation(); onProposeToggle(item); });
    }
    el.appendChild(pb);
  } else if (derivedFrom) {
    // Implied by a proposed value-stream process on the other side of a link.
    // Hollow, and not click-to-clear: there is nothing stored here to clear.
    const pb = document.createElement('span');
    pb.className = 'prop-badge prop-badge-derived';
    pb.textContent = `○ ${PROPOSED.short.toUpperCase()} (linked)`;
    pb.title = derivedTooltip(derivedFrom, 'system');
    el.appendChild(pb);
  } else if (state.editMode) {
    const pb = document.createElement('span');
    pb.className = 'prop-badge prop-badge-add prop-editable';
    pb.textContent = `${PROPOSED.mark} Propose`;
    pb.title = 'Flag as Proposed Scope — Open Box has identified potential value add here. Keeps the existing scope tag.';
    pb.addEventListener('click', e => { e.stopPropagation(); onProposeToggle(item); });
    el.appendChild(pb);
  }

  // Delete button (shown via CSS in edit mode)
  const delBtn = document.createElement('span');
  delBtn.className = 'del-btn';
  delBtn.textContent = '×';
  delBtn.addEventListener('click', e => { e.stopPropagation(); onRemove(); });
  el.appendChild(delBtn);

  el.addEventListener('click', () => {
    if (state.editMode) onEditClick(item.id);
    else onItemClick(item.id);
  });

  return el;
}

// ── Filter bar helpers ─────────────────────────────────────────────────────────

function updateFilterBar() {
  // Compute counts from effective scope (incl. auto Out-of-Scope)
  const counts = { core: 0, custom: 0, 'out-of-scope': 0, untagged: 0, auto: 0, proposed: 0, derived: 0 };
  const linkedSet = linkedSystemIds();
  const expandableIds = [];
  const tallyProp = it => {
    if (isProposed(it)) counts.proposed++;
    else if (proposedVia(it.id, 'system')) counts.derived++;
  };
  (currentData() || []).forEach(col => {
    col.processes.forEach(proc => {
      if ((proc.subs || []).length) expandableIds.push(proc.id);
      tallyEff(effectiveScope(proc, null, linkedSet), counts);
      tallyProp(proc);
      (proc.subs || []).forEach(sub => {
        tallyEff(effectiveScope(sub, proc, linkedSet), counts);
        tallyProp(sub);
      });
    });
  });

  // Expand/collapse-all button label + visibility
  const expBtn = document.getElementById('expand-all-btn');
  if (expBtn) {
    if (!expandableIds.length) {
      expBtn.style.display = 'none';
    } else {
      expBtn.style.display = '';
      const allExpanded = expandableIds.every(id => state.expandedProcs[id]);
      expBtn.textContent = allExpanded ? '⊟ Collapse all' : '⊞ Expand all';
    }
  }

  const countsEl = document.getElementById('scope-filter-counts');
  if (!countsEl) return;
  const oosLabel = counts.auto ? `OOS ${counts['out-of-scope']} (${counts.auto} auto)` : `OOS ${counts['out-of-scope']}`;
  countsEl.innerHTML = [
    counts.core         ? `<span class="scope-count-chip scope-count-core">CORE ${counts.core}</span>` : '',
    counts.custom       ? `<span class="scope-count-chip scope-count-custom">CUSTOM ${counts.custom}</span>` : '',
    counts['out-of-scope'] ? `<span class="scope-count-chip scope-count-oos">${oosLabel}</span>` : '',
    counts.untagged     ? `<span class="scope-count-chip scope-count-untag">Untagged ${counts.untagged}</span>` : '',
    counts.proposed     ? `<span class="scope-count-chip scope-count-prop" title="${PROPOSED.label}">${PROPOSED.mark} PROPOSED ${counts.proposed}</span>` : '',
    counts.derived      ? `<span class="scope-count-chip scope-count-prop-derived" title="Implied by a proposed value-stream process linked to these items.">○ LINKED ${counts.derived}</span>` : '',
  ].join('');
}

function tallyEff(eff, counts) {
  const key = eff.scope || 'untagged';
  if (key in counts) counts[key]++;
  if (eff.auto) counts.auto++;
}

// ── Public helper: get scope label for exports ─────────────────────────────────
export const SCOPE_EXPORT_LABELS = SCOPE_LABELS;
export const SCOPE_ORDER_EXPORT  = SCOPE_ORDER;
