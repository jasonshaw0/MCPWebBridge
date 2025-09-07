# Agent B — Connection Probe (Local Echo E2E)

**Name:** `agent-conn`  
**Trigger:** manual after connection milestone + nightly 03:00 ET  
**Outputs:** `/reports/agents/conn/<date>/{probe.json, probe.md}`

## Agent Prompt

Role: Connection probe. Validate background message endpoints against the Local Echo server ONLY. No UI automation. No code changes.

### Precondition:
If Local Echo is not reachable, mark SKIPPED and complete.

### Tasks:

1) **Create** `/dev/agents/conn/probe.js` (Node + Playwright/Chromium) that:
   - Launches Chromium with the extension loaded (unpacked path).
   - Opens a blank page (auth not required).
   - In extension context, invokes `chrome.runtime.sendMessage` sequence:
     a) `LIST_SERVERS`
     b) `CONNECT_MCP` (Local Echo)
     c) `LIST_MCP_TOOLS`
     d) `CALL_MCP_TOOL` for `echo`, `time`, `sum` with sample args
   - Captures raw responses and errors.

2) **Save results** to:
   - `/reports/agents/conn/<YYYY-MM-DD>/probe.json` (raw)
   - `/reports/agents/conn/<YYYY-MM-DD>/probe.md` (human summary: pass/fail matrix, timings)

3) **On failure:**
   - Retry once with backoff.
   - If still failing, open an issue containing logs, environment details (OS, headless flag), and extension revision.

### Constraints:
No third-party servers; do not touch `main`; respect .cursorrules.
