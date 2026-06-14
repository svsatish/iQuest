---
layout: home

hero:
  name: iQuest
  text: Agentic Test Harness
  tagline: Discover · Validate · Assure
  image:
    src: /hero-illustration.svg
    alt: iQuest architecture — AI agent orchestrating browser and API testing
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
    details: '`npx iquest init` scaffolds a complete `.iquest/` harness into your existing project.'
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
npx iquest init   # one-time setup
cd .iquest
npm run test:headed
```

That's it. No step definitions. No selectors. No code.

## Quick Links

- [Quickstart](/quickstart) — Set up in 2 minutes
- [How It Works](/how-it-works) — Architecture and design decisions
- [GitHub](https://github.com/svsatish/iQuest) — Source code and examples
- [npm](https://www.npmjs.com/package/iquest) — Package on npm