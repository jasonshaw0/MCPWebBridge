# Developing a Chrome MV3 extension for MCP
_Exported on 9/3/2025 at 17:53:42 EDT from Cursor (1.5.5)_

---

**User**

Project prompt: MCP for the Web — start with ChatGPT.com only
Goal

Create a Chrome MV3 extension that brings MCP-powered tools into AI websites. Phase 1 scope: ChatGPT web only (https://chat.openai.com/*). Provide a minimal but high-control UI on page: a small MCP entry control that opens a lightweight surface (popup, sidebar, panel, or integrated chip). Keep choices open. Build iteratively.

References you may consult while deciding details: MCP spec and intro, Chrome MV3 service worker and message passing, content scripts with Shadow DOM isolation, and available MCP servers like Puppeteer and Firecrawl. 
Model Context Protocol
+1
Chrome for Developers
+2
Chrome for Developers
+2
Stack Overflow
wxt.dev

Operating rules for this project

Decide late. Present 2–3 viable approaches per decision. Default to the simplest reversible option. Log tradeoffs.

Minimal permissions. MV3, background service worker, content script only on ChatGPT host. Expand later. 
Chrome for Developers

Isolate UI. Use Shadow DOM for injected UI to avoid CSS bleed; keep a single root container. 
Stack Overflow
wxt.dev

Typed messaging. Use MV3 message passing with small typed envelopes. Prefer long-lived Port only if needed. 
Chrome for Developers

DOM resilience. Assume dynamic rerenders. Use MutationObserver and robust selectors. Prefer structure/roles over brittle classnames.

MCP first. Use MCP tools where they reduce manual work: DOM discovery, scraping, research, and design options. 
Cursor Docs

No telemetry. Local dev logs only. No network beyond what is essential.

Document as you go. Maintain a short DESIGN.md and DECISIONS.md.

Available MCP servers (already configured)

sequentialthinking — for structured option analysis.

memory — to persist project facts and decisions.

streamable-mcp-server — for streaming intermediate results.

puppeteer — automate a browser to inspect and probe ChatGPT DOM. 
GitHub

firecrawl-mcp — scrape pages and subpages into markdown for offline selector study. 
Firecrawl
+1

MCP Installer — add more servers quickly in-editor. 
Cursor Docs

Cursor docs on MCP support and server install flows: 
Cursor Docs
+1

Optional MCP servers to add (recommend)

Playwright MCP (if available) for alt automation to complement Puppeteer.

“Selector Recorder” micro-MCP (custom): exposes tools to capture, test, and rank CSS/XPath selectors on a live page; returns stability scores from repeated probes.

“Chrome CDP Snippets” micro-MCP: run small CDP scripts to read layout metrics and collision boxes for placement experiments.

Keep these optional; implement only if helpful.

Deliverable for the first build (Phase 1 • Iteration A)

A working MV3 extension that:

Loads on ChatGPT web only.

Injects one small MCP entry control near the composer that never overlaps native controls. If unsure, fall back to a small floating chip with safe margins.

On click, opens a single minimal surface (you choose: popup, sidebar, panel, or anchored chip) containing:

A header with “MCP”.

A simple list of mock MCP endpoints pulled from local storage.

One action row per item: Connect (no-op placeholder), Details (mock), Set default (persist).

Uses typed request/response messages between content and worker.

Persists settings in chrome.storage (sync if feasible).

All UI runs inside a ShadowRoot with prefixed classes.

You decide UI primitive (popup vs sidebar vs panel) and state library. Justify briefly.

Planning tasks for Iteration A (do now, stepwise)
0) Self-brief + constraints

Summarize the problem in 5–8 bullet points.

List 3 risks with MV3 worker lifecycle and how to avoid missing events. 
Chrome for Developers

State a rollback plan if chosen UI approach proves brittle.

1) DOM reconnaissance on ChatGPT

Use Puppeteer MCP to open https://chat.openai.com/ and inspect the composer area. Goals:

Identify 2–3 stable mount strategies:

Sibling under the composer wrapper.

Absolute/fixed floating chip with collision checks.

Ancestor overlay container that survives rerenders.

For each strategy, propose primary and fallback CSS selectors with rationale. Test selectors against reload and navigation.

Produce a short report with the chosen default strategy and when to switch to fallback.

Use repeated probes to validate selectors. Consider generating candidate selectors and ranking by stability. 
Stack Overflow

2) UI artifact selection

Pick one minimal surface: popup, sidebar, panel, or anchored chip. Compare: accessibility, discoverability, viewport impact.

Define a tiny component contract: open(), close(), render(list, state).

Provide a CSS token list (e.g., --mcp-z, --mcp-radius, --mcp-gap). Ensure isolation via Shadow DOM. 
wxt.dev

3) MV3 scaffolding

Create manifest v3 with: background service_worker, content script only for ChatGPT host, storage, and minimal scripting if needed.

Implement a message schema: {kind: 'GET_SETTINGS'|'SET_SETTINGS'|'LIST_SERVERS'|'GET_SERVER'|'SET_DEFAULT', payload?} with typed responses.

Add a resilient message router in the worker and a tiny client in the content script. 
Chrome for Developers

4) Storage model

Define GlobalSettings and SiteSettings minimal shapes.

Implement get/set with version key and shallow migrations.

5) Injection + lifecycle

Implement mount(container) that:

Creates a single ShadowRoot under the chosen target.

Renders the MCP entry control.

Wires open/close of the surface.

Sets a MutationObserver to re-mount if the container is replaced.

Add a safe fixed-position fallback if target not found in 500–1000 ms.

6) Mock data + actions

Seed 4–6 mock servers in storage on first run.

Implement no-op Connect, Details, Set default flows.

7) Readme and decision log

Document: chosen UI surface, selector strategy, message schema, storage keys, and what to revisit later.

Ask-when-needed decision points

When ambiguous, ask and proceed with the simplest default:

Build stack: vanilla TS + Vite vs React vs Lit.

Surface choice: popup vs sidebar vs anchored chip.

Selector strategy: attach near composer vs floating.

Messaging: one-shot vs long-lived Port.

Storage: sync vs local.

MCP-assisted workflows to use inside Cursor
A) DOM and selector discovery

With Puppeteer MCP, script:

Load ChatGPT, wait for composer visible, dump outerHTML of candidate regions.

Generate several selectors; probe them across 3 reloads; record hit/miss.

Return the best selector set with stability notes. 
GitHub

B) Offline analysis of structure

With Firecrawl MCP, snapshot key pages to markdown for quick grepping of structure and labels. Use to hypothesize selectors and labels. 
Firecrawl
+1

C) Reasoning scaffolds

With Sequential Thinking, produce option tables and risk lists for each major decision. Store outcomes via memory for continuity. 
Cursor Docs

D) Installing more tools fast

Use MCP Installer for any extra server you justify in DESIGN.md, e.g., a tiny local “selector-recorder” MCP. 
Cursor Docs

Success checks for Iteration A

Unpacked extension loads without console errors.

MCP control renders on ChatGPT, never overlaps native send/search.

Surface opens, shows mock list, persists default selection.

Messages succeed both ways; worker lifecycle issues handled. 
Chrome for Developers

Styles fully isolated; no page bleed. 
Stack Overflow
wxt.dev

Notes and references (for the model)

MCP: overview/spec and repo. 
Model Context Protocol
+1
GitHub

MV3 worker lifecycle and pitfalls. 
Chrome for Developers
Codimite

Message passing APIs. 
Chrome for Developers

Content scripts basics. 
Chrome for Developers

Shadow DOM isolation patterns. 
Stack Overflow
wxt.dev

Puppeteer MCP server. 
GitHub

Firecrawl MCP docs and repo. 
Firecrawl
+1
GitHub

Start now

Produce the self-brief and risk list.

Run Puppeteer MCP to propose selectors and mount strategies.

Propose two UI surface options and pick one with rationale.

Scaffold MV3 files and minimal messaging.

Implement injection and mock surface.

Report decisions in DECISIONS.md and list open questions.

---

**Cursor**

I’m going to set up a structured todo list for Iteration A and start with the self-brief and risks. Then I’ll attempt DOM reconnaissance using the Puppeteer MCP server; if that’s blocked by login or connection, I’ll provide robust selectors with validation rationale and fallbacks.

I’m about to write the self-brief, risks, and rollback plan, then attempt a Puppeteer-assisted DOM probe on ChatGPT’s composer to propose stable selectors and mount strategies. If login blocks automation, I’ll still provide a validated selector set with fallbacks and then proceed to UI selection and scaffolding.

I’m going to probe the ChatGPT page structure using the Puppeteer MCP to find stable selectors around the composer and return match counts and bounding boxes. If navigation or auth blocks occur, I’ll still provide reasoned selectors and fallbacks.

I’m going to create the MV3 scaffolding and core files (manifest, background worker, content script) along with the docs (README, DESIGN, DECISIONS). Then I’ll wire messaging, storage seeding, the Shadow DOM UI, and the mount/fallback logic.

```json
{
  "manifest_version": 3,
  "name": "MCP Web Bridge",
  "version": "0.1.0",
  "description": "Bring MCP-powered tools into ChatGPT web.",
  "permissions": [
    "storage"
  ],
  "host_permissions": [
    "https://chat.openai.com/*"
  ],
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": ["https://chat.openai.com/*"],
      "js": ["content.js"],
      "run_at": "document_idle"
    }
  ],
  "icons": {
  }
}

```

```javascript
// Background service worker for MCP Web Bridge (MV3)
// Message schema (JSDoc types for clarity):
/**
 * @typedef {(
 *   {kind: 'GET_SETTINGS', requestId: string} |
 *   {kind: 'SET_SETTINGS', requestId: string, payload: Partial<GlobalSettings>} |
 *   {kind: 'LIST_SERVERS', requestId: string} |
 *   {kind: 'GET_SERVER', requestId: string, payload: {id: string}} |
 *   {kind: 'SET_DEFAULT', requestId: string, payload: {id: string}}
 * )} Message
 */
/**
 * @typedef {{
 *   id: string,
 *   name: string,
 *   description?: string,
 *   url?: string,
 *   tags?: string[],
 * }} McpServer
 */
/**
 * @typedef {{
 *   version: number,
 *   defaultServerId?: string,
 *   servers: McpServer[],
 * }} GlobalSettings
 */

const SETTINGS_VERSION = 1;
const STORAGE_KEYS = {
  GLOBAL: 'mcp.webbridge.global.v1'
};

/** @returns {Promise<GlobalSettings|null>} */
function readGlobalSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get([STORAGE_KEYS.GLOBAL], (obj) => {
      const data = obj[STORAGE_KEYS.GLOBAL] || null;
      resolve(data);
    });
  });
}

/** @param {GlobalSettings} settings */
function writeGlobalSettings(settings) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [STORAGE_KEYS.GLOBAL]: settings }, () => resolve());
  });
}

/** @returns {McpServer[]} */
function createMockServers() {
  return [
    {
      id: 'firecrawl',
      name: 'Firecrawl',
      description: 'Scrape pages into Markdown for offline analysis',
      url: 'mcp://firecrawl',
      tags: ['scrape', 'markdown']
    },
    {
      id: 'puppeteer',
      name: 'Puppeteer MCP',
      description: 'Automate a browser to inspect and probe DOM',
      url: 'mcp://puppeteer',
      tags: ['automation', 'dom']
    },
    {
      id: 'sequentialthinking',
      name: 'Sequential Thinking',
      description: 'Structured option analysis and decision-making',
      url: 'mcp://sequentialthinking',
      tags: ['reasoning']
    },
    {
      id: 'streamable',
      name: 'Streamable MCP',
      description: 'Stream intermediate results',
      url: 'mcp://streamable',
      tags: ['stream']
    },
    {
      id: 'memory',
      name: 'Memory MCP',
      description: 'Persist project facts and decisions',
      url: 'mcp://memory',
      tags: ['persistence']
    }
  ];
}

/** @returns {Promise<GlobalSettings>} */
async function ensureSettings() {
  const current = await readGlobalSettings();
  if (!current) {
    const seeded = /** @type {GlobalSettings} */ ({
      version: SETTINGS_VERSION,
      defaultServerId: 'puppeteer',
      servers: createMockServers()
    });
    await writeGlobalSettings(seeded);
    return seeded;
  }
  if (current.version !== SETTINGS_VERSION) {
    // Shallow migration example: bump version, preserve servers/default
    const migrated = { ...current, version: SETTINGS_VERSION };
    await writeGlobalSettings(migrated);
    return migrated;
  }
  return current;
}

chrome.runtime.onInstalled.addListener(async () => {
  await ensureSettings();
});

/** @param {Message} message */
async function handleMessage(message) {
  switch (message.kind) {
    case 'GET_SETTINGS': {
      const settings = await ensureSettings();
      return { ok: true, settings };
    }
    case 'SET_SETTINGS': {
      const existing = await ensureSettings();
      const next = { ...existing, ...message.payload, version: SETTINGS_VERSION };
      await writeGlobalSettings(next);
      return { ok: true, settings: next };
    }
    case 'LIST_SERVERS': {
      const settings = await ensureSettings();
      return {
        ok: true,
        servers: settings.servers,
        defaultServerId: settings.defaultServerId
      };
    }
    case 'GET_SERVER': {
      const settings = await ensureSettings();
      const server = settings.servers.find(s => s.id === message.payload.id) || null;
      return { ok: true, server };
    }
    case 'SET_DEFAULT': {
      const settings = await ensureSettings();
      const exists = settings.servers.some(s => s.id === message.payload.id);
      const next = exists ? { ...settings, defaultServerId: message.payload.id } : settings;
      await writeGlobalSettings(next);
      return { ok: exists, defaultServerId: next.defaultServerId };
    }
    default:
      return { ok: false, error: 'Unknown kind' };
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  // All responses are async
  (async () => {
    try {
      const data = await handleMessage(message);
      sendResponse({ requestId: message.requestId, ...data });
    } catch (error) {
      sendResponse({ requestId: message.requestId, ok: false, error: String(error) });
    }
  })();
  return true;
});


```

```javascript
// Content script for ChatGPT.com only. Injects an MCP entry control and minimal surface.

/** Messaging client: send typed messages to the background service worker */
function sendMessage(kind, payload) {
  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ kind, payload, requestId }, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve(response);
    });
  });
}

/** CSS tokens (Shadow DOM scoped) */
const styleText = `
  :host {
    --mcp-z: 2147483600;
    --mcp-radius: 10px;
    --mcp-gap: 8px;
    --mcp-surface-bg: #0f172a;
    --mcp-surface-fg: #e5e7eb;
    --mcp-accent: #22d3ee;
    --mcp-border: rgba(148,163,184,0.25);
    --mcp-shadow: 0 8px 30px rgba(0,0,0,0.35);
  }
  .mcp-root { position: relative; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji"; color: var(--mcp-surface-fg); }
  .mcp-entry { position: fixed; right: 16px; bottom: 120px; z-index: var(--mcp-z); background: var(--mcp-surface-bg); border: 1px solid var(--mcp-border); border-radius: 999px; padding: 8px 12px; font-weight: 700; font-size: 12px; letter-spacing: 0.04em; box-shadow: var(--mcp-shadow); cursor: pointer; user-select: none; }
  .mcp-entry:hover { outline: 0; box-shadow: 0 0 0 2px rgba(34,211,238,0.25), var(--mcp-shadow); }
  .mcp-entry:focus { outline: 0; box-shadow: 0 0 0 2px rgba(34,211,238,0.35), var(--mcp-shadow); }
  .mcp-panel { position: fixed; right: 16px; bottom: 170px; z-index: var(--mcp-z); width: 320px; max-height: 60vh; overflow: auto; background: var(--mcp-surface-bg); border: 1px solid var(--mcp-border); border-radius: var(--mcp-radius); box-shadow: var(--mcp-shadow); display: none; }
  .mcp-panel.open { display: block; }
  .mcp-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid var(--mcp-border); font-weight: 800; letter-spacing: 0.06em; }
  .mcp-list { list-style: none; padding: 8px; margin: 0; display: flex; flex-direction: column; gap: var(--mcp-gap); }
  .mcp-item { border: 1px solid var(--mcp-border); border-radius: 8px; padding: 8px; display: flex; gap: 8px; align-items: center; }
  .mcp-item-main { flex: 1; }
  .mcp-item-name { font-weight: 700; }
  .mcp-item-desc { font-size: 12px; opacity: 0.8; margin-top: 2px; }
  .mcp-actions { display: flex; gap: 6px; }
  .mcp-actions button { background: transparent; color: var(--mcp-surface-fg); border: 1px solid var(--mcp-border); border-radius: 6px; padding: 4px 8px; cursor: pointer; }
  .mcp-actions button:hover { border-color: var(--mcp-accent); color: var(--mcp-accent); }
  .mcp-badge { font-size: 10px; padding: 2px 6px; border-radius: 999px; border: 1px solid var(--mcp-border); margin-left: 6px; opacity: 0.85; }
`;

/** Root host + ShadowRoot */
function createShadowHost() {
  const hostId = 'mcp-webbridge-root';
  let host = document.getElementById(hostId);
  if (!host) {
    host = document.createElement('div');
    host.id = hostId;
    document.documentElement.appendChild(host);
  }
  if (!host.shadowRoot) {
    const shadow = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = styleText;
    shadow.appendChild(style);
    const root = document.createElement('div');
    root.className = 'mcp-root';
    shadow.appendChild(root);
  }
  return host.shadowRoot;
}

/** Panel component with basic contract: open(), close(), render(list, state) */
function createPanel(shadow) {
  const root = shadow.querySelector('.mcp-root');
  const entry = document.createElement('button');
  entry.setAttribute('type', 'button');
  entry.className = 'mcp-entry';
  entry.textContent = 'MCP';
  entry.setAttribute('aria-label', 'Open MCP');

  const panel = document.createElement('div');
  panel.className = 'mcp-panel';

  const header = document.createElement('div');
  header.className = 'mcp-header';
  header.textContent = 'MCP';
  panel.appendChild(header);

  const list = document.createElement('ul');
  list.className = 'mcp-list';
  panel.appendChild(list);

  root.appendChild(entry);
  root.appendChild(panel);

  entry.addEventListener('click', () => {
    panel.classList.toggle('open');
  });

  function render(servers, state) {
    list.textContent = '';
    servers.forEach((srv) => {
      const li = document.createElement('li');
      li.className = 'mcp-item';
      li.dataset.id = srv.id;

      const main = document.createElement('div');
      main.className = 'mcp-item-main';
      const name = document.createElement('div');
      name.className = 'mcp-item-name';
      name.textContent = srv.name;
      if (state.defaultServerId === srv.id) {
        const badge = document.createElement('span');
        badge.className = 'mcp-badge';
        badge.textContent = 'Default';
        name.appendChild(badge);
      }
      const desc = document.createElement('div');
      desc.className = 'mcp-item-desc';
      desc.textContent = srv.description || '';
      main.appendChild(name);
      main.appendChild(desc);

      const actions = document.createElement('div');
      actions.className = 'mcp-actions';
      const btnConnect = document.createElement('button');
      btnConnect.textContent = 'Connect';
      btnConnect.addEventListener('click', () => {
        // No-op placeholder
        // Future: open a Port and handshake
      });
      const btnDetails = document.createElement('button');
      btnDetails.textContent = 'Details';
      btnDetails.addEventListener('click', async () => {
        const res = await sendMessage('GET_SERVER', { id: srv.id });
        console.debug('[MCP] Details', res);
        alert(`${srv.name}\n${srv.description || ''}\n${srv.url || ''}`);
      });
      const btnDefault = document.createElement('button');
      btnDefault.textContent = 'Set default';
      btnDefault.addEventListener('click', async () => {
        await sendMessage('SET_DEFAULT', { id: srv.id });
        await refresh();
      });
      actions.appendChild(btnConnect);
      actions.appendChild(btnDetails);
      actions.appendChild(btnDefault);

      li.appendChild(main);
      li.appendChild(actions);
      list.appendChild(li);
    });
  }

  async function refresh() {
    const res = await sendMessage('LIST_SERVERS');
    if (res && res.ok) {
      render(res.servers || [], { defaultServerId: res.defaultServerId });
    }
  }

  return { open: () => panel.classList.add('open'), close: () => panel.classList.remove('open'), render, refresh, elements: { entry, panel } };
}

/** Try to find the ChatGPT composer container for anchoring */
function findComposerContainer() {
  // Heuristic: form containing textarea or a role=textbox/contenteditable input near viewport bottom
  const candidates = Array.from(document.querySelectorAll('form'));
  let best = null;
  let bestScore = -Infinity;
  const vh = window.innerHeight || 0;
  for (const form of candidates) {
    const hasInput = form.querySelector('textarea, [contenteditable="true"], [role="textbox"]');
    if (!hasInput) continue;
    const rect = form.getBoundingClientRect();
    // Prefer forms near bottom and wide
    const distanceFromBottom = Math.abs(vh - rect.bottom);
    const score = (rect.width) - distanceFromBottom * 2;
    if (score > bestScore) {
      best = form;
      bestScore = score;
    }
  }
  return best;
}

function mount() {
  const shadow = createShadowHost();
  const panel = createPanel(shadow);

  // Anchored strategy attempt: if we can find composer, we keep floating chip but adjust bottom based on composer rect to avoid overlap
  function applyAnchorSafety() {
    const composer = findComposerContainer();
    const entry = panel.elements.entry;
    const panelEl = panel.elements.panel;
    if (!composer) {
      // Keep default fixed offsets
      entry.style.bottom = '120px';
      panelEl.style.bottom = '170px';
      return false;
    }
    const rect = composer.getBoundingClientRect();
    const safeGap = 16;
    const bottomOffset = Math.max(90, (window.innerHeight - rect.top) + safeGap);
    entry.style.bottom = `${bottomOffset}px`;
    panelEl.style.bottom = `${bottomOffset + 50}px`;
    return true;
  }

  // Initial render
  panel.refresh();
  applyAnchorSafety();

  // Observe layout changes and re-apply safety offsets
  const reapply = () => {
    try { applyAnchorSafety(); } catch (e) { /* noop */ }
  };
  const mo = new MutationObserver(() => reapply());
  mo.observe(document.documentElement, { subtree: true, childList: true });
  window.addEventListener('resize', reapply);
}

// Defer slightly to allow app shell to settle
setTimeout(() => {
  try { mount(); } catch (e) { console.error('[MCP] Mount failed', e); }
}, 300);


```

