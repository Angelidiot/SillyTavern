import { spawn } from 'node:child_process';
import { access, mkdtemp, rm } from 'node:fs/promises';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const startupTimeoutMs = Number(process.env.MARKETPLACE_SMOKE_TIMEOUT_MS ?? 90_000);
const requestTimeoutMs = Number(process.env.MARKETPLACE_SMOKE_REQUEST_TIMEOUT_MS ?? 5_000);
const demoCreatorHandle = 'smoke-creator';
const demoFreeAssetId = 'demo_character_mira';
const demoPaidAssetId = 'demo_world_clockwork';
const demoPaidPrice = 25;

function appendLog(buffer, chunk) {
    const maxLength = 20_000;
    const next = buffer + chunk.toString();
    return next.length > maxLength ? next.slice(next.length - maxLength) : next;
}

async function findFreePort() {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.once('error', reject);
        server.listen(0, '127.0.0.1', () => {
            const address = server.address();
            const port = typeof address === 'object' && address ? address.port : null;

            server.close(() => {
                if (!port) {
                    reject(new Error('Could not allocate a marketplace smoke test port'));
                    return;
                }

                resolve(port);
            });
        });
    });
}

function waitForExit(child, timeoutMs) {
    if (child.exitCode !== null || child.signalCode !== null) {
        return Promise.resolve(true);
    }

    return new Promise(resolve => {
        const timeout = setTimeout(() => {
            cleanup();
            resolve(false);
        }, timeoutMs);

        const onExit = () => {
            cleanup();
            resolve(true);
        };

        function cleanup() {
            clearTimeout(timeout);
            child.off('exit', onExit);
        }

        child.once('exit', onExit);
    });
}

async function stopServer(child) {
    if (child.exitCode !== null || child.signalCode !== null) {
        return;
    }

    child.kill('SIGTERM');

    if (!(await waitForExit(child, 5_000))) {
        child.kill('SIGKILL');
        await waitForExit(child, 5_000);
    }
}

async function fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
                ...(options.body ? { 'content-type': 'application/json' } : {}),
                ...(options.headers ?? {}),
            },
        });
        const body = await response.text();
        return { response, body };
    } finally {
        clearTimeout(timeout);
    }
}

function getSetCookieHeaders(headers) {
    const values = headers.getSetCookie?.() ?? [];
    if (values.length > 0) {
        return values;
    }

    const header = headers.get('set-cookie');
    return header ? header.split(/,(?=\s*[^;,]+=)/) : [];
}

function getCookieHeader(response) {
    const cookies = getSetCookieHeaders(response.headers)
        .map(cookie => cookie.split(';', 1)[0])
        .filter(Boolean);

    if (cookies.length === 0) {
        throw new Error('GET /csrf-token did not return a session cookie');
    }

    return cookies.join('; ');
}

async function getCsrfSession(baseUrl) {
    const { response, body } = await fetchWithTimeout(`${baseUrl}/csrf-token`);
    if (!response.ok) {
        throw new Error(`GET /csrf-token returned ${response.status}: ${body.slice(0, 500)}`);
    }

    let payload;
    try {
        payload = JSON.parse(body);
    } catch (error) {
        throw new Error(`GET /csrf-token did not return valid JSON: ${error.message}`);
    }

    if (typeof payload.token !== 'string' || !payload.token || payload.token === 'disabled') {
        throw new Error(`GET /csrf-token did not return an enabled CSRF token: ${JSON.stringify(payload)}`);
    }

    return {
        token: payload.token,
        cookieHeader: getCookieHeader(response),
    };
}

async function waitForHealth(baseUrl, child, getLogs) {
    const deadline = Date.now() + startupTimeoutMs;
    let lastError;

    while (Date.now() < deadline) {
        if (child.exitCode !== null || child.signalCode !== null) {
            throw new Error(`SillyTavern exited before health check passed.\n${getLogs()}`);
        }

        try {
            const { response, body } = await fetchWithTimeout(`${baseUrl}/api/health`);
            if (response.ok) {
                return JSON.parse(body);
            }

            lastError = new Error(`GET /api/health returned ${response.status}: ${body.slice(0, 500)}`);
        } catch (error) {
            lastError = error;
        }

        await new Promise(resolve => setTimeout(resolve, 500));
    }

    throw new Error(`Timed out waiting for /api/health. Last error: ${lastError?.message ?? 'unknown'}\n${getLogs()}`);
}

