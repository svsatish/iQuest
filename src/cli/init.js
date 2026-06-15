/**
 * iQuest Init Command
 *
 * Scaffolds a new BDD project with iQuest integration into a .iquest directory
 */

import * as clack from '@clack/prompts';
import chalk from 'chalk';
import { existsSync, mkdirSync, writeFileSync, readFileSync, cpSync, readdirSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

function runCommand(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { cwd, stdio: 'ignore' });
    proc.on('close', (code) => code === 0 ? resolve() : reject(new Error(`exited with code ${code}`)));
  });
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read CLI's own package.json to detect version
const cliPackageJson = JSON.parse(
  readFileSync(join(__dirname, '../../package.json'), 'utf-8')
);
const cliVersion = cliPackageJson.version;

const FRAMEWORKS = {
  'playwright-bdd': {
    name: 'Playwright-BDD',
    description: 'Playwright with Gherkin/Cucumber syntax (recommended)',
    dependencies: ['iquest', 'playwright-bdd', '@playwright/test', 'typescript', 'varlock'],
    devDependencies: ['@cucumber/cucumber'],
  },
  'cucumber': {
    name: 'Cucumber.js',
    description: 'Standalone Cucumber with Playwright',
    dependencies: ['iquest', '@cucumber/cucumber', '@playwright/test', 'typescript', 'varlock'],
    devDependencies: [],
  },
  'api': {
    name: 'Playwright Hybrid BDD',
    description: 'Plain-English hybrid UI + API tests with Playwright BDD',
    dependencies: ['iquest', '@modelcontextprotocol/sdk', '@opencode-ai/sdk', 'playwright-bdd', 'typescript', 'varlock'],
    devDependencies: ['@playwright/test'],
  },
};

const CLAUDE_CODE_MODELS = [
  { value: 'claude-haiku-4-5', label: 'claude-haiku-4-5 (Default — fast & affordable)' },
  { value: 'claude-sonnet-4-6', label: 'claude-sonnet-4-6' },
  { value: 'claude-opus-4-7', label: 'claude-opus-4-7' },
  { value: 'custom', label: 'Custom (enter manually)' },
];

const OPENCODE_MODELS = [
  { value: 'gitlab/duo-chat-haiku-4-5', label: 'gitlab/duo-chat-haiku-4-5 (Default — GitLab Duo)' },
  { value: 'github-copilot/gpt-5.4', label: 'github-copilot/gpt-5.4 (GitHub Copilot)' },
  { value: 'anthropic/claude-haiku-4-5', label: 'anthropic/claude-haiku-4-5' },
  { value: 'anthropic/claude-sonnet-4-6', label: 'anthropic/claude-sonnet-4-6' },
  { value: 'openai/gpt-4o', label: 'openai/gpt-4o' },
  { value: 'google/gemini-2.0-flash', label: 'google/gemini-2.0-flash' },
  { value: 'custom', label: 'Custom (enter manually — format: provider/model)' },
];