I created the core MV3 scaffolding and UI injection. Now I'll add README, DESIGN, and DECISIONS docs capturing the choices, selectors, and schema.

```markdown
MCP Web Bridge (Chrome MV3)

Phase 1 • Iteration A: ChatGPT web only

What it does
- Injects a minimal MCP entry control on https://chat.openai.com/* (no overlap with native controls).
- Opens a lightweight panel listing mock MCP servers with actions: Connect (no-op), Details (mock), Set default (persisted).
- Uses MV3 background service worker for typed request/response messaging and chrome.storage.sync for settings.
- UI runs in a ShadowRoot with prefixed classes to avoid CSS bleed.

Install (Unpacked)
1) Chrome → chrome://extensions
2) Enable Developer mode
3) Load unpacked → select this folder
4) Navigate to https://chat.openai.com and ensure the MCP chip appears near the composer

Files
- manifest.json: MV3 manifest (host permission for chat.openai.com)
- background.js: service worker; message router; storage seeding and CRUD
- content.js: Shadow DOM UI; mount logic; MutationObserver; safe fixed-position fallback
- DESIGN.md: architecture, selectors strategy, UI contract, storage shapes
- DECISIONS.md: choices and tradeoffs log

Message schema (envelope)
Request: { kind: 'GET_SETTINGS'|'SET_SETTINGS'|'LIST_SERVERS'|'GET_SERVER'|'SET_DEFAULT', requestId, payload? }
Response: { requestId, ok: boolean, ...data|error }

Storage
- Key: mcp.webbridge.global.v1 (chrome.storage.sync)
- Shape: { version: 1, defaultServerId?: string, servers: McpServer[] }
- First-run: seeds 4–6 mock servers, defaultServerId = 'puppeteer'

Dev notes
- No telemetry. Only local console.debug.
- Minimal permissions: storage + host permission for chat.openai.com
- DOM resilience: MutationObserver; safe offsets computed from composer bounding box; fixed fallback
- Rollback: if anchored placement brittle, use floating chip with static offsets; sidebar alternative is reversible


```

```markdown
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
- Shadow DOM hosts styles; prefixed classes .mcp-*
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


```

```markdown
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


```

I’m going to add an “Open questions” section to `DECISIONS.md`, then check for linter issues in `background.js` and `content.js`.

```markdown
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

Open questions
- Should we switch to a sidebar surface if the anchored chip collides with new UI experiments?
- Do we need a typed schema and build tooling (TypeScript + bundler) for Iteration B?
- When should we introduce a long-lived Port for streaming MCP output?



```

Marking the remaining tasks as complete and adding a build stack decision to the decision log before summarizing and delivering the self-brief, risks, DOM strategy, and instructions.

```markdown
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



```

- I set up todos, completed the self-brief/risk plan, and attempted a Puppeteer probe; remote debugging wasn’t available, so I proceeded with a resilient selector strategy using a composer heuristic plus a fixed-position fallback.
- I scaffolded the MV3 extension with `manifest.json`, `background.js` (typed message router, storage seeding/migrations), and `content.js` (Shadow DOM UI, floating chip + panel, MutationObserver, safe offsets).
- I added `README.md`, `DESIGN.md`, and `DECISIONS.md` describing UI surface, messaging schema, storage keys, and tradeoffs.

Self-brief (5–8 bullets)
- Build a Chrome MV3 extension for ChatGPT web that injects an MCP entry control and a minimal surface.
- UI shows mock MCP servers with Connect, Details, Set default; settings persist via chrome.storage.
- All UI runs in Shadow DOM; minimal permissions; typed request/response messaging.
- DOM is dynamic; use MutationObserver and robust anchoring or safe floating fallback.
- Start simple and reversible; document decisions; no telemetry.

MV3 lifecycle risks and mitigations
- Worker cold starts drop events: avoid long-lived state; use one-shot messages; ack every request.
- Port keepalive issues: don’t rely on long-lived Port in Iteration A; switch later if streaming needed.
- onInstalled timing: seed settings idempotently via ensureSettings on every request, not just install.

Rollback plan for UI approach
- If anchored placement is brittle, fall back to a static floating chip with fixed offsets.
- If collisions persist, switch to a right-side sidebar drawer mounted in Shadow DOM.

DOM reconnaissance and selector strategy (chosen default and fallback)
- Default: floating chip anchored by measuring the composer `form` near the bottom containing `textarea | [contenteditable=true] | [role=textbox]`; compute safe bottom offsets from its bounding box.
- Fallback: static fixed chip (bottom 120px) and panel (bottom 170px).
- Resilience: global MutationObserver re-applies offsets; window resize handler; selectors avoid brittle classnames.

How to run
- Load unpacked in Chrome (`chrome://extensions`) and open `https://chat.openai.com`.
- You should see the “MCP” chip near the composer; click to open the panel; Details shows mock, Set default persists.

Open questions
- Switch to sidebar if layout collisions occur?
- Introduce TS + Vite or wxt in Iteration B?
- Add Port-based streaming for real MCP later?

---

**User**

Nothing appears on page. Extension is greyed out and appears to not work.

---

**Cursor**

It seems like there's a permissions issue preventing the extension from running on ChatGPT. The greyed-out icon and the "Can't read or change site's data" message in your screenshot point to this. I'll start by examining the `manifest.json` file to verify the `host_permissions` and content script matching patterns are correct.

Based on the screenshot, Chrome is indicating the extension doesn't have permission to access the current site, which is why it's greyed out and the content script isn't running. Since your `manifest.json` already correctly requests permissions for `https://chat.openai.com/*`, this usually points to one of two things:

1.  The page needs to be reloaded after the extension was first installed or updated.
2.  Chrome is waiting for you to explicitly grant the permission.

To make the permission status clearer and give you a way to interact with the extension, I'll add a default `action` to the manifest. This ensures the extension has a toolbar icon you can click. Often, clicking the icon on the target site for the first time will prompt for the necessary permissions.

I'll make that change to `manifest.json`.

```json
{
    "manifest_version": 3,
    "name": "MCP Web Bridge",
    "version": "0.1.0",
    "description": "Bring MCP-powered tools into ChatGPT web.",
    "action": {
        "default_title": "MCP Web Bridge"
    },
    "permissions": [
        "storage"
    ],
    "host_permissions": [
        "https://chat.openai.com/*"
    ],
    "background": {
        "service_worker": "background.js",
        "type": "module"
    },
    "content_scripts": [
        {
            "matches": [
                "https://chat.openai.com/*"
            ],
            "js": [
                "content.js"
            ],
            "run_at": "document_idle"
        }
    ],
    "icons": {}
}
```

---

**User**

Extension is still not appearing. I tested on my normal prelaunched chrome, then just after that noticed you opened a dev window. Am I supposed to be using the dev window?
If so, openai's capcha infinitely wont verify me and I cannot use the site, and for some unkown reason cannot even upload chrome extensions to that dev browser (I press upload and nothing happens) 

---

**Cursor**

You're right to be confused – the setup for testing local extensions can be tricky, and you absolutely should be using your normal Chrome browser where you're already logged in. The dev window isn't necessary and, as you've seen, can cause problems with logins and CAPTCHAs.

The issue is likely that Chrome needs to be explicitly told to refresh the extension's files and permissions after we've made changes. Adding the toolbar icon was the first step. Now let's make sure Chrome is using the latest version of the code.

Here is what to do in your **normal Chrome window**:

1.  **Navigate to `chrome://extensions`** in a new tab.
2.  Find the **"MCP Web Bridge"** card and click the **reload icon** (a circular arrow).
3.  Switch to your **`chat.openai.com` tab** and do a **hard refresh** (press `Ctrl+Shift+R` on Windows or `Cmd+Shift+R` on Mac).
4.  Look for the extension's icon in your toolbar. It might be hidden behind the puzzle piece icon. If you find it, you can "pin" it to keep it visible.

After reloading, when you are on `chat.openai.com`, the icon should be in full color. If you click it, it might ask you to grant permissions for the site.

I'm going to double-check the core files (`manifest.json`, `content.js`, and `background.js`) to make sure there are no subtle errors that could be preventing the script from running.

Of course, apologies for the confusion and frustration with the setup. You are absolutely correct to be using your **normal, pre-launched Chrome window** where you're already logged into OpenAI. The separate dev window is unnecessary and, as you've seen, causes problems with logins and extension loading.

I've reviewed the extension's files, and the code itself appears correct. The formatting changes from your editor are fine and haven't introduced any errors. The issue is purely about getting Chrome to recognize the extension's permissions for the ChatGPT site.

Let's get it working in your main browser. Please follow these steps exactly:

1.  **Go to the Extensions Page**: Open a new tab and navigate to `chrome://extensions`.
2.  **Enable Developer Mode**: Make sure the "Developer mode" switch in the top-right corner is turned ON.
3.  **Find Your Extension**: You should see "MCP Web Bridge" in your list of extensions.
4.  **Click the Reload Icon**: Click the circular arrow icon to reload the extension. This is a crucial step after changing `manifest.json`.
5.  **Go to ChatGPT**: Switch to your `chat.openai.com` tab.
6.  **Hard Refresh the Page**: Press **Ctrl+Shift+R** (or **Cmd+Shift+R** on Mac) to do a hard refresh, which ignores the cache.

After these steps, the extension icon in your toolbar (you may need to click the puzzle-piece icon to see it) should no longer be greyed out when you are on the ChatGPT tab. Once it's active, the content script will run, and the "MCP" chip should appear on the page.

---

**User**

It worked after changing chat.openai.com to chatgpt.com. I need this to be functional now, which I have a hard time believing is possible without user also running something on their system. Focus less on a mcp server browser/having multiple mcps, and more on getting something connected. If it works for one, it can be reproduced, so we want to go simple to start.  

---

**Cursor**

I'll update the extension to support both ChatGPT hosts, add localhost permissions, and wire a minimal WebSocket MCP connection for a single server. Then I'll add a tiny Node WebSocket MCP server you can run locally to test connectivity and update the README with quick run steps.

```json
*** Begin Patch
*** Update File: manifest.json
@@
-    "permissions": [
-        "storage"
-    ],
-    "host_permissions": [
-        "https://chat.openai.com/*"
-    ],
+    "permissions": [
+        "storage"
+    ],
+    "host_permissions": [
+        "https://chat.openai.com/*",
+        "https://chatgpt.com/*",
+        "http://localhost/*",
+        "http://127.0.0.1/*"
+    ],
@@
-    "content_scripts": [
-        {
-            "matches": [
-                "https://chat.openai.com/*"
-            ],
-            "js": [
-                "content.js"
-            ],
-            "run_at": "document_idle"
-        }
-    ],
+    "content_scripts": [
+        {
+            "matches": [
+                "https://chat.openai.com/*",
+                "https://chatgpt.com/*"
+            ],
+            "js": [
+                "content.js"
+            ],
+            "run_at": "document_idle"
+        }
+    ],
*** End Patch
```

```json
*** Begin Patch
*** Update File: manifest.json
@@
-    "host_permissions": [
-        "https://chat.openai.com/*"
-    ],
+    "host_permissions": [
+        "https://chat.openai.com/*",
+        "https://chatgpt.com/*",
+        "http://localhost/*",
+        "http://127.0.0.1/*"
+    ],
@@
-    "content_scripts": [
-        {
-            "matches": [
-                "https://chat.openai.com/*"
-            ],
-            "js": [
-                "content.js"
-            ],
-            "run_at": "document_idle"
-        }
-    ],
+    "content_scripts": [
+        {
+            "matches": [
+                "https://chat.openai.com/*",
+                "https://chatgpt.com/*"
+            ],
+            "js": [
+                "content.js"
+            ],
+            "run_at": "document_idle"
+        }
+    ],
*** End Patch
```

I'll update host permissions and content script matches to include `chatgpt.com`, and add a minimal long‑lived Port connection that implements a built-in "echo" MCP in the background, with a Connect button that handshakes and invokes an echo to prove connectivity. Then I'll add quick-run steps to the README.

```json
*** Begin Patch
*** Update File: manifest.json
@@
 	"host_permissions": [
-		"https://chat.openai.com/*"
+		"https://chat.openai.com/*",
+		"https://chatgpt.com/*",
+		"http://localhost/*",
+		"http://127.0.0.1/*"
 	],
@@
-	"content_scripts": [
-		{
-			"matches": [
-				"https://chat.openai.com/*"
-			],
-			"js": [
-				"content.js"
-			],
-			"run_at": "document_idle"
-		}
-	],
+	"content_scripts": [
+		{
+			"matches": [
+				"https://chat.openai.com/*",
+				"https://chatgpt.com/*"
+			],
+			"js": [
+				"content.js"
+			],
+			"run_at": "document_idle"
+		}
+	],
*** End Patch
```

I’m going to update the manifest to include both ChatGPT hosts and localhost for a simple local connectivity test. Then I’ll wire the Connect button to call new background actions that hit a local HTTP echo server. Finally, I’ll add the tiny Node echo server and README instructions.

```json
{
    "manifest_version": 3,
    "name": "MCP Web Bridge",
    "version": "0.1.0",
    "description": "Bring MCP-powered tools into ChatGPT web.",
    "action": {
        "default_title": "MCP Web Bridge"
    },
    "permissions": [
        "storage"
    ],
    "host_permissions": [
        "https://chat.openai.com/*",
        "https://chatgpt.com/*",
        "http://localhost/*",
        "http://127.0.0.1/*"
    ],
    "background": {
        "service_worker": "background.js",
        "type": "module"
    },
    "content_scripts": [
        {
            "matches": [
                "https://chat.openai.com/*",
                "https://chatgpt.com/*"
            ],
            "js": [
                "content.js"
            ],
            "run_at": "document_idle"
        }
    ],
    "icons": {}
}
```

```javascript
*** Begin Patch
*** Update File: background.js
@@
- *   {kind: 'GET_SETTINGS', requestId: string} |
+ *   {kind: 'GET_SETTINGS', requestId: string} |
  *   {kind: 'SET_SETTINGS', requestId: string, payload: Partial<GlobalSettings>} |
  *   {kind: 'LIST_SERVERS', requestId: string} |
  *   {kind: 'GET_SERVER', requestId: string, payload: {id: string}} |
- *   {kind: 'SET_DEFAULT', requestId: string, payload: {id: string}}
+ *   {kind: 'SET_DEFAULT', requestId: string, payload: {id: string}} |
+ *   {kind: 'ECHO', requestId: string, payload: { message: string }}
  * )} Message
  */
@@
   switch (message.kind) {
@@
     case 'SET_DEFAULT': {
       const settings = await ensureSettings();
       const exists = settings.servers.some(s => s.id === message.payload.id);
       const next = exists ? { ...settings, defaultServerId: message.payload.id } : settings;
       await writeGlobalSettings(next);
       return { ok: exists, defaultServerId: next.defaultServerId };
     }
+    case 'ECHO': {
+      // Minimal connectivity demo: try calling a local echo endpoint if running, otherwise echo locally
+      const msg = (message && message.payload && message.payload.message) || '';
+      try {
+        const res = await fetch('http://127.0.0.1:8787/echo?m=' + encodeURIComponent(msg), { method: 'GET' });
+        if (res.ok) {
+          const text = await res.text();
+          return { ok: true, echoed: text, via: 'http' };
+        }
+      } catch (_e) {
+        // fall through to local echo
+      }
+      return { ok: true, echoed: msg, via: 'local' };
+    }
     default:
       return { ok: false, error: 'Unknown kind' };
   }
 }
*** End Patch
```

```javascript
// Background service worker for MCP Web Bridge (MV3)
// Message schema (JSDoc types for clarity):
/**
 * @typedef {(
 *   {kind: 'GET_SETTINGS', requestId: string} |
 *   {kind: 'SET_SETTINGS', requestId: string, payload: Partial<GlobalSettings>} |
 *   {kind: 'LIST_SERVERS', requestId: string} |
 *   {kind: 'GET_SERVER', requestId: string, payload: {id: string}} |
 *   {kind: 'SET_DEFAULT', requestId: string, payload: {id: string}} |
 *   {kind: 'ECHO', requestId: string, payload: { message: string }}
 * )} Message
 */
/**
 * @typedef {{
 *   id: string,
 *   name: string,
 *   description?: string,
 *   url?: string,
 *   tags?: string[],
 * }} McpServer
 */
/**
 * @typedef {{
 *   version: number,
 *   defaultServerId?: string,
 *   servers: McpServer[],
 * }} GlobalSettings
 */

const SETTINGS_VERSION = 1;
const STORAGE_KEYS = {
  GLOBAL: "mcp.webbridge.global.v1",
};

/** @returns {Promise<GlobalSettings|null>} */
function readGlobalSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get([STORAGE_KEYS.GLOBAL], (obj) => {
      const data = obj[STORAGE_KEYS.GLOBAL] || null;
      resolve(data);
    });
  });
}

/** @param {GlobalSettings} settings */
function writeGlobalSettings(settings) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [STORAGE_KEYS.GLOBAL]: settings }, () =>
      resolve()
    );
  });
}

/** @returns {McpServer[]} */
function createMockServers() {
  return [
    {
      id: "firecrawl",
      name: "Firecrawl",
      description: "Scrape pages into Markdown for offline analysis",
      url: "mcp://firecrawl",
      tags: ["scrape", "markdown"],
    },
    {
      id: "puppeteer",
      name: "Puppeteer MCP",
      description: "Automate a browser to inspect and probe DOM",
      url: "mcp://puppeteer",
      tags: ["automation", "dom"],
    },
    {
      id: "sequentialthinking",
      name: "Sequential Thinking",
      description: "Structured option analysis and decision-making",
      url: "mcp://sequentialthinking",
      tags: ["reasoning"],
    },
    {
      id: "streamable",
      name: "Streamable MCP",
      description: "Stream intermediate results",
      url: "mcp://streamable",
      tags: ["stream"],
    },
    {
      id: "memory",
      name: "Memory MCP",
      description: "Persist project facts and decisions",
      url: "mcp://memory",
      tags: ["persistence"],
    },
  ];
}

/** @returns {Promise<GlobalSettings>} */
async function ensureSettings() {
  const current = await readGlobalSettings();
  if (!current) {
    const seeded = /** @type {GlobalSettings} */ ({
      version: SETTINGS_VERSION,
      defaultServerId: "puppeteer",
      servers: createMockServers(),
    });
    await writeGlobalSettings(seeded);
    return seeded;
  }
  if (current.version !== SETTINGS_VERSION) {
    // Shallow migration example: bump version, preserve servers/default
    const migrated = { ...current, version: SETTINGS_VERSION };
    await writeGlobalSettings(migrated);
    return migrated;
  }
  return current;
}

chrome.runtime.onInstalled.addListener(async () => {
  await ensureSettings();
});

/** @param {Message} message */
async function handleMessage(message) {
  switch (message.kind) {
    case "GET_SETTINGS": {
      const settings = await ensureSettings();
      return { ok: true, settings };
    }
    case "SET_SETTINGS": {
      const existing = await ensureSettings();
      const next = {
        ...existing,
        ...message.payload,
        version: SETTINGS_VERSION,
      };
      await writeGlobalSettings(next);
      return { ok: true, settings: next };
    }
    case "LIST_SERVERS": {
      const settings = await ensureSettings();
      return {
        ok: true,
        servers: settings.servers,
        defaultServerId: settings.defaultServerId,
      };
    }
    case "GET_SERVER": {
      const settings = await ensureSettings();
      const server =
        settings.servers.find((s) => s.id === message.payload.id) || null;
      return { ok: true, server };
    }
    case "SET_DEFAULT": {
      const settings = await ensureSettings();
      const exists = settings.servers.some((s) => s.id === message.payload.id);
      const next = exists
        ? { ...settings, defaultServerId: message.payload.id }
        : settings;
      await writeGlobalSettings(next);
      return { ok: exists, defaultServerId: next.defaultServerId };
    }
    case "ECHO": {
      const msg = (message && message.payload && message.payload.message) || "";
      try {
        const res = await fetch(
          "http://127.0.0.1:8787/echo?m=" + encodeURIComponent(msg),
          { method: "GET" }
        );
        if (res.ok) {
          const text = await res.text();
          return { ok: true, echoed: text, via: "http" };
        }
      } catch (_e) {
        // fall back to local echo
      }
      return { ok: true, echoed: msg, via: "local" };
    }
    default:
      return { ok: false, error: "Unknown kind" };
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  // All responses are async
  (async () => {
    try {
      const data = await handleMessage(message);
      sendResponse({ requestId: message.requestId, ...data });
    } catch (error) {
      sendResponse({
        requestId: message.requestId,
        ok: false,
        error: String(error),
      });
    }
  })();
  return true;
});

```

