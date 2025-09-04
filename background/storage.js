// Storage and settings module (MV3 service worker context)
// Schema: { version:1, defaultServerId?:string, servers: Server[] }
// sync: GLOBAL settings; local: status + logs (bounded)

/** @typedef {{ id: string, name: string, description?: string, url?: string, enabled?: boolean }} Server */
/** @typedef {{ version: number, defaultServerId?: string, servers: Server[] }} GlobalSettings */

export const SETTINGS_VERSION = 1;

export const STORAGE_KEYS = {
  GLOBAL: "mcp.webbridge.global.v1",
  STATUS: "mcp.webbridge.status.v1",
  LOGS: "mcp.webbridge.logs.v1",
  INSTALLED_AT: "mcp.webbridge.installedAt",
};

export const LOG_CAP = 500;

/** @returns {Promise<GlobalSettings|null>} */
export function readGlobalSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get([STORAGE_KEYS.GLOBAL], (obj) => {
      resolve(obj[STORAGE_KEYS.GLOBAL] || null);
    });
  });
}

/** @param {GlobalSettings} settings */
export function writeGlobalSettings(settings) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [STORAGE_KEYS.GLOBAL]: settings }, () => resolve());
  });
}

/** @returns {Promise<Record<string, any>>} */
export function readStatuses() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEYS.STATUS], (obj) => {
      resolve(obj[STORAGE_KEYS.STATUS] || {});
    });
  });
}

/** @param {Record<string, any>} statuses */
export function writeStatuses(statuses) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEYS.STATUS]: statuses }, () => resolve());
  });
}

/** @returns {Promise<Array<{t:number,level:string,msg:string,meta?:any}>>} */
export function readLogs() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEYS.LOGS], (obj) => {
      resolve(obj[STORAGE_KEYS.LOGS] || []);
    });
  });
}

/** @param {Array<{t:number,level:string,msg:string,meta?:any}>} logs */
export function writeLogs(logs) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEYS.LOGS]: logs.slice(-LOG_CAP) }, () => resolve());
  });
}

/** @returns {Promise<number|null>} */
export function readInstalledAt() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEYS.INSTALLED_AT], (obj) => {
      resolve(obj[STORAGE_KEYS.INSTALLED_AT] || null);
    });
  });
}

/** @param {number} ts */
export function writeInstalledAt(ts) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEYS.INSTALLED_AT]: ts }, () => resolve());
  });
}

/** Seed with only one Local Echo placeholder (disabled by default). */
function createSeedServers() {
  /** @type {Server[]} */
  const servers = [
    {
      id: "local-echo",
      name: "Local Echo",
      description: "Dev placeholder for sanity checks",
      enabled: false,
    },
  ];
  return servers;
}

/** Ensure settings exist and are migrated to latest version */
export async function ensureSettings() {
  const current = await readGlobalSettings();
  if (!current) {
    const seeded = /** @type {GlobalSettings} */ ({
      version: SETTINGS_VERSION,
      servers: createSeedServers(),
    });
    await writeGlobalSettings(seeded);
    return seeded;
  }
  // Basic migration hook (keep minimal for M1)
  const next = { ...current, version: SETTINGS_VERSION, servers: (current.servers || []).map((s) => ({ enabled: s.enabled === false ? false : true, ...s })) };
  if (JSON.stringify(next) !== JSON.stringify(current)) {
    await writeGlobalSettings(next);
    return next;
  }
  return current;
}


