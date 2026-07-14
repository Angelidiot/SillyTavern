import { doNavbarIconClick, getRequestHeaders } from '../../../script.js';
import { renderExtensionTemplateAsync } from '../../extensions.js';
import { POPUP_TYPE, callGenericPopup } from '../../popup.js';
import { accountsEnabled, currentUser, getCurrentUserHandle, isAdmin } from '../../user.js';
import { getFileText, toggleDrawer } from '../../utils.js';
import { filterAndSortAssets } from './filters.js?v=0.2.36';

const MODULE_NAME = 'marketplace-wallet';
const LAUNCHER_ID = 'marketplace_wallet_launcher';
const USER_ACCESS_ACTIONS = new Set(['enable', 'disable', 'promote', 'demote']);
const MARKET_TYPES = {
    character_card: 'Character card',
    world_book: 'World book',
};
const MAX_UPLOAD_TITLE_LENGTH = 120;
const MAX_UPLOAD_SUMMARY_LENGTH = 500;
const MAX_UPLOAD_DESCRIPTION_LENGTH = 10000;
const MAX_UPLOAD_LANGUAGE_LENGTH = 16;
const MAX_UPLOAD_CONTENT_RATING_LENGTH = 40;
const MAX_UPLOAD_TAGS = 20;
const MAX_UPLOAD_TAG_LENGTH = 40;
const MAX_UPLOAD_PAYLOAD_BYTES = 1024 * 1024;
const MAX_REPORT_REASON_LENGTH = 120;
const MAX_REPORT_BODY_LENGTH = 2000;
const MAX_REPORT_RESOLUTION_NOTE_LENGTH = 1000;
const MAX_GRANT_REASON_LENGTH = 200;
const MAX_REJECT_REASON_LENGTH = 1000;
const MAX_PAYLOAD_PREVIEW_LENGTH = 20000;

const state = {
    assets: [],
    creator: null,
    editingAssetId: null,
    ledger: [],
    library: [],
    reports: [],
    users: [],
    wallet: null,
    loaded: false,
    loading: false,
    marketplaceError: '',
    creatorError: '',
    ledgerError: '',
    libraryError: '',
    reportsError: '',
    usersError: '',
    creatorLoading: false,
    ledgerLoading: false,
    libraryLoading: false,
    reportsLoading: false,
    usersLoading: false,
    granting: false,
    busyAssetIds: new Set(),
    busyReportIds: new Set(),
    busyUserHandles: new Set(),
};

function formatCoins(value) {
    return Number(value || 0).toLocaleString();
}

function formatSignedCoins(value) {
    const amount = Number(value || 0);
    const prefix = amount > 0 ? '+' : '';
    return `${prefix}${formatCoins(amount)}`;
}

function formatLedgerDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return date.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatAssetDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return date.toISOString().slice(0, 10);
}

function getLedgerTypeLabel(entry) {
    const labels = {
        admin_grant: 'Grant',
        market_purchase_debit: 'Purchase',
        market_creator_earning: 'Earning',
    };

    return labels[entry?.type] || String(entry?.type || 'Wallet');
}

function getSpendableBalance() {
    const buckets = state.wallet?.balance?.buckets ?? {};
    return Number(buckets.bonus || 0) + Number(buckets.paid || 0);
}

function getErrorMessage(error, fallback) {
    return error?.message || fallback;
}

function createPanelError(message, retryKey) {
    const $error = $('<div class="marketplace-wallet-empty marketplace-wallet-error"></div>');
    $error.append($('<span></span>').text(message));
    $error.append($('<button class="menu_button menu_button_icon" type="button"></button>')
        .attr('data-marketplace-wallet-retry', retryKey)
        .append($('<i class="fa-solid fa-rotate" aria-hidden="true"></i>'))
        .append($('<span></span>').text('Retry')));
    return $error;
}

async function fetchJson(url, options = {}) {
    const { omitContentType = false, ...fetchOptions } = options;
    const response = await fetch(url, {
        ...fetchOptions,
        headers: {
            ...getRequestHeaders({ omitContentType }),
            ...(fetchOptions.headers ?? {}),
        },
    });
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await response.json() : null;
    if (!response.ok) {
        const details = Array.isArray(data?.details) ? `: ${data.details.join('; ')}` : '';
        const message = data?.error ? `${data.error}${details}` : `${response.status} ${response.statusText}`;
        const error = new Error(message);
        error.status = response.status;
        error.data = data;
        throw error;
    }
    return data;
}

function setLoading(isLoading) {
    state.loading = isLoading;
    $('#marketplace_wallet_refresh').prop('disabled', isLoading);
    $('#marketplace_wallet_refresh i').toggleClass('fa-spin', isLoading);
}

function renderWallet() {
    const balance = state.wallet?.balance ?? { buckets: {}, total: 0 };
    $('#marketplace_wallet_total').text(formatCoins(balance.total));
    $('[data-marketplace-wallet-bucket="bonus"]').text(formatCoins(balance.buckets?.bonus));
    $('[data-marketplace-wallet-bucket="paid"]').text(formatCoins(balance.buckets?.paid));
    $('[data-marketplace-wallet-bucket="earnings"]').text(formatCoins(balance.buckets?.earnings));
}

function renderAccountAccess() {
    const role = !accountsEnabled ? 'Local admin' : currentUser?.admin ? 'Admin' : 'User';
    const accountMode = accountsEnabled ? 'Accounts enabled' : 'Single-user mode';
    const note = canUseAdminTools()
        ? 'Can review market assets, grant coins, and manage account permissions.'
        : 'Can browse, upload, buy, report, and manage library assets.';

    $('#marketplace_wallet_access_handle').text(getCurrentUserHandle());
    $('#marketplace_wallet_access_role').text(role);
    $('#marketplace_wallet_access_mode').text(accountMode);
    $('#marketplace_wallet_access_note').text(note);
}

function renderWalletLedger() {
    const $list = $('#marketplace_wallet_ledger_items');
    if (!$list.length) {
        return;
    }

    $list.empty();
    if (state.ledgerLoading) {
        $list.append($('<div class="marketplace-wallet-empty"></div>').text('Loading wallet activity...'));
        return;
    }

    if (state.ledgerError) {
        $list.append(createPanelError(`Wallet activity could not be loaded. ${state.ledgerError}`, 'ledger'));
        return;
    }

    if (state.ledger.length === 0) {
        $list.append($('<div class="marketplace-wallet-empty"></div>').text('No wallet activity yet.'));
        return;
    }

    const entries = state.ledger
        .slice()
        .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0) || String(b.id || '').localeCompare(String(a.id || '')))
        .slice(0, 6);

    for (const entry of entries) {
        const amount = Number(entry.amount || 0);
        const direction = amount > 0 ? 'positive' : amount < 0 ? 'negative' : 'zero';
        const $item = $('<div class="marketplace-wallet-ledger-item"></div>');
        const $main = $('<div class="marketplace-wallet-ledger-main"></div>');
        const reason = String(entry.reason || getLedgerTypeLabel(entry));
        const bucket = String(entry.bucket || 'wallet');
        const dateLabel = formatLedgerDate(entry.createdAt);

        $main.append($('<span></span>').text(reason));
        $main.append($('<small></small>').text([getLedgerTypeLabel(entry), bucket, dateLabel].filter(Boolean).join(' · ')));
        $item.append($main);
        $item.append($('<b class="marketplace-wallet-ledger-amount"></b>')
            .attr('data-marketplace-wallet-amount', direction)
            .text(formatSignedCoins(amount)));
        $list.append($item);
    }
}

