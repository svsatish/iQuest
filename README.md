<img src="docs/assets/logo_light_mode.svg" height="40" alt="iQuest" />

# iQuest Agentic Test Harness
**Discover. Validate. Assure.**

AI-powered browser and API test automation. Write tests in plain English — the agent figures out the selectors or API calls.

[![npm version](https://badge.fury.io/js/@vsaripella%2Fiquest.svg)](https://www.npmjs.com/package/@vsaripella/iquest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Quick Start

**Prerequisites:**
- Node.js **18+** (for the iQuest library)
- Node.js **22+** (for scaffolded `.iquest/` projects — required by [varlock](https://varlock.dev) for environment variable validation)
- One-time login with [Claude Code](https://claude.ai/code) or [opencode](https://opencode.ai) — no API key needed for local development

**1. Scaffold the harness:**
```bash
npx @vsaripella/iquest init
```

**2. Write a feature file** (`.iquest/features/my-app.feature`):
```gherkin
Feature: My App

  Scenario: User can log in
    * Navigate to "https://myapp.com"
    * Enter credentials and submit the login form
    * Should see the dashboard
```

**3. Run:**
```bash
cd .iquest && npm test
```

No step definitions. No selectors. No code.

For hybrid UI + API projects, `iquest init` scaffolds a feature-file starter in `.iquest/` that can mix both kinds of steps in the same scenario.

---

## Node.js Version Compatibility

| Usage | Minimum Node Version | Notes |
|-------|---------------------|-------|
| **iQuest library** (`import { runAgent } from 'iquest'`) | **18+** | Core library works on Node 18+ |
| **Scaffolded `.iquest/` project** (`npx iquest init`) | **22+** | Required by [varlock](https://varlock.dev) for `.env.schema` validation and type generation |
| **Playwright + Playwright-BDD** | **18+** | Standard Playwright requirement |

**If you're on Node 26+:** The library is compatible. For scaffolded projects, varlock (used for env validation) may show deprecation warnings — these don't affect functionality. We recommend Node 22 LTS for the smoothest experience.

> **Tip:** Use a version manager like `nvm`, `fnm`, or `volta` to switch Node versions per project.

---

## Features

- **No selectors. Ever.** — Agent navigates by intent. Survives any UI refactor automatically.
- **Unified UI + API** — One feature file, one step definition, one `runAgent()` call handles both browser and API steps.
- **CI-grade evidence** — HTML report, trace viewer, and screenshots on every run.
- **No API key locally** — Uses your `claude login` or `opencode auth login` session.
- **2-minute setup** — `npx iquest init` scaffolds the complete harness into your project.
- **Dual-engine** — [opencode](https://opencode.ai) (70+ providers) or [Claude Code SDK](https://claude.ai/code). Pick one.
- **BDD & YAML** — Playwright-BDD, Cucumber.js, or YAML.

**Powered by:** [Claude Code SDK](https://claude.ai/code) • [opencode](https://opencode.ai) • [Playwright MCP](https://github.com/microsoft/playwright-mcp) • [Playwright-BDD](https://github.com/vitalets/playwright-bdd) • [Cucumber.js](https://github.com/cucumber/cucumber-js)

---

## How It Works

1. Your BDD step definitions call `runAgent(provider, 'natural language step', context)` where context is a Playwright `page`, `browserContext`, or a Playwright `request` fixture (for API).
2. iQuest creates a unified MCP server in-process exposing both browser tools and API tools, over HTTP/SSE on a random localhost port.
3. The chosen AI provider SDK connects to that MCP URL and receives your natural language instruction.
4. The agent decides which toolset to use based on the step content:
   - **UI steps** ("navigate", "click", "fill", "should see") → Playwright MCP tools
   - **API steps** ("call GET", "POST /users", "response status is 200", "JSON body has id") → API MCP tools
5. The step passes or fails based on what the agent reports back.

- **True browser sharing** — the agent drives the exact same page object your test holds.
- **Parallel-safe** — each test worker gets its own HTTP port. No shared config files.
- **Session resumption** — within a scenario, the agent resumes its conversation across steps.
- **Multi-provider** — swap `claudeCode` for `openCode` to use any model from OpenAI, Google, Anthropic, etc.

---

## Environment Variables

The `.iquest/` directory uses [varlock](https://varlock.dev) for environment variable management. Variables are defined in `.env.schema` (committed to git) and values go in `.env` (gitignored). Secrets are automatically redacted from logs.

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | — | App URL — sets Playwright `baseURL` and is injected into every agent prompt |
| `APP_USERNAME` | — | Username — injected into agent prompt for login steps |
| `APP_PASSWORD` | — | Password — injected into agent prompt; always redacted from logs |
| `API_TOKEN` | — | API Bearer token — injected into agent prompt for API steps; always redacted |
| `OPENQA_VERBOSE` | `true` | Set `false` to suppress step-by-step agent logs |
| `HEADLESS` | `true` | Set `false` to watch the browser |
| `ANTHROPIC_API_KEY` | — | Anthropic API key — only needed for CI (use `claude login` locally) |
| `OPENAI_API_KEY` | — | OpenAI API key — only needed for CI via OpenCode |
| `GOOGLE_API_KEY` | — | Google API key — only needed for CI via OpenCode |

**Adding your own variables** — edit `.iquest/.env.schema` to declare them, then add values to `.env`:

```
# .iquest/.env.schema (add to the bottom)

# @sensitive=false
ENVIRONMENT = staging

# Your test account credentials for the staging environment
STAGING_USER =
# @sensitive
STAGING_PASSWORD =
```

Then use them in your steps or anywhere in the test process via `process.env.ENVIRONMENT`, etc.

---

## Authentication

**No API key needed for local development** — just log in with the CLI once:

```bash
# Claude Code
claude login

# OpenCode (supports GitLab Duo, GitHub Copilot, Anthropic, OpenAI, Google, …)
opencode auth login
```

For CI (or if you prefer an API key), set the relevant key in `.iquest/.env`:

```bash
# Claude Code
ANTHROPIC_API_KEY=your_key

# OpenCode — use whichever provider you're connecting to
ANTHROPIC_API_KEY=your_key
# OPENAI_API_KEY=your_key
# GOOGLE_API_KEY=your_key
```

---

## Customizing Your Setup

`iquest init` creates a working starting point — everything in `.iquest/` is yours to edit. Common customizations:

**Playwright config** — `.iquest/playwright.config.ts` is a standard [Playwright config](https://playwright.dev/docs/test-configuration). Add projects, change timeouts, add reporters, enable retries for CI:

```typescript
// .iquest/playwright.config.ts
export default defineConfig({
  timeout: 120000,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: process.env.BASE_URL,
    locale: 'en-US',
    timezoneId: 'America/New_York',
  },
});
```

**Step definitions** — `.iquest/steps/steps.ts` is a regular [Playwright-BDD](https://playwright-bdd.dev) or [Cucumber.js](https://github.com/cucumber/cucumber-js) step file. Add custom (non-AI) steps alongside the AI step, or add Before/After hooks:

```typescript
// .iquest/steps/steps.ts — add a manual step alongside the AI one
import { createBdd } from 'playwright-bdd';
const { Given } = createBdd();

Given('I am on the home page', async ({ page }) => {
  await page.goto(process.env.BASE_URL!);
});
```

---

## Writing Feature Files

`iquest init` places example feature files in `.iquest/features/` — edit or replace them with your own.

Feature files use standard Gherkin syntax. We recommend using `*` (asterisk) for steps instead of `Given`/`When`/`Then` — it reads more naturally for AI-driven tests:

```gherkin
Feature: TodoMVC

  Scenario: Add a todo item
    * Navigate to "https://demo.playwright.dev/todomvc/"
    * Add a new todo item "Buy groceries"
    * Should see "Buy groceries" in the todo list

  Scenario: Filter completed todos
    * Navigate to "https://demo.playwright.dev/todomvc/"
    * Add three todo items: "Task 1", "Task 2", and "Task 3"
    * Mark the first todo as completed
    * Click the Active filter
    * Should see 2 active todos
```

You can still use `Given`/`When`/`Then` — both work identically.

### Hybrid UI + API Scenarios

A single scenario can seamlessly mix browser and API steps. The agent automatically selects the right toolset:

```gherkin
Feature: User registration flow

  Scenario: Register via API, then verify in UI
    * Call POST "/api/users" with body { "email": "test@example.com", "password": "secret123" }
    * Verify the response status is 201
    * Verify the JSON body has "id" equal to a non-empty string
    * Navigate to "/login"
    * Fill "email" with "test@example.com"
    * Fill "password" with "secret123"
    * Click "Submit"
    * Should see "Welcome, test@example.com"
```

**How the agent decides:**
- Words like "navigate", "click", "fill", "type", "should see", "verify element" → **browser tools**
- Words like "call GET/POST/PUT/DELETE", "api", "endpoint", "request", "response", "status", "header", "json", "body" → **API tools**

**Moving feature files elsewhere** — if your feature files live outside `.iquest/` (e.g. `features/` in the project root), update the path in your config:

For Playwright-BDD, edit `.iquest/playwright.config.ts`:
```typescript
const testDir = defineBddConfig({
  featuresRoot: '../features',
  features: '../features/**/*.feature',
  steps: 'steps/*.ts',
});
```

For Cucumber.js, edit `.iquest/cucumber.js`:
```js
paths: ['../features/**/*.feature'],
```

---

## Changing Model or Provider

After running `iquest init`, your model is set in one line inside `.iquest/steps/steps.ts` (or `steps.js` for Cucumber.js). Open that file and edit the provider call:

**Change the Claude Code model:**
```typescript
// .iquest/steps/steps.ts
import { runAgent, claudeCode } from 'iquest';

// Before
await runAgent(claudeCode('claude-haiku-4-5'), action, page);

// After — switch to a more capable model
await runAgent(claudeCode('claude-sonnet-4-6'), action, page);
```

**Switch from Claude Code to OpenCode (GitLab Duo, GitHub Copilot, etc.):**
```typescript
// .iquest/steps/steps.ts
import { runAgent, openCode } from 'iquest';  // swap the import

// GitLab Duo
await runAgent(openCode('gitlab/duo-chat-haiku-4-5'), action, page);

// GitHub Copilot
await runAgent(openCode('github-copilot/gpt-5.4'), action, page);

// Anthropic via OpenCode
await runAgent(openCode('anthropic/claude-sonnet-4-6'), action, page);

// OpenAI
await runAgent(openCode('openai/gpt-4o'), action, page);

// Google
await runAgent(openCode('google/gemini-2.0-flash'), action, page);
```

That's the only change needed — one import swap and one string update.

---

## API Reference

### `runAgent(provider, prompt, context, options?)`

Runs the AI agent with a natural language instruction. Works for both browser (UI) and API testing.

| Parameter | Type | Description |
|---|---|---|
| `provider` | `object` | Agent provider, e.g. `claudeCode('claude-haiku-4-5')` or `openCode('gitlab/duo-chat-haiku-4-5')` |
| `prompt` | `string` | Natural language instruction |
| `context` | `Page \| BrowserContext \| object` | Playwright page, browser context, or API request context/state object |
| `options.baseUrl` | `string` | Base URL for API requests (when using API context) |
| `options.verbose` | `boolean` | Enable logging (default: `true`) |
| `options.returnUsage` | `boolean` | Return token usage stats (default: `false`) |

**Returns:** `Promise<string>` — the agent's final response (or `{ result, usage, steps, sessionId }` if `returnUsage: true`).

**Example — Browser test:**
```typescript
import { runAgent, claudeCode } from 'iquest';

await runAgent(
  claudeCode('claude-haiku-4-5'),
  'Navigate to "https://example.com" and verify the title contains "Example"',
  page
);
```

**Example — API test:**
```typescript
import { test, request } from '@playwright/test';
import { runAgent, claudeCode } from 'iquest';

test('create user via API', async () => {
  const api = await request.newContext({
    baseURL: process.env.BASE_URL,
  });

  await runAgent(
    claudeCode('claude-haiku-4-5'),
    'Create a user with email "test@example.com", then verify status is 201 and response has an id',
    api,
    { baseUrl: process.env.BASE_URL }
  );

  await api.dispose();
});
```

**Example — Hybrid test (in BDD step):**
```typescript
import { runAgent, openCode } from 'iquest';
import { aistep } from './fixtures';

aistep(/^(.*)$/, async ({ page, api }, action) => {
  const isBrowserStep = !/(\bGET\b|\bPOST\b|api|endpoint|request|response|status|header|json|body)/i.test(action);
  await runAgent(
    openCode('gitlab/duo-chat-haiku-4-5'),
    action,
    isBrowserStep ? page : api,
    { baseUrl: process.env.BASE_URL }
  );
});
```

### `runAgent.resetSession(context)`

Resets the agent conversation session for a specific context (browser context or API context object). Useful when you want to start a fresh conversation mid-test.

---

### `claudeCode(model?)`

```javascript
import { claudeCode } from 'iquest';
const provider = claudeCode('claude-haiku-4-5'); // default
```

| Model | Description |
|---|---|
| `claude-haiku-4-5` | Fast, cost-efficient (default) |
| `claude-sonnet-4-6` | Balanced performance |
| `claude-opus-4-7` | Most capable |

Requires `@anthropic-ai/claude-agent-sdk` to be installed.

### `openCode(model?)`

```javascript
import { openCode } from 'iquest';
const provider = openCode('gitlab/duo-chat-haiku-4-5'); // GitLab Duo (default in init)
// or: openCode('github-copilot/gpt-5.4')
// or: openCode('anthropic/claude-haiku-4-5'), openCode('openai/gpt-4o'), openCode('google/gemini-2.0-flash')
```

Model format: `provider/model`. Supports any provider configured in your OpenCode installation.

| Model | Provider |
|-------|----------|
| `gitlab/duo-chat-haiku-4-5` | GitLab Duo (default) |
| `github-copilot/gpt-5.4` | GitHub Copilot |
| `anthropic/claude-haiku-4-5` | Anthropic |
| `openai/gpt-4o` | OpenAI |
| `google/gemini-2.0-flash` | Google |

Requires `@opencode-ai/sdk` to be installed.

---

## Examples

- [`examples/playwright-bdd/`](examples/playwright-bdd/) — Playwright-BDD with natural language steps
- [`examples/playwright-yaml/`](examples/playwright-yaml/) — YAML-based tests
- [`examples/playwright-api/`](examples/playwright-api/) — Hybrid UI + API tests (unified approach)
- [`examples/cucumberjs/`](examples/cucumberjs/) — Cucumber.js integration

---

## Requirements

- **iquest library:** Node.js 18+
- **Scaffolded `.iquest/` project:** Node.js 22+ (required by varlock)
- `@playwright/test` ^1.57.0
- One of: `@anthropic-ai/claude-agent-sdk` (for `claudeCode`) or `@opencode-ai/sdk` (for `openCode`)

---

## Links

- **NPM:** https://www.npmjs.com/package/@vsaripella/iquest
- **GitHub:** https://github.com/svsatish/iQuest

## License

MIT