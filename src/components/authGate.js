/* ═══════════════════════════════════════════════════════════════════════════
   authGate.js — the loading / sign-in state in front of the app

   Shown first at boot, above everything (including the landing page when that
   branch is present). It resolves the signed-in user via auth/index.js, then
   either steps aside or holds the user at the right message:

     loading     "Checking your sign-in…" while /.auth/me is fetched
     signed-out  Sign in with Microsoft
     forbidden   signed in, but not in a permitted role
     error       platform unreachable or misconfigured

   With no provider configured it never appears — the app opens as before.

   This screen is the USER EXPERIENCE of sign-in, not the protection. The files
   are protected by the hosting platform (see auth/index.js and
   docs/sso-setup.md); by the time this code runs on a properly configured host,
   an anonymous visitor has already been redirected to Microsoft.
   ═══════════════════════════════════════════════════════════════════════════ */

import { AUTH_CONFIG, authEnabled, initAuth, signInUrl, signOutUrl } from '../auth/index.js';

const esc = s => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

let gate = null;

function build() {
  gate = document.createElement('div');
  gate.id = 'auth-gate';
  gate.className = 'auth-gate open';
  gate.setAttribute('role', 'dialog');
  gate.setAttribute('aria-live', 'polite');
  gate.innerHTML = `
    <div class="auth-card">
      <div class="auth-brand">
        <div class="auth-title">ERP Implementation Taxonomy</div>
        <div class="auth-sub">MRI PMX · Open Box Software</div>
      </div>
      <div class="auth-body" id="auth-body"></div>
    </div>`;
  document.body.appendChild(gate);
  document.body.classList.add('auth-pending');
}

function body() { return document.getElementById('auth-body'); }

function showLoading() {
  body().innerHTML = `
    <div class="auth-spinner" aria-hidden="true"></div>
    <p class="auth-msg">Checking your sign-in…</p>`;
}

function showSignedOut(isMock) {
  body().innerHTML = `
    <p class="auth-msg">Sign in with your Open Box Microsoft account to continue.</p>
    ${isMock
      // Render the real button so the screen can be previewed as users will see
      // it, but inert — there is no platform sign-in to go to in development.
      ? `<a class="auth-btn" role="button" aria-disabled="true" tabindex="-1">Sign in with Microsoft</a>
         <p class="auth-fine auth-fine-mock">Mock provider — the button is inactive in development.</p>`
      : `<a class="auth-btn" href="${esc(signInUrl())}">Sign in with Microsoft</a>`}`;
}

/* Each problem gets advice that fits it. "Ask to be added in Entra" only helps
   when the person lacks access; when the sign-in service itself cannot be
   reached, the useful steps are to retry and then report it. */
const ADVICE = {
  forbidden:   'If you think you should have access, ask an administrator to add you to the application in Microsoft Entra.',
  unavailable: 'This is usually temporary. Try again in a few minutes, and if it keeps happening, let an administrator know.',
};

function showProblem(kind, title, message, user, isMock) {
  body().innerHTML = `
    <p class="auth-msg auth-msg-strong">${esc(title)}</p>
    <p class="auth-fine">${esc(message)}</p>
    ${user ? `<p class="auth-fine">Signed in as <strong>${esc(user.name)}</strong>.</p>` : ''}
    <p class="auth-fine">${esc(ADVICE[kind])}</p>
    ${kind === 'unavailable'
      ? '<button class="auth-btn auth-btn-ghost" type="button" data-retry>Try again</button>' : ''}
    ${user && !isMock ? `<a class="auth-btn auth-btn-ghost" href="${esc(signOutUrl())}">Sign out</a>` : ''}`;
  body().querySelector('[data-retry]')?.addEventListener('click', () => location.reload());
}

function dismiss() {
  gate.classList.remove('open');
  document.body.classList.remove('auth-pending');
  setTimeout(() => gate.remove(), 250);
}

/** Small "signed in as" chip with sign-out. Goes in the landing page header
 *  slot when that exists, and in the topbar either way. */
function renderAccount(user, isMock) {
  const chip = () => {
    const el = document.createElement('div');
    el.className = 'auth-account';
    el.innerHTML = `
      <span class="auth-account-name" title="${esc(user.name)}${user.provider ? ` · ${esc(user.provider)}` : ''}">
        ${esc(user.name)}</span>
      ${isMock
        ? '<span class="auth-account-mock" title="Development mock — not a real sign-in">mock</span>'
        : `<a class="auth-account-out" href="${esc(signOutUrl())}">Sign out</a>`}`;
    return el;
  };

  const slot = document.getElementById('landing-account');
  if (slot) { slot.innerHTML = ''; slot.appendChild(chip()); }

  const actions = document.querySelector('.topbar-actions');
  if (actions && !actions.querySelector('.auth-account')) actions.prepend(chip());
}

/**
 * Run the gate. Resolves once the app may be used (signed in, or auth not
 * configured). If the user may not proceed, it never resolves — the gate stays
 * up and the app underneath is not interactive.
 */
export async function runAuthGate() {
  if (!authEnabled()) return { status: 'disabled' };

  build();
  showLoading();
  const isMock = AUTH_CONFIG.provider === 'mock';
  const auth = await initAuth();

  if (auth.status === 'signed-in') {
    renderAccount(auth.user, isMock);
    dismiss();
    return auth;
  }
  if (auth.status === 'signed-out') showSignedOut(isMock);
  else if (auth.status === 'forbidden')
    showProblem('forbidden', 'You don’t have access to this application', auth.message, auth.user, isMock);
  else
    showProblem('unavailable', 'Sign-in is unavailable', auth.message, null, isMock);

  return new Promise(() => {});   // hold here — the app must not open
}
