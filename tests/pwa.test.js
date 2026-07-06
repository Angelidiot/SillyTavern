import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

import { describe, expect, test } from '@jest/globals';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(testDir, '..');
const publicDir = path.join(rootDir, 'public');
const marketplaceWalletDir = path.join(publicDir, 'scripts/extensions/marketplace-wallet');
const marketplaceWalletManifest = JSON.parse(fs.readFileSync(path.join(marketplaceWalletDir, 'manifest.json'), 'utf8'));

function readPublicFile(fileName) {
    return fs.readFileSync(path.join(publicDir, fileName), 'utf8');
}

function readServiceWorkerShellAssets() {
    const serviceWorker = readPublicFile('service-worker.js');
    const sandbox = {
        self: {
            addEventListener: () => {},
        },
    };

    vm.createContext(sandbox);
    vm.runInContext(`${serviceWorker}\nthis.__SHELL_ASSETS__ = SHELL_ASSETS;`, sandbox);

    return sandbox.__SHELL_ASSETS__;
}

function readServiceWorkerCacheName() {
    const serviceWorker = readPublicFile('service-worker.js');
    const sandbox = {
        self: {
            addEventListener: () => {},
        },
    };

    vm.createContext(sandbox);
    vm.runInContext(`${serviceWorker}\nthis.__CACHE_NAME__ = CACHE_NAME;`, sandbox);

    return sandbox.__CACHE_NAME__;
}

describe('hosted tavern PWA shell', () => {
    test('defines installable manifest metadata', () => {
        const manifest = JSON.parse(readPublicFile('manifest.json'));

        expect(manifest.id).toBe('/');
        expect(manifest.scope).toBe('/');
        expect(manifest.start_url).toBe('/');
        expect(manifest.display).toBe('standalone');
        expect(manifest.icons.some(icon => icon.sizes === '192x192')).toBe(true);
        expect(manifest.icons.some(icon => icon.sizes === '512x512')).toBe(true);
    });

    test('registers a service worker from app and login shells', () => {
        expect(readPublicFile('index.html')).toContain('scripts/pwa.js');
        expect(readPublicFile('login.html')).toContain('scripts/pwa.js');
        expect(readPublicFile('scripts/pwa.js')).toContain("navigator.serviceWorker.register('/service-worker.js')");
    });

    test('keeps API and non-GET requests out of the static shell cache', () => {
        const serviceWorker = readPublicFile('service-worker.js');

        expect(serviceWorker).toContain("request.method !== 'GET'");
        expect(serviceWorker).toContain("url.pathname.startsWith('/api/')");
        expect(serviceWorker).toContain('sillytavern-shell-v4');
    });

    test('activates updated service workers without waiting for every tab to close', () => {
        const serviceWorker = readPublicFile('service-worker.js');

        expect(serviceWorker).toContain('self.skipWaiting()');
        expect(serviceWorker).toContain('self.clients.claim()');
    });

    test('shows an install action only when the browser exposes an install prompt', () => {
        const pwaScript = readPublicFile('scripts/pwa.js');
        const style = readPublicFile('style.css');

        expect(pwaScript).toContain("window.addEventListener('beforeinstallprompt'");
        expect(pwaScript).toContain('event.preventDefault()');
        expect(pwaScript).toContain('deferredInstallPrompt = event');
        expect(pwaScript).toContain('promptEvent.prompt()');
        expect(pwaScript).toContain('promptEvent.userChoice');
        expect(pwaScript).toContain("window.addEventListener('appinstalled'");
        expect(pwaScript).toContain("window.matchMedia?.('(display-mode: standalone)')");
        expect(pwaScript).toContain('navigator.standalone');
        expect(pwaScript).toContain("id = 'pwa_install_prompt'");
        expect(pwaScript).toContain("id = 'pwa_install_button'");
        expect(pwaScript).toContain('removeInstallPrompt()');
        expect(style).toContain('.pwa-install-prompt');
        expect(style).toContain('env(safe-area-inset-bottom)');
        expect(style).toContain('.pwa-install-dismiss');
    });

    test('uses network-first navigation with a cached root fallback', () => {
        const serviceWorker = readPublicFile('service-worker.js');

        expect(serviceWorker).toContain("request.mode === 'navigate'");
        expect(serviceWorker).toContain('const cached = await caches.match(request)');
        expect(serviceWorker).toContain("return cached || caches.match('/')");
        expect(serviceWorker).toContain('cached || fetch(request)');
    });

    test('precache shell assets exist in the public directory', () => {
        const shellAssets = readServiceWorkerShellAssets();
        const marketplaceWalletAssets = [
            '/scripts/extensions/marketplace-wallet/manifest.json',
            '/scripts/extensions/marketplace-wallet/window.html',
            `/scripts/extensions/marketplace-wallet/${marketplaceWalletManifest.js}`,
            `/scripts/extensions/marketplace-wallet/filters.js?v=${marketplaceWalletManifest.version}`,
            `/scripts/extensions/marketplace-wallet/${marketplaceWalletManifest.css}`,
        ];

        expect(shellAssets).toEqual(expect.arrayContaining([
            '/',
            '/manifest.json',
            '/scripts/pwa.js',
            ...marketplaceWalletAssets,
        ]));

        for (const asset of shellAssets) {
            expect(asset).toMatch(/^\//);

            const relativePath = asset === '/' ? 'index.html' : asset.slice(1).split('?')[0];
            expect(fs.existsSync(path.join(publicDir, relativePath))).toBe(true);
        }
    });

    test('documents the current service worker cache and install prompt coverage', () => {
        const cacheName = readServiceWorkerCacheName();
        const designDoc = fs.readFileSync(path.join(rootDir, 'docs/marketplace-currency-design.md'), 'utf8');

        expect(cacheName).toBe('sillytavern-shell-v4');
        expect(designDoc).toContain(cacheName);
        expect(designDoc).toContain('应用内 Install prompt');
        expect(designDoc).toContain('导航请求优先使用网络版本');
    });
});