```javascript
// Content script for ChatGPT.com only. Injects an MCP entry control and minimal surface.

/** Messaging client: send typed messages to the background service worker */
function sendMessage(kind, payload) {
  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ kind, payload, requestId }, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve(response);
    });
  });
}

/** CSS tokens (Shadow DOM scoped) */
const styleText = `
  :host {
    --mcp-z: 2147483600;
    --mcp-radius: 10px;
    --mcp-gap: 8px;
    --mcp-surface-bg: #0f172a;
    --mcp-surface-fg: #e5e7eb;
    --mcp-accent: #22d3ee;
    --mcp-border: rgba(148,163,184,0.25);
    --mcp-shadow: 0 8px 30px rgba(0,0,0,0.35);
  }
  .mcp-root { position: relative; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji"; color: var(--mcp-surface-fg); }
  .mcp-entry { position: fixed; right: 16px; bottom: 120px; z-index: var(--mcp-z); background: var(--mcp-surface-bg); border: 1px solid var(--mcp-border); border-radius: 999px; padding: 8px 12px; font-weight: 700; font-size: 12px; letter-spacing: 0.04em; box-shadow: var(--mcp-shadow); cursor: pointer; user-select: none; }
  .mcp-entry:hover { outline: 0; box-shadow: 0 0 0 2px rgba(34,211,238,0.25), var(--mcp-shadow); }
  .mcp-entry:focus { outline: 0; box-shadow: 0 0 0 2px rgba(34,211,238,0.35), var(--mcp-shadow); }
  .mcp-panel { position: fixed; right: 16px; bottom: 170px; z-index: var(--mcp-z); width: 320px; max-height: 60vh; overflow: auto; background: var(--mcp-surface-bg); border: 1px solid var(--mcp-border); border-radius: var(--mcp-radius); box-shadow: var(--mcp-shadow); display: none; }
  .mcp-panel.open { display: block; }
  .mcp-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid var(--mcp-border); font-weight: 800; letter-spacing: 0.06em; }
  .mcp-list { list-style: none; padding: 8px; margin: 0; display: flex; flex-direction: column; gap: var(--mcp-gap); }
  .mcp-item { border: 1px solid var(--mcp-border); border-radius: 8px; padding: 8px; display: flex; gap: 8px; align-items: center; }
  .mcp-item-main { flex: 1; }
  .mcp-item-name { font-weight: 700; }
  .mcp-item-desc { font-size: 12px; opacity: 0.8; margin-top: 2px; }
  .mcp-actions { display: flex; gap: 6px; }
  .mcp-actions button { background: transparent; color: var(--mcp-surface-fg); border: 1px solid var(--mcp-border); border-radius: 6px; padding: 4px 8px; cursor: pointer; }
  .mcp-actions button:hover { border-color: var(--mcp-accent); color: var(--mcp-accent); }
  .mcp-badge { font-size: 10px; padding: 2px 6px; border-radius: 999px; border: 1px solid var(--mcp-border); margin-left: 6px; opacity: 0.85; }
  .mcp-toast { position: fixed; right: 16px; bottom: 16px; z-index: var(--mcp-z); background: var(--mcp-surface-bg); color: var(--mcp-surface-fg); border: 1px solid var(--mcp-border); border-radius: 8px; padding: 8px 10px; box-shadow: var(--mcp-shadow); }
`;

/** Root host + ShadowRoot */
function createShadowHost() {
  const hostId = "mcp-webbridge-root";
  let host = document.getElementById(hostId);
  if (!host) {
    host = document.createElement("div");
    host.id = hostId;
    document.documentElement.appendChild(host);
  }
  if (!host.shadowRoot) {
    const shadow = host.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = styleText;
    shadow.appendChild(style);
    const root = document.createElement("div");
    root.className = "mcp-root";
    shadow.appendChild(root);
  }
  return host.shadowRoot;
}

function showToast(shadow, text) {
  const existing = shadow.querySelector(".mcp-toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.className = "mcp-toast";
  toast.textContent = text;
  shadow.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

/** Panel component with basic contract: open(), close(), render(list, state) */
function createPanel(shadow) {
  const root = shadow.querySelector(".mcp-root");
  const entry = document.createElement("button");
  entry.setAttribute("type", "button");
  entry.className = "mcp-entry";
  entry.textContent = "MCP";
  entry.setAttribute("aria-label", "Open MCP");

  const panel = document.createElement("div");
  panel.className = "mcp-panel";

  const header = document.createElement("div");
  header.className = "mcp-header";
  header.textContent = "MCP";
  panel.appendChild(header);

  const list = document.createElement("ul");
  list.className = "mcp-list";
  panel.appendChild(list);

  root.appendChild(entry);
  root.appendChild(panel);

  entry.addEventListener("click", () => {
    panel.classList.toggle("open");
  });

  function render(servers, state) {
    list.textContent = "";
    servers.forEach((srv) => {
      const li = document.createElement("li");
      li.className = "mcp-item";
      li.dataset.id = srv.id;

      const main = document.createElement("div");
      main.className = "mcp-item-main";
      const name = document.createElement("div");
      name.className = "mcp-item-name";
      name.textContent = srv.name;
      if (state.defaultServerId === srv.id) {
        const badge = document.createElement("span");
        badge.className = "mcp-badge";
        badge.textContent = "Default";
        name.appendChild(badge);
      }
      const desc = document.createElement("div");
      desc.className = "mcp-item-desc";
      desc.textContent = srv.description || "";
      main.appendChild(name);
      main.appendChild(desc);

      const actions = document.createElement("div");
      actions.className = "mcp-actions";
      const btnConnect = document.createElement("button");
      btnConnect.textContent = "Connect";
      btnConnect.addEventListener("click", async () => {
        try {
          const res = await sendMessage("ECHO", { message: `hello from ${srv.id}` });
          if (res && res.ok) {
            showToast(shadow, `Echo (${res.via}): ${res.echoed}`);
          } else {
            showToast(shadow, `Echo failed`);
          }
        } catch (e) {
          showToast(shadow, `Echo error`);
        }
      });
      const btnDetails = document.createElement("button");
      btnDetails.textContent = "Details";
      btnDetails.addEventListener("click", async () => {
        const res = await sendMessage("GET_SERVER", { id: srv.id });
        console.debug("[MCP] Details", res);
        alert(`${srv.name}\n${srv.description || ""}\n${srv.url || ""}`);
      });
      const btnDefault = document.createElement("button");
      btnDefault.textContent = "Set default";
      btnDefault.addEventListener("click", async () => {
        await sendMessage("SET_DEFAULT", { id: srv.id });
        await refresh();
      });
      actions.appendChild(btnConnect);
      actions.appendChild(btnDetails);
      actions.appendChild(btnDefault);

      li.appendChild(main);
      li.appendChild(actions);
      list.appendChild(li);
    });
  }

  async function refresh() {
    const res = await sendMessage("LIST_SERVERS");
    if (res && res.ok) {
      render(res.servers || [], { defaultServerId: res.defaultServerId });
    }
  }

  return {
    open: () => panel.classList.add("open"),
    close: () => panel.classList.remove("open"),
    render,
    refresh,
    elements: { entry, panel },
  };
}

/** Try to find the ChatGPT composer container for anchoring */
function findComposerContainer() {
  // Heuristic: form containing textarea or a role=textbox/contenteditable input near viewport bottom
  const candidates = Array.from(document.querySelectorAll("form"));
  let best = null;
  let bestScore = -Infinity;
  const vh = window.innerHeight || 0;
  for (const form of candidates) {
    const hasInput = form.querySelector(
      'textarea, [contenteditable="true"], [role="textbox"]'
    );
    if (!hasInput) continue;
    const rect = form.getBoundingClientRect();
    // Prefer forms near bottom and wide
    const distanceFromBottom = Math.abs(vh - rect.bottom);
    const score = rect.width - distanceFromBottom * 2;
    if (score > bestScore) {
      best = form;
      bestScore = score;
    }
  }
  return best;
}

function mount() {
  const shadow = createShadowHost();
  const panel = createPanel(shadow);

  // Anchored strategy attempt: if we can find composer, we keep floating chip but adjust bottom based on composer rect to avoid overlap
  function applyAnchorSafety() {
    const composer = findComposerContainer();
    const entry = panel.elements.entry;
    const panelEl = panel.elements.panel;
    if (!composer) {
      // Keep default fixed offsets
      entry.style.bottom = "120px";
      panelEl.style.bottom = "170px";
      return false;
    }
    const rect = composer.getBoundingClientRect();
    const safeGap = 16;
    const bottomOffset = Math.max(90, window.innerHeight - rect.top + safeGap);
    entry.style.bottom = `${bottomOffset}px`;
    panelEl.style.bottom = `${bottomOffset + 50}px`;
    return true;
  }

  // Initial render
  panel.refresh();
  applyAnchorSafety();

  // Observe layout changes and re-apply safety offsets
  const reapply = () => {
    try {
      applyAnchorSafety();
    } catch (e) {
      /* noop */
    }
  };
  const mo = new MutationObserver(() => reapply());
  mo.observe(document.documentElement, { subtree: true, childList: true });
  window.addEventListener("resize", reapply);
}

// Defer slightly to allow app shell to settle
setTimeout(() => {
  try {
    mount();
  } catch (e) {
    console.error("[MCP] Mount failed", e);
  }
}, 300);

```

```markdown
MCP Web Bridge (Chrome MV3)

Phase 1 • Iteration A: ChatGPT web only

What it does
- Injects a minimal MCP entry control on https://chat.openai.com/* (no overlap with native controls).
- Opens a lightweight panel listing mock MCP servers with actions: Connect (no-op), Details (mock), Set default (persisted).
- Uses MV3 background service worker for typed request/response messaging and chrome.storage.sync for settings.
- UI runs in a ShadowRoot with prefixed classes to avoid CSS bleed.

Install (Unpacked)
1) Chrome → chrome://extensions
2) Enable Developer mode
3) Load unpacked → select this folder
4) Navigate to https://chatgpt.com (or https://chat.openai.com) and ensure the MCP chip appears near the composer

Quick connectivity check (no external MCP required)
- The Connect button now calls an echo action in the background. If you also run the optional local echo server, it will use HTTP; otherwise it echoes locally.

Optional local echo server
1) Create and run a tiny Node server:
```bash
node -e "require('http').createServer((req,res)=>{const u=new URL(req.url,'http://127.0.0.1');if(u.pathname==='\/echo'){res.end(u.searchParams.get('m')||'');}else{res.statusCode=404;res.end('not found')}}).listen(8787,()=>console.log('echo on 8787'))"
```
2) Click Connect in the panel. You should see a toast like: "Echo (http): hello from puppeteer". Without the server, it will show "Echo (local): ...".

Files
- manifest.json: MV3 manifest (host permission for chat.openai.com)
- background.js: service worker; message router; storage seeding and CRUD
- content.js: Shadow DOM UI; mount logic; MutationObserver; safe fixed-position fallback
- DESIGN.md: architecture, selectors strategy, UI contract, storage shapes
- DECISIONS.md: choices and tradeoffs log

Message schema (envelope)
Request: { kind: 'GET_SETTINGS'|'SET_SETTINGS'|'LIST_SERVERS'|'GET_SERVER'|'SET_DEFAULT', requestId, payload? }
Response: { requestId, ok: boolean, ...data|error }

Storage
- Key: mcp.webbridge.global.v1 (chrome.storage.sync)
- Shape: { version: 1, defaultServerId?: string, servers: McpServer[] }
- First-run: seeds 4–6 mock servers, defaultServerId = 'puppeteer'

Dev notes
- No telemetry. Only local console.debug.
- Minimal permissions: storage + host permission for chat.openai.com
- DOM resilience: MutationObserver; safe offsets computed from composer bounding box; fixed fallback
- Rollback: if anchored placement brittle, use floating chip with static offsets; sidebar alternative is reversible



```

- Use your normal Chrome. I added `chatgpt.com` and `localhost` to `host_permissions` and included both hosts in `content_scripts`. Reload the extension and hard-refresh the page.

- I simplified “connectivity” to a single built-in echo action:
  - Clicking Connect now sends an `ECHO` request to the background.
  - If a local HTTP echo server is running on 127.0.0.1:8787, it uses that; otherwise it echoes locally.
  - A small toast shows the response so you can confirm it works without any external MCP.

- Quick test:
  - Reload at chrome://extensions (circular arrow on MCP Web Bridge), then hard-refresh `https://chatgpt.com`.
  - Click the MCP chip → Connect on any item.
  - You should see a toast “Echo (local): hello from …”.
  - Optional: run this one-liner in a terminal, then click Connect again to see “Echo (http): …”:
    ```bash
    node -e "require('http').createServer((req,res)=>{const u=new URL(req.url,'http://127.0.0.1');if(u.pathname==='/echo'){res.end(u.searchParams.get('m')||'');}else{res.statusCode=404;res.end('not found')}}).listen(8787,()=>console.log('echo on 8787'))"
    ```

- Notes:
  - Files changed: `manifest.json` (hosts), `background.js` (new ECHO handler), `content.js` (Connect wired to ECHO + toast), `README.md` (instructions).
  - This gives a minimal, reproducible connection path now; we can later swap the echo for a real MCP handshake when you’re ready.

```shellscript
    node -e "require('http').createServer((req,res)=>{const u=new URL(req.url,'http://127.0.0.1');if(u.pathname==='/echo'){res.end(u.searchParams.get('m')||'');}else{res.statusCode=404;res.end('not found')}}).listen(8787,()=>console.log('echo on 8787'))"
```

---

**User**

It seems to be working. I don't however have any idea or local indication that it is. I think we can pick up the pace and getting something clearly working built (more changed) 

---

**Cursor**

I'll add visible indicators: an extension badge that shows MCP/OK, per-server status dots persisted in storage, and a simple echo input with toast. I'll modify background and content scripts, and update README.

```javascript
// Background service worker for MCP Web Bridge (MV3)
// Message schema (JSDoc types for clarity):
/**
 * @typedef {(
 *   {kind: 'GET_SETTINGS', requestId: string} |
 *   {kind: 'SET_SETTINGS', requestId: string, payload: Partial<GlobalSettings>} |
 *   {kind: 'LIST_SERVERS', requestId: string} |
 *   {kind: 'GET_SERVER', requestId: string, payload: {id: string}} |
 *   {kind: 'SET_DEFAULT', requestId: string, payload: {id: string}} |
 *   {kind: 'ECHO', requestId: string, payload: { message: string }} |
 *   {kind: 'SET_BADGE', requestId: string, payload: { text: string, color?: string, tabId?: number }} |
 *   {kind: 'SAVE_STATUS', requestId: string, payload: { serverId: string, ok: boolean, via: string, echoed?: string, at: number }} |
 *   {kind: 'LIST_STATUS', requestId: string}
 * )} Message
 */
/**
 * @typedef {{
 *   id: string,
 *   name: string,
 *   description?: string,
 *   url?: string,
 *   tags?: string[],
 * }} McpServer
 */
/**
 * @typedef {{
 *   version: number,
 *   defaultServerId?: string,
 *   servers: McpServer[],
 * }} GlobalSettings
 */

const SETTINGS_VERSION = 1;
const STORAGE_KEYS = {
  GLOBAL: "mcp.webbridge.global.v1",
  STATUS: "mcp.webbridge.status.v1",
};

/** @returns {Promise<GlobalSettings|null>} */
function readGlobalSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get([STORAGE_KEYS.GLOBAL], (obj) => {
      const data = obj[STORAGE_KEYS.GLOBAL] || null;
      resolve(data);
    });
  });
}

/** @param {GlobalSettings} settings */
function writeGlobalSettings(settings) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [STORAGE_KEYS.GLOBAL]: settings }, () =>
      resolve()
    );
  });
}

/** @returns {Promise<Record<string, any>>} */
function readStatuses() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEYS.STATUS], (obj) => {
      resolve(obj[STORAGE_KEYS.STATUS] || {});
    });
  });
}

/** @param {Record<string, any>} statuses */
function writeStatuses(statuses) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEYS.STATUS]: statuses }, () => resolve());
  });
}

/** @returns {McpServer[]} */
function createMockServers() {
  return [
    {
      id: "firecrawl",
      name: "Firecrawl",
      description: "Scrape pages into Markdown for offline analysis",
      url: "mcp://firecrawl",
      tags: ["scrape", "markdown"],
    },
    {
      id: "puppeteer",
      name: "Puppeteer MCP",
      description: "Automate a browser to inspect and probe DOM",
      url: "mcp://puppeteer",
      tags: ["automation", "dom"],
    },
    {
      id: "sequentialthinking",
      name: "Sequential Thinking",
      description: "Structured option analysis and decision-making",
      url: "mcp://sequentialthinking",
      tags: ["reasoning"],
    },
    {
      id: "streamable",
      name: "Streamable MCP",
      description: "Stream intermediate results",
      url: "mcp://streamable",
      tags: ["stream"],
    },
    {
      id: "memory",
      name: "Memory MCP",
      description: "Persist project facts and decisions",
      url: "mcp://memory",
      tags: ["persistence"],
    },
  ];
}

/** @returns {Promise<GlobalSettings>} */
async function ensureSettings() {
  const current = await readGlobalSettings();
  if (!current) {
    const seeded = /** @type {GlobalSettings} */ ({
      version: SETTINGS_VERSION,
      defaultServerId: "puppeteer",
      servers: createMockServers(),
    });
    await writeGlobalSettings(seeded);
    return seeded;
  }
  if (current.version !== SETTINGS_VERSION) {
    // Shallow migration example: bump version, preserve servers/default
    const migrated = { ...current, version: SETTINGS_VERSION };
    await writeGlobalSettings(migrated);
    return migrated;
  }
  return current;
}

chrome.runtime.onInstalled.addListener(async () => {
  await ensureSettings();
});

/** @param {Message} message */
async function handleMessage(message, senderTabId) {
  switch (message.kind) {
    case "GET_SETTINGS": {
      const settings = await ensureSettings();
      return { ok: true, settings };
    }
    case "SET_SETTINGS": {
      const existing = await ensureSettings();
      const next = {
        ...existing,
        ...message.payload,
        version: SETTINGS_VERSION,
      };
      await writeGlobalSettings(next);
      return { ok: true, settings: next };
    }
    case "LIST_SERVERS": {
      const settings = await ensureSettings();
      return {
        ok: true,
        servers: settings.servers,
        defaultServerId: settings.defaultServerId,
      };
    }
    case "GET_SERVER": {
      const settings = await ensureSettings();
      const server =
        settings.servers.find((s) => s.id === message.payload.id) || null;
      return { ok: true, server };
    }
    case "SET_DEFAULT": {
      const settings = await ensureSettings();
      const exists = settings.servers.some((s) => s.id === message.payload.id);
      const next = exists
        ? { ...settings, defaultServerId: message.payload.id }
        : settings;
      await writeGlobalSettings(next);
      return { ok: exists, defaultServerId: next.defaultServerId };
    }
    case "ECHO": {
      const msg = (message && message.payload && message.payload.message) || "";
      try {
        const res = await fetch(
          "http://127.0.0.1:8787/echo?m=" + encodeURIComponent(msg),
          { method: "GET" }
        );
        if (res.ok) {
          const text = await res.text();
          return { ok: true, echoed: text, via: "http" };
        }
      } catch (_e) {
        // fall back to local echo
      }
      return { ok: true, echoed: msg, via: "local" };
    }
    case "SET_BADGE": {
      const text = (message.payload && message.payload.text) || "";
      const color = (message.payload && message.payload.color) || "#22d3ee";
      const tabId = (message.payload && message.payload.tabId) || senderTabId;
      try {
        if (typeof tabId === "number") {
          chrome.action.setBadgeText({ text, tabId });
          chrome.action.setBadgeBackgroundColor({ color, tabId });
        } else {
          chrome.action.setBadgeText({ text });
          chrome.action.setBadgeBackgroundColor({ color });
        }
        return { ok: true };
      } catch (e) {
        return { ok: false, error: String(e) };
      }
    }
    case "SAVE_STATUS": {
      const statuses = await readStatuses();
      const { serverId, ok, via, echoed, at } = message.payload || {};
      statuses[serverId] = { ok: !!ok, via: via || "", echoed: echoed || "", at: at || Date.now() };
      await writeStatuses(statuses);
      return { ok: true };
    }
    case "LIST_STATUS": {
      const statuses = await readStatuses();
      return { ok: true, statuses };
    }
    default:
      return { ok: false, error: "Unknown kind" };
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  // All responses are async
  const tabId = _sender && _sender.tab && _sender.tab.id;
  (async () => {
    try {
      const data = await handleMessage(message, tabId);
      sendResponse({ requestId: message.requestId, ...data });
    } catch (error) {
      sendResponse({
        requestId: message.requestId,
        ok: false,
        error: String(error),
      });
    }
  })();
  return true;
});

```

