 Cursor Background Agents — Unified Setup Pack

> Copy this entire file into your repo as `docs/AGENTS_SETUP.md`. Then create one **Cursor Background Agent** per section using the provided prompt blocks. Agents run only on branches they create, never on `main`.

---

## 0) Global policy (applies to all agents)

- **Honor `.cursorrules`.** Content = UI only; Background = logic only; Shadow DOM; minimal permissions; typed messages; sync vs local storage split; MutationObserver + fallback; **no telemetry**.
- **No permission changes.** Never modify `manifest.json` permissions or host patterns.
- **No third-party MCP seeds.** Only **Local Echo** is allowed as a seed; all other MCPs are dev-only and user-added later.
- **Branching:** Work only on branches you create, with prefix `agent/<short-name>/<topic>`. Never push to `main`.
- **PR etiquette:** Mechanical/safe changes may open a PR with a checklist; everything else becomes an **issue** with evidence and repro.
- **Secrets:** Never commit endpoints, API keys, or tokens. If needed for local dev, require `.env.local` (ignored by Git).
- **Artifacts:**
  - Reports → `/reports/agents/<agent>/<YYYY-MM-DD>/...`
  - Helper scripts/tests → `/dev/agents/<agent>/...`
  - OPEN QUESTIONS → `/docs/OPEN_QUESTIONS.md`
- **Stop rule:** If any task conflicts with `.cursorrules` or ROADMAP, stop and file an issue.

---

## 1) Repository layout expectations (agents assume this)

/extension/ # MV3 runtime (ship)
/src/background/
/src/content/
/assets/
manifest.json
/dev/ # non-shipping dev assets
/mcp/ # local echo & mocks
/scripts/ # node/playwright helpers
/agents/ # agent-authored utilities
/playgrounds/ # snapshots, selector sandboxes
/docs/ # canonical docs (incl. this file)
/reports/agents/ # agent outputs by date
/test/ # e2e and fixtures
.cursorrules # rules only


---

## 2) Scheduling recommendations (ET)

- **Health Sentinel:** on every push to non-main; nightly **02:00 ET**
- **Connection Probe:** manual after milestone; nightly **03:00 ET**
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

