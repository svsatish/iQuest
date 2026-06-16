import { test as base, request } from '@playwright/test';

/**
 * Custom fixtures for iQuest YAML tests.
 * Provides `api` fixture for API testing with baseURL and auth from environment.
 */

export const test = base.extend({
  api: async ({}, use) => {
    const baseURL = process.env.BASE_URL ?? 'http://localhost:3000';
    const api = await request.newContext({
      baseURL,
      extraHTTPHeaders: process.env.API_TOKEN
        ? { Authorization: `Bearer ${process.env.API_TOKEN}` }
        : undefined,
    });

    await use(api);
    await api.dispose();
  },
});

export { expect } from '@playwright/test';