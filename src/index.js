import { Orchestrator } from './agent/Orchestrator.js';
import { claudeCode } from './agent/providers/claudeCode.js';
import { sessionManager } from './agent/SessionManager.js';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

let loadDotenv = async () => {};
try {
  const { config } = await import('dotenv');
  loadDotenv = async (options) => config(options);
} catch {
  loadDotenv = async () => {};
}

// Load environment variables from project's .env file (where the user runs the tests)
await loadDotenv();

// Fallback for monorepo/examples: load from package root if not found in cwd
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
await loadDotenv({ path: join(__dirname, '..', '.env') });

/**
 * Run agent with a natural language instruction.
 * Works for both browser (UI) and API testing - the agent automatically chooses
 * the right toolset based on the step content.
 *
 * @param {object} provider - Agent Provider (e.g. claudeCode('claude-haiku-4-5') or openCode('model'))
 * @param {string} prompt - Natural language instruction
 * @param {Page|BrowserContext|object} context - Playwright page, browser context, or API request context/state object
 * @param {object} options - Optional configuration
 * @param {string} [options.baseUrl] - Base URL for API requests (when using API context)
 * @param {boolean} [options.verbose=true] - Enable logging
 * @param {boolean} [options.returnUsage=false] - Return token usage stats
 */
export async function runAgent(provider, prompt, context, options = {}) {
  const orchestrator = new Orchestrator(options);
  return orchestrator.run(provider, prompt, context);
}

/**
 * Reset the session for a specific context (browser context or API context object)
 * @param {BrowserContext|object} context - The context to reset
 * @returns {string|null} - The session ID that was reset, or null if none existed
 */
runAgent.resetSession = function (context) {
  const sessionId = sessionManager.resetSession(context);
  sessionManager.resetApiState(context);
  return sessionId;
};

export { Orchestrator };
export { claudeCode } from './agent/providers/claudeCode.js';
export { openCode } from './agent/providers/openCode.js';
export { UNIFIED_SYSTEM_PROMPT } from './agent/systemPrompt.js';