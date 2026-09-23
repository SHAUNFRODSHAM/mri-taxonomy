/* ═══════════════════════════════════════════════════════════════════════════
   discoveryWizard.js — Guided Discovery wizard (DevOps #3282)

   A lightweight coach-mark overlay, not a walled-off flow: the real app stays
   live and usable underneath at every step. The wizard's job is to point the
   consultant at the right control in sequence — module selection, scope
   tagging (business + system), coverage mapping, export — and to remember
   where they got to.

   Step 0 (name the engagement) is a one-off gate that creates a persisted,
   named version via the existing Save-As flow, so guided discovery never
   edits the frozen ORIGINAL_DATA baseline — it edits that new version only.

   Progress is stored in localStorage keyed by version id, so closing the
   browser and coming back resumes at the right step (per DevOps #3282 AC).
   The wizard can be dismissed at any point without losing the underlying
   work — dismissal only stops the coach-marks, it never discards data.
   ═══════════════════════════════════════════════════════════════════════════ */

const PROGRESS_KEY = 'mri_wizard_progress';   // { [versionId]: { step, dismissed } }
const SEEN_KEY      = 'mri_wizard_seen';      // '1' once the first-run prompt has been shown

const STEPS = [
  {
    key: 'modules',
    title: 'Scope & modules',
    body: 'Set the client\'s market, vertical and entity type, then choose which MRI modules are in scope for this engagement.',
    actionLabel: 'Open value streams',
    action: 'openValueStreams',
    secondaryLabel: 'Open module selector',
    secondaryAction: 'openModuleSelector',
  },
  {
    key: 'scope',
    title: 'Tag scope',
    body: 'Walk the value streams and tag business coverage (Full / Partial / Outside), then walk the MRI PMX modules and tag system scope (Core / Custom / Out of scope).',
    actionLabel: 'Tag business coverage',
    action: 'openValueStreams',
    secondaryLabel: 'Tag system scope',
    secondaryAction: 'openSystemView',
  },
  {
    key: 'mapping',
    title: 'Map coverage',
    body: 'Open the coverage map and confirm or adjust the links between each business process and the MRI PMX process(es) that deliver it.',
    actionLabel: 'Open mapping view',
    action: 'openMapping',
  },
  {
    key: 'export',
    title: 'Export',
    body: 'Before exporting, it\'s worth checking what you\'ve actually changed from the baseline. Then generate the client-ready document.',
    actionLabel: 'Open Generate Doc',
    action: 'openExport',
    secondaryLabel: 'Compare vs Baseline',
    secondaryAction: 'compareToBaseline',
  },
];

let callbacks = {};
let getVersionId = () => null;
let root = null;
let state_ = { active: false, step: 0, pendingVersion: false };

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}'); }
  catch { return {}; }
}
function saveProgress(map) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(map));
}
function setStepFor(versionId, step) {
  if (!versionId) return;
  const map = loadProgress();
  map[versionId] = { step, dismissed: false };
  saveProgress(map);
}
function setDismissedFor(versionId) {
  if (!versionId) return;
  const map = loadProgress();
  if (map[versionId]) map[versionId].dismissed = true;
  saveProgress(map);
}
function getProgressFor(versionId) {
  if (!versionId) return null;
  return loadProgress()[versionId] || null;
}

/**
 * Wire the wizard to the host app.
 * @param {Object} opts
 * @param {Function} opts.openValueStreams  — switch to the Value Streams view
 * @param {Function} opts.openModuleSelector — open the module-visibility dropdown
 * @param {Function} opts.openSystemView    — switch to the MRI PMX System view
 * @param {Function} opts.openMapping       — switch to the Mapping view
 * @param {Function} opts.openExport        — open the Generate Doc modal
 * @param {Function} opts.compareToBaseline — open the version-compare view (Discovery Baseline vs the current session)
 * @param {Function} opts.startNewVersion   — open the Save-As-New-Version modal
 * @param {Function} opts.getVersionId      — () => current state.activeVersionId
 * @param {Function} opts.isBaselineVersion — (id) => true if id is 'original' or 'discovery'
 */
export function initDiscoveryWizard(opts) {
  callbacks = opts;
  getVersionId = opts.getVersionId;
  buildDom();
  wireDom();

  // A version created via the ordinary Save-As flow also advances a wizard
  // waiting on step 0 — the wizard doesn't care how the version was named.
  document.addEventListener('mri:versionSaved', e => {
    if (state_.pendingVersion) {
      state_.pendingVersion = false;
      state_.step = 0;
      state_.active = true;
      setStepFor(e.detail.id, 0);
      render();
      root.classList.add('open');
    }
  });
}

function buildDom() {
  root = document.createElement('div');
  root.className = 'wiz-overlay';
  root.innerHTML = `
    <div class="wiz-card" role="dialog" aria-label="Guided discovery">
      <div class="wiz-hdr">
        <span class="wiz-hdr-title">🧭 Guided Discovery</span>
        <button class="wiz-close" id="wiz-close" title="Dismiss — use the app freely">✕</button>
      </div>
      <div class="wiz-steps" id="wiz-steps"></div>
      <div class="wiz-body">
        <div class="wiz-step-title" id="wiz-step-title"></div>
        <p class="wiz-step-desc" id="wiz-step-desc"></p>
        <div class="wiz-actions" id="wiz-actions"></div>
      </div>
      <div class="wiz-ftr">
        <button class="btn btn-cancel wiz-btn-sm" id="wiz-back">Back</button>
        <button class="btn btn-cancel wiz-btn-sm" id="wiz-dismiss">Dismiss</button>
        <button class="btn btn-raised wiz-btn-sm" id="wiz-next">Next</button>
      </div>
    </div>`;
  document.body.appendChild(root);

  // First-run / resume banner (shown independently of the full wizard card)
  const banner = document.createElement('div');
  banner.className = 'wiz-banner';
  banner.id = 'wiz-banner';
  document.body.appendChild(banner);
}

