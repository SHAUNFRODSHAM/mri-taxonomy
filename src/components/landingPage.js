/* ═══════════════════════════════════════════════════════════════════════════
   landingPage.js — intent-led entry point

   The first thing anyone sees. Rather than dropping every user straight into
   the Discovery Baseline, it asks what they are trying to do and routes them:

     Start a new discovery         consultant with a new client — scope the
                                   taxonomy to the SOW, name it, begin tagging
     Continue a client taxonomy    consultant mid-engagement — reopen a version
     Explore the reference         onboarding, training, pre-sales — the fully
                                   linked Original, read-only
     Compare versions              reviewer — straight into the compare picker

   Self-contained like discoveryWizard.js: main.js injects every action as a
   callback, so this file owns no app state and imports nothing from main.js.

   The header carries an empty #landing-account slot. Sign-in is not handled
   here — the feature/entra-sso-scaffold branch fills that slot and gates this
   page behind a loading / signing-in state once hosting is in place.

   Saved versions live in this browser's localStorage, so "Continue" can only
   offer what this browser holds. The page says so rather than letting the tile
   imply colleagues' work will appear — sharing needs the database backend.
   ═══════════════════════════════════════════════════════════════════════════ */

const esc = s => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

let opts = null;
let root = null;
let ctx  = {};   // { resumeLabel } when opened from inside the app via Home

const INTENTS = [
  {
    key: 'new',
    icon: '🧭',
    title: 'Start a new discovery',
    desc: 'Scope a fresh taxonomy to a new client — choose the value streams and MRI PMX modules agreed in the SOW or early conversations, and name the engagement.',
    who: 'For consultants beginning a client engagement',
  },
  {
    key: 'continue',
    icon: '📂',
    title: 'Continue a client taxonomy',
    desc: 'Reopen a taxonomy you have already started and carry on tagging, linking and capturing proposals.',
    who: 'For consultants mid-engagement',
  },
  {
    key: 'explore',
    icon: '📖',
    title: 'Explore the reference taxonomy',
    desc: 'Browse the complete, fully linked Open Box reference in read-only mode — every value stream, every PMX module and how they connect.',
    who: 'For onboarding, training and pre-sales',
  },
  {
    key: 'compare',
    icon: '⇄',
    title: 'Compare versions',
    desc: 'See what changed between two taxonomies, or between a client version and the baseline, before a review or client conversation.',
    who: 'For reviewers and engagement leads',
  },
];

/**
 * @param {object}   o
 * @param {Function} o.listVersions   () => saved versions [{ id, name, createdAt, moduleVisibility }]
 * @param {Array}    o.streams        [{ id, label, icon, supporting }]
 * @param {Array}    o.modules        [{ id, label, icon }]
 * @param {Function} o.onStartNew     ({ name, streams, modules, guided }) => void
 * @param {Function} o.onOpenVersion  (id) => void
 * @param {Function} o.onExplore      () => void
 * @param {Function} o.onCompare      () => void
 * @param {Function} o.onResume       () => void — return to the session the user came from
 * @param {Function} o.confirmLeave   () => boolean — false if the user wants to keep unsaved work
 */
export function initLanding(o) {
  opts = o;
  root = document.createElement('div');
  root.id = 'landing';
  root.className = 'landing';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-label', 'Choose what you want to do');
  root.innerHTML = `
    <div class="landing-shell">
      <header class="landing-hdr">
        <div class="landing-brand">
          <div class="landing-title">ERP Implementation Taxonomy</div>
          <div class="landing-sub">MRI PMX · Open Box Software</div>
        </div>
        <div class="landing-account" id="landing-account"></div>
      </header>
      <main class="landing-main" id="landing-main"></main>
    </div>`;
  document.body.appendChild(root);
}

/** @param {string} view    'home' | 'setup' | 'continue'
 *  @param {object} [c]     { resumeLabel } — set when opened from inside the app,
 *                           so the user can go back rather than being forced to
 *                           pick a tile (which would replace the session). */
export function showLanding(view = 'home', c = {}) {
  if (!root) return;
  ctx = c;
  document.body.classList.add('landing-open');
  root.classList.add('open');
  render(view);
}

export function hideLanding() {
  if (!root) return;
  root.classList.remove('open');
  document.body.classList.remove('landing-open');
}

