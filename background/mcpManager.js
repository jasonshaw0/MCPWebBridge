// MCP Connection Manager (WebSocket JSON-RPC 2.0)
// Keeps in-memory connections keyed by serverId. Not persisted.
import { appendLog } from "./log.js";
import { mergeStatus } from "./storage.js";

/** @typedef {{ ws: WebSocket, url: string, nextId: number, pending: Map<number, {resolve:Function, reject:Function, timeoutId:number|null}>, serverInfo?: any, tools?: any[], status: 'idle'|'connecting'|'connected'|'failed', lastActivityAt:number, heartbeatTimer:number|null, idleTimer:number|null }} ConnState */

/** @type {Map<string, ConnState>} */
const connections = new Map();

const INIT_TIMEOUT_MS = 5000;
const LIST_TIMEOUT_MS = 5000;
const CALL_TIMEOUT_MS = 10000;
const HEARTBEAT_INTERVAL_MS = 4 * 60 * 1000; // ~4 minutes
const IDLE_DISCONNECT_MS = 12 * 60 * 1000; // ~12 minutes
const BACKOFF_BASE_MS = 1000;
const BACKOFF_MAX_MS = 30000;
const MAX_CONNECT_ATTEMPTS = 5;

/**
 * Open or return an existing connection. Performs initialize + tools/list on first open.
 * @param {string} serverId
 * @param {string} url
 * @returns {Promise<ConnState>}
 */
export function openConnection(serverId, url) {
  const existing = connections.get(serverId);
  if (existing && existing.ws && existing.ws.readyState === 1) {
    return Promise.resolve(existing);
  }
  return connectWithBackoff(serverId, url, 1);
}

function connectWithBackoff(serverId, url, attempt) {
  return new Promise((resolve, reject) => {
    try {
      /** @type {ConnState} */
      const state = { ws: null, url, nextId: 1, pending: new Map(), serverInfo: undefined, tools: [], status: 'connecting', lastActivityAt: Date.now(), heartbeatTimer: null, idleTimer: null };
      const ws = new WebSocket(url);
      state.ws = ws;
      connections.set(serverId, state);
      mergeStatus(serverId, { status: 'connecting', connected: false, lastError: null, lastErrorAt: null });

      let settled = false;

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg && typeof msg.id === 'number' && state.pending.has(msg.id)) {
            const pending = state.pending.get(msg.id);
            if (pending.timeoutId) clearTimeout(pending.timeoutId);
            state.pending.delete(msg.id);
            pending.resolve(msg);
            state.lastActivityAt = Date.now();
            scheduleIdleCheck(serverId);
          }
        } catch (e) {
          appendLog('error', 'WS_PARSE_ERROR', { serverId, error: String(e) });
        }
      };
      ws.onerror = () => {
        state.status = 'failed';
        if (!settled) {
          settled = true;
          appendLog('error', 'WS_ERROR', { serverId, url });
          cleanupConn(serverId);
          retryOrFail(serverId, url, attempt, resolve, reject);
        }
      };
      ws.onclose = () => {
        appendLog('warn', 'WS_CLOSED', { serverId });
        mergeStatus(serverId, { status: 'disconnected', connected: false, lastDisconnectAt: Date.now() });
        cleanupConn(serverId);
      };
      ws.onopen = async () => {
        try {
          const init = await sendRpc(serverId, 'initialize', { clientName: 'MCP Web Bridge', clientVersion: '0.1.0' }, INIT_TIMEOUT_MS);
          state.serverInfo = init && init.result && init.result.serverInfo;
          const listed = await sendRpc(serverId, 'tools/list', {}, LIST_TIMEOUT_MS);
          state.tools = (listed && listed.result && listed.result.tools) || [];
          state.status = 'connected';
          state.lastActivityAt = Date.now();
          scheduleHeartbeat(serverId);
          scheduleIdleCheck(serverId);
          await mergeStatus(serverId, { status: 'connected', connected: true, connectedAt: Date.now(), lastError: null });
          await appendLog('info', 'MCP_CONNECTED', { serverId, url, tools: (state.tools || []).length });
          settled = true;
          resolve(state);
        } catch (e) {
          state.status = 'failed';
          await mergeStatus(serverId, { status: 'error', connected: false, lastError: String(e), lastErrorAt: Date.now() });
          await appendLog('error', 'MCP_CONNECT_FAILED', { serverId, url, error: String(e) });
          cleanupConn(serverId);
          retryOrFail(serverId, url, attempt, resolve, reject);
        }
      };
    } catch (e) {
      appendLog('error', 'WS_OPEN_FAILED', { serverId, url, error: String(e) });
      retryOrFail(serverId, url, attempt, resolve, reject);
    }
  });
}

function retryOrFail(serverId, url, attempt, resolve, reject) {
  if (attempt >= MAX_CONNECT_ATTEMPTS) {
    reject(new Error('Connection failed'));
    return;
  }
  const backoff = Math.min(BACKOFF_BASE_MS * Math.pow(2, attempt - 1), BACKOFF_MAX_MS);
  setTimeout(() => {
    connectWithBackoff(serverId, url, attempt + 1).then(resolve).catch(reject);
  }, backoff);
}

