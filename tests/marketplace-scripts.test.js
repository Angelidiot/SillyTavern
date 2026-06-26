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

    test('keeps the fast marketplace command free of recursive slow-loop calls', () => {
        const { scripts } = readRootPackage();

        expect(scripts['test:marketplace']).toContain('npm run test:marketplace:syntax');
        expect(scripts['test:marketplace']).toContain('market-wallet.test.js');
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

    test('checks marketplace wallet static extension assets in the syntax gate', () => {
        const script = fs.readFileSync(path.join(rootDirectory, 'scripts/check-marketplace-syntax.mjs'), 'utf8');

        expect(script).toContain('staticAssets');
        expect(script).toContain('public/scripts/extensions/marketplace-wallet/manifest.json');
        expect(script).toContain('public/scripts/extensions/marketplace-wallet/window.html');
        expect(script).toContain('public/scripts/extensions/marketplace-wallet/style.css');
        expect(script).toContain('JSON.parse(content)');
        expect(script).toContain('asset ok: ${asset.file}');
    });

    test('documents hosted marketplace and PWA scripts in README', () => {
        const { scripts } = readRootPackage();
        const readmeScriptSection = getReadmeScriptSection(readReadme());
        const documentedScripts = [
            'start:no-csrf',
            'marketplace:seed:demo',
            'marketplace:export:snapshot',
            'marketplace:export:api',
            'test:hosted:docker',
            'test:marketplace:syntax',
            'test:marketplace',
            'test:marketplace:smoke',
            'test:marketplace:e2e',
            'test:marketplace:e2e:server',
            'test:marketplace:all',
            'test:pwa',
            'test:pwa:e2e',
        ];

        for (const scriptName of documentedScripts) {
            expect(scripts).toHaveProperty(scriptName);
            expect(readmeScriptSection).toMatch(new RegExp(`npm run ${escapeRegex(scriptName)}(?:\\s|$)`));
        }

        expect(readmeScriptSection).toContain('docs/marketplace-api-reference.md');
    });

    test('wires hosted Docker smoke into scripts, syntax gate, and CI', () => {
        const { scripts } = readRootPackage();
        const syntaxGate = fs.readFileSync(path.join(rootDirectory, 'scripts/check-marketplace-syntax.mjs'), 'utf8');
        const workflow = fs.readFileSync(path.join(rootDirectory, '.github/workflows/marketplace-wallet-checks.yml'), 'utf8');
        const dockerStep = getWorkflowStep(workflow, 'Run hosted Docker smoke');

        expect(scripts['test:hosted:docker']).toBe('node scripts/smoke-hosted-container.mjs');
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

    test('keeps marketplace browser E2E wrapper bounded and cleanup-aware', () => {
        const script = fs.readFileSync(path.join(rootDirectory, 'scripts/run-marketplace-e2e.mjs'), 'utf8');
        const workflow = fs.readFileSync(path.join(rootDirectory, '.github/workflows/marketplace-wallet-checks.yml'), 'utf8');
        const e2eStep = getWorkflowStep(workflow, 'Run marketplace browser E2E');

        expect(script).toContain('MARKETPLACE_E2E_PLAYWRIGHT_TIMEOUT_MS');
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
