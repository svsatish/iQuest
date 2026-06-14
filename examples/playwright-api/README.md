# iQuest Playwright Hybrid Example

This example demonstrates using `iquest` to write hybrid UI + API tests in plain English with feature files.

It defaults to `openCode('opencode/nemotron-3-ultra-free')`.

## Setup

Install dependencies:

```bash
npm install
```

**Authentication:**

Use OpenCode credentials (recommended):
```bash
opencode auth login
```

Or set your provider API key:
```bash
cp .env.example .env
# Edit .env and add the relevant provider key
```

## Run Tests

```bash
npm test
```

## What's Demonstrated

1. Writing hybrid UI + API scenarios in `.feature` files
2. Using one generic AI step with a single `runAgent()` call for both UI and API steps
3. Creating a Playwright `request` context fixture
4. Running against a built-in mock API server by default

By default the example spins up a tiny mock API server. To target a real service, set `BASE_URL` in `.env`.