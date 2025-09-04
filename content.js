// Minimal content entry: mount Shadow DOM UI using modules loaded earlier
(function() {
  function init() {
    try { window.MCPMount && window.MCPMount.mount(); } catch (e) { /* no-op */ }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 300));
  } else {
    setTimeout(init, 300);
  }
})();
