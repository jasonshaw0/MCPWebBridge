// Bounded log utility. Stores logs in chrome.storage.local with size cap.
import { readLogs, writeLogs } from "./storage.js";

/** @param {'debug'|'info'|'warn'|'error'} level @param {string} msg @param {any} [meta] */
export async function appendLog(level, msg, meta) {
  try {
    const logs = await readLogs();
    logs.push({ t: Date.now(), level, msg, meta });
    await writeLogs(logs);
  } catch (_e) {
    // no-op
  }
}