function renderCreatorSummary() {
    const stats = state.creator?.stats ?? {};
    $('#marketplace_wallet_creator_assets').text(formatCoins(stats.total_assets));
    $('#marketplace_wallet_creator_drafts').text(formatCoins(stats.draft_assets));
    $('#marketplace_wallet_creator_submitted').text(formatCoins(stats.submitted_assets));
    $('#marketplace_wallet_creator_listed').text(formatCoins(stats.listed_assets));
    $('#marketplace_wallet_creator_rejected').text(formatCoins(stats.rejected_assets));
    $('#marketplace_wallet_creator_sales').text(formatCoins(stats.total_claims));
    $('#marketplace_wallet_creator_paid_sales').text(formatCoins(stats.paid_sales));
    $('#marketplace_wallet_creator_installs').text(formatCoins(stats.total_installs));
    $('#marketplace_wallet_creator_earnings').text(formatCoins(stats.gross_revenue_coins));
    $('#marketplace_wallet_creator_earnings_balance').text(formatCoins(stats.earnings_balance));

    const $list = $('#marketplace_wallet_creator_assets_list');
    if (!$list.length) {
        return;
    }

    $list.empty();
    if (state.creatorLoading) {
        $list.append($('<div class="marketplace-wallet-empty"></div>').text('Loading creator assets...'));
        return;
    }

    if (state.creatorError) {
        $list.append(createPanelError(`Creator Center could not be loaded. ${state.creatorError}`, 'creator'));
        return;
    }

    const assets = Array.isArray(state.creator?.assets) ? state.creator.assets.slice(0, 5) : [];
    if (assets.length === 0) {
        $list.append($('<div class="marketplace-wallet-empty"></div>').text('No creator assets yet.'));
        return;
    }

    for (const asset of assets) {
        const $item = $('<div class="marketplace-wallet-creator-asset"></div>');
        const $main = $('<div class="marketplace-wallet-creator-asset-main"></div>');
        const $title = $('<span></span>').text(asset.title || 'Untitled asset');
        const $meta = $('<small></small>').text(`${asset.status || 'draft'} · ${formatCoins(asset.sales_count)} claims · ${formatCoins(asset.install_count)} installs`);
        const submittedDate = formatAssetDate(asset.submitted_at);
        const approvedDate = formatAssetDate(asset.approved_at);
        const rejectionReason = String(asset.rejection_reason || '').trim();
        const auditMeta = [
            submittedDate ? `submitted ${submittedDate}` : '',
            approvedDate ? `approved ${approvedDate}` : '',
            rejectionReason ? `rejected: ${rejectionReason.slice(0, 120)}` : '',
        ].filter(Boolean).join(' · ');
        const $price = $('<b></b>').text(getPriceLabel(asset));
        const $side = $('<div class="marketplace-wallet-creator-side"></div>');

        $main.append($title, $meta);
        if (auditMeta) {
            $main.append($('<small class="marketplace-wallet-creator-audit"></small>').text(auditMeta));
        }
        $side.append($price, createAssetAction(asset));
        $item.append($main, $side);
        $list.append($item);
    }
}

function renderLibrary() {
    const $list = $('#marketplace_wallet_library_items');
    if (!$list.length) {
        return;
    }

    $list.empty();
    if (state.libraryLoading) {
        $list.append($('<div class="marketplace-wallet-empty"></div>').text('Loading library...'));
        return;
    }

    if (state.libraryError) {
        $list.append(createPanelError(`Library could not be loaded. ${state.libraryError}`, 'library'));
        return;
    }

    if (state.library.length === 0) {
        $list.append($('<div class="marketplace-wallet-empty"></div>').text('No library assets yet.'));
        return;
    }

    for (const item of state.library.slice(0, 6)) {
        const asset = item.asset || {};
        const isBusy = state.busyAssetIds.has(asset.id);
        const $row = $('<div class="marketplace-wallet-library-item"></div>');
        const $main = $('<div class="marketplace-wallet-library-main"></div>');
        const $actions = $('<div class="marketplace-wallet-library-actions"></div>');
        const $title = $('<span></span>').text(asset.title || 'Untitled asset');
        const source = item.entitlement?.source === 'purchase' ? 'Purchased' : 'Claimed';
        const installText = item.install_count ? `${formatCoins(item.install_count)} installs` : 'not installed';
        const entitlementDate = formatAssetDate(item.entitlement?.created_at);
        const lastInstallDate = formatAssetDate(item.last_install?.created_at);
        const lastInstallRef = String(item.last_install?.local_ref || '').trim();
        const lastInstallType = item.last_install?.type ? (MARKET_TYPES[item.last_install.type] || item.last_install.type) : '';
        const lastInstallLabel = lastInstallRef
            ? `Last installed ${lastInstallDate || 'recently'} to ${lastInstallRef}`
            : '';
        const $meta = $('<small></small>').text([
            source,
            MARKET_TYPES[asset.type] || asset.type || 'Asset',
            entitlementDate ? `added ${entitlementDate}` : '',
            installText,
        ].filter(Boolean).join(' · '));

        $main.append($title, $meta);
        if (lastInstallLabel) {
            $main.append($('<small class="marketplace-wallet-library-install"></small>').text([
                lastInstallLabel,
                lastInstallType,
            ].filter(Boolean).join(' · ')));
        }
        $actions.append(createAssetButton({
            asset,
            action: 'details',
            icon: 'fa-circle-info',
            label: isBusy ? 'Loading' : 'Details',
            disabled: isBusy || !asset.id,
        }));
        $actions.append(createAssetButton({
            asset,
            action: 'install',
            icon: 'fa-box-open',
            label: isBusy ? 'Installing' : 'Install',
            disabled: isBusy || !asset.id,
        }));
        $row.append($main, $actions);
        $list.append($row);
    }
}

function canUseAdminTools() {
    return isAdmin();
}

function renderAdminVisibility() {
    const $admin = $('#marketplace_wallet_admin');
    if (canUseAdminTools()) {
        $admin.removeAttr('hidden');
    } else {
        $admin.attr('hidden', '');
    }
    renderAccountAccess();
    renderUserManagement();
}

function getFilteredAssets() {
    return filterAndSortAssets(state.assets, {
        search: $('#marketplace_wallet_search').val(),
        type: $('#marketplace_wallet_type_filter').val(),
        priceType: $('#marketplace_wallet_price_filter').val(),
        access: $('#marketplace_wallet_access_filter').val(),
        sort: $('#marketplace_wallet_sort').val(),
    });
}

function hasActiveMarketplaceFilters() {
    return Boolean(String($('#marketplace_wallet_search').val() || '').trim()
        || $('#marketplace_wallet_type_filter').val()
        || $('#marketplace_wallet_price_filter').val()
        || $('#marketplace_wallet_access_filter').val()
        || String($('#marketplace_wallet_sort').val() || 'recent') !== 'recent');
}

function setClearFiltersVisibility(show) {
    const $button = $('#marketplace_wallet_clear_filters');
    $button.attr('hidden', show ? null : '');
    $button.toggle(show);
}

function clearMarketplaceFilters() {
    $('#marketplace_wallet_search').val('');
    $('#marketplace_wallet_type_filter').val('');
    $('#marketplace_wallet_price_filter').val('');
    $('#marketplace_wallet_access_filter').val('');
    $('#marketplace_wallet_sort').val('recent');
    renderAssets();
}

function getPriceLabel(asset) {
    if (asset.price_type === 'fixed_price') {
        return `${formatCoins(asset.price_coins)} coins`;
    }
    return 'Free';
}

function getAssetTags(asset) {
    return Array.isArray(asset?.tags)
        ? asset.tags.map(tag => String(tag || '').trim()).filter(Boolean)
        : [];
}

function createTagList(asset) {
    const tags = getAssetTags(asset).slice(0, MAX_UPLOAD_TAGS);
    if (tags.length === 0) {
        return null;
    }

    const $tags = $('<div class="marketplace-wallet-tags"></div>');
    for (const tag of tags) {
        $tags.append($('<span class="marketplace-wallet-tag"></span>').text(tag));
    }
    return $tags;
}

function createStatusBadge(asset) {
    const $badge = $('<span class="marketplace-wallet-badge"></span>');
    $badge.text(asset.status || 'draft');
    $badge.attr('data-marketplace-wallet-status', asset.status || 'draft');
    return $badge;
}

