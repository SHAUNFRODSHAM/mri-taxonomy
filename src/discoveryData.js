/* ═══════════════════════════════════════════════════════════════════════════
   discoveryData.js — Per-process client As-Is discovery storage

   Discovery data is stored in state.discoveryData as a flat map:
     { [processId]: AsIsEntry }

   AsIsEntry covers both Business and MRI System perspectives — the process ID
   is the key, and since business and system processes have different IDs, they
   get separate entries naturally. Each entry is version-scoped: it persists
   with the active client version and is excluded from the shared taxonomy data.
   ═══════════════════════════════════════════════════════════════════════════ */

import { state } from './state.js';

export function emptyEntry() {
  return {
    narrative:            '',
    roles:                '',
    frequency:            '',
    tools:                '',
    controls:             '',
    evidenceSource:       '',
    evidenceDate:         '',
    evidenceParticipants: '',
    evidenceConfidence:   '',
    variations:           '',
    targetState:          '',
    criticality:          '',   // '' | 'low' | 'medium' | 'high'
    discoveryStatus:      '',   // '' | 'not-started' | 'in-progress' | 'complete'
  };
}

function ensure() {
  if (!state.discoveryData) state.discoveryData = {};
}

/** Return the discovery entry for a process id (with defaults merged in). */
export function getDiscovery(processId) {
  ensure();
  return { ...emptyEntry(), ...(state.discoveryData[processId] || {}) };
}

/** Merge fields into the discovery entry for a process id. */
export function setDiscovery(processId, fields) {
  ensure();
  state.discoveryData[processId] = {
    ...emptyEntry(),
    ...(state.discoveryData[processId] || {}),
    ...fields,
  };
  document.dispatchEvent(new CustomEvent('mri:versionDirty'));
}

/** True when a process has at least one non-empty discovery field. */
export function hasDiscovery(processId) {
  ensure();
  const d = state.discoveryData[processId];
  if (!d) return false;
  return Object.values(d).some(v => v && String(v).trim().length > 0);
}

/** Deep copy of current discoveryData for serialization into a version. */
export function snapshotDiscovery() {
  return JSON.parse(JSON.stringify(state.discoveryData || {}));
}

/** Restore discoveryData from a saved version snapshot. */
export function restoreDiscovery(snapshot) {
  state.discoveryData = JSON.parse(JSON.stringify(snapshot || {}));
}

/** Clear all discovery data (for version reset). */
export function clearDiscovery() {
  state.discoveryData = {};
}
