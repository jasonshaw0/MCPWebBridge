// Background entry for M1 core: logic only; no DOM access; no external MCPs
import { ensureSettings, writeInstalledAt } from "./background/storage.js";
import { handleMessage } from "./background/router.js";

chrome.runtime.onInstalled.addListener(async () => {
  await ensureSettings();
  await writeInstalledAt(Date.now());
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  (async () => {
    try {
      const data = await handleMessage(message);
      sendResponse({ requestId: message.requestId, ...data });
    } catch (error) {
      sendResponse({ requestId: message.requestId, ok: false, error: String(error) });
    }
  })();
  return true;
});
