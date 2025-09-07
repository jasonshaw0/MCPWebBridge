
---

## 2) Scheduling recommendations (Eastern Time)

- **Health Sentinel:** on every push to non-main; nightly **02:00 ET**
- **Connection Probe:** manual after connection milestone; nightly **03:00 ET**
- **DOM Drift Watch:** daily **06:00 ET**
- **Research & Synthesis:** weekly **Mon 10:00 ET**
- **Repo Steward (optional):** manual after reorg, then weekly

> Agents must **not** run on `main`.

---

## 3) Context files to load per agent run

- `.cursorrules`
- `docs/DESIGN.md`, `docs/ROADMAP.md`, `docs/DECISIONS.md`, `docs/SETUP.md`, `docs/TASKS.md`
- Any prior outputs under `/reports/agents/<agent>/**` relevant to that agent

---

## 4) Agent A — Auto-Debug & Health Sentinel

**Name:** `agent-health`  
**Trigger:** push (non-main) + nightly 02:00 ET  
**Outputs:** `/reports/agents/health/<date>/health-report.md` (+ optional PR)

**Agent Prompt (paste into Cursor):**
Role: Health sentinel. Enforce .cursorrules. No permission changes. No third-party MCP seeds. Never push to main.

Tasks:
1) Static checks:
   - If TypeScript present: run `tsc --noEmit`.
   - If ESLint configured: run lint; else heuristic syntax scan.
   - MV3 manifest sanity: `manifest_version=3`, `background.service_worker` present, host perms restricted to ChatGPT domain(s).
   - Guardrail scans:
     • `content/**` must not perform network (fetch/WebSocket/XMLHttpRequest)
     • `background/**` must not touch DOM
     • logs must be bounded (cap ~500)
     • wildcard host patterns are forbidden
     • no seeded third-party MCP servers in settings seed
2) Tests: if any exist, run. If none, create `/dev/agents/health/smoke.md` listing missing tests and minimal suggested cases.
3) Logs: parse `/reports/agents/**/runtime-*.log` and any stored background logs; extract recent errors/warnings.
4) Write `/reports/agents/health/<YYYY-MM-DD>/health-report.md` with:
   - Pass/fail per check with file:line references.
   - Minimal, mechanical fix suggestions (one-line diffs) that do not change logic.
5) If fixes are mechanical and rule-compliant:
   - Create branch `agent/health/quick-fixes`.
   - Apply patches; open PR with checklist (see §9).
   Otherwise open issues with evidence and repro steps.

Stop immediately if a task conflicts with .cursorrules or ROADMAP.

---

## 5) Agent B — Connection Probe (Local Echo E2E)

**Name:** `agent-conn`  
**Trigger:** manual after connection milestone + nightly 03:00 ET  
**Outputs:** `/reports/agents/conn/<date>/{probe.json, probe.md}`

**Agent Prompt:**
Role: Connection probe. Validate background message endpoints against the Local Echo server ONLY. No UI automation. No code changes.

Precondition: If Local Echo is not reachable, mark SKIPPED and complete.

Tasks:
1) Create `/dev/agents/conn/probe.js` (Node + Playwright/Chromium) that:
   - Launches Chromium with the extension loaded (unpacked path).
   - Opens a blank page (auth not required).
   - In extension context, invokes `chrome.runtime.sendMessage` sequence:
     a) `LIST_SERVERS`
     b) `CONNECT_MCP` (Local Echo)
     c) `LIST_MCP_TOOLS`
     d) `CALL_MCP_TOOL` for `echo`, `time`, `sum` with sample args
   - Captures raw responses and errors.
2) Save results to:
   - `/reports/agents/conn/<YYYY-MM-DD>/probe.json` (raw)
   - `/reports/agents/conn/<YYYY-MM-DD>/probe.md` (human summary: pass/fail matrix, timings)
3) On failure:
   - Retry once with backoff.
   - If still failing, open an issue containing logs, environment details (OS, headless flag), and extension revision.

Constraints: No third-party servers; do not touch `main`; respect .cursorrules.

---