async function assertJsonEndpoint(url, label, assertPayload, options = {}) {
    const { response, body } = await fetchWithTimeout(url, options);
    const expectedStatus = options.expectedStatus;
    const statusMatches = expectedStatus ? response.status === expectedStatus : response.ok;
    if (!statusMatches) {
        throw new Error(`${label} returned ${response.status}: ${body.slice(0, 500)}`);
    }

    let payload;
    try {
        payload = JSON.parse(body);
    } catch (error) {
        throw new Error(`${label} did not return valid JSON: ${error.message}`);
    }

    assertPayload(payload);
    return payload;
}

async function assertTextEndpoint(url, label, expectedText) {
    const { response, body } = await fetchWithTimeout(url);
    if (!response.ok) {
        throw new Error(`${label} returned ${response.status}: ${body.slice(0, 500)}`);
    }

    if (!body.includes(expectedText)) {
        throw new Error(`${label} did not contain expected text: ${expectedText}`);
    }
}

async function assertPathExists(filePath, label) {
    try {
        await access(filePath);
    } catch {
        throw new Error(`${label} did not create expected file: ${filePath}`);
    }
}

async function seedDemoMarketplace(dataRoot) {
    const child = spawn(process.execPath, [
        'scripts/seed-marketplace-demo.mjs',
        '--dataRoot',
        dataRoot,
        '--creator',
        demoCreatorHandle,
    ], {
        cwd: rootDirectory,
        stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', chunk => {
        stdout = appendLog(stdout, chunk);
    });
    child.stderr.on('data', chunk => {
        stderr = appendLog(stderr, chunk);
    });

    const exitCode = await new Promise((resolve, reject) => {
        child.once('error', reject);
        child.once('exit', code => resolve(code ?? 1));
    });

    if (exitCode !== 0) {
        throw new Error(`Demo marketplace seed failed with exit code ${exitCode}\n--- stdout ---\n${stdout.trim()}\n--- stderr ---\n${stderr.trim()}`);
    }

    if (!stdout.includes(`- ${demoFreeAssetId}:`) || !stdout.includes(`- ${demoPaidAssetId}:`)) {
        throw new Error(`Demo marketplace seed output did not list expected assets:\n${stdout.trim()}`);
    }
}

