import { createConnection } from '@playwright/mcp';
import { randomUUID } from 'crypto';
import http from 'http';
import { isDeepStrictEqual } from 'node:util';
import { sessionManager } from './SessionManager.js';

const API_TOOL_NAMES = {
    request: 'api_request',
    status: 'api_assert_status',
    header: 'api_assert_header',
    bodyContains: 'api_assert_body_contains',
    jsonField: 'api_assert_json_field',
};

function buildApiState(apiContext) {
    const existing = sessionManager.getApiState(apiContext);
    if (existing) {
        existing.lastRequest ??= null;
        existing.lastResponse ??= null;
        existing.history ??= [];
        return existing;
    }

    const created = {
        lastRequest: null,
        lastResponse: null,
        history: [],
    };
    sessionManager.setApiState(apiContext, created);
    return created;
}

function resolveUrl(inputUrl, baseUrl) {
    try {
        return new URL(inputUrl).toString();
    } catch {
        if (!baseUrl) {
            throw new Error(`Relative URL "${inputUrl}" requires BASE_URL or an explicit absolute URL`);
        }
        return new URL(inputUrl, baseUrl).toString();
    }
}

function normalizeHeaders(headers = {}) {
    return Object.fromEntries(
        Object.entries(headers).map(([key, value]) => [key.toLowerCase(), String(value)])
    );
}

function toRequestBody(body, headers) {
    if (body === undefined || body === null) return undefined;
    if (typeof body === 'string' || body instanceof Uint8Array) return body;

    const normalizedHeaders = normalizeHeaders(headers);
    if (!normalizedHeaders['content-type']) {
        headers['content-type'] = 'application/json';
    }
    return JSON.stringify(body);
}

function readJsonPath(value, path) {
    if (!path || path === '.') return value;

    const parts = String(path).replace(/^\./, '').split('.').filter(Boolean);
    let current = value;

    for (const part of parts) {
        if (current == null) return undefined;
        const indexMatch = part.match(/^(\w+)\[(\d+)\]$/);
        if (indexMatch) {
            current = current[indexMatch[1]];
            current = current?.[Number(indexMatch[2])];
            continue;
        }
        current = current[part];
    }

    return current;
}

function summarizeResponse(response) {
    const bodyText = response.bodyText ?? '';
    const excerpt = bodyText.length > 4000 ? `${bodyText.slice(0, 4000)}…` : bodyText;
    const jsonText = response.json !== undefined ? JSON.stringify(response.json, null, 2) : '';
    const jsonExcerpt = jsonText.length > 4000 ? `${jsonText.slice(0, 4000)}…` : jsonText;

    return [
        `### Response`,
        `- Status: ${response.status} ${response.statusText}`,
        `- URL: ${response.url}`,
        `- Body type: ${response.bodyType}`,
        response.json !== undefined ? `- JSON: ${jsonExcerpt}` : `- Body: ${excerpt || '(empty)'}`,
    ].join('\n');
}

function toolError(message) {
    return {
        content: [{ type: 'text', text: `### Error\n${message}` }],
        isError: true,
    };
}

async function requestTool(args, state, baseUrl) {
    const method = String(args.method || 'GET').toUpperCase();
    const resolved = new URL(resolveUrl(String(args.url), baseUrl));
    for (const [key, value] of Object.entries(args.query ?? {})) {
        if (Array.isArray(value)) {
            value.forEach((item) => resolved.searchParams.append(key, String(item)));
        } else if (value !== undefined && value !== null) {
            resolved.searchParams.set(key, String(value));
        }
    }
    const resolvedUrl = resolved.toString();
    const headers = { ...(args.headers ?? {}) };
    const requestInit = {
        method,
        headers,
    };

    const body = toRequestBody(args.body, headers);
    if (body !== undefined && method !== 'GET' && method !== 'HEAD') {
        requestInit.body = body;
    }

    const timeoutMs = Number(args.timeoutMs ?? 30000);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(new Error(`Request timed out after ${timeoutMs}ms`)), timeoutMs);
    requestInit.signal = controller.signal;

    let response;
    try {
        response = await fetch(resolvedUrl, requestInit);
    } catch (error) {
        clearTimeout(timeout);
        throw new Error(`Request failed: ${error.message}`);
    } finally {
        clearTimeout(timeout);
    }

    const responseHeaders = Object.fromEntries(response.headers.entries());
    const bodyText = await response.text();
    let json;
    let bodyType = 'text';
    try {
        json = bodyText ? JSON.parse(bodyText) : undefined;
        bodyType = json === undefined ? 'text' : 'json';
    } catch {
        json = undefined;
    }

    const result = {
        url: resolvedUrl,
        method,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: responseHeaders,
        bodyText,
        bodyType,
        json,
    };

    state.lastRequest = {
        url: resolvedUrl,
        method,
        headers,
        body: args.body ?? null,
        timestamp: new Date().toISOString(),
    };
    state.lastResponse = result;
    state.history.push({ request: state.lastRequest, response: result });

    return {
        content: [{ type: 'text', text: summarizeResponse(result) }],
    };
}