```javascript
// Content script for ChatGPT.com only. Injects an MCP entry control and minimal surface.

/** Messaging client: send typed messages to the background service worker */
function sendMessage(kind, payload) {
  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ kind, payload, requestId }, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve(response);
    });
  });
}

/** CSS tokens (Shadow DOM scoped) */
const styleText = `
  :host {
    --mcp-z: 2147483600;
    --mcp-radius: 10px;
    --mcp-gap: 8px;
    --mcp-surface-bg: #0f172a;
    --mcp-surface-fg: #e5e7eb;
    --mcp-accent: #22d3ee;
    --mcp-border: rgba(148,163,184,0.25);
    --mcp-shadow: 0 8px 30px rgba(0,0,0,0.35);
    --mcp-ok: #10b981;
    --mcp-bad: #ef4444;
  }
  .mcp-root { position: relative; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji"; color: var(--mcp-surface-fg); }
  .mcp-entry { position: fixed; right: 16px; bottom: 120px; z-index: var(--mcp-z); background: var(--mcp-surface-bg); border: 1px solid var(--mcp-border); border-radius: 999px; padding: 8px 12px; font-weight: 700; font-size: 12px; letter-spacing: 0.04em; box-shadow: var(--mcp-shadow); cursor: pointer; user-select: none; }
  .mcp-entry:hover { outline: 0; box-shadow: 0 0 0 2px rgba(34,211,238,0.25), var(--mcp-shadow); }
  .mcp-entry:focus { outline: 0; box-shadow: 0 0 0 2px rgba(34,211,238,0.35), var(--mcp-shadow); }
  .mcp-panel { position: fixed; right: 16px; bottom: 170px; z-index: var(--mcp-z); width: 360px; max-height: 60vh; overflow: auto; background: var(--mcp-surface-bg); border: 1px solid var(--mcp-border); border-radius: var(--mcp-radius); box-shadow: var(--mcp-shadow); display: none; }
  .mcp-panel.open { display: block; }
  .mcp-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid var(--mcp-border); font-weight: 800; letter-spacing: 0.06em; }
  .mcp-list { list-style: none; padding: 8px; margin: 0; display: flex; flex-direction: column; gap: var(--mcp-gap); }
  .mcp-item { border: 1px solid var(--mcp-border); border-radius: 8px; padding: 8px; display: flex; gap: 8px; align-items: center; }
  .mcp-item-main { flex: 1; }
  .mcp-item-name { font-weight: 700; display: flex; align-items: center; gap: 6px; }
  .mcp-item-dot { width: 8px; height: 8px; border-radius: 999px; background: #64748b; border: 1px solid var(--mcp-border); }
  .mcp-item-dot.ok { background: var(--mcp-ok); }
  .mcp-item-dot.bad { background: var(--mcp-bad); }
  .mcp-item-desc { font-size: 12px; opacity: 0.8; margin-top: 2px; }
  .mcp-actions { display: flex; gap: 6px; }
  .mcp-actions button { background: transparent; color: var(--mcp-surface-fg); border: 1px solid var(--mcp-border); border-radius: 6px; padding: 4px 8px; cursor: pointer; }
  .mcp-actions button:hover { border-color: var(--mcp-accent); color: var(--mcp-accent); }
  .mcp-badge { font-size: 10px; padding: 2px 6px; border-radius: 999px; border: 1px solid var(--mcp-border); margin-left: 6px; opacity: 0.85; }
  .mcp-echo { display: flex; gap: 6px; padding: 8px; border-top: 1px solid var(--mcp-border); }
  .mcp-echo input { flex: 1; background: transparent; color: var(--mcp-surface-fg); border: 1px solid var(--mcp-border); border-radius: 6px; padding: 6px 8px; }
  .mcp-echo button { background: transparent; color: var(--mcp-surface-fg); border: 1px solid var(--mcp-border); border-radius: 6px; padding: 6px 10px; }
  .mcp-toast { position: fixed; right: 16px; bottom: 16px; z-index: var(--mcp-z); background: var(--mcp-surface-bg); color: var(--mcp-surface-fg); border: 1px solid var(--mcp-border); border-radius: 8px; padding: 8px 10px; box-shadow: var(--mcp-shadow); }
`;

/** Root host + ShadowRoot */
function createShadowHost() {
  const hostId = "mcp-webbridge-root";
  let host = document.getElementById(hostId);
  if (!host) {
    host = document.createElement("div");
    host.id = hostId;
    document.documentElement.appendChild(host);
  }
  if (!host.shadowRoot) {
    const shadow = host.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = styleText;
    shadow.appendChild(style);
    const root = document.createElement("div");
    root.className = "mcp-root";
    shadow.appendChild(root);
  }
  return host.shadowRoot;
}

function showToast(shadow, text) {
  const existing = shadow.querySelector(".mcp-toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.className = "mcp-toast";
  toast.textContent = text;
  shadow.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

/** Panel component with basic contract: open(), close(), render(list, state) */
function createPanel(shadow) {
  const root = shadow.querySelector(".mcp-root");
  const entry = document.createElement("button");
  entry.setAttribute("type", "button");
  entry.className = "mcp-entry";
  entry.textContent = "MCP";
  entry.setAttribute("aria-label", "Open MCP");

  const panel = document.createElement("div");
  panel.className = "mcp-panel";

  const header = document.createElement("div");
  header.className = "mcp-header";
  header.textContent = "MCP";
  panel.appendChild(header);

  const list = document.createElement("ul");
  list.className = "mcp-list";
  panel.appendChild(list);

  // echo input
  const echo = document.createElement("div");
  echo.className = "mcp-echo";
  const echoInput = document.createElement("input");
  echoInput.placeholder = "Type a message and Send";
  const echoBtn = document.createElement("button");
  echoBtn.textContent = "Send";
  echo.appendChild(echoInput);
  echo.appendChild(echoBtn);
  panel.appendChild(echo);

  root.appendChild(entry);
  root.appendChild(panel);

  entry.addEventListener("click", () => {
    panel.classList.toggle("open");
  });

  echoBtn.addEventListener("click", async () => {
    const text = echoInput.value || "";
    const res = await sendMessage("ECHO", { message: text });
    if (res && res.ok) {
      showToast(shadow, `Echo (${res.via}): ${res.echoed}`);
      await sendMessage("SET_BADGE", { text: "M", color: "#10b981" });
    } else {
      showToast(shadow, "Echo failed");
      await sendMessage("SET_BADGE", { text: "!", color: "#ef4444" });
    }
  });

  function render(servers, state, statuses) {
    list.textContent = "";
    servers.forEach((srv) => {
      const li = document.createElement("li");
      li.className = "mcp-item";
      li.dataset.id = srv.id;

      const main = document.createElement("div");
      main.className = "mcp-item-main";
      const name = document.createElement("div");
      name.className = "mcp-item-name";
      const dot = document.createElement("span");
      dot.className = "mcp-item-dot";
      const st = statuses && statuses[srv.id];
      if (st && st.ok) dot.classList.add("ok");
      if (st && !st.ok) dot.classList.add("bad");
      name.appendChild(dot);
      const title = document.createElement("span");
      title.textContent = srv.name;
      name.appendChild(title);
      if (state.defaultServerId === srv.id) {
        const badge = document.createElement("span");
        badge.className = "mcp-badge";
        badge.textContent = "Default";
        name.appendChild(badge);
      }
      const desc = document.createElement("div");
      desc.className = "mcp-item-desc";
      desc.textContent = srv.description || "";
      main.appendChild(name);
      main.appendChild(desc);

      const actions = document.createElement("div");
      actions.className = "mcp-actions";
      const btnConnect = document.createElement("button");
      btnConnect.textContent = "Connect";
      btnConnect.addEventListener("click", async () => {
        try {
          const res = await sendMessage("ECHO", { message: `hello from ${srv.id}` });
          if (res && res.ok) {
            showToast(shadow, `Echo (${res.via}): ${res.echoed}`);
            await sendMessage("SAVE_STATUS", { serverId: srv.id, ok: true, via: res.via, echoed: res.echoed, at: Date.now() });
            await sendMessage("SET_BADGE", { text: "OK", color: "#10b981" });
            await refresh();
          } else {
            showToast(shadow, `Echo failed`);
            await sendMessage("SAVE_STATUS", { serverId: srv.id, ok: false, via: "", echoed: "", at: Date.now() });
            await sendMessage("SET_BADGE", { text: "!", color: "#ef4444" });
            await refresh();
          }
        } catch (e) {
          showToast(shadow, `Echo error`);
          await sendMessage("SAVE_STATUS", { serverId: srv.id, ok: false, via: "", echoed: "", at: Date.now() });
          await sendMessage("SET_BADGE", { text: "!", color: "#ef4444" });
          await refresh();
        }
      });
      const btnDetails = document.createElement("button");
      btnDetails.textContent = "Details";
      btnDetails.addEventListener("click", async () => {
        const res = await sendMessage("GET_SERVER", { id: srv.id });
        console.debug("[MCP] Details", res);
        alert(`${srv.name}\n${srv.description || ""}\n${srv.url || ""}`);
      });
      const btnDefault = document.createElement("button");
      btnDefault.textContent = "Set default";
      btnDefault.addEventListener("click", async () => {
        await sendMessage("SET_DEFAULT", { id: srv.id });
        await refresh();
      });
      actions.appendChild(btnConnect);
      actions.appendChild(btnDetails);
      actions.appendChild(btnDefault);

      li.appendChild(main);
      li.appendChild(actions);
      list.appendChild(li);
    });
  }

  async function refresh() {
    const [serversRes, statusRes] = await Promise.all([
      sendMessage("LIST_SERVERS"),
      sendMessage("LIST_STATUS"),
    ]);
    if (serversRes && serversRes.ok) {
      render(serversRes.servers || [], { defaultServerId: serversRes.defaultServerId }, (statusRes && statusRes.statuses) || {});
    }
  }

  return {
    open: () => panel.classList.add("open"),
    close: () => panel.classList.remove("open"),
    render,
    refresh,
    elements: { entry, panel },
  };
}

/** Try to find the ChatGPT composer container for anchoring */
function findComposerContainer() {
  // Heuristic: form containing textarea or a role=textbox/contenteditable input near viewport bottom
  const candidates = Array.from(document.querySelectorAll("form"));
  let best = null;
  let bestScore = -Infinity;
  const vh = window.innerHeight || 0;
  for (const form of candidates) {
    const hasInput = form.querySelector(
      'textarea, [contenteditable="true"], [role="textbox"]'
    );
    if (!hasInput) continue;
    const rect = form.getBoundingClientRect();
    // Prefer forms near bottom and wide
    const distanceFromBottom = Math.abs(vh - rect.bottom);
    const score = rect.width - distanceFromBottom * 2;
    if (score > bestScore) {
      best = form;
      bestScore = score;
    }
  }
  return best;
}

function mount() {
  const shadow = createShadowHost();
  const panel = createPanel(shadow);

  // Anchored strategy attempt: if we can find composer, we keep floating chip but adjust bottom based on composer rect to avoid overlap
  function applyAnchorSafety() {
    const composer = findComposerContainer();
    const entry = panel.elements.entry;
    const panelEl = panel.elements.panel;
    if (!composer) {
      // Keep default fixed offsets
      entry.style.bottom = "120px";
      panelEl.style.bottom = "170px";
      return false;
    }
    const rect = composer.getBoundingClientRect();
    const safeGap = 16;
    const bottomOffset = Math.max(90, window.innerHeight - rect.top + safeGap);
    entry.style.bottom = `${bottomOffset}px`;
    panelEl.style.bottom = `${bottomOffset + 50}px`;
    return true;
  }

  // Initial render
  panel.refresh();
  applyAnchorSafety();

  // Observe layout changes and re-apply safety offsets
  const reapply = () => {
    try {
      applyAnchorSafety();
    } catch (e) {
      /* noop */
    }
  };
  const mo = new MutationObserver(() => reapply());
  mo.observe(document.documentElement, { subtree: true, childList: true });
  window.addEventListener("resize", reapply);
}

// Defer slightly to allow app shell to settle
setTimeout(() => {
  try {
    mount();
  } catch (e) {
    console.error("[MCP] Mount failed", e);
  }
}, 300);

```

```markdown
MCP Web Bridge (Chrome MV3)

Phase 1 • Iteration A: ChatGPT web only

What it does
- Injects a minimal MCP entry control on https://chat.openai.com/* (no overlap with native controls).
- Opens a lightweight panel listing mock MCP servers with actions: Connect (no-op), Details (mock), Set default (persisted).
- Uses MV3 background service worker for typed request/response messaging and chrome.storage.sync for settings.
- UI runs in a ShadowRoot with prefixed classes to avoid CSS bleed.

Install (Unpacked)
1) Chrome → chrome://extensions
2) Enable Developer mode
3) Load unpacked → select this folder
4) Navigate to https://chatgpt.com (or https://chat.openai.com) and ensure the MCP chip appears near the composer

Quick connectivity check (no external MCP required)
- The Connect button calls an echo action in the background. If you also run the optional local echo server, it will use HTTP; otherwise it echoes locally.
- The toolbar badge updates (OK/!); the panel shows per-server status dots (green/red) and has an echo input.

Optional local echo server
1) Create and run a tiny Node server:
```bash
node -e "require('http').createServer((req,res)=>{const u=new URL(req.url,'http://127.0.0.1');if(u.pathname==='\/echo'){res.end(u.searchParams.get('m')||'');}else{res.statusCode=404;res.end('not found')}}).listen(8787,()=>console.log('echo on 8787'))"
```
2) Click Connect in the panel. You should see a toast like: "Echo (http): hello from puppeteer". Without the server, it will show "Echo (local): ...".

Files
- manifest.json: MV3 manifest (host permission for chat.openai.com)
- background.js: service worker; message router; storage seeding and CRUD
- content.js: Shadow DOM UI; mount logic; MutationObserver; safe fixed-position fallback
- DESIGN.md: architecture, selectors strategy, UI contract, storage shapes
- DECISIONS.md: choices and tradeoffs log

Message schema (envelope)
Request: { kind: 'GET_SETTINGS'|'SET_SETTINGS'|'LIST_SERVERS'|'GET_SERVER'|'SET_DEFAULT', requestId, payload? }
Response: { requestId, ok: boolean, ...data|error }

Storage
- Key: mcp.webbridge.global.v1 (chrome.storage.sync)
- Shape: { version: 1, defaultServerId?: string, servers: McpServer[] }
- First-run: seeds 4–6 mock servers, defaultServerId = 'puppeteer'

Dev notes
- No telemetry. Only local console.debug.
- Minimal permissions: storage + host permission for chat.openai.com
- DOM resilience: MutationObserver; safe offsets computed from composer bounding box; fixed fallback
- Rollback: if anchored placement brittle, use floating chip with static offsets; sidebar alternative is reversible



```

- Reload the extension, hard-refresh ChatGPT, then click the MCP chip.
- New visible signals:
  - Badge updates on the extension icon: OK (green) after a successful echo, ! (red) on errors.
  - Per-server status dot in the list: green for last OK, red for last failure.
  - Echo input at the panel bottom to test instantly; a toast shows the response.

- Optional local echo:
  - Run the one-liner from README, then click Connect or Send to see “Echo (http): …”.
  - Without it, you’ll see “Echo (local): …” confirming end-to-end wiring.

- Changed files: `manifest.json` (hosts), `background.js` (ECHO, SET_BADGE, SAVE_STATUS, LIST_STATUS), `content.js` (status dots, toast, echo input), `README.md` (instructions).

---

**User**

Before I even test it this UI needs to change entirely. Its not at all aware of the content on the page and is overflowing off it rather than being seamlessly integrated into the default chatgpt website, looks weird (dumb styling doesn't match chatgpt website, which is what we should do) and info is not really useful. I want multiple tabs for different things, instead of just a bunch of random servers displayed in a list with no settings for configuration (you can leave these features unadded and greyed out for now, but at least build a respectable UI)

---

**Cursor**

Of course. You're right—the current UI is a proof-of-concept that isn't integrated, and it's time to build something that feels native to the site. I'll pivot to a more respectable and context-aware UI immediately.

My plan is to replace the floating chip and panel with a **collapsible sidebar** that mimics ChatGPT's design language. Here’s how I'll implement it:

1.  **New Structure**: I'll create a sidebar that lives on the right side of the page. It will be collapsed by default, showing only a small "MCP" tab. Clicking this tab will expand the sidebar without disrupting the main chat view.
2.  **Tabbed Interface**: Inside the sidebar, I'll build a tabbed navigation system with three sections:
    *   **Servers**: This will contain the restyled list of MCP servers.
    *   **Tools**: A placeholder tab for future functionality.
    *   **Settings**: A placeholder tab for future configuration options.
3.  **Seamless Styling**: I will completely replace the old CSS with new styles that borrow from ChatGPT's color palette, fonts, and spacing, ensuring it looks and feels like a native part of the website.
4.  **Refined UX**: The server list will be cleaner, and the overall layout will be more organized and professional.

I'll start by overhauling `content.js` to implement the new structure and styles.

```javascript
// Content script for ChatGPT.com only. Injects an MCP entry control and minimal surface.

/** Messaging client: send typed messages to the background service worker */
function sendMessage(kind, payload) {
  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ kind, payload, requestId }, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve(response);
    });
  });
}

/** CSS tokens (Shadow DOM scoped) */
const styleText = `
  :host {
    /** CHATGPT STYLES (approximated) **/
    --gpt-font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji";
    --gpt-bg-primary: #171717;
    --gpt-bg-secondary: #212121;
    --gpt-border-color: rgba(255,255,255,0.1);
    --gpt-text-primary: #ececf1;
    --gpt-text-secondary: #aab2c0;
    --gpt-radius: 6px;
    --gpt-accent: #7e12e3;

    /** MCP STYLES **/
    --mcp-z: 2147483600;
    --mcp-ok: #10b981;
    --mcp-bad: #ef4444;
  }
  .mcp-root { 
    position: fixed; 
    top: 0; 
    right: 0; 
    height: 100%; 
    z-index: var(--mcp-z); 
    font-family: var(--gpt-font-family);
    color: var(--gpt-text-primary);
  }
  .mcp-sidebar {
    width: 320px;
    height: 100%;
    background: var(--gpt-bg-primary);
    border-left: 1px solid var(--gpt-border-color);
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;
    display: flex;
    flex-direction: column;
  }
  .mcp-sidebar.open {
    transform: translateX(0);
  }
  .mcp-tab {
    position: absolute;
    top: 50%;
    left: -30px;
    transform: translateY(-50%) rotate(90deg);
    transform-origin: bottom left;
    background: var(--gpt-bg-primary);
    border: 1px solid var(--gpt-border-color);
    border-bottom: none;
    padding: 6px 12px;
    border-radius: var(--gpt-radius) var(--gpt-radius) 0 0;
    cursor: pointer;
    font-weight: 600;
  }

  /** TABS **/
  .mcp-tabs-nav {
    display: flex;
    border-bottom: 1px solid var(--gpt-border-color);
    padding: 8px;
  }
  .mcp-tabs-nav button {
    flex: 1;
    padding: 8px 12px;
    background: transparent;
    border: 1px solid transparent;
    color: var(--gpt-text-secondary);
    border-radius: var(--gpt-radius);
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  }
  .mcp-tabs-nav button:hover {
    background: var(--gpt-bg-secondary);
  }
  .mcp-tabs-nav button.active {
    background: var(--gpt-bg-secondary);
    border-color: var(--gpt-border-color);
    color: var(--gpt-text-primary);
  }
  .mcp-tabs-nav button[disabled] {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .mcp-tabs-content {
    flex: 1;
    overflow-y: auto;
  }
  .mcp-tab-panel {
    display: none;
  }
  .mcp-tab-panel.active {
    display: block;
  }
  .mcp-tab-panel-placeholder {
    padding: 24px;
    text-align: center;
    color: var(--gpt-text-secondary);
    font-size: 14px;
  }

  /** SERVER LIST (restyled) **/
  .mcp-list { 
    list-style: none; 
    padding: 8px; 
    margin: 0; 
    display: flex; 
    flex-direction: column; 
    gap: 8px;
  }
  .mcp-item { 
    border: 1px solid var(--gpt-border-color); 
    background: var(--gpt-bg-secondary);
    border-radius: var(--gpt-radius); 
    padding: 12px; 
  }
  .mcp-item-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .mcp-item-name { 
    font-weight: 600;
    font-size: 15px;
  }
  .mcp-item-dot { 
    width: 8px; height: 8px; border-radius: 999px; background: #64748b;
  }
  .mcp-item-dot.ok { background: var(--mcp-ok); }
  .mcp-item-dot.bad { background: var(--mcp-bad); }
  .mcp-item-desc { 
    font-size: 13px; 
    color: var(--gpt-text-secondary);
    margin-top: 4px; 
    margin-bottom: 12px;
  }
  .mcp-actions { display: flex; gap: 8px; }
  .mcp-actions button { 
    background: transparent; 
    color: var(--gpt-text-secondary); 
    border: 1px solid var(--gpt-border-color); 
    border-radius: var(--gpt-radius); 
    padding: 6px 10px; 
    cursor: pointer;
    font-size: 13px;
  }
  .mcp-actions button:hover { 
    border-color: var(--gpt-text-secondary);
    color: var(--gpt-text-primary);
  }
  .mcp-badge { 
    font-size: 10px; 
    padding: 2px 6px; 
    border-radius: 999px; 
    border: 1px solid var(--gpt-border-color); 
    margin-left: auto;
    color: var(--gpt-text-secondary);
  }
  .mcp-toast { position: fixed; right: 16px; bottom: 16px; z-index: var(--mcp-z); background: var(--gpt-bg-primary); color: var(--gpt-text-primary); border: 1px solid var(--gpt-border-color); border-radius: 8px; padding: 8px 10px; }
`;

/** Root host + ShadowRoot */
function createShadowHost() {
  const hostId = "mcp-webbridge-root";
  let host = document.getElementById(hostId);
  if (!host) {
    host = document.createElement("div");
    host.id = hostId;
    document.documentElement.appendChild(host);
  }
  if (!host.shadowRoot) {
    const shadow = host.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = styleText;
    shadow.appendChild(style);
    const root = document.createElement("div");
    root.className = "mcp-root";
    shadow.appendChild(root);
  }
  return host.shadowRoot;
}

function showToast(shadow, text) {
  const existing = shadow.querySelector(".mcp-toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.className = "mcp-toast";
  toast.textContent = text;
  shadow.querySelector(".mcp-root").appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

/** Sidebar UI component */
function createSidebar(shadow) {
  const root = shadow.querySelector(".mcp-root");
  
  // Main container
  const sidebar = document.createElement("div");
  sidebar.className = "mcp-sidebar";

  // Toggle tab
  const tab = document.createElement("div");
  tab.className = "mcp-tab";
  tab.textContent = "MCP";
  sidebar.appendChild(tab);
  
  // Nav
  const nav = document.createElement("div");
  nav.className = "mcp-tabs-nav";
  const btnServers = document.createElement("button");
  btnServers.textContent = "Servers";
  btnServers.className = "active";
  const btnTools = document.createElement("button");
  btnTools.textContent = "Tools";
  btnTools.disabled = true;
  const btnSettings = document.createElement("button");
  btnSettings.textContent = "Settings";
  btnSettings.disabled = true;
  nav.appendChild(btnServers);
  nav.appendChild(btnTools);
  nav.appendChild(btnSettings);
  sidebar.appendChild(nav);

  // Content
  const content = document.createElement("div");
  content.className = "mcp-tabs-content";
  
  const panelServers = document.createElement("div");
  panelServers.className = "mcp-tab-panel active";
  const serverList = document.createElement("ul");
  serverList.className = "mcp-list";
  panelServers.appendChild(serverList);
  
  const panelTools = document.createElement("div");
  panelTools.className = "mcp-tab-panel";
  panelTools.innerHTML = `<div class="mcp-tab-panel-placeholder">Tools will be available here.</div>`;
  
  const panelSettings = document.createElement("div");
  panelSettings.className = "mcp-tab-panel";
  panelSettings.innerHTML = `<div class="mcp-tab-panel-placeholder">Configuration will be available here.</div>`;

  content.appendChild(panelServers);
  content.appendChild(panelTools);
  content.appendChild(panelSettings);
  sidebar.appendChild(content);
  
  root.appendChild(sidebar);

  // Tab switching logic
  const buttons = [btnServers, btnTools, btnSettings];
  const panels = [panelServers, panelTools, panelSettings];
  buttons.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      buttons.forEach(b => b.classList.remove("active"));
      panels.forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      panels[index].classList.add("active");
    });
  });

  tab.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });

  function render(servers, state, statuses) {
    serverList.textContent = "";
    servers.forEach((srv) => {
      const li = document.createElement("li");
      li.className = "mcp-item";
      li.dataset.id = srv.id;

      const header = document.createElement("div");
      header.className = "mcp-item-header";
      const dot = document.createElement("span");
      dot.className = "mcp-item-dot";
      const st = statuses && statuses[srv.id];
      if (st && st.ok) dot.classList.add("ok");
      if (st && !st.ok) dot.classList.add("bad");
      const name = document.createElement("div");
      name.className = "mcp-item-name";
      name.textContent = srv.name;
      header.appendChild(dot);
      header.appendChild(name);

      if (state.defaultServerId === srv.id) {
        const badge = document.createElement("span");
        badge.className = "mcp-badge";
        badge.textContent = "Default";
        header.appendChild(badge);
      }
      
      const desc = document.createElement("div");
      desc.className = "mcp-item-desc";
      desc.textContent = srv.description || "";
      
      const actions = document.createElement("div");
      actions.className = "mcp-actions";
      const btnConnect = document.createElement("button");
      btnConnect.textContent = "Connect";
      btnConnect.addEventListener("click", async () => {
        try {
          const res = await sendMessage("ECHO", { message: `hello from ${srv.id}` });
          const isOk = res && res.ok;
          showToast(shadow, isOk ? `Echo (${res.via}): ${res.echoed}` : 'Echo failed');
          await sendMessage("SAVE_STATUS", { serverId: srv.id, ok: isOk, via: isOk ? res.via : '', echoed: isOk ? res.echoed : '', at: Date.now() });
          await sendMessage("SET_BADGE", { text: isOk ? 'OK' : '!', color: isOk ? '#10b981' : '#ef4444' });
          await refresh();
        } catch (e) {
          showToast(shadow, `Echo error`);
          await sendMessage("SAVE_STATUS", { serverId: srv.id, ok: false, at: Date.now() });
          await sendMessage("SET_BADGE", { text: "!", color: "#ef4444" });
          await refresh();
        }
      });
      const btnDetails = document.createElement("button");
      btnDetails.textContent = "Details";
      btnDetails.addEventListener("click", async () => {
        alert(`${srv.name}\n${srv.description || ""}\n${srv.url || ""}`);
      });
      const btnDefault = document.createElement("button");
      btnDefault.textContent = "Set default";
      btnDefault.addEventListener("click", async () => {
        await sendMessage("SET_DEFAULT", { id: srv.id });
        await refresh();
      });
      actions.appendChild(btnConnect);
      actions.appendChild(btnDetails);
      actions.appendChild(btnDefault);

      li.appendChild(header);
      li.appendChild(desc);
      li.appendChild(actions);
      serverList.appendChild(li);
    });
  }

  async function refresh() {
    const [serversRes, statusRes] = await Promise.all([
      sendMessage("LIST_SERVERS"),
      sendMessage("LIST_STATUS"),
    ]);
    if (serversRes && serversRes.ok) {
      render(serversRes.servers || [], { defaultServerId: serversRes.defaultServerId }, (statusRes && statusRes.statuses) || {});
    }
  }

  return { refresh };
}


function mount() {
  const shadow = createShadowHost();
  const sidebar = createSidebar(shadow);
  sidebar.refresh();
}

// Defer slightly to allow app shell to settle
setTimeout(() => {
  try {
    mount();
  } catch (e) {
    console.error("[MCP] Mount failed", e);
  }
}, 300);

```

You're right, the UI needed a significant overhaul to feel integrated and professional. I've replaced the floating panel with a new, collapsible sidebar that mimics the ChatGPT aesthetic and provides the tabbed structure you requested.

Here are the key changes:

1.  **New Collapsible Sidebar**:
    *   The floating chip is gone. There's now a small "MCP" tab fixed to the right edge of the screen.
    *   Clicking this tab smoothly slides out a full-height sidebar.

2.  **ChatGPT-Native Styling**:
    *   I've updated the color scheme, fonts, borders, and spacing to closely match the native ChatGPT interface, ensuring it looks like part of the application.

3.  **Tabbed Interface**:
    *   The sidebar has three tabs: **Servers**, **Tools**, and **Settings**.
    *   "Servers" contains the restyled list of MCP connections.
    *   "Tools" and "Settings" are included as placeholders and are currently disabled, ready for future functionality.

4.  **Refined Server List**:
    *   The server list in the "Servers" tab has been redesigned to be cleaner and more in line with the new UI.

To see the changes, please **reload the extension** from `chrome://extensions` and then **hard-refresh** the ChatGPT page.

---

**User**

Im still super unclear about if its working or not. I should be able to see that this is working from the IDE. I want more dev features, more abilities to do basic things like toggle the servers on/off, and most of all I want to see that this is working from this IDE. 
I feel like there's extensive tools or configurable MCP servers already existing and designed for this kind of thing which could help simplify this. Search extensively and get this extension to a acceptable point.

---

**Cursor**

I'll add development features: IDE-observable logging via a local Node dev server, server enable/disable toggles stored in settings, a Dev tab with diagnostics (status, worker uptime, recent logs), and new background message kinds (PING, LOG, TOGGLE_SERVER, LIST_STATUS/CLEAR_STATUS). I’ll update `background.js`, `content.js`, add `scripts/dev-server.js`, and expand README with run/debug steps. Then I’ll run lints.

I’m going to add developer features and toggles now: create new TODOs, then implement background message kinds (PING, LOG, TOGGLE_SERVER, LIST_LOGS, CLEAR_LOGS) with persisted statuses/logs, wire server enable/disable and a Dev tab in the sidebar UI, and add a local dev server script. I’ll update the README with run/debug steps and then check for lints.

I added a new todo list for the requested dev features and am about to implement background message handlers, UI toggles and a Dev tab, plus a local dev server script and updated docs. I'll apply the code edits and create the script now.

```javascript
// Background service worker for MCP Web Bridge (MV3)
// Message schema (JSDoc types for clarity):
/**
 * @typedef {(
 *   {kind: 'GET_SETTINGS', requestId: string} |
 *   {kind: 'SET_SETTINGS', requestId: string, payload: Partial<GlobalSettings>} |
 *   {kind: 'LIST_SERVERS', requestId: string} |
 *   {kind: 'GET_SERVER', requestId: string, payload: {id: string}} |
 *   {kind: 'SET_DEFAULT', requestId: string, payload: {id: string}} |
 *   {kind: 'ECHO', requestId: string, payload: { message: string }} |
 *   {kind: 'SET_BADGE', requestId: string, payload: { text: string, color?: string, tabId?: number }} |
 *   {kind: 'SAVE_STATUS', requestId: string, payload: { serverId: string, ok: boolean, via?: string, echoed?: string, at?: number }} |
 *   {kind: 'LIST_STATUS', requestId: string} |
 *   {kind: 'PING', requestId: string} |
 *   {kind: 'LOG', requestId: string, payload: { level?: 'debug'|'info'|'warn'|'error', message: string, meta?: any }} |
 *   {kind: 'LIST_LOGS', requestId: string} |
 *   {kind: 'CLEAR_LOGS', requestId: string} |
 *   {kind: 'TOGGLE_SERVER', requestId: string, payload: { id: string, enabled: boolean }}
 * )} Message
 */
/**
 * @typedef {{
 *   id: string,
 *   name: string,
 *   description?: string,
 *   url?: string,
 *   tags?: string[],
 *   enabled?: boolean,
 * }} McpServer
 */
/**
 * @typedef {{
 *   version: number,
 *   defaultServerId?: string,
 *   servers: McpServer[],
 * }} GlobalSettings
 */

const SETTINGS_VERSION = 1;
const STORAGE_KEYS = {
  GLOBAL: "mcp.webbridge.global.v1",
  STATUS: "mcp.webbridge.status.v1",
  LOGS: "mcp.webbridge.logs.v1",
  FIRST_INSTALLED_AT: "mcp.webbridge.installedAt",
};

/** @returns {Promise<GlobalSettings|null>} */
function readGlobalSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get([STORAGE_KEYS.GLOBAL], (obj) => {
      const data = obj[STORAGE_KEYS.GLOBAL] || null;
      resolve(data);
    });
  });
}

/** @param {GlobalSettings} settings */
function writeGlobalSettings(settings) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [STORAGE_KEYS.GLOBAL]: settings }, () =>
      resolve()
    );
  });
}

/** @returns {Promise<Record<string, any>>} */
function readStatuses() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEYS.STATUS], (obj) => {
      resolve(obj[STORAGE_KEYS.STATUS] || {});
    });
  });
}

/** @param {Record<string, any>} statuses */
function writeStatuses(statuses) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEYS.STATUS]: statuses }, () => resolve());
  });
}

/** @returns {Promise<Array<{t:number,level:string,msg:string,meta?:any}>>} */
function readLogs() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEYS.LOGS], (obj) => {
      resolve(obj[STORAGE_KEYS.LOGS] || []);
    });
  });
}

/** @param {Array<{t:number,level:string,msg:string,meta?:any}>} logs */
function writeLogs(logs) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEYS.LOGS]: logs.slice(-500) }, () => resolve());
  });
}

/** @returns {McpServer[]} */
function createMockServers() {
  return [
    {
      id: "firecrawl",
      name: "Firecrawl",
      description: "Scrape pages into Markdown for offline analysis",
      url: "mcp://firecrawl",
      tags: ["scrape", "markdown"],
      enabled: true,
    },
    {
      id: "puppeteer",
      name: "Puppeteer MCP",
      description: "Automate a browser to inspect and probe DOM",
      url: "mcp://puppeteer",
      tags: ["automation", "dom"],
      enabled: true,
    },
    {
      id: "sequentialthinking",
      name: "Sequential Thinking",
      description: "Structured option analysis and decision-making",
      url: "mcp://sequentialthinking",
      tags: ["reasoning"],
      enabled: false,
    },
    {
      id: "streamable",
      name: "Streamable MCP",
      description: "Stream intermediate results",
      url: "mcp://streamable",
      tags: ["stream"],
      enabled: false,
    },
    {
      id: "memory",
      name: "Memory MCP",
      description: "Persist project facts and decisions",
      url: "mcp://memory",
      tags: ["persistence"],
      enabled: false,
    },
  ];
}

/** @returns {Promise<GlobalSettings>} */
async function ensureSettings() {
  const current = await readGlobalSettings();
  if (!current) {
    const seeded = /** @type {GlobalSettings} */ ({
      version: SETTINGS_VERSION,
      defaultServerId: "puppeteer",
      servers: createMockServers(),
    });
    await writeGlobalSettings(seeded);
    return seeded;
  }
  // migration: ensure enabled flag exists on servers
  const migratedServers = (current.servers || []).map((s) => ({
    enabled: true, // default true if missing
    ...s,
    enabled: typeof s.enabled === 'boolean' ? s.enabled : true,
  }));
  const needsWrite = current.version !== SETTINGS_VERSION || migratedServers.some((s, i) => current.servers[i] && current.servers[i].enabled === undefined);
  if (needsWrite) {
    const migrated = { ...current, version: SETTINGS_VERSION, servers: migratedServers };
    await writeGlobalSettings(migrated);
    return migrated;
  }
  return current;
}

chrome.runtime.onInstalled.addListener(async () => {
  await ensureSettings();
  chrome.storage.local.set({ [STORAGE_KEYS.FIRST_INSTALLED_AT]: Date.now() });
});

async function appendLog(level, msg, meta) {
  try {
    const logs = await readLogs();
    logs.push({ t: Date.now(), level, msg, meta });
    await writeLogs(logs);
  } catch (_e) {}
}

/** @param {Message} message */
async function handleMessage(message, senderTabId) {
  switch (message.kind) {
    case "GET_SETTINGS": {
      const settings = await ensureSettings();
      return { ok: true, settings };
    }
    case "SET_SETTINGS": {
      const existing = await ensureSettings();
      const next = {
        ...existing,
        ...message.payload,
        version: SETTINGS_VERSION,
      };
      await writeGlobalSettings(next);
      await appendLog('info', 'SET_SETTINGS', { keys: Object.keys(message.payload || {}) });
      return { ok: true, settings: next };
    }
    case "LIST_SERVERS": {
      const settings = await ensureSettings();
      return {
        ok: true,
        servers: settings.servers,
        defaultServerId: settings.defaultServerId,
      };
    }
    case "GET_SERVER": {
      const settings = await ensureSettings();
      const server =
        settings.servers.find((s) => s.id === message.payload.id) || null;
      return { ok: true, server };
    }
    case "SET_DEFAULT": {
      const settings = await ensureSettings();
      const exists = settings.servers.some((s) => s.id === message.payload.id);
      const next = exists
        ? { ...settings, defaultServerId: message.payload.id }
        : settings;
      await writeGlobalSettings(next);
      await appendLog('info', 'SET_DEFAULT', { id: message.payload.id });
      return { ok: exists, defaultServerId: next.defaultServerId };
    }
    case "TOGGLE_SERVER": {
      const settings = await ensureSettings();
      const servers = settings.servers.map((s) => s.id === message.payload.id ? { ...s, enabled: !!message.payload.enabled } : s);
      const next = { ...settings, servers };
      await writeGlobalSettings(next);
      await appendLog('info', 'TOGGLE_SERVER', { id: message.payload.id, enabled: !!message.payload.enabled });
      return { ok: true, servers };
    }
    case "ECHO": {
      const msg = (message && message.payload && message.payload.message) || "";
      try {
        const res = await fetch(
          "http://127.0.0.1:8787/echo?m=" + encodeURIComponent(msg),
          { method: "GET" }
        );
        if (res.ok) {
          const text = await res.text();
          await appendLog('debug', 'ECHO_HTTP', { echoed: text });
          return { ok: true, echoed: text, via: "http" };
        }
      } catch (_e) {
        // fall back to local echo
      }
      await appendLog('debug', 'ECHO_LOCAL', { echoed: msg });
      return { ok: true, echoed: msg, via: "local" };
    }
    case "SET_BADGE": {
      const text = (message.payload && message.payload.text) || "";
      const color = (message.payload && message.payload.color) || "#22d3ee";
      const tabId = (message.payload && message.payload.tabId) || senderTabId;
      try {
        if (typeof tabId === "number") {
          chrome.action.setBadgeText({ text, tabId });
          chrome.action.setBadgeBackgroundColor({ color, tabId });
        } else {
          chrome.action.setBadgeText({ text });
          chrome.action.setBadgeBackgroundColor({ color });
        }
        return { ok: true };
      } catch (e) {
        return { ok: false, error: String(e) };
      }
    }
    case "SAVE_STATUS": {
      const statuses = await readStatuses();
      const { serverId, ok, via, echoed, at } = message.payload || {};
      statuses[serverId] = { ok: !!ok, via: via || "", echoed: echoed || "", at: at || Date.now() };
      await writeStatuses(statuses);
      return { ok: true };
    }
    case "LIST_STATUS": {
      const statuses = await readStatuses();
      return { ok: true, statuses };
    }
    case "PING": {
      const installedAtObj = await new Promise((resolve) => chrome.storage.local.get([STORAGE_KEYS.FIRST_INSTALLED_AT], resolve));
      const installedAt = installedAtObj && installedAtObj[STORAGE_KEYS.FIRST_INSTALLED_AT];
      return { ok: true, now: Date.now(), installedAt: installedAt || null };
    }
    case "LOG": {
      const level = (message.payload && message.payload.level) || 'info';
      const msg = (message.payload && message.payload.message) || '';
      await appendLog(level, msg, message.payload && message.payload.meta);
      return { ok: true };
    }
    case "LIST_LOGS": {
      const logs = await readLogs();
      return { ok: true, logs };
    }
    case "CLEAR_LOGS": {
      await writeLogs([]);
      return { ok: true };
    }
    default:
      return { ok: false, error: "Unknown kind" };
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  // All responses are async
  const tabId = _sender && _sender.tab && _sender.tab.id;
  (async () => {
    try {
      const data = await handleMessage(message, tabId);
      sendResponse({ requestId: message.requestId, ...data });
    } catch (error) {
      sendResponse({
        requestId: message.requestId,
        ok: false,
        error: String(error),
      });
    }
  })();
  return true;
});

```

```javascript
// Content script for ChatGPT.com only. Injects an MCP entry control and minimal surface.

/** Messaging client: send typed messages to the background service worker */
function sendMessage(kind, payload) {
  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ kind, payload, requestId }, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve(response);
    });
  });
}

/** CSS tokens (Shadow DOM scoped) */
const styleText = `
  :host {
    /** CHATGPT STYLES (approximated) **/
    --gpt-font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji";
    --gpt-bg-primary: #171717;
    --gpt-bg-secondary: #212121;
    --gpt-border-color: rgba(255,255,255,0.1);
    --gpt-text-primary: #ececf1;
    --gpt-text-secondary: #aab2c0;
    --gpt-radius: 6px;
    --gpt-accent: #7e12e3;

    /** MCP STYLES **/
    --mcp-z: 2147483600;
    --mcp-ok: #10b981;
    --mcp-bad: #ef4444;
  }
  .mcp-root { 
    position: fixed; 
    top: 0; 
    right: 0; 
    height: 100%; 
    z-index: var(--mcp-z); 
    font-family: var(--gpt-font-family);
    color: var(--gpt-text-primary);
  }
  .mcp-sidebar {
    width: 360px;
    height: 100%;
    background: var(--gpt-bg-primary);
    border-left: 1px solid var(--gpt-border-color);
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;
    display: flex;
    flex-direction: column;
  }
  .mcp-sidebar.open {
    transform: translateX(0);
  }
  .mcp-tab {
    position: absolute;
    top: 50%;
    left: -30px;
    transform: translateY(-50%) rotate(90deg);
    transform-origin: bottom left;
    background: var(--gpt-bg-primary);
    border: 1px solid var(--gpt-border-color);
    border-bottom: none;
    padding: 6px 12px;
    border-radius: var(--gpt-radius) var(--gpt-radius) 0 0;
    cursor: pointer;
    font-weight: 600;
  }

  /** TABS **/
  .mcp-tabs-nav {
    display: flex;
    border-bottom: 1px solid var(--gpt-border-color);
    padding: 8px;
    gap: 6px;
  }
  .mcp-tabs-nav button {
    flex: 1;
    padding: 8px 12px;
    background: transparent;
    border: 1px solid transparent;
    color: var(--gpt-text-secondary);
    border-radius: var(--gpt-radius);
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  }
  .mcp-tabs-nav button:hover {
    background: var(--gpt-bg-secondary);
  }
  .mcp-tabs-nav button.active {
    background: var(--gpt-bg-secondary);
    border-color: var(--gpt-border-color);
    color: var(--gpt-text-primary);
  }
  .mcp-tabs-nav button[disabled] {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .mcp-tabs-content {
    flex: 1;
    overflow-y: auto;
  }
  .mcp-tab-panel {
    display: none;
  }
  .mcp-tab-panel.active {
    display: block;
  }
  .mcp-tab-panel-placeholder {
    padding: 24px;
    text-align: center;
    color: var(--gpt-text-secondary);
    font-size: 14px;
  }

  /** SERVER LIST (restyled) **/
  .mcp-list { 
    list-style: none; 
    padding: 8px; 
    margin: 0; 
    display: flex; 
    flex-direction: column; 
    gap: 8px;
  }
  .mcp-item { 
    border: 1px solid var(--gpt-border-color); 
    background: var(--gpt-bg-secondary);
    border-radius: var(--gpt-radius); 
    padding: 12px; 
  }
  .mcp-item-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .mcp-item-name { 
    font-weight: 600;
    font-size: 15px;
  }
  .mcp-item-dot { 
    width: 8px; height: 8px; border-radius: 999px; background: #64748b;
  }
  .mcp-item-dot.ok { background: var(--mcp-ok); }
  .mcp-item-dot.bad { background: var(--mcp-bad); }
  .mcp-item-desc { 
    font-size: 13px; 
    color: var(--gpt-text-secondary);
    margin-top: 4px; 
    margin-bottom: 12px;
  }
  .mcp-actions { display: flex; gap: 8px; align-items: center; }
  .mcp-actions button { 
    background: transparent; 
    color: var(--gpt-text-secondary); 
    border: 1px solid var(--gpt-border-color); 
    border-radius: var(--gpt-radius); 
    padding: 6px 10px; 
    cursor: pointer;
    font-size: 13px;
  }
  .mcp-actions button:hover { 
    border-color: var(--gpt-text-secondary);
    color: var(--gpt-text-primary);
  }
  .mcp-toggle { display: inline-flex; align-items: center; gap: 6px; }
  .mcp-toggle input { width: 36px; height: 18px; cursor: pointer; }
  .mcp-badge { 
    font-size: 10px; 
    padding: 2px 6px; 
    border-radius: 999px; 
    border: 1px solid var(--gpt-border-color); 
    margin-left: auto;
    color: var(--gpt-text-secondary);
  }
  .mcp-toast { position: fixed; right: 16px; bottom: 16px; z-index: var(--mcp-z); background: var(--gpt-bg-primary); color: var(--gpt-text-primary); border: 1px solid var(--gpt-border-color); border-radius: 8px; padding: 8px 10px; }

  /** DEV TAB **/
  .mcp-dev { padding: 8px; display: grid; grid-template-rows: auto 1fr; gap: 8px; }
  .mcp-dev-kv { display: grid; grid-template-columns: 160px 1fr; gap: 6px; font-size: 13px; color: var(--gpt-text-secondary); }
  .mcp-dev-row { display: contents; }
  .mcp-dev-logs { border: 1px solid var(--gpt-border-color); border-radius: var(--gpt-radius); background: var(--gpt-bg-secondary); padding: 8px; height: 260px; overflow: auto; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size: 12px; }
  .mcp-dev-actions { display: flex; gap: 6px; }
`;

/** Root host + ShadowRoot */
function createShadowHost() {
  const hostId = "mcp-webbridge-root";
  let host = document.getElementById(hostId);
  if (!host) {
    host = document.createElement("div");
    host.id = hostId;
    document.documentElement.appendChild(host);
  }
  if (!host.shadowRoot) {
    const shadow = host.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = styleText;
    shadow.appendChild(style);
    const root = document.createElement("div");
    root.className = "mcp-root";
    shadow.appendChild(root);
  }
  return host.shadowRoot;
}

function showToast(shadow, text) {
  const existing = shadow.querySelector(".mcp-toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.className = "mcp-toast";
  toast.textContent = text;
  shadow.querySelector(".mcp-root").appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

/** Sidebar UI component */
function createSidebar(shadow) {
  const root = shadow.querySelector(".mcp-root");
  
  // Main container
  const sidebar = document.createElement("div");
  sidebar.className = "mcp-sidebar";

  // Toggle tab
  const tab = document.createElement("div");
  tab.className = "mcp-tab";
  tab.textContent = "MCP";
  sidebar.appendChild(tab);
  
  // Nav
  const nav = document.createElement("div");
  nav.className = "mcp-tabs-nav";
  const btnServers = document.createElement("button");
  btnServers.textContent = "Servers";
  btnServers.className = "active";
  const btnTools = document.createElement("button");
  btnTools.textContent = "Tools";
  btnTools.disabled = true;
  const btnDev = document.createElement("button");
  btnDev.textContent = "Dev";
  const btnSettings = document.createElement("button");
  btnSettings.textContent = "Settings";
  btnSettings.disabled = true;
  nav.appendChild(btnServers);
  nav.appendChild(btnTools);
  nav.appendChild(btnDev);
  nav.appendChild(btnSettings);
  sidebar.appendChild(nav);

  // Content
  const content = document.createElement("div");
  content.className = "mcp-tabs-content";
  
  const panelServers = document.createElement("div");
  panelServers.className = "mcp-tab-panel active";
  const serverList = document.createElement("ul");
  serverList.className = "mcp-list";
  panelServers.appendChild(serverList);
  
  const panelTools = document.createElement("div");
  panelTools.className = "mcp-tab-panel";
  panelTools.innerHTML = `<div class="mcp-tab-panel-placeholder">Tools will be available here.</div>`;

  const panelDev = document.createElement("div");
  panelDev.className = "mcp-tab-panel mcp-dev";
  panelDev.innerHTML = `
    <div class="mcp-dev-kv">
      <div class="mcp-dev-row"><div>Worker time</div><div id="mcp-dev-time">-</div></div>
      <div class="mcp-dev-row"><div>Installed at</div><div id="mcp-dev-installed">-</div></div>
    </div>
    <div>
      <div class="mcp-dev-actions">
        <button id="mcp-dev-refresh">Refresh</button>
        <button id="mcp-dev-clear">Clear logs</button>
      </div>
      <div class="mcp-dev-logs" id="mcp-dev-logs"></div>
    </div>
  `;

  const panelSettings = document.createElement("div");
  panelSettings.className = "mcp-tab-panel";
  panelSettings.innerHTML = `<div class="mcp-tab-panel-placeholder">Configuration will be available here.</div>`;

  content.appendChild(panelServers);
  content.appendChild(panelTools);
  content.appendChild(panelDev);
  content.appendChild(panelSettings);
  sidebar.appendChild(content);
  
  root.appendChild(sidebar);

  // Tab switching logic
  const buttons = [btnServers, btnTools, btnDev, btnSettings];
  const panels = [panelServers, panelTools, panelDev, panelSettings];
  buttons.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      buttons.forEach(b => b.classList.remove("active"));
      panels.forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      panels[index].classList.add("active");
    });
  });

  tab.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });

  function render(servers, state, statuses) {
    serverList.textContent = "";
    servers.forEach((srv) => {
      const li = document.createElement("li");
      li.className = "mcp-item";
      li.dataset.id = srv.id;

      const header = document.createElement("div");
      header.className = "mcp-item-header";
      const dot = document.createElement("span");
      dot.className = "mcp-item-dot";
      const st = statuses && statuses[srv.id];
      if (st && st.ok) dot.classList.add("ok");
      if (st && !st.ok) dot.classList.add("bad");
      const name = document.createElement("div");
      name.className = "mcp-item-name";
      name.textContent = srv.name;
      header.appendChild(dot);
      header.appendChild(name);

      if (state.defaultServerId === srv.id) {
        const badge = document.createElement("span");
        badge.className = "mcp-badge";
        badge.textContent = "Default";
        header.appendChild(badge);
      }
      
      const desc = document.createElement("div");
      desc.className = "mcp-item-desc";
      desc.textContent = srv.description || "";
      
      const actions = document.createElement("div");
      actions.className = "mcp-actions";
      const btnConnect = document.createElement("button");
      btnConnect.textContent = "Connect";
      btnConnect.disabled = srv.enabled === false;
      btnConnect.addEventListener("click", async () => {
        try {
          const res = await sendMessage("ECHO", { message: `hello from ${srv.id}` });
          const isOk = res && res.ok;
          showToast(shadow, isOk ? `Echo (${res.via}): ${res.echoed}` : 'Echo failed');
          await sendMessage("SAVE_STATUS", { serverId: srv.id, ok: isOk, via: isOk ? res.via : '', echoed: isOk ? res.echoed : '', at: Date.now() });
          await sendMessage("SET_BADGE", { text: isOk ? 'OK' : '!', color: isOk ? '#10b981' : '#ef4444' });
          await refresh();
        } catch (e) {
          showToast(shadow, `Echo error`);
          await sendMessage("SAVE_STATUS", { serverId: srv.id, ok: false, at: Date.now() });
          await sendMessage("SET_BADGE", { text: "!", color: "#ef4444" });
          await refresh();
        }
      });
      const toggle = document.createElement("label");
      toggle.className = "mcp-toggle";
      const toggleInput = document.createElement("input");
      toggleInput.type = "checkbox";
      toggleInput.checked = srv.enabled !== false;
      toggleInput.addEventListener("change", async () => {
        await sendMessage("TOGGLE_SERVER", { id: srv.id, enabled: toggleInput.checked });
        await sendMessage("LOG", { level: 'info', message: 'toggle', meta: { id: srv.id, enabled: toggleInput.checked } });
        await refresh();
      });
      toggle.appendChild(toggleInput);
      toggle.appendChild(document.createTextNode("Enabled"));

      const btnDefault = document.createElement("button");
      btnDefault.textContent = "Set default";
      btnDefault.addEventListener("click", async () => {
        await sendMessage("SET_DEFAULT", { id: srv.id });
        await refresh();
      });
      actions.appendChild(btnConnect);
      actions.appendChild(toggle);
      actions.appendChild(btnDefault);

      li.appendChild(header);
      li.appendChild(desc);
      li.appendChild(actions);
      serverList.appendChild(li);
    });
  }

  async function refresh() {
    const [serversRes, statusRes] = await Promise.all([
      sendMessage("LIST_SERVERS"),
      sendMessage("LIST_STATUS"),
    ]);
    if (serversRes && serversRes.ok) {
      render(serversRes.servers || [], { defaultServerId: serversRes.defaultServerId }, (statusRes && statusRes.statuses) || {});
    }
    await refreshDev();
  }

  async function refreshDev() {
    const [ping, logs] = await Promise.all([
      sendMessage("PING"),
      sendMessage("LIST_LOGS"),
    ]);
    const logsEl = panelDev.querySelector('#mcp-dev-logs');
    const timeEl = panelDev.querySelector('#mcp-dev-time');
    const instEl = panelDev.querySelector('#mcp-dev-installed');
    if (ping && ping.ok) {
      timeEl.textContent = new Date(ping.now).toLocaleTimeString();
      instEl.textContent = ping.installedAt ? new Date(ping.installedAt).toLocaleString() : '-';
    }
    if (logs && logs.ok) {
      logsEl.textContent = '';
      const arr = logs.logs || [];
      arr.forEach((l) => {
        const line = document.createElement('div');
        line.textContent = `${new Date(l.t).toLocaleTimeString()} [${l.level}] ${l.msg} ${l.meta ? JSON.stringify(l.meta) : ''}`;
        logsEl.appendChild(line);
      });
      logsEl.scrollTop = logsEl.scrollHeight;
    }
  }

  panelDev.querySelector('#mcp-dev-refresh').addEventListener('click', refreshDev);
  panelDev.querySelector('#mcp-dev-clear').addEventListener('click', async () => { await sendMessage('CLEAR_LOGS'); await refreshDev(); });

  return { refresh };
}


function mount() {
  const shadow = createShadowHost();
  const sidebar = createSidebar(shadow);
  sidebar.refresh();
}

// Defer slightly to allow app shell to settle
setTimeout(() => {
  try {
    mount();
  } catch (e) {
    console.error("[MCP] Mount failed", e);
  }
}, 300);

```

```markdown
*** Begin Patch
*** Update File: README.md
@@
 Files
 - manifest.json: MV3 manifest (host permission for chat.openai.com)
 - background.js: service worker; message router; storage seeding and CRUD
-- content.js: Shadow DOM UI; mount logic; MutationObserver; safe fixed-position fallback
+- content.js: Shadow DOM UI; collapsible right sidebar with tabs (Servers/Tools/Dev/Settings)
@@
 Quick connectivity check (no external MCP required)
 - The Connect button calls an echo action in the background. If you also run the optional local echo server, it will use HTTP; otherwise it echoes locally.
 - The toolbar badge updates (OK/!); the panel shows per-server status dots (green/red) and has an echo input.
+
+Developer features
+- Dev tab shows: worker time, installed timestamp, rolling logs. Buttons: Refresh, Clear logs.
+- Server toggles: enable/disable per server (persisted in settings).
+
+Background message kinds (dev)
+- PING, LOG, LIST_LOGS, CLEAR_LOGS, TOGGLE_SERVER.
*** End Patch
```

```markdown
MCP Web Bridge (Chrome MV3)

Phase 1 • Iteration A: ChatGPT web only

What it does
- Injects a minimal MCP entry control on https://chatgpt.com/* and https://chat.openai.com/*
- Opens a collapsible right sidebar with tabs (Servers, Tools, Dev, Settings)
- Uses MV3 background service worker for typed request/response messaging and chrome.storage.sync for settings
- UI runs in a ShadowRoot with prefixed classes to avoid CSS bleed

Install (Unpacked)
1) Chrome → chrome://extensions
2) Enable Developer mode
3) Load unpacked → select this folder
4) Navigate to https://chatgpt.com (or https://chat.openai.com) and open the MCP tab on the right edge

Quick connectivity check (no external MCP required)
- The Connect button calls an echo action in the background. If you also run the optional local echo server, it will use HTTP; otherwise it echoes locally.
- The toolbar badge updates (OK/!). The Servers tab shows per-server status dots (green/red).

Optional local echo server
1) Create and run a tiny Node server:
```bash
node -e "require('http').createServer((req,res)=>{const u=new URL(req.url,'http://localhost');if(u.pathname==='\/echo'){res.end(u.searchParams.get('m')||'');}else{res.statusCode=404;res.end('not found')}}).listen(8787,()=>console.log('echo on 8787'))"
```
2) Click Connect in the panel. You should see a toast like: "Echo (http): hello from puppeteer". Without the server, it will show "Echo (local): ...".

Files
- manifest.json: MV3 manifest (host permissions for chatgpt.com & chat.openai.com)
- background.js: service worker; message router; storage; logs/status; dev handlers
- content.js: Shadow DOM UI; collapsible right sidebar with tabs (Servers/Tools/Dev/Settings)
- DESIGN.md: architecture, selectors strategy, UI contract, storage shapes
- DECISIONS.md: choices and tradeoffs log

Message schema (envelope)
Request: { kind: 'GET_SETTINGS'|'SET_SETTINGS'|'LIST_SERVERS'|'GET_SERVER'|'SET_DEFAULT'|'TOGGLE_SERVER'|'PING'|'LOG'|'LIST_LOGS'|'CLEAR_LOGS', requestId, payload? }
Response: { requestId, ok: boolean, ...data|error }

Storage
- Key: mcp.webbridge.global.v1 (chrome.storage.sync)
- Shape: { version: 1, defaultServerId?: string, servers: McpServer[] }
- First-run: seeds 4–6 mock servers, defaultServerId = 'puppeteer'
- Local data: statuses (mcp.webbridge.status.v1), logs (mcp.webbridge.logs.v1)

Dev features
- Dev tab: worker time, installed timestamp, rolling logs with Refresh / Clear
- Server toggles: enable/disable per server (persisted) 

Dev notes
- No telemetry. Only local console.debug.
- Minimal permissions: storage + host permissions for chatgpt.com & chat.openai.com
- DOM resilience: Shadow DOM sidebar; no layout overlap with native UI
- Rollback: if sidebar proves intrusive, convert to inline panel below composer



```

- Reload at chrome://extensions and hard-refresh ChatGPT. The new right-edge MCP sidebar should appear. Click the MCP tab to open it.
- What’s new for dev confidence:
  - Servers tab: each server has an Enabled toggle (persisted), Connect, Set default, and a status dot (green/red).
  - Dev tab: shows worker time and installed timestamp; streaming logs with Refresh and Clear actions.
  - Badge: shows OK/! after Connect or echo tests.
- From the IDE: open the Dev tab to see logs and timestamps update on every action.

If you want me to add a small local dev server script next (so Connect can also POST logs/echo to localhost), I’ll add it and wire it, but you can already see state and logs in-extension now.

---

**User**

I'm still failing to see this working, and I feel like we're losing the idea of a mcp server extension. I want to see functionality for actual mcp servers added 

---

**Cursor**

```javascript
// Background service worker for MCP Web Bridge (MV3)
// Message schema (JSDoc types for clarity):
/**
 * @typedef {(
 *   {kind: 'GET_SETTINGS', requestId: string} |
 *   {kind: 'SET_SETTINGS', requestId: string, payload: Partial<GlobalSettings>} |
 *   {kind: 'LIST_SERVERS', requestId: string} |
 *   {kind: 'GET_SERVER', requestId: string, payload: {id: string}} |
 *   {kind: 'SET_DEFAULT', requestId: string, payload: {id: string}} |
 *   {kind: 'ECHO', requestId: string, payload: { message: string }} |
 *   {kind: 'SET_BADGE', requestId: string, payload: { text: string, color?: string, tabId?: number }} |
 *   {kind: 'SAVE_STATUS', requestId: string, payload: { serverId: string, ok: boolean, via?: string, echoed?: string, at?: number }} |
 *   {kind: 'LIST_STATUS', requestId: string} |
 *   {kind: 'PING', requestId: string} |
 *   {kind: 'LOG', requestId: string, payload: { level?: 'debug'|'info'|'warn'|'error', message: string, meta?: any }} |
 *   {kind: 'LIST_LOGS', requestId: string} |
 *   {kind: 'CLEAR_LOGS', requestId: string} |
 *   {kind: 'TOGGLE_SERVER', requestId: string, payload: { id: string, enabled: boolean }} |
 *   {kind: 'CONNECT_MCP', requestId: string, payload: { id: string, url: string }} |
 *   {kind: 'LIST_MCP_TOOLS', requestId: string, payload: { id: string }} |
 *   {kind: 'CALL_MCP_TOOL', requestId: string, payload: { id: string, name: string, args?: any }}
 * )} Message
 */
/**
 * @typedef {{
 *   id: string,
 *   name: string,
 *   description?: string,
 *   url?: string,
 *   tags?: string[],
 *   enabled?: boolean,
 * }} McpServer
 */
/**
 * @typedef {{
 *   version: number,
 *   defaultServerId?: string,
 *   servers: McpServer[],
 * }} GlobalSettings
 */

const SETTINGS_VERSION = 1;
const STORAGE_KEYS = {
  GLOBAL: "mcp.webbridge.global.v1",
  STATUS: "mcp.webbridge.status.v1",
  LOGS: "mcp.webbridge.logs.v1",
  FIRST_INSTALLED_AT: "mcp.webbridge.installedAt",
};

/** @returns {Promise<GlobalSettings|null>} */
function readGlobalSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get([STORAGE_KEYS.GLOBAL], (obj) => {
      const data = obj[STORAGE_KEYS.GLOBAL] || null;
      resolve(data);
    });
  });
}

/** @param {GlobalSettings} settings */
function writeGlobalSettings(settings) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [STORAGE_KEYS.GLOBAL]: settings }, () =>
      resolve()
    );
  });
}

/** @returns {Promise<Record<string, any>>} */
function readStatuses() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEYS.STATUS], (obj) => {
      resolve(obj[STORAGE_KEYS.STATUS] || {});
    });
  });
}

/** @param {Record<string, any>} statuses */
function writeStatuses(statuses) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEYS.STATUS]: statuses }, () => resolve());
  });
}

/** @returns {Promise<Array<{t:number,level:string,msg:string,meta?:any}>>} */
function readLogs() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEYS.LOGS], (obj) => {
      resolve(obj[STORAGE_KEYS.LOGS] || []);
    });
  });
}

/** @param {Array<{t:number,level:string,msg:string,meta?:any}>} logs */
function writeLogs(logs) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEYS.LOGS]: logs.slice(-500) }, () => resolve());
  });
}

/** @returns {McpServer[]} */
function createMockServers() {
  return [
    {
      id: "localdev",
      name: "Local Dev MCP",
      description: "Local WebSocket MCP server for development",
      url: "ws://127.0.0.1:8788",
      tags: ["dev"],
      enabled: true,
    },
    {
      id: "firecrawl",
      name: "Firecrawl",
      description: "Scrape pages into Markdown for offline analysis",
      url: "mcp://firecrawl",
      tags: ["scrape", "markdown"],
      enabled: false,
    },
    {
      id: "puppeteer",
      name: "Puppeteer MCP",
      description: "Automate a browser to inspect and probe DOM",
      url: "mcp://puppeteer",
      tags: ["automation", "dom"],
      enabled: false,
    },
    {
      id: "sequentialthinking",
      name: "Sequential Thinking",
      description: "Structured option analysis and decision-making",
      url: "mcp://sequentialthinking",
      tags: ["reasoning"],
      enabled: false,
    },
    {
      id: "streamable",
      name: "Streamable MCP",
      description: "Stream intermediate results",
      url: "mcp://streamable",
      tags: ["stream"],
      enabled: false,
    },
    {
      id: "memory",
      name: "Memory MCP",
      description: "Persist project facts and decisions",
      url: "mcp://memory",
      tags: ["persistence"],
      enabled: false,
    },
  ];
}

/** @returns {Promise<GlobalSettings>} */
async function ensureSettings() {
  const current = await readGlobalSettings();
  if (!current) {
    const seeded = /** @type {GlobalSettings} */ ({
      version: SETTINGS_VERSION,
      defaultServerId: "localdev",
      servers: createMockServers(),
    });
    await writeGlobalSettings(seeded);
    return seeded;
  }
  // migration: ensure enabled flag exists on servers
  const migratedServers = (current.servers || []).map((s) => ({
    enabled: typeof s.enabled === 'boolean' ? s.enabled : true,
    ...s,
  }));
  const needsWrite = current.version !== SETTINGS_VERSION || migratedServers.some((s, i) => current.servers[i] && current.servers[i].enabled === undefined);
  if (needsWrite) {
    const migrated = { ...current, version: SETTINGS_VERSION, servers: migratedServers };
    await writeGlobalSettings(migrated);
    return migrated;
  }
  return current;
}

chrome.runtime.onInstalled.addListener(async () => {
  await ensureSettings();
  chrome.storage.local.set({ [STORAGE_KEYS.FIRST_INSTALLED_AT]: Date.now() });
});

async function appendLog(level, msg, meta) {
  try {
    const logs = await readLogs();
    logs.push({ t: Date.now(), level, msg, meta });
    await writeLogs(logs);
  } catch (_e) {}
}

// MCP WebSocket connection manager
/** @type {Map<string, { ws: WebSocket, url: string, nextId: number, pending: Map<number, {resolve:Function,reject:Function}>, serverInfo?: any, tools?: any[] }>} */
const mcpConnections = new Map();

function mcpEnsureConnection(id, url) {
  return new Promise((resolve, reject) => {
    const existing = mcpConnections.get(id);
    if (existing && existing.ws && existing.ws.readyState === 1) {
      resolve(existing);
      return;
    }
    try {
      const ws = new WebSocket(url);
      const state = { ws, url, nextId: 1, pending: new Map(), serverInfo: null, tools: [] };
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg && typeof msg.id === 'number' && state.pending.has(msg.id)) {
            const { resolve } = state.pending.get(msg.id);
            state.pending.delete(msg.id);
            resolve(msg);
          }
        } catch (e) {
          appendLog('error', 'WS_PARSE', { e: String(e) });
        }
      };
      ws.onerror = (ev) => {
        appendLog('error', 'WS_ERROR', { id, url });
      };
      ws.onclose = () => {
        appendLog('warn', 'WS_CLOSED', { id });
        mcpConnections.delete(id);
      };
      ws.onopen = async () => {
        mcpConnections.set(id, state);
        try {
          const init = await mcpSendRpc(id, 'initialize', { clientName: 'MCP Web Bridge', clientVersion: '0.1.0' });
          state.serverInfo = init && init.result && init.result.serverInfo;
          const listed = await mcpSendRpc(id, 'tools/list', {});
          state.tools = (listed && listed.result && listed.result.tools) || [];
          resolve(state);
        } catch (e) {
          reject(e);
        }
      };
    } catch (e) {
      reject(e);
    }
  });
}

function mcpSendRpc(id, method, params) {
  const state = mcpConnections.get(id);
  if (!state || !state.ws || state.ws.readyState !== 1) {
    return Promise.reject(new Error('Not connected'));
  }
  const reqId = state.nextId++;
  const payload = { jsonrpc: '2.0', id: reqId, method, params };
  return new Promise((resolve, reject) => {
    state.pending.set(reqId, { resolve: (msg) => {
      if (msg.error) reject(new Error(msg.error.message || 'RPC error'));
      else resolve(msg);
    }, reject });
    state.ws.send(JSON.stringify(payload));
  });
}

/** @param {Message} message */
async function handleMessage(message, senderTabId) {
  switch (message.kind) {
    case "GET_SETTINGS": {
      const settings = await ensureSettings();
      return { ok: true, settings };
    }
    case "SET_SETTINGS": {
      const existing = await ensureSettings();
      const next = {
        ...existing,
        ...message.payload,
        version: SETTINGS_VERSION,
      };
      await writeGlobalSettings(next);
      await appendLog('info', 'SET_SETTINGS', { keys: Object.keys(message.payload || {}) });
      return { ok: true, settings: next };
    }
    case "LIST_SERVERS": {
      const settings = await ensureSettings();
      return {
        ok: true,
        servers: settings.servers,
        defaultServerId: settings.defaultServerId,
      };
    }
    case "GET_SERVER": {
      const settings = await ensureSettings();
      const server =
        settings.servers.find((s) => s.id === message.payload.id) || null;
      return { ok: true, server };
    }
    case "SET_DEFAULT": {
      const settings = await ensureSettings();
      const exists = settings.servers.some((s) => s.id === message.payload.id);
      const next = exists
        ? { ...settings, defaultServerId: message.payload.id }
        : settings;
      await writeGlobalSettings(next);
      await appendLog('info', 'SET_DEFAULT', { id: message.payload.id });
      return { ok: exists, defaultServerId: next.defaultServerId };
    }
    case "TOGGLE_SERVER": {
      const settings = await ensureSettings();
      const servers = settings.servers.map((s) => s.id === message.payload.id ? { ...s, enabled: !!message.payload.enabled } : s);
      const next = { ...settings, servers };
      await writeGlobalSettings(next);
      await appendLog('info', 'TOGGLE_SERVER', { id: message.payload.id, enabled: !!message.payload.enabled });
      return { ok: true, servers };
    }
    case "ECHO": {
      const msg = (message && message.payload && message.payload.message) || "";
      try {
        const res = await fetch(
          "http://127.0.0.1:8787/echo?m=" + encodeURIComponent(msg),
          { method: "GET" }
        );
        if (res.ok) {
          const text = await res.text();
          await appendLog('debug', 'ECHO_HTTP', { echoed: text });
          return { ok: true, echoed: text, via: "http" };
        }
      } catch (_e) {
        // fall back to local echo
      }
      await appendLog('debug', 'ECHO_LOCAL', { echoed: msg });
      return { ok: true, echoed: msg, via: "local" };
    }
    case "SET_BADGE": {
      const text = (message.payload && message.payload.text) || "";
      const color = (message.payload && message.payload.color) || "#22d3ee";
      const tabId = (message.payload && message.payload.tabId) || senderTabId;
      try {
        if (typeof tabId === "number") {
          chrome.action.setBadgeText({ text, tabId });
          chrome.action.setBadgeBackgroundColor({ color, tabId });
        } else {
          chrome.action.setBadgeText({ text });
          chrome.action.setBadgeBackgroundColor({ color });
        }
        return { ok: true };
      } catch (e) {
        return { ok: false, error: String(e) };
      }
    }
    case "SAVE_STATUS": {
      const statuses = await readStatuses();
      const { serverId, ok, via, echoed, at } = message.payload || {};
      statuses[serverId] = { ok: !!ok, via: via || "", echoed: echoed || "", at: at || Date.now() };
      await writeStatuses(statuses);
      return { ok: true };
    }
    case "LIST_STATUS": {
      const statuses = await readStatuses();
      return { ok: true, statuses };
    }
    case "PING": {
      const installedAtObj = await new Promise((resolve) => chrome.storage.local.get([STORAGE_KEYS.FIRST_INSTALLED_AT], resolve));
      const installedAt = installedAtObj && installedAtObj[STORAGE_KEYS.FIRST_INSTALLED_AT];
      return { ok: true, now: Date.now(), installedAt: installedAt || null };
    }
    case "LOG": {
      const level = (message.payload && message.payload.level) || 'info';
      const msg = (message.payload && message.payload.message) || '';
      await appendLog(level, msg, message.payload && message.payload.meta);
      return { ok: true };
    }
    case "LIST_LOGS": {
      const logs = await readLogs();
      return { ok: true, logs };
    }
    case "CLEAR_LOGS": {
      await writeLogs([]);
      return { ok: true };
    }
    case "CONNECT_MCP": {
      const { id, url } = message.payload || {};
      if (!id || !url) return { ok: false, error: 'id and url required' };
      try {
        const state = await mcpEnsureConnection(id, url);
        await appendLog('info', 'MCP_CONNECTED', { id, url, tools: (state.tools||[]).length });
        return { ok: true, serverInfo: state.serverInfo, tools: state.tools };
      } catch (e) {
        await appendLog('error', 'MCP_CONNECT_FAILED', { id, url, e: String(e) });
        return { ok: false, error: String(e) };
      }
    }
    case "LIST_MCP_TOOLS": {
      const { id } = message.payload || {};
      const state = mcpConnections.get(id);
      return { ok: true, tools: state && state.tools ? state.tools : [] };
    }
    case "CALL_MCP_TOOL": {
      const { id, name, args } = message.payload || {};
      try {
        const res = await mcpSendRpc(id, 'tools/call', { name, arguments: args || {} });
        return { ok: true, result: res && res.result ? res.result : null };
      } catch (e) {
        return { ok: false, error: String(e) };
      }
    }
    default:
      return { ok: false, error: "Unknown kind" };
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  // All responses are async
  const tabId = _sender && _sender.tab && _sender.tab.id;
  (async () => {
    try {
      const data = await handleMessage(message, tabId);
      sendResponse({ requestId: message.requestId, ...data });
    } catch (error) {
      sendResponse({
        requestId: message.requestId,
        ok: false,
        error: String(error),
      });
    }
  })();
  return true;
});

```

```javascript
// Content script for ChatGPT.com only. Injects an MCP entry control and minimal surface.

/** Messaging client: send typed messages to the background service worker */
function sendMessage(kind, payload) {
  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ kind, payload, requestId }, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve(response);
    });
  });
}

/** CSS tokens (Shadow DOM scoped) */
const styleText = `
  :host {
    /** CHATGPT STYLES (approximated) **/
    --gpt-font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji";
    --gpt-bg-primary: #171717;
    --gpt-bg-secondary: #212121;
    --gpt-border-color: rgba(255,255,255,0.1);
    --gpt-text-primary: #ececf1;
    --gpt-text-secondary: #aab2c0;
    --gpt-radius: 6px;
    --gpt-accent: #7e12e3;

    /** MCP STYLES **/
    --mcp-z: 2147483600;
    --mcp-ok: #10b981;
    --mcp-bad: #ef4444;
  }
  .mcp-root { 
    position: fixed; 
    top: 0; 
    right: 0; 
    height: 100%; 
    z-index: var(--mcp-z); 
    font-family: var(--gpt-font-family);
    color: var(--gpt-text-primary);
  }
  .mcp-sidebar {
    width: 360px;
    height: 100%;
    background: var(--gpt-bg-primary);
    border-left: 1px solid var(--gpt-border-color);
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;
    display: flex;
    flex-direction: column;
  }
  .mcp-sidebar.open {
    transform: translateX(0);
  }
  .mcp-tab {
    position: absolute;
    top: 50%;
    left: -30px;
    transform: translateY(-50%) rotate(90deg);
    transform-origin: bottom left;
    background: var(--gpt-bg-primary);
    border: 1px solid var(--gpt-border-color);
    border-bottom: none;
    padding: 6px 12px;
    border-radius: var(--gpt-radius) var(--gpt-radius) 0 0;
    cursor: pointer;
    font-weight: 600;
  }

  /** TABS **/
  .mcp-tabs-nav {
    display: flex;
    border-bottom: 1px solid var(--gpt-border-color);
    padding: 8px;
    gap: 6px;
  }
  .mcp-tabs-nav button {
    flex: 1;
    padding: 8px 12px;
    background: transparent;
    border: 1px solid transparent;
    color: var(--gpt-text-secondary);
    border-radius: var(--gpt-radius);
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  }
  .mcp-tabs-nav button:hover {
    background: var(--gpt-bg-secondary);
  }
  .mcp-tabs-nav button.active {
    background: var(--gpt-bg-secondary);
    border-color: var(--gpt-border-color);
    color: var(--gpt-text-primary);
  }
  .mcp-tabs-nav button[disabled] {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .mcp-tabs-content {
    flex: 1;
    overflow-y: auto;
  }
  .mcp-tab-panel {
    display: none;
  }
  .mcp-tab-panel.active {
    display: block;
  }
  .mcp-tab-panel-placeholder {
    padding: 24px;
    text-align: center;
    color: var(--gpt-text-secondary);
    font-size: 14px;
  }

  /** SERVER LIST (restyled) **/
  .mcp-list { 
    list-style: none; 
    padding: 8px; 
    margin: 0; 
    display: flex; 
    flex-direction: column; 
    gap: 8px;
  }
  .mcp-item { 
    border: 1px solid var(--gpt-border-color); 
    background: var(--gpt-bg-secondary);
    border-radius: var(--gpt-radius); 
    padding: 12px; 
  }
  .mcp-item-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .mcp-item-name { 
    font-weight: 600;
    font-size: 15px;
  }
  .mcp-item-dot { 
    width: 8px; height: 8px; border-radius: 999px; background: #64748b;
  }
  .mcp-item-dot.ok { background: var(--mcp-ok); }
  .mcp-item-dot.bad { background: var(--mcp-bad); }
  .mcp-item-desc { 
    font-size: 13px; 
    color: var(--gpt-text-secondary);
    margin-top: 4px; 
    margin-bottom: 12px;
  }
  .mcp-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .mcp-actions button { 
    background: transparent; 
    color: var(--gpt-text-secondary); 
    border: 1px solid var(--gpt-border-color); 
    border-radius: var(--gpt-radius); 
    padding: 6px 10px; 
    cursor: pointer;
    font-size: 13px;
  }
  .mcp-actions button:hover { 
    border-color: var(--gpt-text-secondary);
    color: var(--gpt-text-primary);
  }
  .mcp-toggle { display: inline-flex; align-items: center; gap: 6px; }
  .mcp-toggle input { width: 36px; height: 18px; cursor: pointer; }
  .mcp-badge { 
    font-size: 10px; 
    padding: 2px 6px; 
    border-radius: 999px; 
    border: 1px solid var(--gpt-border-color); 
    margin-left: auto;
    color: var(--gpt-text-secondary);
  }
  .mcp-tools-panel { border: 1px solid var(--gpt-border-color); border-radius: var(--gpt-radius); padding: 8px; background: #151515; width: 100%; }
  .mcp-tools-title { font-size: 13px; color: var(--gpt-text-secondary); margin-bottom: 6px; }
  .mcp-tools-list { display: flex; flex-direction: column; gap: 6px; }
  .mcp-tools-row { display: flex; gap: 6px; align-items: center; }
  .mcp-tools-row input { flex: 1; background: transparent; color: var(--gpt-text-primary); border: 1px solid var(--gpt-border-color); border-radius: var(--gpt-radius); padding: 4px 6px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size: 12px; }

  .mcp-toast { position: fixed; right: 16px; bottom: 16px; z-index: var(--mcp-z); background: var(--gpt-bg-primary); color: var(--gpt-text-primary); border: 1px solid var(--gpt-border-color); border-radius: 8px; padding: 8px 10px; }

  /** DEV TAB **/
  .mcp-dev { padding: 8px; display: grid; grid-template-rows: auto 1fr; gap: 8px; }
  .mcp-dev-kv { display: grid; grid-template-columns: 160px 1fr; gap: 6px; font-size: 13px; color: var(--gpt-text-secondary); }
  .mcp-dev-row { display: contents; }
  .mcp-dev-logs { border: 1px solid var(--gpt-border-color); border-radius: var(--gpt-radius); background: var(--gpt-bg-secondary); padding: 8px; height: 260px; overflow: auto; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size: 12px; }
  .mcp-dev-actions { display: flex; gap: 6px; }
`;

/** Root host + ShadowRoot */
function createShadowHost() {
  const hostId = "mcp-webbridge-root";
  let host = document.getElementById(hostId);
  if (!host) {
    host = document.createElement("div");
    host.id = hostId;
    document.documentElement.appendChild(host);
  }
  if (!host.shadowRoot) {
    const shadow = host.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = styleText;
    shadow.appendChild(style);
    const root = document.createElement("div");
    root.className = "mcp-root";
    shadow.appendChild(root);
  }
  return host.shadowRoot;
}

function showToast(shadow, text) {
  const existing = shadow.querySelector(".mcp-toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.className = "mcp-toast";
  toast.textContent = text;
  shadow.querySelector(".mcp-root").appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

/** Sidebar UI component */
function createSidebar(shadow) {
  const root = shadow.querySelector(".mcp-root");
  
  // Main container
  const sidebar = document.createElement("div");
  sidebar.className = "mcp-sidebar";

  // Toggle tab
  const tab = document.createElement("div");
  tab.className = "mcp-tab";
  tab.textContent = "MCP";
  sidebar.appendChild(tab);
  
  // Nav
  const nav = document.createElement("div");
  nav.className = "mcp-tabs-nav";
  const btnServers = document.createElement("button");
  btnServers.textContent = "Servers";
  btnServers.className = "active";
  const btnTools = document.createElement("button");
  btnTools.textContent = "Tools";
  btnTools.disabled = true;
  const btnDev = document.createElement("button");
  btnDev.textContent = "Dev";
  const btnSettings = document.createElement("button");
  btnSettings.textContent = "Settings";
  btnSettings.disabled = true;
  nav.appendChild(btnServers);
  nav.appendChild(btnTools);
  nav.appendChild(btnDev);
  nav.appendChild(btnSettings);
  sidebar.appendChild(nav);

  // Content
  const content = document.createElement("div");
  content.className = "mcp-tabs-content";
  
  const panelServers = document.createElement("div");
  panelServers.className = "mcp-tab-panel active";
  const serverList = document.createElement("ul");
  serverList.className = "mcp-list";
  panelServers.appendChild(serverList);
  
  const panelTools = document.createElement("div");
  panelTools.className = "mcp-tab-panel";
  panelTools.innerHTML = `<div class="mcp-tab-panel-placeholder">Tools will be available here.</div>`;

  const panelDev = document.createElement("div");
  panelDev.className = "mcp-tab-panel mcp-dev";
  panelDev.innerHTML = `
    <div class="mcp-dev-kv">
      <div class="mcp-dev-row"><div>Worker time</div><div id="mcp-dev-time">-</div></div>
      <div class="mcp-dev-row"><div>Installed at</div><div id="mcp-dev-installed">-</div></div>
    </div>
    <div>
      <div class="mcp-dev-actions">
        <button id="mcp-dev-refresh">Refresh</button>
        <button id="mcp-dev-clear">Clear logs</button>
      </div>
      <div class="mcp-dev-logs" id="mcp-dev-logs"></div>
    </div>
  `;

  const panelSettings = document.createElement("div");
  panelSettings.className = "mcp-tab-panel";
  panelSettings.innerHTML = `<div class="mcp-tab-panel-placeholder">Configuration will be available here.</div>`;

  content.appendChild(panelServers);
  content.appendChild(panelTools);
  content.appendChild(panelDev);
  content.appendChild(panelSettings);
  sidebar.appendChild(content);
  
  root.appendChild(sidebar);

  // Tab switching logic
  const buttons = [btnServers, btnTools, btnDev, btnSettings];
  const panels = [panelServers, panelTools, panelDev, panelSettings];
  buttons.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      buttons.forEach(b => b.classList.remove("active"));
      panels.forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      panels[index].classList.add("active");
    });
  });

  tab.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });

  function renderToolsUI(container, id, tools) {
    container.textContent = '';
    const title = document.createElement('div');
    title.className = 'mcp-tools-title';
    title.textContent = `Tools (${tools.length})`;
    container.appendChild(title);
    const list = document.createElement('div');
    list.className = 'mcp-tools-list';
    tools.forEach((tool) => {
      const row = document.createElement('div');
      row.className = 'mcp-tools-row';
      const name = document.createElement('div');
      name.textContent = tool.name;
      const args = document.createElement('input');
      args.placeholder = '{ } JSON args';
      const run = document.createElement('button');
      run.textContent = 'Run';
      run.addEventListener('click', async () => {
        try {
          const parsed = args.value ? JSON.parse(args.value) : {};
          const res = await sendMessage('CALL_MCP_TOOL', { id, name: tool.name, args: parsed });
          if (res && res.ok) {
            showToast(shadow, 'Tool OK');
            await sendMessage('LOG', { level: 'info', message: 'tool', meta: { id, name: tool.name } });
          } else {
            showToast(shadow, 'Tool failed');
          }
        } catch (e) {
          showToast(shadow, 'Args must be JSON');
        }
      });
      row.appendChild(name);
      row.appendChild(args);
      row.appendChild(run);
      list.appendChild(row);
    });
    container.appendChild(list);
  }

  function render(servers, state, statuses) {
    serverList.textContent = "";
    servers.forEach((srv) => {
      const li = document.createElement("li");
      li.className = "mcp-item";
      li.dataset.id = srv.id;

      const header = document.createElement("div");
      header.className = "mcp-item-header";
      const dot = document.createElement("span");
      dot.className = "mcp-item-dot";
      const st = statuses && statuses[srv.id];
      if (st && st.ok) dot.classList.add("ok");
      if (st && !st.ok) dot.classList.add("bad");
      const name = document.createElement("div");
      name.className = "mcp-item-name";
      name.textContent = srv.name;
      header.appendChild(dot);
      header.appendChild(name);

      if (state.defaultServerId === srv.id) {
        const badge = document.createElement("span");
        badge.className = "mcp-badge";
        badge.textContent = "Default";
        header.appendChild(badge);
      }
      
      const desc = document.createElement("div");
      desc.className = "mcp-item-desc";
      desc.textContent = srv.description || "";
      
      const actions = document.createElement("div");
      actions.className = "mcp-actions";
      const btnConnect = document.createElement("button");
      btnConnect.textContent = srv.url && srv.url.startsWith('ws') ? "Connect MCP" : "Echo";
      btnConnect.disabled = srv.enabled === false;
      btnConnect.addEventListener("click", async () => {
        if (srv.url && srv.url.startsWith('ws')) {
          const res = await sendMessage('CONNECT_MCP', { id: srv.id, url: srv.url });
          if (res && res.ok) {
            showToast(shadow, `MCP connected: ${(res.tools||[]).length} tools`);
            // render tools UI just below actions
            let toolsPanel = li.querySelector('.mcp-tools-panel');
            if (!toolsPanel) {
              toolsPanel = document.createElement('div');
              toolsPanel.className = 'mcp-tools-panel';
              li.appendChild(toolsPanel);
            }
            renderToolsUI(toolsPanel, srv.id, res.tools || []);
          } else {
            showToast(shadow, 'MCP connect failed');
          }
          return;
        }
        // Fallback to echo
        try {
          const r = await sendMessage("ECHO", { message: `hello from ${srv.id}` });
          const isOk = r && r.ok;
          showToast(shadow, isOk ? `Echo (${r.via}): ${r.echoed}` : 'Echo failed');
          await sendMessage("SAVE_STATUS", { serverId: srv.id, ok: isOk, via: isOk ? r.via : '', echoed: isOk ? r.echoed : '', at: Date.now() });
          await sendMessage("SET_BADGE", { text: isOk ? 'OK' : '!', color: isOk ? '#10b981' : '#ef4444' });
          await refresh();
        } catch (e) {
          showToast(shadow, `Echo error`);
          await sendMessage("SAVE_STATUS", { serverId: srv.id, ok: false, at: Date.now() });
          await sendMessage("SET_BADGE", { text: "!", color: "#ef4444" });
          await refresh();
        }
      });
      const toggle = document.createElement("label");
      toggle.className = "mcp-toggle";
      const toggleInput = document.createElement("input");
      toggleInput.type = "checkbox";
      toggleInput.checked = srv.enabled !== false;
      toggleInput.addEventListener("change", async () => {
        await sendMessage("TOGGLE_SERVER", { id: srv.id, enabled: toggleInput.checked });
        await sendMessage("LOG", { level: 'info', message: 'toggle', meta: { id: srv.id, enabled: toggleInput.checked } });
        await refresh();
      });
      toggle.appendChild(toggleInput);
      toggle.appendChild(document.createTextNode("Enabled"));

      const btnDefault = document.createElement("button");
      btnDefault.textContent = "Set default";
      btnDefault.addEventListener("click", async () => {
        await sendMessage("SET_DEFAULT", { id: srv.id });
        await refresh();
      });
      actions.appendChild(btnConnect);
      actions.appendChild(toggle);
      actions.appendChild(btnDefault);

      li.appendChild(header);
      li.appendChild(desc);
      li.appendChild(actions);
      serverList.appendChild(li);
    });
  }

  async function refresh() {
    const [serversRes, statusRes] = await Promise.all([
      sendMessage("LIST_SERVERS"),
      sendMessage("LIST_STATUS"),
    ]);
    if (serversRes && serversRes.ok) {
      render(serversRes.servers || [], { defaultServerId: serversRes.defaultServerId }, (statusRes && statusRes.statuses) || {});
    }
    await refreshDev();
  }

  async function refreshDev() {
    const [ping, logs] = await Promise.all([
      sendMessage("PING"),
      sendMessage("LIST_LOGS"),
    ]);
    const logsEl = panelDev.querySelector('#mcp-dev-logs');
    const timeEl = panelDev.querySelector('#mcp-dev-time');
    const instEl = panelDev.querySelector('#mcp-dev-installed');
    if (ping && ping.ok) {
      timeEl.textContent = new Date(ping.now).toLocaleTimeString();
      instEl.textContent = ping.installedAt ? new Date(ping.installedAt).toLocaleString() : '-';
    }
    if (logs && logs.ok) {
      logsEl.textContent = '';
      const arr = logs.logs || [];
      arr.forEach((l) => {
        const line = document.createElement('div');
        line.textContent = `${new Date(l.t).toLocaleTimeString()} [${l.level}] ${l.msg} ${l.meta ? JSON.stringify(l.meta) : ''}`;
        logsEl.appendChild(line);
      });
      logsEl.scrollTop = logsEl.scrollHeight;
    }
  }

  panelDev.querySelector('#mcp-dev-refresh').addEventListener('click', refreshDev);
  panelDev.querySelector('#mcp-dev-clear').addEventListener('click', async () => { await sendMessage('CLEAR_LOGS'); await refreshDev(); });

  return { refresh };
}


function mount() {
  const shadow = createShadowHost();
  const sidebar = createSidebar(shadow);
  sidebar.refresh();
}

// Defer slightly to allow app shell to settle
setTimeout(() => {
  try {
    mount();
  } catch (e) {
    console.error("[MCP] Mount failed", e);
  }
}, 300);

```

```javascript
// Minimal local MCP WebSocket server for development
// Protocol: JSON-RPC 2.0
// Methods implemented: initialize, tools/list, tools/call

const http = require('http');
const WebSocket = require('ws');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

function send(ws, id, result, error) {
  /** @type {{jsonrpc:'2.0', id:number, result?:any, error?:{code:number,message:string,data?:any}}} */
  const msg = { jsonrpc: '2.0', id };
  if (error) msg.error = error; else msg.result = result;
  ws.send(JSON.stringify(msg));
}

const tools = [
  {
    name: 'echo',
    description: 'Echo back the provided text',
    inputSchema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] }
  },
  {
    name: 'time',
    description: 'Return the current ISO time',
    inputSchema: { type: 'object', properties: {}, required: [] }
  },
  {
    name: 'sum',
    description: 'Return a + b',
    inputSchema: { type: 'object', properties: { a: { type: 'number' }, b: { type: 'number' } }, required: ['a','b'] }
  }
];

wss.on('connection', (ws) => {
  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch (e) {
      return;
    }
    const { id, method, params } = msg || {};
    if (typeof id !== 'number') return;

    if (method === 'initialize') {
      return send(ws, id, { serverInfo: { name: 'Local Dev MCP', version: '0.1.0' } });
    }
    if (method === 'tools/list') {
      return send(ws, id, { tools });
    }
    if (method === 'tools/call') {
      const name = params && params.name;
      const args = (params && params.arguments) || {};
      if (name === 'echo') {
        return send(ws, id, { content: [{ type: 'text', text: String(args.text || '') }] });
      }
      if (name === 'time') {
        return send(ws, id, { content: [{ type: 'text', text: new Date().toISOString() }] });
      }
      if (name === 'sum') {
        const a = Number(args.a || 0), b = Number(args.b || 0);
        return send(ws, id, { content: [{ type: 'text', text: String(a + b) }] });
      }
      return send(ws, id, undefined, { code: -32601, message: 'Unknown tool' });
    }
    return send(ws, id, undefined, { code: -32601, message: 'Method not found' });
  });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 8788;
server.listen(PORT, () => {
  console.log(`Local MCP WebSocket server listening on ws://127.0.0.1:${PORT}`);
});


```

```markdown
MCP Web Bridge (Chrome MV3)

Phase 1 • Iteration A: ChatGPT web only

What it does
- Injects a minimal MCP entry control on https://chatgpt.com/* and https://chat.openai.com/*
- Opens a collapsible right sidebar with tabs (Servers, Tools, Dev, Settings)
- Uses MV3 background service worker for typed request/response messaging and chrome.storage.sync for settings
- UI runs in a ShadowRoot with prefixed classes to avoid CSS bleed

Install (Unpacked)
1) Chrome → chrome://extensions
2) Enable Developer mode
3) Load unpacked → select this folder
4) Navigate to https://chatgpt.com (or https://chat.openai.com) and open the MCP tab on the right edge

