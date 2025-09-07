// Message router for M1 core
import { SETTINGS_VERSION, ensureSettings, writeGlobalSettings, readStatuses, writeStatuses } from "./storage.js";
import { appendLog } from "./log.js";
import { openConnection, getTools, callTool } from "./mcpManager.js";

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

/** @param {Message} message */
export async function handleMessage(message) {
  switch (message.kind) {
    case 'GET_SETTINGS': {
      const settings = await ensureSettings();
      return { ok: true, settings };
    }
    case 'SET_SETTINGS': {
      const existing = await ensureSettings();
      const next = { ...existing, ...message.payload, version: SETTINGS_VERSION };
      await writeGlobalSettings(next);
      await appendLog('info', 'SET_SETTINGS', { keys: Object.keys(message.payload || {}) });
      return { ok: true, settings: next };
    }
    case 'LIST_SERVERS': {
      const settings = await ensureSettings();
      return { ok: true, servers: settings.servers, defaultServerId: settings.defaultServerId };
    }
    case 'TOGGLE_SERVER': {
      const settings = await ensureSettings();
      const servers = (settings.servers || []).map((s) => s.id === message.payload.id ? { ...s, enabled: !!message.payload.enabled } : s);
      const next = { ...settings, servers };
      await writeGlobalSettings(next);
      await appendLog('info', 'TOGGLE_SERVER', { id: message.payload.id, enabled: !!message.payload.enabled });
      return { ok: true, servers };
    }
    case 'SET_DEFAULT': {
      const settings = await ensureSettings();
      const exists = (settings.servers || []).some((s) => s.id === message.payload.id);
      const next = exists ? { ...settings, defaultServerId: message.payload.id } : settings;
      await writeGlobalSettings(next);
      await appendLog('info', 'SET_DEFAULT', { id: message.payload.id });
      return { ok: exists, defaultServerId: next.defaultServerId };
    }
    case 'CONNECT_MCP': {
      const { id, url } = message.payload || {};
      if (!id || !url) return { ok: false, error: 'id and url required' };
      try {
        await openConnection(id, url);
        const tools = await getTools(id);
        const statuses = await readStatuses();
        statuses[id] = { ok: true, at: Date.now(), last: 'connect' };
        await writeStatuses(statuses);
        return { ok: true, tools };
      } catch (e) {
        const statuses = await readStatuses();
        statuses[id] = { ok: false, at: Date.now(), last: 'connect', error: String(e) };
        await writeStatuses(statuses);
        await appendLog('error', 'CONNECT_MCP_FAILED', { id, url, error: String(e) });
        return { ok: false, error: String(e) };
      }
    }
    case 'LIST_MCP_TOOLS': {
      const { id } = message.payload || {};
      try {
        const tools = await getTools(id);
        return { ok: true, tools };
      } catch (e) {
        return { ok: false, error: String(e) };
      }
    }
    case 'CALL_MCP_TOOL': {
      const { id, name, args } = message.payload || {};
      if (!id || !name) return { ok: false, error: 'id and name required' };
      try {
        const result = await callTool(id, name, args || {});
        const statuses = await readStatuses();
        statuses[id] = { ok: true, at: Date.now(), last: 'call', tool: name };
        await writeStatuses(statuses);
        await appendLog('info', 'TOOL_OK', { id, name });
        return { ok: true, result };
      } catch (e) {
        const statuses = await readStatuses();
        statuses[id] = { ok: false, at: Date.now(), last: 'call', tool: name, error: String(e) };
        await writeStatuses(statuses);
        await appendLog('error', 'TOOL_FAIL', { id, name, error: String(e) });
        return { ok: false, error: String(e) };
      }
    }
    case 'LIST_STATUS': {
      const statuses = await readStatuses();
      return { ok: true, statuses };
    }
    default:
      return { ok: false, error: 'Unknown kind' };
  }
}


