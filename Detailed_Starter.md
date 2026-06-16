# iQuest — Detailed Starter Guide

A step-by-step guide to setting up and running iQuest (agentic browser & API test automation) from scratch.

---

## 1. Prerequisites

### 1.1 Node.js (≥ 18)

```bash
# Check your version
node --version
# Should output v18.x.x or higher

# If not installed, use nvm (recommended):
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc  # or ~/.zshrc
nvm install 20
nvm use 20
```

### 1.2 Git

```bash
git --version
```

### 1.3 Playwright Browsers

```bash
# After installing project dependencies (step 3), run:
npx playwright install chromium
# Or install all browsers:
npx playwright install
```

---

## 2. AI Model Access — Choose ONE Provider

iQuest supports two AI provider backends. You only need **one** configured.

---

### Option A: Claude Code (Anthropic) — **Recommended for Claude Desktop users**

> **You already have Claude Desktop** — this uses your existing login session automatically.

**No API key needed** if you're logged into Claude Desktop.

1. Verify you're logged in:
   ```bash
   # Open Claude Desktop → Settings → Account → verify you're signed in
   ```

2. The `@anthropic-ai/claude-agent-sdk` will detect your local session automatically.

> **Note:** If you prefer using an API key instead (e.g., for CI), set `ANTHROPIC_API_KEY` in your `.env` file.

---

### Option B: OpenCode (GitHub Copilot / GitLab Duo / OpenAI / Anthropic / etc.)

> **You have GitHub Copilot via company SSO** — this is perfect for OpenCode.

1. Install OpenCode CLI:
   ```bash
   npm install -g @opencode-ai/cli
   # or
   curl -fsSL https://opencode.ai/install | bash
   ```

2. Authenticate with your provider:
   ```bash
   opencode auth login
   # Select "GitHub Copilot" → follow browser SSO flow
   ```

3. Verify:
   ```bash
   opencode auth status
   # Should show: authenticated with GitHub Copilot
   ```

> **Note:** OpenCode supports many providers (GitHub Copilot, GitLab Duo, Anthropic direct, OpenAI, Azure, etc.). Pick whatever your company provides.

---

## 3. Create a New Project (Quick Start)

### 3.1 Scaffold a New Test Project

```bash
# Create a folder for your tests
mkdir my-iquest-tests && cd my-iquest-tests

# Run the interactive init wizard
npx iquest init
```

The wizard will prompt you for:

| Prompt | Recommended Choice |
|--------|-------------------|
| **Agent** | `claude-code` (if using Claude Desktop) or `opencode` (if using GitHub Copilot) |
| **Model** | `claude-haiku-4-5` (fast/cheap) or `claude-sonnet-4-5` (smarter) / `opencode/nemotron-3-ultra-free` |
| **Framework** | `playwright-bdd` (Gherkin `.feature` files) or `playwright-yaml` (YAML test definitions) |
| **Feature path** | `features` (default) |

This creates:
```
my-iquest-tests/
├── .openqa/
│   ├── .env              # Your secrets (gitignored)
│   ├── .env.schema       # VarLock schema (committed)
│   ├── .env.example      # Template for .env
│   ├── package.json
│   └── node_modules/
├── features/             # Your test definitions
├── playwright.config.ts
└── package.json
```

### 3.2 Install Dependencies

```bash
cd .openqa
npm install
# This installs: @playwright/test, playwright-bdd, @anthropic-ai/claude-agent-sdk (or @opencode-ai/sdk), varlock, etc.
```

### 3.3 Install Playwright Browsers

```bash
npx playwright install chromium
```

### 3.4 Configure Environment (Optional)

```bash
cd .openqa
cp .env.example .env
# Edit .env if you need to override:
# - BASE_URL (for API tests)
# - ANTHROPIC_API_KEY (only if NOT using Claude Desktop login)
# - OPENCODE_MODEL (if using OpenCode)
```

> **For Claude Desktop users:** No `.env` edits needed — it uses your logged-in session.

> **For GitHub Copilot users:** No `.env` edits needed — it uses your `opencode auth login` session.

---

## 4. Write Your First Test

### 4.1 Using Playwright-BDD (Gherkin)

Edit `features/example.feature`:

```gherkin
Feature: TodoMVC

  Scenario: Add a todo item
    * Navigate to "https://demo.playwright.dev/todomvc/"
    * Fill "What needs to be done?" with "Learn iQuest"
    * Press "Enter"
    * Verify "Learn iQuest" is visible in the todo list
```

### 4.2 Using Playwright-YAML

Edit `.openqa/tests/example.spec.yaml`:

```yaml
- name: "Add a todo item"
  steps:
    - "Navigate to https://demo.playwright.dev/todomvc/"
    - "Fill 'What needs to be done?' with 'Learn iQuest'"
    - "Press 'Enter'"
    - "Verify 'Learn iQuest' is visible in the todo list"
```

