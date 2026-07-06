import { test, expect } from '@playwright/test';

const SHELL_CACHE_NAME = 'sillytavern-shell-v3';
const MARKETPLACE_WALLET_EXTENSION_VERSION = '0.2.28';
const PWA_SHELL_PATHS = [
    '/',
    '/login.html',
    '/manifest.json',
    '/style.css',
    '/scripts/pwa.js',
    '/scripts/extensions/marketplace-wallet/manifest.json',
    '/scripts/extensions/marketplace-wallet/window.html',
    `/scripts/extensions/marketplace-wallet/index.js?v=${MARKETPLACE_WALLET_EXTENSION_VERSION}`,
    `/scripts/extensions/marketplace-wallet/filters.js?v=${MARKETPLACE_WALLET_EXTENSION_VERSION}`,
    `/scripts/extensions/marketplace-wallet/style.css?v=${MARKETPLACE_WALLET_EXTENSION_VERSION}`,
];

function makeWallet(overrides = {}) {
    return {
        handle: 'default-user',
        balance: {
            total: 175,
            buckets: {
                bonus: 100,
                paid: 50,
                earnings: 25,
            },
        },
        ...overrides,
    };
}

function makeSubmittedAsset(overrides = {}) {
    return {
        id: 'submitted-character',
        type: 'character_card',
        title: 'Submitted Character',
        summary: 'Awaiting review.',
        creator_id: 'creator-handle',
        tags: ['review', 'avatar', 'scenario'],
        status: 'submitted',
        owned: false,
        price_type: 'fixed_price',
        price_coins: 25,
        sales_count: 0,
        updated_at: '2026-06-26T10:00:00.000Z',
        ...overrides,
    };
}

function makeListedAsset(overrides = {}) {
    return {
        id: 'listed-world',
        type: 'world_book',
        title: 'Listed World',
        summary: 'Ready to install.',
        creator_id: 'creator-handle',
        language: 'en',
        content_rating: 'general',
        tags: ['lore'],
        status: 'listed',
        owned: false,
        price_type: 'fixed_price',
        price_coins: 125,
        sales_count: 3,
        created_at: '2026-06-25T10:00:00.000Z',
        listed_at: '2026-06-26T11:00:00.000Z',
        updated_at: '2026-06-26T11:00:00.000Z',
        normalized_payload: {
            name: 'Listed World',
            entries: {},
        },
        ...overrides,
    };
}

function makeOpenReport(overrides = {}) {
    return {
        id: 'report-listed-world',
        asset_id: 'listed-world',
        reporter_id: 'reporter-handle',
        reason: 'unsafe_prompt',
        body: 'This world needs a moderation pass.',
        status: 'open',
        created_at: '2026-06-26T12:30:00.000Z',
        asset: makeListedAsset(),
        ...overrides,
    };
}

function makeLibraryItem(asset, overrides = {}) {
    return {
        entitlement: {
            id: `ent-${asset.id}`,
            source: asset.price_type === 'free' ? 'free' : 'purchase',
            purchase_id: asset.price_type === 'free' ? null : `market:${asset.id}:default-user:v1`,
            created_at: '2026-06-26T12:45:00.000Z',
        },
        asset: {
            ...asset,
            entitled: true,
        },
        install_count: 0,
        last_install: null,
        ...overrides,
    };
}

function makeCurrentUser(overrides = {}) {
    return {
        handle: 'default-user',
        name: 'User',
        avatar: '/img/default-user.png',
        admin: true,
        password: false,
        enabled: true,
        created: 0,
        ...overrides,
    };
}

async function mockMarketplaceApis(page, {
    assets = [makeListedAsset(), makeSubmittedAsset()],
    reports = [],
    library = [],
    failAssetListOnce = false,
    failCreatorOnce = false,
    failLedgerOnce = false,
    failLibraryOnce = false,
    failReportsOnce = false,
    failInstallOnceFor = '',
    failSubmitOnceFor = '',
    holdNextInstallFor = '',
} = {}) {
    let wallet = makeWallet();
    let ledger = [];
    let shouldFailAssetList = failAssetListOnce;
    let shouldFailCreator = failCreatorOnce;
    let shouldFailLedger = failLedgerOnce;
    let shouldFailLibrary = failLibraryOnce;
    let shouldFailReports = failReportsOnce;
    let failedInstall = false;
    let failedSubmit = false;
    let didHoldInstall = false;
    let heldInstall = null;
    const apiCalls = {
        approve: [],
        creates: [],
        delists: [],
        details: [],
        grants: [],
        installs: [],
        purchases: [],
        rejects: [],
        reports: [],
        revisions: [],
        resolveReports: [],
        resolveHeldInstall: async () => {
            if (heldInstall) {
                const release = heldInstall;
                heldInstall = null;
                await release();
            }
        },
        submits: [],
    };

    await page.route('**/api/users/me', route => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(makeCurrentUser()),
        });
    });

    await page.route('**/api/wallet', route => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(wallet),
        });
    });

    await page.route('**/api/wallet/ledger', route => {
        if (shouldFailLedger) {
            shouldFailLedger = false;
            route.fulfill({
                status: 503,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Wallet ledger temporarily unavailable' }),
            });
            return;
        }

        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                handle: wallet.handle,
                ledger,
                balance: wallet.balance,
            }),
        });
    });

    await page.route('**/api/market/assets', route => {
        if (route.request().method() !== 'GET') {
            route.fallback();
            return;
        }

        if (shouldFailAssetList) {
            shouldFailAssetList = false;
            route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Market temporarily unavailable' }),
            });
            return;
        }

        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ assets }),
        });
    });

    await page.route('**/api/market/creator/summary', route => {
        if (shouldFailCreator) {
            shouldFailCreator = false;
            route.fulfill({
                status: 503,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Creator summary temporarily unavailable' }),
            });
            return;
        }

        const ownAssets = assets.filter(asset => asset.creator_id === 'default-user');
        const listedAssets = ownAssets.filter(asset => asset.status === 'listed');
        const statusCounts = ownAssets.reduce((counts, asset) => {
            const status = asset.status || 'draft';
            counts[status] = (counts[status] || 0) + 1;
            return counts;
        }, {});
        const paidSales = ownAssets.reduce((sum, asset) => {
            return asset.price_type === 'fixed_price' ? sum + Number(asset.sales_count || 0) : sum;
        }, 0);
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                handle: 'default-user',
                stats: {
                    total_assets: ownAssets.length,
                    draft_assets: statusCounts.draft || 0,
                    submitted_assets: statusCounts.submitted || 0,
                    listed_assets: listedAssets.length,
                    rejected_assets: statusCounts.rejected || 0,
                    total_claims: ownAssets.reduce((sum, asset) => sum + Number(asset.sales_count || 0), 0),
                    paid_sales: paidSales,
                    total_installs: ownAssets.reduce((sum, asset) => sum + Number(asset.install_count || 0), 0),
                    gross_revenue_coins: 0,
                    earnings_balance: wallet.balance.buckets.earnings,
                },
                assets: ownAssets,
            }),
        });
    });

    await page.route('**/api/market/library', route => {
        if (shouldFailLibrary) {
            shouldFailLibrary = false;
            route.fulfill({
                status: 503,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Library temporarily unavailable' }),
            });
            return;
        }

        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ items: library }),
        });
    });

    await page.route('**/api/market/assets', async route => {
        if (route.request().method() !== 'POST') {
            route.fallback();
            return;
        }

        const payload = JSON.parse(route.request().postData() || '{}');
        apiCalls.creates.push(payload);
        const createdAsset = {
            id: `created-${apiCalls.creates.length}`,
            creator_id: 'default-user',
            type: payload.type,
            title: payload.title,
            summary: payload.summary,
            language: payload.language || 'en',
            content_rating: payload.content_rating || 'general',
            tags: Array.isArray(payload.tags) ? payload.tags : [],
            status: 'draft',
            owned: true,
            entitled: false,
            price_type: payload.price_type,
            price_coins: payload.price_coins,
            sales_count: 0,
            install_count: 0,
            normalized_payload: payload.normalized_payload,
            created_at: '2026-06-26T13:00:00.000Z',
            updated_at: '2026-06-26T13:00:00.000Z',
        };
        assets = [createdAsset, ...assets];
        route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({ asset: createdAsset }),
        });
    });

    await page.route('**/api/market/assets/*', async route => {
        const method = route.request().method();
        if (!['GET', 'PATCH'].includes(method)) {
            route.fallback();
            return;
        }

        const assetId = route.request().url().split('/').at(-1);
        const existingAsset = assets.find(asset => asset.id === assetId);
        if (!existingAsset) {
            route.fulfill({
                status: 404,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'not found' }),
            });
            return;
        }

        if (method === 'GET') {
            apiCalls.details.push(assetId);
            const libraryItem = library.find(item => item.asset?.id === assetId || item.entitlement?.asset_id === assetId);
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    asset: {
                        ...existingAsset,
                        payload_available: true,
                    },
                    entitlement: libraryItem?.entitlement || null,
                }),
            });
            return;
        }

        const payload = JSON.parse(route.request().postData() || '{}');
        apiCalls.revisions.push({ assetId, payload });
        let revisedAsset = null;
        assets = assets.map(asset => {
            if (asset.id !== assetId) {
                return asset;
            }
            revisedAsset = {
                ...asset,
                ...payload,
                status: 'draft',
                owned: true,
                updated_at: '2026-06-26T13:02:00.000Z',
                submitted_at: null,
                normalized_payload: payload.normalized_payload,
            };
            return revisedAsset;
        });
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ asset: revisedAsset }),
        });
    });

    await page.route('**/api/market/assets/*/submit', route => {
        const assetId = route.request().url().split('/').at(-2);
        apiCalls.submits.push(assetId);
        if (failSubmitOnceFor === assetId && !failedSubmit) {
            failedSubmit = true;
            route.fulfill({
                status: 503,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Review service offline' }),
            });
            return;
        }

        let submittedAsset = null;
        assets = assets.map(asset => {
            if (asset.id !== assetId) {
                return asset;
            }
            submittedAsset = {
                ...asset,
                status: 'submitted',
                updated_at: '2026-06-26T13:01:00.000Z',
                submitted_at: '2026-06-26T13:01:00.000Z',
            };
            return submittedAsset;
        });
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ asset: submittedAsset }),
        });
    });

    await page.route('**/api/market/assets/*/approve', route => {
        const assetId = route.request().url().split('/').at(-2);
        apiCalls.approve.push(assetId);
        assets = assets.map(asset => asset.id === assetId
            ? { ...asset, status: 'listed', listed_at: '2026-06-26T12:00:00.000Z' }
            : asset);
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ asset: assets.find(asset => asset.id === assetId) }),
        });
    });

    await page.route('**/api/market/assets/*/reject', async route => {
        const assetId = route.request().url().split('/').at(-2);
        const payload = route.request().postDataJSON();
        apiCalls.rejects.push({ assetId, payload });
        assets = assets.map(asset => asset.id === assetId
            ? { ...asset, status: 'rejected', rejection_reason: payload.reason || '' }
            : asset);
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ asset: assets.find(asset => asset.id === assetId) }),
        });
    });

    await page.route('**/api/market/assets/*/delist', route => {
        const assetId = route.request().url().split('/').at(-2);
        apiCalls.delists.push(assetId);
        assets = assets.map(asset => asset.id === assetId
            ? { ...asset, status: 'delisted', delisted_at: '2026-06-26T14:30:00.000Z' }
            : asset);
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ asset: assets.find(asset => asset.id === assetId) }),
        });
    });

    await page.route('**/api/market/assets/*/purchase', route => {
        const assetId = route.request().url().split('/').at(-2);
        const asset = assets.find(item => item.id === assetId);
        const purchaseId = asset?.price_type === 'free' ? null : `market:${assetId}:default-user:v1`;
        apiCalls.purchases.push(assetId);
        assets = assets.map(item => item.id === assetId
            ? { ...item, entitled: true, sales_count: Number(item.sales_count || 0) + 1 }
            : item);
        const entitlement = {
            id: `ent-${assetId}`,
            user_id: 'default-user',
            asset_id: assetId,
            source: asset?.price_type === 'free' ? 'free' : 'purchase',
            purchase_id: purchaseId,
            created_at: '2026-06-26T12:45:00.000Z',
            revoked_at: null,
        };
        if (asset && !library.some(item => item.asset.id === assetId)) {
            library = [makeLibraryItem({ ...asset, entitled: true }, { entitlement }), ...library];
        }
        let purchase = null;
        if (asset?.price_type === 'fixed_price') {
            const price = Number(asset.price_coins || 0);
            const bonusDebit = Math.min(wallet.balance.buckets.bonus, price);
            const paidDebit = price - bonusDebit;
            wallet = makeWallet({
                balance: {
                    buckets: {
                        bonus: wallet.balance.buckets.bonus - bonusDebit,
                        paid: wallet.balance.buckets.paid - paidDebit,
                        earnings: wallet.balance.buckets.earnings,
                    },
                },
            });
            wallet.balance.total = wallet.balance.buckets.bonus + wallet.balance.buckets.paid + wallet.balance.buckets.earnings;
            ledger = [
                ...ledger,
                ...(bonusDebit > 0
                    ? [{
                        id: `ledger-${assetId}-bonus`,
                        type: 'market_purchase_debit',
                        userHandle: 'default-user',
                        actorHandle: 'default-user',
                        bucket: 'bonus',
                        amount: -bonusDebit,
                        reason: `Market purchase: ${asset.title}`,
                        createdAt: Date.now(),
                        metadata: {
                            purchase_id: purchaseId,
                            asset_id: assetId,
                            price_coins: price,
                        },
                    }]
                    : []),
                ...(paidDebit > 0
                    ? [{
                        id: `ledger-${assetId}-paid`,
                        type: 'market_purchase_debit',
                        userHandle: 'default-user',
                        actorHandle: 'default-user',
                        bucket: 'paid',
                        amount: -paidDebit,
                        reason: `Market purchase: ${asset.title}`,
                        createdAt: Date.now() + 1,
                        metadata: {
                            purchase_id: purchaseId,
                            asset_id: assetId,
                            price_coins: price,
                        },
                    }]
                    : []),
            ];
            purchase = {
                id: purchaseId,
                buyer_balance: wallet.balance,
            };
        }
        route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({
                entitlement,
                already_owned: false,
                purchase,
            }),
        });
    });

    await page.route('**/api/market/assets/*/install', route => {
        const assetId = route.request().url().split('/').at(-2);
        const asset = assets.find(item => item.id === assetId) || library.find(item => item.asset.id === assetId)?.asset;
        apiCalls.installs.push(assetId);
        const fulfillInstall = async () => {
            if (failInstallOnceFor === assetId && !failedInstall) {
                failedInstall = true;
                await route.fulfill({
                    status: 400,
                    contentType: 'application/json',
                    body: JSON.stringify({ error: 'Install target is temporarily unavailable' }),
                });
                return;
            }
            library = library.map(item => item.asset.id === assetId
                ? {
                    ...item,
                    install_count: Number(item.install_count || 0) + 1,
                    last_install: {
                        type: asset?.type || 'world_book',
                        local_ref: `worlds/${assetId}.json`,
                        created_at: '2026-06-26T12:46:00.000Z',
                    },
                }
                : item);
            assets = assets.map(item => item.id === assetId
                ? { ...item, entitled: true, install_count: Number(item.install_count || 0) + 1 }
                : item);
            await route.fulfill({
                status: 201,
                contentType: 'application/json',
                body: JSON.stringify({
                    installed: {
                        type: asset?.type || 'world_book',
                        name: asset?.title || 'Market asset',
                        path: `worlds/${assetId}.json`,
                    },
                    install: {
                        id: `install-${assetId}`,
                        user_id: 'default-user',
                        asset_id: assetId,
                        installed_type: asset?.type || 'world_book',
                        local_ref: `worlds/${assetId}.json`,
                        created_at: '2026-06-26T12:46:00.000Z',
                    },
                }),
            });
        };
        if (holdNextInstallFor === assetId && !didHoldInstall && !heldInstall) {
            didHoldInstall = true;
            heldInstall = fulfillInstall;
            return;
        }
        void fulfillInstall();
    });

    await page.route('**/api/market/assets/*/report', route => {
        const assetId = route.request().url().split('/').at(-2);
        const asset = assets.find(item => item.id === assetId) || library.find(item => item.asset.id === assetId)?.asset;
        const payload = JSON.parse(route.request().postData() || '{}');
        apiCalls.reports.push({ assetId, payload });
        const report = {
            id: `report-${assetId}-${apiCalls.reports.length}`,
            asset_id: assetId,
            reporter_id: 'default-user',
            reason: payload.reason,
            body: payload.body || '',
            status: 'open',
            created_at: '2026-06-26T13:05:00.000Z',
            asset,
        };
        reports = [report, ...reports];
        route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({ report }),
        });
    });

    await page.route('**/api/market/reports/admin', route => {
        if (shouldFailReports) {
            shouldFailReports = false;
            route.fulfill({
                status: 503,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Reports temporarily unavailable' }),
            });
            return;
        }

        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ reports }),
        });
    });

    await page.route('**/api/market/reports/*/resolve', route => {
        const reportId = route.request().url().split('/').at(-2);
        const payload = JSON.parse(route.request().postData() || '{}');
        apiCalls.resolveReports.push({ reportId, payload });
        reports = reports.filter(report => report.id !== reportId);
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ report: { id: reportId, status: 'resolved', resolution_note: payload.note || '' } }),
        });
    });

    await page.route('**/api/wallet/grants/admin', async route => {
        const payload = JSON.parse(route.request().postData() || '{}');
        apiCalls.grants.push(payload);
        if (payload.targetHandle === wallet.handle) {
            wallet = makeWallet({
                balance: {
                    buckets: {
                        ...wallet.balance.buckets,
                        [payload.bucket]: Number(wallet.balance.buckets[payload.bucket] || 0) + Number(payload.amount || 0),
                    },
                },
            });
            wallet.balance.total = wallet.balance.buckets.bonus + wallet.balance.buckets.paid + wallet.balance.buckets.earnings;
            ledger = [
                ...ledger,
                {
                    id: `ledger-grant-${ledger.length + 1}`,
                    type: 'admin_grant',
                    userHandle: wallet.handle,
                    actorHandle: wallet.handle,
                    bucket: payload.bucket,
                    amount: Number(payload.amount || 0),
                    reason: payload.reason || 'Admin grant',
                    createdAt: Date.now(),
                    metadata: {
                        source: 'wallet.grants.admin',
                    },
                },
            ];
        }
        route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({
                handle: payload.targetHandle,
                balance: wallet.balance,
            }),
        });
    });

    return apiCalls;
}

