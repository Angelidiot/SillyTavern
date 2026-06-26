import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imageTag = process.env.HOSTED_CONTAINER_IMAGE_TAG ?? 'sillytavern-hosted-smoke:local';
const startupTimeoutMs = Number(process.env.HOSTED_CONTAINER_SMOKE_TIMEOUT_MS ?? 180_000);
const requestTimeoutMs = Number(process.env.HOSTED_CONTAINER_SMOKE_REQUEST_TIMEOUT_MS ?? 5_000);

async function readServiceWorkerCacheName() {
    const serviceWorker = await readFile(path.join(rootDirectory, 'public/service-worker.js'), 'utf8');
    const match = serviceWorker.match(/const\s+CACHE_NAME\s*=\s*['"]([^'"]+)['"]/);
    if (!match) {
        throw new Error('Could not parse CACHE_NAME from public/service-worker.js');
    }

    return match[1];
}

function appendLog(buffer, chunk) {
    const maxLength = 30_000;
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
                    reject(new Error('Could not allocate a hosted container smoke port'));
                    return;
                }

                resolve(port);
            });
        });
    });
}

function runCommand(command, args, options = {}) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            cwd: rootDirectory,
            stdio: ['ignore', 'pipe', 'pipe'],
            ...options,
        });

        let stdout = '';
        let stderr = '';
        child.stdout?.on('data', chunk => {
            stdout = appendLog(stdout, chunk);
        });
        child.stderr?.on('data', chunk => {
            stderr = appendLog(stderr, chunk);
        });
        child.once('error', reject);
        child.once('exit', code => {
            resolve({
                code: code ?? 1,
                stdout,
                stderr,
            });
        });
    });
}

async function requireDocker() {
    let result;
    try {
        result = await runCommand('docker', ['version', '--format', '{{.Server.Version}}']);
    } catch (error) {
        throw new Error(`Docker is required for hosted container smoke tests: ${error.message}`);
    }

    if (result.code !== 0) {
        throw new Error(`Docker is required for hosted container smoke tests.\n--- stdout ---\n${result.stdout.trim()}\n--- stderr ---\n${result.stderr.trim()}`);
    }
}

async function buildImage() {
    const result = await runCommand('docker', ['build', '--pull=false', '-t', imageTag, '.']);
    if (result.code !== 0) {
        throw new Error(`Docker image build failed with exit code ${result.code}\n--- stdout ---\n${result.stdout.trim()}\n--- stderr ---\n${result.stderr.trim()}`);
    }
}

async function startContainer({ port, tmpRoot }) {
    const dataRoot = path.join(tmpRoot, 'data');
    const configRoot = path.join(tmpRoot, 'config');
    const containerName = `sillytavern-hosted-smoke-${process.pid}-${Date.now()}`;
    const uid = typeof process.getuid === 'function' ? String(process.getuid()) : '1000';
    const gid = typeof process.getgid === 'function' ? String(process.getgid()) : '1000';

    await mkdir(dataRoot, { recursive: true });
    await mkdir(configRoot, { recursive: true });

    const args = [
        'run',
        '--detach',
        '--name',
        containerName,
        '--add-host',
        'host.docker.internal:host-gateway',
        '--add-host',
        'gateway.docker.internal:host-gateway',
        '-p',
        `127.0.0.1:${port}:8000`,
        '-e',
        'NODE_ENV=production',
        '-e',
        'SILLYTAVERN_HEARTBEATINTERVAL=0',
        '-e',
        'HOME=/home/node',
        '-e',
        'NPM_CONFIG_CACHE=/tmp/sillytavern-npm-cache',
        '-e',
        `PUID=${uid}`,
        '-e',
        `PGID=${gid}`,
        '-v',
        `${configRoot}:/home/node/app/config`,
        '-v',
        `${dataRoot}:/home/node/app/data`,
        imageTag,
        '--disableCsrf',
        '--browserLaunchEnabled=false',
    ];
    const result = await runCommand('docker', args);
    if (result.code !== 0) {
        throw new Error(`Docker container start failed with exit code ${result.code}\n--- stdout ---\n${result.stdout.trim()}\n--- stderr ---\n${result.stderr.trim()}`);
    }

    return {
        id: result.stdout.trim(),
        name: containerName,
    };
}

async function stopContainer(container) {
    if (!container?.id) {
        return;
    }

    await runCommand('docker', ['rm', '-f', container.id]).catch(() => undefined);
}

async function fetchWithTimeout(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

    try {
        const response = await fetch(url, { signal: controller.signal });
        const body = await response.text();
        return { response, body };
    } finally {
        clearTimeout(timeout);
    }
}

async function getContainerLogs(container) {
    if (!container?.id) {
        return '';
    }

    const result = await runCommand('docker', ['logs', '--tail', '120', container.id]).catch(error => ({
        code: 1,
        stdout: '',
        stderr: error.message,
    }));
    return [
        '--- docker logs stdout ---',
        result.stdout.trim(),
        '--- docker logs stderr ---',
        result.stderr.trim(),
    ].join('\n');
}