function requireLastResponse(state) {
    if (!state.lastResponse) {
        throw new Error('No API response is available yet. Call api_request first.');
    }
    return state.lastResponse;
}

function assertStatus(args, state) {
    const response = requireLastResponse(state);
    const expected = Number(args.expected);
    if (response.status !== expected) {
        throw new Error(`Expected status ${expected}, got ${response.status}`);
    }
    return `Status matched: ${response.status}`;
}

function assertHeader(args, state) {
    const response = requireLastResponse(state);
    const name = String(args.name || '').toLowerCase();
    if (!name) {
        throw new Error('Header name is required');
    }
    const expected = String(args.expected ?? '');
    const actual = response.headers[name];
    if (actual === undefined) {
        throw new Error(`Expected header "${name}" to be present`);
    }
    if (actual !== expected) {
        throw new Error(`Expected header "${name}" to equal "${expected}", got "${actual}"`);
    }
    return `Header matched: ${name}`;
}

function assertBodyContains(args, state) {
    const response = requireLastResponse(state);
    const expected = String(args.text ?? '');
    const caseSensitive = Boolean(args.caseSensitive);
    const haystack = caseSensitive ? response.bodyText : response.bodyText.toLowerCase();
    const needle = caseSensitive ? expected : expected.toLowerCase();
    if (!haystack.includes(needle)) {
        throw new Error(`Expected response body to contain "${expected}"`);
    }
    return `Body contains: ${expected}`;
}

function assertJsonField(args, state) {
    const response = requireLastResponse(state);
    const expectedPath = String(args.path ?? '');
    if (!expectedPath) {
        throw new Error('JSON path is required');
    }

    let json = response.json;
    if (json === undefined) {
        try {
            json = response.bodyText ? JSON.parse(response.bodyText) : undefined;
        } catch {
            throw new Error('Last response body is not valid JSON');
        }
    }

    const actual = readJsonPath(json, expectedPath);
    if (actual === undefined) {
        throw new Error(`JSON path "${expectedPath}" was not found`);
    }

    if (!isDeepStrictEqual(actual, args.expected)) {
        throw new Error(`Expected JSON path "${expectedPath}" to equal ${JSON.stringify(args.expected)}, got ${JSON.stringify(actual)}`);
    }

    return `JSON field matched: ${expectedPath}`;
}

/**
 * Creates a unified MCP server that exposes both Playwright browser tools and API tools
 * over StreamableHTTP on a random localhost port.
 *
 * @param {import('@playwright/test').BrowserContext|object} context - Browser context or API context object
 * @param {object} options
 * @param {string} [options.baseUrl] - Base URL for API requests
 * @returns {Promise<{ url: string, cleanup: () => Promise<void> }>}
 */
