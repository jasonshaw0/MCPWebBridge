# TASKS

Scope: MVP backlog derived from the redesign plan. Tasks are verifiable with binary “done” checks. No speculative items.
Last updated: 2025-09-03 (UTC)

## 1) Implement storage module (sync/local)
- Steps: Define schema; get/set functions; version/migration placeholder; log size bound.
- Acceptance: sync holds servers/default; local holds statuses/logs; functions tested via background messages.

## 2) Background message router
- Steps: Implement LIST_SERVERS, GET/SET_SETTINGS, TOGGLE_SERVER, SET_DEFAULT; structure responses.
- Acceptance: Requests return `{ ok, data|error }`; errors logged; no unhandled rejections.

## 3) MCP Connection Manager
- Steps: Connect/disconnect (WebSocket JSON-RPC); list tools post-init; call tool.
- Acceptance: CONNECT_MCP returns tools; CALL_MCP_TOOL returns tool result; errors handled.

## 4) Content messaging wrapper
- Steps: Promise-based sendMessage wrapper with typed kinds; correlates requestId.
- Acceptance: Content calls resolve/reject correctly; schemas match.

## 5) Content UI Shell (Shadow DOM)
- Steps: Inject host; floating toggle; sidebar with tabs.
- Acceptance: Visible on ChatGPT; toggles open/close; no style leaks.

## 6) DOM anchoring + MutationObserver with fallback
- Steps: Anchor to composer container; observe SPA changes; fixed-position fallback.
- Acceptance: UI persists across navigation; fallback visible if anchor missing.

## 7) Tools tab results display
- Steps: Render tools; form for args; display actual results with copy.
- Acceptance: After CALL_MCP_TOOL, content is shown (not only toasts).

## 8) Status indicators and logs
- Steps: Per-server status; Dev tab log view; clear button.
- Acceptance: Status reflects last action; logs capped; clear works.

## 9) Firecrawl server integration (config)
- Steps: Add server entry; connect; run scrape/search; show results.
- Acceptance: Tools list populated; running returns content; errors surfaced.

## 10) Settings UI for server add/remove
- Steps: Form to add/remove; validate fields; persist to sync storage.
- Acceptance: New entries appear in Servers tab; removal persists.

## 11) One-click insert to ChatGPT input
- Steps: Safe injection of text to prompt textarea; events dispatched as needed.
- Acceptance: Button inserts text; user can send after optional edit.

## 12) Basic integration test plan
- Steps: Manual checklist; optional automation stub using headless browser.
- Acceptance: Checklist passes; script can detect injected elements and a successful echo call.
