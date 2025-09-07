# MCP Web Bridge — Deep Research Brief (Docs-only)

Audience: ChatGPT Deep Research with access to the GitHub repo. Do not write or change code. Produce documentation, issues, and PR-ready proposals only, fully aligned with our rules and roadmap.

Last updated: 2025-09-07 (UTC)

---

## 0) Ground rules and shared vocabulary

Honor our rules and design decisions. Only recommend changes that comply with these guardrails.

- Canonical principles (from `docs/RULES.md` and `docs/DECISIONS.md`):
  - Content Script = UI only; Background = logic only; Shadow DOM
  - typed message schema; consistent request/response envelopes
  - storage: sync (settings) vs local (status/logs)
  - MutationObserver with fallback; stable selectors; no CSS/JS bleed
  - minimal & explicit permissions; no telemetry; no seeded third‑party MCPs
  - error visibility: no silent failures; log and propagate
- Consistency:
  - Use the terms: Content Script, Background, Shadow DOM, typed message schema, storage: sync vs local, MutationObserver with fallback, minimal permissions
- Stop rule:
  - If any recommendation conflicts with `docs/RULES.md` or our `docs/ROADMAP.md`, flag it, propose alternatives, and stop that line of work.

---

## 1) Repository context (read this first)

Read these files to capture current architecture, capabilities, and constraints:
- Core docs:
  - `docs/README.md`, `docs/INDEX.md`, `docs/DESIGN.md`, `docs/DECISIONS.md`, `docs/RULES.md`, `docs/ROADMAP.md`, `docs/TASKS.md`, `docs/SETUP.md`, `docs/PROMPTS.md`
  - Agents: `docs/agents/*.md` (health, connection probe, DOM watch, research, steward)
- Runtime (MV3):
  - Manifest: `manifest.json`
  - Background (logic/state): `background/` (esp. `router.js`, `storage.js`, `mcpManager.js`) and/or `background.js` if present
  - Content (UI only): `content/` (esp. `mount.js`) and/or `content.js`
- Historical notes: `docs/logs and outdated/*.md`

Capture key facts:
- What message kinds exist now; where are they handled
- What storage keys are used; what is persisted in sync vs local
- How the UI mounts; current selectors and fallbacks; any MutationObserver scopes
- Current permissions and host patterns

Deliver a concise repository snapshot before proposing changes.

---

## 2) Objectives (what success looks like)

- Achieve working connections to actual MCP servers safely and predictably
- Define better methods of connecting, reconnecting, and validating connection state
- Provide developer-visible signals that make it obvious (from IDE or UI) that things are working
- Produce a prioritized plan for shipping useful, manageable features (docs-first, code later)

Non-goals: writing code; changing permissions; seeding third‑party MCPs in the shipping extension. Keep everything in docs, issues, and PR-ready diffs.

---

## 3) Research agenda (tasks and questions)

Structure your work into the following tracks. Each track yields concrete artifacts under `/reports/agents/research/<YYYY-MM-DD>/...` and a set of issues/PR suggestions.

### A) Current state assessment (baseline)
- Map the message schema in Background: enumerate kinds, payloads, and responses (e.g., LIST_SERVERS, CONNECT_MCP, LIST_MCP_TOOLS, CALL_MCP_TOOL, GET/SET_SETTINGS, TOGGLE_SERVER, PING/LOG/logs/status/badge, etc.).
- Identify where connection logic lives (e.g., `background/mcpManager.js` or equivalent in `background.js`) and what it supports (WebSocket JSON‑RPC initialize, tools/list, tools/call).
- Document current connection lifecycle: creation, error handling, retry/backoff, and teardown (MV3 worker implications).
- Catalog UI status signals: toolbar badge, list status dots, toasts, Dev tab indicators, and their data sources.
- Verify DOM strategy: Shadow DOM, mount point(s), MutationObserver scopes, and fallbacks.
- Verify permissions and hosts: ensure `chatgpt.com` and `chat.openai.com` present; confirm no wildcards.
- Output: `baseline.md` with file:line references and diagrams of message flow and connection state.

### B) MCP ecosystem scan (docs-only)
- Survey official MCP servers and community servers that can run locally/offline (no credentials), focusing on:
  - Local Dev MCP (ws) or “Local Echo”
  - Memory server (local)
  - Filesystem server (local)
  - Firecrawl (if local/mocked)
  - Puppeteer/Playwright MCP (automation potential)
- For each candidate:
  - Capabilities and tool schemas; maturity signals (last commit, license, stability)
  - Local run story; payload sizes; connection transport; auth requirements
  - Fit with our message schema and MV3 constraints
  - Risks and integration costs (quota, latency, size)
- Output: `mcp-landscape.md` with a ranked short list for Iteration B.

### C) Connection & reliability patterns (MV3‑aware)
- Evaluate options for connection management under MV3 service worker lifecycle:
  - On‑demand connect (per action)
  - Lazy reconnect + idempotent initialize/tools/list
  - Heartbeats (server‑side or client PING) without anti‑patterns (no infinite keep‑alive)
  - Backoff strategies and error taxonomy
- Define “connected” definitively:
  - Successful `initialize` response with `serverInfo`
  - Non‑empty `tools/list` (or explicit empty allowed)
  - Optional “tool smoke test” (e.g., `echo` or `time`) with bounded timeout
  - Record: `connectedAt`, `lastHeartbeatAt`, `lastOkToolCallAt`, per server