async function getContainerState(container) {
    if (!container?.id) {
        return null;
    }

    const result = await runCommand('docker', ['inspect', '--format', '{{json .State}}', container.id]).catch(() => null);
    if (!result || result.code !== 0 || !result.stdout.trim()) {
        return null;
    }

    try {
        return JSON.parse(result.stdout.trim());
    } catch {
        return null;
    }
}

async function waitForHealth(baseUrl, container) {
    const deadline = Date.now() + startupTimeoutMs;
    let lastError;

    while (Date.now() < deadline) {
        try {
            const { response, body } = await fetchWithTimeout(`${baseUrl}/api/health`);
            if (response.ok) {
                const health = JSON.parse(body);
                if (health.ok === true && health.status === 'ok' && health.service === 'sillytavern') {
                    return health;
                }
                lastError = new Error(`Unexpected /api/health payload: ${body.slice(0, 500)}`);
            } else {
                lastError = new Error(`GET /api/health returned ${response.status}: ${body.slice(0, 500)}`);
            }
        } catch (error) {
            lastError = error;
        }

        const state = await getContainerState(container);
        if (state && ['dead', 'exited'].includes(state.Status)) {
            throw new Error(`Hosted container exited before becoming healthy. Status: ${state.Status}; exitCode: ${state.ExitCode}; error: ${state.Error || 'none'}\n${await getContainerLogs(container)}`);
        }

        await new Promise(resolve => setTimeout(resolve, 750));
    }

    throw new Error(`Timed out waiting for hosted container health. Last error: ${lastError?.message ?? 'unknown'}\n${await getContainerLogs(container)}`);
}

async function assertJsonEndpoint(url, label, assertPayload) {
    const { response, body } = await fetchWithTimeout(url);
    if (!response.ok) {
        throw new Error(`${label} returned ${response.status}: ${body.slice(0, 500)}`);
    }

    let payload;
    try {
        payload = JSON.parse(body);
    } catch (error) {
        throw new Error(`${label} did not return valid JSON: ${error.message}`);
    }

    assertPayload(payload);
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

async function run() {
    await requireDocker();

    const port = await findFreePort();
    const tmpRoot = await mkdtemp(path.join(os.tmpdir(), 'sillytavern-hosted-container-'));
    const baseUrl = `http://127.0.0.1:${port}`;
    const serviceWorkerCacheName = await readServiceWorkerCacheName();
    let container;

    try {
        await buildImage();
        console.log(`container smoke ok: built ${imageTag}`);

        container = await startContainer({ port, tmpRoot });
        console.log(`container smoke ok: started ${container.id}`);

        await waitForHealth(baseUrl, container);
        console.log('container smoke ok: /api/health');

        await assertJsonEndpoint(`${baseUrl}/api/wallet`, '/api/wallet', wallet => {
            if (!wallet || typeof wallet.handle !== 'string') {
                throw new Error(`Unexpected wallet payload: ${JSON.stringify(wallet)}`);
            }
            if (!wallet.balance || typeof wallet.balance.total !== 'number') {
                throw new Error(`Wallet payload missing numeric total: ${JSON.stringify(wallet)}`);
            }
            for (const bucket of ['bonus', 'paid', 'earnings']) {
                if (typeof wallet.balance.buckets?.[bucket] !== 'number') {
                    throw new Error(`Wallet payload missing ${bucket} bucket: ${JSON.stringify(wallet)}`);
                }
            }
        });
        console.log('container smoke ok: /api/wallet');

        await assertJsonEndpoint(`${baseUrl}/api/market/assets`, '/api/market/assets', market => {
            if (!Array.isArray(market.assets)) {
                throw new Error(`Unexpected market assets payload: ${JSON.stringify(market)}`);
            }
        });
        console.log('container smoke ok: /api/market/assets');

        await assertJsonEndpoint(`${baseUrl}/manifest.json`, '/manifest.json', manifest => {
            if (manifest.display !== 'standalone' || manifest.scope !== '/' || manifest.start_url !== '/') {
                throw new Error(`Unexpected manifest payload: ${JSON.stringify(manifest)}`);
            }
        });
        console.log('container smoke ok: /manifest.json');

        await assertTextEndpoint(`${baseUrl}/service-worker.js`, '/service-worker.js', serviceWorkerCacheName);
        await assertTextEndpoint(`${baseUrl}/service-worker.js`, '/service-worker.js', "url.pathname.startsWith('/api/')");
        console.log('container smoke ok: /service-worker.js');

        await assertTextEndpoint(`${baseUrl}/`, '/', 'scripts/pwa.js');
        console.log('container smoke ok: /');
    } catch (error) {
        if (container) {
            console.error(await getContainerLogs(container));
        }
        throw error;
    } finally {
        await stopContainer(container);
        await rm(tmpRoot, { recursive: true, force: true });
    }
}

run().catch(error => {
    console.error(error);
    process.exit(1);
});
