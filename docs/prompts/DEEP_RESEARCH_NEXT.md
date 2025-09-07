# Deep Research Prompt — Iteration B2+ Leap Plan (MCP Web Bridge)

Role: Senior Research & Systems Architect. Your output will directly drive a major implementation leap for MCP Web Bridge. Produce a thorough, actionable, and technically precise plan rooted in evidence from current, authoritative sources.

Audience: The plan is for engineers building a Chrome MV3 extension with Content UI + Background logic split, using WebSocket JSON-RPC (MCP), minimal permissions, and strong DOM isolation.

Hard Guardrails (must honor in all recommendations)
- Content Script = UI only; Background = logic only; Shadow DOM for UI.
- Typed message schema `{kind, requestId, payload}` → `{ok, data?|error?}`; no silent failures.
- Storage split: sync = settings; local = status/logs (bounded ≤ 500).
- Robust DOM handling with MutationObserver + fallback positioning; stable selectors; zero CSS/JS bleed.
- Minimal permissions: keep current `storage` + `https://chatgpt.com/*` only. No wildcards. No telemetry. No seeded third-party MCPs.
- MV3 compliance for lifecycles; avoid long-lived busy loops. Prefer lazy/on-demand connections, modest heartbeat, auto-disconnect on idle.

Required Inputs (load first)
- Repo docs: `docs/README.md`, `docs/DESIGN.md`, `docs/DECISIONS.md`, `docs/RULES.md`, `docs/ROADMAP.md`, `docs/SETUP.md`, `docs/TASKS.md`, `docs/9-7-2025-deep-research-full`.
- Code: `manifest.json`, `background.js`, `background/router.js`, `background/storage.js`, `background/mcpManager.js`, `background/log.js`, `content/mount.js`, `content/bus.js`, `content.js`, `scripts/mcp-localdev.js`.

Mission
Produce a comprehensive research synthesis and an actionable implementation blueprint to achieve a significant step-change in capability and UX, spanning:
1) Production-grade MCP server integrations (local-first, no secrets): Memory, Filesystem; optional: additional local servers with high utility.
2) A better Tools UI: schema-driven inputs, richer results, resilience, and ergonomics.
3) Reliability upgrades: streaming readiness, backoff/heartbeat refinements, auto-reconnect policies, background lifecycle tactics; MV3-safe.
4) Dev & Ops ergonomics: Dev tab improvements, status/badging, logs, self-tests, quick troubleshooting.
5) Future expansion guidance: Settings tab, multi-server switching, large payload handling, performance budgets, and sustainable architecture.

Research Agenda (answer each with citations and practical conclusions)
A. MCP Servers (local-first)
- Inventory current official/community MCP servers suitable for local/offline use. For each: capabilities, tools, input schemas, result formats, WS endpoints, ports, platform support (incl. Windows), resource usage, license, maintenance cadence.
  - Must include: `@modelcontextprotocol/server-memory`, `@modelcontextprotocol/server-filesystem`.
  - Consider: CSV/Excel, HTTP fetcher, code-runner, search (local tools), and any well-maintained utility servers that do not require API keys.
- Protocol details: JSON-RPC shapes for initialize, tools/list, tools/call; conventions for `content` arrays, binary/resource references (e.g., `screenshot://`), streaming patterns (SSE vs WebSocket partials), error objects.
- Windows path considerations for Filesystem server; safe UX to avoid destructive operations by default.
- Clear, minimal run commands (npx/docker) and expected connection URLs.

B. MV3 + WebSocket Reliability
- Current Chrome MV3 expectations for service worker lifetimes with open WebSockets; known caveats. Evidence-backed patterns for:
  - On-demand connect; timeouts; exponential backoff policy; capped retries.
  - Heartbeat intervals that are MV3-friendly without keeping the worker hot indefinitely.
  - Auto-disconnect on idle and reconnect-on-use patterns.
  - Whether to consider `chrome.alarms` (tradeoffs) vs timer scheduling; guidance without expanding permissions unless strictly needed.
- Robust error taxonomy (connect errors, timeouts, RPC errors, closure) with user-visible signals and logs.

C. Tools UI — Schema-Driven Forms
- Best practices for generating forms from JSON Schema-like `inputSchema` (object properties, types, required, enums, defaults). Recommendations for mapping:
  - string/number/boolean/array/object, enums to selects, optional fields, nested shapes.
  - Graceful fallback to JSON textarea; validation messaging; example placeholders.