async function openMarketplaceWallet(page, { expectLoaded = true } = {}) {
    await page.goto('/');
    await page.waitForFunction('document.getElementById("preloader") === null', { timeout: 0 });

    const onboardingDialog = page.getByRole('dialog').filter({ hasText: 'Welcome to SillyTavern!' });
    const hasOnboarding = await onboardingDialog.waitFor({ state: 'visible', timeout: 5_000 })
        .then(() => true)
        .catch(() => false);
    if (hasOnboarding) {
        await onboardingDialog.locator('.popup-button-ok').click();
        await expect(onboardingDialog).toBeHidden();
    }

    const extensionsDrawer = page.locator('#extensions-settings-button');
    const extensionsContent = extensionsDrawer.locator('#rm_extensions_block');
    if (!(await extensionsContent.evaluate(element => element.classList.contains('openDrawer')))) {
        await extensionsDrawer.locator('.drawer-toggle').click();
    }
    await expect(extensionsContent).toHaveClass(/openDrawer/);

    const walletUi = page.locator('#marketplace_wallet_ui');
    await expect(walletUi).toBeAttached({ timeout: 30_000 });

    const drawerContent = walletUi.locator('.inline-drawer-content');
    if (!(await drawerContent.isVisible())) {
        await walletUi.locator('.inline-drawer-toggle').click();
    }
    await expect(drawerContent).toBeVisible();

    if (expectLoaded) {
        await expect(walletUi.locator('#marketplace_wallet_total')).toHaveText('175');
    }
}

async function loadSillyTavern(page) {
    await openMarketplaceWallet(page);
}

async function resetPwaState(page) {
    await page.evaluate(async () => {
        await Promise.all((await caches.keys()).map(cacheName => caches.delete(cacheName)));

        if ('serviceWorker' in navigator) {
            await Promise.all((await navigator.serviceWorker.getRegistrations()).map(registration => registration.unregister()));
        }
    });
}

