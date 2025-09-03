// Background service worker for MCP Web Bridge (MV3)
// Message schema (JSDoc types for clarity):
/**
 * @typedef {(
 *   {kind: 'GET_SETTINGS', requestId: string} |
 *   {kind: 'SET_SETTINGS', requestId: string, payload: Partial<GlobalSettings>} |
 *   {kind: 'LIST_SERVERS', requestId: string} |
 *   {kind: 'GET_SERVER', requestId: string, payload: {id: string}} |
 *   {kind: 'SET_DEFAULT', requestId: string, payload: {id: string}} |
 *   {kind: 'ECHO', requestId: string, payload: { message: string }} |
 *   {kind: 'SET_BADGE', requestId: string, payload: { text: string, color?: string, tabId?: number }} |
 *   {kind: 'SAVE_STATUS', requestId: string, payload: { serverId: string, ok: boolean, via?: string, echoed?: string, at?: number }} |
 *   {kind: 'LIST_STATUS', requestId: string} |
 *   {kind: 'PING', requestId: string} |
 *   {kind: 'LOG', requestId: string, payload: { level?: 'debug'|'info'|'warn'|'error', message: string, meta?: any }} |
 *   {kind: 'LIST_LOGS', requestId: string} |
 *   {kind: 'CLEAR_LOGS', requestId: string} |
 *   {kind: 'TOGGLE_SERVER', requestId: string, payload: { id: string, enabled: boolean }} |
 *   {kind: 'CONNECT_MCP', requestId: string, payload: { id: string, url: string }} |
 *   {kind: 'LIST_MCP_TOOLS', requestId: string, payload: { id: string }} |
 *   {kind: 'CALL_MCP_TOOL', requestId: string, payload: { id: string, name: string, args?: any }}
 * )} Message
 */
/**
 * @typedef {{
 *   id: string,
 *   name: string,
 *   description?: string,
 *   url?: string,
 *   tags?: string[],
 *   enabled?: boolean,
 * }} McpServer
 */
/**
 * @typedef {{
 *   version: number,
 *   defaultServerId?: string,
 *   servers: McpServer[],
 * }} GlobalSettings
 */

const SETTINGS_VERSION = 1;
const STORAGE_KEYS = {
  GLOBAL: "mcp.webbridge.global.v1",
  STATUS: "mcp.webbridge.status.v1",
  LOGS: "mcp.webbridge.logs.v1",
  FIRST_INSTALLED_AT: "mcp.webbridge.installedAt",
};

/** @returns {Promise<GlobalSettings|null>} */
function readGlobalSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get([STORAGE_KEYS.GLOBAL], (obj) => {
      const data = obj[STORAGE_KEYS.GLOBAL] || null;
      resolve(data);
    });
  });
}

/** @param {GlobalSettings} settings */
function writeGlobalSettings(settings) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [STORAGE_KEYS.GLOBAL]: settings }, () =>
      resolve()
    );
  });
}

/** @returns {Promise<Record<string, any>>} */
function readStatuses() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEYS.STATUS], (obj) => {
      resolve(obj[STORAGE_KEYS.STATUS] || {});
    });
  });
}

/** @param {Record<string, any>} statuses */
function writeStatuses(statuses) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEYS.STATUS]: statuses }, () => resolve());
  });
}

/** @returns {Promise<Array<{t:number,level:string,msg:string,meta?:any}>>} */
function readLogs() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEYS.LOGS], (obj) => {
      resolve(obj[STORAGE_KEYS.LOGS] || []);
    });
  });
}

/** @param {Array<{t:number,level:string,msg:string,meta?:any}>} logs */
function writeLogs(logs) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEYS.LOGS]: logs.slice(-500) }, () => resolve());
  });
}

/** @returns {McpServer[]} */
function createMockServers() {
  return [
    {
      id: "localdev",
      name: "Local Dev MCP",
      description: "Local WebSocket MCP server for development",
      url: "ws://127.0.0.1:8788",
      tags: ["dev"],
      enabled: true,
    },
    {
      id: "firecrawl",
      name: "Firecrawl",
      description: "Scrape pages into Markdown for offline analysis",
      url: "mcp://firecrawl",
      tags: ["scrape", "markdown"],
      enabled: false,
    },
    {
      id: "puppeteer",
      name: "Puppeteer MCP",
      description: "Automate a browser to inspect and probe DOM",
      url: "mcp://puppeteer",
      tags: ["automation", "dom"],
      enabled: false,
    },
    {
      id: "sequentialthinking",
      name: "Sequential Thinking",
      description: "Structured option analysis and decision-making",
      url: "mcp://sequentialthinking",
      tags: ["reasoning"],
      enabled: false,
    },
    {
      id: "streamable",
      name: "Streamable MCP",
      description: "Stream intermediate results",
      url: "mcp://streamable",
      tags: ["stream"],
      enabled: false,
    },
    {
      id: "memory",
      name: "Memory MCP",
      description: "Persist project facts and decisions",
      url: "mcp://memory",
      tags: ["persistence"],
      enabled: false,
    },
  ];
}

