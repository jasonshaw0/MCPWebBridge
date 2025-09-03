Decisions Log

1) Surface: anchored floating chip + panel
- Pros: low footprint, easy to isolate, quick to implement, reversible
- Cons: potential visual drift with dynamic layout
- Rollback: use static fixed chip or switch to sidebar drawer



2) Messaging: one-shot chrome.runtime.sendMessage
- Pros: simple lifecycle with MV3 worker, no Port keepalive issues
- Cons: no streaming by default
- Rollback: add Port for streaming when needed

3) Storage: chrome.storage.sync
- Pros: syncs across Chrome profiles, fits small settings payload
- Cons: size/quota limits
- Rollback: switch to chrome.storage.local if hitting limits

4) Selector strategy: heuristic composer detection + safe fixed fallback
- Pros: robust to class changes; relies on structure and position
- Cons: heuristics may fail on A/B variants
- Rollback: always float with static offsets, or move to page-level fixed sidebar

5) Permissions: minimal
- storage + host_permissions for chat.openai.com only
- No external network calls besides the page itself

6) Build stack: vanilla JS (no bundler) for Iteration A
- Pros: zero build, fastest iteration, fewer moving parts
- Cons: limited type safety and modularity
- Rollback: migrate to TS + Vite (or wxt) in Iteration B

Open questions
- Should we switch to a sidebar surface if the anchored chip collides with new UI experiments?
- Do we need a typed schema and build tooling (TypeScript + bundler) for Iteration B?
- When should we introduce a long-lived Port for streaming MCP output?


