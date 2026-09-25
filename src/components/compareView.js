/* ═══════════════════════════════════════════════════════════════════════════
   compareView.js — Version comparison (DevOps ticket: "side-by-side diff
   between two saved versions")

   Self-contained, like discoveryWizard.js: builds and appends its own overlay
   DOM, reads live app state directly (no callbacks needed for the "current,
   unsaved session" comparator — that's the point of it existing).

   Two entry points:
     openComparePicker()            — full picker (choose A and B, then Compare)
     openCompareResults(idA, idB)   — skip the picker, go straight to a diff
                                       (used by the Guided Discovery wizard's
                                       "Compare vs Baseline" shortcut)

   Comparable ids: 'original' | 'discovery' | 'live' (current in-memory
   session, unsaved) | any saved version id from versions.js.
   ═══════════════════════════════════════════════════════════════════════════ */

import { state, ALL_DATA, MODULE_CONFIG, ORIGINAL_DATA } from '../state.js';
import { BUSINESS_DATA, BUSINESS_ORIGINAL, BUSINESS_CONFIG } from '../data/business/index.js';
import { seedLinks } from '../data/links.js';
import { listVersions, getVersion } from '../versions.js';
import { diffVersions, summarizeDiff } from '../data/diff.js';

const deep = o => JSON.parse(JSON.stringify(o));
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const STATUS_META = {
  added:    { label: 'Added',    cls: 'cmp-added' },
  removed:  { label: 'Removed',  cls: 'cmp-removed' },
  modified: { label: 'Modified', cls: 'cmp-modified' },
};

let root = null;
let pickerRoot = null;
let currentRecords = [];
let currentIndex = -1;
let activeFilters = new Set(['added', 'removed', 'modified']);

// ── Building comparable snapshots ────────────────────────────────────────────

function clearTagsDeep(data, businessData) {
  Object.values(data).forEach(mod => mod.forEach(col => (col.processes || []).forEach(p => {
    p.scope = null; (p.subs || []).forEach(s => { s.scope = null; });
  })));
  Object.values(businessData).forEach(mod => mod.forEach(col => (col.processes || []).forEach(p => {
    p.coverage = null; (p.subs || []).forEach(s => { s.coverage = null; });
  })));
}

function currentCustomModules() {
  const builtIn = new Set(Object.keys(ORIGINAL_DATA));
  return Object.keys(MODULE_CONFIG)
    .filter(k => !builtIn.has(k))
    .map(k => ({ id: k, config: MODULE_CONFIG[k] }));
}

/** Resolve a comparable id into a { label, data, businessData, links,
 *  moduleVisibility, customModules } snapshot. Never mutates live state. */
function resolveComparable(id) {
  if (id === 'original') {
    return {
      label: 'Original', data: deep(ORIGINAL_DATA), businessData: deep(BUSINESS_ORIGINAL),
      links: seedLinks(), moduleVisibility: {}, customModules: [],
    };
  }
  if (id === 'discovery') {
    const data = deep(ORIGINAL_DATA);
    const businessData = deep(BUSINESS_ORIGINAL);
    clearTagsDeep(data, businessData);
    return { label: 'Discovery Baseline', data, businessData, links: seedLinks(), moduleVisibility: {}, customModules: [] };
  }
  if (id === 'live') {
    return {
      label: `${state.activeVersionName} (current, unsaved)`,
      data: deep(ALL_DATA), businessData: deep(BUSINESS_DATA),
      links: deep(state.links || []), moduleVisibility: { ...state.moduleVisibility },
      customModules: currentCustomModules(),
    };
  }
  const v = getVersion(id);
  if (!v) return null;
  return {
    label: v.name, data: v.data || {}, businessData: v.businessData || {},
    links: v.links || [], moduleVisibility: v.moduleVisibility || {}, customModules: v.customModules || [],
  };
}

// ── Picker ────────────────────────────────────────────────────────────────────

function buildPickerOptions(selectEl, selectedId) {
  const versions = listVersions();
  let html = `
    <option value="discovery">🧭 Discovery Baseline</option>
    <option value="original">🔒 Original</option>
    <option value="live">✎ Current session (unsaved)</option>`;
  if (versions.length) {
    html += `<optgroup label="Saved Versions">`;
    versions.slice().reverse().forEach(v => {
      html += `<option value="${esc(v.id)}">${esc(v.name)}</option>`;
    });
    html += `</optgroup>`;
  }
  selectEl.innerHTML = html;
  if (selectedId) selectEl.value = selectedId;
}