export function isLandingOpen() {
  return !!root && root.classList.contains('open');
}

function main() { return document.getElementById('landing-main'); }

function render(view) {
  if (view === 'setup')         renderSetup();
  else if (view === 'continue') renderContinue();
  else                          renderHome();
}

// ── Home: the four intents ─────────────────────────────────────────────────

function renderHome() {
  const saved = opts.listVersions().length;
  main().innerHTML = `
    ${ctx.resumeLabel ? `<button class="landing-back" type="button" data-resume>← Back to ${esc(ctx.resumeLabel)}</button>` : ''}
    <h1 class="landing-h1">What would you like to do?</h1>
    <div class="landing-grid">
      ${INTENTS.map(i => `
        <button class="landing-tile" type="button" data-intent="${i.key}">
          <span class="landing-tile-icon" aria-hidden="true">${i.icon}</span>
          <span class="landing-tile-title">${esc(i.title)}</span>
          <span class="landing-tile-desc">${esc(i.desc)}</span>
          <span class="landing-tile-who">${esc(i.who)}${
            i.key === 'continue' ? ` · ${saved} saved in this browser` : ''}</span>
        </button>`).join('')}
    </div>
    <p class="landing-note">Taxonomies are saved in this browser only. Colleagues cannot yet open
      a version you created, and clearing your browser data removes them — shared storage
      arrives with the database backend.</p>`;

  main().querySelector('[data-resume]')?.addEventListener('click', () => {
    hideLanding(); opts.onResume();
  });
  main().querySelectorAll('[data-intent]').forEach(btn => {
    btn.addEventListener('click', () => {
      const k = btn.dataset.intent;
      if (k === 'new')           render('setup');
      else if (k === 'continue') render('continue');
      else if (k === 'explore')  { if (!opts.confirmLeave()) return; hideLanding(); opts.onExplore(); }
      else if (k === 'compare')  { hideLanding(); opts.onCompare(); }   // compare loads nothing
    });
  });
  main().querySelector('[data-intent]')?.focus();
}

// ── Setup: scope a new discovery ───────────────────────────────────────────

function checklist(group, items, checkedByDefault) {
  return items.map(it => `
    <label class="landing-check${it.supporting ? ' landing-check-supporting' : ''}">
      <input type="checkbox" data-group="${group}" value="${esc(it.id)}"
        ${checkedByDefault(it) ? 'checked' : ''}>
      <span class="landing-check-icon" aria-hidden="true">${esc(it.icon || '')}</span>
      <span class="landing-check-label">${esc(it.label)}</span>
      ${it.supporting ? '<span class="landing-check-tag">supporting</span>' : ''}
    </label>`).join('');
}

