# Quickstart

Run this from your existing project root:

```bash
npx @vsaripella/iquest init
```

The interactive wizard asks 4 questions — then everything is set up automatically.

---

## Prerequisites

| Tool | Minimum Version | Why |
|------|----------------|-----|
| **Node.js** | 18+ (library), 22+ (scaffolded projects) | Core library runs on 18+. Scaffolded `.iquest/` projects need 22+ for [varlock](https://varlock.dev) env validation. |
| **Git** | Any | For cloning examples and CI integration. |
| **Playwright Browsers** | — | Installed automatically by `npx playwright install chromium`. |

### Checking & Installing (macOS)

```bash
# Check Node.js
node --version

# Install Node.js (if missing)
# Option A — Homebrew
brew install node

# Option B — nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.zshrc   # or ~/.bash_profile
nvm install 22
nvm use 22

# Check Git (usually pre-installed)
git --version
# If missing: brew install git

# Install Playwright browsers (after npm install)
npx playwright install chromium
```

### Checking & Installing (Windows)

```powershell
# Check Node.js
node --version

# Install Node.js (if missing)
# Option A — Official installer: https://nodejs.org/download/release/latest-v22.x/
# Option B — nvm-windows (recommended)
#   Download & install: https://github.com/coreybutler/nvm-windows/releases
nvm install 22.0.0
nvm use 22.0.0

# Check Git
git --version
# If missing: download from https://git-scm.com/download/win

# Install Playwright browsers (after npm install)
npx playwright install chromium
```

### Node.js Version Compatibility

| Usage | Minimum Node Version | Notes |
|-------|---------------------|-------|
| **iQuest library** (`import { runAgent } from 'iquest'`) | **18+** | Core library works on Node 18+ |
| **Scaffolded `.iquest/` project** (`npx @vsaripella/iquest init`) | **22+** | Required by [varlock](https://varlock.dev) for `.env.schema` validation and type generation |
| **Playwright + Playwright-BDD** | **18+** | Standard Playwright requirement |

> **If you're on Node 26+:** The library is compatible. For scaffolded projects, varlock may show deprecation warnings — these don't affect functionality. We recommend Node 22 LTS.

> **Tip:** Use a version manager like `nvm`, `fnm`, `volta`, or `nvm-windows` to switch Node versions per project.

---

## Step 1: Choose your agent

| Agent | SDK | Best for |
|-------|-----|----------|
| **Claude Code** | `@anthropic-ai/claude-agent-sdk` | Anthropic models only |
| **OpenCode** | `@opencode-ai/sdk` | Any provider: Anthropic, OpenAI, Google, and more |

Both agents connect to the same Playwright MCP server over HTTP and expose the same interface. You can swap between them by changing one import.

---

## Step 2: Choose your model

**Claude Code** models:

| Model | Speed | Best for |
|-------|-------|----------|
| `claude-haiku-4-5` | Fast | Default, most tests |
| `claude-sonnet-4-6` | Medium | Complex flows |
| `claude-opus-4-7` | Slow | Most demanding tasks |

**OpenCode** models use `provider/model` format:

| Model | Provider |
|-------|----------|
| `gitlab/duo-chat-haiku-4-5` | GitLab Duo (default) |
| `github-copilot/gpt-5.4` | GitHub Copilot |
| `anthropic/claude-haiku-4-5` | Anthropic |
| `openai/gpt-4o` | OpenAI |
| `google/gemini-2.0-flash` | Google |

Or enter any custom model name your OpenCode installation supports.

---

## Step 3: Choose your framework

**Playwright-BDD** — Uses Gherkin `.feature` files with the Playwright test runner. Recommended.

**Cucumber.js** — Standard Cucumber with Playwright browser automation.

---

## Step 4: Point to your feature files

Enter the relative path from your project root to your `.feature` files. For example:

- `features/` — default
- `tests/features/`
- `src/test/features/`

The harness will be configured to point at them automatically, wherever they live.

---

## What gets created

```
your-project/
└── .iquest/               ← agent harness lives here
    ├── .env.example       ← copy to .env and fill in your values
    ├── .env.schema        ← committed schema: variable types, defaults, secret redaction
    ├── playwright.config.ts  (or cucumber.js)
    ├── features/          ← example feature files (edit or replace these)
    │   ├── todomvc.feature        ← 2 scenarios
    │   └── getting-started.feature ← 1 scenario
    └── steps/
        ├── fixtures.ts    ← Playwright-BDD only
        └── steps.ts       ← single AI step definition
```

Feature files live in `.iquest/features/` by default. To move them, update the path in `playwright.config.ts` (or `cucumber.js`) — see [Writing Feature Files](#writing-feature-files).

---

## Authentication

::: tip
**No API key needed for local development.** Just log in once with the CLI and you're done.
:::

### Claude Code (local)

```bash
claude login
```
One-time login. No `.env` needed for local runs.

### OpenCode (local)

```bash
opencode auth login
```
One-time login — works with GitLab Duo, GitHub Copilot, Anthropic, OpenAI, Google, and more. No `.env` needed for local runs.

### API Key (Claude Code)

```bash
cp .iquest/.env.example .iquest/.env
# then add:
ANTHROPIC_API_KEY=your_key_here
```
Use this for CI or if you prefer an explicit key.

### API Key (OpenCode)

```bash
cp .iquest/.env.example .iquest/.env
# then add whichever provider key you need:
ANTHROPIC_API_KEY=your_key_here
# OPENAI_API_KEY=your_key_here
# GOOGLE_API_KEY=your_key_here
```
Use this for CI or if you prefer an explicit key.

---

## Environment Variables

The scaffolded project uses [varlock](https://varlock.dev) for environment variable management. Variables are defined in `.env.schema` (committed to git) and values go in `.env` (gitignored). Secrets are automatically redacted from logs.

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | — | App URL — sets Playwright `baseURL` and is injected into every agent prompt |
| `APP_USERNAME` | — | Username — injected into agent prompt for login steps |
| `APP_PASSWORD` | — | Password — injected into prompt; always redacted from logs |
| `API_TOKEN` | — | API Bearer token — injected into agent prompt for API steps; always redacted |
| `OPENQA_VERBOSE` | `true` | Set `false` to suppress step-by-step agent logs |
| `HEADLESS` | `true` | Set `false` to watch the browser |
| `ANTHROPIC_API_KEY` | — | Anthropic API key — CI only (use `claude login` locally) |
| `OPENAI_API_KEY` | — | OpenAI API key — CI only via OpenCode |
| `GOOGLE_API_KEY` | — | Google API key — CI only via OpenCode |

All variables are optional. Copy `.env.example` to `.env` and uncomment what you need.

### Adding your own variables

Declare them in `.env.schema`, add values to `.env`:

```env
# .env.schema
# @sensitive=false
ENVIRONMENT = staging

STAGING_USER =
# @sensitive
STAGING_PASSWORD =
```

---

## Writing Feature Files

Two example feature files are scaffolded into `.iquest/features/` — edit or replace them with your own tests.

Use `*` (asterisk) for natural, AI-friendly steps:

```gherkin
Feature: TodoMVC

  Scenario: Add a todo item
    * I navigate to "https://demo.playwright.dev/todomvc/"
    * I add a new todo item "Buy groceries"
    * I should see "Buy groceries" in the todo list

  Scenario: Filter completed todos
    * I navigate to "https://demo.playwright.dev/todomvc/"
    * I add three todo items: "Task 1", "Task 2", and "Task 3"
    * I mark the first todo as completed
    * I click the Active filter
    * I should see 2 active todos
```

Standard `Given`/`When`/`Then` also works — both are identical under the hood.

### Tips for good steps

- Be specific about URLs: `I navigate to "https://..."` not `I go to the site`
- Quote the exact text you expect: `I should see "Buy groceries"`
- Describe intent, not mechanics: `I add a new todo item "..."` not `I click the input and type "..."`

### UI Test Example

From the [`examples/playwright-bdd/features/ui.feature`](https://github.com/svsatish/iQuest/tree/main/examples/playwright-bdd/features/ui.feature) example:

```gherkin
Feature: UI Test

  Scenario: Navigate to SauceDemo
    * Navigate to "https://www.saucedemo.com/"
    * Should see the login page with username and password fields
    * Enter "standard_user" in the username field
    * Enter "secret_sauce" in the password field
    * Click the login button
    * Should see the inventory page with products listed
```

### API Test Example

From the [`examples/playwright-bdd/features/api.feature`](https://github.com/svsatish/iQuest/tree/main/examples/playwright-bdd/features/api.feature) example:

```gherkin
Feature: API

  Scenario: API Testing
    * Hit API URL: https://automationexercise.com/api/productsList with Request Method: GET
    * Response Code should be 200
    * Response Body should contain "products"
    * Response Body should contain "id"
    * Response Body should contain "name"
    * Response Body should contain "price"
```

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
- Words like `navigate`, `click`, `fill`, `type`, `should see`, `verify element` → **browser tools**
- Words like `call GET/POST/PUT/DELETE`, `api`, `endpoint`, `request`, `response`, `status`, `header`, `json`, `body` → **API tools**

### Moving feature files elsewhere

Update the path in `.iquest/playwright.config.ts` (or `cucumber.js`):

```typescript
// playwright.config.ts — point to a directory outside .iquest/
const testDir = defineBddConfig({
  featuresRoot: '../features',
  features: '../features/**/*.feature',
  steps: 'steps/*.ts',
});
```

---

## Customizing Your Setup

`iquest init` is a starting point — everything in `.iquest/` is yours to edit.

**Playwright config** — `.iquest/playwright.config.ts` is a standard [Playwright config file](https://playwright.dev/docs/test-configuration). Update timeouts, add projects, enable retries, change reporters — anything the Playwright docs describe will work here.

**Step definitions** — `.iquest/steps/steps.ts` is a regular [Playwright-BDD](https://playwright-bdd.dev) step file (or [Cucumber.js](https://github.com/cucumber/cucumber-js) for the Cucumber framework). Add non-AI steps, Before/After hooks, or custom fixtures alongside the AI step.

---

## Run your tests

```bash
cd .iquest
npm run test:headed   # visible browser
npm run test          # headless
npm run test:report   # open the HTML report
```

---

## Changing Model or Provider

Your model is set in one line inside `.iquest/steps/steps.ts` (Playwright-BDD) or `.iquest/steps/steps.js` (Cucumber.js). Open that file and change the provider call — that's it.

### Change the Claude Code model

```typescript
import { runAgent, claudeCode } from 'iquest';

// Fast (default)
await runAgent(claudeCode('claude-haiku-4-5'), action, page);

// More capable
await runAgent(claudeCode('claude-sonnet-4-6'), action, page);
await runAgent(claudeCode('claude-opus-4-7'), action, page);
```

### Switch to OpenCode — GitLab Duo or GitHub Copilot

```typescript
import { runAgent, openCode } from 'iquest';  // swap the import

// GitLab Duo (if you use gitlab.com — login with opencode auth login)
await runAgent(openCode('gitlab/duo-chat-haiku-4-5'), action, page);

// GitHub Copilot (if you use GitHub — login with opencode auth login)
await runAgent(openCode('github-copilot/gpt-5.4'), action, page);
```

### Switch to OpenCode — Anthropic, OpenAI, or Google

```typescript
import { runAgent, openCode } from 'iquest';

await runAgent(openCode('anthropic/claude-sonnet-4-6'), action, page);
await runAgent(openCode('openai/gpt-4o'), action, page);
await runAgent(openCode('google/gemini-2.0-flash'), action, page);
```

::: warning
Switching between `claudeCode` and `openCode` requires changing the import **and** the provider call. Everything else — feature files, step syntax, test runner commands — stays the same.
:::

---

## Project Structure Explained

```
.iquest/                    # Test runner workspace (created by `npx @vsaripella/iquest init`)
├── .env                    # Secrets (API keys, BASE_URL) — NEVER COMMIT
├── .env.schema             # VarLock schema — COMMIT THIS (documents all vars)
├── .env.example            # Template for team members — COMMIT THIS
├── package.json            # Dependencies + test scripts
├── node_modules/
├── features/               # Gherkin .feature files (playwright-bdd)
│   └── steps/              # Step definitions (fixtures.ts, steps.ts)
├── tests/                  # YAML test files (playwright-yaml)
├── playwright.config.ts    # Playwright configuration
└── .features-gen/          # Generated BDD test files (gitignored)
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: iQuest Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - name: Install deps
        run: |
          cd .iquest
          npm ci
          npx playwright install --with-deps chromium
      - name: Run tests
        run: npm test
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          # OR for OpenCode:
          # OPENCODE_AUTH_TOKEN: ${{ secrets.OPENCODE_AUTH_TOKEN }}
```

### Required Secrets

| Provider | Secret Name | How to Get |
|----------|-------------|------------|
| Claude Code | `ANTHROPIC_API_KEY` | https://console.anthropic.com/settings/keys |
| OpenCode (GitHub Copilot) | `OPENCODE_AUTH_TOKEN` | `opencode auth token` (run locally, copy output) |

---

## Advanced Configuration

### Custom Model (Claude Code)

```bash
# In .iquest/.env
CLAUDE_MODEL=claude-sonnet-4-5
```

Or in code:
```typescript
import { runAgent, claudeCode } from 'iquest';
await runAgent(claudeCode('claude-sonnet-4-5'), prompt, page);
```

### Custom Model (OpenCode)

```bash
# In .iquest/.env
OPENCODE_MODEL=anthropic/claude-sonnet-4-5
```

Or in code:
```typescript
import { runAgent, openCode } from 'iquest';
await runAgent(openCode('anthropic/claude-sonnet-4-5'), prompt, page);
```

### Base URL for API Tests

```bash
# In .iquest/.env
BASE_URL=https://api.example.com
```

Then in steps:
```gherkin
* Call GET /users
* Response status should be 200
```

### Parallel Test Workers

```typescript
// playwright.config.ts
export default defineConfig({
  workers: process.env.CI ? 2 : undefined,  // Limit in CI
  fullyParallel: true,
});
```

---

## Common Patterns

### UI Test Step Verbs (use browser_* tools)

| Verb | Example |
|------|---------|
| Navigate | `Navigate to "https://example.com"` |
| Click | `Click "Submit" button` |
| Fill/Type | `Fill "Email" with "test@example.com"` |
| Press | `Press "Enter"` |
| Select | `Select "United States" from "Country"` |
| Hover | `Hover over "User menu"` |
| Verify | `Verify "Welcome" is visible` |

### API Test Step Verbs (use api_* tools)

| Verb | Example |
|------|---------|
| Request | `Call GET /api/users` |
| Request with body | `Call POST /api/users with body {"name": "John"}` |
| Assert status | `Response status should be 201` |
| Assert header | `Response header "Content-Type" should be "application/json"` |
| Assert body | `Response body should contain "John"` |

---

## Troubleshooting

### "I don't have access to browser automation tools"
Ensure you're on the latest version:
```bash
npm update @vsaripella/iquest
```

### Playwright-BDD v9+ "After" hook not found
Import from `createBdd()` return value:
```typescript
// ❌ Old (v8)
import { After } from 'playwright-bdd';

// ✅ New (v9+)
export const { Step, After } = createBdd(test);
```

### Tests timeout
Increase timeout in `playwright.config.ts`:
```typescript
export default defineConfig({
  timeout: 120_000,  // 2 minutes per test
  expect: { timeout: 10_000 },
});
```

### Agent makes no tool calls
The system prompt enforces at least one tool call per step. If you see this error, the model may be confused. Try:
- Simplify the step language
- Use more explicit verbs: "Click", "Fill", "Verify", "Navigate"
- Enable `OPENQA_VERBOSE=true` to see what the agent is thinking

---

## Quick Reference Card

```bash
# === ONE-TIME SETUP ===
nvm install 22 && nvm use 22
# Option A: Claude Desktop (just log in)
claude login
# Option B: OpenCode (any provider)
npm install -g @opencode-ai/cli && opencode auth login

# === PER PROJECT ===
mkdir my-tests && cd my-tests
npx @vsaripella/iquest init   # Interactive setup
cd .iquest
npm install
npx playwright install chromium

# === WRITE TESTS ===
# Edit features/*.feature  (Gherkin)
# OR .iquest/tests/*.yaml  (YAML)

# === RUN ===
npm test                 # Headless
npm run test:headed      # See browser
npm run test:ui          # Playwright UI
OPENQA_VERBOSE=true npm test  # Debug agent reasoning

# === CI ===
# Add ANTHROPIC_API_KEY or OPENCODE_AUTH_TOKEN to GitHub secrets
```

**You're ready!** 🎉 Start writing tests in plain English and let the AI agent drive the browser.