function formatPayloadPreview(payload) {
    const json = JSON.stringify(payload, null, 2);
    if (json.length <= MAX_PAYLOAD_PREVIEW_LENGTH) {
        return {
            text: json,
            truncated: false,
        };
    }

    return {
        text: `${json.slice(0, MAX_PAYLOAD_PREVIEW_LENGTH)}\n... truncated ${formatCoins(json.length - MAX_PAYLOAD_PREVIEW_LENGTH)} more characters`,
        truncated: true,
    };
}

function createAssetPreview(asset, entitlement = null) {
    const $preview = $('<div class="marketplace-wallet-asset-preview"></div>');
    const $title = $('<h3></h3>').text(asset.title || 'Untitled asset');
    const $summary = $('<p></p>').text(asset.summary || 'No summary provided.');
    const description = String(asset.description || '').trim();
    const $description = description
        ? $('<p class="marketplace-wallet-preview-description"></p>').text(description)
        : $();
    const $meta = $('<dl class="marketplace-wallet-preview-meta"></dl>');
    const hasPayload = asset.payload_available && asset.normalized_payload;
    const entitlementSource = entitlement?.source ? String(entitlement.source) : '';
    const entitlementDate = entitlement?.created_at ? formatAssetDate(entitlement.created_at) : '';
    const purchaseRef = entitlement?.purchase_id ? String(entitlement.purchase_id) : '';
    const rows = [
        ['Type', MARKET_TYPES[asset.type] || asset.type || 'Asset'],
        ['Status', asset.status || 'draft'],
        ['Creator', asset.creator_id || 'unknown'],
        ['Language', asset.language || 'unknown'],
        ['Content rating', asset.content_rating || 'unrated'],
        ['Price', getPriceLabel(asset)],
        ['Tags', getAssetTags(asset).length ? getAssetTags(asset).join(', ') : 'none'],
        ['Created', formatAssetDate(asset.created_at) || 'unknown'],
        ['Listed', formatAssetDate(asset.listed_at) || 'not listed'],
        ['Delisted', formatAssetDate(asset.delisted_at) || 'not delisted'],
        ['Updated', formatAssetDate(asset.updated_at) || 'unknown'],
        ['Entitlement', entitlementSource || 'not in library'],
        ['Entitled on', entitlementDate || 'not entitled'],
        ['Purchase ref', purchaseRef || 'none'],
        ['Payload', hasPayload ? 'available' : 'available after claim or purchase'],
    ];

    for (const [label, value] of rows) {
        $meta.append($('<dt></dt>').text(label));
        $meta.append($('<dd></dd>').text(String(value)));
    }

    $preview.append($title, $summary, $description, $meta);
    if (hasPayload) {
        const payloadPreview = formatPayloadPreview(asset.normalized_payload);
        $preview.append($('<b></b>').text('Payload'));
        if (payloadPreview.truncated) {
            $preview.append($('<small class="marketplace-wallet-preview-note"></small>').text('Large payload preview truncated for performance.'));
        }
        $preview.append($('<pre class="marketplace-wallet-preview-payload"></pre>').text(payloadPreview.text));
    }
    return $preview;
}

function createAssetButton({ asset, action, icon, label, disabled = false, title = '' }) {
    const $button = $('<button class="menu_button menu_button_icon" type="button"></button>');
    $button.attr('data-marketplace-wallet-action', action);
    $button.attr('data-asset-id', asset.id);
    $button.prop('disabled', disabled);
    if (title) {
        $button.attr('title', title);
    }
    $button.append(`<i class="fa-solid ${icon}" aria-hidden="true"></i>`);
    $button.append($('<span></span>').text(label));
    return $button;
}

function createAffordabilityHint(asset, missingCoins) {
    const hintId = `marketplace_wallet_afford_${asset.id}`;
    return $('<small class="marketplace-wallet-affordability"></small>')
        .attr('id', hintId)
        .text(`Need ${formatCoins(missingCoins)} more bonus or paid coins`);
}

function createReportButton({ report, action, icon, label, disabled = false }) {
    const $button = $('<button class="menu_button menu_button_icon" type="button"></button>');
    $button.attr('data-marketplace-wallet-report-action', action);
    $button.attr('data-report-id', report.id);
    $button.prop('disabled', disabled);
    $button.append(`<i class="fa-solid ${icon}" aria-hidden="true"></i>`);
    $button.append($('<span></span>').text(label));
    return $button;
}

function createAssetAction(asset) {
    const isBusy = state.busyAssetIds.has(asset.id);
    const $actions = $('<div class="marketplace-wallet-asset-actions"></div>');

    $actions.append(createAssetButton({
        asset,
        action: 'details',
        icon: 'fa-circle-info',
        label: isBusy ? 'Loading' : 'Details',
        disabled: isBusy,
    }));

    if (asset.owned && ['draft', 'rejected'].includes(asset.status)) {
        $actions.append(createAssetButton({
            asset,
            action: 'revise',
            icon: 'fa-pen-to-square',
            label: isBusy ? 'Loading' : 'Revise',
            disabled: isBusy,
        }));
    }

    if (asset.owned && asset.status === 'draft') {
        $actions.append(createAssetButton({
            asset,
            action: 'submit',
            icon: 'fa-paper-plane',
            label: isBusy ? 'Submitting' : 'Submit',
            disabled: isBusy,
        }));
    }

    if (canUseAdminTools() && asset.status === 'listed') {
        $actions.append(createAssetButton({
            asset,
            action: 'delist',
            icon: 'fa-eye-slash',
            label: isBusy ? 'Delisting' : 'Delist',
            disabled: isBusy,
        }));
    }

    if (!asset.owned && (asset.status === 'listed' || asset.entitled)) {
        $actions.append(createAssetButton({
            asset,
            action: 'report',
            icon: 'fa-flag',
            label: isBusy ? 'Reporting' : 'Report',
            disabled: isBusy,
        }));
    }

    if (asset.owned || asset.entitled) {
        $actions.append(createAssetButton({
            asset,
            action: 'install',
            icon: 'fa-box-open',
            label: isBusy ? 'Installing' : 'Install',
            disabled: isBusy,
        }));
        return $actions;
    }

    if (asset.status === 'listed') {
        const priceCoins = Number(asset.price_coins || 0);
        const missingCoins = Math.max(0, priceCoins - getSpendableBalance());
        const canAfford = asset.price_type !== 'fixed_price' || missingCoins === 0;
        const $purchaseButton = createAssetButton({
            asset,
            action: 'purchase',
            icon: 'fa-cart-shopping',
            label: isBusy ? 'Working' : asset.price_type === 'free' ? 'Get & Install' : 'Buy & Install',
            disabled: isBusy || !canAfford,
            title: canAfford ? '' : `Need ${formatCoins(missingCoins)} more bonus or paid coins`,
        });
        $actions.append($purchaseButton);
        if (!canAfford) {
            const $hint = createAffordabilityHint(asset, missingCoins);
            $purchaseButton.attr('aria-describedby', $hint.attr('id'));
            $actions.append($hint);
        }
    }

    return $actions;
}