function renderSetup() {
  main().innerHTML = `
    <button class="landing-back" type="button" data-back>← Back</button>
    <h1 class="landing-h1">Start a new discovery</h1>
    <p class="landing-lede">Scope this taxonomy to the engagement. Untick anything outside
      the SOW — it is hidden from this version, not deleted, and you can bring it back later
      from the Versions panel.</p>

    <label class="landing-field-label" for="landing-name">Version name</label>
    <input class="landing-input" id="landing-name" type="text" maxlength="80"
      placeholder="e.g. Acme REIT — Discovery, Oct 2026" autocomplete="off">
    <p class="landing-error" id="landing-name-err" hidden></p>

    <div class="landing-cols">
      <fieldset class="landing-fieldset">
        <legend>Value streams <span class="landing-count" data-count="stream"></span></legend>
        <div class="landing-bulk">
          <button type="button" data-all="stream">Select all</button>
          <button type="button" data-none="stream">Clear</button>
        </div>
        ${checklist('stream', opts.streams, s => !s.supporting)}
      </fieldset>

      <fieldset class="landing-fieldset">
        <legend>MRI PMX modules <span class="landing-count" data-count="module"></span></legend>
        <div class="landing-bulk">
          <button type="button" data-all="module">Select all</button>
          <button type="button" data-none="module">Clear</button>
        </div>
        ${checklist('module', opts.modules, () => true)}
      </fieldset>
    </div>
    <p class="landing-error" id="landing-scope-err" hidden></p>

    <label class="landing-guided">
      <input type="checkbox" id="landing-guided" checked>
      <span>Walk me through tagging with Guided Discovery</span>
    </label>

    <div class="landing-actions">
      <button class="btn btn-cancel" type="button" data-back>Cancel</button>
      <button class="btn btn-raised" type="button" id="landing-create">Create taxonomy</button>
    </div>`;

  const m = main();
  const boxes = g => [...m.querySelectorAll(`input[data-group="${g}"]`)];
  const updateCounts = () => ['stream', 'module'].forEach(g => {
    const all = boxes(g);
    m.querySelector(`[data-count="${g}"]`).textContent =
      `${all.filter(b => b.checked).length} of ${all.length}`;
  });

  m.querySelectorAll('[data-back]').forEach(b => b.addEventListener('click', () => render('home')));
  m.querySelectorAll('[data-all]').forEach(b => b.addEventListener('click', () => {
    boxes(b.dataset.all).forEach(x => { x.checked = true; }); updateCounts();
  }));
  m.querySelectorAll('[data-none]').forEach(b => b.addEventListener('click', () => {
    boxes(b.dataset.none).forEach(x => { x.checked = false; }); updateCounts();
  }));
  m.addEventListener('change', e => { if (e.target.dataset.group) updateCounts(); });
  updateCounts();

  const nameEl = m.querySelector('#landing-name');
  const nameErr = m.querySelector('#landing-name-err');
  const scopeErr = m.querySelector('#landing-scope-err');
  const showErr = (el, msg) => { el.textContent = msg; el.hidden = !msg; };

  m.querySelector('#landing-create').addEventListener('click', () => {
    const name = nameEl.value.trim();
    const streams = boxes('stream').filter(b => b.checked).map(b => b.value);
    const modules = boxes('module').filter(b => b.checked).map(b => b.value);

    const taken = opts.listVersions().some(v => v.name.trim().toLowerCase() === name.toLowerCase());
    showErr(nameErr, !name ? 'Give this taxonomy a name so you can find it again.'
                    : taken ? 'A version with this name already exists in this browser.' : '');
    showErr(scopeErr, !streams.length || !modules.length
      ? 'Choose at least one value stream and one MRI PMX module.' : '');
    if (!name || taken || !streams.length || !modules.length) {
      (!name || taken ? nameEl : m.querySelector('.landing-fieldset')).focus?.();
      return;
    }
    if (!opts.confirmLeave()) return;

    hideLanding();
    opts.onStartNew({ name, streams, modules, guided: m.querySelector('#landing-guided').checked });
  });

  nameEl.focus();
}

// ── Continue: reopen a saved version ───────────────────────────────────────

function renderContinue() {
  const versions = opts.listVersions().slice().reverse();   // newest first
  const moduleIds = new Set(opts.modules.map(x => x.id));
  const streamIds = new Set(opts.streams.map(x => x.id));
  const counts = v => {
    const vis = v.moduleVisibility || {};
    const on = set => [...set].filter(id => vis[id] !== false).length;
    return `${on(streamIds)} value streams · ${on(moduleIds)} modules`;
  };
  const date = iso => {
    try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch { return ''; }
  };

  main().innerHTML = `
    <button class="landing-back" type="button" data-back>← Back</button>
    <h1 class="landing-h1">Continue a client taxonomy</h1>
    ${versions.length ? `
      <ul class="landing-list">
        ${versions.map(v => `
          <li class="landing-list-row">
            <div>
              <div class="landing-list-name">${esc(v.name)}</div>
              <div class="landing-list-meta">Created ${esc(date(v.createdAt))} · ${esc(counts(v))}</div>
            </div>
            <button class="btn btn-raised" type="button" data-open="${esc(v.id)}">Open</button>
          </li>`).join('')}
      </ul>` : `
      <div class="landing-empty">
        <p>No taxonomies are saved in this browser yet.</p>
        <button class="btn btn-raised" type="button" data-goto="setup">Start a new discovery</button>
      </div>`}
    <p class="landing-note">Only versions saved in this browser appear here. A colleague's
      client taxonomies will not show until shared storage is in place.</p>`;

  const m = main();
  m.querySelector('[data-back]').addEventListener('click', () => render('home'));
  m.querySelector('[data-goto="setup"]')?.addEventListener('click', () => render('setup'));
  m.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => {
    if (!opts.confirmLeave()) return;
    hideLanding();
    opts.onOpenVersion(b.dataset.open);
  }));
}
