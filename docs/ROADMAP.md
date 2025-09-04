# ROADMAP

Scope: Milestones derived from the redesign plan. Each milestone includes acceptance checks and noted risks. No new features are added.
Last updated: 2025-09-03 (UTC)

## Milestone 1: Core architecture refactor

- Acceptance checks:
  - Content Script uses Shadow DOM and injects toggle + sidebar shell.
  - Background implements message handlers for LIST_SERVERS, CONNECT_MCP, CALL_MCP_TOOL, TOGGLE_SERVER, SET_DEFAULT, GET/SET_SETTINGS.
  - storage: sync vs local implemented with version/migration placeholder.
  - Logs stored in local storage with bounded size.
- Risks: DOM selector brittleness on ChatGPT; service worker lifecycle.

## Milestone 2: MCP connection manager

- Acceptance checks:
  - WebSocket JSON-RPC connections managed per serverId.
  - Tools listed via connection after CONNECT_MCP.
  - Errors surfaced via structured error field and log entries.
- Risks: Reconnect semantics in MV3; error propagation.

## Milestone 3: Tools UI with results display

- Acceptance checks:
  - Tools tab shows tools for selected/default server.
  - Running a tool displays actual result content (not just a toast) with copy capability.
  - Status indicators reflect success/failure.
- Risks: Large outputs overwhelming panel; formatting variety.

## Milestone 4: Firecrawl integration (configurable)

- Acceptance checks:
  - User can configure a Firecrawl MCP endpoint (local or cloud) in settings.
  - CONNECT_MCP fetches tools (e.g., scrape/search) and runs them.
  - Results are displayed and can be inserted into ChatGPT input.
- Risks: API key handling by user; endpoint availability.

## Milestone 5: Settings and server management

- Acceptance checks:
  - Add/Remove server entries via UI form; stored in sync storage.
  - Default server clearly marked; toggle enable/disable persists.
- Risks: Validation and UX complexity.

## Milestone 6: Dev & QA utilities

- Acceptance checks:
  - Dev tab shows logs and connection info; clear button available.
  - Local echo server instructions verified; basic headless automation checklist prepared.
- Risks: Flaky headless browser automation; auth requirements for ChatGPT.
