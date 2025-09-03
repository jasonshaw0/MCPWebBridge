# Development Guide

## Prerequisites

- Node.js 16+ 
- Chrome browser
- Git

## Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo-url>
   cd mcp-web-bridge
   npm install
   ```

2. **Load extension in Chrome:**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select this project folder

3. **Start local MCP server:**
   ```bash
   npm run dev
   # or with custom port
   npm run dev:port
   ```

## Development Workflow

### Testing the Extension

1. Navigate to `https://chatgpt.com` or `https://chat.openai.com`
2. Look for the "MCP" tab on the right edge of the screen
3. Click to open the sidebar
4. Test server connections and tool execution

### Making Changes

- **Background script**: Edit `background.js` and reload extension
- **Content script**: Edit `content.js` and reload extension + refresh page
- **Manifest**: Edit `manifest.json` and reload extension
- **Local server**: Edit `scripts/mcp-localdev.js` and restart server

### Debugging

- **Background script**: Use "Inspect views" in chrome://extensions
- **Content script**: Use DevTools on the ChatGPT page
- **MCP connections**: Check the Dev tab in the extension sidebar
- **Logs**: View logs in the Dev tab or background script console

## Project Structure

```
├── manifest.json          # Extension configuration
├── background.js          # Service worker (MCP management)
├── content.js            # Content script (UI)
├── scripts/
│   └── mcp-localdev.js   # Local MCP WebSocket server
├── docs/                 # Documentation
├── .cursorrules          # AI assistant guidelines
└── package.json          # Dependencies and scripts
```

## MCP Protocol

The extension implements JSON-RPC 2.0 over WebSocket:

- `initialize`: Handshake with MCP server
- `tools/list`: Get available tools
- `tools/call`: Execute a tool with parameters

## Adding New Features

1. **New message types**: Add to background.js message handler
2. **New UI elements**: Add to content.js sidebar
3. **New MCP tools**: Extend the local dev server
4. **New storage**: Use appropriate chrome.storage API

## Building for Distribution

Currently no build step needed - the extension runs as-is. For distribution:

1. Zip the project files (excluding node_modules, .git, etc.)
2. Upload to Chrome Web Store or distribute manually
3. Consider adding a build script for minification if needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes following the coding guidelines
4. Test thoroughly
5. Submit a pull request
