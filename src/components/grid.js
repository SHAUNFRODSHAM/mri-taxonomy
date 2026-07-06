import { state, currentData, MODULE_CONFIG } from '../state.js';
import { linkedSystemIds } from '../data/links.js';

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
  const set = linkedSet || linkedSystemIds();
  if (item.scope) return { scope: item.scope, auto: false };
  if (isConnected(item, parentProcess, set)) return { scope: null, auto: false };
  return { scope: 'out-of-scope', auto: true };
}

/**
 * render(callbacks)
 * Rebuilds the taxonomy grid from current state.
 *
 * callbacks: { onItemClick, onEditClick, onRemoveItem, onAddModal, onScopeChange, onBulkTag }
 */
export function render(callbacks) {
  const { onItemClick, onEditClick, onRemoveItem, onAddModal, onScopeChange, onBulkTag } = callbacks;

  const grid = document.getElementById('grid');
  const cfg  = MODULE_CONFIG[state.currentTab] || {};
  grid.innerHTML = '';
  grid.classList.toggle('edit-active', state.editMode);

  // Update canvas header
  const header     = document.getElementById('main-header');
  const headerText = document.getElementById('main-header-text');
  if (header)     { header.className = 'main-header ' + (cfg.headerClass || 'cm-header'); header.style.background = ''; }
  if (headerText) headerText.textContent = cfg.headerText || cfg.label || state.currentTab;

  const ALL_SCOPE_KEYS = ['core', 'custom', 'out-of-scope', 'untagged'];
  const filters = Array.isArray(state.scopeFilters) ? state.scopeFilters : ALL_SCOPE_KEYS;
  const showingAll = ALL_SCOPE_KEYS.every(k => filters.includes(k));
  const linkedSet = linkedSystemIds();   // system ids linked to a value stream
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
    ].forEach(({ scope, label, cls }) => {
      const btn = document.createElement('button');
      btn.textContent = label;
      if (cls) btn.className = cls;
      btn.addEventListener('click', e => {
        e.stopPropagation();
        scopeMenu.classList.remove('open');
        onBulkTag(col.id, scope);
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
      const procEl = makeItemEl(proc, 'process-box', onItemClick, onEditClick,
        () => onRemoveItem('proc', col.id, proc.id),
        onScopeChange, filters, null, linkedSet);
      colBody.appendChild(procEl);
      if (!procEl.classList.contains('item-hidden')) visibleCount++;

      (proc.subs || []).forEach(sub => {
        const cls   = sub.type === 'process' ? 'process-box' : 'sub-box';
        const subEl = makeItemEl(sub, cls, onItemClick, onEditClick,
          () => onRemoveItem('sub', col.id, proc.id, sub.id),
          onScopeChange, filters, proc, linkedSet);
        colBody.appendChild(subEl);
        if (!subEl.classList.contains('item-hidden')) visibleCount++;
      });

      // Add sub-process button (edit mode only, shown via CSS)
      const addSubBtn = document.createElement('button');
      addSubBtn.className = 'add-row-btn';
      addSubBtn.textContent = '+ Add Sub-Process';
      addSubBtn.addEventListener('click', () => onAddModal('sub', col.id, proc.id));
      colBody.appendChild(addSubBtn);
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

function makeItemEl(item, baseClass, onItemClick, onEditClick, onRemove, onScopeChange, filters, parentProcess, linkedSet) {
  const eff   = effectiveScope(item, parentProcess, linkedSet);
  const scope = eff.scope;   // effective scope (manual tag, or auto Out-of-Scope)
  const auto  = eff.auto;    // true when defaulted because nothing is linked

  // Visibility — the effective scope key must be in the selected filter set
  const key = scope || 'untagged';
  const visible = filters.includes(key);

  const el = document.createElement('div');
  el.className = baseClass;
  if (!visible) el.classList.add('item-hidden');
  if (scope === 'out-of-scope') el.classList.add('scope-oos');
  if (auto) el.classList.add('scope-oos-auto');
  el.dataset.id = item.id;

  // Title
  const titleSpan = document.createElement('span');
  titleSpan.className = 'card-title';
  titleSpan.textContent = item.title;
  el.appendChild(titleSpan);

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
  const counts = { core: 0, custom: 0, 'out-of-scope': 0, untagged: 0, auto: 0 };
  const linkedSet = linkedSystemIds();
  (currentData() || []).forEach(col => {
    col.processes.forEach(proc => {
      tallyEff(effectiveScope(proc, null, linkedSet), counts);
      (proc.subs || []).forEach(sub => tallyEff(effectiveScope(sub, proc, linkedSet), counts));
    });
  });

  const countsEl = document.getElementById('scope-filter-counts');
  if (!countsEl) return;
  const oosLabel = counts.auto ? `OOS ${counts['out-of-scope']} (${counts.auto} auto)` : `OOS ${counts['out-of-scope']}`;
  countsEl.innerHTML = [
    counts.core         ? `<span class="scope-count-chip scope-count-core">CORE ${counts.core}</span>` : '',
    counts.custom       ? `<span class="scope-count-chip scope-count-custom">CUSTOM ${counts.custom}</span>` : '',
    counts['out-of-scope'] ? `<span class="scope-count-chip scope-count-oos">${oosLabel}</span>` : '',
    counts.untagged     ? `<span class="scope-count-chip scope-count-untag">Untagged ${counts.untagged}</span>` : '',
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