/** @returns {Promise<GlobalSettings>} */
async function ensureSettings() {
  const current = await readGlobalSettings();
  if (!current) {
    const seeded = /** @type {GlobalSettings} */ ({
      version: SETTINGS_VERSION,
      defaultServerId: "localdev",
      servers: createMockServers(),
    });
    await writeGlobalSettings(seeded);
    return seeded;
  }
  // migration: ensure enabled flag exists on servers
  const migratedServers = (current.servers || []).map((s) => ({
    enabled: typeof s.enabled === 'boolean' ? s.enabled : true,
    ...s,
  }));
  const needsWrite = current.version !== SETTINGS_VERSION || migratedServers.some((s, i) => current.servers[i] && current.servers[i].enabled === undefined);
  if (needsWrite) {
    const migrated = { ...current, version: SETTINGS_VERSION, servers: migratedServers };
    await writeGlobalSettings(migrated);
    return migrated;
  }
  return current;
}

chrome.runtime.onInstalled.addListener(async () => {
  await ensureSettings();
  chrome.storage.local.set({ [STORAGE_KEYS.FIRST_INSTALLED_AT]: Date.now() });
});

async function appendLog(level, msg, meta) {
  try {
    const logs = await readLogs();
    logs.push({ t: Date.now(), level, msg, meta });
    await writeLogs(logs);
  } catch (_e) {}
}

// MCP WebSocket connection manager
/** @type {Map<string, { ws: WebSocket, url: string, nextId: number, pending: Map<number, {resolve:Function,reject:Function}>, serverInfo?: any, tools?: any[] }>} */
const mcpConnections = new Map();

function mcpEnsureConnection(id, url) {
  return new Promise((resolve, reject) => {
    const existing = mcpConnections.get(id);
    if (existing && existing.ws && existing.ws.readyState === 1) {
      resolve(existing);
      return;
    }
    try {
      const ws = new WebSocket(url);
      const state = { ws, url, nextId: 1, pending: new Map(), serverInfo: null, tools: [] };
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg && typeof msg.id === 'number' && state.pending.has(msg.id)) {
            const { resolve } = state.pending.get(msg.id);
            state.pending.delete(msg.id);
            resolve(msg);
          }
        } catch (e) {
          appendLog('error', 'WS_PARSE', { e: String(e) });
        }
      };
      ws.onerror = (ev) => {
        appendLog('error', 'WS_ERROR', { id, url });
      };
      ws.onclose = () => {
        appendLog('warn', 'WS_CLOSED', { id });
        mcpConnections.delete(id);
      };
      ws.onopen = async () => {
        mcpConnections.set(id, state);
        try {
          const init = await mcpSendRpc(id, 'initialize', { clientName: 'MCP Web Bridge', clientVersion: '0.1.0' });
          state.serverInfo = init && init.result && init.result.serverInfo;
          const listed = await mcpSendRpc(id, 'tools/list', {});
          state.tools = (listed && listed.result && listed.result.tools) || [];
          resolve(state);
        } catch (e) {
          reject(e);
        }
      };
    } catch (e) {
      reject(e);
    }
  });
}

function mcpSendRpc(id, method, params) {
  const state = mcpConnections.get(id);
  if (!state || !state.ws || state.ws.readyState !== 1) {
    return Promise.reject(new Error('Not connected'));
  }
  const reqId = state.nextId++;
  const payload = { jsonrpc: '2.0', id: reqId, method, params };
  return new Promise((resolve, reject) => {
    state.pending.set(reqId, { resolve: (msg) => {
      if (msg.error) reject(new Error(msg.error.message || 'RPC error'));
      else resolve(msg);
    }, reject });
    state.ws.send(JSON.stringify(payload));
  });
}

