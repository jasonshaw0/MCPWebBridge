// Message router for M1 core
import { SETTINGS_VERSION, ensureSettings, writeGlobalSettings, readStatuses, readLogs, writeLogs, mergeStatus } from "./storage.js";
import { appendLog } from "./log.js";
import { openConnection, getTools, callTool, closeConnection } from "./mcpManager.js";

/**
 * @typedef {(
 *   {kind:'GET_SETTINGS', requestId:string}|
 *   {kind:'SET_SETTINGS', requestId:string, payload: Partial<import('./storage.js').GlobalSettings>}|
 *   {kind:'LIST_SERVERS', requestId:string}|
 *   {kind:'TOGGLE_SERVER', requestId:string, payload:{ id:string, enabled:boolean }}|
 *   {kind:'SET_DEFAULT', requestId:string, payload:{ id:string }}|
 *   {kind:'CONNECT_MCP', requestId:string, payload:{ id:string, url:string }}|
 *   {kind:'LIST_MCP_TOOLS', requestId:string, payload:{ id:string }}|
 *   {kind:'CALL_MCP_TOOL', requestId:string, payload:{ id:string, name:string, args?:any }}|
 *   {kind:'LIST_STATUS', requestId:string}
 * )} Message
 */

async function refreshBadge() {
  try {
    const statuses = await readStatuses();
    const hasError = Object.values(statuses || {}).some((s) => s && s.status === 'error');
    if (hasError) {
      try { chrome.action.setBadgeBackgroundColor({ color: '#FF4136' }); } catch (_e) {}
      try { chrome.action.setBadgeText({ text: '!' }); } catch (_e) {}
    } else {
      try { chrome.action.setBadgeText({ text: '' }); } catch (_e) {}
    }
  } catch (_e) {
    // ignore
  }
}