function cleanupConn(serverId) {
  const state = connections.get(serverId);
  if (!state) return;
  try { if (state.heartbeatTimer) clearTimeout(state.heartbeatTimer); } catch (_e) {}
  try { if (state.idleTimer) clearTimeout(state.idleTimer); } catch (_e) {}
  try {
    state.pending.forEach((p) => { try { if (p.timeoutId) clearTimeout(p.timeoutId); } catch(_){}; try { p.reject(new Error('Connection closed')); } catch(_){} });
  } catch (_e) {}
  try { if (state.ws) state.ws.close(); } catch (_e) {}
  connections.delete(serverId);
}

/**
 * Send a JSON-RPC request over an open connection
 * @param {string} serverId
 * @param {string} method
 * @param {any} params
 * @returns {Promise<any>} JSON-RPC response object
 */
export function sendRpc(serverId, method, params, timeoutMs) {
  const state = connections.get(serverId);
  if (!state || !state.ws || state.ws.readyState !== 1) {
    return Promise.reject(new Error('Not connected'));
  }
  const id = state.nextId++;
  const payload = { jsonrpc: '2.0', id, method, params };
  return new Promise((resolve, reject) => {
    const entry = { resolve: (msg) => {
      if (msg && msg.error) {
        reject(new Error(msg.error.message || 'RPC error'));
      } else {
        resolve(msg);
      }
    }, reject, timeoutId: null };
    state.pending.set(id, entry);
    try {
      state.ws.send(JSON.stringify(payload));
      const ms = typeof timeoutMs === 'number' ? timeoutMs : (method === 'tools/call' ? CALL_TIMEOUT_MS : LIST_TIMEOUT_MS);
      entry.timeoutId = setTimeout(() => {
        if (state.pending.has(id)) {
          state.pending.delete(id);
          reject(new Error('Timeout'));
        }
      }, ms);
    } catch (e) {
      state.pending.delete(id);
      reject(e);
    }
  });
}

/**
 * Get cached tools; if connected but not cached, refresh.
 * @param {string} serverId
 * @returns {Promise<any[]>}
 */
export async function getTools(serverId) {
  const state = connections.get(serverId);
  if (!state) return [];
  if (state.tools && state.tools.length) return state.tools;
  try {
    const listed = await sendRpc(serverId, 'tools/list', {}, LIST_TIMEOUT_MS);
    state.tools = (listed && listed.result && listed.result.tools) || [];
    return state.tools;
  } catch (e) {
    await appendLog('error', 'TOOLS_LIST_FAILED', { serverId, error: String(e) });
    throw e;
  }
}

/**
 * Call a tool via JSON-RPC
 * @param {string} serverId
 * @param {string} name
 * @param {any} args
 * @returns {Promise<any>} result.result
 */
export async function callTool(serverId, name, args) {
  const res = await sendRpc(serverId, 'tools/call', { name, arguments: args || {} }, CALL_TIMEOUT_MS);
  const state = connections.get(serverId);
  if (state) {
    state.lastActivityAt = Date.now();
    scheduleHeartbeat(serverId);
    scheduleIdleCheck(serverId);
  }
  return res && res.result ? res.result : null;
}

/** Return connection status for a server */
export function getStatus(serverId) {
  const state = connections.get(serverId);
  return state ? state.status : 'idle';
}

/** Close and forget a connection */
export function closeConnection(serverId) {
  const state = connections.get(serverId);
  if (state && state.ws) {
    try { state.ws.close(); } catch (_e) {}
  }
  connections.delete(serverId);
}

export function closeAllConnections() {
  Array.from(connections.keys()).forEach((id) => closeConnection(id));
}

function scheduleHeartbeat(serverId) {
  const state = connections.get(serverId);
  if (!state) return;
  if (state.heartbeatTimer) clearTimeout(state.heartbeatTimer);
  state.heartbeatTimer = setTimeout(async () => {
    try {
      // Prefer ping if supported; fall back to tools/list
      try { await sendRpc(serverId, 'ping', {}, LIST_TIMEOUT_MS); }
      catch { await sendRpc(serverId, 'tools/list', {}, LIST_TIMEOUT_MS); }
      state.lastActivityAt = Date.now();
      await mergeStatus(serverId, { lastHeartbeatAt: Date.now() });
      scheduleHeartbeat(serverId);
    } catch (e) {
      await appendLog('warn', 'HEARTBEAT_FAIL', { serverId, error: String(e) });
      await mergeStatus(serverId, { status: 'error', connected: false, lastError: 'Heartbeat failure', lastErrorAt: Date.now() });
      try { chrome.action.setBadgeBackgroundColor({ color: '#FF4136' }); } catch(_e) {}
      try { chrome.action.setBadgeText({ text: '!' }); } catch(_e) {}
      // Allow router/user action to reconnect later
      try { closeConnection(serverId); } catch(_e) {}
    }
  }, HEARTBEAT_INTERVAL_MS);
}

function scheduleIdleCheck(serverId) {
  const state = connections.get(serverId);
  if (!state) return;
  if (state.idleTimer) clearTimeout(state.idleTimer);
  state.idleTimer = setTimeout(() => {
    const now = Date.now();
    if (now - (state.lastActivityAt || 0) >= IDLE_DISCONNECT_MS) {
      appendLog('info', 'AUTO_DISCONNECT_IDLE', { serverId });
      try { closeConnection(serverId); } catch(_e) {}
      mergeStatus(serverId, { status: 'disconnected', connected: false, lastDisconnectAt: now });
    } else {
      scheduleIdleCheck(serverId);
    }
  }, IDLE_DISCONNECT_MS);
}


