/* ═══════════════════════════════════════════════════════════════════════════
   versions.js — localStorage CRUD for named version snapshots
   ═══════════════════════════════════════════════════════════════════════════ */

const STORAGE_KEY = 'mri_taxonomy_versions';

/** @returns {Array} */
export function listVersions() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

/**
 * Save a new named version.
 * @param {string} name
 * @param {Object} dataSnapshot  — deep copy of ALL_DATA at save time
 * @param {Array}  customModules — [{id, config}] for non-built-in tabs
 * @returns {string} new version id
 */
export function saveNewVersion(name, dataSnapshot, customModules = []) {
  const id = 'v_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
  const versions = listVersions();
  versions.push({
    id,
    name:          name.trim(),
    createdAt:     new Date().toISOString(),
    data:          dataSnapshot,
    customModules,
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(versions));
  return id;
}

/** Rename an existing version in-place. */
export function renameVersion(id, newName) {
  const versions = listVersions().map(v =>
    v.id === id ? { ...v, name: newName.trim() } : v
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(versions));
}

/** Delete a version by id. */
export function deleteVersion(id) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(listVersions().filter(v => v.id !== id))
  );
}

/** Get a single version object, or null if not found. */
export function getVersion(id) {
  return listVersions().find(v => v.id === id) || null;
}

/** Overwrite the data in an existing version (save changes). */
export function updateVersionData(id, dataSnapshot, customModules = []) {
  const versions = listVersions().map(v =>
    v.id === id
      ? { ...v, data: dataSnapshot, customModules, updatedAt: new Date().toISOString() }
      : v
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(versions));
}

/** Format an ISO date string for display. */
export function formatDate(isoStr) {
  try {
    return new Date(isoStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return isoStr;
  }
}
