import { createServer, IncomingMessage, ServerResponse } from 'http';
import { randomUUID } from 'crypto';
import { request } from '@playwright/test';
import { test as base, createBdd } from 'playwright-bdd';

type Fixtures = {
  apiBaseURL: string;
  api: Awaited<ReturnType<typeof request.newContext>>;
};

async function createMockApiServer() {
  const todos: Array<{ id: string; title: string; completed: boolean }> = [];

  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    void handleRequest(req, res).catch((error) => {
      res.writeHead(500, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    });
  });

  async function handleRequest(req: IncomingMessage, res: ServerResponse) {
    const url = new URL(req.url ?? '/', `http://${req.headers.host}`);

    res.setHeader('content-type', 'application/json');

    if (req.method === 'GET' && url.pathname === '/health') {
      res.writeHead(200);
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/todos') {
      const body = await new Promise<string>((resolve, reject) => {
        const chunks: Buffer[] = [];
        req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        req.on('error', reject);
      });
      const parsed = body ? JSON.parse(body) : {};
      const todo = {
        id: randomUUID(),
        title: String(parsed.title ?? ''),
        completed: false,
      };
      todos.push(todo);
      res.writeHead(201);
      res.end(JSON.stringify(todo));
      return;
    }

    if (req.method === 'GET' && url.pathname.startsWith('/todos/')) {
      const id = url.pathname.split('/').pop();
      const todo = todos.find((item) => item.id === id);
      if (!todo) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found' }));
        return;
      }
      res.writeHead(200);
      res.end(JSON.stringify(todo));
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }

  const baseURL = await new Promise<string>((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        throw new Error('Failed to start mock API server');
      }
      resolve(`http://127.0.0.1:${address.port}`);
    });
  });

  return {
    baseURL,
    close: async () => {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    },
  };
}

export const test = base.extend<Fixtures>({
  apiBaseURL: async ({}, use) => {
    if (process.env.BASE_URL) {
      await use(process.env.BASE_URL);
      return;
    }

    const mock = await createMockApiServer();
    try {
      await use(mock.baseURL);
    } finally {
      await mock.close();
    }
  },

  api: async ({ apiBaseURL }, use) => {
    const api = await request.newContext({
      baseURL: apiBaseURL,
      extraHTTPHeaders: process.env.API_TOKEN
        ? { Authorization: `Bearer ${process.env.API_TOKEN}` }
        : undefined,
    });

    await use(api);
    await api.dispose();
  },
});

export const { Step: aistep } = createBdd(test);