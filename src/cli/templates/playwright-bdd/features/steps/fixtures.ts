import { test as base, createBdd } from 'playwright-bdd';
import { request } from '@playwright/test';

type Fixtures = {
  api: Awaited<ReturnType<typeof request.newContext>>;
  apiBaseURL: string;
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
});

export const { Step: aistep } = createBdd(test);