test.describe('hosted tavern PWA browser shell', () => {
    test.describe.configure({ mode: 'serial' });

    test.afterEach(async ({ page }) => {
        await resetPwaState(page).catch(() => {});
    });

    test('shows a browser install action when the PWA prompt is available', async ({ page }) => {
        await page.goto('/login.html', { waitUntil: 'load' });

        await page.evaluate(() => {
            window.__pwaInstallPrompted = false;
            const event = new Event('beforeinstallprompt', { cancelable: true });
            Object.defineProperties(event, {
                prompt: {
                    value: async () => {
                        window.__pwaInstallPrompted = true;
                    },
                },
                userChoice: {
                    value: Promise.resolve({ outcome: 'accepted' }),
                },
            });
            window.dispatchEvent(event);
        });

        const installButton = page.locator('#pwa_install_button');
        await expect(installButton).toBeVisible();
        await expect(installButton).toHaveAttribute('aria-label', 'Install SillyTavern');
        await installButton.click();

        await expect.poll(() => page.evaluate(() => Boolean(window.__pwaInstallPrompted))).toBe(true);
        await expect(page.locator('#pwa_install_prompt')).toHaveCount(0);

        await page.evaluate(() => {
            const event = new Event('beforeinstallprompt', { cancelable: true });
            Object.defineProperties(event, {
                prompt: {
                    value: async () => {},
                },
                userChoice: {
                    value: Promise.resolve({ outcome: 'dismissed' }),
                },
            });
            window.dispatchEvent(event);
        });
        await expect(installButton).toBeVisible();

        await page.evaluate(() => window.dispatchEvent(new Event('appinstalled')));
        await expect(page.locator('#pwa_install_prompt')).toHaveCount(0);
    });

    test('registers the service worker shell cache and leaves API responses uncached', async ({ page }) => {
        await page.goto('/login.html', { waitUntil: 'load' });
        await resetPwaState(page);
        await page.reload({ waitUntil: 'load' });

        await expect.poll(() => page.evaluate(async () => {
            if (!('serviceWorker' in navigator)) {
                return '';
            }

            const readyRegistration = await navigator.serviceWorker.ready;
            return readyRegistration.active?.state || '';
        })).toBe('activated');

        const registration = await page.evaluate(async () => {
            const readyRegistration = await navigator.serviceWorker.ready;
            return {
                origin: location.origin,
                scope: readyRegistration.scope,
                activeScript: readyRegistration.active?.scriptURL || '',
                state: readyRegistration.active?.state || '',
            };
        });
        expect(registration).toMatchObject({
            scope: `${registration.origin}/`,
            state: 'activated',
        });
        expect(registration.activeScript).toContain('/service-worker.js');
        await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller?.scriptURL.includes('/service-worker.js')))).toBe(true);

        await page.reload({ waitUntil: 'load' });
        await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller?.scriptURL.includes('/service-worker.js')))).toBe(true);

        const shellCache = await page.evaluate(async ({ cacheName, shellPaths }) => {
            const cacheNames = await caches.keys();
            const cache = await caches.open(cacheName);
            const cachedShell = Object.fromEntries(await Promise.all(shellPaths.map(async shellPath => [
                shellPath,
                Boolean(await cache.match(shellPath)),
            ])));
            return { cacheNames, cachedShell };
        }, { cacheName: SHELL_CACHE_NAME, shellPaths: PWA_SHELL_PATHS });
        expect(shellCache.cacheNames).toContain(SHELL_CACHE_NAME);
        expect(shellCache.cachedShell).toEqual({
            '/': true,
            '/login.html': true,
            '/manifest.json': true,
            '/style.css': true,
            '/scripts/pwa.js': true,
            '/scripts/extensions/marketplace-wallet/manifest.json': true,
            '/scripts/extensions/marketplace-wallet/window.html': true,
            [`/scripts/extensions/marketplace-wallet/index.js?v=${MARKETPLACE_WALLET_EXTENSION_VERSION}`]: true,
            [`/scripts/extensions/marketplace-wallet/filters.js?v=${MARKETPLACE_WALLET_EXTENSION_VERSION}`]: true,
            [`/scripts/extensions/marketplace-wallet/style.css?v=${MARKETPLACE_WALLET_EXTENSION_VERSION}`]: true,
        });

        const staleShellText = 'STALE_LOGIN_SHELL_SHOULD_NOT_RENDER';
        await page.evaluate(async ({ cacheName, staleShellText }) => {
            const cache = await caches.open(cacheName);
            await cache.put('/login.html', new Response(`<!doctype html><body>${staleShellText}</body>`, {
                headers: { 'Content-Type': 'text/html' },
            }));
        }, { cacheName: SHELL_CACHE_NAME, staleShellText });

        await page.goto('/login.html', { waitUntil: 'load' });
        await expect(page.locator('body')).not.toContainText(staleShellText);

        await page.context().setOffline(true);
        try {
            await page.goto('/?pwa-offline-query=1', { waitUntil: 'domcontentloaded' });
            await expect(page.locator('#preloader')).toBeAttached();
            await expect(page).toHaveTitle(/SillyTavern/);
        } finally {
            await page.context().setOffline(false);
        }

        const health = await page.evaluate(async () => {
            const response = await fetch('/api/health', { cache: 'no-store' });
            return {
                status: response.status,
                body: await response.json(),
            };
        });
        expect(health).toMatchObject({
            status: 200,
            body: {
                ok: true,
                status: 'ok',
            },
        });

        const apiCached = await page.evaluate(async () => Boolean(await caches.match('/api/health')));
        expect(apiCached).toBe(false);
    });
});

