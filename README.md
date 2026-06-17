<img src="docs/assets/logo_light_mode.svg" height="40" alt="iQuest" />

# iQuest Agentic Test Harness
**Discover. Validate. Assure.**

AI-powered browser and API test automation. Write tests in plain English — the agent figures out the selectors or API calls.

[![npm version](https://badge.fury.io/js/@vsaripella%2Fiquest.svg)](https://www.npmjs.com/package/@vsaripella/iquest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Quick Start

**1. Check prerequisites**

See [Prerequisites](#prerequisites) below for detailed OS-specific install steps.

**2. Scaffold the harness:**
```bash
npx @vsaripella/iquest init
```

**3. Run tests:**
```bash
cd .iquest && npm test
```

No step definitions. No selectors. No code.

---

## Prerequisites

| Tool | Minimum Version | Why |
|------|----------------|-----|
| **Node.js** | 18+ (library), 22+ (scaffolded projects) | Core library runs on 18+. Scaffolded `.iquest/` projects need 22+ for [varlock](https://varlock.dev) env validation. |
| **Git** | Any | For cloning examples and CI integration. |
| **Playwright Browsers** | — | Installed automatically by `npx playwright install chromium`. |

### Checking & Installing

#### macOS

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

#### Windows

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

> **Tip:** Use a version manager (`nvm`, `fnm`, `volta`, or `nvm-windows`) to switch Node versions per project.

---

## Features

- **No selectors. Ever.** — Agent navigates by intent. Survives any UI refactor automatically.
- **Unified UI + API** — One feature file, one step definition, one `runAgent()` call handles both browser and API steps.
- **CI-grade evidence** — HTML report, trace viewer, and screenshots on every run.
- **No API key locally** — Uses your existing `claude login` or `opencode auth login` session.
- **2-minute setup** — `npx @vsaripella/iquest init` scaffolds the complete harness.
- **Dual-engine** — [opencode](https://opencode.ai) (70+ providers) or [Claude Code SDK](https://claude.ai/code). Pick one.
- **BDD & YAML** — Playwright-BDD, Cucumber.js, or YAML.

**Powered by:** [Claude Code SDK](https://claude.ai/code) • [opencode](https://opencode.ai) • [Playwright MCP](https://github.com/microsoft/playwright-mcp) • [Playwright-BDD](https://github.com/vitalets/playwright-bdd) • [Cucumber.js](https://github.com/cucumber/cucumber-js)

---

## How It Works

1. Your BDD step definitions call `runAgent(provider, 'natural language step', context)` where context is a Playwright `page`, `browserContext`, or a Playwright `request` fixture (for API).
2. iQuest creates a unified MCP server in-process exposing both browser tools and API tools, over HTTP/SSE on a random localhost port.
3. The chosen AI provider SDK connects to that MCP URL and receives your natural language instruction.
4. The agent decides which toolset to use based on the step content:
   - **UI steps** → Playwright MCP tools (`browser_navigate`, `browser_click`, `browser_type`, etc.)
   - **API steps** → API MCP tools (`api_request`, `api_assert_status`, `api_assert_json_field`, etc.)
5. The step passes or fails based on what the agent reports back.

**Key design decisions:**
- **True browser sharing** — the agent drives the exact same page object your test holds.
- **Parallel-safe** — each test worker gets its own HTTP port. No shared config files.
- **Session resumption** — within a scenario, the agent resumes its conversation across steps.
- **Multi-provider** — swap `claudeCode` for `openCode` with a one-line change.

---

## Examples

### UI Test Example

From [`examples/playwright-bdd/features/ui.feature`](examples/playwright-bdd/features/ui.feature):

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

From [`examples/playwright-bdd/features/api.feature`](examples/playwright-bdd/features/api.feature):

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

### Hybrid UI + API Scenario

A single scenario can seamlessly mix browser and API steps:

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
- Words like `navigate`, `click`, `fill`, `should see`, `verify element` → **browser tools**
- Words like `call GET/POST`, `api`, `endpoint`, `request`, `response`, `status`, `header`, `json`, `body` → **API tools**

---

## Authentication

**No API key needed for local development** — just log in once:

```bash
# Claude Code
claude login

# OpenCode (supports GitLab Duo, GitHub Copilot, Anthropic, OpenAI, Google, …)
opencode auth login
```

For CI or explicit keys, copy `.iquest/.env.example` to `.iquest/.env` and add the relevant key:

```bash
# Claude Code
ANTHROPIC_API_KEY=your_key

# OpenCode — whichever provider you're connecting to
ANTHROPIC_API_KEY=your_key
# OPENAI_API_KEY=your_key
# GOOGLE_API_KEY=your_key
```

---

## Environment Variables

The `.iquest/` directory uses [varlock](https://varlock.dev) for environment variable management. Variables are defined in `.env.schema` (committed) and values go in `.env` (gitignored). Secrets are automatically redacted from logs.

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

---

## Customizing Your Setup

`iquest init` creates a working starting point — everything in `.iquest/` is yours to edit.

**Playwright config** — `.iquest/playwright.config.ts` is a standard [Playwright config](https://playwright.dev/docs/test-configuration). Add projects, change timeouts, add reporters, enable retries for CI.

**Step definitions** — `.iquest/steps/steps.ts` is a regular [Playwright-BDD](https://playwright-bdd.dev) step file. Add custom (non-AI) steps alongside the AI step, or add Before/After hooks.

**Changing model or provider** — open `.iquest/steps/steps.ts` and edit the provider call. Swap `claudeCode` for `openCode`, or change the model string — that's the only change needed.

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

### `claudeCode(model?)`

```javascript
import { claudeCode } from 'iquest';
const provider = claudeCode('claude-haiku-4-5'); // default
```

### `openCode(model?)`

```javascript
import { openCode } from 'iquest';
const provider = openCode('gitlab/duo-chat-haiku-4-5'); // GitLab Duo (default in init)
// or: openCode('github-copilot/gpt-5.4'), openCode('anthropic/claude-sonnet-4-6'), etc.
```

Requires `@opencode-ai/sdk` to be installed.

---

## Examples Directory

- [`examples/playwright-bdd/`](examples/playwright-bdd/) — Playwright-BDD with `.feature` files (includes UI + API examples)
- [`examples/playwright-yaml/`](examples/playwright-yaml/) — YAML-based tests via `npx @vsaripella/iquest generate`
- [`examples/playwright-api/`](examples/playwright-api/) — Hybrid UI + API tests (unified approach)
- [`examples/cucumberjs/`](examples/cucumberjs/) — Cucumber.js integration

---

## Requirements

- **iQuest library:** Node.js 18+
- **Scaffolded `.iquest/` project:** Node.js 22+ (required by varlock)
- `@playwright/test` ^1.57.0
- One of: `@anthropic-ai/claude-agent-sdk` (for `claudeCode`) or `@opencode-ai/sdk` (for `openCode`)

---

## Links

- **NPM:** https://www.npmjs.com/package/@vsaripella/iquest
- **GitHub:** https://github.com/svsatish/iQuest
- **Documentation (GitHub Pages):** https://svsatish.github.io/iQuest/

## License

MIT
