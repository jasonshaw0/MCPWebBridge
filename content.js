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