function renderReviewQueue() {
    const $queue = $('#marketplace_wallet_review_queue');
    if (!canUseAdminTools() || !$queue.length) {
        return;
    }

    $queue.empty();
    const submitted = state.assets
        .filter(asset => asset.status === 'submitted')
        .sort((a, b) => String(a.updated_at || '').localeCompare(String(b.updated_at || '')));

    if (submitted.length === 0) {
        $queue.append($('<div class="marketplace-wallet-empty"></div>').text('No assets awaiting review.'));
        return;
    }

    for (const asset of submitted) {
        const $item = $('<div class="marketplace-wallet-review-item"></div>');
        const isBusy = state.busyAssetIds.has(asset.id);
        const $meta = $('<div class="marketplace-wallet-review-meta"></div>');
        const $title = $('<span></span>').text(asset.title || 'Untitled asset');
        const $type = $('<small></small>').text(MARKET_TYPES[asset.type] || asset.type || 'Asset');
        const tags = getAssetTags(asset).slice(0, 3);
        const updated = formatAssetDate(asset.updated_at);
        const summary = String(asset.summary || '').trim();
        const $details = $('<small></small>').text([
            asset.creator_id ? `by ${asset.creator_id}` : '',
            getPriceLabel(asset),
            updated ? `updated ${updated}` : '',
            tags.length ? `tags: ${tags.join(', ')}` : '',
        ].filter(Boolean).join(' · '));
        const $summary = summary
            ? $('<small class="marketplace-wallet-review-summary"></small>').text(summary.slice(0, 120))
            : null;
        const $actions = $('<div class="marketplace-wallet-review-actions"></div>');

        $meta.append($title, $type, $details);
        if ($summary) {
            $meta.append($summary);
        }
        $actions.append(createAssetButton({
            asset,
            action: 'inspect',
            icon: 'fa-magnifying-glass',
            label: isBusy ? 'Loading' : 'Inspect',
            disabled: isBusy,
        }));
        $actions.append(createAssetButton({
            asset,
            action: 'approve',
            icon: 'fa-circle-check',
            label: isBusy ? 'Approving' : 'Approve',
            disabled: isBusy,
        }));
        $actions.append(createAssetButton({
            asset,
            action: 'reject',
            icon: 'fa-circle-xmark',
            label: isBusy ? 'Rejecting' : 'Reject',
            disabled: isBusy,
        }));
        $item.append($meta, $actions);
        $queue.append($item);
    }
}

function renderUploadMode(asset = null) {
    const isEditing = Boolean(asset);
    state.editingAssetId = asset?.id ?? null;
    $('#marketplace_wallet_upload_status').attr('hidden', isEditing ? null : '');
    $('#marketplace_wallet_upload_mode').text(isEditing ? `Editing ${asset.title || 'market asset'}` : '');
    $('[data-marketplace-wallet-upload="draft"] span').text(isEditing ? 'Save Changes' : 'Save Draft');
    $('[data-marketplace-wallet-upload="review"] span').text(isEditing ? 'Save & Submit' : 'Submit');
}

function clearUploadForm() {
    $('#marketplace_wallet_upload_type').val('character_card');
    $('#marketplace_wallet_upload_title').val('');
    $('#marketplace_wallet_upload_summary').val('');
    $('#marketplace_wallet_upload_description').val('');
    $('#marketplace_wallet_upload_tags').val('');
    $('#marketplace_wallet_upload_language').val('en');
    $('#marketplace_wallet_upload_content_rating').val('general');
    $('#marketplace_wallet_upload_price_type').val('free').trigger('change');
    $('#marketplace_wallet_upload_price').val(0);
    $('#marketplace_wallet_upload_payload').val('');
    renderUploadMode();
}

function fillUploadForm(asset) {
    $('#marketplace_wallet_upload_type').val(asset.type || 'character_card');
    $('#marketplace_wallet_upload_title').val(asset.title || '');
    $('#marketplace_wallet_upload_summary').val(asset.summary || '');
    $('#marketplace_wallet_upload_description').val(asset.description || '');
    $('#marketplace_wallet_upload_tags').val(getAssetTags(asset).join(', '));
    $('#marketplace_wallet_upload_language').val(asset.language || 'en');
    $('#marketplace_wallet_upload_content_rating').val(asset.content_rating || 'general');
    $('#marketplace_wallet_upload_price_type').val(asset.price_type || 'free').trigger('change');
    $('#marketplace_wallet_upload_price').val(Number(asset.price_coins || 0));
    $('#marketplace_wallet_upload_payload').val(JSON.stringify(asset.normalized_payload ?? {}, null, 2));
    renderUploadMode(asset);
    $('.marketplace-wallet-upload')[0]?.scrollIntoView({ block: 'nearest' });
    $('#marketplace_wallet_upload_title').trigger('focus');
}

function renderReportQueue() {
    const $queue = $('#marketplace_wallet_report_queue');
    if (!canUseAdminTools() || !$queue.length) {
        return;
    }

    $queue.empty();
    if (state.reportsLoading) {
        $queue.append($('<div class="marketplace-wallet-empty"></div>').text('Loading reports...'));
        return;
    }

    if (state.reportsError) {
        $queue.append(createPanelError(`Report Queue could not be loaded. ${state.reportsError}`, 'reports'));
        return;
    }

    if (state.reports.length === 0) {
        $queue.append($('<div class="marketplace-wallet-empty"></div>').text('No reports queued.'));
        return;
    }

    for (const report of state.reports) {
        const $item = $('<div class="marketplace-wallet-review-item marketplace-wallet-report-item"></div>');
        const isBusy = state.busyReportIds.has(report.id);
        const $meta = $('<div class="marketplace-wallet-review-meta"></div>');
        const title = report.asset?.title || report.asset_id || 'Unknown asset';
        const type = MARKET_TYPES[report.asset?.type] || report.asset?.type || 'Asset';
        const created = formatAssetDate(report.created_at);
        const reason = report.reason ? `${report.reason} · by ${report.reporter_id}` : `Reported by ${report.reporter_id}`;
        const $actions = $('<div class="marketplace-wallet-review-actions"></div>');

        $meta.append($('<span></span>').text(title));
        $meta.append($('<small></small>').text([
            type,
            report.asset?.status || 'missing',
            created ? `reported ${created}` : '',
            reason,
        ].filter(Boolean).join(' · ')));
        if (report.body) {
            $meta.append($('<small></small>').text(String(report.body).slice(0, 180)));
        }
        $actions.append(createReportButton({
            report,
            action: 'resolve',
            icon: 'fa-circle-check',
            label: isBusy ? 'Resolving' : 'Resolve',
            disabled: isBusy,
        }));
        $item.append($meta, $actions);
        $queue.append($item);
    }
}

function createUserActionButton({ user, action, icon, label, disabled = false }) {
    const $button = $('<button class="menu_button menu_button_icon" type="button"></button>');
    $button.attr('data-marketplace-wallet-user-action', action);
    $button.attr('data-user-handle', user.handle);
    $button.prop('disabled', disabled);
    $button.append(`<i class="fa-solid ${icon}" aria-hidden="true"></i>`);
    $button.append($('<span></span>').text(label));
    return $button;
}