async function run() {
    const port = await findFreePort();
    const tmpRoot = await mkdtemp(path.join(os.tmpdir(), 'sillytavern-marketplace-smoke-'));
    const configPath = path.join(tmpRoot, 'config.yaml');
    const dataRoot = path.join(tmpRoot, 'data');
    const baseUrl = `http://127.0.0.1:${port}`;

    let stdout = '';
    let stderr = '';
    let child;

    const getLogs = () => [
        '--- stdout ---',
        stdout.trim(),
        '--- stderr ---',
        stderr.trim(),
    ].join('\n');

    try {
        await seedDemoMarketplace(dataRoot);
        console.log('runtime ok: marketplace demo seed');

        child = spawn(process.execPath, [
            'server.js',
            `--port=${port}`,
            '--listen=false',
            '--enableIPv4=true',
            '--enableIPv6=false',
            '--browserLaunchEnabled=false',
            '--ssl=false',
            '--heartbeatInterval=0',
            '--whitelist=false',
            '--basicAuthMode=false',
            '--disableCsrf',
            `--configPath=${configPath}`,
            `--dataRoot=${dataRoot}`,
        ], {
            cwd: rootDirectory,
            env: {
                ...process.env,
                NODE_ENV: process.env.NODE_ENV ?? 'test',
            },
            stdio: ['ignore', 'pipe', 'pipe'],
        });

        child.stdout.on('data', chunk => {
            stdout = appendLog(stdout, chunk);
        });
        child.stderr.on('data', chunk => {
            stderr = appendLog(stderr, chunk);
        });

        const health = await waitForHealth(baseUrl, child, getLogs);
        if (health.ok !== true || health.status !== 'ok' || health.service !== 'sillytavern') {
            throw new Error(`Unexpected /api/health payload: ${JSON.stringify(health)}`);
        }
        console.log('runtime ok: /api/health');

        await assertJsonEndpoint(`${baseUrl}/manifest.json`, '/manifest.json', manifest => {
            if (manifest.display !== 'standalone' || manifest.start_url !== '/') {
                throw new Error(`Unexpected manifest payload: ${JSON.stringify(manifest)}`);
            }
        });
        console.log('runtime ok: /manifest.json');

        await assertTextEndpoint(`${baseUrl}/service-worker.js`, '/service-worker.js', 'sillytavern-shell');
        console.log('runtime ok: /service-worker.js');

        await assertJsonEndpoint(`${baseUrl}/api/wallet`, '/api/wallet', payload => {
            if (payload.handle !== 'default-user' || !payload.balance || typeof payload.balance.total !== 'number') {
                throw new Error(`Unexpected wallet payload: ${JSON.stringify(payload)}`);
            }
            for (const bucket of ['bonus', 'paid', 'earnings']) {
                if (typeof payload.balance.buckets?.[bucket] !== 'number') {
                    throw new Error(`Wallet payload missing ${bucket} bucket: ${JSON.stringify(payload)}`);
                }
            }
        });
        console.log('runtime ok: /api/wallet');

        await assertJsonEndpoint(`${baseUrl}/api/market/assets`, '/api/market/assets', payload => {
            if (!Array.isArray(payload.assets)) {
                throw new Error(`Unexpected market assets payload: ${JSON.stringify(payload)}`);
            }
            const demoAsset = payload.assets.find(asset => asset.id === demoFreeAssetId);
            if (!demoAsset || demoAsset.status !== 'listed' || demoAsset.price_type !== 'free') {
                throw new Error(`Seeded smoke asset missing from marketplace payload: ${JSON.stringify(payload)}`);
            }
            const paidAsset = payload.assets.find(asset => asset.id === demoPaidAssetId);
            if (!paidAsset || paidAsset.status !== 'listed' || paidAsset.price_type !== 'fixed_price' || paidAsset.price_coins !== demoPaidPrice) {
                throw new Error(`Seeded paid smoke asset missing from marketplace payload: ${JSON.stringify(payload)}`);
            }
        });
        console.log('runtime ok: /api/market/assets');

        let creatorAssetId = '';
        await assertJsonEndpoint(`${baseUrl}/api/market/assets`, 'POST /api/market/assets creator upload', payload => {
            const asset = payload.asset;
            if (!asset?.id || asset.creator_id !== 'default-user') {
                throw new Error(`Creator upload did not return a default-user asset: ${JSON.stringify(payload)}`);
            }
            if (asset.status !== 'draft' || asset.visibility !== 'private' || asset.type !== 'world_book') {
                throw new Error(`Creator upload did not create a private draft world book: ${JSON.stringify(payload)}`);
            }
            if (asset.price_type !== 'free' || asset.price_coins !== 0) {
                throw new Error(`Creator upload did not normalize free pricing: ${JSON.stringify(payload)}`);
            }
            if (asset.submitted_at !== null || asset.listed_at !== null) {
                throw new Error(`Creator upload should not have submit/list timestamps yet: ${JSON.stringify(payload)}`);
            }
            if (asset.normalized_payload?.name !== 'Runtime Uploaded World' || !asset.normalized_payload?.entries?.runtime_entry) {
                throw new Error(`Creator upload did not preserve world book payload: ${JSON.stringify(payload)}`);
            }
            creatorAssetId = asset.id;
        }, {
            method: 'POST',
            body: JSON.stringify({
                type: 'world_book',
                title: 'Runtime Uploaded World',
                summary: 'Created through the runtime smoke upload API.',
                description: 'Verifies creator upload, submit, approval, and install against a real server.',
                language: 'en',
                content_rating: 'general',
                price_type: 'free',
                price_coins: 0,
                tags: ['smoke', 'upload'],
                metadata: {
                    smoke: true,
                },
                normalized_payload: {
                    name: 'Runtime Uploaded World',
                    entries: {
                        runtime_entry: {
                            key: ['runtime'],
                            content: 'Runtime smoke uploaded world book entry.',
                            enabled: true,
                        },
                    },
                },
            }),
            expectedStatus: 201,
        });
        console.log('runtime ok: POST /api/market/assets creator upload');

        await assertJsonEndpoint(`${baseUrl}/api/market/creator/summary`, '/api/market/creator/summary draft upload', payload => {
            if (payload.handle !== 'default-user' || payload.stats?.total_assets !== 1 || payload.stats?.draft_assets !== 1) {
                throw new Error(`Creator summary did not include uploaded draft: ${JSON.stringify(payload)}`);
            }
            const uploaded = payload.assets?.find(asset => asset.id === creatorAssetId);
            if (!uploaded || uploaded.status !== 'draft' || uploaded.title !== 'Runtime Uploaded World') {
                throw new Error(`Creator summary missing uploaded draft asset: ${JSON.stringify(payload)}`);
            }
        });
        console.log('runtime ok: /api/market/creator/summary draft upload');

        await assertJsonEndpoint(`${baseUrl}/api/market/assets/${creatorAssetId}/submit`, 'POST /api/market/assets/:id/submit', payload => {
            const asset = payload.asset;
            if (asset?.id !== creatorAssetId || asset.status !== 'submitted' || asset.visibility !== 'review') {
                throw new Error(`Submit did not move uploaded asset into review: ${JSON.stringify(payload)}`);
            }
            if (!asset.submitted_at) {
                throw new Error(`Submit did not set submitted_at: ${JSON.stringify(payload)}`);
            }
            if (asset.listed_at !== null) {
                throw new Error(`Submit should not set listed_at: ${JSON.stringify(payload)}`);
            }
        }, {
            method: 'POST',
            body: '{}',
        });
        console.log('runtime ok: POST /api/market/assets/:id/submit');

        await assertJsonEndpoint(`${baseUrl}/api/market/assets/${creatorAssetId}`, '/api/market/assets/:id submitted creator detail', payload => {
            const asset = payload.asset;
            if (asset?.id !== creatorAssetId || asset.status !== 'submitted' || asset.payload_available !== true) {
                throw new Error(`Submitted creator detail did not expose creator-readable payload: ${JSON.stringify(payload)}`);
            }
            if (asset.normalized_payload?.entries?.runtime_entry?.content !== 'Runtime smoke uploaded world book entry.') {
                throw new Error(`Submitted creator detail lost uploaded payload: ${JSON.stringify(payload)}`);
            }
        });
        console.log('runtime ok: /api/market/assets/:id submitted creator detail');

        await assertJsonEndpoint(`${baseUrl}/api/market/assets/${creatorAssetId}/approve`, 'POST /api/market/assets/:id/approve', payload => {
            const asset = payload.asset;
            if (asset?.id !== creatorAssetId || asset.status !== 'listed' || asset.visibility !== 'public') {
                throw new Error(`Approve did not list uploaded asset: ${JSON.stringify(payload)}`);
            }
            if (asset.reviewed_by !== 'default-user' || !asset.approved_at || !asset.listed_at) {
                throw new Error(`Approve did not stamp review metadata: ${JSON.stringify(payload)}`);
            }
        }, {
            method: 'POST',
            body: '{}',
        });
        console.log('runtime ok: POST /api/market/assets/:id/approve');

        await assertJsonEndpoint(`${baseUrl}/api/market/creator/summary`, '/api/market/creator/summary listed upload', payload => {
            if (payload.stats?.total_assets !== 1 || payload.stats?.listed_assets !== 1 || payload.stats?.submitted_assets !== 0) {
                throw new Error(`Creator summary did not reflect approved upload: ${JSON.stringify(payload)}`);
            }
            const uploaded = payload.assets?.find(asset => asset.id === creatorAssetId);
            if (!uploaded || uploaded.status !== 'listed' || !uploaded.approved_at) {
                throw new Error(`Creator summary missing approved uploaded asset: ${JSON.stringify(payload)}`);
            }
        });
        console.log('runtime ok: /api/market/creator/summary listed upload');

        await assertJsonEndpoint(`${baseUrl}/api/market/assets`, '/api/market/assets listed upload', payload => {
            const uploaded = payload.assets?.find(asset => asset.id === creatorAssetId);
            if (!uploaded || uploaded.status !== 'listed' || uploaded.owned !== true || uploaded.price_type !== 'free') {
                throw new Error(`Approved uploaded asset missing from market list: ${JSON.stringify(payload)}`);
            }
            if ('normalized_payload' in uploaded) {
                throw new Error(`Market list leaked uploaded payload: ${JSON.stringify(payload)}`);
            }
        });
        console.log('runtime ok: /api/market/assets listed upload');

        let creatorInstalledPath = '';
        await assertJsonEndpoint(`${baseUrl}/api/market/assets/${creatorAssetId}/install`, 'POST /api/market/assets/:id/install creator upload', payload => {
            if (payload.installed?.type !== 'world_book' || payload.install?.asset_id !== creatorAssetId) {
                throw new Error(`Unexpected creator upload install payload: ${JSON.stringify(payload)}`);
            }
            if (!payload.installed?.path) {
                throw new Error(`Creator upload install payload missing local path: ${JSON.stringify(payload)}`);
            }
            creatorInstalledPath = payload.installed.path;
        }, {
            method: 'POST',
            body: '{}',
        });
        await assertPathExists(path.join(dataRoot, 'default-user', creatorInstalledPath), 'creator uploaded marketplace install');
        console.log('runtime ok: POST /api/market/assets/:id/install creator upload');

        await assertJsonEndpoint(`${baseUrl}/api/market/creator/summary`, '/api/market/creator/summary installed upload', payload => {
            if (payload.stats?.total_installs !== 1) {
                throw new Error(`Creator summary did not reflect uploaded asset install: ${JSON.stringify(payload)}`);
            }
            const uploaded = payload.assets?.find(asset => asset.id === creatorAssetId);
            if (!uploaded || uploaded.install_count !== 1) {
                throw new Error(`Creator summary missing uploaded asset install count: ${JSON.stringify(payload)}`);
            }
        });
        console.log('runtime ok: /api/market/creator/summary installed upload');

        await assertJsonEndpoint(`${baseUrl}/api/market/assets/${demoFreeAssetId}/purchase`, 'POST /api/market/assets/:id/purchase', payload => {
            if (payload.already_owned !== false || payload.entitlement?.source !== 'free' || payload.entitlement?.asset_id !== demoFreeAssetId) {
                throw new Error(`Unexpected marketplace purchase payload: ${JSON.stringify(payload)}`);
            }
        }, {
            method: 'POST',
            body: '{}',
        });
        console.log('runtime ok: POST /api/market/assets/:id/purchase');

        let reportId = '';
        await assertJsonEndpoint(`${baseUrl}/api/market/assets/${demoFreeAssetId}/report`, 'POST /api/market/assets/:id/report', payload => {
            const report = payload.report;
            if (!report?.id || report.asset_id !== demoFreeAssetId || report.reporter_id !== 'default-user') {
                throw new Error(`Unexpected marketplace report payload: ${JSON.stringify(payload)}`);
            }
            if (report.reason !== 'runtime_smoke_report' || report.body !== 'Runtime smoke report body.' || report.status !== 'open') {
                throw new Error(`Marketplace report did not preserve expected fields: ${JSON.stringify(payload)}`);
            }
            reportId = report.id;
        }, {
            method: 'POST',
            body: JSON.stringify({
                reason: 'runtime_smoke_report',
                body: 'Runtime smoke report body.',
            }),
            expectedStatus: 201,
        });
        console.log('runtime ok: POST /api/market/assets/:id/report');

        await assertJsonEndpoint(`${baseUrl}/api/market/reports/admin`, '/api/market/reports/admin', payload => {
            if (!Array.isArray(payload.reports)) {
                throw new Error(`Unexpected report queue payload: ${JSON.stringify(payload)}`);
            }
            const report = payload.reports.find(item => item.id === reportId);
            if (!report || report.status !== 'open' || report.asset?.id !== demoFreeAssetId || report.asset?.title !== 'Mira the Harbor Oracle') {
                throw new Error(`Open marketplace report missing from admin queue: ${JSON.stringify(payload)}`);
            }
            const assetKeys = Object.keys(report.asset || {}).sort();
            const expectedAssetKeys = ['creator_id', 'id', 'price_coins', 'price_type', 'status', 'title', 'type'];
            if (JSON.stringify(assetKeys) !== JSON.stringify(expectedAssetKeys)) {
                throw new Error(`Admin report queue returned unexpected asset fields: ${JSON.stringify(payload)}`);
            }
        });
        console.log('runtime ok: /api/market/reports/admin');

        await assertJsonEndpoint(`${baseUrl}/api/market/reports/${reportId}/resolve`, 'POST /api/market/reports/:id/resolve', payload => {
            const report = payload.report;
            if (report?.id !== reportId || report.status !== 'resolved' || report.resolved_by !== 'default-user') {
                throw new Error(`Unexpected report resolve payload: ${JSON.stringify(payload)}`);
            }
            if (report.resolution_note !== 'Runtime smoke resolved.' || !report.resolved_at) {
                throw new Error(`Report resolve did not preserve resolution metadata: ${JSON.stringify(payload)}`);
            }
        }, {
            method: 'POST',
            body: JSON.stringify({
                note: 'Runtime smoke resolved.',
            }),
        });
        console.log('runtime ok: POST /api/market/reports/:id/resolve');

        await assertJsonEndpoint(`${baseUrl}/api/market/reports/admin`, '/api/market/reports/admin after resolve', payload => {
            if (!Array.isArray(payload.reports) || payload.reports.some(report => report.id === reportId)) {
                throw new Error(`Resolved marketplace report remained in admin queue: ${JSON.stringify(payload)}`);
            }
        });
        console.log('runtime ok: /api/market/reports/admin after resolve');

        await assertJsonEndpoint(`${baseUrl}/api/wallet/grants/admin`, 'POST /api/wallet/grants/admin', payload => {
            if (payload.entry?.userHandle !== 'default-user' || payload.entry?.bucket !== 'paid' || payload.entry?.amount !== demoPaidPrice) {
                throw new Error(`Unexpected admin grant payload: ${JSON.stringify(payload)}`);
            }
            if (payload.balance?.buckets?.paid !== demoPaidPrice) {
                throw new Error(`Admin grant did not update paid balance: ${JSON.stringify(payload)}`);
            }
        }, {
            method: 'POST',
            body: JSON.stringify({
                targetHandle: 'default-user',
                amount: demoPaidPrice,
                bucket: 'paid',
                reason: 'Runtime smoke fixed-price purchase',
            }),
        });
        console.log('runtime ok: POST /api/wallet/grants/admin');

        await assertJsonEndpoint(`${baseUrl}/api/market/assets/${demoPaidAssetId}/purchase`, 'POST /api/market/assets/:id/purchase fixed_price', payload => {
            if (payload.already_owned !== false || payload.entitlement?.source !== 'purchase' || payload.entitlement?.asset_id !== demoPaidAssetId) {
                throw new Error(`Unexpected fixed-price purchase payload: ${JSON.stringify(payload)}`);
            }
            if (!payload.entitlement?.purchase_id || payload.purchase?.id !== payload.entitlement.purchase_id) {
                throw new Error(`Fixed-price purchase missing purchase id: ${JSON.stringify(payload)}`);
            }
            if (payload.purchase?.buyer_balance?.buckets?.paid !== 0) {
                throw new Error(`Fixed-price purchase did not debit buyer paid balance: ${JSON.stringify(payload)}`);
            }
            if (payload.purchase?.ledger_entries !== undefined || payload.purchase?.creator_balance !== undefined) {
                throw new Error(`Fixed-price purchase leaked internal ledger or creator balance: ${JSON.stringify(payload)}`);
            }
        }, {
            method: 'POST',
            body: '{}',
        });
        console.log('runtime ok: POST /api/market/assets/:id/purchase fixed_price');

        await assertJsonEndpoint(`${baseUrl}/api/wallet/ledger`, '/api/wallet/ledger buyer debits', payload => {
            if (payload.balance?.buckets?.paid !== 0) {
                throw new Error(`Buyer wallet paid balance was not debited: ${JSON.stringify(payload)}`);
            }
            const paidDebit = payload.ledger?.find(entry => entry.type === 'market_purchase_debit' && entry.metadata?.asset_id === demoPaidAssetId);
            if (!paidDebit || paidDebit.bucket !== 'paid' || paidDebit.amount !== -demoPaidPrice) {
                throw new Error(`Buyer ledger missing fixed-price debit: ${JSON.stringify(payload)}`);
            }
        });
        console.log('runtime ok: /api/wallet/ledger buyer debits');

        await assertJsonEndpoint(`${baseUrl}/api/wallet/ledger?handle=${demoCreatorHandle}`, '/api/wallet/ledger creator earnings', payload => {
            if (payload.handle !== demoCreatorHandle || payload.balance?.buckets?.earnings !== demoPaidPrice) {
                throw new Error(`Creator earnings balance missing: ${JSON.stringify(payload)}`);
            }
            const creatorEarning = payload.ledger?.find(entry => entry.type === 'market_creator_earning' && entry.metadata?.asset_id === demoPaidAssetId);
            if (!creatorEarning || creatorEarning.bucket !== 'earnings' || creatorEarning.amount !== demoPaidPrice) {
                throw new Error(`Creator ledger missing fixed-price earning: ${JSON.stringify(payload)}`);
            }
        });
        console.log('runtime ok: /api/wallet/ledger creator earnings');

        let installedPath = '';
        await assertJsonEndpoint(`${baseUrl}/api/market/assets/${demoFreeAssetId}/install`, 'POST /api/market/assets/:id/install', payload => {
            if (payload.installed?.type !== 'character_card' || payload.install?.asset_id !== demoFreeAssetId) {
                throw new Error(`Unexpected marketplace install payload: ${JSON.stringify(payload)}`);
            }
            if (!payload.installed?.path) {
                throw new Error(`Install payload missing local path: ${JSON.stringify(payload)}`);
            }
            installedPath = payload.installed.path;
        }, {
            method: 'POST',
            body: '{}',
        });
        await assertPathExists(path.join(dataRoot, 'default-user', installedPath), 'marketplace install');
        console.log('runtime ok: POST /api/market/assets/:id/install');

        let paidInstalledPath = '';
        await assertJsonEndpoint(`${baseUrl}/api/market/assets/${demoPaidAssetId}/install`, 'POST /api/market/assets/:id/install fixed_price', payload => {
            if (payload.installed?.type !== 'world_book' || payload.install?.asset_id !== demoPaidAssetId) {
                throw new Error(`Unexpected fixed-price install payload: ${JSON.stringify(payload)}`);
            }
            if (!payload.installed?.path) {
                throw new Error(`Fixed-price install payload missing local path: ${JSON.stringify(payload)}`);
            }
            paidInstalledPath = payload.installed.path;
        }, {
            method: 'POST',
            body: '{}',
        });
        await assertPathExists(path.join(dataRoot, 'default-user', paidInstalledPath), 'fixed-price marketplace install');
        console.log('runtime ok: POST /api/market/assets/:id/install fixed_price');

        await assertJsonEndpoint(`${baseUrl}/api/market/library`, '/api/market/library', payload => {
            if (!Array.isArray(payload.items)) {
                throw new Error(`Unexpected library payload: ${JSON.stringify(payload)}`);
            }
            const demoItem = payload.items.find(item => item.asset?.id === demoFreeAssetId);
            if (!demoItem || demoItem.entitlement?.source !== 'free' || demoItem.install_count !== 1) {
                throw new Error(`Installed smoke asset missing from library payload: ${JSON.stringify(payload)}`);
            }
            const paidItem = payload.items.find(item => item.asset?.id === demoPaidAssetId);
            if (!paidItem || paidItem.entitlement?.source !== 'purchase' || paidItem.install_count !== 1 || paidItem.asset?.price_type !== 'fixed_price') {
                throw new Error(`Installed paid smoke asset missing from library payload: ${JSON.stringify(payload)}`);
            }
        });
        console.log('runtime ok: /api/market/library');
    } finally {
        if (child) {
            await stopServer(child);
        }
        await rm(tmpRoot, { recursive: true, force: true });
    }
}

