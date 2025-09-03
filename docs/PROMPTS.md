# PROMPTS

Scope: Reusable prompts for development handoff and daily operation, extracted from the redesign plan. No new guidance added.
Last updated: 2025-09-03 (UTC)

## Development handoff prompt (Iteration B)

Project: MCP Web Bridge Extension – Iteration B (Reboot)
Current Version: A partial MV3 Chrome extension that injects an MCP control panel into ChatGPT. Solid UI, but limited functionality.
Goal of Iteration B: Re-architect and implement a production-grade core with real MCP tool integration for ChatGPT.com. Focus on modularity, reliability, and meaningful features (web browsing via MCP, etc.).

Key Components & Design:

- Content Script (ChatGPT page): Injects a Shadow DOM UI (toggle button + sidebar with tabs). Handles user interaction (clicks, form inputs) and updates UI. No heavy logic here. Uses chrome.runtime.sendMessage to talk to background. Must robustly attach to ChatGPT’s DOM (use data-type="unified-composer" form as anchor; MutationObserver to reattach if needed; fallback to fixed position if fails). Keep it lightweight and resilient to DOM changes.
- Background Service Worker: Core logic and state. Maintains:
  - Settings/Servers List: Stored in chrome.storage.sync. Contains servers (id, name, description, url, enabled) and defaultServerId. On install, seed with basic servers (e.g., Local Dev, Firecrawl placeholder).
  - MCP Connections: Manages active connections (e.g., WebSocket to local MCP servers). Use a map of serverId -> { ws, tools[], etc. }. On “CONNECT_MCP”, initiate connection (with JSON-RPC handshake: call initialize, then tools/list to get available tools).
  - Message Router: Listens for messages from content script. Implements message types: LIST_SERVERS, CONNECT_MCP, CALL_MCP_TOOL, TOGGLE_SERVER, SET_DEFAULT, GET/SET_SETTINGS, etc. Each returns a structured response (with ok and data or error). Ensure every path sendResponse exactly once and returns true for async.
  - Status & Logs: Keep last-known status per server (success/fail of last action) in chrome.storage.local and in-memory. Append log entries for notable events (connections, errors, tool calls). Limit log size to ~500 entries.
- UI Tabs:
  - Servers Tab: List all servers; enable/disable; Connect/Echo; Set default indicator.
  - Tools Tab: For selected/default server, show tools; inputs for args; Run; display actual results (not only toasts).
  - Dev Tab: Extension info and a scrollable log of recent events with Refresh/Clear.
  - Settings Tab: Allow adding/editing/removing server entries (can be phased).
- MCP Integration: Primary external tool to integrate now is Firecrawl (web scraper). Provide a way for user to input a URL/query and call scrape/search; display results with copy option. Plan for Memory and SequentialThinking servers next (scaffold ok, optional in first pass).
- Message Schema: Continue using { kind, requestId, payload } for requests and matching { requestId, ok, ... } for responses. Enumerate all kind strings in one place (avoid typos). Prefer TypeScript types later.
- Resilience & Performance: Use MutationObserver on ChatGPT DOM (observe composer or its container) to remount UI if needed; debounce as appropriate. Ensure no memory leaks. Handle MV3 worker suspend/wake gracefully.
- No Regression of Past Issues:
  - Maintain isolation: all UI in Shadow DOM (no CSS/JS leaks).
  - Minimal permissions.
  - Clear separation: content never calls network; background never touches DOM.
  - Thorough error handling; no silent failures.
  - Keep UI responsive; avoid blocking the content script.
- Dev Practices for AI:
  - Follow the design and constraints above strictly; ask when ambiguous.
  - Write clean code; descriptive names; prefer TypeScript when introduced.
  - Work incrementally and test after each step; use logs for traceability.
  - Update docs (README/CHANGELOG) as features are added.

Immediate Next Steps: Set up project structure; implement background (storage, message handlers, connection manager); implement content (UI mount and messaging); integrate Firecrawl scrape as the first use-case.

## Daily operator prompt (concise)

You are working on MCP Web Bridge (MV3). Follow canonical terms and rules strictly:
- Content Script = UI only; Background = logic only; Shadow DOM; typed message schema; storage: sync vs local; MutationObserver with fallback; minimal permissions.
- Implement or refactor one cohesive unit at a time (e.g., storage module, message router, tools UI).
- Ensure messages use explicit kinds; responses carry ok and data|error.
- After changes, verify Dev tab logs and connect to local echo server. If issues arise, check service worker console first.
- Do not introduce speculative features or permissions. Keep UI resilient to DOM changes.
