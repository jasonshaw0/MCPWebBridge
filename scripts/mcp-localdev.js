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