function ensurePickerDom() {
  if (pickerRoot) return;
  pickerRoot = document.createElement('div');
  pickerRoot.className = 'cmp-picker-overlay';
  pickerRoot.innerHTML = `
    <div class="cmp-picker-modal">
      <div class="cmp-picker-hdr">
        <h3>⇄ Compare Versions</h3>
        <p>Pick two versions to see what changed between them.</p>
      </div>
      <div class="cmp-picker-body">
        <div class="cmp-picker-field">
          <label>Version A (baseline)</label>
          <select id="cmp-pick-a"></select>
        </div>
        <div class="cmp-picker-arrow">⇄</div>
        <div class="cmp-picker-field">
          <label>Version B (compare to)</label>
          <select id="cmp-pick-b"></select>
        </div>
      </div>
      <div class="cmp-picker-ftr">
        <button class="btn btn-cancel" id="cmp-pick-cancel">Cancel</button>
        <button class="btn btn-raised" id="cmp-pick-go">Compare</button>
      </div>
    </div>`;
  document.body.appendChild(pickerRoot);

  pickerRoot.querySelector('#cmp-pick-cancel').addEventListener('click', closePicker);
  pickerRoot.addEventListener('click', e => { if (e.target === pickerRoot) closePicker(); });
  pickerRoot.querySelector('#cmp-pick-go').addEventListener('click', () => {
    const idA = pickerRoot.querySelector('#cmp-pick-a').value;
    const idB = pickerRoot.querySelector('#cmp-pick-b').value;
    closePicker();
    openCompareResults(idA, idB);
  });
}

export function openComparePicker() {
  ensurePickerDom();
  const selA = pickerRoot.querySelector('#cmp-pick-a');
  const selB = pickerRoot.querySelector('#cmp-pick-b');
  buildPickerOptions(selA, 'discovery');
  buildPickerOptions(selB, 'live');
  pickerRoot.classList.add('open');
}

function closePicker() {
  if (pickerRoot) pickerRoot.classList.remove('open');
}

// ── Results overlay ───────────────────────────────────────────────────────────

function ensureResultsDom() {
  if (root) return;
  root = document.createElement('div');
  root.className = 'cmp-overlay';
  root.innerHTML = `
    <div class="cmp-panel">
      <div class="cmp-hdr">
        <div class="cmp-hdr-titles">
          <span class="cmp-hdr-label" id="cmp-hdr-a"></span>
          <span class="cmp-hdr-vs">⇄</span>
          <span class="cmp-hdr-label" id="cmp-hdr-b"></span>
        </div>
        <div class="cmp-hdr-actions">
          <button class="btn btn-ghost cmp-btn-sm" id="cmp-swap" title="Swap A and B">⇄ Swap</button>
          <button class="cmp-close" id="cmp-close" title="Close">✕</button>
        </div>
      </div>
      <div class="cmp-toolbar">
        <div class="cmp-filters" id="cmp-filters"></div>
        <div class="cmp-nav">
          <button class="btn btn-cancel cmp-btn-sm" id="cmp-prev">‹ Prev change</button>
          <span class="cmp-nav-count" id="cmp-nav-count"></span>
          <button class="btn btn-cancel cmp-btn-sm" id="cmp-next">Next change ›</button>
        </div>
      </div>
      <div class="cmp-body" id="cmp-body"></div>
    </div>`;
  document.body.appendChild(root);

  root.querySelector('#cmp-close').addEventListener('click', closeCompareResults);
  root.querySelector('#cmp-swap').addEventListener('click', () => {
    if (root.dataset.idA && root.dataset.idB) {
      openCompareResults(root.dataset.idB, root.dataset.idA);
    }
  });
  root.querySelector('#cmp-prev').addEventListener('click', () => stepChange(-1));
  root.querySelector('#cmp-next').addEventListener('click', () => stepChange(1));
}

export function openCompareResults(idA, idB) {
  ensureResultsDom();
  const a = resolveComparable(idA);
  const b = resolveComparable(idB);
  if (!a || !b) { alert('Could not load one of the selected versions.'); return; }

  root.dataset.idA = idA;
  root.dataset.idB = idB;
  root.querySelector('#cmp-hdr-a').textContent = a.label;
  root.querySelector('#cmp-hdr-b').textContent = b.label;

  currentRecords = diffVersions(a, b);
  currentIndex = currentRecords.length ? 0 : -1;
  activeFilters = new Set(['added', 'removed', 'modified']);

  renderFilters();
  renderBody();
  root.classList.add('open');
}

export function closeCompareResults() {
  if (root) root.classList.remove('open');
}

function renderFilters() {
  const counts = summarizeDiff(currentRecords);
  const wrap = root.querySelector('#cmp-filters');
  wrap.innerHTML = ['added', 'removed', 'modified'].map(key => {
    const meta = STATUS_META[key];
    const active = activeFilters.has(key);
    return `<button class="cmp-filter-chip ${meta.cls} ${active ? 'active' : ''}" data-status="${key}">
      ${meta.label} <span class="cmp-filter-count">${counts[key] || 0}</span>
    </button>`;
  }).join('');
  wrap.querySelectorAll('.cmp-filter-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const s = btn.dataset.status;
      if (activeFilters.has(s)) activeFilters.delete(s); else activeFilters.add(s);
      if (activeFilters.size === 0) activeFilters = new Set(['added', 'removed', 'modified']);
      renderFilters();
      renderBody();
    });
  });
}

