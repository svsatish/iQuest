import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features/*.feature',
  steps: 'features/steps/*.ts',
});

export default defineConfig({
  testDir,
  timeout: 240000,
  fullyParallel: true,

  // Control parallel execution: number of workers = number of OnKernel browsers created
  // workers: 2 = 2 OnKernel browsers, up to 2 tests run in parallel
  // Increase workers for more parallelism, but be mindful of OnKernel quota limits
  workers: 2,

  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['html', { open: 'never' }],
  ],
  use: {
    // Note: Video/trace/screenshot recording is enabled in config but not functional
    // CDP remote browsers reuse existing contexts, so Playwright doesn't actually record
    // This avoids "End of central directory record signature not found" errors
    // To enable recording, you would need to create new contexts per test (see git history)
    screenshot: 'on',
    trace: 'on',
    video: 'on',
  },
  // No projects defined - we use OnKernel cloud browsers via CDP connection
});
