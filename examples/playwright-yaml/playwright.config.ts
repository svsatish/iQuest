import { defineConfig, devices } from '@playwright/test';

export default defineConfig({

  testDir: './.tests-gen',
// Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Reporter to use
  reporter: 'html',

  timeout: 180_000,

  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: 'https://demo.playwright.dev/todomvc/',

    // Collect trace when retrying the failed test
    trace: 'on',

    // Screenshot on failure
    screenshot: 'on',
    video: 'on',
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