function renderUserManagement() {
    const $list = $('#marketplace_wallet_users');
    const $summary = $('#marketplace_wallet_users_summary');
    const $handleOptions = $('#marketplace_wallet_user_handle_options');
    if (!$list.length) {
        return;
    }

    $list.empty();
    $summary.empty();
    $handleOptions.empty();
    $('#marketplace_wallet_users_refresh').prop('disabled', state.usersLoading || !accountsEnabled);

    if (!canUseAdminTools()) {
        return;
    }

    if (!accountsEnabled) {
        $summary.append($('<span></span>').text('Local admin mode'));
        $list.append($('<div class="marketplace-wallet-empty"></div>').text('User accounts are disabled. default-user has local admin access.'));
        return;
    }

    if (state.usersLoading) {
        $summary.append($('<span></span>').text('Loading account directory...'));
        $list.append($('<div class="marketplace-wallet-empty"></div>').text('Loading users...'));
        return;
    }

    if (state.usersError) {
        $summary.append($('<span></span>').text('Account directory unavailable'));
        $list.append(createPanelError(`Users could not be loaded. ${state.usersError}`, 'users'));
        return;
    }

    if (state.users.length === 0) {
        $summary.append($('<span></span>').text('0 users'));
        $list.append($('<div class="marketplace-wallet-empty"></div>').text('No users found.'));
        return;
    }

    const userStats = state.users.reduce((stats, user) => {
        stats.total += 1;
        if (user.admin) {
            stats.admins += 1;
        }
        if (!user.enabled) {
            stats.disabled += 1;
        }
        if (!user.password) {
            stats.unprotected += 1;
        }
        return stats;
    }, { total: 0, admins: 0, disabled: 0, unprotected: 0 });
    const summaryItems = [
        `${formatCoins(userStats.total)} users`,
        `${formatCoins(userStats.admins)} admins`,
        `${formatCoins(userStats.disabled)} disabled`,
        `${formatCoins(userStats.unprotected)} without password`,
    ];
    for (const item of summaryItems) {
        $summary.append($('<span></span>').text(item));
    }

    for (const user of state.users) {
        const isBusy = state.busyUserHandles.has(user.handle);
        const isSelf = user.handle === getCurrentUserHandle();
        const $item = $('<div class="marketplace-wallet-user-item"></div>');
        const $meta = $('<div class="marketplace-wallet-user-main"></div>');
        const $title = $('<span></span>').text(user.name || user.handle || 'Unnamed user');
        const $details = $('<small></small>').text([
            user.handle ? `@${user.handle}` : '',
            user.admin ? 'Admin' : 'User',
            user.enabled ? 'enabled' : 'disabled',
            user.password ? 'password' : 'no password',
        ].filter(Boolean).join(' · '));
        const $actions = $('<div class="marketplace-wallet-user-actions"></div>');

        if (user.handle) {
            $handleOptions.append($('<option></option>').attr('value', user.handle));
        }
        $meta.append($title, $details);
        $actions.append(createUserActionButton({
            user,
            action: user.enabled ? 'disable' : 'enable',
            icon: user.enabled ? 'fa-ban' : 'fa-check',
            label: isBusy ? 'Saving' : user.enabled ? 'Disable' : 'Enable',
            disabled: isBusy || isSelf,
        }));
        $actions.append(createUserActionButton({
            user,
            action: user.admin ? 'demote' : 'promote',
            icon: user.admin ? 'fa-arrow-down' : 'fa-arrow-up',
            label: isBusy ? 'Saving' : user.admin ? 'Demote' : 'Promote',
            disabled: isBusy || isSelf,
        }));
        $item.append($meta, $actions);
        $list.append($item);
    }
}

function renderAssets() {
    const $list = $('#marketplace_wallet_assets');
    $list.empty();
    renderReviewQueue();
    renderReportQueue();

    if (state.loading && !state.loaded) {
        setClearFiltersVisibility(false);
        $list.append($('<div class="marketplace-wallet-empty"></div>').text('Loading marketplace...'));
        return;
    }

    if (state.marketplaceError) {
        setClearFiltersVisibility(false);
        const $error = $('<div class="marketplace-wallet-empty marketplace-wallet-error"></div>');
        $error.append($('<b></b>').text('Marketplace could not be loaded.'));
        $error.append($('<span></span>').text(state.marketplaceError));
        $error.append($('<button class="menu_button menu_button_icon" type="button"></button>')
            .attr('data-marketplace-wallet-retry', 'marketplace')
            .append($('<i class="fa-solid fa-rotate" aria-hidden="true"></i>'))
            .append($('<span></span>').text('Retry')));
        $list.append($error);
        return;
    }

    const assets = getFilteredAssets();
    const hasFilters = hasActiveMarketplaceFilters();
    setClearFiltersVisibility(hasFilters);
    if (assets.length === 0) {
        $list.append($('<div class="marketplace-wallet-empty"></div>').text('No marketplace assets found.'));
        return;
    }

    for (const asset of assets) {
        const $asset = $('<article class="marketplace-wallet-asset"></article>');
        const $main = $('<div class="marketplace-wallet-asset-main"></div>');
        const $titleRow = $('<div class="marketplace-wallet-asset-title-row"></div>');
        const $type = $('<span class="marketplace-wallet-type"></span>').text(MARKET_TYPES[asset.type] || asset.type || 'Asset');
        const $title = $('<h4></h4>').text(asset.title || 'Untitled asset');
        const $meta = $('<div class="marketplace-wallet-asset-meta"></div>');
        const $summary = $('<p></p>').text(asset.summary || '');

        $titleRow.append($type, $title, createStatusBadge(asset));
        $meta.append($('<span></span>').text(getPriceLabel(asset)));
        $meta.append($('<span></span>').text(`${formatCoins(asset.sales_count)} claims`));
        $meta.append($('<span></span>').text(`${formatCoins(asset.install_count)} installs`));
        if (asset.creator_id) {
            $meta.append($('<span></span>').text(`by ${asset.creator_id}`));
        }
        const $tags = createTagList(asset);
        $main.append($titleRow, $summary);
        if ($tags) {
            $main.append($tags);
        }
        $main.append($meta);
        $asset.append($main, createAssetAction(asset));
        $list.append($asset);
    }
}

async function loadReportQueue() {
    if (!canUseAdminTools()) {
        state.reports = [];
        state.reportsError = '';
        renderReportQueue();
        return;
    }

    state.reportsLoading = true;
    state.reportsError = '';
    renderReportQueue();
    try {
        const result = await fetchJson('/api/market/reports/admin');
        state.reports = Array.isArray(result.reports) ? result.reports : [];
    } catch (error) {
        state.reports = [];
        state.reportsError = getErrorMessage(error, 'Check your connection and try again.');
        console.warn('Report queue could not be loaded', error);
    } finally {
        state.reportsLoading = false;
        renderReportQueue();
    }
}

async function loadUsers() {
    if (!canUseAdminTools() || !accountsEnabled) {
        state.users = [];
        state.usersError = '';
        renderUserManagement();
        return;
    }

    state.usersLoading = true;
    state.usersError = '';
    renderUserManagement();
    try {
        const users = await fetchJson('/api/users/get', {
            method: 'POST',
            omitContentType: true,
        });
        state.users = Array.isArray(users) ? users : [];
    } catch (error) {
        state.users = [];
        state.usersError = getErrorMessage(error, 'Check your permissions and try again.');
        console.warn('Users could not be loaded', error);
    } finally {
        state.usersLoading = false;
        renderUserManagement();
    }
}

async function loadLibrary() {
    state.libraryLoading = true;
    state.libraryError = '';
    renderLibrary();
    try {
        const result = await fetchJson('/api/market/library');
        state.library = Array.isArray(result.items) ? result.items : [];
    } catch (error) {
        state.library = [];
        state.libraryError = getErrorMessage(error, 'Check your connection and try again.');
        console.warn('Library could not be loaded', error);
    } finally {
        state.libraryLoading = false;
        renderLibrary();
    }
}

async function loadCreatorSummary() {
    state.creatorLoading = true;
    state.creatorError = '';
    renderCreatorSummary();
    try {
        state.creator = await fetchJson('/api/market/creator/summary');
    } catch (error) {
        state.creator = null;
        state.creatorError = getErrorMessage(error, 'Check your connection and try again.');
        console.warn('Creator summary could not be loaded', error);
    } finally {
        state.creatorLoading = false;
        renderCreatorSummary();
    }
}

async function loadWalletLedger() {
    state.ledgerLoading = true;
    state.ledgerError = '';
    renderWalletLedger();
    try {
        const result = await fetchJson('/api/wallet/ledger');
        state.ledger = Array.isArray(result.ledger) ? result.ledger : [];
    } catch (error) {
        state.ledger = [];
        state.ledgerError = getErrorMessage(error, 'Check your connection and try again.');
        console.warn('Wallet ledger could not be loaded', error);
    } finally {
        state.ledgerLoading = false;
        renderWalletLedger();
    }
}

