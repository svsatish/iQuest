import { sessionManager } from './SessionManager.js';
import { Logger } from './Logger.js';
import { UNIFIED_SYSTEM_PROMPT } from './systemPrompt.js';

export class Orchestrator {
    constructor(options = {}) {
        this.options = options;
        this.verbose = options.verbose !== false;
        this.logger = new Logger(this.verbose);
    }

    async run(provider, prompt, pageOrContext) {
        // Detect if it's a browser context (Page or BrowserContext) or an API context (generic object)
        const isBrowserContext = pageOrContext && typeof pageOrContext === 'object' && (
            typeof pageOrContext.newPage === 'function' ||  // BrowserContext
            typeof pageOrContext.context === 'function'      // Page
        );

        let browserContext;
        let inputPage = null;
        let sessionKey = pageOrContext;

        if (isBrowserContext) {
            if (pageOrContext.context && typeof pageOrContext.context === 'function') {
                inputPage = pageOrContext;
                browserContext = pageOrContext.context();
            } else {
                browserContext = pageOrContext;
            }
            sessionKey = browserContext;
        } else {
            // API context - use the object as-is for session tracking
            if (!pageOrContext || (typeof pageOrContext !== 'object' && typeof pageOrContext !== 'function')) {
                throw new Error('API context requires an object to hold session state (e.g., Playwright request context or plain object)');
            }
        }

        if (this.verbose) {
            this.logger.log(`🤖 Running Orchestrator with provider: ${provider.name} [${isBrowserContext ? 'browser' : 'api'}]\n`);
            if (isBrowserContext) {
                this.logger.logContext(browserContext, inputPage);
            }
        }

        const existingSessionId = sessionManager.getSession(sessionKey);
        if (existingSessionId && this.verbose) {
            this.logger.log(`♻️  SESSION: Resuming session: ${existingSessionId}\n`);
        }

        const { createMcpHttpServer } = await import('./createMcpServer.js');
        const { url: mcpUrl, cleanup } = await createMcpHttpServer(browserContext, { baseUrl: this.options.baseUrl });

        try {
            const result = await provider.run(prompt, {
                mcpUrl,
                existingSessionId,
                verbose: this.verbose,
                returnUsage: this.options.returnUsage,
                logger: this.logger,
                systemPrompt: UNIFIED_SYSTEM_PROMPT,
            });

            if (result.sessionId) {
                sessionManager.setSession(sessionKey, result.sessionId);
            }

            return this.options.returnUsage ? result : result.result;
        } finally {
            await cleanup();
        }
    }
}