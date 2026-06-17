# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

iQuest is an agent harness for browser test automation — write tests in plain English, let the agent navigate a real browser. The same agent that builds your product can verify it. It integrates with Playwright-BDD, Cucumber.js, and YAML-based test definitions.

**Key architecture:** Uses a **unified SDK architecture** — both `Codex` and `openCode` providers expose Playwright MCP over HTTP/SSE and implement a single `provider.run()` interface. The Orchestrator is a thin coordinator (~50 lines) that wires MCP to the provider.

## Common Commands

### Development & Testing
```bash
# Install dependencies
npm install

# Run example tests
cd examples/playwright-bdd && npm test
cd examples/cucumberjs && npm test
cd examples/playwright-yaml && npm test

# Run CLI init wizard
node src/cli/bin.js init

# Generate Playwright tests from YAML
npx @vsaripella/iquest generate [paths...]
npx @vsaripella/iquest generate --watch  # Watch mode

# Test with local file link (before publishing)
cd .iquest && npm install file:..
```

### Publishing & Release
```bash
# Version bump (automatically commits and tags)
npm version patch   # 0.0.x -> 0.0.(x+1)
npm version minor   # 0.x.0 -> 0.(x+1).0
npm version major   # x.0.0 -> (x+1).0.0

# Publish to npm
git push && git push --tags
npm publish
```

### Playwright-BDD Specific
```bash
npm run bddgen        # Generate BDD test files from .feature files
npm run bddgen && npm test
```

## Architecture

```
runAgent(provider, prompt, page/context)
  └─ Orchestrator.run()
       ├─ createMcpHttpServer(browserContext) → { url, cleanup }
       │    Playwright MCP exposed over HTTP/SSE on a random localhost port
       ├─ provider.run(prompt, { mcpUrl, existingSessionId, ... })
       │    ├─ Codex → @anthropic-ai/Codex-agent-sdk query()
       │    └─ openCode   → @opencode-ai/sdk createOpencode()
       ├─ sessionManager.setSession(browserContext, result.sessionId)
       └─ cleanup()
```

### Core Files

**`src/agent/Orchestrator.js`** — thin coordinator: resolves browser context, creates MCP server, calls `provider.run()`, stores session ID, runs cleanup.

**`src/agent/createMcpServer.js`** — creates a Playwright MCP server (`@playwright/mcp`) and exposes it over HTTP/SSE on a random `127.0.0.1` port. Wraps the browser context with a no-op `.close()` so MCP never disposes it. Returns `{ url, cleanup }`.

**`src/agent/systemPrompt.js`** — shared Playwright agent system prompt constant. Imported by both providers to ensure identical agent instructions regardless of backend.

**`src/agent/providers/Codex.js`** — uses `@anthropic-ai/Codex-agent-sdk` `query()`. MCP config: `{ type: 'http', url: mcpUrl }`. Has a `Stop` hook to enforce at least one Playwright tool call per step. Detects assertion failures from `tool_result` blocks with `is_error: true`.

**`src/agent/providers/openCode.js`** — uses `@opencode-ai/sdk` `createOpencode()`. MCP config: `{ type: 'remote', url: mcpUrl }`. Calls `promptAsync()` (fire-and-forget) then iterates the SSE event stream, processing `message.part.updated`, `session.idle`, `session.error`. Auto-approves permission events. Detects assertion failures from both `ToolStateError` and `ToolStateCompleted` with `### Error` output (MCP `isError:true` maps to the latter).

**`src/agent/SessionManager.js`** — `WeakMap<BrowserContext, sessionId>`. Enables session resumption across steps within the same scenario.

### Provider Interface

```js
{
  name: string,
  run(prompt, { mcpUrl, existingSessionId, verbose, returnUsage, logger })
    → Promise<{ result, usage?, steps, sessionId }>
}
```

### CLI System (`src/cli/`)

- `iquest init` — Interactive wizard: Agent → Model → Framework → Feature path. Scaffolds `.iquest/`, installs the chosen agent SDK + varlock, optionally installs Playwright browsers. Shows spinner progress during file creation.
- `iquest generate [paths...]` — Converts YAML test files to Playwright `.spec.js`.