async function loadMarketplace({ silent = false } = {}) {
    if (state.loading) {
        return;
    }

    setLoading(true);
    renderAssets();
    try {
        const [wallet, market] = await Promise.all([
            fetchJson('/api/wallet'),
            fetchJson('/api/market/assets'),
        ]);
        state.wallet = wallet;
        state.assets = Array.isArray(market.assets) ? market.assets : [];
        state.marketplaceError = '';
        state.loaded = true;
        renderAdminVisibility();
        renderWallet();
        renderWalletLedger();
        renderAssets();
        void loadWalletLedger();
        void loadCreatorSummary();
        void loadLibrary();
        void loadReportQueue();
        void loadUsers();
        if (!silent) {
            toastr.success('Marketplace refreshed');
        }
    } catch (error) {
        console.error('Failed to load marketplace', error);
        state.marketplaceError = error.message || 'Check your connection and try again.';
        state.loaded = false;
        toastr.error(error.message || 'Marketplace could not be loaded');
    } finally {
        renderAdminVisibility();
        setLoading(false);
        renderAssets();
    }
}

function retryPanel(key) {
    switch (key) {
        case 'marketplace':
            void loadMarketplace();
            break;
        case 'ledger':
            void loadWalletLedger();
            break;
        case 'creator':
            void loadCreatorSummary();
            break;
        case 'library':
            void loadLibrary();
            break;
        case 'reports':
            void loadReportQueue();
            break;
        case 'users':
            void loadUsers();
            break;
    }
}

async function withBusyReport(reportId, callback) {
    state.busyReportIds.add(reportId);
    renderReportQueue();
    try {
        await callback();
    } finally {
        state.busyReportIds.delete(reportId);
        renderReportQueue();
    }
}

async function withBusyAsset(assetId, callback) {
    state.busyAssetIds.add(assetId);
    renderAssets();
    renderLibrary();
    try {
        await callback();
    } finally {
        state.busyAssetIds.delete(assetId);
        renderAssets();
        renderLibrary();
    }
}

async function requestInstall(assetId) {
    const result = await fetchJson(`/api/market/assets/${encodeURIComponent(assetId)}/install`, {
        method: 'POST',
    });
    const name = result.installed?.name || 'Market asset';
    toastr.success(`${name} installed`);
}

async function installAsset(assetId) {
    await withBusyAsset(assetId, async () => {
        await requestInstall(assetId);
        void loadLibrary();
    });
}

async function purchaseAsset(assetId) {
    await withBusyAsset(assetId, async () => {
        const result = await fetchJson(`/api/market/assets/${encodeURIComponent(assetId)}/purchase`, {
            method: 'POST',
        });
        toastr.success(result.already_owned ? 'Already in your library' : 'Added to your library');
        try {
            await requestInstall(assetId);
        } catch (error) {
            console.error('Automatic install after purchase failed', error);
            toastr.warning(error.message || 'Install failed; the asset remains in your library.');
        } finally {
            await Promise.all([
                loadMarketplace({ silent: true }),
                loadWalletLedger(),
                loadLibrary(),
            ]);
        }
    });
}

async function submitAsset(assetId) {
    await withBusyAsset(assetId, async () => {
        await fetchJson(`/api/market/assets/${encodeURIComponent(assetId)}/submit`, {
            method: 'POST',
        });
        toastr.success('Asset submitted for review');
        await loadMarketplace({ silent: true });
    });
}

async function approveAsset(assetId) {
    await withBusyAsset(assetId, async () => {
        await fetchJson(`/api/market/assets/${encodeURIComponent(assetId)}/approve`, {
            method: 'POST',
        });
        toastr.success('Asset approved and listed');
        await loadMarketplace({ silent: true });
    });
}

async function rejectAsset(assetId) {
    const reason = await callGenericPopup('Reason for rejection:', POPUP_TYPE.INPUT, '', {
        okButton: 'Reject',
        cancelButton: 'Cancel',
        rows: 4,
    });

    if (reason === null || reason === false) {
        return;
    }

    const trimmedReason = String(reason || '').trim();
    if (trimmedReason.length > MAX_REJECT_REASON_LENGTH) {
        toastr.warning(`Rejection reason must be ${MAX_REJECT_REASON_LENGTH} characters or less`);
        return;
    }

    await withBusyAsset(assetId, async () => {
        await fetchJson(`/api/market/assets/${encodeURIComponent(assetId)}/reject`, {
            method: 'POST',
            body: JSON.stringify({ reason: trimmedReason }),
        });
        toastr.success('Asset rejected');
        await loadMarketplace({ silent: true });
    });
}

async function delistAsset(assetId) {
    const confirmed = await callGenericPopup('Delist this marketplace asset?', POPUP_TYPE.CONFIRM, '', {
        okButton: 'Delist',
        cancelButton: 'Cancel',
    });

    if (!confirmed) {
        return;
    }

    await withBusyAsset(assetId, async () => {
        await fetchJson(`/api/market/assets/${encodeURIComponent(assetId)}/delist`, {
            method: 'POST',
        });
        toastr.success('Asset delisted');
        await loadMarketplace({ silent: true });
    });
}

async function reportAsset(assetId) {
    const reason = await callGenericPopup('Report reason:', POPUP_TYPE.INPUT, '', {
        okButton: 'Next',
        cancelButton: 'Cancel',
        rows: 2,
    });

    if (reason === null || reason === false) {
        return;
    }

    const trimmedReason = String(reason || '').trim();
    if (!trimmedReason) {
        toastr.warning('Report reason is required');
        return;
    }
    if (trimmedReason.length > MAX_REPORT_REASON_LENGTH) {
        toastr.warning(`Report reason must be ${MAX_REPORT_REASON_LENGTH} characters or less`);
        return;
    }

    const details = await callGenericPopup('Add report details (optional):', POPUP_TYPE.INPUT, '', {
        okButton: 'Report',
        cancelButton: 'Cancel',
        rows: 6,
    });

    if (details === null || details === false) {
        return;
    }
    const trimmedDetails = String(details || '').trim();
    if (trimmedDetails.length > MAX_REPORT_BODY_LENGTH) {
        toastr.warning(`Report details must be ${MAX_REPORT_BODY_LENGTH} characters or less`);
        return;
    }

    await withBusyAsset(assetId, async () => {
        await fetchJson(`/api/market/assets/${encodeURIComponent(assetId)}/report`, {
            method: 'POST',
            body: JSON.stringify({
                reason: trimmedReason,
                body: trimmedDetails,
            }),
        });
        toastr.success('Report submitted');
        void loadReportQueue();
    });
}

async function viewAssetDetails(assetId) {
    await withBusyAsset(assetId, async () => {
        const result = await fetchJson(`/api/market/assets/${encodeURIComponent(assetId)}`, {
            method: 'GET',
        });
        await callGenericPopup(createAssetPreview(result.asset || {}, result.entitlement || null), POPUP_TYPE.TEXT, '', {
            okButton: 'Close',
            wide: true,
            large: true,
            allowVerticalScrolling: true,
            leftAlign: true,
        });
    });
}

const inspectAsset = viewAssetDetails;

async function reviseAsset(assetId) {
    await withBusyAsset(assetId, async () => {
        const result = await fetchJson(`/api/market/assets/${encodeURIComponent(assetId)}`, {
            method: 'GET',
        });
        fillUploadForm(result.asset || {});
        toastr.info('Asset loaded for revision');
    });
}

async function resolveReport(reportId) {
    const note = await callGenericPopup('Resolution note (optional):', POPUP_TYPE.INPUT, '', {
        okButton: 'Resolve',
        cancelButton: 'Cancel',
        rows: 4,
    });

    if (note === null || note === false) {
        return;
    }

    const trimmedNote = String(note || '').trim();
    if (trimmedNote.length > MAX_REPORT_RESOLUTION_NOTE_LENGTH) {
        toastr.warning(`Resolution note must be ${MAX_REPORT_RESOLUTION_NOTE_LENGTH} characters or less`);
        return;
    }

    await withBusyReport(reportId, async () => {
        await fetchJson(`/api/market/reports/${encodeURIComponent(reportId)}/resolve`, {
            method: 'POST',
            body: JSON.stringify({ note: trimmedNote }),
        });
        state.reports = state.reports.filter(report => report.id !== reportId);
        toastr.success('Report resolved');
    });
}

