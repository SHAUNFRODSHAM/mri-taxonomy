import { ALL_DATA, MODULE_CONFIG, ORIGINAL_DATA } from './data/index.js';
import { BUSINESS_DATA } from './data/business/index.js';

export { ALL_DATA, MODULE_CONFIG, ORIGINAL_DATA };

export const state = {
  // View mode — 'business' (business-process taxonomy, the default starting
  // point of the methodology) | 'system' (MRI PMX) | 'mapping' (matrix).
  viewMode: 'business',
  // Business-view state (independent of the system view)
  businessTab: 'vs-l2c',
  // Business-view filters are multi-select sets; the selection drives what the
  // detail panel shows (markets/verticals) and which areas are in scope (entity).
  markets:   ['UK', 'US', 'EU'],                              // subset of MARKETS
  verticals: ['Retail', 'Industrial', 'Office', 'Residential'], // subset of sectors
  entities:  ['reit', 'pm', 'dev'],                           // subset of ENTITY_TYPES
  // Coverage filter (Value Streams) — multi-select of item coverage tags
  coverageFilters: ['full', 'partial', 'outside', 'untagged'],
  currentTab: 'cm',
  editMode: false,
  addTarget: null,
  openPanelId: null,
  editTargetId: null,
  history: [],
  // Version tracking
  activeVersionId:   'original',
  activeVersionName: 'Original',
  isDirty:           false,
  // Scope filter (System view) — multi-select set of the scope keys to show.
  // All four selected = show everything. Resets on every tab switch.
  scopeFilters: ['core', 'custom', 'out-of-scope', 'untagged'],
  // Per-module visibility. Map of tabId -> boolean. A tab is visible unless
  // explicitly set to false. Persisted as part of each saved version so a
  // client version can show only the modules in that client's scope.
  moduleVisibility: {},
  // Business ⇄ system links: [{ b, s, coverage, note }]. Seeded from
  // SEED_LINKS at boot, editable during discovery, persisted per version.
  links: [],
  // Which processes are expanded to reveal their sub-processes (id -> true).
  // Collapsed by default; a scope filter force-expands so matches stay visible.
  expandedProcs: {},
};

/** A module is visible unless explicitly hidden. */
export function isModuleVisible(tab) {
  return state.moduleVisibility[tab] !== false;
}

export const MAX_HIST = 20;

// Renderer registration — main.js sets this so components can trigger re-renders
let _renderFn = null;
export function registerRender(fn) { _renderFn = fn; }
export function triggerRender() { if (_renderFn) _renderFn(); }

export function currentData() {
  return ALL_DATA[state.currentTab];
}

export function snapshot() {
  // View-aware: capture the active business module when in the Business view,
  // otherwise the active system module. Undo restores to the right view.
  if (state.viewMode === 'business') {
    state.history.push({
      view: 'business',
      tab: state.businessTab,
      data: JSON.parse(JSON.stringify(BUSINESS_DATA[state.businessTab])),
    });
  } else {
    state.history.push({
      view: 'system',
      tab: state.currentTab,
      data: JSON.parse(JSON.stringify(ALL_DATA[state.currentTab])),
    });
  }
  if (state.history.length > MAX_HIST) state.history.shift();
  state.isDirty = true;
}

export function findItem(id) {
  for (const col of currentData()) {
    for (const proc of col.processes) {
      if (proc.id === id) return proc;
      for (const sub of (proc.subs || [])) {
        if (sub.id === id) return sub;
      }
    }
  }
  return null;
}

export function findBreadcrumb(id) {
  for (const col of currentData()) {
    for (const proc of col.processes) {
      if (proc.id === id) return col.title;
      for (const sub of (proc.subs || [])) {
        if (sub.id === id) return `${col.title} › ${proc.title}`;
      }
    }
  }
  return '';
}
