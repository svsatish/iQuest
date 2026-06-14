# iQuest Playwright-BDD Project

AI-powered browser and API automation with Gherkin/BDD syntax.

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

   ```bash
   npm run test:report
   ```

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

## Hybrid UI + API Testing

This template supports hybrid testing out of the box. Mix UI and API steps in the same feature file:

```gherkin
Feature: User registration

  Scenario: Register via API, verify in UI
    * Call POST "/api/users" with body { "email": "test@example.com", "password": "secret" }
    * Verify the response status is 201
    * Navigate to "/login"
    * Fill "email" with "test@example.com"
    * Fill "password" with "secret"
    * Click "Submit"
    * Should see "Welcome, test@example.com"
```

The agent automatically chooses browser or API tools based on step content.

## Learn More

- [Playwright-BDD Documentation](https://vitalets.github.io/playwright-bdd/)