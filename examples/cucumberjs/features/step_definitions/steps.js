import { defineStep, Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, Browser } from 'playwright';
import { runAgent, claudeCode } from 'iquest';

// Set default timeout to 3 minutes for AI agent steps
setDefaultTimeout(180000);

// Browser and context setup - lazily created
let browser;
let context;
let page;

Before(async function () {
  const headless = process.env.HEADLESS !== 'false';
  browser = await chromium.launch({ headless });
  context = await browser.newContext();
  // Don't create page here - lazily create in step when needed
});

After(async function () {
  if (page) await page.close().catch(() => {});
  await context.close().catch(() => {});
  await browser.close().catch(() => {});
  page = null;
});

// Generic AI step - handles ALL Given/When/Then steps with natural language
// Lazily creates page only when UI steps are needed
defineStep(/^(.*)$/, async function (action) {
  // Detect if this is an API step based on keywords
  const isApiStep = /(\bGET\b|\bPOST\b|\bPUT\b|\bPATCH\b|\bDELETE\b|\bHEAD\b|\bOPTIONS\b|api\b|endpoint|call\s+(GET|POST|PUT|DELETE)|request|response|status\s+\d+|header|json|body)/i.test(action);

  if (isApiStep) {
    // API step - use the context directly, no page needed
    console.log(`🤖 [API] ${action}`);
    await runAgent(claudeCode('claude-haiku-4-5'), action, context, { verbose: true });
    return;
  }

  // UI step - lazily create page only when needed
  if (!page) {
    page = await context.newPage();
  }

  console.log(`🤖 [UI] ${action}`);
  await runAgent(claudeCode('claude-haiku-4-5'), action, page, { verbose: true });
});