// Shadow DOM UI + MutationObserver with fallback for M1 core
(function() {
  const styleText = `
  :host {
    --mcp-z: 2147483600;
    --gpt-font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji";
    --gpt-bg-primary: #171717;
    --gpt-bg-secondary: #212121;
    --gpt-border-color: rgba(255,255,255,0.1);
    --gpt-text-primary: #ececf1;
    --gpt-text-secondary: #aab2c0;
    --gpt-radius: 6px;
    --mcp-ok: #10b981;
    --mcp-bad: #ef4444;
  }
  .mcp-root { position: fixed; top: 0; right: 0; height: 100%; z-index: var(--mcp-z); font-family: var(--gpt-font-family); color: var(--gpt-text-primary); }
  .mcp-sidebar { width: 340px; height: 100%; background: var(--gpt-bg-primary); border-left: 1px solid var(--gpt-border-color); transform: translateX(100%); transition: transform 0.25s ease-in-out; display: flex; flex-direction: column; }
  .mcp-sidebar.open { transform: translateX(0); }
  .mcp-tab { position: absolute; top: 50%; left: -30px; transform: translateY(-50%) rotate(90deg); transform-origin: bottom left; background: var(--gpt-bg-primary); border: 1px solid var(--gpt-border-color); border-bottom: none; padding: 6px 12px; border-radius: var(--gpt-radius) var(--gpt-radius) 0 0; cursor: pointer; font-weight: 600; }
  .mcp-tabs-nav { display: flex; border-bottom: 1px solid var(--gpt-border-color); padding: 8px; gap: 6px; }
  .mcp-tabs-nav button { flex: 1; padding: 8px 12px; background: transparent; border: 1px solid transparent; color: var(--gpt-text-secondary); border-radius: var(--gpt-radius); cursor: pointer; font-size: 14px; font-weight: 500; }
  .mcp-tabs-nav button.active { background: var(--gpt-bg-secondary); border-color: var(--gpt-border-color); color: var(--gpt-text-primary); }
  .mcp-tabs-content { flex: 1; overflow-y: auto; }
  .mcp-tab-panel { display: none; }
  .mcp-tab-panel.active { display: block; }
  .mcp-list { list-style: none; padding: 8px; margin: 0; display: flex; flex-direction: column; gap: 8px; }
  .mcp-item { border: 1px solid var(--gpt-border-color); background: var(--gpt-bg-secondary); border-radius: var(--gpt-radius); padding: 12px; }
  .mcp-item-header { display: flex; align-items: center; gap: 8px; }
  .mcp-item-name { font-weight: 600; font-size: 15px; }
  .mcp-item-dot { width: 8px; height: 8px; border-radius: 999px; background: #64748b; }
  .mcp-item-dot.ok { background: var(--mcp-ok); }
  .mcp-item-dot.bad { background: var(--mcp-bad); }
  .mcp-item-dot.pending { background: #f59e0b; }
  .mcp-item-dot.off { background: #64748b; }
  .mcp-item-desc { font-size: 13px; color: var(--gpt-text-secondary); margin-top: 4px; margin-bottom: 12px; }
  .mcp-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .mcp-actions button { background: transparent; color: var(--gpt-text-secondary); border: 1px solid var(--gpt-border-color); border-radius: var(--gpt-radius); padding: 6px 10px; cursor: pointer; font-size: 13px; }
  .mcp-actions button:hover { border-color: var(--gpt-text-secondary); color: var(--gpt-text-primary); }
  .mcp-toggle { display: inline-flex; align-items: center; gap: 6px; }
  .mcp-toggle input { width: 36px; height: 18px; cursor: pointer; }
  .mcp-chip { position: fixed; z-index: var(--mcp-z); background: var(--gpt-bg-primary); color: var(--gpt-text-primary); border: 1px solid var(--gpt-border-color); border-radius: 999px; padding: 6px 10px; font-weight: 600; cursor: pointer; }
  .mcp-result-panel { margin-top: 8px; border: 1px solid var(--gpt-border-color); border-radius: var(--gpt-radius); background: #000; }
  .mcp-result-header { padding: 4px 8px; display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--gpt-text-secondary); border-bottom: 1px solid var(--gpt-border-color); }
  .mcp-result-header button { padding: 2px 6px; font-size: 11px; }
  .mcp-result-body { padding: 8px; max-height: 200px; overflow: auto; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; white-space: pre-wrap; word-break: break-all; }
  `;

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

  function createSidebar(shadow) {
    const root = shadow.querySelector('.mcp-root');
    const sidebar = document.createElement('div');
    sidebar.className = 'mcp-sidebar';
    const tab = document.createElement('div');
    tab.className = 'mcp-tab';
    tab.textContent = 'MCP';
    sidebar.appendChild(tab);

    const nav = document.createElement('div');
    nav.className = 'mcp-tabs-nav';
    const btnServers = document.createElement('button');
    btnServers.className = 'active';
    btnServers.textContent = 'Servers';
    const btnTools = document.createElement('button');
    btnTools.textContent = 'Tools';
    const btnDev = document.createElement('button');
    btnDev.textContent = 'Dev';
    nav.appendChild(btnServers);
    nav.appendChild(btnTools);
    nav.appendChild(btnDev);
    sidebar.appendChild(nav);

    const content = document.createElement('div');
    content.className = 'mcp-tabs-content';
    const panelServers = document.createElement('div');
    panelServers.className = 'mcp-tab-panel active';
    const serverList = document.createElement('ul');
    serverList.className = 'mcp-list';
    panelServers.appendChild(serverList);
    const panelTools = document.createElement('div');
    panelTools.className = 'mcp-tab-panel';
    const toolsHeader = document.createElement('div');
    toolsHeader.className = 'mcp-item-desc';
    toolsHeader.style.padding = '8px';
    toolsHeader.textContent = 'No server connected';
    const toolsContainer = document.createElement('div');
    toolsContainer.style.padding = '8px';
    panelTools.appendChild(toolsHeader);
    panelTools.appendChild(toolsContainer);
    const panelDev = document.createElement('div');
    panelDev.className = 'mcp-tab-panel';
    const devContainer = document.createElement('div');
    devContainer.style.padding = '8px';
    panelDev.appendChild(devContainer);
    content.appendChild(panelServers);
    content.appendChild(panelTools);
    content.appendChild(panelDev);
    sidebar.appendChild(content);

    root.appendChild(sidebar);

    tab.addEventListener('click', () => sidebar.classList.toggle('open'));

    function switchTab(btn) {
      [btnServers, btnTools, btnDev].forEach(b => b.classList.remove('active'));
      [panelServers, panelTools, panelDev].forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      if (btn === btnServers) panelServers.classList.add('active');
      else if (btn === btnTools) panelTools.classList.add('active');
      else panelDev.classList.add('active');
    }
    btnServers.addEventListener('click', () => switchTab(btnServers));
    btnTools.addEventListener('click', () => switchTab(btnTools));
    btnDev.addEventListener('click', () => { refreshDev(); switchTab(btnDev); });

    let currentServer = null;
    async function refresh() {
      try {
        const [serverRes, statusRes] = await Promise.all([
          window.MCPBus.sendMessage('LIST_SERVERS'),
          window.MCPBus.sendMessage('LIST_STATUS'),
        ]);
        const statuses = (statusRes && statusRes.ok && statusRes.data && statusRes.data.statuses) || {};

        serverList.textContent = '';
        if (serverRes && serverRes.ok && serverRes.data) {
          (serverRes.data.servers || []).forEach((srv) => {
            const li = document.createElement('li');
            li.className = 'mcp-item';

            const header = document.createElement('div');
            header.className = 'mcp-item-header';

            const dot = document.createElement('span');
            dot.className = 'mcp-item-dot';
            const status = statuses[srv.id];
            if (srv.enabled === false) { dot.classList.add('off'); }
            else if (status && status.status === 'connected') { dot.classList.add('ok'); }
            else if (status && status.status === 'error') { dot.classList.add('bad'); }
            else if (status && status.status === 'connecting') { dot.classList.add('pending'); }
            else { dot.classList.add('off'); }
            header.appendChild(dot);

            const name = document.createElement('div');
            name.className = 'mcp-item-name';
            name.textContent = srv.name;
            header.appendChild(name);

            const desc = document.createElement('div');
            desc.className = 'mcp-item-desc';
            desc.textContent = srv.description || '';
            const actions = document.createElement('div');
            actions.className = 'mcp-actions';
            const toggle = document.createElement('label');
            toggle.className = 'mcp-toggle';
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = srv.enabled !== false;
            input.addEventListener('change', async () => {
              await window.MCPBus.sendMessage('TOGGLE_SERVER', { id: srv.id, enabled: input.checked });
              await refresh();
            });
            toggle.appendChild(input);
            toggle.appendChild(document.createTextNode('Enabled'));
            const btnConnect = document.createElement('button');
            btnConnect.textContent = 'Connect';
            btnConnect.disabled = !(srv.url && srv.url.startsWith('ws'));
            btnConnect.addEventListener('click', async () => {
              // Immediately show pending state
              try { await window.MCPBus.sendMessage('SAVE_STATUS', { serverId: srv.id, status: { status: 'connecting', connected: false } }); } catch(_e) {}
              const r = await window.MCPBus.sendMessage('CONNECT_MCP', { serverId: srv.id });
              if (r && r.ok) {
                currentServer = srv;
                const tools = r.data && (r.data.tools || []);
                await renderTools(srv, tools);
                switchTab(btnTools);
              }
              await refresh();
            });
            const btnDefault = document.createElement('button');
            btnDefault.textContent = 'Set default';
            btnDefault.addEventListener('click', async () => {
              await window.MCPBus.sendMessage('SET_DEFAULT', { id: srv.id });
              await refresh();
            });
            actions.appendChild(toggle);
            actions.appendChild(btnConnect);
            actions.appendChild(btnDefault);
            li.appendChild(header);
            li.appendChild(desc);
            li.appendChild(actions);
            serverList.appendChild(li);
          });
        }
      } catch (e) {
        // silent for M1
      }
    }

    async function renderTools(server, tools) {
      toolsHeader.textContent = `Tools for "${server.name}"`;
      toolsContainer.textContent = '';
      const list = document.createElement('div');
      list.style.display = 'flex';
      list.style.flexDirection = 'column';
      list.style.gap = '8px';
      (tools || []).forEach((tool) => {
        const card = document.createElement('div');
        card.className = 'mcp-item';
        const title = document.createElement('div');
        title.className = 'mcp-item-name';
        title.textContent = tool.name;
        const desc = document.createElement('div');
        desc.className = 'mcp-item-desc';
        desc.textContent = tool.description || '';
        const row = document.createElement('div');
        row.className = 'mcp-actions';
        const input = document.createElement('textarea');
        input.placeholder = '{ }';
        input.style.width = '100%';
        input.style.height = '64px';
        input.style.background = 'transparent';
        input.style.color = 'inherit';
        input.style.border = '1px solid var(--gpt-border-color)';
        input.style.borderRadius = '6px';
        const run = document.createElement('button');
        run.textContent = 'Run';
        run.addEventListener('click', async () => {
          let args = {};
          try { args = input.value ? JSON.parse(input.value) : {}; } catch (e) { 
            renderResultPanel({ error: 'Invalid JSON arguments' });
            return;
          }
          const r = await window.MCPBus.sendMessage('CALL_MCP_TOOL', { serverId: server.id, tool: tool.name, args });
          renderResultPanel(r);
          await refresh();
        });
        row.appendChild(run);
        card.appendChild(title);
        card.appendChild(desc);
        card.appendChild(input);
        card.appendChild(row);
        list.appendChild(card);
      });
      toolsContainer.appendChild(list);

      const resultPanel = document.createElement('div');
      resultPanel.className = 'mcp-result-panel';
      resultPanel.style.display = 'none';
      const resultHeader = document.createElement('div');
      resultHeader.className = 'mcp-result-header';
      const resultTitle = document.createElement('span');
      resultTitle.textContent = 'Result';
      const copyBtn = document.createElement('button');
      copyBtn.textContent = 'Copy';
      const resultBody = document.createElement('pre');
      resultBody.className = 'mcp-result-body';
      copyBtn.addEventListener('click', () => navigator.clipboard.writeText(resultBody.textContent));

      resultHeader.appendChild(resultTitle);
      resultHeader.appendChild(copyBtn);
      resultPanel.appendChild(resultHeader);
      resultPanel.appendChild(resultBody);
      toolsContainer.appendChild(resultPanel);

      function renderResultPanel(r) {
        resultPanel.style.display = 'block';
        if (r && r.ok) {
          const payload = (r.data !== undefined ? r.data : r.result);
          let display = null;
          if (payload && payload.content && Array.isArray(payload.content) && payload.content.length === 1) {
            const first = payload.content[0];
            if (first && typeof first.text === 'string') display = first.text;
          }
          resultBody.textContent = display != null ? String(display) : JSON.stringify(payload, null, 2);
        } else {
          resultBody.textContent = r && r.error ? r.error : 'Unknown Error';
        }
      }
    }

    async function refreshDev() {
      try {
        devContainer.textContent = '';
        const hdr = document.createElement('div');
        hdr.className = 'mcp-item-desc';
        hdr.textContent = 'Logs (most recent first)';
        devContainer.appendChild(hdr);
        const actions = document.createElement('div');
        actions.className = 'mcp-actions';
        const clearBtn = document.createElement('button');
        clearBtn.textContent = 'Clear logs';
        clearBtn.addEventListener('click', async () => { await window.MCPBus.sendMessage('CLEAR_LOGS'); await refreshDev(); });
        const clearBadgeBtn = document.createElement('button');
        clearBadgeBtn.textContent = 'Clear badge';
        clearBadgeBtn.addEventListener('click', async () => { await window.MCPBus.sendMessage('SET_BADGE', { text: '' }); });
        const reconnectBtn = document.createElement('button');
        reconnectBtn.textContent = 'Reconnect';
        reconnectBtn.disabled = !currentServer;
        reconnectBtn.addEventListener('click', async () => { if (currentServer) { await window.MCPBus.sendMessage('CONNECT_MCP', { serverId: currentServer.id }); await refresh(); await refreshDev(); }});
        const listToolsBtn = document.createElement('button');
        listToolsBtn.textContent = 'List tools';
        listToolsBtn.disabled = !currentServer;
        listToolsBtn.addEventListener('click', async () => { if (currentServer) { const r = await window.MCPBus.sendMessage('LIST_MCP_TOOLS', { serverId: currentServer.id }); await renderTools(currentServer, (r && r.data && r.data.tools) || []); switchTab(btnTools); }});
        const smokeBtn = document.createElement('button');
        smokeBtn.textContent = 'Smoke test';
        smokeBtn.disabled = !currentServer;
        smokeBtn.addEventListener('click', async () => {
          if (!currentServer) return;
          const list = await window.MCPBus.sendMessage('LIST_MCP_TOOLS', { serverId: currentServer.id });
          const tools = (list && list.data && list.data.tools) || [];
          const hasEcho = tools.some(t => t.name === 'echo');
          if (hasEcho) {
            await window.MCPBus.sendMessage('CALL_MCP_TOOL', { serverId: currentServer.id, tool: 'echo', args: { text: 'test' } });
          }
          await refresh();
          await refreshDev();
        });
        actions.appendChild(clearBtn);
        actions.appendChild(reconnectBtn);
        actions.appendChild(listToolsBtn);
        actions.appendChild(smokeBtn);
        actions.appendChild(clearBadgeBtn);
        devContainer.appendChild(actions);

        const res = await window.MCPBus.sendMessage('LIST_LOGS');
        const logs = (res && res.ok && res.data && res.data.logs) ? res.data.logs.slice().reverse() : [];
        const ul = document.createElement('ul');
        ul.className = 'mcp-list';
        logs.forEach((entry) => {
          const li = document.createElement('li');
          li.className = 'mcp-item';
          const header = document.createElement('div');
          header.className = 'mcp-item-header';
          const dot = document.createElement('span');
          dot.className = 'mcp-item-dot';
          if (entry.level === 'error') dot.classList.add('bad');
          else if (entry.level === 'warn') dot.classList.add('pending');
          else dot.classList.add('off');
          const name = document.createElement('div');
          name.className = 'mcp-item-name';
          const ts = new Date(entry.t).toLocaleTimeString();
          name.textContent = `[${ts}] ${entry.level}`;
          header.appendChild(dot);
          header.appendChild(name);
          const body = document.createElement('div');
          body.className = 'mcp-item-desc';
          body.textContent = entry.msg + (entry.meta ? ` ${JSON.stringify(entry.meta)}` : '');
          li.appendChild(header);
          li.appendChild(body);
          ul.appendChild(li);
        });
        devContainer.appendChild(ul);
      } catch (_e) {}
    }

    return { refresh, sidebar };
  }

  function placeChip(shadow, sidebar) {
    let chip = shadow.querySelector('.mcp-chip');
    if (!chip) {
      chip = document.createElement('div');
      chip.className = 'mcp-chip';
      chip.textContent = 'MCP';
      shadow.querySelector('.mcp-root').appendChild(chip);
      chip.addEventListener('click', () => sidebar.classList.toggle('open'));
    }

    function anchorToComposer() {
      const composer = document.querySelector('form[data-type="unified-composer"]');
      if (composer) {
        const rect = composer.getBoundingClientRect();
        const top = Math.max(0, rect.top - 40);
        const left = Math.min(window.innerWidth - 64, rect.right - 56);
        chip.style.top = `${Math.round(top)}px`;
        chip.style.left = `${Math.round(left)}px`;
        chip.style.bottom = '';
        chip.style.right = '';
        return true;
      }
      return false;
    }

    function placeFallback() {
      chip.style.top = '';
      chip.style.left = '';
      chip.style.right = '16px';
      chip.style.bottom = '16px';
    }

    const ok = anchorToComposer();
    if (!ok) placeFallback();

    // Observe SPA changes and window resize
    const obs = new MutationObserver(() => {
      if (!anchorToComposer()) placeFallback();
    });
    obs.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', () => {
      if (!anchorToComposer()) placeFallback();
    });
  }

  function mount() {
    const shadow = createShadowHost();
    const { refresh, sidebar } = createSidebar(shadow);
    placeChip(shadow, sidebar);
    refresh();
  }

  window.MCPMount = { mount };
})();