async function runCsrfSmoke() {
    const port = await findFreePort();
    const tmpRoot = await mkdtemp(path.join(os.tmpdir(), 'sillytavern-marketplace-csrf-smoke-'));
    const configPath = path.join(tmpRoot, 'config.yaml');
    const dataRoot = path.join(tmpRoot, 'data');
    const baseUrl = `http://127.0.0.1:${port}`;

    let stdout = '';
    let stderr = '';
    let child;

    const getLogs = () => [
        '--- stdout ---',
        stdout.trim(),
        '--- stderr ---',
        stderr.trim(),
    ].join('\n');

    try {
        child = spawn(process.execPath, [
            'server.js',
            `--port=${port}`,
            '--listen=false',
            '--enableIPv4=true',
            '--enableIPv6=false',
            '--browserLaunchEnabled=false',
            '--ssl=false',
            '--heartbeatInterval=0',
            '--whitelist=false',
            '--basicAuthMode=false',
            `--configPath=${configPath}`,
            `--dataRoot=${dataRoot}`,
        ], {
            cwd: rootDirectory,
            env: {
                ...process.env,
                NODE_ENV: process.env.NODE_ENV ?? 'test',
            },
            stdio: ['ignore', 'pipe', 'pipe'],
        });

        child.stdout.on('data', chunk => {
            stdout = appendLog(stdout, chunk);
        });
        child.stderr.on('data', chunk => {
            stderr = appendLog(stderr, chunk);
        });

        const health = await waitForHealth(baseUrl, child, getLogs);
        if (health.ok !== true || health.status !== 'ok' || health.service !== 'sillytavern') {
            throw new Error(`Unexpected default CSRF /api/health payload: ${JSON.stringify(health)}`);
        }
        console.log('runtime ok: default CSRF /api/health');

        const csrf = await getCsrfSession(baseUrl);
        console.log('runtime ok: default CSRF token');

        await assertJsonEndpoint(`${baseUrl}/api/market/assets`, 'default CSRF POST /api/market/assets draft', payload => {
            const asset = payload.asset;
            if (!asset?.id || asset.creator_id !== 'default-user') {
                throw new Error(`CSRF draft upload did not return a default-user asset: ${JSON.stringify(payload)}`);
            }
            if (asset.status !== 'draft' || asset.visibility !== 'private' || asset.type !== 'world_book') {
                throw new Error(`CSRF draft upload did not create a private draft world book: ${JSON.stringify(payload)}`);
            }
            if (asset.title !== 'CSRF Runtime Draft' || asset.price_type !== 'free' || asset.price_coins !== 0) {
                throw new Error(`CSRF draft upload did not preserve expected draft fields: ${JSON.stringify(payload)}`);
            }
        }, {
            method: 'POST',
            headers: {
                'Cookie': csrf.cookieHeader,
                'X-CSRF-Token': csrf.token,
            },
            body: JSON.stringify({
                type: 'world_book',
                title: 'CSRF Runtime Draft',
                summary: 'Created through the runtime smoke upload API with CSRF enabled.',
                normalized_payload: {
                    entries: {
                        csrf_entry: {
                            key: ['csrf'],
                            content: 'CSRF smoke uploaded world book entry.',
                            enabled: true,
                        },
                    },
                },
            }),
            expectedStatus: 201,
        });
        console.log('runtime ok: default CSRF POST /api/market/assets draft');
    } finally {
        if (child) {
            await stopServer(child);
        }
        await rm(tmpRoot, { recursive: true, force: true });
    }
}

async function main() {
    await run();
    await runCsrfSmoke();
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
