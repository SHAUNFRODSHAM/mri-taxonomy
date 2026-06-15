/* ═══════════════════════════════════════════════════════════════════════════
   versionMenu.js — left-side version panel renderer
   Reads from localStorage via versions.js; dispatches custom events back to
   main.js for all state mutations (no circular imports).
   ═══════════════════════════════════════════════════════════════════════════ */

import { state, ALL_DATA, MODULE_CONFIG, isModuleVisible } from '../state.js';
import { listVersions, formatDate }      from '../versions.js';

/**
 * Re-renders the version panel body (#ver-panel-body).
 * Call this whenever the panel is opened or versions change.
 */
export function renderVersionPanel() {
  const body = document.getElementById('ver-panel-body');
  if (!body) return;

  const versions = listVersions();
  body.innerHTML = '';

  // ── Module visibility section ──────────────────────────────────────────
  body.appendChild(buildModuleVisibilitySection());

  // ── Original card (always first, locked) ───────────────────────────────
  const verSep = document.createElement('div');
  verSep.className = 'ver-sep';
  verSep.textContent = 'Versions';
  body.appendChild(verSep);

  body.appendChild(buildOrigCard());

  // ── Saved versions ─────────────────────────────────────────────────────
  if (versions.length) {
    const sep = document.createElement('div');
    sep.className = 'ver-sep';
    sep.textContent = `Saved Versions (${versions.length})`;
    body.appendChild(sep);

    // Newest first
    versions.slice().reverse().forEach(v => {
      body.appendChild(buildVersionCard(v));
    });
  } else {
    const empty = document.createElement('div');
    empty.className = 'ver-empty';
    empty.innerHTML =
      '<div class="ver-empty-icon">📋</div>' +
      '<div>No saved versions yet.<br>Use <strong>+ Save As</strong> below<br>to create a named snapshot.</div>';
    body.appendChild(empty);
  }
}

// ── Module visibility ────────────────────────────────────────────────────────

/**
 * Builds the "Visible Modules" checklist. Toggling a module hides/shows its tab
 * and marks the current version dirty; the visibility map is saved with the
 * version, so a client version can be scoped to just the modules they use.
 */
function buildModuleVisibilitySection() {
  const wrap = document.createElement('div');
  wrap.className = 'ver-modules';

  const sep = document.createElement('div');
  sep.className = 'ver-sep';
  sep.textContent = 'Visible Modules';
  wrap.appendChild(sep);

  const hint = document.createElement('div');
  hint.className = 'ver-modules-hint';
  hint.textContent = 'Hidden modules are removed from the tab bar. Save a version to keep this selection for a client.';
  wrap.appendChild(hint);

  const tabIds = Object.keys(ALL_DATA);
  const visibleCount = tabIds.filter(isModuleVisible).length;

  tabIds.forEach(tab => {
    const cfg = MODULE_CONFIG[tab] || {};
    const visible = isModuleVisible(tab);
    const isLastVisible = visible && visibleCount === 1;

    const row = document.createElement('label');
    row.className = 'ver-module-row' + (visible ? '' : ' ver-module-off');

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = visible;
    // Don't allow hiding the last visible module — there must always be one tab.
    cb.disabled = isLastVisible;
    cb.title = isLastVisible ? 'At least one module must stay visible' : '';
    cb.addEventListener('change', () => {
      document.dispatchEvent(new CustomEvent('mri:toggleModule', { detail: tab }));
    });

    const icon = document.createElement('span');
    icon.className = 'ver-module-icon';
    icon.textContent = cfg.icon || '📋';

    const name = document.createElement('span');
    name.className = 'ver-module-name';
    name.textContent = cfg.label || tab;

    row.appendChild(cb);
    row.appendChild(icon);
    row.appendChild(name);
    wrap.appendChild(row);
  });

  return wrap;
}

// ── Card builders ──────────────────────────────────────────────────────────

function buildOrigCard() {
  const isActive = state.activeVersionId === 'original';
  const card = document.createElement('div');
  card.className =
    'ver-card ver-card-original' + (isActive ? ' ver-card-active' : '');

  card.innerHTML =
    `<div class="ver-card-icon">🔒</div>` +
    `<div class="ver-card-info">` +
      `<div class="ver-card-name">Original</div>` +
      `<div class="ver-card-meta">Factory content · Read-only</div>` +
    `</div>` +
    `<div class="ver-card-actions">` +
      (isActive
        ? `<span class="ver-active-dot" title="Currently loaded">●</span>`
        : `<button class="ver-btn ver-btn-load" title="Load original content">Load</button>`) +
    `</div>`;

  if (!isActive) {
    card.querySelector('.ver-btn-load').addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('mri:loadVersion', { detail: 'original' }));
    });
  }

  return card;
}

function buildVersionCard(v) {
  const isActive = state.activeVersionId === v.id;
  const card = document.createElement('div');
  card.className = 'ver-card' + (isActive ? ' ver-card-active' : '');

  card.innerHTML =
    `<div class="ver-card-icon">📄</div>` +
    `<div class="ver-card-info">` +
      `<div class="ver-card-name">${escHtml(v.name)}</div>` +
      `<div class="ver-card-meta">${formatDate(v.createdAt)}</div>` +
    `</div>` +
    `<div class="ver-card-actions">` +
      `<button class="ver-btn ver-btn-rename" title="Rename this version">✎</button>` +
      (isActive
        ? `<span class="ver-active-dot" title="Currently loaded">●</span>`
        : `<button class="ver-btn ver-btn-load" title="Load this version">Load</button>`) +
      `<button class="ver-btn ver-btn-del" title="Delete this version">🗑</button>` +
    `</div>`;

  // Load
  const loadBtn = card.querySelector('.ver-btn-load');
  if (loadBtn) {
    loadBtn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('mri:loadVersion', { detail: v.id }));
    });
  }

  // Delete
  card.querySelector('.ver-btn-del').addEventListener('click', () => {
    if (confirm(`Delete version "${v.name}"?\n\nThis cannot be undone.`)) {
      document.dispatchEvent(new CustomEvent('mri:deleteVersion', { detail: v.id }));
    }
  });

  // Rename (inline)
  card.querySelector('.ver-btn-rename').addEventListener('click', () => {
    startRename(card, v);
  });

  return card;
}

// ── Inline rename ──────────────────────────────────────────────────────────

function startRename(card, v) {
  const nameEl    = card.querySelector('.ver-card-info .ver-card-name');
  const renameBtn = card.querySelector('.ver-btn-rename');
  const current   = nameEl.textContent;

  // Replace name span with an input
  const input = document.createElement('input');
  input.className = 'ver-rename-input';
  input.value = current;
  nameEl.replaceWith(input);

  renameBtn.textContent = '✓';
  renameBtn.title = 'Save name';
  input.focus();
  input.select();

  let committed = false;

  function commit() {
    if (committed) return;
    committed = true;
    const newName = input.value.trim() || current;
    document.dispatchEvent(
      new CustomEvent('mri:renameVersion', { detail: { id: v.id, name: newName } })
    );
  }

  renameBtn.onclick = commit;

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter')  { e.preventDefault(); commit(); }
    if (e.key === 'Escape') { committed = true; renderVersionPanel(); }
  });

  // Slight delay on blur so the ✓ button click fires first
  input.addEventListener('blur', () => setTimeout(commit, 160));
}

// ── Helpers ────────────────────────────────────────────────────────────────

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
