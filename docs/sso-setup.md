# Single sign-on with Microsoft Entra ID

**Status: scaffold.** The code is in place and switched off. Nothing changes for
anyone until the app is hosted and the steps below are followed.

## How it works

The app is static: the whole taxonomy ships inside the JavaScript bundle. A
sign-in screen drawn by the app on its own would therefore be cosmetic, because
anyone who can reach the URL could still download the bundle and read it.

So sign-in is enforced by the **hosting platform**, not the app:

```
Browser ──► Azure Static Web Apps ──► not signed in? ──► Microsoft Entra sign-in
                     │                                          │
                     │◄──────────── signed in ───────────────────┘
                     ▼
            serves the app files (only now)
                     │
                     ▼
            app reads /.auth/me ──► shows "signed in as …", sign-out, role check
```

| Piece | Where | Job |
|---|---|---|
| `public/staticwebapp.config.json` | copied to the build output | **The protection.** Requires a signed-in user for every route and redirects anyone else to Entra |
| Entra app registration and enterprise app | Azure portal | Decides **who** can sign in, using "Assignment required" plus assigned users or groups |
| `src/auth/index.js` | app | Reads the signed-in user from the platform. Stores nothing |
| `src/components/authGate.js` | app | The loading, signed-out and no-access screens, plus the account chip |

No user is stored in the app: there's no list in JSON or HTML and nothing in
`localStorage`. The signed-in user is held in memory for the life of the page,
and access is managed entirely in Entra.

## Setting it up

You'll need an Azure subscription and permission to create app registrations in
the Open Box Entra tenant.

### 1. Host on Azure Static Web Apps (Standard plan)

The **Standard** plan is needed to register your own Entra application and
restrict sign-in to the Open Box tenant. The Free plan only offers the generic
built-in login, which any Microsoft account can use.

- Create the Static Web App and connect it to this repository.
- Build settings: app location `/`, output location `dist`, build command
  `npm run build`.

### 2. Register the app in Entra

In **Entra ID → App registrations → New registration**:

- **Supported account types:** this organisational directory only (single tenant).
- **Redirect URI (Web):** `https://<your-app>.azurestaticapps.net/.auth/login/aad/callback`
  (and the same for any custom domain).
- Under **Certificates & secrets**, create a client secret.
- Note the **Application (client) ID** and the **Directory (tenant) ID**.

### 3. Give the platform the credentials

In the Static Web App → **Environment variables** (app settings), add:

| Name | Value |
|---|---|
| `AZURE_CLIENT_ID` | the Application (client) ID |
| `AZURE_CLIENT_SECRET` | the client secret |

The secret lives **only** here. Never commit it, and never put it in a `VITE_`
variable, because those get baked into the public bundle.

### 4. Point the config at your tenant

In `public/staticwebapp.config.json`, replace `REPLACE-WITH-ENTRA-TENANT-ID`
with the Directory (tenant) ID. The tenant ID isn't secret.

Until this is replaced, sign-in fails on a hosted build. That's deliberate:
it fails closed rather than open.

### 5. Decide who gets in

In **Entra ID → Enterprise applications → (this app) → Properties**, set
**Assignment required = Yes**. Then under **Users and groups**, assign the
people or security groups allowed in (for example `SG-Taxonomy-Users`).

That's the access control. Anyone not assigned is refused by Microsoft at
sign-in and never reaches the app.

**Finer control (optional):** define app roles on the registration (for example
`taxonomy.user` or `taxonomy.admin`) and assign groups to roles. Roles arrive in
the user's `userRoles`. To require one, set `VITE_AUTH_REQUIRED_ROLE` (below).
Routes can also be restricted by role in `staticwebapp.config.json`.

### 6. Switch the app's sign-in screens on

Set this in the build environment (the Static Web Apps build configuration or
the GitHub Actions workflow):

```
VITE_AUTH_PROVIDER=swa
VITE_AUTH_REQUIRED_ROLE=          # optional, e.g. taxonomy.user
```

Rebuild and deploy. Vite reads these at **build** time.

## Trying the screens locally

Hosting isn't needed to see the sign-in states. Copy `.env.example` to
`.env.local`, set:

```
VITE_AUTH_PROVIDER=mock
VITE_AUTH_MOCK_STATE=signed-in    # or: signed-out | no-role | error
```

Then restart `npm run dev`. Use `no-role` together with
`VITE_AUTH_REQUIRED_ROLE=taxonomy.user` to see the "no access" screen. The mock
provider refuses to run in a production build.

## Using App Service instead

App Service **Authentication** ("Easy Auth") exposes the same `/.auth/me`
endpoint, so `VITE_AUTH_PROVIDER=swa` works unchanged. Configure Entra as the
identity provider in the portal with "Require authentication" turned on, and use
the same Entra assignment for access. `staticwebapp.config.json` isn't used on
App Service; the portal setting takes its place.

## Not covered by this scaffold

- **Shared storage.** Signing in doesn't make saved taxonomies visible to
  colleagues. Versions still live in each browser's `localStorage` until the
  database backend lands (story 3274). Once it does, the signed-in user's ID is
  what records should be keyed against.
- **Per-user permissions inside the app,** such as read-only reviewers versus
  editors. The role plumbing exists (`userRoles`), but nothing in the UI acts on
  it yet.
