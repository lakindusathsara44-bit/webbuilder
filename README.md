# Apokolips Website Builder

A beta website-building platform for `sites.apokolips.xyz`.

## Current foundation

- Dashboard: React + Vite
- Authentication: Supabase Auth (sign-in only; invite-only beta)
- API: Cloudflare Worker
- Metadata: Cloudflare D1
- Website assets: Cloudflare R2
- Code/visual editor dependencies will be integrated in a later milestone (Monaco Editor and GrapesJS).

## Local dashboard setup

1. Install Node.js (LTS).
2. Run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Set `VITE_SUPABASE_URL` to the existing Supabase project URL and `VITE_SUPABASE_ANON_KEY` to that project's publishable/anon key.
5. Run `npm run dev`.

The dashboard intentionally has no public sign-up form. Invite beta users through the Supabase project dashboard. Configure the invite redirect URL to the local dashboard during development and to the production dashboard when deployed.

## Existing Supabase project

The beta is configured to reuse the existing `SLIATE-GPA-Calculator` project for Supabase Auth:

- Project ref: `qccbsuxomdqdwfnqoycb`
- URL: `https://qccbsuxomdqdwfnqoycb.supabase.co`
- Region: `ap-south-1`

Do not add, rename, or modify GPA Calculator tables for this Builder foundation. Builder website metadata is planned for a separate Cloudflare D1 database. The Supabase publishable/anon key may be used in the browser; **never put a Supabase service-role key in a `VITE_*` variable or commit secrets**.

## Cloudflare API foundation

See [workers/api/README.md](workers/api/README.md). The Wrangler example config uses placeholders until the D1 database and R2 bucket are created. Do not deploy it unchanged.

## Planned hostnames

- Dashboard: `builder.apokolips.xyz`
- API: `api.builder.apokolips.xyz`
- Published sites: `*.sites.apokolips.xyz`

DNS records and production deployments have not been changed by this repository setup. Preserve the existing Constantine, Learn English, and GPA Calculator subdomains.

## Beta security principles

- Invite-only access; no public account creation.
- Verify Supabase access tokens in the Worker.
- Enforce owner checks in the API for every site, file, release, and domain operation.
- Keep draft assets separate from immutable published releases.
- Store uploaded website assets in R2; keep metadata in D1.
- Serve user-created sites on the separate `sites.apokolips.xyz` origin, not inside the dashboard origin.
- The first release supports static HTML/CSS/JS only. Do not execute uploaded server-side code.

## Status

This commit creates the initial source foundation only. Supabase credentials, Cloudflare resources, DNS, hosting, and production deployment still require configuration.