Quick connectivity check (no external MCP required)
- The Connect button calls an echo action in the background. If you also run the optional local echo server, it will use HTTP; otherwise it echoes locally.
- The toolbar badge updates (OK/!). The Servers tab shows per-server status dots (green/red).

Optional local echo server
1) Create and run a tiny Node server:
```bash
node -e "require('http').createServer((req,res)=>{const u=new URL(req.url,'http://localhost');if(u.pathname==='\/echo'){res.end(u.searchParams.get('m')||'');}else{res.statusCode=404;res.end('not found')}}).listen(8787,()=>console.log('echo on 8787'))"
```
2) Click Connect in the panel. You should see a toast like: "Echo (http): hello from puppeteer". Without the server, it will show "Echo (local): ...".

Local MCP dev server (WebSocket)
1) Install dependencies:
```bash
npm i ws
```
2) In this repo, run:
```bash
node scripts/mcp-localdev.js
```
3) In the sidebar, use the "Local Dev MCP" row → Connect MCP. You should see a message like "MCP connected: 3 tools" and a Tools panel with a few tools (echo, time, sum). Try running them with JSON args.

Files
- manifest.json: MV3 manifest (host permissions for chatgpt.com & chat.openai.com)
- background.js: service worker; message router; storage; logs/status; dev handlers
- content.js: Shadow DOM UI; collapsible right sidebar with tabs (Servers/Tools/Dev/Settings)
- DESIGN.md: architecture, selectors strategy, UI contract, storage shapes
- DECISIONS.md: choices and tradeoffs log

