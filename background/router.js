// Message router for M1 core
import { SETTINGS_VERSION, ensureSettings, writeGlobalSettings } from "./storage.js";
import { appendLog } from "./log.js";

/**
 * @typedef {(
 *   {kind:'GET_SETTINGS', requestId:string}|
 *   {kind:'SET_SETTINGS', requestId:string, payload: Partial<import('./storage.js').GlobalSettings>}|
 *   {kind:'LIST_SERVERS', requestId:string}|
 *   {kind:'TOGGLE_SERVER', requestId:string, payload:{ id:string, enabled:boolean }}|
 *   {kind:'SET_DEFAULT', requestId:string, payload:{ id:string }}
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
    default:
      return { ok: false, error: 'Unknown kind' };
  }
}


