import { state, currentData, MODULE_CONFIG } from '../state.js';

/**
 * render(callbacks)
 * Rebuilds the taxonomy grid from current state.
 *
 * callbacks: { onItemClick, onEditClick, onRemoveItem, onAddModal }
 */
export function render(callbacks) {
  const { onItemClick, onEditClick, onRemoveItem, onAddModal } = callbacks;

  const grid = document.getElementById('grid');
  const cfg  = MODULE_CONFIG[state.currentTab] || {};
  grid.innerHTML = '';
  grid.classList.toggle('edit-active', state.editMode);

  // Update canvas header
  const header = document.getElementById('main-header');
  const headerText = document.getElementById('main-header-text');
  if (header) {
    // Remove all header colour classes then set the right one
    header.className = 'main-header ' + (cfg.headerClass || 'cm-header');
  }
  if (headerText) headerText.textContent = cfg.headerText || cfg.label || state.currentTab;

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

    col.processes.forEach(proc => {
      colBody.appendChild(makeItemEl(proc, 'process-box', onItemClick, onEditClick, () => onRemoveItem('proc', col.id, proc.id)));

      (proc.subs || []).forEach(sub => {
        const cls = sub.type === 'process' ? 'process-box' : 'sub-box';
        colBody.appendChild(makeItemEl(sub, cls, onItemClick, onEditClick, () => onRemoveItem('sub', col.id, proc.id, sub.id)));
      });

      // Add sub-process button (edit mode only, shown via CSS)
      const addSubBtn = document.createElement('button');
      addSubBtn.className = 'add-row-btn';
      addSubBtn.textContent = '+ Add Sub-Process';
      addSubBtn.addEventListener('click', () => onAddModal('sub', col.id, proc.id));
      colBody.appendChild(addSubBtn);
    });

    // Add process button
    const addProcBtn = document.createElement('button');
    addProcBtn.className = 'add-row-btn';
    addProcBtn.textContent = '+ Add Process';
    addProcBtn.addEventListener('click', () => onAddModal('process', col.id));
    colBody.appendChild(addProcBtn);

    colEl.appendChild(colBody);
    grid.appendChild(colEl);
  });

  // Equalise all column header heights so they form a clean shared row.
  // Double rAF ensures the browser has finished text-wrap layout before we measure.
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const headers = grid.querySelectorAll('.col-header');
    headers.forEach(h => { h.style.height = ''; }); // reset to natural height first
    let maxH = 0;
    headers.forEach(h => { maxH = Math.max(maxH, h.offsetHeight); });
    if (maxH > 0) headers.forEach(h => { h.style.height = maxH + 'px'; });
  }));
}

function makeItemEl(item, baseClass, onItemClick, onEditClick, onRemove) {
  const el = document.createElement('div');
  el.className = baseClass;
  el.dataset.id = item.id;
  el.textContent = item.title;

  const delBtn = document.createElement('span');
  delBtn.className = 'del-btn';
  delBtn.textContent = '×';
  delBtn.addEventListener('click', e => {
    e.stopPropagation();
    onRemove();
  });
  el.appendChild(delBtn);

  el.addEventListener('click', () => {
    if (state.editMode) onEditClick(item.id);
    else onItemClick(item.id);
  });

  return el;
}
