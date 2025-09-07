// MCP Connection Manager (WebSocket JSON-RPC 2.0)
// Keeps in-memory connections keyed by serverId. Not persisted.
import { appendLog } from "./log.js";

/** @typedef {{ ws: WebSocket, url: string, nextId: number, pending: Map<number, {resolve:Function, reject:Function}>, serverInfo?: any, tools?: any[], status: 'idle'|'connecting'|'connected'|'failed' }} ConnState */

/** @type {Map<string, ConnState>} */
const connections = new Map();

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
  return new Promise((resolve, reject) => {
    try {
      /** @type {ConnState} */
      const state = { ws: null, url, nextId: 1, pending: new Map(), serverInfo: undefined, tools: [], status: 'connecting' };
      const ws = new WebSocket(url);
      state.ws = ws;
      connections.set(serverId, state);

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg && typeof msg.id === 'number' && state.pending.has(msg.id)) {
            const { resolve } = state.pending.get(msg.id);
            state.pending.delete(msg.id);
            resolve(msg);
          }
        } catch (e) {
          appendLog('error', 'WS_PARSE_ERROR', { serverId, error: String(e) });
        }
      };
      ws.onerror = () => {
        state.status = 'failed';
        appendLog('error', 'WS_ERROR', { serverId, url });
      };
      ws.onclose = () => {
        appendLog('warn', 'WS_CLOSED', { serverId });
        connections.delete(serverId);
      };
      ws.onopen = async () => {
        try {
          const init = await sendRpc(serverId, 'initialize', { clientName: 'MCP Web Bridge', clientVersion: '0.1.0' });
          state.serverInfo = init && init.result && init.result.serverInfo;
          const listed = await sendRpc(serverId, 'tools/list', {});
          state.tools = (listed && listed.result && listed.result.tools) || [];
          state.status = 'connected';
          await appendLog('info', 'MCP_CONNECTED', { serverId, url, tools: (state.tools || []).length });
          resolve(state);
        } catch (e) {
          state.status = 'failed';
          await appendLog('error', 'MCP_CONNECT_FAILED', { serverId, url, error: String(e) });
          reject(e);
        }
      };
    } catch (e) {
      appendLog('error', 'WS_OPEN_FAILED', { serverId, url, error: String(e) });
      reject(e);
    }
  });
}

/**
 * Send a JSON-RPC request over an open connection
 * @param {string} serverId
 * @param {string} method
 * @param {any} params
 * @returns {Promise<any>} JSON-RPC response object
 */
export function sendRpc(serverId, method, params) {
  const state = connections.get(serverId);
  if (!state || !state.ws || state.ws.readyState !== 1) {
    return Promise.reject(new Error('Not connected'));
  }
  const id = state.nextId++;
  const payload = { jsonrpc: '2.0', id, method, params };
  return new Promise((resolve, reject) => {
    state.pending.set(id, { resolve: (msg) => {
      if (msg && msg.error) {
        reject(new Error(msg.error.message || 'RPC error'));
      } else {
        resolve(msg);
      }
    }, reject });
    try {
      state.ws.send(JSON.stringify(payload));
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
    const listed = await sendRpc(serverId, 'tools/list', {});
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
  const res = await sendRpc(serverId, 'tools/call', { name, arguments: args || {} });
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


