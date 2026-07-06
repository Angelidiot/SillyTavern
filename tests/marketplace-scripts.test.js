import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, test, expect } from '@jest/globals';

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function readRootPackage() {
    return JSON.parse(fs.readFileSync(path.join(rootDirectory, 'package.json'), 'utf8'));
}

function readReadme() {
    return fs.readFileSync(path.join(rootDirectory, 'README.md'), 'utf8');
}

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getReadmeScriptSection(readme) {
    const startMarker = '### Useful Scripts';
    const endMarker = '### Development Notes';
    const start = readme.indexOf(startMarker);
    const end = readme.indexOf(endMarker);

    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);

    return readme.slice(start, end);
}

function getHostedReadmeScriptNames(scripts) {
    return Object.keys(scripts)
        .filter(scriptName => scriptName === 'start:no-csrf'
            || scriptName.startsWith('marketplace:')
            || scriptName.startsWith('test:hosted:')
            || scriptName.startsWith('test:marketplace')
            || scriptName.startsWith('test:pwa'))
        .sort();
}

function getWorkflowStep(workflow, stepName) {
    const startMarker = `- name: ${stepName}`;
    const start = workflow.indexOf(startMarker);
    expect(start).toBeGreaterThanOrEqual(0);

    const next = workflow.indexOf('\n      - name:', start + startMarker.length);
    return next === -1 ? workflow.slice(start) : workflow.slice(start, next);
}

