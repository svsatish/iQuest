import { runAgent, openCode } from 'openqa';
import { aistep, After } from './fixtures';

const verbose = process.env.OPENQA_VERBOSE !== 'false';

// Cache for lazily created pages - shared within a scenario
const pageCache = new Map<string, import('@playwright/test').Page>();

// Generic AI step - handles ALL Given/When/Then steps with natural language
aistep(/^(.*)$/, async ({ browser }, action: string) => {
    // Lazily create page only when needed
    const workerId = process.env.TEST_WORKER_INDEX || 'default';
    let page = pageCache.get(workerId);
    if (!page) {
        page = await browser.newPage();
        pageCache.set(workerId, page);
    }

    if (verbose) {
        console.log(`🤖 [UI] ${action}`);
    }
    await runAgent(openCode('opencode/nemotron-3-ultra-free'), action, page, { verbose });
});

// Clean up cached pages after each scenario
After(async () => {
    for (const page of pageCache.values()) {
        await page.close().catch(() => {});
    }
    pageCache.clear();
});