function wireDom() {
  document.getElementById('wiz-close').addEventListener('click', dismissWizard);
  document.getElementById('wiz-dismiss').addEventListener('click', dismissWizard);
  document.getElementById('wiz-back').addEventListener('click', () => goStep(state_.step - 1));
  document.getElementById('wiz-next').addEventListener('click', () => goStep(state_.step + 1));
}

/** Entry point: start (or resume) guided discovery. */
export function openWizard() {
  const versionId = getVersionId();
  const isBaseline = callbacks.isBaselineVersion(versionId);

  if (isBaseline) {
    // Gate: name the engagement first, so discovery never edits the frozen
    // baseline. Steps resume automatically once mri:versionSaved fires.
    state_.pendingVersion = true;
    hideBanner();
    callbacks.startNewVersion();
    return;
  }

  const progress = getProgressFor(versionId);
  state_.step = progress ? Math.min(progress.step, STEPS.length - 1) : 0;
  state_.active = true;
  hideBanner();
  render();
  root.classList.add('open');
}

export function closeWizard() {
  state_.active = false;
  root.classList.remove('open');
}

function dismissWizard() {
  setDismissedFor(getVersionId());
  closeWizard();
}

function goStep(idx) {
  if (idx < 0) return;
  if (idx >= STEPS.length) { closeWizard(); return; }
  state_.step = idx;
  setStepFor(getVersionId(), idx);
  render();
}

function runAction(name) {
  const fn = {
    openValueStreams:   callbacks.openValueStreams,
    openModuleSelector: callbacks.openModuleSelector,
    openSystemView:     callbacks.openSystemView,
    openMapping:        callbacks.openMapping,
    openExport:         callbacks.openExport,
    compareToBaseline:  callbacks.compareToBaseline,
  }[name];
  if (fn) fn();
}

function render() {
  const step = STEPS[state_.step];

  document.getElementById('wiz-steps').innerHTML = STEPS.map((s, i) => `
    <div class="wiz-dot ${i === state_.step ? 'active' : ''} ${i < state_.step ? 'done' : ''}">
      <span class="wiz-dot-num">${i < state_.step ? '✓' : i + 1}</span>
      <span class="wiz-dot-label">${s.title}</span>
    </div>`).join('<div class="wiz-dot-line"></div>');

  document.getElementById('wiz-step-title').textContent = `Step ${state_.step + 1} of ${STEPS.length} — ${step.title}`;
  document.getElementById('wiz-step-desc').textContent  = step.body;

  const actionsEl = document.getElementById('wiz-actions');
  actionsEl.innerHTML = '';
  const primaryBtn = document.createElement('button');
  primaryBtn.className = 'btn btn-blue wiz-btn-sm';
  primaryBtn.textContent = step.actionLabel;
  primaryBtn.addEventListener('click', () => runAction(step.action));
  actionsEl.appendChild(primaryBtn);

  if (step.secondaryAction) {
    const secBtn = document.createElement('button');
    secBtn.className = 'btn btn-cancel wiz-btn-sm';
    secBtn.textContent = step.secondaryLabel;
    secBtn.addEventListener('click', () => runAction(step.secondaryAction));
    actionsEl.appendChild(secBtn);
  }

  document.getElementById('wiz-back').disabled = state_.step === 0;
  document.getElementById('wiz-next').textContent = state_.step === STEPS.length - 1 ? 'Finish' : 'Next';
}

function hideBanner() {
  const b = document.getElementById('wiz-banner');
  if (b) b.classList.remove('open');
}

/**
 * Call once at boot, after the active version is known. Shows:
 *  - a "resume" banner if this version has unfinished, non-dismissed progress
 *  - a one-time "start guided discovery?" banner on a brand-new install
 * Does nothing if the wizard has already been dismissed for this version.
 */
export function maybeShowEntryBanner() {
  const versionId = getVersionId();
  const progress  = getProgressFor(versionId);
  const banner    = document.getElementById('wiz-banner');
  if (!banner) return;

  if (progress && !progress.dismissed && progress.step < STEPS.length) {
    banner.innerHTML = `
      <span class="wiz-banner-text">🧭 Resume guided discovery — step ${progress.step + 1} of ${STEPS.length}?</span>
      <button class="btn btn-raised wiz-btn-sm" id="wiz-banner-resume">Resume</button>
      <button class="wiz-banner-x" id="wiz-banner-x" title="Dismiss">✕</button>`;
    banner.classList.add('open');
    document.getElementById('wiz-banner-resume').addEventListener('click', openWizard);
    document.getElementById('wiz-banner-x').addEventListener('click', () => {
      setDismissedFor(versionId);
      hideBanner();
    });
    return;
  }

  if (!localStorage.getItem(SEEN_KEY)) {
    localStorage.setItem(SEEN_KEY, '1');
    banner.innerHTML = `
      <span class="wiz-banner-text">🧭 New here? Start Guided Discovery to be walked through scoping this engagement.</span>
      <button class="btn btn-raised wiz-btn-sm" id="wiz-banner-start">Start Guided Discovery</button>
      <button class="wiz-banner-x" id="wiz-banner-x" title="Not now">✕</button>`;
    banner.classList.add('open');
    document.getElementById('wiz-banner-start').addEventListener('click', openWizard);
    document.getElementById('wiz-banner-x').addEventListener('click', hideBanner);
  }
}
