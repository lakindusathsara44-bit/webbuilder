import { DEFAULT_DOCUMENT } from "./siteTemplate.js";

const API_BASE = (import.meta.env.VITE_BUILDER_API_URL || "").trim().replace(/\/$/, "");
export const API_CONFIGURED = Boolean(API_BASE);

function localKey(userId) {
  return "apokolips-builder-sites:" + userId;
}

function readLocal(userId) {
  try {
    const value = JSON.parse(localStorage.getItem(localKey(userId)) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeLocal(userId, sites) {
  localStorage.setItem(localKey(userId), JSON.stringify(sites));
}

async function apiRequest(path, token, options = {}) {
  if (!token) throw new Error("Your login session has expired. Sign in again.");
  const response = await fetch(API_BASE + path, {
    ...options,
    headers: {
      "Authorization": "Bearer " + token,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {})
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Builder API request failed (" + response.status + ").");
  return payload;
}

export async function listSites(userId, token) {
  if (API_CONFIGURED) {
    const result = await apiRequest("/api/sites", token);
    return result.sites || [];
  }
  return readLocal(userId).sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""));
}

export async function createSite(details, userId, token) {
  if (API_CONFIGURED) {
    const result = await apiRequest("/api/sites", token, { method: "POST", body: JSON.stringify(details) });
    return result.site;
  }
  const now = new Date().toISOString();
  const site = {
    id: globalThis.crypto?.randomUUID?.() || ("local-" + Date.now()),
    owner_id: userId,
    name: details.name,
    subdomain: details.subdomain,
    status: "draft",
    created_at: now,
    updated_at: now,
    document: { ...DEFAULT_DOCUMENT }
  };
  writeLocal(userId, [site, ...readLocal(userId)]);
  return site;
}

export async function loadSite(siteId, userId, token) {
  if (API_CONFIGURED) {
    const result = await apiRequest("/api/sites/" + encodeURIComponent(siteId), token);
    return result.site;
  }
  const site = readLocal(userId).find((item) => item.id === siteId);
  if (!site) throw new Error("Website not found in this browser.");
  return site;
}

export async function saveSite(siteId, document, userId, token) {
  if (API_CONFIGURED) {
    const result = await apiRequest("/api/sites/" + encodeURIComponent(siteId), token, {
      method: "PUT",
      body: JSON.stringify({ document })
    });
    return result.site;
  }
  const sites = readLocal(userId);
  const index = sites.findIndex((item) => item.id === siteId);
  if (index < 0) throw new Error("Website not found in this browser.");
  sites[index] = { ...sites[index], document, updated_at: new Date().toISOString() };
  writeLocal(userId, sites);
  return sites[index];
}

export async function deleteSite(siteId, userId, token) {
  if (API_CONFIGURED) {
    await apiRequest("/api/sites/" + encodeURIComponent(siteId), token, { method: "DELETE" });
    return;
  }
  writeLocal(userId, readLocal(userId).filter((item) => item.id !== siteId));
}
