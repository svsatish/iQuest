# iQuest YAML Tests

Write Playwright tests in YAML using natural language. Supports both UI and API testing — the AI agent automatically chooses the right toolset based on your step content.

## Quick Start

1. **Write a YAML test** in `tests/`:

```yaml
name: My Tests
tests:
  - name: Test something
    steps:
      - Navigate to home page
      - Click the login button
      - Verify dashboard is visible
```

2. **Run tests**:

```bash
npm test
```

That's it! Tests auto-generate and run with Playwright.

## How It Works

- ✅ Write tests in **`tests/*.spec.yaml`** (committed to git)
- ✅ Run `npm test` (auto-generates `.tests-gen/*.spec.js`)
- ❌ `.tests-gen/` is gitignored (never commit generated files)

Each YAML step becomes a `test.step()` in Playwright, giving you:
- Beautiful test reports
- Trace viewer integration
- Screenshots and videos
- Full Playwright power

## UI + API Testing (Hybrid)

A single test suite can mix browser and API steps seamlessly. The agent automatically selects the right toolset:

```yaml
name: Hybrid Tests
defaultContext: browser

tests:
  - name: Create via API, verify in UI
    context: api
    steps:
      - Call POST /users with body {"name": "Test User"}
      - Verify the response status is 201

  - name: Verify user appears in UI
    context: browser
    steps:
      - Navigate to /users
      - Should see "Test User" in the user list
```

**How the agent decides:**
- Words like "navigate", "click", "fill", "type", "should see", "verify element" → **browser tools**
- Words like "call GET/POST/PUT/DELETE", "api", "endpoint", "request", "response", "status", "header", "json", "body" → **API tools**

## Workflow

### Development
```bash
# Edit YAML tests
vim tests/login.spec.yaml

# Run (auto-generates + runs)
npm test

# Or run with UI
npm run test:ui

# Run specific test file
npx iquest generate tests/login.spec.yaml && playwright test .tests-gen/login.spec.js
```

### Git
```bash
git add tests/login.spec.yaml   # ✅ Commit YAML (source)
git add .tests-gen/             # ❌ Already gitignored
git commit -m "Add login tests"
```

### CI/CD
```yaml
- run: npm install
- run: npx playwright install chromium
- run: npm test  # Generates + runs
```

## YAML Schema

```yaml
name: Test Suite Name                    # Required

defaultContext: browser                  # Optional: 'browser' or 'api' (default: 'browser')
                                         # Sets default for all tests without explicit context

url: https://example.com                 # Optional: Base URL for documentation

hooks:                                   # Optional: Test hooks
  beforeEach:                            # Steps before each test
    - Clear cookies
  afterEach:                             # Steps after each test
    - Logout

tests:                                   # Required: Array of test cases
  - name: Test name                      # Required
    context: browser                     # Optional: 'browser' or 'api' (overrides defaultContext)
    tags: [smoke, critical]              # Optional: Tags for filtering
    steps:                               # Required: Natural language steps
      - Step in natural language
      - Another step
      - Verify something
    slow: false                          # Optional: Mark as slow test
    skip: "Reason for skipping"          # Optional: Skip test with reason
    only: false                          # Optional: Run only this test
    data:                                # Optional: Data-driven tests
      - { username: "user1" }
      - { username: "user2" }
```

### Data-Driven Tests

```yaml
tests:
  - name: Login as {{username}}
    context: browser
    data:
      - { username: "alice", password: "secret1" }
      - { username: "bob", password: "secret2" }
    steps:
      - Navigate to /login
      - Fill username with "{{username}}"
      - Fill password with "{{password}}"
      - Click login button
```

## Authentication

Choose ONE method in `.env`:

**Option A: OpenCode (multi-provider — GitLab Duo, GitHub Copilot, Anthropic, OpenAI, Google)**
```bash
opencode auth login
```

**Option B: API Key (for CI)**
```bash
cp .env.example .env
# Edit .env and add provider key:
# ANTHROPIC_API_KEY=your_key
# or
# OPENAI_API_KEY=your_key
# or
# GOOGLE_API_KEY=your_key
```

**Option C: Claude Code CLI**
```bash
claude login
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `BASE_URL` | App URL — sets Playwright `baseURL` and is injected into agent prompts |
| `APP_USERNAME` | Username for login steps |
| `APP_PASSWORD` | Password for login steps (redacted from logs) |
| `API_TOKEN` | API Bearer token for API steps (redacted from logs) |
| `OPENQA_VERBOSE` | Set `false` to suppress agent logs |
| `HEADLESS` | Set `false` to watch the browser |

## Examples

See `tests/` for examples:
- `example.spec.yaml` — Basic browser test
- `api-example.spec.yaml` — Pure API tests
- `hybrid-example.spec.yaml` — Mixed UI + API tests

## Learn More

- [iQuest Documentation](https://github.com/svsatish/iQuest)
- [Playwright Documentation](https://playwright.dev)