/** @param {Message} message */
export async function handleMessage(message) {
  switch (message.kind) {
    case 'GET_SETTINGS': {
      const settings = await ensureSettings();
      return { ok: true, data: { settings } };
    }
    case 'SET_SETTINGS': {
      const existing = await ensureSettings();
      const next = { ...existing, ...message.payload, version: SETTINGS_VERSION };
      await writeGlobalSettings(next);
      await appendLog('info', 'SET_SETTINGS', { keys: Object.keys(message.payload || {}) });
      return { ok: true, data: { settings: next } };
    }
    case 'LIST_SERVERS': {
      const settings = await ensureSettings();
      return { ok: true, data: { servers: settings.servers, defaultServerId: settings.defaultServerId } };
    }
    case 'TOGGLE_SERVER': {
      const settings = await ensureSettings();
      const servers = (settings.servers || []).map((s) => s.id === message.payload.id ? { ...s, enabled: !!message.payload.enabled } : s);
      const next = { ...settings, servers };
      await writeGlobalSettings(next);
      await appendLog('info', 'TOGGLE_SERVER', { id: message.payload.id, enabled: !!message.payload.enabled });
      if (message.payload.enabled === false) {
        try { closeConnection(message.payload.id); } catch (_e) {}
        await mergeStatus(message.payload.id, { status: 'disconnected', connected: false, lastDisconnectAt: Date.now() });
      }
      await refreshBadge();
      return { ok: true, data: { servers } };
    }
    case 'SET_DEFAULT': {
      const settings = await ensureSettings();
      const exists = (settings.servers || []).some((s) => s.id === message.payload.id);
      const next = exists ? { ...settings, defaultServerId: message.payload.id } : settings;
      await writeGlobalSettings(next);
      await appendLog('info', 'SET_DEFAULT', { id: message.payload.id });
      return { ok: exists, data: { defaultServerId: next.defaultServerId } };
    }
    case 'CONNECT_MCP': {
      // Accept {serverId} (preferred) or {id,url}
      let serverId = message.payload && (message.payload.serverId || message.payload.id);
      let url = message.payload && message.payload.url;
      if (!serverId) return { ok: false, error: 'serverId required' };
      if (!url) {
        const settings = await ensureSettings();
        const server = (settings.servers || []).find((s) => s.id === serverId);
        url = server && server.url;
      }
      if (!url) return { ok: false, error: 'server url missing' };
      try {
        const state = await openConnection(serverId, url);
        const tools = await getTools(serverId);
        await mergeStatus(serverId, { status: 'connected', connected: true, connectedAt: Date.now() });
        await refreshBadge();
        return { ok: true, data: { serverInfo: state && state.serverInfo, tools } };
      } catch (e) {
        await mergeStatus(serverId, { status: 'error', connected: false, lastError: String(e), lastErrorAt: Date.now() });
        await appendLog('error', 'CONNECT_MCP_FAILED', { id: serverId, url, error: String(e) });
        await refreshBadge();
        return { ok: false, error: String(e) };
      }
    }
    case 'LIST_MCP_TOOLS': {
      const id = message.payload && (message.payload.serverId || message.payload.id);
      if (!id) return { ok: false, error: 'serverId required' };
      try {
        const tools = await getTools(id);
        return { ok: true, data: { tools } };
      } catch (e) {
        // Auto-reconnect if not connected
        if (String(e).includes('Not connected')) {
          const settings = await ensureSettings();
          const server = (settings.servers || []).find((s) => s.id === id);
          if (server && server.url) {
            try {
              await openConnection(id, server.url);
              const tools = await getTools(id);
              await mergeStatus(id, { status: 'connected', connected: true });
              await refreshBadge();
              return { ok: true, data: { tools } };
            } catch (e2) {
              await mergeStatus(id, { status: 'error', connected: false, lastError: String(e2), lastErrorAt: Date.now() });
              await refreshBadge();
              return { ok: false, error: String(e2) };
            }
          }
        }
        return { ok: false, error: String(e) };
      }
    }
    case 'CALL_MCP_TOOL': {
      const id = message.payload && (message.payload.serverId || message.payload.id);
      const name = message.payload && (message.payload.tool || message.payload.name);
      const args = message.payload && message.payload.args;
      if (!id || !name) return { ok: false, error: 'serverId and tool required' };
      try {
        const result = await callTool(id, name, args || {});
        await mergeStatus(id, { status: 'connected', connected: true, lastOkToolCallAt: Date.now() });
        await appendLog('info', 'TOOL_OK', { id, name });
        await refreshBadge();
        return { ok: true, data: result };
      } catch (e) {
        // Auto-reconnect on Not connected, then retry once
        if (String(e).includes('Not connected')) {
          const settings = await ensureSettings();
          const server = (settings.servers || []).find((s) => s.id === id);
          if (server && server.url) {
            try {
              await openConnection(id, server.url);
              const result = await callTool(id, name, args || {});
              await mergeStatus(id, { status: 'connected', connected: true, lastOkToolCallAt: Date.now() });
              await appendLog('info', 'TOOL_OK', { id, name, retried: true });
              await refreshBadge();
              return { ok: true, data: result };
            } catch (e2) {
              await mergeStatus(id, { status: 'error', connected: false, lastError: String(e2), lastErrorAt: Date.now() });
              await appendLog('error', 'TOOL_FAIL', { id, name, error: String(e2) });
              await refreshBadge();
              return { ok: false, error: String(e2) };
            }
          }
        }
        await mergeStatus(id, { status: 'error', connected: false, lastError: String(e), lastErrorAt: Date.now() });
        await appendLog('error', 'TOOL_FAIL', { id, name, error: String(e) });
        await refreshBadge();
        return { ok: false, error: String(e) };
      }
    }
    case 'SET_BADGE': {
      const payload = message.payload || {};
      try {
        if (payload.color) {
          try { chrome.action.setBadgeBackgroundColor({ color: payload.color }); } catch (_e) {}
        }
        try { chrome.action.setBadgeText({ text: payload.text || '' }); } catch (_e) {}
        return { ok: true };
      } catch (e) {
        return { ok: false, error: String(e) };
      }
    }
    case 'LIST_STATUS': {
      const statuses = await readStatuses();
      return { ok: true, data: { statuses } };
    }
    case 'SAVE_STATUS': {
      const { serverId, status } = message.payload || {};
      if (!serverId || !status) return { ok: false, error: 'serverId and status required' };
      await mergeStatus(serverId, status);
      await refreshBadge();
      return { ok: true };
    }
    case 'LIST_LOGS': {
      const logs = await readLogs();
      return { ok: true, data: { logs } };
    }
    case 'CLEAR_LOGS': {
      await writeLogs([]);
      await appendLog('info', 'LOGS_CLEARED');
      await refreshBadge();
      return { ok: true };
    }
    default:
      return { ok: false, error: 'Unknown kind' };
  }
}


