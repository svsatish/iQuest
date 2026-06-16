import { createMcpHttpServer } from './src/agent/createMcpServer.js';
import { chromium } from '@playwright/test';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

// Use browserContext (context) not page
const { url, cleanup } = await createMcpHttpServer(context);
console.log('MCP Server URL:', url);

// Use MCP SDK client
const transport = new StreamableHTTPClientTransport(new URL(url));
const client = new Client({ name: 'test', version: '1.0.0' });
await client.connect(transport);

const tools = await client.listTools();
console.log('Tools:', JSON.stringify(tools.tools.map(t => t.name), null, 2));

await client.close();
await cleanup();
await browser.close();
