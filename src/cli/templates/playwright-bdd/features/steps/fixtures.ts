import { test as base, createBdd } from 'playwright-bdd';
import { request, Browser } from '@playwright/test';

type Fixtures = {
  api: Awaited<ReturnType<typeof request.newContext>>;
  apiBaseURL: string;
  browser: Browser;
};

export const test = base.extend<Fixtures>({
  apiBaseURL: process.env.BASE_URL ?? 'http://localhost:3000',

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

  // Use browser fixture instead of page - browser is already a built-in fixture
  // We'll lazily create pages in steps.ts only when UI steps are needed
  browser: async ({}, use) => {
    // This uses Playwright's built-in browser fixture
    // The browser is only launched when actually used
  },
});

export const { Step: aistep } = createBdd(test);