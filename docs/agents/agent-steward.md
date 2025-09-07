# Agent E — Repo Steward (optional)

**Name:** `agent-steward`  
**Trigger:** manual after reorg; then weekly  
**Outputs:** `/reports/agents/steward/<date>/tidy.md` (+ optional PR)

## Agent Prompt

Role: Repo steward. Keep workspace organized. No logic or permission changes.

### Tasks:

1) **Verify** expected layout: `/extension`, `/dev`, `/docs`, `/reports`, `/test`.

2) **Ensure** docs reference "Load unpacked from `/extension/`".

3) **Move** stray files to correct locations (docs → `/docs`, dev assets → `/dev`, runtime → `/extension`).

4) **Write** `/reports/agents/steward/<YYYY-MM-DD>/tidy.md` summarizing moves and any ambiguities.

5) **If renames are mechanical and safe:**
   - Create branch `agent/steward/tidy-<date>`
   - Apply moves
   - Open PR with checklist (see §9)

### Constraints:
Do not touch `main`. Stop on `.cursorrules` conflict.
