# SETUP

Scope: Local development setup for the MCP Web Bridge extension, including load-unpacked instructions, running local MCP servers, and troubleshooting. Based on the redesign plan’s workflow guidance.
Last updated: 2025-09-03 (UTC)

## Prerequisites

- Chrome (MV3 support enabled)
- Node.js (LTS)

## Load the extension (unpacked)

1) In Chrome, open chrome://extensions and enable Developer Mode.
2) Click "Load unpacked" and select the repository root.
3) Verify the extension appears and host permissions match ChatGPT domains.

## Local development tips

- Use Chrome’s "Service Worker" inspector for background logs.
- Open DevTools on ChatGPT and look for the Shadow DOM host elements.
- Reload extension after changes (or adopt a bundler with HMR later).

## Run the local echo MCP server

- Script: `scripts/mcp-localdev.js`
- Start: `node scripts/mcp-localdev.js`
- In the extension UI, connect to the Local Dev server and test tools (echo/time/sum).

## Configure Firecrawl MCP (optional)

- Run a local Firecrawl MCP server or use a cloud endpoint per their docs.
- Add a server entry with the Firecrawl WebSocket URL.
- Connect via the Servers tab; tools should list in the Tools tab.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| MCP toggle not visible | Confirm Shadow DOM host injected; check MutationObserver and fallback; ensure domain matches manifest. |
| No response from background | Inspect service worker console; check message kinds and `ok/data|error` schema. |
| Tools not listed after connect | Verify WebSocket reachable; ensure JSON-RPC initialize/tools list sequence is successful. |
| Logs missing | Ensure local storage quota not exceeded; log size bounded to ~500 entries. |
| Firecrawl errors | Verify endpoint and API key (if required); confirm server is running. |