---

## 5. Run Tests

```bash
cd .openqa

# Playwright-BDD
npm test

# Playwright-YAML
npx openqa generate && npm test

# Headed mode (see browser)
npm test -- --headed

# With UI mode
npm test -- --ui

# Verbose logging (see agent reasoning & tool calls)
OPENQA_VERBOSE=true npm test
```

---

## 6. Project Structure Explained

```
.openqa/                    # Test runner workspace (created by `iquest init`)
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

## 7. CI/CD Integration

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
          node-version: '20'
      - name: Install deps
        run: |
          cd .openqa
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

## 8. Troubleshooting

### "I don't have access to browser automation tools"
**Fixed in v0.0.23+** — ensure you're on the latest version:
```bash
npm update iquest
# or in .openqa:
npm update openqa
```

### "Module not found: iquest"
Use the correct import:
```typescript
// ❌ Wrong
import { runAgent } from 'iquest';

// ✅ Correct
import { runAgent } from 'openqa';
```

### Playwright-BDD v9+ "After" hook not found
Import from `createBdd()` return value:
```typescript
// ❌ Old (v8)
import { After } from 'playwright-bdd';

// ✅ New (v9+)
export const { Step, After } = createBdd(test);
```

### Browser fixture "use() was not called"
Pass the browser from base test:
```typescript
export const test = base.extend<Fixtures>({
  browser: async ({ browser }, use) => {
    await use(browser);  // ← Required
  },
});
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

## 9. Advanced Configuration

### Custom Model (Claude Code)

```bash
# In .openqa/.env
CLAUDE_MODEL=claude-sonnet-4-5
```

Or in code:
```typescript
import { runAgent, claudeCode } from 'openqa';
await runAgent(claudeCode('claude-sonnet-4-5'), prompt, page);
```

### Custom Model (OpenCode)

```bash
# In .openqa/.env
OPENCODE_MODEL=anthropic/claude-sonnet-4-5
```

Or in code:
```typescript
import { runAgent, openCode } from 'openqa';
await runAgent(openCode('anthropic/claude-sonnet-4-5'), prompt, page);
```

### Base URL for API Tests

```bash
# In .openqa/.env
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

## 10. Common Patterns

### UI Test Step Verbs (use browser_* tools)
| Verb | Example |
|------|---------|
| Navigate | `Navigate to "https://example.com"` |
| Click | `Click "Submit" button` |
| Fill/Type | `Fill "Email" with "test@example.com"` |
| Press | `Press "Enter"` |
| Select | `Select "United States" from "Country"` |
| Hover | `Hover over "User menu"` |
| Drag | `Drag "Item 1" to "Folder A"` |
| Verify | `Verify "Welcome" is visible` |
| Screenshot | `Take a screenshot` |

### API Test Step Verbs (use api_* tools)
| Verb | Example |
|------|---------|
| Request | `Call GET /api/users` |
| Request with body | `Call POST /api/users with body {"name": "John"}` |
| Assert status | `Response status should be 201` |
| Assert header | `Response header "Content-Type" should be "application/json"` |
| Assert body | `Response body should contain "John"` |
| Assert JSON | `Response JSON field "users[0].name" should be "John"` |

### Hybrid (UI + API)
```gherkin
Scenario: Create user via API then verify in UI
  * Call POST /api/users with body {"name": "Test User", "email": "test@example.com"}
  * Response status should be 201
  * Navigate to "https://app.example.com/users"
  * Verify "Test User" is visible in the user table
```

---

## 11. Getting Help

- **Documentation:** https://github.com/svsatish/iQuest#readme
- **Issues:** https://github.com/svsatish/iQuest/issues
- **Playwright-BDD:** https://github.com/playwright-community/playwright-bdd
- **Claude Agent SDK:** https://github.com/anthropics/claude-agent-sdk
- **OpenCode:** https://opencode.ai

---

## 12. Quick Reference Card

```bash
# === ONE-TIME SETUP ===
nvm install 20 && nvm use 20
# Option A: Claude Desktop (just log in)
# Option B: GitHub Copilot
npm install -g @opencode-ai/cli && opencode auth login

# === PER PROJECT ===
mkdir my-tests && cd my-tests
npx iquest init          # Interactive setup
cd .openqa
npm install
npx playwright install chromium

# === WRITE TESTS ===
# Edit features/*.feature  (Gherkin)
# OR .openqa/tests/*.yaml  (YAML)

# === RUN ===
npm test                 # Headless
npm test -- --headed     # See browser
npm test -- --ui         # Playwright UI
OPENQA_VERBOSE=true npm test  # Debug agent reasoning

# === CI ===
# Add ANTHROPIC_API_KEY or OPENCODE_AUTH_TOKEN to GitHub secrets
```

---

**You're ready!** 🎉 Start writing tests in plain English and let the AI agent drive the browser.