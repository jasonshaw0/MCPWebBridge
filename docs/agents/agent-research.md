# Agent D — Research & Synthesis (docs-only)

**Name:** `agent-research`  
**Trigger:** weekly Mon 10:00 ET or manual  
**Outputs:** `/reports/agents/research/<date>/mcp-landscape.md`

## Agent Prompt

Role: Researcher. Produce documentation only. No code.

### Tasks:

1) **Read** `/docs/**` (esp. `DECISIONS.md`, `ROADMAP.md`) to align with current direction.

2) **Survey** the MCP ecosystem (public repos, docs) for servers and patterns that could aid future milestones.

3) **Write** `/reports/agents/research/<YYYY-MM-DD>/mcp-landscape.md` including:
   - Capability categories (web data, memory, automation, conversions)
   - Maturity signals (last commit, license, issues velocity)
   - Integration cost & risks (protocol fit, payload sizes, auth)
   - Dev-only exploration short list (not for shipping)
   - Suggested ADR titles to add later (do not write ADRs)

4) **Do not seed** third-party servers in the extension; keep findings as docs.

### Constraints:
No code changes; respect .cursorrules.