function parsePayloadJson() {
    const text = String($('#marketplace_wallet_upload_payload').val() || '').trim();
    if (!text) {
        throw new Error('Payload JSON is required');
    }
    const payload = JSON.parse(text);
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        throw new Error('Payload JSON must be an object');
    }
    if (getJsonByteLength(payload) > MAX_UPLOAD_PAYLOAD_BYTES) {
        throw new Error(`Payload JSON must be ${formatCoins(MAX_UPLOAD_PAYLOAD_BYTES)} bytes or less`);
    }
    return payload;
}

function assertTextLength(label, value, maxLength) {
    if (String(value || '').length > maxLength) {
        throw new Error(`${label} must be ${maxLength} characters or less`);
    }
}

function validateUploadTextFields({ title, summary, description, language, contentRating }) {
    assertTextLength('Title', title, MAX_UPLOAD_TITLE_LENGTH);
    assertTextLength('Summary', summary, MAX_UPLOAD_SUMMARY_LENGTH);
    assertTextLength('Description', description, MAX_UPLOAD_DESCRIPTION_LENGTH);
    assertTextLength('Language', language, MAX_UPLOAD_LANGUAGE_LENGTH);
    assertTextLength('Content rating', contentRating, MAX_UPLOAD_CONTENT_RATING_LENGTH);
}

function getJsonByteLength(value) {
    return new TextEncoder().encode(JSON.stringify(value)).length;
}

function looksLikeCharacterCard(payload) {
    if (payload?.spec === 'chara_card_v2') {
        const data = payload.data;
        return Boolean(data?.name)
            && Array.isArray(data.alternate_greetings)
            && Array.isArray(data.tags)
            && typeof data.extensions === 'object';
    }

    if (payload?.spec === 'chara_card_v3') {
        return Boolean(payload.data && typeof payload.data === 'object');
    }

    return ['name', 'description', 'personality', 'scenario', 'first_mes', 'mes_example']
        .every(field => Object.hasOwn(payload, field));
}

function validatePayloadShape(type, payload) {
    if (type === 'world_book' && (!payload.entries || typeof payload.entries !== 'object' || Array.isArray(payload.entries))) {
        throw new Error('World book payload must contain an entries object');
    }

    if (type === 'character_card' && !looksLikeCharacterCard(payload)) {
        throw new Error('Character payload must be a Tavern Card v1, v2, or v3 object');
    }
}

function inferPayloadType(payload) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return '';
    }

    if (payload?.entries && typeof payload.entries === 'object' && !Array.isArray(payload.entries)) {
        return 'world_book';
    }

    if (looksLikeCharacterCard(payload)) {
        return 'character_card';
    }

    return '';
}

function getPayloadTitleHint(payload, fallback = '') {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return fallback;
    }

    return String(payload?.data?.name || payload?.name || fallback).slice(0, MAX_UPLOAD_TITLE_LENGTH);
}

function applyUploadPayloadHints(payload, fallbackTitle = '') {
    const inferredType = inferPayloadType(payload);
    if (inferredType) {
        $('#marketplace_wallet_upload_type').val(inferredType);
    }

    if (!$('#marketplace_wallet_upload_title').val()) {
        const title = getPayloadTitleHint(payload, fallbackTitle);
        if (title) {
            $('#marketplace_wallet_upload_title').val(title);
        }
    }
}

function applyUploadPayloadTextHints(text, fallbackTitle = '') {
    if (!String(text || '').trim()) {
        return;
    }

    try {
        applyUploadPayloadHints(JSON.parse(text), fallbackTitle);
    } catch {
        // Pasted payloads are still validated on submit; avoid noisy toasts while editing.
    }
}

function parseTagInput(value) {
    const tags = [];
    const seen = new Set();

    for (const rawTag of String(value || '').split(',')) {
        const tag = rawTag.trim();
        if (!tag) {
            continue;
        }

        if (tag.length > MAX_UPLOAD_TAG_LENGTH) {
            throw new Error(`Tags must be ${MAX_UPLOAD_TAG_LENGTH} characters or less`);
        }

        const key = tag;
        if (seen.has(key)) {
            continue;
        }

        tags.push(tag);
        seen.add(key);
        if (tags.length > MAX_UPLOAD_TAGS) {
            throw new Error(`Tags must contain ${MAX_UPLOAD_TAGS} items or less`);
        }
    }

    return tags;
}

async function createAsset(submitForReview) {
    const type = String($('#marketplace_wallet_upload_type').val() || '');
    const title = String($('#marketplace_wallet_upload_title').val() || '').trim();
    const summary = String($('#marketplace_wallet_upload_summary').val() || '').trim();
    const description = String($('#marketplace_wallet_upload_description').val() || '').trim();
    const language = String($('#marketplace_wallet_upload_language').val() || 'en').trim() || 'en';
    const contentRating = String($('#marketplace_wallet_upload_content_rating').val() || 'general').trim() || 'general';
    const priceType = String($('#marketplace_wallet_upload_price_type').val() || 'free');
    const priceCoins = priceType === 'fixed_price' ? Number($('#marketplace_wallet_upload_price').val() || 0) : 0;

    if (!title) {
        toastr.warning('Title is required');
        return;
    }

    let payload;
    let tags;
    try {
        validateUploadTextFields({ title, summary, description, language, contentRating });
        tags = parseTagInput($('#marketplace_wallet_upload_tags').val());
        payload = parsePayloadJson();
        validatePayloadShape(type, payload);
    } catch (error) {
        toastr.error(error.message || 'Invalid payload JSON');
        return;
    }

    if (priceType === 'fixed_price' && (!Number.isSafeInteger(priceCoins) || priceCoins <= 0)) {
        toastr.warning('Fixed price must be a positive whole number');
        return;
    }

    const $buttons = $('[data-marketplace-wallet-upload]');
    $buttons.prop('disabled', true);
    try {
        const editingAssetId = state.editingAssetId;
        const result = await fetchJson(editingAssetId ? `/api/market/assets/${encodeURIComponent(editingAssetId)}` : '/api/market/assets', {
            method: editingAssetId ? 'PATCH' : 'POST',
            body: JSON.stringify({
                type,
                title,
                summary,
                description,
                tags,
                language,
                content_rating: contentRating,
                price_type: priceType,
                price_coins: priceCoins,
                normalized_payload: payload,
            }),
        });
        const savedAsset = result.asset || {};
        const savedAssetId = savedAsset.id ? String(savedAsset.id) : '';
        if (submitForReview) {
            if (!savedAssetId) {
                throw new Error('Saved asset did not include an id');
            }

            try {
                await fetchJson(`/api/market/assets/${encodeURIComponent(savedAssetId)}/submit`, {
                    method: 'POST',
                });
                toastr.success(editingAssetId ? 'Changes saved and submitted for review' : 'Asset saved and submitted for review');
            } catch (error) {
                console.error('Failed to submit saved market asset', error);
                const savedMessage = editingAssetId ? 'Changes saved, but submit failed' : 'Draft saved, but submit failed';
                toastr.warning(error.message ? `${savedMessage}: ${error.message}` : savedMessage);
            }
        } else {
            toastr.success(editingAssetId ? 'Changes saved' : 'Draft saved');
        }
        clearUploadForm();
        await loadMarketplace({ silent: true });
    } catch (error) {
        console.error('Failed to create market asset', error);
        toastr.error(error.message || 'Asset could not be saved');
    } finally {
        $buttons.prop('disabled', false);
    }
}

