# Builder API Worker

This is the initial Cloudflare Worker API for the Website Builder.

## Bindings

- `DB`: Cloudflare D1 metadata database.
- `ASSETS`: Cloudflare R2 object bucket.
- `SUPABASE_URL`: Supabase project URL used to verify JWT issuer and retrieve the public JWKS.
- `DASHBOARD_ORIGIN`: the exact dashboard origin allowed by CORS.

The Worker currently exposes:

- `GET /api/health` — service and binding check.
- `GET /api/me` — verifies a Supabase access token and returns the authenticated user ID.

All website CRUD and publish endpoints are intentionally deferred until ownership checks, file validation, quotas, and release isolation are implemented.

## Configure Cloudflare

1. Install Node.js LTS.
2. From this directory run `npm install`.
3. Create a D1 database: `npx wrangler d1 create apokolips-builder-db`.
4. Create an R2 bucket: `npx wrangler r2 bucket create apokolips-builder-assets`.
5. Copy `wrangler.toml.example` to `wrangler.toml` and replace the D1 database ID returned by Wrangler.
6. Check the configured Supabase issuer URL and dashboard origin.
7. Apply the migration: `npx wrangler d1 migrations apply DB --remote`.
8. Start locally with `npx wrangler dev`; deploy only after testing with `npx wrangler deploy`.

Do not commit account credentials, API tokens, service-role keys, or other secrets. Use Wrangler secrets for secret values.

## JWT notes

The Worker verifies Supabase access tokens using the project's published JWKS endpoint. The JWT issuer and audience are checked. Keep the Supabase project URL consistent with the project that issues the dashboard sessions.

## Important

- D1 and R2 are not created by this source scaffold.
- Do not deploy the example Wrangler file unchanged.
- Add per-site owner checks to every future API route.
- Never trust a client-supplied owner ID; derive ownership from the verified token's `sub` claim.
- Do not render user-authored site HTML on the Builder dashboard origin.
