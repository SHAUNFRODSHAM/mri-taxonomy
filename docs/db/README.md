# Relational Database Schema — Proposal (for review)

**Status: DRAFT FOR REVIEW.** Nothing here is wired into the running application.
This folder proposes a relational (SQL) model for the taxonomy content that today
lives in static JavaScript data files (`src/data/*.js`) and browser
`localStorage`. It exists so the team can review the shape before deciding whether
to invest in a backend.

- [`schema.sql`](./schema.sql) — the candidate DDL (PostgreSQL 14+).

---

## 1. Why this is a change of architecture, not just a schema

The app today is a **static site with no server**:

- **Content** is authored as nested JavaScript objects in `src/data/*.js` and
  compiled into the bundle at build time.
- **Client versions** are full JSON snapshots saved in the browser's
  `localStorage` — they never leave the machine and don't sync between users.

Moving to a database means introducing a **backend/API** in front of the SQL
store. The schema is the easy part; the app would need a data-access layer to
replace direct imports of the JS files. This proposal covers the **data model
only** — the API/hosting decision is separate.

**What a database buys us:** multi-user editing, shared client versions,
concurrent access, referential integrity on links, and real querying (e.g.
"every business process tagged *Partial* with no system link").

---

## 2. The core insight — it's a tree

All module content is a 3-level tree:

```
Module ── Column ── Process ── Sub-process
```

Processes and sub-processes have an **identical shape** (`desc`, `activities[]`,
`mri_title`, `mri_prereqs[]`, `mri_assoc[]`), and a column is just the level
above. So the model is:

- **`module`** — one row per system module (GL, CM, AP, RM, JC, CAR, B&F, IA,
  FAA) and per business value stream. `domain` = `system` | `business`.
- **`node`** — one self-referencing table for the whole tree. `parent_id IS NULL`
  ⇒ column; `node_type` ∈ {column, process, sub}. A trigger caps depth at 3.
- **`activity` / `mri_prereq` / `mri_assoc`** — the ordered lists, keyed by
  `(node_id, seq)` so display order survives.
- **`link`** — business↔system many-to-many (coverage lives on the business
  `node`, not on the link).
- **`market` / `vertical` / `node_market` / `node_vertical` / `node_standard`** —
  the business-side dimensions (market variation, sector detail, standards).

### Mapping from the current JS model

| JS (today) | SQL (proposed) |
|---|---|
| `MODULE_CONFIG[key]` | `module` row |
| Column object `{ id, title, processes[] }` | `node` (`node_type='column'`) |
| Process `{ id, title, desc, mri_title, … }` | `node` (`node_type='process'`) |
| Sub `{ id, title, desc, … }` | `node` (`node_type='sub'`, `parent_id`=process) |
| `activities: [ … ]` | `activity` rows |
| `mri_prereqs: [ … ]` | `mri_prereq` rows |
| `mri_assoc: [ {name, desc} ]` | `mri_assoc` rows |
| `links.js` connections | `link` rows |
| business `coverage` tag | `node.coverage` |
| system effective scope | `v_effective_scope` view |

Node ids stay the **existing human-readable strings** (e.g.
`gl-journals-operational`) so there's a 1:1 mapping and the migration is
loss-free.

The live content is currently **9 modules · 86 columns · 185 processes · 201
sub-processes**, so `node` would hold ~472 content rows plus the list children.

---

## 3. Versioning — the one real decision

Today each saved "client version" is a full localStorage snapshot. In SQL there
are two credible options:

### Option A — Snapshot per version *(what the DDL implements)*
Keep the base tables as the canonical "original/factory" content, and store each
saved version as a full copy in parallel `version_*` tables
(`version_node`, `version_activity`, `version_link`,
`version_module_visibility`, …), keyed by `version_id`.

- ✅ Simple, mirrors today's mental model; trivial to load/delete a whole version.
- ✅ Original content is never mutated.
- ⚠️ Storage grows per version (fine at this scale — a few hundred rows each).

### Option B — Base + delta overrides
One canonical set of nodes, plus a `version_override` table holding only what a
client changed (edited text, added/removed links, scope/coverage tags, hidden
modules).

- ✅ Much smaller storage; natural diffing ("what did this client change?").
- ⚠️ Every read must merge base + overrides — more query/app complexity.

**Recommendation:** start with **Option A** (snapshot). Move to **Option B** only
if version count or diffing needs justify it. The two are compatible — you can
migrate A→B later without changing the base content model.

> Note: the DDL sketches the main `version_*` tables. For brevity it omits the
> per-version copies of `mri_prereq`, `mri_assoc`, and the business dimensions —
> they follow the exact same pattern (base table + leading `version_id`).

---

## 4. Design notes & conventions

- **Dialect:** PostgreSQL 14+. On SQL Server/MySQL: swap `gen_random_uuid()` for
  the local UUID function, `text` → `nvarchar(max)`, and rewrite the depth
  trigger in the local procedural dialect (or drop it and enforce depth in the
  app).
- **Enums as CHECK constraints** (coverage, scope, node_type, domain) — kept as
  `text + CHECK` for portability rather than native `ENUM` types.
- **Ordering** is explicit via `sort_order` / `seq` columns — the app renders in
  a deliberate order, which a set-based store must preserve.
- **Cascade deletes** from `node` clean up the child lists automatically.
- **`v_effective_scope`** reproduces the app's rule that an untagged, unlinked
  system process is auto *out-of-scope*, so that logic lives in one place.

---

## 5. Open questions for reviewers

1. **Backend/API** — is a server on the roadmap at all, or is this purely
   exploratory? (Determines whether we build the data-access layer next.)
2. **Versioning model** — Option A (snapshot) vs Option B (delta)? Any
   expectation on how many client versions will exist?
3. **Auth & multi-tenant** — will multiple clients/consultants share one
   database (needs `client`/tenant scoping + roles), or one DB per engagement?
4. **RM's two extra columns** — Maintenance and Vendor/Payables sit outside the
   RM taxonomy but are link-referenced. Keep as-is in the model, or normalise
   differently?
5. **Business vs system in one `node` table** vs two — this proposal unifies
   them under `module.domain`. Preference?

---

*Prepared as a discussion starter. Happy to iterate the DDL, produce a seed
export from the current JS data (INSERT statements), or draft an ERD diagram on
request.*
