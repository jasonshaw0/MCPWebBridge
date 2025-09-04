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
  .mcp-item-desc { font-size: 13px; color: var(--gpt-text-secondary); margin-top: 4px; margin-bottom: 12px; }
  .mcp-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .mcp-actions button { background: transparent; color: var(--gpt-text-secondary); border: 1px solid var(--gpt-border-color); border-radius: var(--gpt-radius); padding: 6px 10px; cursor: pointer; font-size: 13px; }
  .mcp-actions button:hover { border-color: var(--gpt-text-secondary); color: var(--gpt-text-primary); }
  .mcp-toggle { display: inline-flex; align-items: center; gap: 6px; }
  .mcp-toggle input { width: 36px; height: 18px; cursor: pointer; }
  .mcp-chip { position: fixed; z-index: var(--mcp-z); background: var(--gpt-bg-primary); color: var(--gpt-text-primary); border: 1px solid var(--gpt-border-color); border-radius: 999px; padding: 6px 10px; font-weight: 600; cursor: pointer; }
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
    nav.appendChild(btnServers);
    sidebar.appendChild(nav);

    const content = document.createElement('div');
    content.className = 'mcp-tabs-content';
    const panelServers = document.createElement('div');
    panelServers.className = 'mcp-tab-panel active';
    const serverList = document.createElement('ul');
    serverList.className = 'mcp-list';
    panelServers.appendChild(serverList);
    content.appendChild(panelServers);
    sidebar.appendChild(content);

    root.appendChild(sidebar);

    tab.addEventListener('click', () => sidebar.classList.toggle('open'));

    async function refresh() {
      try {
        const res = await window.MCPBus.sendMessage('LIST_SERVERS');
        serverList.textContent = '';
        if (res && res.ok) {
          (res.servers || []).forEach((srv) => {
            const li = document.createElement('li');
            li.className = 'mcp-item';
            const header = document.createElement('div');
            header.className = 'mcp-item-header';
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
            const btnDefault = document.createElement('button');
            btnDefault.textContent = 'Set default';
            btnDefault.addEventListener('click', async () => {
              await window.MCPBus.sendMessage('SET_DEFAULT', { id: srv.id });
              await refresh();
            });
            actions.appendChild(toggle);
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


