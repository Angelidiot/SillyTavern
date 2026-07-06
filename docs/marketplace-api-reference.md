# Marketplace API Reference

Generated at: 2026-06-26T00:00:00.000Z

This file is generated from the local MVP route implementation. Regenerate it with `npm run marketplace:export:api`.

## Client Request Requirements

- Default deployments require CSRF protection for mutating requests. Fetch `GET /csrf-token`, keep the returned session cookie, and send the token in the `X-CSRF-Token` header on `POST`, `PATCH`, `PUT`, and `DELETE` marketplace or wallet requests.
- The CSRF token must match the same session cookie returned by `/csrf-token`; missing or mismatched write tokens are rejected before marketplace or wallet handlers run. The runtime smoke covers this with a tokenless `POST /api/market/assets` returning `403`.
- The built-in web/PWA client uses `getRequestHeaders()` to include JSON content type and the current CSRF token. Read routes and the public health route do not require this write header, though their normal login and authorization rules still apply.
- Local smoke scripts may run with `--disableCsrf`, but hosted/mobile clients should assume CSRF is enabled unless the deployment explicitly says otherwise.

## Market API

```text
GET    /api/market/assets
GET    /api/market/assets/:id
GET    /api/market/creator/summary
GET    /api/market/library
GET    /api/market/reports/admin
POST   /api/market/reports/:id/resolve
POST   /api/market/assets
PATCH  /api/market/assets/:id
POST   /api/market/assets/:id/submit
POST   /api/market/assets/:id/approve
POST   /api/market/assets/:id/reject
POST   /api/market/assets/:id/delist
POST   /api/market/assets/:id/report
POST   /api/market/assets/:id/purchase
POST   /api/market/assets/:id/install
```

Notes:

- GET /api/market/assets: Lists listed public assets plus assets readable by the creator, admins, or entitled users as metadata summaries only; normalized_payload is never included in list responses.
- GET /api/market/assets/:id: Listed public assets are readable as allowlisted metadata; raw metadata, review/moderation internals, and entitlement ledger internals are excluded, and payload is returned only to the creator, admins, or entitled users.
- GET /api/market/creator/summary: Returns only the current creator's asset summaries and aggregate stats; raw wallet objects, recent earnings ledgers, and asset payloads are excluded.
- GET /api/market/library: Returns only the authenticated user's active entitlements and install summaries.
- GET /api/market/reports/admin: Admin-only report queue; report bodies are visible here but asset payloads remain excluded.
- POST /api/market/reports/:id/resolve: Admin-only report resolution with optional note up to 1000 characters.
- POST /api/market/assets: Creates a draft character_card or world_book asset; body must be a JSON object with object metadata up to 65536 bytes and normalized_payload up to 1048576 bytes, bounded title/summary/description/tags/language/content_rating metadata, supported price_type free/fixed_price, and positive safe integer price_coins for fixed_price assets.
- PATCH /api/market/assets/:id: Creator-only revision for draft or rejected assets; uses the same asset body and byte-size validation as create and resets the asset to private draft before resubmission.
- POST /api/market/assets/:id/submit: Creator-only transition from valid private draft to submitted review state.
- POST /api/market/assets/:id/approve: Admin-only review action that revalidates the full publishable asset fields, price, metadata, and payload format before listing the asset publicly.
- POST /api/market/assets/:id/reject: Admin-only review action that returns submitted assets to private rejected state with an optional reason up to 1000 characters.
- POST /api/market/assets/:id/delist: Admin-only moderation action; existing entitlements are preserved.
- POST /api/market/assets/:id/report: Creates an open report with required reason up to 120 characters and optional body up to 2000 characters.
- POST /api/market/assets/:id/purchase: Claims free assets or buys fixed-price listed assets with wallet bonus then paid coins; purchase responses omit full ledger entries and creator balances.
- POST /api/market/assets/:id/install: Installs creator-owned or entitled assets into the user data directory and returns a redacted local reference without absolute paths.

## Wallet API

```text
GET    /api/wallet
GET    /api/wallet/ledger
POST   /api/wallet/grants/admin
```

Notes:

- GET /api/wallet: Authenticated users can read their own wallet; admins may pass handle to inspect another wallet; unknown handles return 404.
- GET /api/wallet/ledger: Authenticated users can read their own ledger; admins may pass handle to inspect another ledger; unknown handles return 404.
- POST /api/wallet/grants/admin: Admin-only grant endpoint; target can be handle, userHandle, or targetHandle; optional string reason defaults to Admin grant and must be 200 characters or less.

## Public health API

```text
GET    /api/health
```
