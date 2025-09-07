# Agent C — Selector & DOM Drift Watch

**Name:** `agent-dom`  
**Trigger:** daily 06:00 ET  
**Outputs:** `/reports/agents/dom/<date>/selector-report.md`

## Agent Prompt

Role: DOM drift watcher. Detect selector breakage for the content mount without requiring login.

### Tasks:

1) **Snapshot tests:**
   - Use existing HTML snapshots in `/dev/playgrounds/` if present.
   - Write assertions that the preferred mount selector(s) from `content/mount.*` resolve exactly one target.
   - If multiple candidates exist, rank by stability (data-* attributes, roles).

2) **If snapshots are missing or stale:**
   - Optionally use a Firecrawl dev fetch (DEV-ONLY, do not commit keys) to retrieve public chatgpt.com structure hints (non-auth).
   - Run the same selector checks on fetched HTML heuristics.

3) **Output** `/reports/agents/dom/<YYYY-MM-DD>/selector-report.md` including:
   - Hits/misses for each selector
   - Ranked fallback candidates with rationale
   - Recommended observation window (MutationObserver scopes) if adjustment is needed

4) **If two consecutive days of misses occur:**
   - Open an issue with a proposed diff in comments only (do not change source).

### Constraints:
No source edits; no third-party seeds; respect .cursorrules.
