# DECISIONS

Scope: ADR-style entries capturing explicit decisions from the redesign plan. Each entry includes Context, Decision, and Consequences, plus date. No speculative additions.
Last updated: 2025-09-03 (UTC)

## ADR-001: Enforce Content Script = UI only, Background = logic only

Date: 2025-09-03

- Context: The initial implementation mixed concerns; the redesign mandates a strict separation.
- Decision: Content Script handles presentation and messaging only; Background handles all logic, state, storage, and external communications.
- Consequences: Improves maintainability and testability; UI can change without affecting core logic; all network/tool calls centralized.

## ADR-002: Typed message schema and stable message kinds

Date: 2025-09-03

- Context: Previous ad-hoc message patterns led to confusion.
- Decision: Use a typed message schema with enumerated kinds (e.g., LIST_SERVERS, CONNECT_MCP, CALL_MCP_TOOL, TOGGLE_SERVER, SET_DEFAULT, GET_SETTINGS, SET_SETTINGS, LIST_MCP_TOOLS). Responses include `ok` with `data` or `error`.
- Consequences: Clear contracts, easier debugging, enables future TypeScript types and validation.

## ADR-003: storage: sync vs local separation

Date: 2025-09-03

- Context: Need to distinguish persistent configuration from volatile runtime state.
- Decision: Use chrome.storage.sync for persistent settings (servers, defaultServerId) and chrome.storage.local for volatile status/logs.
- Consequences: Predictable state management; supports MV3 service worker lifecycle.

## ADR-004: Shadow DOM UI and robust DOM handling

Date: 2025-09-03

- Context: Host page is dynamic; CSS conflicts must be avoided.
- Decision: Inject UI under a Shadow DOM; use stable selectors; use a MutationObserver with fallback positioning if anchoring fails.
- Consequences: Resilient UI on SPA changes; minimized risk of style/script collisions.

## ADR-005: Minimal permissions and no telemetry

Date: 2025-09-03

- Context: Principle of least privilege and user trust.
- Decision: Request only necessary permissions (e.g., storage and limited host permissions). Do not add telemetry or external calls from the extension.
- Consequences: Easier distribution/approval; better user trust posture.

## ADR-006: Modular code layout and future MCP adapters

Date: 2025-09-03

- Context: Monolithic files hinder extensibility.
- Decision: Modularize content and background code; isolate MCP Connection Manager; plan for adapter pattern for future protocols.
- Consequences: Easier to extend (e.g., add new MCP server types) without UI changes.