export async function init(cliFramework, options) {
  clack.intro(chalk.bgCyan.black(' 🤖 iQuest Agentic Test Harness Initialization '));

  const targetDir = resolve(process.cwd(), '.iquest');

  // Framework Selection
  let framework = cliFramework;
  if (!framework || !FRAMEWORKS[framework]) {
    framework = await clack.select({
      message: 'Which framework do you want to use?',
      options: [
        { value: 'playwright-bdd', label: 'Playwright-BDD' },
        { value: 'cucumber', label: 'CucumberJS' },
        { value: 'api', label: 'Playwright Hybrid (UI + API)' },
      ],
    });
    if (clack.isCancel(framework)) return clack.cancel('Operation cancelled.');
  }

  // Agent and model selection
  let agent;
  let model;
  if (framework === 'api') {
    agent = 'openCode';
    model = await clack.select({
      message: 'Which OpenCode model would you like to use?',
      options: OPENCODE_MODELS,
    });
    if (clack.isCancel(model)) return clack.cancel('Operation cancelled.');

    if (model === 'custom') {
      model = await clack.text({
        message: 'Enter the model name manually:',
        placeholder: 'e.g. anthropic/claude-3-5-sonnet-20241022',
        validate: (value) => {
          if (!value) return 'Please enter a model name.';
        }
      });
      if (clack.isCancel(model)) return clack.cancel('Operation cancelled.');
    }
  } else {
    agent = await clack.select({
      message: 'Which AI agent would you like to use?',
      options: [
        { value: 'claudeCode', label: 'Claude Code (Anthropic SDK)' },
        { value: 'openCode', label: 'OpenCode (multi-provider — Anthropic, OpenAI, Google, …)' },
      ],
    });
    if (clack.isCancel(agent)) return clack.cancel('Operation cancelled.');

    const modelOptions = agent === 'openCode' ? OPENCODE_MODELS : CLAUDE_CODE_MODELS;
    model = await clack.select({
      message: 'Which model would you like to use?',
      options: modelOptions,
    });
    if (clack.isCancel(model)) return clack.cancel('Operation cancelled.');

    if (model === 'custom') {
      const placeholder = agent === 'openCode'
        ? 'e.g. anthropic/claude-3-5-sonnet-20241022'
        : 'e.g. claude-3-5-sonnet-20241022';
      model = await clack.text({
        message: 'Enter the model name manually:',
        placeholder,
        validate: (value) => {
          if (!value) return 'Please enter a model name.';
        }
      });
      if (clack.isCancel(model)) return clack.cancel('Operation cancelled.');
    }
  }

  // Feature or test files path
  const pathPrompt = framework === 'api'
    ? 'Where should hybrid feature files live? (path relative to .iquest/)'
    : 'Where should feature files live? (path relative to .iquest/)';
  let sourcePath = await clack.text({
    message: pathPrompt,
    initialValue: 'features',
    placeholder: 'features',
    hint: 'Use ../path/to/files to point outside .iquest/',
  });
  if (clack.isCancel(sourcePath)) return clack.cancel('Operation cancelled.');

  // Normalize path format
  if (sourcePath.endsWith('/')) sourcePath = sourcePath.slice(0, -1);
  if (sourcePath.startsWith('./')) sourcePath = sourcePath.slice(2);

  // Check if directory exists
  if (existsSync(targetDir)) {
    const files = readdirSync(targetDir);
    if (files.length > 0 && !files.every(f => f.startsWith('.'))) {
      const confirmOverride = await clack.confirm({
        message: `Directory .iquest is not empty. Overwrite and re-initialize?`,
        initialValue: false,
      });
      if (clack.isCancel(confirmOverride) || !confirmOverride) {
        return clack.cancel('Aborted by user.');
      }
    }
  } else {
    mkdirSync(targetDir, { recursive: true });
  }

  const spinner = clack.spinner();
  spinner.start(`Scaffolding ${FRAMEWORKS[framework].name} into .iquest...`);

  const templateDirMap = {
    'playwright-bdd': 'playwright-bdd',
    'cucumber': 'cucumber',
    'api': 'playwright-api',
  };
  const templateDir = join(__dirname, 'templates', templateDirMap[framework]);

  try {
    spinner.message('Copying template files...');
    const toCopy = ['gitignore', 'package.json', 'README.md', '.env.example', '.env.schema'];

    if (framework === 'playwright-bdd' || framework === 'api') {
      toCopy.push('playwright.config.ts');
      mkdirSync(join(targetDir, 'steps'), { recursive: true });
      cpSync(join(templateDir, 'features/steps/fixtures.ts'), join(targetDir, 'steps/fixtures.ts'));
      cpSync(join(templateDir, 'features/steps/steps.ts'), join(targetDir, 'steps/steps.ts'));
      // Copy example feature files into .iquest/features/
      mkdirSync(join(targetDir, 'features'), { recursive: true });
      const featureFiles = readdirSync(join(templateDir, 'features')).filter(f => f.endsWith('.feature'));
      for (const f of featureFiles) {
        cpSync(join(templateDir, 'features', f), join(targetDir, 'features', f));
      }
    } else if (framework === 'cucumber') {
      toCopy.push('cucumber.js');
      mkdirSync(join(targetDir, 'steps'), { recursive: true });
      cpSync(join(templateDir, 'features/step_definitions/steps.js'), join(targetDir, 'steps/steps.js'));
      // Copy example feature files into .iquest/features/
      mkdirSync(join(targetDir, 'features'), { recursive: true });
      const featureFiles = readdirSync(join(templateDir, 'features')).filter(f => f.endsWith('.feature'));
      for (const f of featureFiles) {
        cpSync(join(templateDir, 'features', f), join(targetDir, 'features', f));
      }
    }

    for (const file of toCopy) {
      if (existsSync(join(templateDir, file))) {
        cpSync(join(templateDir, file), join(targetDir, file === 'gitignore' ? '.gitignore' : file));
      }
    }

    spinner.message('Configuring paths...');

    // Rewrite configuration files with the chosen features path
    if (framework === 'playwright-bdd' || framework === 'api') {
      const pConfigPath = join(targetDir, 'playwright.config.ts');
      let content = readFileSync(pConfigPath, 'utf8');
      content = content.replace("featuresRoot: 'features'", `featuresRoot: '${sourcePath}'`);
      content = content.replace("features: 'features/**/*.feature'", `features: '${sourcePath}/**/*.feature'`);
      content = content.replace("'features/steps/*.ts'", `'steps/*.ts'`);
      writeFileSync(pConfigPath, content);
    }

    if (framework === 'cucumber') {
      const cConfigPath = join(targetDir, 'cucumber.js');
      let content = readFileSync(cConfigPath, 'utf8');
      content = content.replace("'features/**/*.feature'", `'${sourcePath}/**/*.feature'`);
      content = content.replace("'features/step_definitions/**/*.js'", `'steps/**/*.js'`);
      writeFileSync(cConfigPath, content);
    }

    spinner.message(framework === 'api' ? 'Configuring hybrid step definitions...' : 'Configuring step definitions...');

    // Rewrite steps file: swap provider factory and model
    const stepsPath = framework === 'playwright-bdd'
      ? join(targetDir, 'steps/steps.ts')
      : join(targetDir, 'steps/steps.js');

    if (existsSync(stepsPath)) {
      let content = readFileSync(stepsPath, 'utf8');

      if (agent === 'openCode') {
        // Swap import: claudeCode → openCode
        content = content.replace(
          /import\s*\{([^}]*)\}\s*from\s*['"]iquest['"]/,
          (_, imports) => `import { ${imports.replace('claudeCode', 'openCode')} } from 'iquest'`
        );
        // Swap provider call
        content = content.replace(/claudeCode\(['"][^'"]*['"]\)/g, `openCode('${model}')`);
      } else {
        // claudeCode: just update the model string
        content = content.replace(/claudeCode\(['"][^'"]*['"]\)/g, `claudeCode('${model}')`);
      }

      writeFileSync(stepsPath, content);
    }

    // Add scripts to package.json
    const packageJsonPath = join(targetDir, 'package.json');
    if (existsSync(packageJsonPath)) {
      const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      if (framework === 'playwright-bdd' || framework === 'api') {
        pkg.scripts = {
          bddgen: 'bddgen',
          test: 'npm run bddgen && playwright test',
          'test:ui': 'npm run bddgen && playwright test --ui',
          'test:headed': 'npm run bddgen && playwright test --headed',
          'test:report': 'playwright show-report'
        };
      } else if (framework === 'api') {
        pkg.scripts = {
          test: 'playwright test',
          'test:ui': 'playwright test --ui',
          'test:headed': 'playwright test --headed',
          'test:report': 'playwright show-report'
        };
      } else {
        pkg.scripts = {
          test: 'cucumber-js --format html:cucumber-test-results/cucumber-report.html',
          'test:headed': 'HEADLESS=false cucumber-js --format html:cucumber-test-results/cucumber-report.html',
          'test:report': 'open cucumber-test-results/cucumber-report.html'
        };
      }
      writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2));
    }

    spinner.stop('✓ Project files created successfully.');
  } catch (error) {
    spinner.stop('❌ Error creating files.');
    console.error(chalk.red(error.message));
    return;
  }

  // Install dependencies — new spinner instance (stopped spinners cannot be restarted)
  const installSpinner = clack.spinner();
  installSpinner.start('📦 Installing dependencies (this may take a minute)...');

  const frameworkConfig = FRAMEWORKS[framework];
  const openqaVersion = cliVersion.includes('beta') || cliVersion.includes('alpha') || cliVersion.includes('rc')
    ? `iquest@${cliVersion}`
    : 'iquest@latest';

  // Add the chosen agent SDK as a dependency
  const agentSdk = agent === 'openCode'
    ? '@opencode-ai/sdk'
    : '@anthropic-ai/claude-agent-sdk';

  const allDeps = [...frameworkConfig.dependencies, ...frameworkConfig.devDependencies, agentSdk].map(dep =>
    dep === 'iquest' ? openqaVersion : dep
  );

  let dependenciesInstalled = false;
  try {
    await runCommand('npm', ['install', ...allDeps], targetDir);
    installSpinner.stop('✓ Dependencies installed');
    dependenciesInstalled = true;
  } catch (error) {
    installSpinner.stop('❌ Error installing dependencies');
    console.error(chalk.red('You will need to run `npm install` manually inside .iquest'));
  }

  // Install Browsers
  if (dependenciesInstalled) {
    const installBrowsers = await clack.confirm({
      message: 'Install Playwright browsers now? (Chromium, ~150MB)',
      initialValue: true,
    });

    if (clack.isCancel(installBrowsers)) return clack.cancel('Operation cancelled.');

    if (installBrowsers) {
      const browserSpinner = clack.spinner();
      browserSpinner.start('📥 Installing Chromium...');
      try {
        await runCommand('npx', ['playwright', 'install', 'chromium'], targetDir);
        browserSpinner.stop('✓ Chromium installed');
      } catch (error) {
        browserSpinner.stop('❌ Error installing Chromium');
      }
    }
  }

  // Next Steps
  const localAuthNote = agent === 'openCode'
    ? `   Local (no API key needed): opencode auth login\n   CI / API key:               add provider key to .env (e.g. ANTHROPIC_API_KEY)`
    : `   Local (no API key needed): claude login\n   CI / API key:               add ANTHROPIC_API_KEY to .env`;

  const nextStepRun = framework === 'api'
    ? 'npm test'
    : 'npm run test:headed';

  clack.note(
    `1. cd .iquest\n` +
    `2. cp .env.example .env\n` +
    `3. Authenticate:\n` +
    localAuthNote + `\n` +
    `4. ${nextStepRun}`,
    'Next Steps'
  );

  clack.outro(chalk.bold.green('🎉 .iquest scaffolding complete! Discover. Validate. Assure.'));
}