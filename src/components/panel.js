import { state } from '../state.js';
import { clientNoteHTML } from './clientNote.js';

// Phase-2 hook: main.js injects a function returning link-section HTML for a
// system item id (cross-references to the business view). Null = no link UI.
let linkRenderer = null;
export function setSystemLinkRenderer(fn) { linkRenderer = fn; }

export function showPanel(item, bc, isPro, scopeInfo) {
  state.openPanelId = item.id;

  document.getElementById('panel-bc').textContent = bc;
  document.getElementById('panel-title').textContent = item.title;
  const scopeLabel = {
    'core':         '● CORE',
    'custom':       '● CUSTOM',
    'out-of-scope': '● OUT OF SCOPE',
  };
  // Effective scope (manual tag, or auto Out-of-Scope when not linked to a value stream)
  const eff = scopeInfo || { scope: item.scope || null, auto: false };
  const scopeBadge = eff.scope
    ? `<span class="badge badge-scope-${eff.scope}${eff.auto ? ' badge-scope-auto' : ''}"
         title="${eff.auto ? 'Auto — not yet linked to a value stream; review & link, or tag manually.' : ''}">${scopeLabel[eff.scope] || eff.scope}${eff.auto ? ' · auto' : ''}</span>`
    : `<span class="badge badge-scope-untagged">Untagged</span>`;

  document.getElementById('panel-badges').innerHTML = `
    <span class="badge ${isPro ? 'badge-process' : 'badge-sub'}">${isPro ? 'Process' : 'Sub-Process'}</span>
    <span class="badge badge-mri">MRI</span>
    ${scopeBadge}`;

  const prereqs = item.mri_prereqs || [];
  const assoc   = item.mri_assoc   || [];

  document.getElementById('panel-body').innerHTML = `
    <div class="psec">
      <div class="psec-label">Overview</div>
      <p class="psec-text">${item.desc || ''}</p>
    </div>
    <div class="psec">
      <div class="psec-label">Core Activities</div>
      <ul class="act-list">${(item.activities || []).map(a => `<li>${a}</li>`).join('')}</ul>
    </div>
    ${clientNoteHTML(item)}
    <div class="psec">
      <div class="psec-label">MRI Sub-Process Title</div>
      <div class="mri-title-block">
        <div class="mri-title-label">MRI Module Reference</div>
        <div class="mri-title-name">${item.mri_title || '<em style="opacity:0.5;font-size:0.78rem;font-weight:400">Not configured</em>'}</div>
      </div>
    </div>
    <div class="psec">
      <div class="psec-label">MRI Setup Prerequisites</div>
      ${prereqs.length
        ? `<ul class="prereq-list">${prereqs.map(p => `<li>${p}</li>`).join('')}</ul>`
        : '<p class="psec-text" style="opacity:0.45;font-style:italic;font-size:0.74rem">No prerequisites configured.</p>'}
    </div>
    <div class="psec">
      <div class="psec-label">MRI Associated Processes</div>
      ${assoc.length
        ? `<div class="assoc-grid">${assoc.map(a => `
            <div class="assoc-item">
              <span class="assoc-arrow">↗</span>
              <div>
                <div class="assoc-name">${a.name}</div>
                <div class="assoc-desc">${a.desc}</div>
              </div>
            </div>`).join('')}</div>`
        : '<p class="psec-text" style="opacity:0.45;font-style:italic;font-size:0.74rem">No associated processes configured.</p>'}
    </div>`;

  // Cross-references to the business view (Phase 2)
  if (linkRenderer) {
    const linkHtml = linkRenderer(item.id, 'system');
    if (linkHtml) document.getElementById('panel-body').insertAdjacentHTML('beforeend', linkHtml);
  }

  document.getElementById('overlay').classList.add('open');
  document.getElementById('panel').classList.add('open');
}

export function closePanel() {
  state.openPanelId = null;
  document.getElementById('overlay').classList.remove('open');
  document.getElementById('panel').classList.remove('open');
}
