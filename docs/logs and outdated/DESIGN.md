Design: MCP Web Bridge (Iteration A)

Scope

- Chrome MV3 extension
- Content script runs only on https://chat.openai.com/*
- Inject a small MCP entry control and a minimal panel surface
- No-op actions; storage-backed defaults; typed messaging

UI surface

- Choice: anchored floating chip + minimal panel (default)
- Alternatives considered: sidebar drawer; inline panel under composer
- Rationale: smallest viewport impact, high reversibility, simple to isolate in Shadow DOM

Component contract

- Panel: { open(), close(), render(servers, { defaultServerId }), refresh() }
- Entry control toggles panel visibility
- Shadow DOM hosts styles; prefixed classes .mcp-\*
- CSS tokens: --mcp-z, --mcp-radius, --mcp-gap, --mcp-surface-bg, --mcp-surface-fg, --mcp-accent, --mcp-border, --mcp-shadow

Selectors and mount strategy

- Primary: floating chip positioned relative to composer bounding box
  - findComposerContainer(): chooses a likely form near bottom with a textbox
  - Compute safe bottom offset to avoid overlapping native controls
- Fallback: static fixed offsets (bottom 120px for chip; 170px for panel)
- Resilience: MutationObserver on documentElement to reapply anchor; window resize handler

Messaging

- Envelope: { kind, requestId, payload? }
- Kinds: GET_SETTINGS, SET_SETTINGS, LIST_SERVERS, GET_SERVER, SET_DEFAULT
- One-shot messages (no long-lived Port) for simplicity

Storage model

- chrome.storage.sync, key: mcp.webbridge.global.v1
- GlobalSettings: { version: 1, defaultServerId?: string, servers: McpServer[] }
- Shallow migrations: bump version, preserve fields
- First-run seeding: Firecrawl, Puppeteer MCP, Sequential Thinking, Streamable, Memory

MV3 worker lifecycle

- onInstalled seeds storage
- All requests are idempotent; ensureSettings handles migrations
- Avoid long-lived state in the worker; always read/write storage per request

Security and privacy

- No telemetry; only local console statements
- Narrow host_permissions: https://chat.openai.com/*

Open questions

- Whether to switch to a true sidebar surface if anchoring proves visually unstable
- Whether to adopt a typed schema with zod/ts later (currently JSDoc shapes)
- Add a Port connection for live MCP handshake in the future
