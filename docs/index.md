---
layout: home

hero:
  name: iQuest
  text: Agentic Test Harness
  tagline: Discover · Validate · Assure
  actions:
    - theme: brand
      text: Quickstart
      link: /quickstart
    - theme: alt
      text: How It Works
      link: /how-it-works
    - theme: alt
      text: GitHub
      link: https://github.com/svsatish/iQuest

features:
  - title: AI-Powered Browser & API Testing
    icon: 🤖
    details: Write tests in plain English — the agent figures out selectors and API calls automatically.
  - title: No Selectors. Ever.
    icon: 🪄
    details: The agent navigates by intent. No CSS selectors, no XPath, no brittle locators to maintain. Survives any UI refactor automatically.
  - title: Unified UI + API
    icon: 🔗
    details: One feature file, one step definition, one `runAgent()` call handles both browser and API steps seamlessly.
  - title: CI-Grade Evidence
    icon: 📊
    details: Full HTML report, trace viewer, and screenshot diffs on every run. Ship to production with proof, not hope.
  - title: No API Key Locally
    icon: 🛡️
    details: Uses your existing `claude login` or `opencode auth login` session. API keys only needed for CI.
  - title: 2-Minute Setup
    icon: 🚀
    details: '`npx @vsaripella/iquest init` scaffolds a complete `.iquest/` harness into your existing project.'
  - title: Dual Engine
    icon: ⚡
    details: "[opencode](https://opencode.ai) (70+ providers) or [Claude Code SDK](https://claude.ai/code). Pick one."
---

## All You Need to Write

A `.feature` file:

```gherkin
Feature: TodoMVC Automation

  Scenario: Add todo item
    * Navigate to "https://demo.playwright.dev/todomvc/"
    * Add a new todo item "Buy groceries"
    * Should see "Buy groceries" in the todo list
```

Then run:

```bash
npx @vsaripella/iquest init   # one-time setup
cd .iquest
npm run test:headed
```

That's it. No step definitions. No selectors. No code.

> **Node.js requirement:** Scaffolded projects require **Node 22+** (for varlock env validation). The iQuest library itself works on **Node 18+**. We recommend Node 22 LTS.

## UI & API Examples

### Browser (UI) Test

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

### API Test

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

### Hybrid UI + API

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

## Quick Links

- [Quickstart](/quickstart) — Set up in 2 minutes
- [How It Works](/how-it-works) — Architecture and design decisions
- [GitHub](https://github.com/svsatish/iQuest) — Source code and examples
- [npm](https://www.npmjs.com/package/@vsaripella/iquest) — Package on npm