export async function createMcpHttpServer(context, options = {}) {
    const baseUrl = options.baseUrl || process.env.BASE_URL || '';
    const isBrowserContext = context && typeof context === 'object' && typeof context.newPage === 'function';

    let mcpServer;
    let apiState = null;

    if (isBrowserContext) {
        // Browser context: use Playwright MCP
        const contextWithManagedLifecycle = Object.create(context);
        contextWithManagedLifecycle.close = async () => {};

        mcpServer = await createConnection(
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
    } else {
        // API context: create custom MCP server with API tools
        const [{ Server }, { StreamableHTTPServerTransport }, { CallToolRequestSchema, ListToolsRequestSchema }] = await Promise.all([
            import('@modelcontextprotocol/sdk/server/index.js').catch(() => {
                throw new Error('Missing optional dependency @modelcontextprotocol/sdk. Install it to use API mode.');
            }),
            import('@modelcontextprotocol/sdk/server/streamableHttp.js').catch(() => {
                throw new Error('Missing optional dependency @modelcontextprotocol/sdk. Install it to use API mode.');
            }),
            import('@modelcontextprotocol/sdk/types.js').catch(() => {
                throw new Error('Missing optional dependency @modelcontextprotocol/sdk. Install it to use API mode.');
            }),
        ]);

        apiState = buildApiState(context);

        const server = new Server(
            {
                name: 'openqa-unified',
                version: '0.0.10',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: API_TOOL_NAMES.request,
                    description: 'Send an HTTP request and store the response for later assertions.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            method: { type: 'string', description: 'HTTP method such as GET, POST, PUT, PATCH, DELETE, HEAD, or OPTIONS' },
                            url: { type: 'string', description: 'Absolute URL or relative path resolved against BASE_URL' },
                            headers: {
                                type: 'object',
                                additionalProperties: true,
                                description: 'Optional request headers',
                            },
                            query: {
                                type: 'object',
                                additionalProperties: true,
                                description: 'Optional query parameters appended to the URL',
                            },
                            body: {
                                description: 'Optional request body. Objects are sent as JSON.',
                            },
                            timeoutMs: { type: 'number', description: 'Optional request timeout in milliseconds' },
                        },
                        required: ['method', 'url'],
                    },
                },
                {
                    name: API_TOOL_NAMES.status,
                    description: 'Assert the last API response status code.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            expected: { type: 'number', description: 'Expected HTTP status code' },
                        },
                        required: ['expected'],
                    },
                },
                {
                    name: API_TOOL_NAMES.header,
                    description: 'Assert the last API response includes a header with an exact value.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            name: { type: 'string', description: 'Header name' },
                            expected: { type: 'string', description: 'Expected header value' },
                        },
                        required: ['name', 'expected'],
                    },
                },
                {
                    name: API_TOOL_NAMES.bodyContains,
                    description: 'Assert the last API response body contains text.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            text: { type: 'string', description: 'Text that must be present in the response body' },
                            caseSensitive: { type: 'boolean', description: 'Whether the text match should be case-sensitive' },
                        },
                        required: ['text'],
                    },
                },
                {
                    name: API_TOOL_NAMES.jsonField,
                    description: 'Assert a JSON field in the last API response matches an expected value.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            path: { type: 'string', description: 'Dot path or array path such as data.user.id or items[0].name' },
                            expected: { description: 'Expected JSON value' },
                        },
                        required: ['path', 'expected'],
                    },
                },
            ],
        }));

        server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const args = request.params.arguments ?? {};

            try {
                switch (request.params.name) {
                    case API_TOOL_NAMES.request:
                        return await requestTool({
                            method: args.method,
                            url: args.url,
                            headers: args.headers ?? {},
                            query: args.query ?? {},
                            body: args.body,
                            timeoutMs: args.timeoutMs,
                        }, apiState, baseUrl);
                    case API_TOOL_NAMES.status:
                        return { content: [{ type: 'text', text: assertStatus(args, apiState) }] };
                    case API_TOOL_NAMES.header:
                        return { content: [{ type: 'text', text: assertHeader(args, apiState) }] };
                    case API_TOOL_NAMES.bodyContains:
                        return { content: [{ type: 'text', text: assertBodyContains(args, apiState) }] };
                    case API_TOOL_NAMES.jsonField:
                        return { content: [{ type: 'text', text: assertJsonField(args, apiState) }] };
                    default:
                        throw new Error(`Unknown API tool: ${request.params.name}`);
                }
            } catch (error) {
                return toolError(error.message);
            }
        });

        mcpServer = server;
    }

    // For browser context, we need to wrap with HTTP transport
    // For API context, mcpServer is already the custom server
    const { StreamableHTTPServerTransport } = await import('@modelcontextprotocol/sdk/server/streamableHttp.js');
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: () => randomUUID() });
    await mcpServer.connect(transport);

    const httpServer = http.createServer(async (req, res) => {
        await transport.handleRequest(req, res);
    });

    const port = await new Promise((resolve) =>
        httpServer.listen(0, '127.0.0.1', () => resolve(httpServer.address().port))
    );

    return {
        url: `http://127.0.0.1:${port}/mcp`,
        cleanup: async () => {
            httpServer.close();
            await transport.close().catch(() => {});
            await mcpServer.close().catch(() => {});
        },
    };
}