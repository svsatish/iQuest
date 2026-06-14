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

<style>
/* Center hero content and improve spacing */
.VPHomeHero {
  text-align: center;
}

.VPHomeHero .text {
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.VPHomeHero .tagline {
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--vp-c-brand-1);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 2rem;
}

.VPHomeHero .actions {
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Improve feature grid */
.VPFeatures {
  max-width: 1000px;
  margin: 0 auto;
}

.VPFeature {
  transition: transform 0.2s, box-shadow 0.2s;
}

.VPFeature:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
}

/* Better spacing for sections after hero */
.VPDoc > .container {
  max-width: 800px;
  margin: 0 auto;
  padding-top: 3rem;
}

.VPDoc h2 {
  text-align: center;
  margin-bottom: 2rem;
}

.VPDoc pre {
  border-radius: 8px;
}
</style>