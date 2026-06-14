import { test as base, createBdd } from 'playwright-bdd';
import { Browser } from '@playwright/test';

type Fixtures = {
  browser: Browser;
};

export const test = base.extend<Fixtures>({
  browser: async ({}, use) => {
    // Uses Playwright's built-in browser fixture
    // Browser is only launched when actually used
  },
});

export const { Step: aistep } = createBdd(test);