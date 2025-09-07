# SETUP

Scope: Local development setup for the MCP Web Bridge extension, including load-unpacked instructions, running local MCP servers, and troubleshooting. Based on the redesign plan’s workflow guidance.
Last updated: 2025-09-07 (UTC)

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

## Run the Local Echo MCP server

- Script: `scripts/mcp-localdev.js`
- Install deps (first time): `npm i ws`
- Start: `node scripts/mcp-localdev.js`
- In the extension UI, enable "Local Echo" then click Connect, open Tools tab and run tools (echo/time/sum).

## Run the Memory MCP server (optional, local)

- Command: `npx -y @modelcontextprotocol/server-memory`
- Default listens on localhost; add it in the extension settings later (future milestone) or adjust the seeded URL.
- Then Connect and use `memory/*` tools from the Tools tab.

## Firecrawl MCP (docs-only, optional)

- If desired for dev-only experiments, consult Firecrawl MCP docs to run locally with your own API key.
- Do not seed third-party servers in settings; only user-initiated connections.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| MCP toggle not visible | Confirm Shadow DOM host injected; check MutationObserver and fallback; ensure domain matches manifest. |
| No response from background | Inspect service worker console; check message kinds and `ok/data|error` schema. |
| Tools not listed after connect | Verify WebSocket reachable; ensure JSON-RPC initialize/tools list sequence is successful. |
| Logs missing | Ensure local storage quota not exceeded; log size bounded to ~500 entries. |
| Firecrawl errors | Verify endpoint and API key (if required); confirm server is running. |
