import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, test, expect, afterEach } from '@jest/globals';

import { generateMarketplaceApiReference, run } from '../scripts/export-marketplace-api-reference.mjs';

let tmpRoot = '';

afterEach(async () => {
    if (tmpRoot) {
        await rm(tmpRoot, { recursive: true, force: true });
        tmpRoot = '';
    }
});

describe('marketplace API reference export script', () => {
    test('generates markdown from current MVP routes', async () => {
        const markdown = await generateMarketplaceApiReference({ generatedAt: '2026-06-26T00:00:00.000Z' });

        expect(markdown).toContain('# Marketplace API Reference');
        expect(markdown).toContain('Generated at: 2026-06-26T00:00:00.000Z');
        expect(markdown).toContain('## Client Request Requirements');
        expect(markdown).toContain('Fetch `GET /csrf-token`, keep the returned session cookie, and send the token in the `X-CSRF-Token` header on `POST`, `PATCH`, `PUT`, and `DELETE` marketplace or wallet requests.');
        expect(markdown).toContain('The CSRF token must match the same session cookie returned by `/csrf-token`; missing or mismatched write tokens are rejected before marketplace or wallet handlers run.');
        expect(markdown).toContain('tokenless `POST /api/market/assets` returning `403`');
        expect(markdown).toContain('The built-in web/PWA client uses `getRequestHeaders()` to include JSON content type and the current CSRF token.');
        expect(markdown).toContain('Local smoke scripts may run with `--disableCsrf`, but hosted/mobile clients should assume CSRF is enabled unless the deployment explicitly says otherwise.');
        expect(markdown).toContain('## Market API');
        expect(markdown).toContain('GET    /api/market/assets');
        expect(markdown).toContain('GET    /api/market/assets/:id');
        expect(markdown).toContain('GET    /api/market/creator/summary');
        expect(markdown).toContain('GET    /api/market/library');
        expect(markdown).toContain('GET    /api/market/reports/admin');
        expect(markdown).toContain('PATCH  /api/market/assets/:id');
        expect(markdown).toContain('POST   /api/market/assets');
        expect(markdown).toContain('POST   /api/market/assets/:id/submit');
        expect(markdown).toContain('POST   /api/market/assets/:id/approve');
        expect(markdown).toContain('POST   /api/market/assets/:id/reject');
        expect(markdown).toContain('POST   /api/market/assets/:id/delist');
        expect(markdown).toContain('POST   /api/market/assets/:id/report');
        expect(markdown).toContain('POST   /api/market/assets/:id/purchase');
        expect(markdown).toContain('POST   /api/market/assets/:id/install');
        expect(markdown).toContain('POST   /api/market/reports/:id/resolve');
        expect(markdown).toContain('## Wallet API');
        expect(markdown).toContain('GET    /api/wallet');
        expect(markdown).toContain('GET    /api/wallet/ledger');
        expect(markdown).toContain('POST   /api/wallet/grants/admin');
        expect(markdown).toContain('## Public health API');
        expect(markdown).toContain('GET    /api/health');
        expect(markdown).toContain('Notes:');
        expect(markdown).toContain('- GET /api/market/assets: Lists listed public assets plus assets readable by the creator, admins, or entitled users as metadata summaries only; normalized_payload is never included in list responses.');
        expect(markdown).toContain('- GET /api/market/assets/:id: Listed public assets are readable as allowlisted metadata; raw metadata, review/moderation internals, and entitlement ledger internals are excluded, and payload is returned only to the creator, admins, or entitled users.');
        expect(markdown).toContain('- GET /api/market/creator/summary: Returns only the current creator\'s asset summaries and aggregate stats; raw wallet objects, recent earnings ledgers, and asset payloads are excluded.');
        expect(markdown).toContain('- GET /api/market/library: Returns only the authenticated user\'s active entitlements and install summaries.');
        expect(markdown).toContain('- GET /api/market/reports/admin: Admin-only report queue; report bodies are visible here but asset payloads remain excluded.');
        expect(markdown).toContain('- POST /api/market/assets: Creates a draft character_card or world_book asset; body must be a JSON object with object metadata up to 65536 bytes and normalized_payload up to 1048576 bytes, bounded title/summary/description/tags/language/content_rating metadata, supported price_type free/fixed_price, and positive safe integer price_coins for fixed_price assets.');
        expect(markdown).toContain('- PATCH /api/market/assets/:id: Creator-only revision for draft or rejected assets; uses the same asset body and byte-size validation as create and resets the asset to private draft before resubmission.');
        expect(markdown).toContain('- POST /api/market/assets/:id/report: Creates an open report with required reason up to 120 characters and optional body up to 2000 characters.');
        expect(markdown).toContain('- POST /api/market/reports/:id/resolve: Admin-only report resolution with optional note up to 1000 characters.');
        expect(markdown).toContain('- POST /api/market/assets/:id/submit: Creator-only transition from valid private draft to submitted review state.');
        expect(markdown).toContain('- POST /api/market/assets/:id/approve: Admin-only review action that validates payload format and lists the asset publicly.');
        expect(markdown).toContain('- POST /api/market/assets/:id/reject: Admin-only review action that returns submitted assets to private rejected state with an optional reason up to 1000 characters.');
        expect(markdown).toContain('- POST /api/market/assets/:id/delist: Admin-only moderation action; existing entitlements are preserved.');
        expect(markdown).toContain('- POST /api/market/assets/:id/purchase: Claims free assets or buys fixed-price listed assets with wallet bonus then paid coins; purchase responses omit full ledger entries and creator balances.');
        expect(markdown).toContain('- POST /api/market/assets/:id/install: Installs creator-owned or entitled assets into the user data directory and returns a redacted local reference without absolute paths.');
        expect(markdown).toContain('- GET /api/wallet: Authenticated users can read their own wallet; admins may pass handle to inspect another wallet.');
        expect(markdown).toContain('- GET /api/wallet/ledger: Authenticated users can read their own ledger; admins may pass handle to inspect another ledger.');
        expect(markdown).toContain('- POST /api/wallet/grants/admin: Admin-only grant endpoint; target can be handle, userHandle, or targetHandle.');
    });

    test('keeps the checked-in API reference in sync with generated routes', async () => {
        const expected = await generateMarketplaceApiReference({ generatedAt: '2026-06-26T00:00:00.000Z' });
        const checkedIn = await readFile(path.join(path.dirname(fileURLToPath(import.meta.url)), '../docs/marketplace-api-reference.md'), 'utf8');

        expect(checkedIn).toBe(expected);
    });

    test('writes markdown to an explicit output path', async () => {
        tmpRoot = await mkdtemp(path.join(os.tmpdir(), 'st-market-api-reference-'));
        const outPath = path.join(tmpRoot, 'api-reference.md');
        const logs = [];
        const originalLog = console.log;
        console.log = message => logs.push(message);
        try {
            await run(['--out', outPath]);
        } finally {
            console.log = originalLog;
        }

        const markdown = await readFile(outPath, 'utf8');
        expect(markdown).toContain('GET    /api/market/assets');
        expect(markdown).toContain('POST   /api/wallet/grants/admin');
        expect(logs.join('\n')).toContain('Marketplace API reference written to');
    });

    test('can pin the generated timestamp for checked-in docs', async () => {
        tmpRoot = await mkdtemp(path.join(os.tmpdir(), 'st-market-api-reference-'));
        const outPath = path.join(tmpRoot, 'api-reference.md');
        const originalGeneratedAt = process.env.MARKETPLACE_API_REFERENCE_GENERATED_AT;
        const originalLog = console.log;
        process.env.MARKETPLACE_API_REFERENCE_GENERATED_AT = '2026-06-26T00:00:00.000Z';
        console.log = () => {};
        try {
            await run(['--out', outPath]);
        } finally {
            console.log = originalLog;
            if (originalGeneratedAt === undefined) {
                delete process.env.MARKETPLACE_API_REFERENCE_GENERATED_AT;
            } else {
                process.env.MARKETPLACE_API_REFERENCE_GENERATED_AT = originalGeneratedAt;
            }
        }

        const markdown = await readFile(outPath, 'utf8');
        expect(markdown).toContain('Generated at: 2026-06-26T00:00:00.000Z');
    });

    test('rejects unknown arguments', async () => {
        await expect(run(['--unknown'])).rejects.toThrow('Unknown argument: --unknown');
    });

    test('requires an output path after --out', async () => {
        await expect(run(['--out'])).rejects.toThrow('Missing value for --out');
        await expect(run(['--out='])).rejects.toThrow('Missing value for --out');
    });
});