/** @param {Message} message */
async function handleMessage(message, senderTabId) {
  switch (message.kind) {
    case "GET_SETTINGS": {
      const settings = await ensureSettings();
      return { ok: true, settings };
    }
    case "SET_SETTINGS": {
      const existing = await ensureSettings();
      const next = {
        ...existing,
        ...message.payload,
        version: SETTINGS_VERSION,
      };
      await writeGlobalSettings(next);
      await appendLog('info', 'SET_SETTINGS', { keys: Object.keys(message.payload || {}) });
      return { ok: true, settings: next };
    }
    case "LIST_SERVERS": {
      const settings = await ensureSettings();
      return {
        ok: true,
        servers: settings.servers,
        defaultServerId: settings.defaultServerId,
      };
    }
    case "GET_SERVER": {
      const settings = await ensureSettings();
      const server =
        settings.servers.find((s) => s.id === message.payload.id) || null;
      return { ok: true, server };
    }
    case "SET_DEFAULT": {
      const settings = await ensureSettings();
      const exists = settings.servers.some((s) => s.id === message.payload.id);
      const next = exists
        ? { ...settings, defaultServerId: message.payload.id }
        : settings;
      await writeGlobalSettings(next);
      await appendLog('info', 'SET_DEFAULT', { id: message.payload.id });
      return { ok: exists, defaultServerId: next.defaultServerId };
    }
    case "TOGGLE_SERVER": {
      const settings = await ensureSettings();
      const servers = settings.servers.map((s) => s.id === message.payload.id ? { ...s, enabled: !!message.payload.enabled } : s);
      const next = { ...settings, servers };
      await writeGlobalSettings(next);
      await appendLog('info', 'TOGGLE_SERVER', { id: message.payload.id, enabled: !!message.payload.enabled });
      return { ok: true, servers };
    }
    case "ECHO": {
      const msg = (message && message.payload && message.payload.message) || "";
      try {
        const res = await fetch(
          "http://127.0.0.1:8787/echo?m=" + encodeURIComponent(msg),
          { method: "GET" }
        );
        if (res.ok) {
          const text = await res.text();
          await appendLog('debug', 'ECHO_HTTP', { echoed: text });
          return { ok: true, echoed: text, via: "http" };
        }
      } catch (_e) {
        // fall back to local echo
      }
      await appendLog('debug', 'ECHO_LOCAL', { echoed: msg });
      return { ok: true, echoed: msg, via: "local" };
    }
    case "SET_BADGE": {
      const text = (message.payload && message.payload.text) || "";
      const color = (message.payload && message.payload.color) || "#22d3ee";
      const tabId = (message.payload && message.payload.tabId) || senderTabId;
      try {
        if (typeof tabId === "number") {
          chrome.action.setBadgeText({ text, tabId });
          chrome.action.setBadgeBackgroundColor({ color, tabId });
        } else {
          chrome.action.setBadgeText({ text });
          chrome.action.setBadgeBackgroundColor({ color });
        }
        return { ok: true };
      } catch (e) {
        return { ok: false, error: String(e) };
      }
    }
    case "SAVE_STATUS": {
      const statuses = await readStatuses();
      const { serverId, ok, via, echoed, at } = message.payload || {};
      statuses[serverId] = { ok: !!ok, via: via || "", echoed: echoed || "", at: at || Date.now() };
      await writeStatuses(statuses);
      return { ok: true };
    }
    case "LIST_STATUS": {
      const statuses = await readStatuses();
      return { ok: true, statuses };
    }
    case "PING": {
      const installedAtObj = await new Promise((resolve) => chrome.storage.local.get([STORAGE_KEYS.FIRST_INSTALLED_AT], resolve));
      const installedAt = installedAtObj && installedAtObj[STORAGE_KEYS.FIRST_INSTALLED_AT];
      return { ok: true, now: Date.now(), installedAt: installedAt || null };
    }
    case "LOG": {
      const level = (message.payload && message.payload.level) || 'info';
      const msg = (message.payload && message.payload.message) || '';
      await appendLog(level, msg, message.payload && message.payload.meta);
      return { ok: true };
    }
    case "LIST_LOGS": {
      const logs = await readLogs();
      return { ok: true, logs };
    }
    case "CLEAR_LOGS": {
      await writeLogs([]);
      return { ok: true };
    }
    case "CONNECT_MCP": {
      const { id, url } = message.payload || {};
      if (!id || !url) return { ok: false, error: 'id and url required' };
      try {
        const state = await mcpEnsureConnection(id, url);
        await appendLog('info', 'MCP_CONNECTED', { id, url, tools: (state.tools||[]).length });
        return { ok: true, serverInfo: state.serverInfo, tools: state.tools };
      } catch (e) {
        await appendLog('error', 'MCP_CONNECT_FAILED', { id, url, e: String(e) });
        return { ok: false, error: String(e) };
      }
    }
    case "LIST_MCP_TOOLS": {
      const { id } = message.payload || {};
      const state = mcpConnections.get(id);
      return { ok: true, tools: state && state.tools ? state.tools : [] };
    }
    case "CALL_MCP_TOOL": {
      const { id, name, args } = message.payload || {};
      try {
        const res = await mcpSendRpc(id, 'tools/call', { name, arguments: args || {} });
        return { ok: true, result: res && res.result ? res.result : null };
      } catch (e) {
        return { ok: false, error: String(e) };
      }
    }
    default:
      return { ok: false, error: "Unknown kind" };
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  // All responses are async
  const tabId = _sender && _sender.tab && _sender.tab.id;
  (async () => {
    try {
      const data = await handleMessage(message, tabId);
      sendResponse({ requestId: message.requestId, ...data });
    } catch (error) {
      sendResponse({
        requestId: message.requestId,
        ok: false,
        error: String(error),
      });
    }
  })();
  return true;
});
