# TESTS

Scope: Quick manual checklist (Iteration B1 -> B2) to validate Local Echo integration, error signaling, lifecycle, and UI isolation.

## Prereqs
- Chrome with extension loaded (unpacked)
- Terminal running Local Echo:
  - npm i ws
  - node scripts/mcp-localdev.js

## B1 — Connect & Tools
1) Open ChatGPT page. Click the MCP chip to open sidebar.
2) Servers tab: toggle "Local Echo" Enabled.
3) Click "Connect".
   - Expect: status dot turns yellow then green.
   - Tools tab shows echo, time, sum.
4) Tools:
   - echo: textarea {"text":"hi"} -> Run -> Result shows hi.
   - sum: textarea {"a":2,"b":3} -> Run -> Result shows 5.
   - Error case: sum with {} -> shows error text.

## Failure path
1) Stop the Local Echo server.
2) Click Connect again.
   - Expect: status dot red; Dev tab shows error log (connect failed/timeout).
   - Extension action badge should show a red ! (if supported by your browser theme).

## Lifecycle
1) In chrome://extensions, click service worker -> Stop.
2) Back on page, try a tool.
   - Expect: auto reconnect on first use; tools run.
3) Leave idle 12–15 minutes.
   - Expect: auto-disconnect (Dev tab logs). Next tool use reconnects.

## Logs & Status
- Dev tab -> Clear logs; perform connect + run echo; logs list shows events.
- Verify logs are capped (run many actions; only last ~500 kept).
- LIST_STATUS shows per-server fields: connected, connectedAt, lastOkToolCallAt, lastError.

## UI isolation
- Shadow DOM present; styles not leaking; chip re-anchors after SPA changes; fallback positions work.