function visibleRecords() {
  return currentRecords.filter(r => activeFilters.has(r.status));
}

function fieldRowHtml(field, status) {
  if (status === 'added') {
    return `<div class="cmp-field-row cmp-field-added">
      <div class="cmp-field-label">${esc(field.label)}</div>
      <div class="cmp-field-side cmp-side-empty"></div>
      <div class="cmp-field-side cmp-side-new">${field.isList ? esc(field.b || field.value).replace(/\n/g, '<br>') : esc(field.b ?? field.value)}</div>
    </div>`;
  }
  if (status === 'removed') {
    return `<div class="cmp-field-row cmp-field-removed">
      <div class="cmp-field-label">${esc(field.label)}</div>
      <div class="cmp-field-side cmp-side-old">${field.isList ? esc(field.a || field.value).replace(/\n/g, '<br>') : esc(field.a ?? field.value)}</div>
      <div class="cmp-field-side cmp-side-empty"></div>
    </div>`;
  }
  return `<div class="cmp-field-row cmp-field-modified">
    <div class="cmp-field-label">${esc(field.label)}</div>
    <div class="cmp-field-side cmp-side-old">${field.isList ? esc(field.a).replace(/\n/g, '<br>') : esc(field.a) || '<em class="cmp-blank">— empty —</em>'}</div>
    <div class="cmp-field-side cmp-side-new">${field.isList ? esc(field.b).replace(/\n/g, '<br>') : esc(field.b) || '<em class="cmp-blank">— empty —</em>'}</div>
  </div>`;
}

function recordCardHtml(rec, idx) {
  const meta = STATUS_META[rec.status];
  const isCurrent = idx === currentIndex;
  return `
    <div class="cmp-card ${meta.cls} ${isCurrent ? 'cmp-card-current' : ''}" data-idx="${idx}" id="cmp-rec-${rec.id}">
      <div class="cmp-card-hdr">
        <span class="cmp-badge ${meta.cls}">${meta.label}</span>
        <span class="cmp-card-module">${esc(rec.moduleLabel)}</span>
        ${rec.breadcrumb ? `<span class="cmp-card-bc">${esc(rec.breadcrumb)}</span>` : ''}
      </div>
      <div class="cmp-card-title">${esc(rec.title)}</div>
      <div class="cmp-card-fields">${rec.fields.map(f => fieldRowHtml(f, rec.status)).join('')}</div>
    </div>`;
}

function renderBody() {
  const body = root.querySelector('#cmp-body');
  const records = visibleRecords();

  if (!currentRecords.length) {
    body.innerHTML = `<div class="cmp-empty">✓ No differences found between these two versions.</div>`;
  } else if (!records.length) {
    body.innerHTML = `<div class="cmp-empty">No changes match the selected filters.</div>`;
  } else {
    body.innerHTML = records.map((r) => recordCardHtml(r, currentRecords.indexOf(r))).join('');
    body.querySelectorAll('.cmp-card').forEach(card => {
      card.addEventListener('click', () => {
        currentIndex = parseInt(card.dataset.idx, 10);
        updateCurrentHighlight();
        updateNavCount();
      });
    });
  }
  updateNavCount();
}

function updateCurrentHighlight() {
  root.querySelectorAll('.cmp-card').forEach(c => c.classList.remove('cmp-card-current'));
  const rec = currentRecords[currentIndex];
  if (!rec) return;
  const el = root.querySelector(`#cmp-rec-${rec.id}`);
  if (el) {
    el.classList.add('cmp-card-current');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function updateNavCount() {
  const countEl = root.querySelector('#cmp-nav-count');
  const records = visibleRecords();
  if (!records.length) { countEl.textContent = '0 of 0'; return; }
  const posInVisible = records.findIndex(r => currentRecords.indexOf(r) === currentIndex) + 1;
  countEl.textContent = `${Math.max(posInVisible, 1)} of ${records.length}`;
}

function stepChange(dir) {
  const records = visibleRecords();
  if (!records.length) return;
  const posInVisible = records.findIndex(r => currentRecords.indexOf(r) === currentIndex);
  let nextPos = (posInVisible === -1 ? 0 : posInVisible + dir);
  if (nextPos < 0) nextPos = records.length - 1;
  if (nextPos >= records.length) nextPos = 0;
  currentIndex = currentRecords.indexOf(records[nextPos]);
  updateCurrentHighlight();
  updateNavCount();
}
