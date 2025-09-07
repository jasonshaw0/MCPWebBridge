# Reusable Templates (agents include these in PRs/issues)

## PR Checklist (include in PR body)

- [ ] No permission changes (`manifest.json`)
- [ ] No seeded third-party MCPs
- [ ] No UI/logic split violations
- [ ] Lints/compile/tests pass (if applicable)
- [ ] Imports updated; no broken paths
- [ ] Linked report under `/reports/agents/...`

## Issue Template (include in issue body)

- **Agent:** <name>  
- **Date:** <YYYY-MM-DD>  
- **Finding:** <what failed>  
- **Evidence:** file:line, logs, screenshots  
- **Impact:** <user-visible? dev-only?>  
- **Proposed next step:** <patch? investigation?>  
- **Blocking rules:** <if any from `.cursorrules`>
