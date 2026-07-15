-- ============================================================================
-- MRI ERP Implementation Taxonomy — Relational Database Schema (PROPOSAL)
--
-- Status:   DRAFT FOR REVIEW. Not wired into the running app.
-- Dialect:  PostgreSQL 14+ (notes included where another dialect differs).
-- Purpose:  A candidate relational model for the taxonomy content that today
--           lives in static JS data files (src/data/*.js) + browser localStorage.
--
-- The app content is a TREE (module -> column -> process -> sub-process). Trees
-- normalise cleanly: one self-referencing `node` table for the hierarchy, plus
-- child tables for the ordered lists (activities, prerequisites, MRI screens),
-- the business<->system links, business dimensions, and client versioning.
--
-- See docs/db/README.md for the rationale, mapping from the JS model, and the
-- versioning trade-offs.
-- ============================================================================

-- Enable UUIDs (versions/audit). Content ids stay human-readable text (e.g.
-- 'gl-journals-operational') to match the existing app ids 1:1.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. MODULES
--    One row per system module (GL, CM, AP, RM, JC, CAR, B&F, IA, FAA) and per
--    business value stream. `domain` separates the two sides of the app.
-- ----------------------------------------------------------------------------
CREATE TABLE module (
    id             text PRIMARY KEY,                 -- 'gl', 'cm', 'vs-l2c', ...
    label          text NOT NULL,                    -- 'General Ledger'
    domain         text NOT NULL
                     CHECK (domain IN ('system','business')),
    header_class   text,                             -- CSS class, system view
    header_color   text,                             -- business view banner colour
    icon           text,                             -- material symbol / emoji
    note           text,                             -- stream/module tooltip
    is_placeholder boolean NOT NULL DEFAULT false,   -- ⚠ awaiting SME review
    is_supporting  boolean NOT NULL DEFAULT false,   -- business: supporting stream
    sort_order     int  NOT NULL
);

-- ----------------------------------------------------------------------------
-- 2. NODE  (the taxonomy tree: column -> process -> sub-process)
--    A single self-referencing table. `parent_id IS NULL` => column (top level).
--    process/sub carry the descriptive + MRI fields; columns leave them NULL.
-- ----------------------------------------------------------------------------
CREATE TABLE node (
    id           text PRIMARY KEY,                   -- 'gl-journals-operational'
    module_id    text NOT NULL REFERENCES module(id) ON DELETE CASCADE,
    parent_id    text REFERENCES node(id) ON DELETE CASCADE,
    node_type    text NOT NULL
                   CHECK (node_type IN ('column','process','sub')),
    title        text NOT NULL,
    description  text,                               -- NULL for columns
    mri_title    text,                               -- system side (nav path)
    note         text,                               -- column hover tooltip
    sort_order   int  NOT NULL,

    -- business-side tag (NULL on system nodes)
    coverage     text CHECK (coverage IN ('full','partial','outside')),
    -- system-side manual scope tag (effective scope is derived, see README)
    scope        text CHECK (scope IN ('core','custom','out-of-scope')),
    needs_enrichment boolean NOT NULL DEFAULT false,

    -- Structural guards:
    --  * columns must sit at the module root (no parent)
    --  * processes/subs must have a parent
    CONSTRAINT chk_column_root CHECK (
        (node_type = 'column' AND parent_id IS NULL) OR
        (node_type <> 'column' AND parent_id IS NOT NULL)
    )
);

CREATE INDEX idx_node_module ON node (module_id, sort_order);
CREATE INDEX idx_node_parent ON node (parent_id, sort_order);
CREATE INDEX idx_node_type   ON node (node_type);

-- Depth is capped at 3 (column -> process -> sub); a sub cannot have children.
-- Enforced with a trigger since a plain CHECK cannot see the parent's type.
CREATE OR REPLACE FUNCTION trg_node_depth() RETURNS trigger AS $$
DECLARE parent_type text;
BEGIN
    IF NEW.parent_id IS NULL THEN
        RETURN NEW;                                  -- column, fine
    END IF;
    SELECT node_type INTO parent_type FROM node WHERE id = NEW.parent_id;
    IF parent_type = 'sub' THEN
        RAISE EXCEPTION 'sub-processes cannot have children (node %)', NEW.id;
    END IF;
    IF NEW.node_type = 'process' AND parent_type <> 'column' THEN
        RAISE EXCEPTION 'a process must sit under a column (node %)', NEW.id;
    END IF;
    IF NEW.node_type = 'sub' AND parent_type <> 'process' THEN
        RAISE EXCEPTION 'a sub must sit under a process (node %)', NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER node_depth_guard
    BEFORE INSERT OR UPDATE ON node
    FOR EACH ROW EXECUTE FUNCTION trg_node_depth();

-- ----------------------------------------------------------------------------
-- 3. ORDERED LIST CHILDREN
--    activities[], mri_prereqs[], mri_assoc[] from the JS model become rows,
--    keyed by (node_id, seq) so display order is preserved.
-- ----------------------------------------------------------------------------
CREATE TABLE activity (
    node_id text NOT NULL REFERENCES node(id) ON DELETE CASCADE,
    seq     int  NOT NULL,
    text    text NOT NULL,
    PRIMARY KEY (node_id, seq)
);

CREATE TABLE mri_prereq (
    node_id text NOT NULL REFERENCES node(id) ON DELETE CASCADE,
    seq     int  NOT NULL,
    text    text NOT NULL,
    PRIMARY KEY (node_id, seq)
);

CREATE TABLE mri_assoc (                             -- associated MRI screens
    node_id     text NOT NULL REFERENCES node(id) ON DELETE CASCADE,
    seq         int  NOT NULL,
    name        text NOT NULL,                       -- 'GL > Journal Entry Management'
    description text NOT NULL,                       -- what it does in context
    PRIMARY KEY (node_id, seq)
);

-- ----------------------------------------------------------------------------
-- 4. BUSINESS <-> SYSTEM LINKS
--    Plain many-to-many connection. Coverage is a property of the business node
--    (node.coverage), not of the link. A business process tagged full/partial
--    is expected to have >= 1 link (warn-but-allow in the app).
-- ----------------------------------------------------------------------------
CREATE TABLE link (
    business_node_id text NOT NULL REFERENCES node(id) ON DELETE CASCADE,
    system_node_id   text NOT NULL REFERENCES node(id) ON DELETE CASCADE,
    PRIMARY KEY (business_node_id, system_node_id)
);
CREATE INDEX idx_link_system ON link (system_node_id);

-- ----------------------------------------------------------------------------
-- 5. BUSINESS DIMENSIONS (value-stream nodes only)
--    Market variation, vertical/sector detail, and standards & frameworks.
-- ----------------------------------------------------------------------------
CREATE TABLE market (
    id    text PRIMARY KEY,                          -- 'UK','US','EU'
    label text NOT NULL,                             -- 'United Kingdom'
    sort_order int NOT NULL
);

CREATE TABLE vertical (
    id    text PRIMARY KEY,                          -- 'Retail','Office',...
    label text NOT NULL,
    color text,
    sort_order int NOT NULL
);

CREATE TABLE node_market (                           -- per-market narrative block
    node_id   text NOT NULL REFERENCES node(id) ON DELETE CASCADE,
    market_id text NOT NULL REFERENCES market(id),
    detail    text NOT NULL,
    PRIMARY KEY (node_id, market_id)
);

CREATE TABLE node_vertical (                         -- per-sector narrative block
    node_id     text NOT NULL REFERENCES node(id) ON DELETE CASCADE,
    vertical_id text NOT NULL REFERENCES vertical(id),
    detail      text NOT NULL,
    PRIMARY KEY (node_id, vertical_id)
);

CREATE TABLE node_standard (                         -- IFRS 16, ASC 842, EPRA...
    node_id text NOT NULL REFERENCES node(id) ON DELETE CASCADE,
    seq     int  NOT NULL,
    name    text NOT NULL,
    PRIMARY KEY (node_id, seq)
);

-- ============================================================================
-- 6. CLIENT VERSIONING
--    The app saves named client snapshots (today: localStorage). Two options
--    are documented in README.md. This schema implements the recommended
--    SNAPSHOT-PER-VERSION approach as an OVERLAY, so the tables above remain the
--    canonical/original ("factory") content and each version stores only its own
--    copy of the mutable data.
--
--    * version 'original' is implicit = the base tables above.
--    * a saved version stores full copies of nodes/links/tags/notes/visibility.
--    Swap to the delta model later if storage/diffing warrants it.
-- ============================================================================
CREATE TABLE version (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name        text NOT NULL,
    client      text,
    is_original boolean NOT NULL DEFAULT false,
    created_at  timestamptz NOT NULL DEFAULT now(),
    created_by  text,
    UNIQUE (name)
);

-- Per-version copy of a node's mutable fields + content. (Structure mirrors the
-- base `node` + its list children; PK includes version_id.)
CREATE TABLE version_node (
    version_id  uuid NOT NULL REFERENCES version(id) ON DELETE CASCADE,
    id          text NOT NULL,                       -- same node id space
    module_id   text NOT NULL,
    parent_id   text,
    node_type   text NOT NULL
                  CHECK (node_type IN ('column','process','sub')),
    title       text NOT NULL,
    description text,
    mri_title   text,
    note        text,
    sort_order  int  NOT NULL,
    coverage    text CHECK (coverage IN ('full','partial','outside')),
    scope       text CHECK (scope IN ('core','custom','out-of-scope')),
    needs_enrichment boolean NOT NULL DEFAULT false,
    client_note text,                                -- per-version client note
    PRIMARY KEY (version_id, id)
);
CREATE INDEX idx_vnode_module ON version_node (version_id, module_id, sort_order);

CREATE TABLE version_activity (
    version_id uuid NOT NULL REFERENCES version(id) ON DELETE CASCADE,
    node_id    text NOT NULL,
    seq        int  NOT NULL,
    text       text NOT NULL,
    PRIMARY KEY (version_id, node_id, seq)
);

CREATE TABLE version_link (
    version_id       uuid NOT NULL REFERENCES version(id) ON DELETE CASCADE,
    business_node_id text NOT NULL,
    system_node_id   text NOT NULL,
    PRIMARY KEY (version_id, business_node_id, system_node_id)
);

-- Which modules are visible in a given version (default visible unless a row
-- says otherwise).
CREATE TABLE version_module_visibility (
    version_id uuid NOT NULL REFERENCES version(id) ON DELETE CASCADE,
    module_id  text NOT NULL REFERENCES module(id),
    visible    boolean NOT NULL,
    PRIMARY KEY (version_id, module_id)
);

-- (version_mri_prereq / version_mri_assoc / version_node_market etc. follow the
--  same pattern as their base tables with a leading version_id — omitted here
--  for brevity; see README for the full list.)

-- ============================================================================
-- 7. CONVENIENCE VIEW — effective system scope
--    In the app, a system process with no manual scope tag AND no business link
--    is treated as auto "out-of-scope". This view reproduces that rule so the
--    same logic isn't re-implemented per client.
-- ============================================================================
CREATE VIEW v_effective_scope AS
SELECT n.id AS node_id,
       n.module_id,
       COALESCE(
         n.scope,
         CASE WHEN EXISTS (SELECT 1 FROM link l WHERE l.system_node_id = n.id)
              THEN 'core' ELSE 'out-of-scope' END
       )                                             AS effective_scope,
       (n.scope IS NULL)                             AS is_auto
FROM   node n
JOIN   module m ON m.id = n.module_id AND m.domain = 'system'
WHERE  n.node_type IN ('process','sub');

-- ============================================================================
-- End of proposal DDL.
-- ============================================================================
