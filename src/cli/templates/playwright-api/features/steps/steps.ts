import { runAgent, openCode } from 'iquest';
import { aistep } from './fixtures';

const verbose = process.env.OPENQA_VERBOSE !== 'false';

function buildContext(isBrowser: boolean): string {
  const lines: string[] = [];
  if (process.env.BASE_URL) {
    lines.push(`${isBrowser ? 'Application' : 'API'} base URL: ${process.env.BASE_URL}`);
  }
  if (isBrowser) {
    if (process.env.APP_USERNAME) lines.push(`App username: ${process.env.APP_USERNAME}`);
    if (process.env.APP_PASSWORD) lines.push('App password: [redacted]');
  } else {
    if (process.env.API_TOKEN) lines.push('API token: [redacted]');
  }
  return lines.length > 0 ? `[Context]\n${lines.join('\n')}\n\n` : '';
}

// Cache for lazily created pages - shared within a scenario
const pageCache = new Map<string, import('@playwright/test').Page>();

// Generic AI step - handles ALL Given/When/Then steps with natural language
// The agent automatically chooses browser or API tools based on the step content
aistep(/^(.*)$/, async ({ browser, api }, action: string) => {
  // Detect if this is an API step based on keywords
  const isApiStep = /(\bGET\b|\bPOST\b|\bPUT\b|\bPATCH\b|\bDELETE\b|\bHEAD\b|\bOPTIONS\b|api\b|endpoint|call\s+(GET|POST|PUT|DELETE)|request|response|status\s+\d+|header|json|body)/i.test(action);

  if (isApiStep) {
    // API step - use the API context, no browser launched
    if (verbose) {
      console.log(`🤖 [API] ${action}`);
    }
    await runAgent(openCode('opencode/nemotron-3-ultra-free'), `${buildContext(false)}${action}`, api, { verbose });
    return;
  }

  // UI step - lazily create page only when needed
  const workerId = process.env.TEST_WORKER_INDEX || 'default';
  let page = pageCache.get(workerId);
  if (!page) {
    page = await browser.newPage();
    pageCache.set(workerId, page);
  }

  if (verbose) {
    console.log(`🤖 [UI] ${action}`);
  }
  await runAgent(openCode('opencode/nemotron-3-ultra-free'), `${buildContext(true)}${action}`, page, { verbose });
});

// Clean up cached pages after each scenario
import { After } from 'playwright-bdd';

After(async () => {
  for (const page of pageCache.values()) {
    await page.close().catch(() => {});
  }
  pageCache.clear();
});