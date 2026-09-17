# Secure Development Notes

This document records the security-relevant architecture and coding
conventions of the MRI ERP Implementation Taxonomy, so the app's
low-risk posture is documented rather than assumed. It supports
ISO/IEC 27001:2022 Annex A controls 8.25 (secure development
lifecycle) and 8.27 (secure system architecture), referenced in the
repository's internal ISO 27001 assessment (`docs/` or wherever that
report is filed).

## Threat model summary

| Property | Finding |
|---|---|
| Architecture | Pure client-side single-page app. No backend, no server, no API. |
| Authentication | None. The app has no login, users, or sessions. |
| Data at rest | Browser `localStorage` only (named taxonomy version snapshots). |
| Personal data (PII) | None processed. Content is ERP process taxonomy, not personal data. |
| Network calls | One local-asset fetch for the export logo; no external endpoints. |
| Secrets / credentials | None in the repository. |
| Hosting | Static assets (`dist/`); source hosted on GitHub. |

**Consequence:** there is no user data to breach, no credentials to
steal, no server to compromise, and no network attack surface beyond
the static host. The realistic threats are:

1. **Supply chain** — a vulnerable dependency shipping in `node_modules`.
2. **DOM / XSS via authored content** — the app builds UI from template
   strings (`innerHTML`). Content is team-authored taxonomy data, not
   untrusted external input, so live exploitation risk is low, but the
   pattern is unbounded and must stay disciplined (see below).
3. **Source-repository compromise** — mitigated by GitHub access
   control; hardened by branch protection and org-wide 2FA.

## Secure coding conventions

### Escaping dynamic content in the DOM

Several components build markup via `innerHTML` for layout flexibility
(there is no framework providing this by default). Any value
interpolated into an `innerHTML` template that did not originate as a
hardcoded string literal in the source **must** be passed through the
shared `esc()` helper (see `mappingView.js` for the reference
implementation) before interpolation:

```js
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                          .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
```

Where a node only ever needs to display plain text (no nested markup),
prefer `textContent` over `innerHTML` — it never interprets its input
as HTML, so there is nothing to escape.

### Dependency hygiene

- Run `npm audit` before merging any dependency change.
- Prefer the smallest version bump that resolves an advisory. A major
  version jump (e.g. a build-tool upgrade) carries real breaking-change
  risk to the build pipeline and should be tested (`npm run build`,
  `npm run dev`) before being treated as "the fix", even if `npm audit
  fix --force` suggests it.
- Where an advisory sits in a transitive dependency that its direct
  parent has not updated (e.g. a sub-dependency pinned below a patched
  version), prefer an `overrides` entry in `package.json` over
  downgrading the parent package.
- `exceljs` and its dependency tree are used only by the offline
  `tools/*.js` export scripts, not the shipped application runtime —
  advisories in that tree carry lower real-world exposure than one in
  the app's own runtime dependencies.

### No secrets in the repository

Never commit API keys, tokens, passwords, or connection strings.
There is currently nothing in this application that requires one — if
a future feature needs a credential, it must be supplied at build/
deploy time via environment configuration, never checked into source.

## Change management

- All changes go through Git with author attribution.
- `CHANGELOG.md` is kept up to date.
- (Recommended, see repository's ISO assessment) branch protection on
  `master` — required PR review, no direct pushes — plus CI checks
  (`npm audit`, Dependabot, CodeQL) on every PR.

## What this document is not

This is not a certificate of compliance and does not represent the
opinion of an accredited certification body. It is an internal record
of the application's architecture and coding conventions, intended to
keep this low-risk posture true over time as the codebase changes.