describe('marketplace runnable scripts', () => {
    test('defines a slow full-loop marketplace validation command', () => {
        const { scripts } = readRootPackage();
        const readmeScriptSection = getReadmeScriptSection(readReadme());

        expect(scripts['test:marketplace:all']).toBe([
            'npm run test:marketplace',
            'npm run test:marketplace:smoke',
            'npm run test:marketplace:e2e:server',
        ].join(' && '));
        expect(scripts['test:marketplace:all']).not.toContain('test:hosted:docker');
        expect(readmeScriptSection).toContain('Docker image smoke runs separately with npm run test:hosted:docker.');
        expect(readmeScriptSection).toContain('smoke-test marketplace/wallet/PWA flows');
    });

    test('defines a CI-equivalent marketplace release gate command', () => {
        const { scripts } = readRootPackage();
        const readmeScriptSection = getReadmeScriptSection(readReadme());
        const workflow = fs.readFileSync(path.join(rootDirectory, '.github/workflows/marketplace-wallet-checks.yml'), 'utf8');

        expect(scripts['test:marketplace:e2e:server']).toBe('node scripts/run-marketplace-e2e.mjs --workers=1');
        expect(scripts['test:marketplace:ci']).toBe([
            'npm run test:marketplace:syntax',
            'npm run test:marketplace',
            'npm run test:marketplace:smoke',
            'npm run test:hosted:docker',
            'npm run test:marketplace:e2e:server',
        ].join(' && '));

        for (const stepName of [
            'Run marketplace syntax gate',
            'Run marketplace unit and contract tests',
            'Run marketplace runtime smoke',
            'Run hosted Docker smoke',
            'Run marketplace browser E2E',
        ]) {
            const step = getWorkflowStep(workflow, stepName);
            const run = step.match(/run: (npm run [^\n]+)/)?.[1];
            expect(run).toBeTruthy();
            expect(scripts['test:marketplace:ci']).toContain(run);
        }

        expect(scripts['test:marketplace:ci']).not.toContain('google-chrome --version');
        expect(readmeScriptSection).toContain('CI-equivalent marketplace release gate');
        expect(readmeScriptSection).toContain('PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run test:marketplace:ci');
    });

    test('keeps the fast marketplace command free of recursive slow-loop calls', () => {
        const { scripts } = readRootPackage();

        expect(scripts['test:marketplace']).toContain('npm run test:marketplace:syntax');
        expect(scripts['test:marketplace']).toContain('market-wallet.test.js --runInBand');
        expect(scripts['test:marketplace']).not.toContain('test:marketplace:all');
        expect(scripts['test:marketplace']).not.toContain('test:marketplace:e2e:server');
    });

    test('includes every marketplace unit test file in the fast marketplace command', () => {
        const { scripts } = readRootPackage();
        const testsDirectory = path.join(rootDirectory, 'tests');
        const marketplaceTestFiles = fs.readdirSync(testsDirectory)
            .filter(fileName => /^marketplace.*\.test\.js$/.test(fileName))
            .sort();

        expect(marketplaceTestFiles).toEqual(expect.arrayContaining([
            'marketplace-api-reference.test.js',
            'marketplace-demo-seed.test.js',
            'marketplace-scripts.test.js',
            'marketplace-snapshot-export.test.js',
            'marketplace-wallet-filters.test.js',
            'marketplace-wallet-ui.test.js',
        ]));

        for (const fileName of marketplaceTestFiles) {
            expect(scripts['test:marketplace']).toContain(fileName);
        }
    });

    test('runs HTTP endpoint marketplace tests isolated from script and UI contract tests', () => {
        const { scripts } = readRootPackage();
        const command = scripts['test:marketplace'];

        expect(command).toContain('npm --prefix tests run test:unit -- market-wallet.test.js --runInBand');
        expect(command).toContain('&& npm --prefix tests run test:unit -- marketplace-wallet-filters.test.js');
        expect(command.indexOf('market-wallet.test.js --runInBand'))
            .toBeLessThan(command.indexOf('marketplace-wallet-filters.test.js'));
    });

    test('checks marketplace wallet static extension assets in the syntax gate', () => {
        const script = fs.readFileSync(path.join(rootDirectory, 'scripts/check-marketplace-syntax.mjs'), 'utf8');

        expect(script).toContain('staticAssets');
        expect(script).toContain('public/manifest.json');
        expect(script).toContain('public/scripts/extensions/marketplace-wallet/manifest.json');
        expect(script).toContain('public/scripts/extensions/marketplace-wallet/window.html');
        expect(script).toContain('public/scripts/extensions/marketplace-wallet/style.css');
        expect(script).toContain('JSON.parse(content)');
        expect(script).toContain('asset ok: ${asset.file}');
    });

    test('documents hosted marketplace and PWA scripts in README', () => {
        const { scripts } = readRootPackage();
        const readmeScriptSection = getReadmeScriptSection(readReadme());
        const documentedScripts = getHostedReadmeScriptNames(scripts);

        expect(documentedScripts).toContain('marketplace:export:api');
        expect(documentedScripts).toContain('test:marketplace:ci');
        expect(documentedScripts).toContain('test:pwa:e2e');

        for (const scriptName of documentedScripts) {
            expect(readmeScriptSection).toMatch(new RegExp(`npm run ${escapeRegex(scriptName)}(?:\\s|$)`));
        }

        expect(readmeScriptSection).toContain('docs/marketplace-api-reference.md');
        expect(readmeScriptSection).toContain('MARKETPLACE_API_REFERENCE_GENERATED_AT=2026-06-26T00:00:00.000Z npm run marketplace:export:api -- --out ./docs/marketplace-api-reference.md');
        expect(readmeScriptSection).toContain('root PWA manifest and marketplace-wallet manifest/window/style asset checks');
    });

    test('runs marketplace checks when the checked-in API reference changes', () => {
        const workflow = fs.readFileSync(path.join(rootDirectory, '.github/workflows/marketplace-wallet-checks.yml'), 'utf8');
        const apiReferencePathMatches = workflow.match(/'docs\/marketplace-api-reference\.md'/g) || [];

        expect(apiReferencePathMatches).toHaveLength(2);
    });

    test('runs marketplace checks when the PWA shell stylesheet changes', () => {
        const workflow = fs.readFileSync(path.join(rootDirectory, '.github/workflows/marketplace-wallet-checks.yml'), 'utf8');
        const shellAssetPaths = [
            'public/style.css',
            'public/css/st-tailwind.css',
            'public/css/mobile-styles.css',
            'public/css/login.css',
            'public/favicon.ico',
            'public/img/apple-icon-192x192.png',
            'public/img/apple-icon-512x512.png',
        ];

        for (const assetPath of shellAssetPaths) {
            const escapedPath = assetPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const matches = workflow.match(new RegExp(`'${escapedPath}'`, 'g')) || [];
            expect(matches).toHaveLength(2);
        }
    });

    test('runs marketplace checks when shared market dependencies change', () => {
        const workflow = fs.readFileSync(path.join(rootDirectory, '.github/workflows/marketplace-wallet-checks.yml'), 'utf8');
        const sharedDependencyPaths = [
            'src/character-card-parser.js',
            'src/constants.js',
            'src/server-directory.js',
            'src/users.js',
            'src/util.js',
            'src/validator/TavernCardValidator.js',
            'public/script.js',
            'public/scripts/extensions.js',
            'public/scripts/popup.js',
            'public/scripts/user.js',
            'public/scripts/utils.js',
        ];

        for (const dependencyPath of sharedDependencyPaths) {
            const escapedPath = dependencyPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const matches = workflow.match(new RegExp(`'${escapedPath}'`, 'g')) || [];
            expect(matches).toHaveLength(2);
        }
    });

    test('checks marketplace startup entries in syntax gate and CI paths', () => {
        const syntaxGate = fs.readFileSync(path.join(rootDirectory, 'scripts/check-marketplace-syntax.mjs'), 'utf8');
        const workflow = fs.readFileSync(path.join(rootDirectory, '.github/workflows/marketplace-wallet-checks.yml'), 'utf8');
        const startupPaths = [
            'server.js',
            'src/command-line.js',
            'src/config-init.js',
            'src/healthcheck.js',
        ];

        for (const startupPath of startupPaths) {
            const escapedPath = startupPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const matches = workflow.match(new RegExp(`'${escapedPath}'`, 'g')) || [];
            expect(matches).toHaveLength(2);
            expect(syntaxGate).toContain(`'${startupPath}'`);
        }
    });

    test('wires hosted Docker smoke into scripts, syntax gate, and CI', () => {
        const { scripts } = readRootPackage();
        const syntaxGate = fs.readFileSync(path.join(rootDirectory, 'scripts/check-marketplace-syntax.mjs'), 'utf8');
        const workflow = fs.readFileSync(path.join(rootDirectory, '.github/workflows/marketplace-wallet-checks.yml'), 'utf8');
        const dockerStep = getWorkflowStep(workflow, 'Run hosted Docker smoke');

        expect(scripts['test:hosted:docker']).toBe('node scripts/smoke-hosted-container.mjs');
        expect(scripts['test:marketplace:ci']).toContain('npm run test:hosted:docker');
        expect(syntaxGate).toContain('scripts/smoke-hosted-container.mjs');
        expect(dockerStep).toContain('timeout-minutes: 10');
        expect(dockerStep).toContain('run: npm run test:hosted:docker');
        expect(workflow).toContain('Dockerfile');
        expect(workflow).toContain('default/**');
        expect(workflow).toContain('docker/**');
        expect(workflow).toContain('public/lib.js');
        expect(workflow).toContain('src/middleware/webpack-serve.js');
        expect(workflow).toContain('webpack.config.js');
    });

    test('keeps hosted Docker smoke failures diagnosable', () => {
        const script = fs.readFileSync(path.join(rootDirectory, 'scripts/smoke-hosted-container.mjs'), 'utf8');

        expect(script).not.toContain("'--rm'");
        expect(script).toContain('readServiceWorkerCacheName');
        expect(script).toContain('CACHE_NAME');
        expect(script).not.toContain("'sillytavern-shell-v3'");
        expect(script).not.toContain("import net from 'node:net'");
        expect(script).not.toContain('function findFreePort');
        expect(script).toContain('127.0.0.1::8000');
        expect(script).toContain('function getPublishedPort');
        expect(script).toContain("'docker', ['port'");
        expect(script).toContain("'8000/tcp'");
        expect(script).not.toContain('?? mappings[0]');
        expect(script).toContain("mapping?.match(/^127\\.0\\.0\\.1:(\\d+)$/)");
        expect(script).toContain('Expected hosted container to publish on 127.0.0.1');
        expect(script).not.toContain('--whitelist=false');
        expect(script).not.toContain('--basicAuthMode=false');
        expect(script).toContain('host.docker.internal:host-gateway');
        expect(script).toContain('gateway.docker.internal:host-gateway');
        expect(script).toContain("'docker', ['inspect'");
        expect(script).toContain('{{json .State}}');
        expect(script).toContain('Hosted container exited before becoming healthy');
        expect(script).toContain('HOME=/home/node');
        expect(script).toContain('NPM_CONFIG_CACHE=/tmp/sillytavern-npm-cache');
        expect(script).toContain('/api/wallet');
        expect(script).toContain('wallet.balance.buckets?.[bucket]');
        expect(script).toContain('/api/market/assets');
        expect(script).toContain('Array.isArray(market.assets)');
    });

    test('keeps runtime smoke covering the default CSRF marketplace POST path', () => {
        const script = fs.readFileSync(path.join(rootDirectory, 'scripts/smoke-marketplace-runtime.mjs'), 'utf8');
        const readmeScriptSection = getReadmeScriptSection(readReadme());

        expect(script).toContain("'--disableCsrf'");
        expect(script).toContain('async function runCsrfSmoke()');
        expect(script).toContain('async function assertStatusEndpoint');
        expect(script).toContain('/csrf-token');
        expect(script).toContain("'Cookie': csrf.cookieHeader");
        expect(script).toContain("'X-CSRF-Token': csrf.token");
        expect(script).toContain('default CSRF rejects tokenless POST /api/market/assets draft');
        expect(script).toContain("'default CSRF rejects tokenless POST /api/market/assets draft', 403");
        expect(script).toContain('runtime ok: default CSRF rejects tokenless POST /api/market/assets draft');
        expect(script).toContain('runtime ok: default CSRF POST /api/market/assets draft');
        expect(script.indexOf('runtime ok: default CSRF rejects tokenless POST /api/market/assets draft'))
            .toBeLessThan(script.indexOf('runtime ok: default CSRF POST /api/market/assets draft'));
        expect(script).toContain('await run();\n    await runCsrfSmoke();');
        expect(readmeScriptSection).toContain('default-CSRF tokenless write rejection plus token/cookie draft upload POST');
    });

    test('keeps marketplace browser E2E wrapper bounded and cleanup-aware', () => {
        const script = fs.readFileSync(path.join(rootDirectory, 'scripts/run-marketplace-e2e.mjs'), 'utf8');
        const workflow = fs.readFileSync(path.join(rootDirectory, '.github/workflows/marketplace-wallet-checks.yml'), 'utf8');
        const e2eStep = getWorkflowStep(workflow, 'Run marketplace browser E2E');

        expect(script).toContain('MARKETPLACE_E2E_PLAYWRIGHT_TIMEOUT_MS');
        expect(script).toContain('600_000');
        expect(script).toContain('playwrightTimeoutMs');
        expect(script).toContain('function stopProcess');
        expect(script).toContain('detached: process.platform !==');
        expect(script).toContain("process.kill(targetPid, 'SIGTERM')");
        expect(script).toContain("process.kill(targetPid, 'SIGKILL')");
        expect(script).toContain('Timed out waiting for Playwright marketplace E2E');
        expect(script).toContain('process.exitCode = exitCode');
        expect(script).not.toContain('process.exit(exitCode)');
        expect(e2eStep).toContain('timeout-minutes: 10');
        expect(e2eStep).toContain('PLAYWRIGHT_BROWSER_CHANNEL: chrome');
        expect(e2eStep).toContain('run: npm run test:marketplace:e2e:server');
        expect(readRootPackage().scripts['test:marketplace:e2e:server']).toContain('--workers=1');
    });

    test('documents physical mobile access and PWA secure context requirements', () => {
        const readme = readReadme();

        expect(readme).toContain('npm start -- --listen=true');
        expect(readme).toContain('http://<your-computer-lan-ip>:8000');
        expect(readme).toContain('HTTPS tunnel/hosted URL');
        expect(readme).toContain('secure context');
        expect(readme).toContain('localhost is only treated as secure on the same device');
        expect(readme).toContain('beforeinstallprompt');
        expect(readme).toContain("in-app `Install` action");
    });
});