Templates at `src/cli/templates/<framework>/`. Each template includes `.env.schema` (varlock schema, committed) and `.env.example` (copy-to-.env guide).

### Export Structure

```js
export { runAgent }       // main entry point
export { Codex }     // @anthropic-ai/Codex-agent-sdk provider
export { openCode }       // @opencode-ai/sdk provider
export { Orchestrator }
```

**Peer Dependencies** (all optional except `@playwright/test`):
- `@anthropic-ai/Codex-agent-sdk` >=0.2 — required for `Codex`
- `@opencode-ai/sdk` >=1.14 — required for `openCode`
- `@playwright/test` ^1.57.0 (required)
- `playwright-bdd` ^8.0.0, `@cucumber/cucumber` ^11.0.0 (optional)

## Critical Implementation Details

### Parallel-Safe Execution

Each `runAgent()` call creates its own HTTP server on a random `127.0.0.1` port. Parallel test workers get separate ports — no shared state, no config files.

### Tool Enforcement

Both providers reject any step where the agent made **zero Playwright tool calls**. Prevents hallucinated responses without browser interaction.

### Context Resolution

Both `Page` and `BrowserContext` are accepted:
```javascript
if (pageOrContext.context && typeof pageOrContext.context === 'function') {
  browserContext = pageOrContext.context();   // Page → extract context
} else {
  browserContext = pageOrContext;             // already a BrowserContext
}
```

### Environment Variable Loading

**Scaffolded `.iquest/` projects** use [varlock](https://varlock.dev) (Node.js 22+ required). `varlock run --` in npm scripts pre-injects validated env vars before the test process starts. The `.env.schema` file documents all variables with types and descriptions; secrets are redacted from logs automatically. Schema header format:
```
# @defaultSensitive=true @defaultRequired=false
# @generateTypes(lang=ts, path=env.d.ts)
# ---
```

**iQuest library itself** (`src/index.js`) uses dotenv directly — no varlock dependency:
1. `.iquest/.env` — loaded by dotenv (cwd when tests run from `.iquest/`)
2. Parent project `.env` (`../.env`) — fallback for monorepo setups
3. Shell environment — `ANTHROPIC_API_KEY` (Codex) or the relevant provider key (openCode)

For local development, no `.env` is needed if already logged in:
- **Codex** — uses the existing `Codex login` session automatically
- **OpenCode** — uses the existing `opencode auth login` session (e.g. GitLab Duo) automatically

### Feature File Step Syntax

The step definition uses `/^(.*)$/` to match any step text. Both `Given`/`When`/`Then` and `*` (asterisk) work identically.

## Examples Directory

- `playwright-bdd/` — Playwright-BDD with `.feature` files
- `playwright-yaml/` — YAML-based tests via `npx @vsaripella/iquest generate`
- `cucumberjs/` — Cucumber.js integration

All examples use `"@vsaripella/iquest": "file:../.."` for local development and require the relevant agent SDK installed alongside (e.g. `npm install @anthropic-ai/Codex-agent-sdk`).

## Testing Strategy

Before any release:
1. `cd examples/playwright-bdd && npm test`
2. `node src/cli/bin.js init` in a temp directory
3. `cd .iquest && npm install file:..`
4. Verify `npm pack` includes only `src/`, `README.md`, `LICENSE`

## Module System

**ES Modules only** (`"type": "module"`). All imports require `.js` extensions. No CommonJS.

## Anti-Patterns to Avoid

1. **Don't skip tool calls** — both providers enforce at least one Playwright tool per step
2. **Don't break session continuity** — session reuse is critical for multi-step scenarios
3. **Don't dispose the browser context in MCP** — the no-op `.close()` wrapper in `createMcpServer.js` is critical
4. **Don't add a new provider without the uniform interface** — every provider must implement `run(prompt, options) → { result, steps, sessionId }`
5. **Don't use `session.prompt()` in openCode** — use `promptAsync()`. `prompt()` blocks until the full response is ready; `session.idle` fires while you're blocked so the event is missed and the loop hangs indefinitely.
6. **Don't assume MCP `isError:true` maps to `ToolStateError`** — OpenCode maps it to `ToolStateCompleted` with the error text in `part.state.output` starting with `### Error`. Check both states when detecting assertion failures.
