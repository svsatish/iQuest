# iQuest Playwright Hybrid BDD Project

Plain-English hybrid UI + API testing with iQuest and Playwright request contexts.

This starter defaults to `openCode('gitlab/duo-chat-haiku-4-5')`.

## Setup

1. **Authentication** (choose one):

   ```bash
   # Option 1: OpenCode (Recommended)
   opencode auth login

   # Option 2: Claude Code (alternative)
   claude login

   # Option 3: API key for CI or direct provider access
   cp .env.example .env
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

This starter ships with feature files in `features/` and a generic AI step in `features/steps/steps.ts`.
It demonstrates how to:

- create a request context fixture
- use a single `runAgent()` call for both UI and API steps
- make requests in plain English
- navigate and verify browser pages in the same feature file

By default the starter spins up a tiny mock API server. To point the tests at a real API, set `BASE_URL` in `.env`.

## Learn More

- [Playwright BDD Documentation](https://playwright-bdd.dev)