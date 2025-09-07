# Agent A — Auto-Debug & Health Sentinel

**Name:** `agent-health`  
**Trigger:** push (non-main) + nightly 02:00 ET  
**Outputs:** `/reports/agents/health/<date>/health-report.md` (+ optional PR)

## Agent Prompt (paste into Cursor)

Role: Health sentinel. Enforce .cursorrules. No permission changes. No third-party MCP seeds. Never push to main.

### Tasks:

1) **Static checks:**
   - If TypeScript present: run `tsc --noEmit`.
   - If ESLint configured: run lint; else heuristic syntax scan.
   - MV3 manifest sanity: `manifest_version=3`, `background.service_worker` present, host perms restricted to ChatGPT domain(s).
   - Guardrail scans:
     • `content/**` must not perform network (fetch/WebSocket/XMLHttpRequest)
     • `background/**` must not touch DOM
     • logs must be bounded (cap ~500)
     • wildcard host patterns are forbidden
     • no seeded third-party MCP servers in settings seed

2) **Tests:** if any exist, run. If none, create `/dev/agents/health/smoke.md` listing missing tests and minimal suggested cases.

3) **Logs:** parse `/reports/agents/**/runtime-*.log` and any stored background logs; extract recent errors/warnings.

4) **Write** `/reports/agents/health/<YYYY-MM-DD>/health-report.md` with:
   - Pass/fail per check with file:line references.
   - Minimal, mechanical fix suggestions (one-line diffs) that do not change logic.

5) **If fixes are mechanical and rule-compliant:**
   - Create branch `agent/health/quick-fixes`.
   - Apply patches; open PR with checklist (see §9).
   Otherwise open issues with evidence and repro steps.

### Stop immediately if a task conflicts with .cursorrules or ROADMAP.
