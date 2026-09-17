# Security Policy

## Scope

The MRI ERP Implementation Taxonomy is a client-side, single-page web
application with no backend, no user accounts, and no processing of
personal data. It stores named "version" snapshots of taxonomy content
in the browser's `localStorage` only. See
[`docs/secure-development.md`](docs/secure-development.md) for the full
threat model and architecture summary.

Given this scope, the realistic security-relevant issues are:

- A vulnerable third-party dependency (see `npm audit`)
- An XSS-style issue in how the app renders content into the DOM
- A source-repository access-control issue (branch protection, leaked
  credentials, etc.)

## Reporting a Vulnerability

If you believe you have found a security issue in this repository,
please report it privately rather than opening a public GitHub issue:

**Contact:** security@openboxsoftware.com

Please include:

- A description of the issue and its potential impact
- Steps to reproduce, or a proof-of-concept if available
- The commit hash or version you tested against

We aim to acknowledge reports within 5 business days. As this is an
internal tool with no user data and no backend, most findings will be
low severity by nature of the architecture — but we still want to hear
about them.

> **Note for maintainers:** confirm the contact address above is a
> monitored mailbox before relying on this policy; update it if the
> team's security contact changes.

## Supported Versions

Only the `master` branch is supported. There are no maintained release
branches — the deployed version is always built from the latest commit
on `master`.

## Dependency Vulnerabilities

Known dependency advisories are tracked via `npm audit` and (once
configured) GitHub Dependabot. See the repository's ISO/IEC 27001:2022
internal assessment for the current remediation status.
