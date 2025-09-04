# API Reference

## Extension Messaging

The extension uses Chrome's message passing API for communication between content scripts and the background service worker.

### Message Format

All messages follow this format:
```typescript
{
  kind: string,           // Message type identifier
  requestId: string,      // Unique request identifier
  payload?: any           // Optional message data
}
```

### Response Format

All responses include:
```typescript
{
  requestId: string,      // Echo of the request ID
  ok: boolean,            // Success indicator
  data?: any,             // Response data on success
  error?: string          // Error message on failure
}
```

## Message Types

### Settings Management

#### GET_SETTINGS
Retrieves current extension settings.

**Request:**
```typescript
{ kind: 'GET_SETTINGS', requestId: string }
```

**Response:**
```typescript
{
  ok: true,
  settings: {
    version: number,
    defaultServerId?: string,
    servers: McpServer[]
  }
}
```

#### SET_SETTINGS
Updates extension settings.

**Request:**
```typescript
{ 
  kind: 'SET_SETTINGS', 
  requestId: string, 
  payload: Partial<GlobalSettings> 
}
```

#### LIST_SERVERS
Lists all configured MCP servers.

**Request:**
```typescript
{ kind: 'LIST_SERVERS', requestId: string }
```

**Response:**
```typescript
{
  ok: true,
  servers: McpServer[],
  defaultServerId?: string
}
```

### Server Management

#### TOGGLE_SERVER
Enables or disables a server.

**Request:**
```typescript
{ 
  kind: 'TOGGLE_SERVER', 
  requestId: string, 
  payload: { id: string, enabled: boolean } 
}
```

#### SET_DEFAULT
Sets a server as the default.

**Request:**
```typescript
{ 
  kind: 'SET_DEFAULT', 
  requestId: string, 
  payload: { id: string } 
}
```

### MCP Operations

#### CONNECT_MCP
Establishes WebSocket connection to an MCP server.

**Request:**
```typescript
{ 
  kind: 'CONNECT_MCP', 
  requestId: string, 
  payload: { id: string, url: string } 
}
```

**Response:**
```typescript
{
  ok: true,
  serverInfo: { name: string, version: string },
  tools: Tool[]
}
```

#### LIST_MCP_TOOLS
Lists tools available from a connected MCP server.

**Request:**
```typescript
{ 
  kind: 'LIST_MCP_TOOLS', 
  requestId: string, 
  payload: { id: string } 
}
```

#### CALL_MCP_TOOL
Executes a tool on an MCP server.

**Request:**
```typescript
{ 
  kind: 'CALL_MCP_TOOL', 
  requestId: string, 
  payload: { id: string, name: string, args?: any } 
}
```

### Development & Debugging

#### PING
Health check for the background service worker.

**Request:**
```typescript
{ kind: 'PING', requestId: string }
```

**Response:**
```typescript
{
  ok: true,
  now: number,
  installedAt?: number
}
```

#### LOG
Adds a log entry.

**Request:**
```typescript
{ 
  kind: 'LOG', 
  requestId: string, 
  payload: { 
    level?: 'debug'|'info'|'warn'|'error', 
    message: string, 
    meta?: any 
  } 
}
```

#### LIST_LOGS
Retrieves stored log entries.

**Request:**
```typescript
{ kind: 'LIST_LOGS', requestId: string }
```

#### CLEAR_LOGS
Clears all stored log entries.

**Request:**
```typescript
{ kind: 'CLEAR_LOGS', requestId: string }
```

### Utility

#### ECHO
Tests connectivity with optional local HTTP server.

**Request:**
```typescript
{ 
  kind: 'ECHO', 
  requestId: string, 
  payload: { message: string } 
}
```

**Response:**
```typescript
{
  ok: true,
  echoed: string,
  via: 'http' | 'local'
}
```

#### SET_BADGE
Updates the extension's toolbar badge.

**Request:**
```typescript
{ 
  kind: 'SET_BADGE', 
  requestId: string, 
  payload: { 
    text: string, 
    color?: string, 
    tabId?: number 
  } 
}
```

## Data Types

### McpServer
```typescript
{
  id: string,
  name: string,
  description?: string,
  url?: string,
  tags?: string[],
  enabled?: boolean
}
```

### Tool
```typescript
{
  name: string,
  description: string,
  inputSchema: {
    type: string,
    properties: Record<string, any>,
    required: string[]
  }
}
```

### GlobalSettings
```typescript
{
  version: number,
  defaultServerId?: string,
  servers: McpServer[]
}
```

## MCP Protocol

The extension implements the Model Context Protocol over WebSocket using JSON-RPC 2.0.

### Connection Flow

1. **WebSocket Connection**: Establishes connection to MCP server
2. **Initialize**: Sends client information and receives server info
3. **Tools List**: Retrieves available tools from server
4. **Tool Execution**: Calls tools with parameters and receives results

### JSON-RPC Methods

- `initialize`: Client-server handshake
- `tools/list`: Retrieve available tools
- `tools/call`: Execute a specific tool

### Error Handling

- WebSocket connection failures
- MCP protocol errors
- Tool execution failures
- Invalid parameters

All errors are logged and displayed to the user via toast notifications.