- Result rendering guidelines:
  - Content arrays (text parts) vs structured JSON; safe truncation thresholds; “Show more” toggles; copy/export.
  - Handling resource references (e.g., `screenshot://name`) and binary-safe display strategies without broadening permissions.
  - Streaming readiness: how to present partial results if/when supported (without changing current message transport yet).
- Accessibility and dark-mode consistency (within Shadow DOM), minimal palette tokens, layout resilience.

D. Dev & Diagnostics
- Dev tab improvements: live logs with filtering; connect/reconnect actions; smoke tests; storage inspector for status/logs (read-only); badge logic (error bang) behavior.
- Unified logging levels and throttling guidance to stay within local storage rate limits and caps.
- Minimal self-test script and manual checklists to validate Local Echo, Memory, Filesystem end-to-end.

E. Performance & Scalability
- Message size constraints in Chrome runtime messaging; strategies for large results (truncate/stream/segment store in local with handles).
- Virtualization guidance for long lists (many tools or large outputs); time budgets for UI interactions.
- Multi-connection handling: simultaneous connected servers; memory and CPU considerations; hygiene for connection cleanup.

F. Security & Privacy
- Confirm no new permissions; no telemetry; no secrets stored by the extension. If users need API-key servers, document that keys stay in their server env only.
- Logging: never store sensitive payloads; redact obvious secrets; keep logs local and bounded.

Deliverables You Must Produce
1) Prioritized Implementation Plan (short and crisp)
- Targets for the next two iterations: 
  - Iteration C1: Settings UI + Filesystem integration + schema forms baseline.
  - Iteration C2: Streaming readiness, resource handling, Dev tab filters, multi-connection polish.
- For each, define acceptance criteria, rollback switches, and risks.

2) Detailed Specs (engineer-ready)
- Connection Manager spec updates: state machine diagram, timeouts, backoff constants, heartbeat policy, auto-idle disconnect, reconnect-on-use.
- Router contracts: message kinds, payloads, response shapes (strict), and error codes; examples for typical flows.
- Tools UI spec: schema-to-form mapping, validation rules, rendering heuristics, truncation/expand interactions, result copy/export behaviors.
- Dev tab spec: commands, UI layout, filters, actions, and log data model with bounds.
- Status/badge spec: icon text/color mapping, state transitions, and when to clear.

3) Integration Guides
- Memory server: launch, expected tools (save/query), example calls, result normalization.
- Filesystem server: launch with allowed directories, examples (read/write/list/search), Windows paths, safety guidance.
- Add any vetted local server templates (docs-only) that provide high utility while staying within guardrails.

4) Test/QA Plan
- Manual checklists (update `docs/TESTS.md`) with pass/fail matrices for connect/list/call/error/lifecycle.
- Smoke test buttons in Dev tab and sample payloads.
- Optional: outline for a Playwright-based dev-only script to validate connect + basic tool runs (not to be shipped in extension).

5) ADR/RFC Suggestions
- Proposed ADR titles and one-paragraph summaries for: schema-driven forms, streaming readiness, multi-connection policy, message size handling, badge semantics, Settings UI validation.

6) Risk Matrix and Mitigations
- Identify top risks (e.g., large payload hangs, MV3 idle edge cases, schema complexity) and propose mitigations and rollbacks.

Output Format
- Single Markdown document with sections matching Deliverables 1–6.
- Use precise, implementation-grade language with examples and json snippets where helpful.
- Include explicit file/function touchpoints using backticks (e.g., `background/mcpManager.js#sendRpc`, `content/mount.js` Tools panel).
- Cite sources (URLs) inline as markdown links where applicable.

Constraints
- Do NOT recommend new permissions unless a hard blocker is proven and minimal (e.g., `alarms`) and propose an ADR for it; default to not adding it.
- Do NOT seed third-party servers; only document how to run local ones.
- Maintain strict UI/logic split and message envelope.

Definition of Success
- The output equips the team to implement: a robust connection layer for 2+ local servers, a schema-driven Tools UI with better UX, clear diagnostics, and a path to handle larger results and streaming—without expanding permissions or breaking MV3 rules.

Appendix — Current State Snapshot (to validate against)
- Baseline code has: `background/mcpManager.js` with timeouts, backoff, light heartbeat, idle close; router handlers for CONNECT/LIST/CALL/STATUS/LOGS; Dev tab and Tools tab; status dots and badge error bang.
- Ensure your recommendations build on this and replace or refine only where needed; highlight any deltas explicitly.

> Deliver a top-tier, decision-ready plan we can implement immediately.
