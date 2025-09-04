## MCP Web Bridge
Simplifying using model context protocol on AI websites such as chatgpt.com  

See structured documentation: [docs/INDEX.md](./docs/INDEX.md)

### Quickstart (M1)

#### Setup
1. **Load the extension unpacked**
   - Open `chrome://extensions` in Chrome
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked" and select this repository root folder
   - Verify the extension appears with name "MCP Web Bridge"

2. **Check permissions**
   - Click "Details" on the extension
   - Verify only "storage" permission and host permission for `https://chatgpt.com/*`
   - No other permissions should be requested

#### Testing on ChatGPT.com
1. **Navigate to ChatGPT**
   - Open `https://chatgpt.com/` in a new tab
   - Wait for the page to fully load (you should see the chat interface)

2. **Locate the MCP chip**
   - Look for a small "MCP" chip near the message composer (bottom of screen)
   - If not visible near composer, check bottom-right corner (fallback position)
   - The chip should be styled to match ChatGPT's dark theme

3. **Open the sidebar**
   - Click the "MCP" chip
   - A sidebar should slide in from the right
   - Verify it doesn't overlap with ChatGPT's main interface

4. **Test Servers tab**
   - You should see one server: "Local Echo" (disabled by default)
   - **Toggle test**: Click the "Enabled" checkbox
     - Should toggle on/off
     - No visual feedback required (M1 is core only)
   - **Set default test**: Click "Set default" button
     - Should set this as the default server
     - No visual indicator required (M1 is core only)

#### Verify Background Functionality
1. **Open Service Worker console**
   - Go back to `chrome://extensions`
   - Find "MCP Web Bridge" extension
   - Click "Service Worker" link (opens DevTools)
   - Look for the Console tab

2. **Check logs**
   - In the Service Worker console, you should see log entries when you:
     - Toggle the server enabled/disabled
     - Set a server as default
   - Log entries should look like: `[info] TOGGLE_SERVER { id: "local-echo", enabled: true }`

3. **Verify storage**
   - In Service Worker console, run: `chrome.storage.sync.get(null, console.log)`
   - Should show settings with `version: 1` and one server
   - Run: `chrome.storage.local.get(null, console.log)`
   - Should show logs array (bounded to ~500 entries)

#### Test Edge Cases
1. **SPA navigation**
   - Navigate between different ChatGPT pages (e.g., New Chat, History)
   - The MCP chip should remain visible and functional
   - If composer disappears, chip should move to fallback position

2. **Window resize**
   - Resize browser window
   - MCP chip should reposition appropriately
   - Sidebar should remain functional

3. **Page refresh**
   - Refresh the ChatGPT page
   - MCP chip should reappear and be functional
   - Settings should persist (stored in sync storage)

#### Expected Behavior (M1 Core)
- ✅ Shadow DOM UI with no style leaks
- ✅ MutationObserver handles SPA changes
- ✅ Fixed fallback chip if composer not found
- ✅ Background message router handles all requests
- ✅ Storage: sync for settings, local for logs (bounded)
- ✅ No network calls from content script
- ✅ No DOM manipulation from background
- ✅ Minimal permissions (storage + chatgpt.com only)
- ✅ One seeded server: "Local Echo" (disabled)

#### Troubleshooting
- **Chip not visible**: Check if page is fully loaded; look in bottom-right corner
- **Sidebar not opening**: Check Service Worker console for errors
- **No logs appearing**: Verify Service Worker is running; check storage permissions
- **Settings not persisting**: Check sync storage quota; verify extension permissions

#### What's NOT in M1
- ❌ No MCP network connections
- ❌ No tool calling
- ❌ No third-party server integrations
- ❌ No Dev tab functionality
- ❌ No Settings tab functionality

These features will be added in subsequent milestones.