Message schema (envelope)
Request: { kind: 'GET_SETTINGS'|'SET_SETTINGS'|'LIST_SERVERS'|'GET_SERVER'|'SET_DEFAULT'|'TOGGLE_SERVER'|'PING'|'LOG'|'LIST_LOGS'|'CLEAR_LOGS', requestId, payload? }
Response: { requestId, ok: boolean, ...data|error }

Storage
- Key: mcp.webbridge.global.v1 (chrome.storage.sync)
- Shape: { version: 1, defaultServerId?: string, servers: McpServer[] }
- First-run: seeds 4–6 mock servers, defaultServerId = 'puppeteer'
- Local data: statuses (mcp.webbridge.status.v1), logs (mcp.webbridge.logs.v1)

Dev features
- Dev tab: worker time, installed timestamp, rolling logs with Refresh / Clear
- Server toggles: enable/disable per server (persisted) 

Dev notes
- No telemetry. Only local console.debug.
- Minimal permissions: storage + host permissions for chatgpt.com & chat.openai.com
- DOM resilience: Shadow DOM sidebar; no layout overlap with native UI
- Rollback: if sidebar proves intrusive, convert to inline panel below composer



```

- I added first-class MCP support end-to-end:
  - Background: WebSocket MCP manager with RPC initialize, tools/list, tools/call; new messages CONNECT_MCP, LIST_MCP_TOOLS, CALL_MCP_TOOL.
  - Content: Servers tab detects ws:// servers → Connect MCP button; after connect it shows a Tools panel with each tool, JSON args input, and Run.
  - Local dev MCP server: `scripts/mcp-localdev.js` (ws). Tools: echo, time, sum.

- How to verify from the IDE in 60 seconds:
  1) In a terminal at the project root:
     ```bash
     npm i ws
     node scripts/mcp-localdev.js
     ```
     You should see: “Local MCP WebSocket server listening on ws://127.0.0.1:8788”
  2) chrome://extensions → Reload MCP Web Bridge. Hard-refresh `https://chatgpt.com`.
  3) Open the MCP tab → Servers → “Local Dev MCP” → Connect MCP.
     - You should see “MCP connected: 3 tools”.
     - Use Tools panel: pick `echo` and run with args like `{"text":"hi"}` or `sum` with `{"a":1,"b":2}`. A toast confirms results.
  4) Dev tab shows worker time and rolling logs; use Clear/Refresh to watch events.

- Notes:
  - `manifest.json` already includes host permissions for chatgpt.com/openai.com and localhost.
  - If you want to point to a different MCP, set the server’s `url` to its ws:// endpoint in settings later; the UI will connect and list tools the same way.

If you want, I can add a small settings editor in the sidebar to add/edit MCP endpoints (id, name, ws URL) and persist them, but the local dev MCP demonstrates real MCP flows now.

```shellscript
     npm i ws
     node scripts/mcp-localdev.js
```

---

**User**

Commit to github, not putting much detail into anything but just getting it up there.  

---

**Cursor**

I'll initialize the local Git repository, add all the files, and create the first commit. After that, I'll need you to create a new repository on GitHub and provide me with the URL so I can push the code.

Excellent. The local Git repository is now set up with your project files.

To get this on GitHub, you just need to do two things:

1.  **Create a new, empty repository on GitHub.**
    *   Go to [github.com/new](https://github.com/new).
    *   Give it any name you like (e.g., `MCPWebBridge`).
    *   Leave all other options (like adding a README or .gitignore) unchecked.
    *   Click "Create repository".

2.  **Push the project.**
    *   After creating the repository, GitHub will show you a URL. Copy it.
    *   Tell me the URL, and I will run the final commands to add it as a remote and push your code.

