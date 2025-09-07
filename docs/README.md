# MCP Web Bridge – Documentation Overview

Scope: High-level summary, quickstart, status, and glossary for the MCP Web Bridge Chrome MV3 extension. Links into the structured documentation created from the redesign plan.
Last updated: 2025-09-03 (UTC)

## Summary

MCP Web Bridge is a Chrome MV3 extension that injects a Shadow DOM UI into ChatGPT’s page to bridge Model Context Protocol (MCP) servers with ChatGPT. The redesign locks in a clean split: Content Script = UI only, Background = logic only, with a typed message schema, storage: sync vs local, MutationObserver with fallback, and minimal permissions.

See the full doc set via [INDEX.md](./INDEX.md).

## Quickstart

1) Load the extension:
   - Load-unpacked from this repo (see [SETUP.md](./SETUP.md)).
2) Open ChatGPT (supported domains per manifest) and verify the MCP tab on the right.
3) Stage 2: start the Local Echo server: `node scripts/mcp-localdev.js` (requires `npm i ws`).
4) In Servers tab, click "Connect" on Local Echo. Switch to Tools tab to see `echo`, `time`, `sum`. Run with JSON args (e.g., `{ "text": "hi" }`).

Screenshot reference: see the figure described in the source plan at `docs/Redesign & Bootstrap Plan for MCP Web Bridge Extension.md`.

## Project status

- Iteration B (Reboot): design and docs restructured; core implementation to follow per [ROADMAP.md](./ROADMAP.md).

## Glossary

- Content Script = UI only: Runs in the page context. Injects and manages the UI (Shadow DOM). Sends messages to Background. Never performs business logic or network calls.
- Background = logic only: Service worker with extension privileges. Owns logic, state, storage, and all external communications (e.g., MCP connections).
- Shadow DOM: Isolated DOM/CSS host for the injected UI to avoid style and script collisions with ChatGPT.
- typed message schema: Structured messages with stable kinds and fields (e.g., `{ kind, requestId, payload }` for requests and `{ requestId, ok, data|error }` for responses).
- storage: sync vs local: Persistent configuration in chrome.storage.sync; volatile status/logs in chrome.storage.local.
- MutationObserver with fallback: Observe key containers to reattach UI on SPA changes; fall back to a visible fixed position if anchoring fails.
- minimal permissions: Only request what’s needed (e.g., storage, constrained host permissions). No telemetry.

## Links

- Design: [DESIGN.md](./DESIGN.md)
- Rules/guardrails: [RULES.md](./RULES.md)
- Decisions: [DECISIONS.md](./DECISIONS.md)
- Roadmap: [ROADMAP.md](./ROADMAP.md)
- Setup: [SETUP.md](./SETUP.md)
- Prompts: [PROMPTS.md](./PROMPTS.md)
- Tasks: [TASKS.md](./TASKS.md)