async function grantCoins() {
    if (state.granting) {
        return;
    }

    const targetHandle = String($('#marketplace_wallet_grant_handle').val() || '').trim();
    const amount = Number($('#marketplace_wallet_grant_amount').val() || 0);
    const bucket = String($('#marketplace_wallet_grant_bucket').val() || 'bonus');
    const reason = String($('#marketplace_wallet_grant_reason').val() || '').trim() || 'Admin grant';

    if (!targetHandle) {
        toastr.warning('User handle is required');
        return;
    }
    if (!Number.isSafeInteger(amount) || amount <= 0) {
        toastr.warning('Grant amount must be a positive whole number');
        return;
    }
    if (!['bonus', 'paid', 'earnings'].includes(bucket)) {
        toastr.warning('Grant bucket is invalid');
        return;
    }
    if (reason.length > MAX_GRANT_REASON_LENGTH) {
        toastr.warning(`Grant reason must be ${MAX_GRANT_REASON_LENGTH} characters or less`);
        return;
    }

    state.granting = true;
    $('#marketplace_wallet_grant_submit').prop('disabled', true);
    try {
        const result = await fetchJson('/api/wallet/grants/admin', {
            method: 'POST',
            body: JSON.stringify({
                targetHandle,
                amount,
                bucket,
                reason,
            }),
        });
        toastr.success(`${formatCoins(amount)} ${bucket} coins granted to ${result.handle}`);
        if (state.wallet?.handle === result.handle) {
            state.wallet.balance = result.balance;
            renderWallet();
            void loadWalletLedger();
        }
    } catch (error) {
        console.error('Failed to grant coins', error);
        toastr.error(error.message || 'Coins could not be granted');
    } finally {
        state.granting = false;
        $('#marketplace_wallet_grant_submit').prop('disabled', false);
    }
}

async function updateUserAccess(handle, action) {
    if (!handle || !USER_ACCESS_ACTIONS.has(action) || state.busyUserHandles.has(handle)) {
        return;
    }

    state.busyUserHandles.add(handle);
    renderUserManagement();
    try {
        await fetchJson(`/api/users/${action}`, {
            method: 'POST',
            body: JSON.stringify({ handle }),
        });
        toastr.success(`${handle} updated`);
        await loadUsers();
    } catch (error) {
        console.error(`Failed to ${action} user`, error);
        toastr.error(error.message || 'User permission could not be updated');
    } finally {
        state.busyUserHandles.delete(handle);
        renderUserManagement();
    }
}

function onUserAction(event) {
    const button = event.target.closest('[data-marketplace-wallet-user-action]');
    if (!button) {
        return;
    }

    const handle = button.getAttribute('data-user-handle');
    const action = button.getAttribute('data-marketplace-wallet-user-action');
    void updateUserAccess(handle, action);
}

function onAssetAction(event) {
    const button = event.target.closest('[data-marketplace-wallet-action]');
    if (!button) {
        return;
    }

    const assetId = button.getAttribute('data-asset-id');
    const action = button.getAttribute('data-marketplace-wallet-action');
    if (!assetId || state.busyAssetIds.has(assetId)) {
        return;
    }

    const actions = {
        purchase: purchaseAsset,
        install: installAsset,
        submit: submitAsset,
        details: viewAssetDetails,
        revise: reviseAsset,
        inspect: inspectAsset,
        approve: approveAsset,
        reject: rejectAsset,
        delist: delistAsset,
        report: reportAsset,
    };
    actions[action]?.(assetId).catch(error => {
        console.error(`Marketplace action failed: ${action}`, error);
        toastr.error(error.message || 'Marketplace action failed');
    });
}

function onReportAction(event) {
    const button = event.target.closest('[data-marketplace-wallet-report-action]');
    if (!button) {
        return;
    }

    const reportId = button.getAttribute('data-report-id');
    const action = button.getAttribute('data-marketplace-wallet-report-action');
    if (!reportId || state.busyReportIds.has(reportId)) {
        return;
    }

    const actions = {
        resolve: resolveReport,
    };
    actions[action]?.(reportId).catch(error => {
        console.error(`Marketplace report action failed: ${action}`, error);
        toastr.error(error.message || 'Marketplace report action failed');
    });
}

function onRetryAction(event) {
    const key = String($(event.currentTarget).data('marketplaceWalletRetry') || '');
    retryPanel(key);
}

async function openMarketplacePanel() {
    const extensionsBlock = document.getElementById('rm_extensions_block');
    if (extensionsBlock && !extensionsBlock.classList.contains('openDrawer')) {
        const toggle = document.querySelector('#extensions-settings-button > .drawer-toggle');
        if (toggle) {
            await doNavbarIconClick.call(toggle);
        }
    }

    const drawer = document.querySelector('#marketplace_wallet_ui .inline-drawer');
    if (drawer) {
        toggleDrawer(drawer, true);
        drawer.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
}

function ensureMarketplaceLauncher() {
    if (document.getElementById(LAUNCHER_ID)) {
        return;
    }

    const $button = $('<button id="marketplace_wallet_launcher" class="menu_button interactable" type="button" title="Open Marketplace & Wallet"></button>');
    $button.append($('<i class="fa-solid fa-store" aria-hidden="true"></i>'));
    $button.append($('<span></span>').text('市场 / 钱包'));
    $button.on('click', () => {
        void openMarketplacePanel();
    });
    $('body').append($button);
}

function bindEvents($root) {
    $root.find('#marketplace_wallet_refresh').on('click', () => loadMarketplace());
    $root.find('#marketplace_wallet_search, #marketplace_wallet_type_filter, #marketplace_wallet_price_filter, #marketplace_wallet_access_filter, #marketplace_wallet_sort').on('input change', renderAssets);
    $root.find('#marketplace_wallet_clear_filters').on('click', clearMarketplaceFilters);
    $root.on('click', '[data-marketplace-wallet-retry]', onRetryAction);
    $root.find('#marketplace_wallet_assets').on('click', onAssetAction);
    $root.find('#marketplace_wallet_creator_assets_list').on('click', onAssetAction);
    $root.find('#marketplace_wallet_library_items').on('click', onAssetAction);
    $root.find('#marketplace_wallet_review_queue').on('click', onAssetAction);
    $root.find('#marketplace_wallet_report_queue').on('click', onReportAction);
    $root.find('#marketplace_wallet_users').on('click', onUserAction);
    $root.find('#marketplace_wallet_users_refresh').on('click', () => loadUsers());
    $root.find('#marketplace_wallet_grant_submit').on('click', grantCoins);
    $root.find('#marketplace_wallet_upload_price_type').on('change', function () {
        const isFixedPrice = String($(this).val()) === 'fixed_price';
        $('#marketplace_wallet_upload_price').prop('disabled', !isFixedPrice).val(isFixedPrice ? $('#marketplace_wallet_upload_price').val() || 1 : 0);
    }).trigger('change');
    $root.find('#marketplace_wallet_upload_file').on('change', async function () {
        const file = this.files?.[0];
        if (!file) {
            return;
        }
        try {
            const text = await getFileText(file);
            const payload = JSON.parse(text);
            $('#marketplace_wallet_upload_payload').val(text);
            applyUploadPayloadHints(payload, file.name.replace(/\.[^.]+$/, ''));
        } catch (error) {
            toastr.error(error.message || 'File is not valid JSON');
        } finally {
            this.value = '';
        }
    });
    $root.find('#marketplace_wallet_upload_payload').on('change blur', function () {
        applyUploadPayloadTextHints($(this).val());
    });
    $root.find('[data-marketplace-wallet-upload]').on('click', function () {
        createAsset($(this).attr('data-marketplace-wallet-upload') === 'review');
    });
    $root.find('#marketplace_wallet_upload_cancel').on('click', clearUploadForm);
}

export async function init() {
    if ($('#marketplace_wallet_ui').length) {
        ensureMarketplaceLauncher();
        return;
    }

    const template = await renderExtensionTemplateAsync(MODULE_NAME, 'window', {});
    const $html = $(template);
    $html.find('#marketplace_wallet_grant_handle').val(getCurrentUserHandle());
    bindEvents($html);
    $('#marketplace_wallet_container').append($html);
    ensureMarketplaceLauncher();
    renderAdminVisibility();
    await loadMarketplace({ silent: true });
}
