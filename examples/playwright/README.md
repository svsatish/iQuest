# Playwright Example

This example demonstrates using `openqa` with Playwright tests for AI-powered browser automation with shared context.

## Setup

Install dependencies:

```bash
npm install
```

**Authentication:**

Use Claude Code credentials (recommended):
```bash
claude login
```

Or set your Anthropic API key (not needed if you logged in to claude code):
```bash
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

## Run Tests

```bash
npm test              # Run all tests
npm run test:headed   # Run with visible browser
npm run test:ui       # Open Playwright UI
```

## Key Points

- Import from `openqa` package
- Pass Playwright's `context` fixture to `runAgent()`
- Agent and test see the same browser state, cookies, and pages
- No separate browser instances - true collaboration

## Code Example

```javascript
import { test, expect } from "@playwright/test";
import { runAgent } from "openqa";

test("agent fills form", async ({ page, context }) => {
  await page.goto("https://httpbin.org/forms/post");

  // Agent fills form in the shared context
  await runAgent(
    'Fill in the customer name field with "Test User"',
    context
  );

  // Test verifies in THE SAME browser
  const customerName = page.locator('input[name="custname"]');
  await expect(customerName).toHaveValue("Test User");
});
```
