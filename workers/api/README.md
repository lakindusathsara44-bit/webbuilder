# Apokolips Builder API Worker

Cloudflare Worker API for authenticated website draft management.

## API routes

- `GET /api/health` — unauthenticated service and binding health check.
- `GET /api/me` — returns the authenticated user ID.
- `GET /api/sites` — list only the signed-in user's websites.
- `POST /api/sites` — create a draft website.
- `GET /api/sites/:id` — load an owned website and its draft document.
- `PUT /api/sites/:id` — save an owned website's HTML, CSS, JavaScript, and GrapesJS project data.
- `DELETE /api/sites/:id` — delete an owned website and its draft object.

All routes except `GET /api/health` require a valid Supabase access token in the `Authorization: Bearer <token>` header. The Worker derives the owner ID from the verified token; it does not accept an owner ID from the client as an authority.

## Bindings and variables

- `DB`: Cloudflare D1 database binding.
- `ASSETS`: Cloudflare R2 bucket binding.
- `SUPABASE_URL`: Supabase project URL.
- `DASHBOARD_ORIGIN`: comma-separated exact origins allowed by CORS (for example `https://builder.apokolips.xyz,http://localhost:5173`).

The D1 schema is in `migrations/0001_initial.sql`. Draft documents are JSON objects stored in R2 under a per-site draft key. D1 stores website metadata and the R2 object key. The API currently enforces a 2 MiB request/document limit.

## Supabase JWT verification

The Worker supports both Supabase signing modes:

- **Asymmetric signing keys:** JWT signatures are verified locally using the project's public JWKS endpoint. Issuer and `authenticated` audience are checked.
- **Legacy/shared-secret HS256:** Supabase does not publish a public verification key for this mode. The Worker validates the token against Supabase Auth's `/auth/v1/user` endpoint using an API key.

Set the browser-safe Supabase publishable/anon key as a Worker secret so HS256 projects can be verified:

```sh
npx wrangler secret put SUPABASE_PUBLISHABLE_KEY
```

Paste the Supabase publishable key (or legacy anon key) when Wrangler prompts. This is not the service-role/secret key. Never put a service-role key in the dashboard or commit it to the repository.

## Configure and deploy

Run these commands from this directory:

1. Install: `npm install`.
2. Create D1: `npx wrangler d1 create apokolips-builder-db`.
3. Create R2: `npx wrangler r2 bucket create apokolips-builder-assets`.
4. Copy `wrangler.toml.example` to `wrangler.toml`.
5. Replace `database_id` with the ID returned by Wrangler; check `SUPABASE_URL` and `DASHBOARD_ORIGIN`.
6. Apply the migration: `npx wrangler d1 migrations apply DB --remote`.
7. Set the `SUPABASE_PUBLISHABLE_KEY` secret using the command above.
8. Test locally: `npx wrangler dev`.
9. Deploy when the resources and origins have been checked: `npx wrangler deploy`.

After the Worker is deployed, set the dashboard's `VITE_BUILDER_API_URL` to the Worker origin and rebuild/redeploy the Vite dashboard.

Do not commit `wrangler.toml`, Cloudflare account tokens, or secrets.

## Scope and limits

- This Worker stores website drafts only. Publish/release creation, public site routing, custom domain verification, and rollback endpoints are not implemented.
- D1 and R2 must exist and be bound before the API's website routes can work.
- A project URL shown in the dashboard is a planned host address until a separate site router and publishing flow are deployed.
- User-created HTML/CSS/JS is stored as content. The API does not execute it.
