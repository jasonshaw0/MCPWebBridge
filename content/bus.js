// Promise-based message bus for content script → background
(function() {
  function sendMessage(kind, payload) {
    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ kind, payload, requestId }, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        resolve(response);
      });
    });
  }

  // Expose on a safe namespace
  window.MCPBus = { sendMessage };
})();


