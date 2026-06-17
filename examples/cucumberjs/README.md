# iQuest Cucumber.js Example

This example demonstrates using `iquest` with CucumberJS and Playwright for BDD testing.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

3. Edit `.env` and add your API key:
```env
# Add your API key (not needed if using claude login or opencode auth login)
ANTHROPIC_API_KEY=your_api_key_here
```

## Run Tests

```bash
npm test              # Run tests in headless mode
npm run test:headed   # Run with visible browser
npm run test:report   # Generate HTML report
```

## What's Demonstrated

This example shows how to:

1. **Write BDD scenarios** in Gherkin syntax
2. **Use AI agent** in Cucumber step definitions
3. **Share browser context** with Playwright and the AI agent
4. **Generate HTML reports** from test execution

## Project Structure

```
cucumberjs/
├── features/
│   ├── playwright-home.feature       # Gherkin feature files
│   └── step_definitions/
│       └── steps.js                  # Step definitions with agent
├── cucumber.js                       # Cucumber configuration
└── package.json
```

## Feature File Example

```gherkin
Feature: Playwright Home Page

  Scenario: Check title
    Given I navigate to "https://playwright.dev/"
    When I click link "Get started"
    Then I should see "Installation" in the title
```

## Step Definitions

The key innovation is using a **single generic step** that handles ALL steps with AI:

```javascript
import { defineStep, Before, After } from '@cucumber/cucumber';
import { chromium } from 'playwright';
import { runAgent, claudeCode } from '@vsaripella/iquest';

Before(async function () {
  browser = await chromium.launch({ headless: true });
  context = await browser.newContext();
  page = await context.newPage();
});

After(async function () {
  await page.close();
  await context.close();
  await browser.close();
});

// Generic AI step - handles ALL Given/When/Then steps
defineStep(/^(.*)$/, async function (action) {
  await runAgent(claudeCode('claude-haiku-4-5'), action, context, { verbose: false });
});
```

**That's it!** One generic step definition handles all scenarios. No need to write individual step definitions for each Given/When/Then.

## How It Works

1. **Before hook** sets up browser, context, and page
2. **Generic step** (`defineStep(/^(.*)$/, ...)`) matches ALL Given/When/Then
3. **ALL steps** are handled by AI agent using natural language
4. **After hook** cleans up browser resources
5. **Browser context is shared** between Playwright and agent
6. **No code required** - just write scenarios and run tests!

## Benefits

- **Zero code**: Write tests in pure natural language
- **One generic step**: Single `defineStep` handles ALL Given/When/Then
- **Standard CucumberJS**: Uses vanilla `@cucumber/cucumber`
- **Before/After hooks**: Manage browser lifecycle
- **HTML reports**: Generate detailed test reports
- **Shared context**: Agent and Playwright see the same browser state

## Reports

After running tests, view the HTML report:

```bash
open reports/cucumber-report.html
```

The report includes:
- Scenario pass/fail status
- Step-by-step execution details
- Execution time