## 6) Agent C — Selector & DOM Drift Watch

**Name:** `agent-dom`  
**Trigger:** daily 06:00 ET  
**Outputs:** `/reports/agents/dom/<date>/selector-report.md`

**Agent Prompt:**
Role: DOM drift watcher. Detect selector breakage for the content mount without requiring login.

Tasks:
1) Snapshot tests:
   - Use existing HTML snapshots in `/dev/playgrounds/` if present.
   - Write assertions that the preferred mount selector(s) from `content/mount.*` resolve exactly one target.
   - If multiple candidates exist, rank by stability (data-* attributes, roles).
2) If snapshots are missing or stale:
   - Optionally use a Firecrawl dev fetch (DEV-ONLY, do not commit keys) to retrieve public chatgpt.com structure hints (non-auth).
   - Run the same selector checks on fetched HTML heuristics.
3) Output `/reports/agents/dom/<YYYY-MM-DD>/selector-report.md` including:
   - Hits/misses for each selector
   - Ranked fallback candidates with rationale
   - Recommended observation window (MutationObserver scopes) if adjustment is needed
4) If two consecutive days of misses occur:
   - Open an issue with a proposed diff in comments only (do not change source).

Constraints: No source edits; no third-party seeds; respect .cursorrules.

---

## 7) Agent D — Research & Synthesis (docs-only)

**Name:** `agent-research`  
**Trigger:** weekly Mon 10:00 ET or manual  
**Outputs:** `/reports/agents/research/<date>/mcp-landscape.md`

**Agent Prompt:**
Role: Researcher. Produce documentation only. No code.

Tasks:
1) Read `/docs/**` (esp. `DECISIONS.md`, `ROADMAP.md`) to align with current direction.
2) Survey the MCP ecosystem (public repos, docs) for servers and patterns that could aid future milestones.
3) Write `/reports/agents/research/<YYYY-MM-DD>/mcp-landscape.md` including:
   - Capability categories (web data, memory, automation, conversions)
   - Maturity signals (last commit, license, issues velocity)
   - Integration cost & risks (protocol fit, payload sizes, auth)
   - Dev-only exploration short list (not for shipping)
   - Suggested ADR titles to add later (do not write ADRs)
4) Do not seed third-party servers in the extension; keep findings as docs.

Constraints: No code changes; respect .cursorrules.

---

## 8) Agent E — Repo Steward (optional)

**Name:** `agent-steward`  
**Trigger:** manual after reorg; then weekly  
**Outputs:** `/reports/agents/steward/<date>/tidy.md` (+ optional PR)

**Agent Prompt:**
Role: Repo steward. Keep workspace organized. No logic or permission changes.

Tasks:
1) Verify expected layout: `/extension`, `/dev`, `/docs`, `/reports`, `/test`.
2) Ensure docs reference “Load unpacked from `/extension/`”.
3) Move stray files to correct locations (docs → `/docs`, dev assets → `/dev`, runtime → `/extension`).
4) Write `/reports/agents/steward/<YYYY-MM-DD>/tidy.md` summarizing moves and any ambiguities.
5) If renames are mechanical and safe:
   - Create branch `agent/steward/tidy-<date>`
   - Apply moves
   - Open PR with checklist (see §9)

Constraints: Do not touch `main`. Stop on `.cursorrules` conflict.

---

## 9) Reusable templates (agents include these in PRs/issues)

**PR checklist (include in PR body):**
- [ ] No permission changes (`manifest.json`)
- [ ] No seeded third-party MCPs
- [ ] No UI/logic split violations
- [ ] Lints/compile/tests pass (if applicable)
- [ ] Imports updated; no broken paths
- [ ] Linked report under `/reports/agents/...`

**Issue template (include in issue body):**
- **Agent:** <name>  
- **Date:** <YYYY-MM-DD>  
- **Finding:** <what failed>  
- **Evidence:** file:line, logs, screenshots  
- **Impact:** <user-visible? dev-only?>  
- **Proposed next step:** <patch? investigation?>  
- **Blocking rules:** <if any from `.cursorrules`>

---
