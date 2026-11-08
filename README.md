# Apokolips Website Builder

The private-beta website builder for the `sites.apokolips.xyz` platform.

## Implemented

- React + Vite dashboard with Supabase Auth sign-in (invite-only; no public sign-up).
- Website create, list, open, and delete flows.
- Visual website editor powered by GrapesJS.
- HTML, CSS, and JavaScript code editor powered by Monaco Editor.
- Preview in desktop, tablet, and mobile widths.
- Autosave for draft content.
- Cloudflare Worker API endpoints for per-user website CRUD.
- Cloudflare D1 for website metadata and Cloudflare R2 for draft document storage.

## Draft storage modes

The dashboard reads `VITE_BUILDER_API_URL` from the environment:

- **Empty value:** browser-local mode. Drafts are stored in localStorage under a user-specific key. They are available only in that browser and are not synced across devices.
- **Worker URL supplied:** the dashboard uses the Cloudflare API. The Worker verifies the user's Supabase access token, checks ownership on each site operation, stores metadata in D1, and stores draft documents in R2.

The editor's autosave stores drafts only. Publishing, live site delivery, custom domains, and the wildcard site router are not implemented yet. A displayed `*.sites.apokolips.xyz` address is a planned address, not proof that a public site is live.

## Run the dashboard locally

1. Install Node.js LTS.
2. From the repository root, run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the selected Supabase project's URL and publishable/anon key.
5. Leave `VITE_BUILDER_API_URL` empty to use browser-local drafts.
6. Run `npm run dev` and open the local Vite URL.

## Supabase project

The Builder currently reuses the existing `SLIATE-GPA-Calculator` Supabase project for Auth:

- Project ref: `qccbsuxomdqdwfnqoycb`
- URL: `https://qccbsuxomdqdwfnqoycb.supabase.co`
- Region: `ap-south-1`

Do not create or modify GPA Calculator tables for Builder. Website metadata belongs in the separate Cloudflare D1 database. Never expose a Supabase service-role or secret key in a browser `VITE_*` variable or commit it to GitHub.

Invite beta users from the Supabase dashboard. Configure the Auth redirect URL for localhost during development and `https://builder.apokolips.xyz` after that dashboard is deployed.

## Configure the Cloudflare API

See [workers/api/README.md](workers/api/README.md).

At a high level:

1. Create the D1 database `apokolips-builder-db`.
2. Create the R2 bucket `apokolips-builder-assets`.
3. Copy `workers/api/wrangler.toml.example` to `workers/api/wrangler.toml` and replace the D1 database ID.
4. Configure the Worker dashboard origin and Supabase URL.
5. Configure the Supabase publishable/anon key as a Worker secret for legacy HS256 token verification (see Worker README).
6. Apply the D1 migration and deploy the Worker.
7. Set `VITE_BUILDER_API_URL` to the deployed API Worker origin in the dashboard environment, then rebuild the dashboard.

Do not deploy the example Wrangler config unchanged. Do not commit `wrangler.toml`, Cloudflare tokens, or secrets.

## Planned hostnames

- Dashboard: `builder.apokolips.xyz`
- API: `api.builder.apokolips.xyz`
- Published sites: `*.sites.apokolips.xyz`

The project repository does not change DNS records. Preserve the existing Constantine, Learn English, and GPA Calculator subdomains.

## Security boundaries

- Invite-only authentication; no public registration.
- Worker verifies Supabase access tokens and derives site ownership from the verified user ID.
- Site reads, writes, and deletes are owner-scoped.
- Website draft documents are stored separately in R2, with metadata in D1.
- Preview runs in a sandboxed iframe on the dashboard.
- The current platform stores static HTML/CSS/JS as drafts. It does not execute server-side code.
- Do not run untrusted site markup on the dashboard's own origin.

## Current status

Milestone 02 source code is committed. The dashboard and editor have not been deployed or build-tested in this session. Cloudflare D1/R2 resources, Worker deployment, dashboard deployment, DNS, and live site publishing remain pending.
