# iQuest Cucumber.js Project

AI-powered browser automation with Cucumber/Gherkin syntax.

## Setup

1. **Authentication** (choose one):

   ```bash
   # Option 1: Claude Code (Recommended)
   claude login

   # Option 2: OpenCode (multi-provider)
   opencode auth login

   # Option 3: API Key
   cp .env.example .env
   # Edit .env and add your ANTHROPIC_API_KEY (or other provider key)
   ```

2. **Run tests**:

   ```bash
   npm test
   ```

3. **View test report**:

   Open `cucumber-report.html` in your browser

## Writing Tests

Create `.feature` files in the `features/` directory using Gherkin syntax:

```gherkin
Feature: My Feature

  Scenario: My Scenario
    * Navigate to "https://example.com"
    * Click on the "Sign In" button
    * Fill in "email" with "test@example.com"
    * Fill in "password" with "password123"
    * Click the "Login" button
    * Should see "Welcome back!" on the page
```

The AI agent automatically handles all steps - no code required!
Browser setup and teardown is handled automatically.

## Learn More

- [Cucumber.js Documentation](https://github.com/cucumber/cucumber-js)