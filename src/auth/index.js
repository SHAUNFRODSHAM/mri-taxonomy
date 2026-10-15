/* ═══════════════════════════════════════════════════════════════════════════
   auth/index.js — sign-in seam (Microsoft Entra ID via the hosting platform)

   SCAFFOLD. Off by default: with no configuration the app behaves exactly as it
   always has. Switched on per environment at build time — see docs/sso-setup.md.

   ── Why the platform, not the app, does the signing in ─────────────────────
   This is a static app: the whole taxonomy ships inside the JavaScript bundle.
   A sign-in screen drawn by the app itself would be cosmetic — anyone who can
   reach the URL could still fetch the bundle and read every word. Real
   protection has to stop the FILES being served to anonymous visitors, and
   that is done by the host:

     Azure Static Web Apps (or App Service "Easy Auth") is configured to use
     Entra ID. public/staticwebapp.config.json requires an authenticated user
     for every route, so an anonymous request is redirected to Microsoft sign-in
     before a single byte of the app is delivered.

   This module only READS the result. The platform exposes the signed-in user
   at /.auth/me; we fetch it to show who is signed in, offer sign-out, and
   optionally check an app role. Nothing about the user is written anywhere —
   no localStorage, no JSON, no HTML. It lives in memory for the page's life.

   Which people get in is decided in Entra, not here: on the Entra enterprise
   application set "Assignment required" and assign the permitted users or
   security groups. Groups can also be mapped to app roles, which arrive in
   userRoles and can be checked via VITE_AUTH_REQUIRED_ROLE.

   ── Providers (VITE_AUTH_PROVIDER) ──────────────────────────────────────────
     none   default. No sign-in; the app opens as before. Local dev and the
            current unhosted setup.
     swa    Azure Static Web Apps / App Service built-in auth via /.auth/*.
     mock   DEVELOPMENT ONLY. Simulates the platform's answer so the gate's
            states can be exercised without hosting. Refused in production
            builds.
   ═══════════════════════════════════════════════════════════════════════════ */

const env = import.meta.env;

export const AUTH_CONFIG = Object.freeze({
  provider:     (env.VITE_AUTH_PROVIDER || 'none').toLowerCase(),
  // Optional app role a user must hold, e.g. 'taxonomy.user'. Empty = any
  // signed-in user the platform let through (Entra assignment already limits that).
  requiredRole: (env.VITE_AUTH_REQUIRED_ROLE || '').trim(),
  // Platform paths. 'aad' is the Static Web Apps identifier for Entra ID.
  loginPath:    env.VITE_AUTH_LOGIN_PATH  || '/.auth/login/aad',
  logoutPath:   env.VITE_AUTH_LOGOUT_PATH || '/.auth/logout',
  mePath:       env.VITE_AUTH_ME_PATH     || '/.auth/me',
  mockState:    (env.VITE_AUTH_MOCK_STATE || 'signed-in').toLowerCase(),
});

/**
 * Resolved auth state.
 *   status: 'disabled'   — no provider configured; app opens as normal
 *           'signed-in'  — user present (and holds the required role, if any)
 *           'signed-out' — platform reports no user
 *           'forbidden'  — signed in, but missing the required role
 *           'error'      — the platform could not be reached or misconfigured
 *   user:   { name, id, provider, roles } | null
 */
let current = { status: 'disabled', user: null, message: '' };

export function getAuth() { return current; }

/** Normalise a platform clientPrincipal into the shape the UI uses. */
function toUser(p) {
  if (!p) return null;
  return {
    name:     p.userDetails || 'Signed-in user',
    id:       p.userId || '',
    provider: p.identityProvider || '',
    roles:    Array.isArray(p.userRoles) ? p.userRoles : [],
  };
}

function decide(user) {
  if (!user) return { status: 'signed-out', user: null, message: '' };
  if (AUTH_CONFIG.requiredRole && !user.roles.includes(AUTH_CONFIG.requiredRole)) {
    return { status: 'forbidden', user,
      message: `Your account is signed in but does not have the "${AUTH_CONFIG.requiredRole}" role.` };
  }
  return { status: 'signed-in', user, message: '' };
}

const MOCK_PRINCIPALS = {
  'signed-in': { userDetails: 'Test User (mock)', userId: 'mock-0001', identityProvider: 'aad',
                 userRoles: ['anonymous', 'authenticated', 'taxonomy.user'] },
  'no-role':   { userDetails: 'Test User (mock)', userId: 'mock-0002', identityProvider: 'aad',
                 userRoles: ['anonymous', 'authenticated'] },
};

/** Resolve the current user once, at boot. Never throws. */
export async function initAuth() {
  const { provider } = AUTH_CONFIG;

  if (provider === 'none' || !provider) {
    current = { status: 'disabled', user: null, message: '' };
    return current;
  }

  if (provider === 'mock') {
    if (env.PROD) {
      current = { status: 'error', user: null,
        message: 'The mock sign-in provider is for development only and is disabled in production builds.' };
      return current;
    }
    await new Promise(r => setTimeout(r, 400));     // let the loading state be seen
    const s = AUTH_CONFIG.mockState;
    if (s === 'signed-out') current = decide(null);
    else if (s === 'error') current = { status: 'error', user: null, message: 'Simulated platform error (mock).' };
    else current = decide(toUser(MOCK_PRINCIPALS[s] || MOCK_PRINCIPALS['signed-in']));
    return current;
  }

  if (provider === 'swa') {
    try {
      const res = await fetch(AUTH_CONFIG.mePath, { credentials: 'same-origin', cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // Check the content type explicitly. Without a platform in front (local
      // dev, or a host with auth not switched on) this path typically comes
      // back 200 with the app's own index.html as a fallback — so res.ok alone
      // would PASS. Only a JSON answer counts as the platform speaking.
      const type = res.headers.get('content-type') || '';
      if (!type.includes('application/json')) throw new Error(`expected JSON, got "${type || 'no content type'}"`);
      const body = await res.json();
      current = decide(toUser(body && body.clientPrincipal));
    } catch (e) {
      // Detail for whoever is diagnosing; a plain sentence for the user.
      console.warn('[auth] /.auth/me check failed:', e.message);
      current = { status: 'error', user: null,
        message: 'The sign-in service did not respond. The app may not yet be hosted with sign-in switched on — please contact an administrator.' };
    }
    return current;
  }

  current = { status: 'error', user: null, message: `Unknown sign-in provider "${provider}".` };
  return current;
}

/** Where the platform sign-in / sign-out round trips start. Returning to the
 *  current page keeps the user where they were. */
export function signInUrl() {
  const back = encodeURIComponent(location.pathname + location.search);
  return `${AUTH_CONFIG.loginPath}?post_login_redirect_uri=${back}`;
}
export function signOutUrl() {
  return `${AUTH_CONFIG.logoutPath}?post_logout_redirect_uri=${encodeURIComponent('/')}`;
}

/** Whether a sign-in provider is configured at all. */
export function authEnabled() {
  return AUTH_CONFIG.provider !== 'none' && !!AUTH_CONFIG.provider;
}
