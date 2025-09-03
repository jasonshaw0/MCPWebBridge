MCP Web Bridge (Chrome MV3)

Phase 1 • Iteration A: ChatGPT web only

What it does
- Injects a minimal MCP entry control on https://chatgpt.com/* and https://chat.openai.com/*
- Opens a collapsible right sidebar with tabs (Servers, Tools, Dev, Settings)
- Uses MV3 background service worker for typed request/response messaging and chrome.storage.sync for settings
- UI runs in a ShadowRoot with prefixed classes to avoid CSS bleed

Install (Unpacked)
1) Chrome → chrome://extensions
2) Enable Developer mode
3) Load unpacked → select this folder
4) Navigate to https://chatgpt.com (or https://chat.openai.com) and open the MCP tab on the right edge

Quick connectivity check (no external MCP required)
- The Connect button calls an echo action in the background. If you also run the optional local echo server, it will use HTTP; otherwise it echoes locally.
- The toolbar badge updates (OK/!). The Servers tab shows per-server status dots (green/red).

Optional local echo server
1) Create and run a tiny Node server:
```bash
node -e "require('http').createServer((req,res)=>{const u=new URL(req.url,'http://localhost');if(u.pathname==='\/echo'){res.end(u.searchParams.get('m')||'');}else{res.statusCode=404;res.end('not found')}}).listen(8787,()=>console.log('echo on 8787'))"
```
2) Click Connect in the panel. You should see a toast like: "Echo (http): hello from puppeteer". Without the server, it will show "Echo (local): ...".

Local MCP dev server (WebSocket)
1) Install dependencies:
```bash
npm i ws
```
2) In this repo, run:
```bash
node scripts/mcp-localdev.js
```
3) In the sidebar, use the "Local Dev MCP" row → Connect MCP. You should see a message like "MCP connected: 3 tools" and a Tools panel with a few tools (echo, time, sum). Try running them with JSON args.

Files
- manifest.json: MV3 manifest (host permissions for chatgpt.com & chat.openai.com)
- background.js: service worker; message router; storage; logs/status; dev handlers
- content.js: Shadow DOM UI; collapsible right sidebar with tabs (Servers/Tools/Dev/Settings)
- DESIGN.md: architecture, selectors strategy, UI contract, storage shapes
- DECISIONS.md: choices and tradeoffs log

Message schema (envelope)
Request: { kind: 'GET_SETTINGS'|'SET_SETTINGS'|'LIST_SERVERS'|'GET_SERVER'|'SET_DEFAULT'|'TOGGLE_SERVER'|'PING'|'LOG'|'LIST_LOGS'|'CLEAR_LOGS', requestId, payload? }
Response: { requestId, ok: boolean, ...data|error }

Storage
- Key: mcp.webbridge.global.v1 (chrome.storage.sync)
- Shape: { version: 1, defaultServerId?: string, servers: McpServer[] }
- First-run: seeds 4–6 mock servers, defaultServerId = 'puppeteer'
- Local data: statuses (mcp.webbridge.status.v1), logs (mcp.webbridge.logs.v1)

Dev features
- Dev tab: worker time, installed timestamp, rolling logs with Refresh / Clear
- Server toggles: enable/disable per server (persisted) 

Dev notes
- No telemetry. Only local console.debug.
- Minimal permissions: storage + host permissions for chatgpt.com & chat.openai.com
- DOM resilience: Shadow DOM sidebar; no layout overlap with native UI
- Rollback: if sidebar proves intrusive, convert to inline panel below composer


