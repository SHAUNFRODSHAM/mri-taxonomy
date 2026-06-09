import { state, currentData, MODULE_CONFIG } from '../state.js';

// ── Scope config ──────────────────────────────────────────────────────────────
const SCOPE_ORDER  = [null, 'core', 'custom', 'out-of-scope'];
const SCOPE_LABELS = {
  'core':         '● CORE',
  'custom':       '● CUSTOM',
  'out-of-scope': '● OUT OF SCOPE',
};

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
  if (header)     header.className = 'main-header ' + (cfg.headerClass || 'cm-header');
  if (headerText) headerText.textContent = cfg.headerText || cfg.label || state.currentTab;

  const filter = state.scopeFilter || 'all';

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
        onScopeChange, filter);
      colBody.appendChild(procEl);
      if (!procEl.classList.contains('item-hidden')) visibleCount++;

      (proc.subs || []).forEach(sub => {
        const cls   = sub.type === 'process' ? 'process-box' : 'sub-box';
        const subEl = makeItemEl(sub, cls, onItemClick, onEditClick,
          () => onRemoveItem('sub', col.id, proc.id, sub.id),
          onScopeChange, filter);
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

    // Show empty message when filter hides everything
    if (visibleCount === 0 && filter !== 'all') {
      const msg = document.createElement('div');
      msg.className = 'empty-filter-msg';
      msg.textContent = 'No items match this filter';
      colBody.appendChild(msg);
    }

    // Add process button
    const addProcBtn = document.createElement('button');
    addProcBtn.className = 'add-row-btn';
    addProcBtn.textContent = '+ Add Process';
    addProcBtn.addEventListener('click', () => onAddModal('process', col.id));
    colBody.appendChild(addProcBtn);

    colEl.appendChild(colBody);
    grid.appendChild(colEl);
  });

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

  // Update filter bar counts and active button state
  updateFilterBar(filter);
}

// ── makeItemEl ────────────────────────────────────────────────────────────────

function makeItemEl(item, baseClass, onItemClick, onEditClick, onRemove, onScopeChange, filter) {
  const scope = item.scope || null;

  // Determine visibility
  const visible = (() => {
    if (filter === 'all')       return true;
    if (filter === 'untagged')  return !scope;
    return scope === filter;
  })();

  const el = document.createElement('div');
  el.className = baseClass;
  if (!visible) el.classList.add('item-hidden');
  if (scope === 'out-of-scope') el.classList.add('scope-oos');
  el.dataset.id = item.id;

  // Title
  const titleSpan = document.createElement('span');
  titleSpan.className = 'card-title';
  titleSpan.textContent = item.title;
  el.appendChild(titleSpan);

  // Scope badge
  if (scope) {
    const badge = document.createElement('span');
    badge.className = `scope-badge scope-badge-${scope}`;
    badge.textContent = SCOPE_LABELS[scope] || scope;
    if (state.editMode) {
      badge.title = 'Click to cycle scope';
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

function updateFilterBar(activeFilter) {
  // Update active button state
  document.querySelectorAll('.scope-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.scope === activeFilter);
  });

  // Compute counts
  const counts = { core: 0, custom: 0, 'out-of-scope': 0, untagged: 0 };
  (currentData() || []).forEach(col => {
    col.processes.forEach(proc => {
      tally(proc.scope, counts);
      (proc.subs || []).forEach(sub => tally(sub.scope, counts));
    });
  });

  const countsEl = document.getElementById('scope-filter-counts');
  if (!countsEl) return;
  countsEl.innerHTML = [
    counts.core         ? `<span class="scope-count-chip scope-count-core">CORE ${counts.core}</span>` : '',
    counts.custom       ? `<span class="scope-count-chip scope-count-custom">CUSTOM ${counts.custom}</span>` : '',
    counts['out-of-scope'] ? `<span class="scope-count-chip scope-count-oos">OOS ${counts['out-of-scope']}</span>` : '',
    counts.untagged     ? `<span class="scope-count-chip scope-count-untag">Untagged ${counts.untagged}</span>` : '',
  ].join('');
}

function tally(scope, counts) {
  const key = scope || 'untagged';
  if (key in counts) counts[key]++;
}

// ── Public helper: get scope label for exports ─────────────────────────────────
export const SCOPE_EXPORT_LABELS = SCOPE_LABELS;
export const SCOPE_ORDER_EXPORT  = SCOPE_ORDER;