- Specify storage model for status:
  - `chrome.storage.local` keys and shapes (bounded logs ≤500, statuses per server)
  - Event correlation IDs and requestId propagation for traceability
- Output: `connection-patterns.md` with state diagrams and acceptance checks.

### D) Developer visibility & UX signals
- Define a minimal, native‑looking UI status model in the content script (without new permissions):
  - Connection dot semantics (gray/green/red/yellow)
  - Badge text rotations for error vs ok
  - Dev tab metrics: worker time, installedAt, recent errors, last connect results
  - Explicit reconcile actions: “Reconnect”, “List tools”, “Run smoke test” (docs-only designs)
- Output: `devex-signals.md` with annotated mockups and event→signal mapping.

### E) Roadmap and acceptance criteria (Iteration B/C)
- Propose a lean milestone plan that ships one real MCP first (local, no auth), then optionally a second.
- Define binary acceptance checks for each milestone (e.g., connect, list tools, run `echo`/`time`, clear errors, survive reloads, pass agents).
- Output: `milestones.md` with checklists and rollback plans.

---

## 4) Deliverables (what to write)

Under `/reports/agents/research/<YYYY-MM-DD>/` produce:
- `baseline.md`: repository snapshot (contracts, flows, constraints)
- `mcp-landscape.md`: server survey with ranked recommendations and risks
- `connection-patterns.md`: MV3‑compliant connection lifecycle and status model
- `devex-signals.md`: developer‑visible signals and UI/UX mapping (docs-only)
- `milestones.md`: prioritized plan and acceptance criteria
- Optional diagrams in Mermaid (keep neutral/standard colors)

Additionally, open GitHub issues using the template in `docs/agents/templates.md` for each concrete, mechanical change (no logic changes proposed that conflict with rules). If a change is safe and purely mechanical (e.g., docs restructuring), prepare a PR checklist per template.

---

## 5) Sources to consult

- This repository (code + docs) as specified above
- Model Context Protocol docs and the official servers monorepo
- Chrome MV3 service worker lifecycle and message passing docs
- Any public README/docs of shortlisted MCP servers

No secrets; no external telemetry. Do not add seeded third‑party MCPs to settings; keep integration plans in docs.

---

## 6) Constraints and compliance checks

- Manifest: MV3, background `service_worker`, minimal `permissions`, limited `host_permissions` (ChatGPT domains only), no wildcards
- Content scripts must not perform network activity
- Background must not touch DOM
- Logs bounded to ~500 entries; errors are visible and actionable
- Message envelopes: `{kind, requestId, payload?}` with `{ok, data?|error?}` responses
- Storage split: sync (config), local (status/logs)

---

## 7) Output format requirements

- Use clear, structured Markdown with short sections and checklists
- Reference exact files and lines (use GitHub permalinks where possible)
- Include diagrams where a state machine or sequence clarifies behavior
- For each recommendation, include:
  - Rationale and alternatives considered
  - Risks and mitigations
  - Rollback plan
  - Acceptance criteria

---

## 8) Specific questions to answer (prioritized)

1) Which locally runnable MCP servers should we target first for Iteration B (no auth)? Provide exact run commands and expected tool schemas.
2) What definitive “connected” criteria and heartbeat policy should we adopt to be MV3‑safe? Include timeouts and backoff.
3) What storage schema for statuses and logs best supports debugging without exceeding quotas? Include key names and caps.
4) What minimal UI/Dev signals make success/failure obvious without cluttering ChatGPT’s UI? Provide a mapping table.
5) What tests and agents should be prioritized (agent‑conn, agent‑health, agent‑dom) and what outputs prove stability?
6) What permissions, if any, need adjustment for the above (ideally none)? Validate against RULES.

---

## 9) Templates

Use `docs/agents/templates.md` for PR and issue bodies. For new ADRs, include title, context, decision, consequences.

---

## 10) Success criteria for this research pass

- All five deliverables produced in `/reports/agents/research/<date>/`
- ≥5 actionable GitHub issues with clear scopes and binary acceptance checks
- Zero recommendations that violate `docs/RULES.md`
- A credible plan to connect to at least one real MCP in Iteration B with clear validation steps

---

## Appendix A — Current contracts (to validate and extend)

Canonical message kinds (current and planned; validate in code):
- Settings: GET_SETTINGS, SET_SETTINGS, LIST_SERVERS, GET_SERVER, SET_DEFAULT, TOGGLE_SERVER
- MCP ops: CONNECT_MCP, LIST_MCP_TOOLS, CALL_MCP_TOOL
- Dev/health: PING, LOG, LIST_LOGS, CLEAR_LOGS, SET_BADGE
- Status: SAVE_STATUS, LIST_STATUS

Storage keys (validate in code):
- sync: `mcp.webbridge.global.v1`
- local: `mcp.webbridge.status.v1`, `mcp.webbridge.logs.v1`, `mcp.webbridge.installedAt`

UI anchors:
- Shadow DOM sidebar; tabbed UI; status dots; Dev tab; MutationObserver with fallback

---

## Appendix B — Non-goals and red lines

- No code changes in this research pass
- No new permissions or wildcard hosts
- No seeded third‑party MCP servers in shipping defaults
- No telemetry
