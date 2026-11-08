-- Apokolips Website Builder metadata schema.
-- This migration belongs to the dedicated Cloudflare D1 database.
-- It does not modify any tables in the existing Supabase GPA Calculator project.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS builder_sites (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  name TEXT NOT NULL,
  subdomain TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_builder_sites_owner
  ON builder_sites(owner_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS builder_site_files (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  path TEXT NOT NULL,
  object_key TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'application/octet-stream',
  size_bytes INTEGER NOT NULL DEFAULT 0 CHECK (size_bytes >= 0),
  sha256 TEXT,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (site_id) REFERENCES builder_sites(id) ON DELETE CASCADE,
  UNIQUE (site_id, path)
);

CREATE INDEX IF NOT EXISTS idx_builder_files_site
  ON builder_site_files(site_id, path);

CREATE TABLE IF NOT EXISTS builder_releases (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  release_number INTEGER NOT NULL,
  object_prefix TEXT NOT NULL,
  manifest_json TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  created_by TEXT NOT NULL,
  FOREIGN KEY (site_id) REFERENCES builder_sites(id) ON DELETE CASCADE,
  UNIQUE (site_id, release_number)
);

CREATE INDEX IF NOT EXISTS idx_builder_releases_site
  ON builder_releases(site_id, release_number DESC);

CREATE TABLE IF NOT EXISTS builder_domains (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  hostname TEXT NOT NULL UNIQUE,
  domain_type TEXT NOT NULL
    CHECK (domain_type IN ('platform', 'custom')),
  verification_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'verified', 'failed')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (site_id) REFERENCES builder_sites(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_builder_domains_site
  ON builder_domains(site_id);