test.describe('marketplace wallet extension', () => {
    test('renders admin review queue and posts approve/grant actions', async ({ page }) => {
        const apiCalls = await mockMarketplaceApis(page);

        await loadSillyTavern(page);

        const admin = page.locator('#marketplace_wallet_admin');
        await expect(admin).toBeVisible();
        await expect(page.locator('#marketplace_wallet_total')).toHaveText('175');
        await expect(page.locator('[data-marketplace-wallet-bucket="bonus"]')).toHaveText('100');
        await expect(page.locator('[data-marketplace-wallet-bucket="paid"]')).toHaveText('50');
        await expect(page.locator('[data-marketplace-wallet-bucket="earnings"]')).toHaveText('25');

        await expect(page.locator('#marketplace_wallet_review_queue')).toContainText('Submitted Character');
        await expect(page.locator('#marketplace_wallet_review_queue')).toContainText('by creator-handle');
        await expect(page.locator('#marketplace_wallet_review_queue')).toContainText('25 coins');
        await expect(page.locator('#marketplace_wallet_review_queue')).toContainText('updated 2026-06-26');
        await expect(page.locator('#marketplace_wallet_review_queue')).toContainText('tags: review, avatar, scenario');
        await expect(page.locator('#marketplace_wallet_review_queue')).toContainText('Awaiting review.');
        await expect(page.locator('#marketplace_wallet_review_queue [data-marketplace-wallet-action="approve"]')).toHaveCount(1);
        await expect(page.locator('#marketplace_wallet_assets [data-marketplace-wallet-action="approve"]')).toHaveCount(0);

        await page.locator('#marketplace_wallet_review_queue [data-marketplace-wallet-action="approve"]').click();
        await expect.poll(() => apiCalls.approve).toEqual(['submitted-character']);
        await expect(page.locator('#marketplace_wallet_review_queue')).toContainText('No assets awaiting review.');

        await page.locator('#marketplace_wallet_grant_handle').fill('target-user');
        await page.locator('#marketplace_wallet_grant_amount').fill('42');
        await page.locator('#marketplace_wallet_grant_bucket').selectOption('paid');
        await page.locator('#marketplace_wallet_grant_reason').fill('');
        await page.locator('#marketplace_wallet_grant_submit').click();

        await expect.poll(() => apiCalls.grants).toEqual([{
            targetHandle: 'target-user',
            amount: 42,
            bucket: 'paid',
            reason: 'Admin grant',
        }]);
    });

    test('keeps overlong rejection reasons local without truncating submissions', async ({ page }) => {
        const apiCalls = await mockMarketplaceApis(page);

        await loadSillyTavern(page);

        const reviewQueue = page.locator('#marketplace_wallet_review_queue');
        await expect(reviewQueue).toContainText('Submitted Character');
        await reviewQueue.locator('[data-marketplace-wallet-action="reject"]').click();

        const reasonPopup = page.getByRole('dialog').filter({ hasText: 'Reason for rejection:' });
        await expect(reasonPopup).toBeVisible();
        await reasonPopup.locator('.popup-input').fill('r'.repeat(1001));
        await reasonPopup.locator('.popup-button-ok').click();

        await expect.poll(() => apiCalls.rejects).toEqual([]);
        await expect(reviewQueue).toContainText('Submitted Character');
    });

    test('rejects a submitted asset from the review queue', async ({ page }) => {
        const submittedAsset = makeSubmittedAsset({
            id: 'rejectable-world',
            type: 'world_book',
            title: 'Rejectable Creator World',
            summary: 'Needs moderation before listing.',
            creator_id: 'default-user',
            owned: true,
            price_type: 'free',
            price_coins: 0,
            updated_at: '2026-06-26T14:00:00.000Z',
        });
        const apiCalls = await mockMarketplaceApis(page, {
            assets: [submittedAsset],
        });

        await loadSillyTavern(page);

        const reviewQueue = page.locator('#marketplace_wallet_review_queue');
        const creatorList = page.locator('#marketplace_wallet_creator_assets_list');
        await expect(reviewQueue).toContainText('Rejectable Creator World');
        await expect(page.locator('#marketplace_wallet_creator_submitted')).toHaveText('1');
        await expect(page.locator('#marketplace_wallet_creator_rejected')).toHaveText('0');

        await reviewQueue
            .locator('.marketplace-wallet-review-item', { hasText: 'Rejectable Creator World' })
            .locator('[data-marketplace-wallet-action="reject"]')
            .click();

        const reasonPopup = page.getByRole('dialog').filter({ hasText: 'Reason for rejection:' });
        await expect(reasonPopup).toBeVisible();
        await reasonPopup.locator('.popup-input').fill('Needs clearer lore safety tags');
        await reasonPopup.locator('.popup-button-ok').click();

        await expect.poll(() => apiCalls.rejects).toEqual([{
            assetId: 'rejectable-world',
            payload: {
                reason: 'Needs clearer lore safety tags',
            },
        }]);
        await expect(reviewQueue).toContainText('No assets awaiting review.');
        await expect(creatorList).toContainText('Rejectable Creator World');
        await expect(creatorList).toContainText('rejected: Needs clearer lore safety tags');
        await expect(page.locator('#marketplace_wallet_creator_submitted')).toHaveText('0');
        await expect(page.locator('#marketplace_wallet_creator_rejected')).toHaveText('1');
    });

    test('delists a listed asset from the marketplace', async ({ page }) => {
        const listedAsset = makeListedAsset({
            id: 'delist-browser-world',
            title: 'Delist Browser World',
            summary: 'Visible until an admin delists it.',
            price_type: 'free',
            price_coins: 0,
        });
        const apiCalls = await mockMarketplaceApis(page, {
            assets: [listedAsset],
        });

        await loadSillyTavern(page);

        const assetCard = page.locator('#marketplace_wallet_assets .marketplace-wallet-asset', { hasText: 'Delist Browser World' });
        await expect(assetCard).toBeVisible();
        await expect(assetCard.locator('[data-marketplace-wallet-status="listed"]')).toHaveCount(1);
        await expect(assetCard.locator('[data-marketplace-wallet-action="delist"]')).toHaveCount(1);

        await assetCard.locator('[data-marketplace-wallet-action="delist"]').click();

        const confirmPopup = page.getByRole('dialog').filter({ hasText: 'Delist this marketplace asset?' });
        await expect(confirmPopup).toBeVisible();
        await confirmPopup.locator('.popup-button-ok').click();

        await expect.poll(() => apiCalls.delists).toEqual(['delist-browser-world']);
        await expect(assetCard).toContainText('delisted');
        await expect(assetCard.locator('[data-marketplace-wallet-status="delisted"]')).toHaveCount(1);
        await expect(assetCard.locator('[data-marketplace-wallet-action="delist"]')).toHaveCount(0);
        await expect(page.locator('#marketplace_wallet_review_queue')).toContainText('No assets awaiting review.');
    });

    test('resolves reports from the admin report queue with a reviewer note', async ({ page }) => {
        const apiCalls = await mockMarketplaceApis(page, {
            assets: [makeListedAsset()],
            reports: [makeOpenReport()],
        });

        await loadSillyTavern(page);

        const reportQueue = page.locator('#marketplace_wallet_report_queue');
        await expect(reportQueue).toContainText('Listed World');
        await expect(reportQueue).toContainText('unsafe_prompt');
        await expect(reportQueue).toContainText('reported 2026-06-26');

        await reportQueue.locator('[data-marketplace-wallet-report-action="resolve"]').click();

        const notePopup = page.getByRole('dialog').filter({ hasText: 'Resolution note (optional):' });
        await expect(notePopup).toBeVisible();
        await notePopup.locator('.popup-input').fill('Reviewed and cleared by moderation.');
        await notePopup.locator('.popup-button-ok').click();

        await expect.poll(() => apiCalls.resolveReports).toEqual([{
            reportId: 'report-listed-world',
            payload: {
                note: 'Reviewed and cleared by moderation.',
            },
        }]);
        await expect(reportQueue).toContainText('No reports queued.');
    });

    test('submits a report with reviewer details into the admin queue', async ({ page }) => {
        const apiCalls = await mockMarketplaceApis(page, {
            assets: [makeListedAsset()],
            reports: [],
        });

        await loadSillyTavern(page);

        const assetRow = page.locator('#marketplace_wallet_assets article', { hasText: 'Listed World' });
        await assetRow.locator('[data-marketplace-wallet-action="report"]').click();

        const reasonPopup = page.getByRole('dialog').filter({ hasText: 'Report reason:' });
        await expect(reasonPopup).toBeVisible();
        await reasonPopup.locator('.popup-input').fill('unsafe_prompt');
        await reasonPopup.locator('.popup-button-ok').click();

        const detailsPopup = page.getByRole('dialog').filter({ hasText: 'Add report details (optional):' });
        await expect(detailsPopup).toBeVisible();
        await detailsPopup.locator('.popup-input').fill('Contains a jailbreak style lore instruction.');
        await detailsPopup.locator('.popup-button-ok').click();

        await expect.poll(() => apiCalls.reports).toEqual([{
            assetId: 'listed-world',
            payload: {
                reason: 'unsafe_prompt',
                body: 'Contains a jailbreak style lore instruction.',
            },
        }]);

        const reportQueue = page.locator('#marketplace_wallet_report_queue');
        await expect(reportQueue).toContainText('Listed World');
        await expect(reportQueue).toContainText('unsafe_prompt');
        await expect(reportQueue).toContainText('reported 2026-06-26');
        await expect(reportQueue).toContainText('Contains a jailbreak style lore instruction.');
    });

    test('keeps empty report reasons local to the first dialog', async ({ page }) => {
        const apiCalls = await mockMarketplaceApis(page, {
            assets: [makeListedAsset()],
            reports: [],
        });

        await loadSillyTavern(page);

        const assetRow = page.locator('#marketplace_wallet_assets article', { hasText: 'Listed World' });
        await assetRow.locator('[data-marketplace-wallet-action="report"]').click();

        const reasonPopup = page.getByRole('dialog').filter({ hasText: 'Report reason:' });
        await expect(reasonPopup).toBeVisible();
        await reasonPopup.locator('.popup-input').fill('   ');
        await reasonPopup.locator('.popup-button-ok').click();

        await expect(page.getByRole('dialog').filter({ hasText: 'Add report details (optional):' })).toHaveCount(0);
        await expect.poll(() => apiCalls.reports).toEqual([]);
    });

    test('keeps overlong report text local without truncating submissions', async ({ page }) => {
        const apiCalls = await mockMarketplaceApis(page, {
            assets: [makeListedAsset()],
            reports: [],
        });

        await loadSillyTavern(page);

        const assetRow = page.locator('#marketplace_wallet_assets article', { hasText: 'Listed World' });
        await assetRow.locator('[data-marketplace-wallet-action="report"]').click();

        let reasonPopup = page.getByRole('dialog').filter({ hasText: 'Report reason:' });
        await expect(reasonPopup).toBeVisible();
        await reasonPopup.locator('.popup-input').fill('r'.repeat(121));
        await reasonPopup.locator('.popup-button-ok').click();

        await expect(page.getByRole('dialog').filter({ hasText: 'Add report details (optional):' })).toHaveCount(0);
        await expect.poll(() => apiCalls.reports).toEqual([]);

        await assetRow.locator('[data-marketplace-wallet-action="report"]').click();
        reasonPopup = page.getByRole('dialog').filter({ hasText: 'Report reason:' });
        await expect(reasonPopup).toBeVisible();
        await reasonPopup.locator('.popup-input').fill('unsafe_prompt');
        await reasonPopup.locator('.popup-button-ok').click();

        const detailsPopup = page.getByRole('dialog').filter({ hasText: 'Add report details (optional):' });
        await expect(detailsPopup).toBeVisible();
        await detailsPopup.locator('.popup-input').fill('d'.repeat(2001));
        await detailsPopup.locator('.popup-button-ok').click();

        await expect.poll(() => apiCalls.reports).toEqual([]);
    });

    test('shows asset detail metadata in the Details popup', async ({ page }) => {
        const detailAsset = makeListedAsset({
            id: 'details-world',
            title: 'Details World',
            summary: 'Metadata-rich world book.',
            description: 'A long creator description with\nmultiple lines and <strong>plain text only</strong>.',
            language: 'ja',
            content_rating: 'teen',
            created_at: '2026-06-24T09:00:00.000Z',
            listed_at: '2026-06-25T10:00:00.000Z',
            delisted_at: '2026-06-26T09:30:00.000Z',
            updated_at: '2026-06-26T11:00:00.000Z',
        });
        const apiCalls = await mockMarketplaceApis(page, {
            assets: [detailAsset],
        });

        await loadSillyTavern(page);

        const assetRow = page.locator('#marketplace_wallet_assets article', { hasText: 'Details World' });
        await assetRow.locator('[data-marketplace-wallet-action="details"]').click();

        await expect.poll(() => apiCalls.details).toEqual(['details-world']);
        const detailsPopup = page.getByRole('dialog').filter({ hasText: 'Details World' });
        await expect(detailsPopup).toBeVisible();
        await expect(detailsPopup.locator('.marketplace-wallet-preview-description')).toContainText('A long creator description with');
        await expect(detailsPopup.locator('.marketplace-wallet-preview-description')).toContainText('<strong>plain text only</strong>');
        await expect(detailsPopup.locator('.marketplace-wallet-preview-description strong')).toHaveCount(0);
        await expect(detailsPopup.locator('.marketplace-wallet-preview-meta')).toContainText('Language');
        await expect(detailsPopup.locator('.marketplace-wallet-preview-meta')).toContainText('ja');
        await expect(detailsPopup.locator('.marketplace-wallet-preview-meta')).toContainText('Content rating');
        await expect(detailsPopup.locator('.marketplace-wallet-preview-meta')).toContainText('teen');
        await expect(detailsPopup.locator('.marketplace-wallet-preview-meta')).toContainText('Created');
        await expect(detailsPopup.locator('.marketplace-wallet-preview-meta')).toContainText('2026-06-24');
        await expect(detailsPopup.locator('.marketplace-wallet-preview-meta')).toContainText('Listed');
        await expect(detailsPopup.locator('.marketplace-wallet-preview-meta')).toContainText('2026-06-25');
        await expect(detailsPopup.locator('.marketplace-wallet-preview-meta')).toContainText('Delisted');
        await expect(detailsPopup.locator('.marketplace-wallet-preview-meta')).toContainText('2026-06-26');
        await expect(detailsPopup.locator('.marketplace-wallet-preview-meta')).toContainText('Updated');
        await expect(detailsPopup.locator('.marketplace-wallet-preview-meta')).toContainText('2026-06-26');
        await expect(detailsPopup.locator('.marketplace-wallet-preview-meta')).toContainText('Entitlement');
        await expect(detailsPopup.locator('.marketplace-wallet-preview-meta')).toContainText('not in library');
        await expect(detailsPopup.locator('.marketplace-wallet-preview-meta')).toContainText('Entitled on');
        await expect(detailsPopup.locator('.marketplace-wallet-preview-meta')).toContainText('not entitled');
        await detailsPopup.locator('.popup-button-ok').click();
    });

    test('truncates large payloads in the Details popup', async ({ page }) => {
        const detailAsset = makeListedAsset({
            id: 'large-payload-world',
            title: 'Large Payload World',
            summary: 'A world book with a very large payload.',
            normalized_payload: {
                name: 'Large Payload World',
                entries: {
                    lore: {
                        key: ['giant'],
                        content: `${'A'.repeat(24000)}TAIL_SENTINEL`,
                    },
                },
            },
        });
        const apiCalls = await mockMarketplaceApis(page, {
            assets: [detailAsset],
        });

        await loadSillyTavern(page);

        const assetRow = page.locator('#marketplace_wallet_assets article', { hasText: 'Large Payload World' });
        await assetRow.locator('[data-marketplace-wallet-action="details"]').click();

        await expect.poll(() => apiCalls.details).toEqual(['large-payload-world']);
        const detailsPopup = page.getByRole('dialog').filter({ hasText: 'Large Payload World' });
        await expect(detailsPopup).toBeVisible();
        await expect(detailsPopup.locator('.marketplace-wallet-preview-note')).toContainText('Large payload preview truncated for performance.');
        await expect(detailsPopup.locator('.marketplace-wallet-preview-payload')).toContainText('truncated');
        await expect(detailsPopup.locator('.marketplace-wallet-preview-payload')).not.toContainText('TAIL_SENTINEL');
        await detailsPopup.locator('.popup-button-ok').click();
    });

    test('keeps the Details popup usable on mobile width', async ({ page }) => {
        await page.setViewportSize({ width: 360, height: 740 });
        const longToken = 'A'.repeat(160);
        const detailAsset = makeListedAsset({
            id: 'mobile-details-world',
            title: `Mobile Details World ${longToken}`,
            summary: `A mobile detail summary with a long unbroken token ${longToken}.`,
            description: `A mobile detail description with line breaks.\n${longToken}\n${longToken}`,
            language: `mobile-language-${longToken}`,
            content_rating: `mobile-rating-${longToken}`,
            tags: ['mobile', longToken],
            normalized_payload: {
                name: 'Mobile Details World',
                entries: {
                    lore: {
                        key: ['mobile'],
                        content: longToken,
                    },
                },
            },
        });
        const apiCalls = await mockMarketplaceApis(page, {
            assets: [detailAsset],
        });

        await loadSillyTavern(page);

        const assetRow = page.locator('#marketplace_wallet_assets article', { hasText: 'Mobile Details World' });
        await assetRow.locator('[data-marketplace-wallet-action="details"]').click();

        await expect.poll(() => apiCalls.details).toEqual(['mobile-details-world']);
        const detailsPopup = page.getByRole('dialog').filter({ hasText: 'Mobile Details World' });
        await expect(detailsPopup).toBeVisible();
        await expect(detailsPopup.locator('.marketplace-wallet-preview-meta')).toContainText('Content rating');
        await expect(detailsPopup.locator('.marketplace-wallet-preview-description')).toContainText('A mobile detail description');
        await expect(detailsPopup.locator('.marketplace-wallet-preview-description')).toContainText(longToken);
        await expect(detailsPopup.locator('.marketplace-wallet-preview-payload')).toContainText(longToken);

        const layout = await detailsPopup.evaluate(dialog => {
            const viewportWidth = document.documentElement.clientWidth;
            const viewportHeight = document.documentElement.clientHeight;
            const rect = dialog.getBoundingClientRect();
            const meta = dialog.querySelector('.marketplace-wallet-preview-meta');
            const description = dialog.querySelector('.marketplace-wallet-preview-description');
            const payload = dialog.querySelector('.marketplace-wallet-preview-payload');
            const closeButton = dialog.querySelector('.popup-button-ok');
            const horizontalElements = [meta, description, payload].filter(Boolean);
            const horizontallyOverflowing = horizontalElements
                .filter(element => {
                    const elementRect = element.getBoundingClientRect();
                    return elementRect.width > 0
                        && (elementRect.left < -1 || elementRect.right > viewportWidth + 1);
                })
                .map(element => ({
                    tag: element.tagName,
                    className: String(element.className),
                }));
            const popupContent = dialog.querySelector('.popup-content');
            const closeRect = closeButton.getBoundingClientRect();

            return {
                dialogLeft: rect.left,
                dialogRight: rect.right,
                dialogTop: rect.top,
                dialogBottom: rect.bottom,
                closeLeft: closeRect.left,
                closeRight: closeRect.right,
                closeTop: closeRect.top,
                closeBottom: closeRect.bottom,
                viewportWidth,
                viewportHeight,
                metaColumns: getComputedStyle(meta).gridTemplateColumns.split(' ').length,
                contentOverflowY: getComputedStyle(popupContent).overflowY,
                payloadOverflowX: getComputedStyle(payload).overflowX,
                closeVisible: Boolean(closeButton?.checkVisibility?.() ?? closeButton),
                horizontallyOverflowing,
            };
        });

        expect(layout.dialogLeft).toBeGreaterThanOrEqual(0);
        expect(layout.dialogRight).toBeLessThanOrEqual(layout.viewportWidth);
        expect(layout.dialogTop).toBeGreaterThanOrEqual(0);
        expect(layout.dialogBottom).toBeLessThanOrEqual(layout.viewportHeight);
        expect(layout.closeLeft).toBeGreaterThanOrEqual(0);
        expect(layout.closeRight).toBeLessThanOrEqual(layout.viewportWidth);
        expect(layout.closeTop).toBeGreaterThanOrEqual(0);
        expect(layout.closeBottom).toBeLessThanOrEqual(layout.viewportHeight);
        expect(layout.metaColumns).toBe(1);
        expect(layout.contentOverflowY).toMatch(/auto|scroll/);
        expect(layout.payloadOverflowX).toMatch(/auto|scroll/);
        expect(layout.closeVisible).toBe(true);
        expect(layout.horizontallyOverflowing).toEqual([]);

        await detailsPopup.locator('.popup-button-ok').click();
        await expect(detailsPopup).toBeHidden();
    });

    test('claims and installs a free asset into the library', async ({ page }) => {
        const freeAsset = makeListedAsset({
            id: 'free-world',
            title: 'Free World',
            price_type: 'free',
            price_coins: 0,
            sales_count: 0,
        });
        const apiCalls = await mockMarketplaceApis(page, {
            assets: [freeAsset],
        });

        await loadSillyTavern(page);

        const assetRow = page.locator('#marketplace_wallet_assets article', { hasText: 'Free World' });
        await expect(assetRow).toContainText('Free');
        await assetRow.locator('[data-marketplace-wallet-action="purchase"]').click();

        await expect.poll(() => apiCalls.purchases).toEqual(['free-world']);
        await expect.poll(() => apiCalls.installs).toEqual(['free-world']);

        const library = page.locator('#marketplace_wallet_library_items');
        await expect(library).toContainText('Free World');
        await expect(library).toContainText('Claimed');
        await expect(library).toContainText('added 2026-06-26');
        await expect(library).toContainText('1 installs');
        await expect(library).toContainText('Last installed 2026-06-26 to worlds/free-world.json');

        const libraryRow = library.locator('.marketplace-wallet-library-item', { hasText: 'Free World' });
        await expect(libraryRow.locator('[data-marketplace-wallet-action="details"]')).toHaveCount(1);
        await libraryRow.locator('[data-marketplace-wallet-action="details"]').click();

        await expect.poll(() => apiCalls.details).toEqual(['free-world']);
        const detailsPopup = page.getByRole('dialog').filter({ hasText: 'Free World' });
        await expect(detailsPopup).toBeVisible();
        await expect(detailsPopup.locator('.marketplace-wallet-preview-meta')).toContainText('Language');
        await expect(detailsPopup.locator('.marketplace-wallet-preview-meta')).toContainText('Entitlement');
        await expect(detailsPopup.locator('.marketplace-wallet-preview-meta')).toContainText('free');
        await expect(detailsPopup.locator('.marketplace-wallet-preview-meta')).toContainText('Entitled on');
        await expect(detailsPopup.locator('.marketplace-wallet-preview-meta')).toContainText('2026-06-26');
        await expect(detailsPopup.locator('.marketplace-wallet-preview-meta')).toContainText('Purchase ref');
        await expect(detailsPopup.locator('.marketplace-wallet-preview-meta')).toContainText('none');
        await detailsPopup.locator('.popup-button-ok').click();
    });

    test('clears active marketplace filters after an empty result', async ({ page }) => {
        await mockMarketplaceApis(page, {
            assets: [
                makeListedAsset({
                    id: 'filter-world',
                    title: 'Filter World',
                    price_type: 'free',
                    price_coins: 0,
                }),
            ],
        });

        await loadSillyTavern(page);

        const assets = page.locator('#marketplace_wallet_assets');
        const clearFilters = page.locator('#marketplace_wallet_clear_filters');
        await expect(assets).toContainText('Filter World');
        await expect(clearFilters).toBeHidden();

        await page.locator('#marketplace_wallet_price_filter').selectOption('free');
        await expect(assets).toContainText('Filter World');
        await expect(clearFilters).toBeVisible();

        await clearFilters.click();
        await expect(page.locator('#marketplace_wallet_price_filter')).toHaveValue('');
        await expect(assets).toContainText('Filter World');
        await expect(clearFilters).toBeHidden();

        await page.locator('#marketplace_wallet_search').fill('missing asset');
        await expect(assets).toContainText('No marketplace assets found.');
        await expect(clearFilters).toBeVisible();

        await clearFilters.click();
        await expect(page.locator('#marketplace_wallet_search')).toHaveValue('');
        await expect(page.locator('#marketplace_wallet_type_filter')).toHaveValue('');
        await expect(page.locator('#marketplace_wallet_price_filter')).toHaveValue('');
        await expect(page.locator('#marketplace_wallet_access_filter')).toHaveValue('');
        await expect(page.locator('#marketplace_wallet_sort')).toHaveValue('recent');
        await expect(assets).toContainText('Filter World');
        await expect(clearFilters).toBeHidden();
    });

    test('shows a retryable marketplace error when the asset list fails to load', async ({ page }) => {
        await mockMarketplaceApis(page, {
            assets: [
                makeListedAsset({
                    id: 'recoverable-world',
                    title: 'Recoverable World',
                    price_type: 'free',
                    price_coins: 0,
                }),
            ],
            failAssetListOnce: true,
        });

        await openMarketplaceWallet(page, { expectLoaded: false });

        const assets = page.locator('#marketplace_wallet_assets');
        await expect(assets).toContainText('Marketplace could not be loaded.');
        await expect(assets).toContainText('Market temporarily unavailable');
        await expect(assets).not.toContainText('Loading marketplace...');

        const refreshButton = page.locator('#marketplace_wallet_refresh');
        await expect(refreshButton).toBeEnabled();

        await assets.locator('[data-marketplace-wallet-retry="marketplace"]').click();
        await expect(assets).toContainText('Recoverable World');
        await expect(assets).not.toContainText('Marketplace could not be loaded.');
        await expect(page.locator('#marketplace_wallet_total')).toHaveText('175');
    });

    test('shows retryable side-panel errors instead of empty states', async ({ page }) => {
        const creatorAsset = makeListedAsset({
            id: 'creator-retry-world',
            title: 'Creator Retry World',
            creator_id: 'default-user',
            owned: true,
            sales_count: 2,
            install_count: 1,
        });
        const libraryAsset = makeListedAsset({
            id: 'library-retry-world',
            title: 'Library Retry World',
            entitled: true,
        });
        await mockMarketplaceApis(page, {
            assets: [creatorAsset, libraryAsset],
            library: [makeLibraryItem(libraryAsset)],
            reports: [makeOpenReport({ id: 'report-retry-world', asset_id: libraryAsset.id })],
            failCreatorOnce: true,
            failLedgerOnce: true,
            failLibraryOnce: true,
            failReportsOnce: true,
        });

        await openMarketplaceWallet(page);

        const creator = page.locator('#marketplace_wallet_creator_assets_list');
        const ledger = page.locator('#marketplace_wallet_ledger_items');
        const library = page.locator('#marketplace_wallet_library_items');
        const reports = page.locator('#marketplace_wallet_report_queue');

        await expect(creator).toContainText('Creator Center could not be loaded.');
        await expect(creator).toContainText('Creator summary temporarily unavailable');
        await expect(creator).not.toContainText('No creator assets yet.');
        await creator.locator('[data-marketplace-wallet-retry="creator"]').click();
        await expect(creator).toContainText('Creator Retry World');
        await expect(creator).not.toContainText('Creator Center could not be loaded.');

        await expect(ledger).toContainText('Wallet activity could not be loaded.');
        await expect(ledger).toContainText('Wallet ledger temporarily unavailable');
        await expect(ledger).not.toContainText('No wallet activity yet.');
        await ledger.locator('[data-marketplace-wallet-retry="ledger"]').click();
        await expect(ledger).toContainText('No wallet activity yet.');
        await expect(ledger).not.toContainText('Wallet activity could not be loaded.');

        await expect(library).toContainText('Library could not be loaded.');
        await expect(library).toContainText('Library temporarily unavailable');
        await expect(library).not.toContainText('No library assets yet.');
        await library.locator('[data-marketplace-wallet-retry="library"]').click();
        await expect(library).toContainText('Library Retry World');
        await expect(library).not.toContainText('Library could not be loaded.');

        await expect(reports).toContainText('Report Queue could not be loaded.');
        await expect(reports).toContainText('Reports temporarily unavailable');
        await expect(reports).not.toContainText('No reports queued.');
        await reports.locator('[data-marketplace-wallet-retry="reports"]').click();
        await expect(reports).toContainText('unsafe_prompt');
        await expect(reports).not.toContainText('Report Queue could not be loaded.');
    });

    test('buys a fixed-price asset, refreshes wallet activity, and installs it', async ({ page }) => {
        const paidAsset = makeListedAsset({
            id: 'paid-world',
            title: 'Paid World',
            price_type: 'fixed_price',
            price_coins: 125,
            sales_count: 0,
        });
        const apiCalls = await mockMarketplaceApis(page, {
            assets: [paidAsset],
        });

        await loadSillyTavern(page);

        const assetRow = page.locator('#marketplace_wallet_assets article', { hasText: 'Paid World' });
        await expect(assetRow).toContainText('125 coins');
        await assetRow.locator('[data-marketplace-wallet-action="purchase"]').click();

        await expect.poll(() => apiCalls.purchases).toEqual(['paid-world']);
        await expect.poll(() => apiCalls.installs).toEqual(['paid-world']);

        await expect(page.locator('#marketplace_wallet_total')).toHaveText('50');
        await expect(page.locator('[data-marketplace-wallet-bucket="bonus"]')).toHaveText('0');
        await expect(page.locator('[data-marketplace-wallet-bucket="paid"]')).toHaveText('25');
        await expect(page.locator('[data-marketplace-wallet-bucket="earnings"]')).toHaveText('25');

        const walletActivity = page.locator('#marketplace_wallet_ledger_items');
        await expect(walletActivity).toContainText('Purchase');
        await expect(walletActivity).toContainText('-100');
        await expect(walletActivity).toContainText('-25');

        const library = page.locator('#marketplace_wallet_library_items');
        await expect(library).toContainText('Paid World');
        await expect(library).toContainText('Purchased');
        await expect(library).toContainText('1 installs');
    });

    test('keeps a purchased asset in the library when automatic install fails', async ({ page }) => {
        const paidAsset = makeListedAsset({
            id: 'paid-install-fails-world',
            title: 'Paid Install Fails World',
            price_type: 'fixed_price',
            price_coins: 125,
            sales_count: 0,
        });
        const apiCalls = await mockMarketplaceApis(page, {
            assets: [paidAsset],
            failInstallOnceFor: 'paid-install-fails-world',
        });

        await loadSillyTavern(page);

        const assetRow = page.locator('#marketplace_wallet_assets article', { hasText: 'Paid Install Fails World' });
        await assetRow.locator('[data-marketplace-wallet-action="purchase"]').click();

        await expect.poll(() => apiCalls.purchases).toEqual(['paid-install-fails-world']);
        await expect.poll(() => apiCalls.installs).toEqual(['paid-install-fails-world']);
        await expect(page.locator('#marketplace_wallet_total')).toHaveText('50');

        const walletActivity = page.locator('#marketplace_wallet_ledger_items');
        await expect(walletActivity).toContainText('Purchase');
        await expect(walletActivity).toContainText('-100');
        await expect(walletActivity).toContainText('-25');

        const library = page.locator('#marketplace_wallet_library_items');
        await expect(library).toContainText('Paid Install Fails World');
        await expect(library).toContainText('Purchased');
        await expect(library).toContainText('not installed');

        const libraryRow = library.locator('.marketplace-wallet-library-item', { hasText: 'Paid Install Fails World' });
        await libraryRow.locator('[data-marketplace-wallet-action="install"]').click();

        await expect.poll(() => apiCalls.installs).toEqual(['paid-install-fails-world', 'paid-install-fails-world']);
        await expect(library).toContainText('1 installs');
        await expect(library).toContainText('Last installed 2026-06-26 to worlds/paid-install-fails-world.json');
    });

    test('shows busy state while reinstalling a library asset', async ({ page }) => {
        const libraryAsset = makeListedAsset({
            id: 'library-busy-world',
            title: 'Library Busy World',
        });
        const apiCalls = await mockMarketplaceApis(page, {
            assets: [libraryAsset],
            library: [makeLibraryItem(libraryAsset)],
            holdNextInstallFor: 'library-busy-world',
        });

        await loadSillyTavern(page);

        const library = page.locator('#marketplace_wallet_library_items');
        const libraryRow = library.locator('.marketplace-wallet-library-item', { hasText: 'Library Busy World' });
        const installButton = libraryRow.locator('[data-marketplace-wallet-action="install"]');

        await expect(installButton).toHaveText(/Install/);
        await installButton.click();

        await expect.poll(() => apiCalls.installs).toEqual(['library-busy-world']);
        await expect(installButton).toBeDisabled();
        await expect(installButton).toHaveText(/Installing/);

        await apiCalls.resolveHeldInstall();

        await expect(library).toContainText('1 installs');
        await expect(library).toContainText('Last installed 2026-06-26 to worlds/library-busy-world.json');
    });

    test('shows the missing spendable balance for unaffordable fixed-price assets', async ({ page }) => {
        const costlyAsset = makeListedAsset({
            id: 'costly-world',
            title: 'Costly World',
            price_type: 'fixed_price',
            price_coins: 300,
        });
        const apiCalls = await mockMarketplaceApis(page, {
            assets: [costlyAsset],
        });

        await loadSillyTavern(page);

        const assetRow = page.locator('#marketplace_wallet_assets article', { hasText: 'Costly World' });
        const purchaseButton = assetRow.locator('[data-marketplace-wallet-action="purchase"]');
        await expect(assetRow).toContainText('300 coins');
        await expect(purchaseButton).toBeDisabled();
        await expect(assetRow.locator('.marketplace-wallet-affordability')).toHaveText('Need 150 more bonus or paid coins');

        const describedBy = await purchaseButton.getAttribute('aria-describedby');
        expect(describedBy).toBeTruthy();
        await expect(assetRow.locator(`#${describedBy}`)).toHaveText('Need 150 more bonus or paid coins');

        await purchaseButton.click({ force: true });
        expect(apiCalls.purchases).toEqual([]);
    });

    test('submits a world book upload into the review queue and creator center', async ({ page }) => {
        const apiCalls = await mockMarketplaceApis(page, {
            assets: [],
        });

        await loadSillyTavern(page);

        await page.locator('#marketplace_wallet_upload_type').selectOption('world_book');
        await page.locator('#marketplace_wallet_upload_file').setInputFiles({
            name: 'browser-character.json',
            mimeType: 'application/json',
            buffer: Buffer.from(JSON.stringify({
                name: 'Browser Character',
                description: 'A character card used to verify type detection.',
                personality: 'Helpful',
                scenario: 'A cozy tavern',
                first_mes: 'Hello.',
                mes_example: '<START>',
            }, null, 2)),
        });
        await expect(page.locator('#marketplace_wallet_upload_type')).toHaveValue('character_card');
        await expect(page.locator('#marketplace_wallet_upload_title')).toHaveValue('Browser Character');
        await page.locator('#marketplace_wallet_upload_title').fill('');

        const worldBookPayload = {
            name: 'Creator Browser World',
            entries: {
                '0': {
                    uid: 0,
                    key: ['browser-e2e'],
                    content: 'This lore entry came from the browser upload flow.',
                },
            },
        };

        await page.locator('#marketplace_wallet_upload_type').selectOption('character_card');
        await page.locator('#marketplace_wallet_upload_payload').fill(JSON.stringify(worldBookPayload, null, 2));
        await page.locator('#marketplace_wallet_upload_payload').blur();
        await expect(page.locator('#marketplace_wallet_upload_type')).toHaveValue('world_book');
        await expect(page.locator('#marketplace_wallet_upload_title')).toHaveValue('Creator Browser World');

        await page.locator('#marketplace_wallet_upload_title').fill('Manual Title Stays');
        await page.locator('#marketplace_wallet_upload_type').selectOption('world_book');
        await page.locator('#marketplace_wallet_upload_payload').fill(JSON.stringify({
            name: 'Pasted Browser Character',
            description: 'A pasted character card used to verify type detection.',
            personality: 'Curious',
            scenario: 'A compact tavern',
            first_mes: 'Hi.',
            mes_example: '<START>',
        }, null, 2));
        await page.locator('#marketplace_wallet_upload_payload').blur();
        await expect(page.locator('#marketplace_wallet_upload_type')).toHaveValue('character_card');
        await expect(page.locator('#marketplace_wallet_upload_title')).toHaveValue('Manual Title Stays');
        await page.locator('#marketplace_wallet_upload_title').fill('');

        await page.locator('#marketplace_wallet_upload_type').selectOption('character_card');
        await page.locator('#marketplace_wallet_upload_file').setInputFiles({
            name: 'creator-browser-world.json',
            mimeType: 'application/json',
            buffer: Buffer.from(JSON.stringify(worldBookPayload, null, 2)),
        });
        await expect(page.locator('#marketplace_wallet_upload_type')).toHaveValue('world_book');
        await expect(page.locator('#marketplace_wallet_upload_title')).toHaveValue('Creator Browser World');
        await page.locator('#marketplace_wallet_upload_summary').fill('Submitted from the browser E2E flow.');
        await page.locator('#marketplace_wallet_upload_description').fill('A longer creator-facing description for browser upload.');
        await page.locator('#marketplace_wallet_upload_tags').fill('browser, lore, browser');
        await page.locator('#marketplace_wallet_upload_language').fill('ja');
        await page.locator('#marketplace_wallet_upload_content_rating').fill('teen');
        await page.locator('#marketplace_wallet_upload_price_type').selectOption('free');
        await page.locator('[data-marketplace-wallet-upload="review"]').click();

        await expect.poll(() => apiCalls.creates).toHaveLength(1);
        expect(apiCalls.creates[0]).toMatchObject({
            type: 'world_book',
            title: 'Creator Browser World',
            summary: 'Submitted from the browser E2E flow.',
            description: 'A longer creator-facing description for browser upload.',
            tags: ['browser', 'lore'],
            language: 'ja',
            content_rating: 'teen',
            price_type: 'free',
            price_coins: 0,
            normalized_payload: {
                name: 'Creator Browser World',
            },
        });
        await expect.poll(() => apiCalls.submits).toEqual(['created-1']);

        const reviewQueue = page.locator('#marketplace_wallet_review_queue');
        await expect(reviewQueue).toContainText('Creator Browser World');
        await expect(reviewQueue.locator('[data-marketplace-wallet-action="approve"]')).toHaveCount(1);

        const createdAssetRow = page.locator('#marketplace_wallet_assets article', { hasText: 'Creator Browser World' });
        await expect(createdAssetRow.locator('.marketplace-wallet-tag')).toContainText(['browser', 'lore']);

        await expect(page.locator('#marketplace_wallet_creator_assets')).toHaveText('1');
        await expect(page.locator('#marketplace_wallet_creator_drafts')).toHaveText('0');
        await expect(page.locator('#marketplace_wallet_creator_submitted')).toHaveText('1');
        await expect(page.locator('#marketplace_wallet_creator_listed')).toHaveText('0');
        await expect(page.locator('#marketplace_wallet_creator_rejected')).toHaveText('0');
        await expect(page.locator('#marketplace_wallet_creator_assets_list')).toContainText('Creator Browser World');
        await expect(page.locator('#marketplace_wallet_creator_assets_list')).toContainText('submitted');
        await expect(page.locator('#marketplace_wallet_creator_assets_list')).toContainText('submitted 2026-06-26');
        await expect(page.locator('#marketplace_wallet_creator_paid_sales')).toHaveText('0');
        await expect(page.locator('#marketplace_wallet_creator_installs')).toHaveText('0');
        await expect(page.locator('#marketplace_wallet_creator_earnings_balance')).toHaveText('25');
        await expect(page.locator('#marketplace_wallet_upload_title')).toHaveValue('');
        await expect(page.locator('#marketplace_wallet_upload_tags')).toHaveValue('');
        await expect(page.locator('#marketplace_wallet_upload_language')).toHaveValue('en');
        await expect(page.locator('#marketplace_wallet_upload_content_rating')).toHaveValue('general');
        await expect(page.locator('#marketplace_wallet_upload_payload')).toHaveValue('');
    });

    test('keeps a saved draft when submit after upload fails', async ({ page }) => {
        const apiCalls = await mockMarketplaceApis(page, {
            assets: [],
            failSubmitOnceFor: 'created-1',
        });

        await loadSillyTavern(page);

        await page.locator('#marketplace_wallet_upload_type').selectOption('world_book');
        await page.locator('#marketplace_wallet_upload_title').fill('Submit Retry World');
        await page.locator('#marketplace_wallet_upload_summary').fill('Saved even if review submit is temporarily down.');
        await page.locator('#marketplace_wallet_upload_payload').fill(JSON.stringify({
            name: 'Submit Retry World',
            entries: {
                retry: {
                    key: ['retry'],
                    content: 'This lore entry should remain in a saved draft.',
                },
            },
        }, null, 2));
        await page.locator('[data-marketplace-wallet-upload="review"]').click();

        await expect.poll(() => apiCalls.creates).toHaveLength(1);
        await expect.poll(() => apiCalls.submits).toEqual(['created-1']);
        const draftRow = page.locator('#marketplace_wallet_assets article', { hasText: 'Submit Retry World' });
        await expect(draftRow).toContainText('draft');
        await expect(draftRow.locator('[data-marketplace-wallet-action="submit"]')).toHaveCount(1);
        const creatorDraftRow = page.locator('#marketplace_wallet_creator_assets_list .marketplace-wallet-creator-asset', { hasText: 'Submit Retry World' });
        await expect(creatorDraftRow).toContainText('draft');
        await expect(creatorDraftRow.locator('[data-marketplace-wallet-action="submit"]')).toHaveCount(1);
        await expect(page.locator('#marketplace_wallet_creator_drafts')).toHaveText('1');
        await expect(page.locator('#marketplace_wallet_creator_submitted')).toHaveText('0');
        await expect(page.locator('#marketplace_wallet_upload_title')).toHaveValue('');
        await expect(page.locator('#marketplace_wallet_upload_payload')).toHaveValue('');

        await creatorDraftRow.locator('[data-marketplace-wallet-action="submit"]').click();
        await expect.poll(() => apiCalls.submits).toEqual(['created-1', 'created-1']);
        await expect(draftRow).toContainText('submitted');
        await expect(creatorDraftRow).toContainText('submitted');
        await expect(page.locator('#marketplace_wallet_creator_drafts')).toHaveText('0');
        await expect(page.locator('#marketplace_wallet_creator_submitted')).toHaveText('1');
        expect(apiCalls.creates).toHaveLength(1);
    });

    test('blocks oversized upload payloads before creating an asset', async ({ page }) => {
        const apiCalls = await mockMarketplaceApis(page, {
            assets: [],
        });

        await loadSillyTavern(page);

        const oversizedPayload = {
            name: 'Oversized Browser World',
            entries: {
                giant: {
                    key: ['giant'],
                    content: 'A'.repeat(1024 * 1024),
                },
            },
        };

        await page.locator('#marketplace_wallet_upload_type').selectOption('world_book');
        await page.locator('#marketplace_wallet_upload_title').fill('Oversized Browser World');
        await page.locator('#marketplace_wallet_upload_payload').fill(JSON.stringify(oversizedPayload));
        await page.locator('[data-marketplace-wallet-upload="draft"]').click();

        await expect(page.locator('#marketplace_wallet_upload_payload')).toHaveValue(/Oversized Browser World/);
        expect(apiCalls.creates).toEqual([]);
        await expect(page.locator('#marketplace_wallet_assets')).toContainText('No marketplace assets found.');
    });

    test('blocks overlong upload text fields before creating an asset', async ({ page }) => {
        const apiCalls = await mockMarketplaceApis(page, {
            assets: [],
        });

        await loadSillyTavern(page);

        await page.locator('#marketplace_wallet_upload_type').selectOption('world_book');
        await page.locator('#marketplace_wallet_upload_title').evaluate((input, value) => {
            input.value = value;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }, 'T'.repeat(121));
        await page.locator('#marketplace_wallet_upload_summary').fill('Summary within the supported limit.');
        await page.locator('#marketplace_wallet_upload_payload').fill(JSON.stringify({
            name: 'Text Limit World',
            entries: {
                limit: {
                    key: ['limit'],
                    content: 'Text limit smoke entry.',
                },
            },
        }));
        await page.locator('[data-marketplace-wallet-upload="draft"]').click();

        await expect(page.locator('#marketplace_wallet_upload_title')).toHaveValue('T'.repeat(121));
        expect(apiCalls.creates).toEqual([]);
        await expect(page.locator('#marketplace_wallet_assets')).toContainText('No marketplace assets found.');
    });

    test('keeps the upload form usable on mobile width with long content', async ({ page }) => {
        await page.setViewportSize({ width: 360, height: 740 });
        const longToken = 'UploadMobileToken'.repeat(12);
        await mockMarketplaceApis(page, {
            assets: [],
        });

        await loadSillyTavern(page);

        await page.locator('#marketplace_wallet_upload_title').fill(`Mobile Upload ${longToken}`);
        await page.locator('#marketplace_wallet_upload_summary').fill(`Summary ${longToken}`);
        await page.locator('#marketplace_wallet_upload_description').fill(`Description line one\n${longToken}\n${longToken}`);
        await page.locator('#marketplace_wallet_upload_tags').fill(`${longToken}, mobile, ${longToken}`);
        await page.locator('#marketplace_wallet_upload_payload').fill(JSON.stringify({
            name: `Mobile Upload ${longToken}`,
            entries: {
                long_mobile_entry: {
                    key: [longToken],
                    content: `Payload ${longToken} ${longToken}`,
                    enabled: true,
                },
            },
        }, null, 2));

        const layout = await page.locator('#marketplace_wallet_ui').evaluate(element => {
            const upload = element.querySelector('.marketplace-wallet-upload');
            const uploadGrid = element.querySelector('.marketplace-wallet-upload-grid');
            const title = element.querySelector('#marketplace_wallet_upload_title');
            const tags = element.querySelector('#marketplace_wallet_upload_tags');
            const payload = element.querySelector('#marketplace_wallet_upload_payload');
            const actions = element.querySelector('.marketplace-wallet-upload-actions');
            const actionButtons = [...actions.querySelectorAll('.menu_button')];
            const viewportWidth = document.documentElement.clientWidth;
            const rect = node => node.getBoundingClientRect();
            const overflowing = [...upload.querySelectorAll('*')]
                .filter(child => {
                    const childRect = child.getBoundingClientRect();
                    return childRect.width > 0 && (childRect.left < -1 || childRect.right > viewportWidth + 1);
                })
                .map(child => ({
                    tag: child.tagName,
                    id: child.id,
                    className: String(child.className),
                }));

            return {
                uploadWithinViewport: rect(upload).left >= -1 && rect(upload).right <= viewportWidth + 1,
                gridColumns: getComputedStyle(uploadGrid).gridTemplateColumns.split(' ').filter(Boolean).length,
                titleWithinUpload: rect(title).left >= rect(upload).left - 1 && rect(title).right <= rect(upload).right + 1,
                tagsWithinUpload: rect(tags).left >= rect(upload).left - 1 && rect(tags).right <= rect(upload).right + 1,
                payloadWithinUpload: rect(payload).left >= rect(upload).left - 1 && rect(payload).right <= rect(upload).right + 1,
                payloadOverflowX: getComputedStyle(payload).overflowX,
                actionsWithinUpload: rect(actions).left >= rect(upload).left - 1 && rect(actions).right <= rect(upload).right + 1,
                actionButtonsWithinUpload: actionButtons.every(button => {
                    const buttonRect = rect(button);
                    return buttonRect.left >= rect(upload).left - 1 && buttonRect.right <= rect(upload).right + 1;
                }),
                overflowing,
            };
        });

        expect(layout).toMatchObject({
            uploadWithinViewport: true,
            gridColumns: 1,
            titleWithinUpload: true,
            tagsWithinUpload: true,
            payloadWithinUpload: true,
            payloadOverflowX: 'auto',
            actionsWithinUpload: true,
            actionButtonsWithinUpload: true,
            overflowing: [],
        });
    });

    test('revises a rejected creator asset and resubmits it for review', async ({ page }) => {
        const rejectedAsset = makeSubmittedAsset({
            id: 'rejected-world',
            type: 'world_book',
            title: 'Rejected Browser World',
            summary: 'Needs a cleaner lore entry.',
            description: 'Old rejected long description.',
            language: 'fr',
            content_rating: 'mature',
            creator_id: 'default-user',
            status: 'rejected',
            owned: true,
            price_type: 'free',
            price_coins: 0,
            submitted_at: '2026-06-25T10:00:00.000Z',
            rejection_reason: 'Needs a stronger summary',
            normalized_payload: {
                name: 'Rejected Browser World',
                entries: {
                    old: {
                        key: ['old'],
                        content: 'Old rejected lore entry.',
                    },
                },
            },
        });
        const approvedAsset = makeListedAsset({
            id: 'approved-creator-world',
            title: 'Approved Creator World',
            creator_id: 'default-user',
            owned: true,
            price_type: 'free',
            price_coins: 0,
            submitted_at: '2026-06-23T09:00:00.000Z',
            approved_at: '2026-06-24T09:00:00.000Z',
        });
        const apiCalls = await mockMarketplaceApis(page, {
            assets: [rejectedAsset, approvedAsset],
        });

        await loadSillyTavern(page);

        const assetRow = page.locator('#marketplace_wallet_assets article', { hasText: 'Rejected Browser World' });
        await expect(assetRow).toContainText('rejected');
        const creatorAssetList = page.locator('#marketplace_wallet_creator_assets_list');
        await expect(creatorAssetList).toContainText('submitted 2026-06-25');
        await expect(creatorAssetList).toContainText('rejected: Needs a stronger summary');
        await expect(creatorAssetList).toContainText('Approved Creator World');
        await expect(creatorAssetList).toContainText('submitted 2026-06-23 · approved 2026-06-24');
        const creatorRejectedRow = creatorAssetList.locator('.marketplace-wallet-creator-asset', { hasText: 'Rejected Browser World' });
        await expect(creatorRejectedRow.locator('[data-marketplace-wallet-action="revise"]')).toHaveCount(1);
        await creatorRejectedRow.locator('[data-marketplace-wallet-action="revise"]').click();

        await expect.poll(() => apiCalls.details).toEqual(['rejected-world']);
        await expect(page.locator('#marketplace_wallet_upload_status')).toBeVisible();
        await expect(page.locator('#marketplace_wallet_upload_mode')).toHaveText('Editing Rejected Browser World');
        await expect(page.locator('#marketplace_wallet_upload_title')).toHaveValue('Rejected Browser World');
        await expect(page.locator('#marketplace_wallet_upload_summary')).toHaveValue('Needs a cleaner lore entry.');
        await expect(page.locator('#marketplace_wallet_upload_description')).toHaveValue('Old rejected long description.');
        await expect(page.locator('#marketplace_wallet_upload_language')).toHaveValue('fr');
        await expect(page.locator('#marketplace_wallet_upload_content_rating')).toHaveValue('mature');
        await expect(page.locator('#marketplace_wallet_upload_payload')).toHaveValue(/Old rejected lore entry\./);

        await page.locator('#marketplace_wallet_upload_title').fill('Revised Browser World');
        await page.locator('#marketplace_wallet_upload_summary').fill('Ready for a second review.');
        await page.locator('#marketplace_wallet_upload_description').fill('Revised long description ready for approval.');
        await page.locator('#marketplace_wallet_upload_language').fill('de');
        await page.locator('#marketplace_wallet_upload_content_rating').fill('teen');
        await page.locator('#marketplace_wallet_upload_payload').fill(JSON.stringify({
            name: 'Revised Browser World',
            entries: {
                revised: {
                    key: ['revised'],
                    content: 'This lore entry was revised in the browser E2E flow.',
                },
            },
        }, null, 2));
        await page.locator('[data-marketplace-wallet-upload="review"]').click();

        await expect.poll(() => apiCalls.revisions).toHaveLength(1);
        expect(apiCalls.revisions[0]).toMatchObject({
            assetId: 'rejected-world',
            payload: {
                type: 'world_book',
                title: 'Revised Browser World',
                summary: 'Ready for a second review.',
                description: 'Revised long description ready for approval.',
                language: 'de',
                content_rating: 'teen',
                price_type: 'free',
                price_coins: 0,
                normalized_payload: {
                    name: 'Revised Browser World',
                },
            },
        });
        await expect.poll(() => apiCalls.submits).toEqual(['rejected-world']);

        const reviewQueue = page.locator('#marketplace_wallet_review_queue');
        await expect(reviewQueue).toContainText('Revised Browser World');
        await expect(reviewQueue.locator('[data-marketplace-wallet-action="approve"]')).toHaveCount(1);

        await expect(page.locator('#marketplace_wallet_creator_assets')).toHaveText('2');
        await expect(page.locator('#marketplace_wallet_creator_submitted')).toHaveText('1');
        await expect(page.locator('#marketplace_wallet_creator_listed')).toHaveText('1');
        await expect(page.locator('#marketplace_wallet_creator_rejected')).toHaveText('0');
        await expect(page.locator('#marketplace_wallet_creator_assets_list')).toContainText('Revised Browser World');
        await expect(page.locator('#marketplace_wallet_creator_assets_list')).toContainText('submitted');
        await expect(page.locator('#marketplace_wallet_upload_mode')).toHaveText('');
        await expect(page.locator('#marketplace_wallet_upload_title')).toHaveValue('');
        await expect(page.locator('#marketplace_wallet_upload_language')).toHaveValue('en');
        await expect(page.locator('#marketplace_wallet_upload_content_rating')).toHaveValue('general');
        await expect(page.locator('#marketplace_wallet_upload_payload')).toHaveValue('');
    });

    test('cancels a rejected asset revision before saving a new draft', async ({ page }) => {
        const rejectedAsset = makeSubmittedAsset({
            id: 'cancel-rejected-world',
            type: 'world_book',
            title: 'Cancel Rejected World',
            summary: 'Loaded into edit mode.',
            description: 'Draft cancel description.',
            creator_id: 'default-user',
            status: 'rejected',
            owned: true,
            price_type: 'free',
            price_coins: 0,
            rejection_reason: 'Needs cleanup',
            normalized_payload: {
                name: 'Cancel Rejected World',
                entries: {
                    old: {
                        key: ['old'],
                        content: 'Old lore entry.',
                    },
                },
            },
        });
        const apiCalls = await mockMarketplaceApis(page, {
            assets: [rejectedAsset],
        });

        await loadSillyTavern(page);

        const creatorAssetList = page.locator('#marketplace_wallet_creator_assets_list');
        await creatorAssetList
            .locator('.marketplace-wallet-creator-asset', { hasText: 'Cancel Rejected World' })
            .locator('[data-marketplace-wallet-action="revise"]')
            .click();

        await expect.poll(() => apiCalls.details).toEqual(['cancel-rejected-world']);
        await expect(page.locator('#marketplace_wallet_upload_status')).toBeVisible();
        await expect(page.locator('#marketplace_wallet_upload_mode')).toHaveText('Editing Cancel Rejected World');
        await expect(page.locator('[data-marketplace-wallet-upload="draft"]')).toContainText('Save Changes');
        await expect(page.locator('[data-marketplace-wallet-upload="review"]')).toContainText('Save & Submit');

        await page.locator('#marketplace_wallet_upload_cancel').click();

        await expect(page.locator('#marketplace_wallet_upload_status')).toBeHidden();
        await expect(page.locator('#marketplace_wallet_upload_mode')).toHaveText('');
        await expect(page.locator('[data-marketplace-wallet-upload="draft"]')).toContainText('Save Draft');
        await expect(page.locator('[data-marketplace-wallet-upload="review"]')).toContainText('Submit');
        await expect(page.locator('#marketplace_wallet_upload_title')).toHaveValue('');
        await expect(page.locator('#marketplace_wallet_upload_payload')).toHaveValue('');

        await page.locator('#marketplace_wallet_upload_type').selectOption('world_book');
        await page.locator('#marketplace_wallet_upload_title').fill('Fresh Draft After Cancel');
        await page.locator('#marketplace_wallet_upload_summary').fill('Created after canceling edit mode.');
        await page.locator('#marketplace_wallet_upload_payload').fill(JSON.stringify({
            name: 'Fresh Draft After Cancel',
            entries: {
                fresh: {
                    key: ['fresh'],
                    content: 'Fresh draft should be created with POST.',
                },
            },
        }, null, 2));
        await page.locator('[data-marketplace-wallet-upload="draft"]').click();

        await expect.poll(() => apiCalls.creates).toHaveLength(1);
        expect(apiCalls.creates[0]).toMatchObject({
            title: 'Fresh Draft After Cancel',
            summary: 'Created after canceling edit mode.',
            normalized_payload: {
                name: 'Fresh Draft After Cancel',
            },
        });
        expect(apiCalls.revisions).toEqual([]);
    });

    test('keeps review controls compact on mobile width', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await mockMarketplaceApis(page, {
            assets: [
                makeSubmittedAsset(),
                makeListedAsset({
                    id: 'mobile-costly-world',
                    title: 'Mobile Costly World',
                    price_type: 'fixed_price',
                    price_coins: 300,
                }),
            ],
            library: [
                makeLibraryItem(makeListedAsset({
                    id: 'mobile-library-world',
                    title: 'Mobile Library World',
                    price_type: 'free',
                    price_coins: 0,
                })),
            ],
        });

        await loadSillyTavern(page);

        const layout = await page.locator('#marketplace_wallet_ui').evaluate(element => {
            const adminGrid = element.querySelector('.marketplace-wallet-admin-grid');
            const grantGrid = element.querySelector('.marketplace-wallet-grant');
            const reviewItem = element.querySelector('.marketplace-wallet-review-item');
            const reviewActions = element.querySelector('.marketplace-wallet-review-actions');
            const libraryActions = element.querySelector('.marketplace-wallet-library-actions');
            const affordability = element.querySelector('.marketplace-wallet-affordability');
            const viewportWidth = document.documentElement.clientWidth;
            const overflowing = [...element.querySelectorAll('*')]
                .filter(child => {
                    const rect = child.getBoundingClientRect();
                    return rect.width > 0 && (rect.left < -1 || rect.right > viewportWidth + 1);
                })
                .map(child => ({
                    tag: child.tagName,
                    id: child.id,
                    className: String(child.className),
                }));

            return {
                adminColumns: getComputedStyle(adminGrid).gridTemplateColumns.split(' ').length,
                grantColumns: getComputedStyle(grantGrid).gridTemplateColumns.split(' ').length,
                reviewItemColumns: getComputedStyle(reviewItem).gridTemplateColumns.split(' ').length,
                reviewActionColumns: getComputedStyle(reviewActions).gridTemplateColumns.split(' ').length,
                libraryActionColumns: getComputedStyle(libraryActions).gridTemplateColumns.split(' ').length,
                affordabilityTextAlign: getComputedStyle(affordability).textAlign,
                overflowing,
            };
        });

        expect(layout).toMatchObject({
            adminColumns: 1,
            grantColumns: 1,
            reviewItemColumns: 1,
            reviewActionColumns: 2,
            libraryActionColumns: 2,
            affordabilityTextAlign: 'center',
            overflowing: [],
        });
    });

    test('keeps marketplace filters compact without mobile overflow', async ({ page }) => {
        await page.setViewportSize({ width: 360, height: 740 });
        await mockMarketplaceApis(page, {
            assets: [
                makeListedAsset({
                    id: 'mobile-filter-free-world',
                    title: 'Mobile Filter Free World',
                    price_type: 'free',
                    price_coins: 0,
                }),
                makeListedAsset({
                    id: 'mobile-filter-paid-world',
                    title: 'Mobile Filter Paid World',
                    price_type: 'fixed_price',
                    price_coins: 25,
                }),
            ],
        });

        await loadSillyTavern(page);
        await page.locator('#marketplace_wallet_price_filter').selectOption('free');
        await expect(page.locator('#marketplace_wallet_clear_filters')).toBeVisible();

        const layout = await page.locator('#marketplace_wallet_ui').evaluate(element => {
            const controls = element.querySelector('.marketplace-wallet-controls');
            const search = element.querySelector('#marketplace_wallet_search');
            const type = element.querySelector('#marketplace_wallet_type_filter');
            const price = element.querySelector('#marketplace_wallet_price_filter');
            const access = element.querySelector('#marketplace_wallet_access_filter');
            const sort = element.querySelector('#marketplace_wallet_sort');
            const clearFilters = element.querySelector('#marketplace_wallet_clear_filters');
            const assets = element.querySelector('#marketplace_wallet_assets');
            const viewportWidth = document.documentElement.clientWidth;
            const rect = node => node.getBoundingClientRect();
            const columns = getComputedStyle(controls).gridTemplateColumns.split(' ').filter(Boolean);
            const overflowing = [...element.querySelectorAll('*')]
                .filter(child => {
                    const childRect = child.getBoundingClientRect();
                    return childRect.width > 0 && (childRect.left < -1 || childRect.right > viewportWidth + 1);
                })
                .map(child => ({
                    tag: child.tagName,
                    id: child.id,
                    className: String(child.className),
                }));

            return {
                columns: columns.length,
                searchSpansFullWidth: rect(search).width > rect(type).width * 1.5,
                typeAndPriceSameRow: Math.abs(rect(type).top - rect(price).top) < 2,
                accessAndSortSameRow: Math.abs(rect(access).top - rect(sort).top) < 2,
                clearSpansFullWidth: rect(clearFilters).width > rect(type).width * 1.5,
                controlsHeight: rect(controls).height,
                assetsBelowControls: rect(assets).top >= rect(controls).bottom,
                overflowing,
            };
        });

        expect(layout).toMatchObject({
            columns: 2,
            searchSpansFullWidth: true,
            typeAndPriceSameRow: true,
            accessAndSortSameRow: true,
            clearSpansFullWidth: true,
            assetsBelowControls: true,
            overflowing: [],
        });
        expect(layout.controlsHeight).toBeLessThanOrEqual(170);
    });
});
