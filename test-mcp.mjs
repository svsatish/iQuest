import { createConnection } from '@playwright/mcp';
import { ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const contextWithManagedLifecycle = {
    close: async () => {},
    newPage: async () => ({}),
    contexts: () => [{}],
    browser: () => ({ close: async () => {} })
};

const mcpServer = await createConnection(
    {
        browser: {
            browserName: 'chromium',
            isolated: true,
            launchOptions: {},
            contextOptions: {},
        },
        capabilities: [],
        console: { level: 'error' },
        network: {},
        server: {},
        saveSession: true,
        imageResponses: 'allow',
        testIdAttribute: 'data-testid',
        timeouts: { action: 5000, navigation: 60000 },
    },
    () => Promise.resolve(contextWithManagedLifecycle)
);

// Check registered handlers
console.log('Request handlers:', Object.keys(mcpServer._requestHandlers));

// Call the list tools handler
const handler = mcpServer._requestHandlers.get(ListToolsRequestSchema.shape.method.value);
if (handler) {
    const result = await handler({ method: 'tools/list', params: {} });
    console.log('Tools:', JSON.stringify(result.tools.map(t => t.name), null, 2));
} else {
    console.log('No handler for tools/list');
}
