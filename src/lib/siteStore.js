import { STARTER_CSS, STARTER_HTML, STARTER_JS } from "./templates.js";

export const SITES_STORAGE_KEY = "apokolips-builder:sites:v1";

export function slugify(value) {
  return String(value || "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function loadSites() {
  try {
    const raw = window.localStorage.getItem(SITES_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((site) =>
      site && typeof site.id === "string" &&
      typeof site.name === "string" &&
      typeof site.slug === "string"
    ) : [];
  } catch {
    return [];
  }
}

export function createSite(name, requestedSlug, existingSites = []) {
  const cleanName = String(name || "").trim().slice(0, 60);
  if (!cleanName) throw new Error("Enter a website name.");

  const base = slugify(requestedSlug || cleanName) || "my-website";
  const used = new Set(existingSites.map((site) => site.slug));
  let slug = base;
  let suffix = 2;
  while (used.has(slug)) {
    slug = `${base}-${suffix++}`;
  }

  const now = new Date().toISOString();
  return {
    id: globalThis.crypto?.randomUUID?.() || `site-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: cleanName,
    slug,
    html: STARTER_HTML,
    css: STARTER_CSS,
    js: STARTER_JS,
    createdAt: now,
    updatedAt: now
  };
}

export function getSiteUrl(site) {
  return `https://${site.slug}.sites.apokolips.xyz`;
}
