import { createRemoteJWKSet, jwtVerify } from "jose";

const MAX_DOCUMENT_BYTES = 2 * 1024 * 1024;
const DRAFT_PATH = "site.json";
let jwksCache;

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...headers
    }
  });
}

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin");
  const allowed = (env.DASHBOARD_ORIGIN || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const headers = { Vary: "Origin" };
  if (origin && allowed.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type";
    headers["Access-Control-Max-Age"] = "86400";
  }
  return headers;
}

function getJwks(env) {
  if (!jwksCache) {
    const issuerUrl = env.SUPABASE_URL.replace(/\/$/, "");
    jwksCache = createRemoteJWKSet(new URL(issuerUrl + "/auth/v1/.well-known/jwks.json"));
  }
  return jwksCache;
}

async function requireUser(request, env, headers) {
  if (!env.SUPABASE_URL) {
    return { response: json({ error: "Supabase authentication is not configured for this Worker." }, 503, headers) };
  }
  const authorization = request.headers.get("Authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) return { response: json({ error: "Authentication required" }, 401, headers) };

  try {
    const issuer = env.SUPABASE_URL.replace(/\/$/, "") + "/auth/v1";
    const { payload } = await jwtVerify(match[1], getJwks(env), {
      issuer,
      audience: "authenticated"
    });
    if (!payload.sub) return { response: json({ error: "Invalid access token" }, 401, headers) };
    return { user: { id: payload.sub, role: payload.role || null } };
  } catch {
    return { response: json({ error: "Invalid or expired access token" }, 401, headers) };
  }
}

async function readJson(request) {
  const headerSize = Number(request.headers.get("Content-Length") || 0);
  if (headerSize > MAX_DOCUMENT_BYTES) {
    return { error: "Request body exceeds the 2 MiB limit", status: 413 };
  }
  const raw = await request.text();
  const size = new TextEncoder().encode(raw).byteLength;
  if (size > MAX_DOCUMENT_BYTES) {
    return { error: "Request body exceeds the 2 MiB limit", status: 413 };
  }
  try {
    return { value: JSON.parse(raw) };
  } catch {
    return { error: "Request body must be valid JSON", status: 400 };
  }
}

function requireStorage(env, headers) {
  if (!env.DB || !env.ASSETS) {
    return json({ error: "Builder storage is not configured. Create the D1 database and R2 bucket, then bind them to this Worker." }, 503, headers);
  }
  return null;
}

function siteRow(row) {
  return {
    id: row.id,
    name: row.name,
    subdomain: row.subdomain,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

async function listSites(userId, env, headers) {
  const result = await env.DB.prepare(
    "SELECT id, name, subdomain, status, created_at, updated_at FROM builder_sites WHERE owner_id = ? ORDER BY updated_at DESC"
  ).bind(userId).all();
  return json({ sites: (result.results || []).map(siteRow) }, 200, headers);
}

async function createSite(request, userId, env, headers) {
  const parsed = await readJson(request);
  if (parsed.error) return json({ error: parsed.error }, parsed.status, headers);
  const input = parsed.value && typeof parsed.value === "object" ? parsed.value : {};
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const subdomain = typeof input.subdomain === "string" ? input.subdomain.trim().toLowerCase() : "";
  if (!name || name.length > 60) return json({ error: "Website name must be between 1 and 60 characters." }, 400, headers);
  if (subdomain.length < 3 || subdomain.length > 40 || !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(subdomain)) {
    return json({ error: "Subdomain must be 3–40 characters and use lowercase letters, numbers, or hyphens." }, 400, headers);
  }

  const existing = await env.DB.prepare("SELECT id FROM builder_sites WHERE subdomain = ? LIMIT 1").bind(subdomain).first();
  if (existing) return json({ error: "That website address is already in use. Try creating the website again." }, 409, headers);

  const id = crypto.randomUUID();
  const objectKey = "drafts/" + id + "/" + DRAFT_PATH;
  const now = Math.floor(Date.now() / 1000);
  const document = {
    html: '<header class="hero"><nav class="nav"><strong>YOUR BRAND</strong><span>Home　 About　 Contact</span></nav><div class="hero-content"><p class="eyebrow">WELCOME TO YOUR WEBSITE</p><h1>Make your<br>presence known.</h1><p>Build a beautiful website that tells your story.</p><a class="hero-button" href="#about">Explore more ↗</a></div></header><section id="about" class="about"><p class="eyebrow">A NEW BEGINNING</p><h2>Made for your ideas.</h2><p>Replace this text, add your own sections, and make this space yours.</p></section>',
    css: '* { box-sizing: border-box; } body { margin: 0; font-family: Inter, Arial, sans-serif; color: #eef5ff; background: #081426; } .hero { min-height: 520px; padding: 28px 7%; background: radial-gradient(circle at 80% 20%, #1c5892, transparent 35%), linear-gradient(135deg,#102d4e,#071323); } .nav { display:flex; justify-content:space-between; align-items:center; color:#c4dcf6; font-size:13px; } .hero-content { max-width:690px; padding:95px 0 70px; } .eyebrow { color:#78baff; font-size:11px; letter-spacing:3px; font-weight:700; } h1 { font-size:clamp(48px,8vw,86px); line-height:.98; letter-spacing:-5px; margin:18px 0; } .hero-content p:not(.eyebrow), .about p { color:#a7bbd2; line-height:1.8; } .hero-button { display:inline-block; margin-top:18px; padding:13px 18px; border:1px solid #79baff; border-radius:6px; color:#fff; text-decoration:none; } .about { padding:85px 7%; background:#0b1b30; } .about h2 { font-size:38px; }',
    js: "",
    project: null
  };
  const serialized = JSON.stringify(document);

  await env.ASSETS.put(objectKey, serialized, {
    httpMetadata: { contentType: "application/json; charset=utf-8" }
  });

  try {
    await env.DB.batch([
      env.DB.prepare(
        "INSERT INTO builder_sites (id, owner_id, name, subdomain, status, created_at, updated_at) VALUES (?, ?, ?, ?, 'draft', ?, ?)"
      ).bind(id, userId, name, subdomain, now, now),
      env.DB.prepare(
        "INSERT INTO builder_site_files (id, site_id, owner_id, path, object_key, content_type, size_bytes, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      ).bind(crypto.randomUUID(), id, userId, DRAFT_PATH, objectKey, "application/json", new TextEncoder().encode(serialized).byteLength, now)
    ]);
  } catch (error) {
    await env.ASSETS.delete(objectKey);
    if (String(error).includes("UNIQUE")) {
      return json({ error: "That website address is already in use. Try again." }, 409, headers);
    }
    throw error;
  }

  return json({
    site: {
      id, owner_id: userId, name, subdomain, status: "draft",
      created_at: now, updated_at: now, document
    }
  }, 201, headers);
}

async function getSite(siteId, userId, env, headers) {
  const row = await env.DB.prepare(
    "SELECT id, name, subdomain, status, created_at, updated_at FROM builder_sites WHERE id = ? AND owner_id = ? LIMIT 1"
  ).bind(siteId, userId).first();
  if (!row) return json({ error: "Website not found." }, 404, headers);

  const file = await env.DB.prepare(
    "SELECT object_key FROM builder_site_files WHERE site_id = ? AND owner_id = ? AND path = ? LIMIT 1"
  ).bind(siteId, userId, DRAFT_PATH).first();
  if (!file) return json({ error: "Website draft file is missing." }, 404, headers);

  const object = await env.ASSETS.get(file.object_key);
  if (!object) return json({ error: "Website draft data could not be found." }, 404, headers);

  return json({ site: { ...siteRow(row), document: await object.json() } }, 200, headers);
}

async function saveSite(request, siteId, userId, env, headers) {
  const row = await env.DB.prepare(
    "SELECT id FROM builder_sites WHERE id = ? AND owner_id = ? LIMIT 1"
  ).bind(siteId, userId).first();
  if (!row) return json({ error: "Website not found." }, 404, headers);

  const parsed = await readJson(request);
  if (parsed.error) return json({ error: parsed.error }, parsed.status, headers);
  const input = parsed.value && typeof parsed.value === "object" ? parsed.value : {};
  const document = input.document;
  if (!document || typeof document.html !== "string" || typeof document.css !== "string" || typeof document.js !== "string") {
    return json({ error: "Document must contain HTML, CSS, and JavaScript strings." }, 400, headers);
  }

  const serialized = JSON.stringify({
    html: document.html,
    css: document.css,
    js: document.js,
    project: document.project && typeof document.project === "object" ? document.project : null
  });
  const size = new TextEncoder().encode(serialized).byteLength;
  if (size > MAX_DOCUMENT_BYTES) return json({ error: "Website draft exceeds the 2 MiB limit." }, 413, headers);

  const objectKey = "drafts/" + siteId + "/" + DRAFT_PATH;
  const now = Math.floor(Date.now() / 1000);
  await env.ASSETS.put(objectKey, serialized, {
    httpMetadata: { contentType: "application/json; charset=utf-8" }
  });
  await env.DB.batch([
    env.DB.prepare(
      "UPDATE builder_sites SET updated_at = ? WHERE id = ? AND owner_id = ?"
    ).bind(now, siteId, userId),
    env.DB.prepare(
      "INSERT INTO builder_site_files (id, site_id, owner_id, path, object_key, content_type, size_bytes, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(site_id, path) DO UPDATE SET object_key = excluded.object_key, content_type = excluded.content_type, size_bytes = excluded.size_bytes, updated_at = excluded.updated_at"
    ).bind(crypto.randomUUID(), siteId, userId, DRAFT_PATH, objectKey, "application/json", size, now)
  ]);

  const updated = await env.DB.prepare(
    "SELECT id, name, subdomain, status, created_at, updated_at FROM builder_sites WHERE id = ? AND owner_id = ? LIMIT 1"
  ).bind(siteId, userId).first();
  return json({ site: { ...siteRow(updated), document: JSON.parse(serialized) } }, 200, headers);
}

async function deleteSite(siteId, userId, env, headers) {
  const row = await env.DB.prepare(
    "SELECT id FROM builder_sites WHERE id = ? AND owner_id = ? LIMIT 1"
  ).bind(siteId, userId).first();
  if (!row) return json({ error: "Website not found." }, 404, headers);

  await env.ASSETS.delete("drafts/" + siteId + "/" + DRAFT_PATH);
  await env.DB.prepare("DELETE FROM builder_sites WHERE id = ? AND owner_id = ?").bind(siteId, userId).run();
  return json({ success: true }, 200, headers);
}

export default {
  async fetch(request, env) {
    const headers = corsHeaders(request, env);
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      if (!headers["Access-Control-Allow-Origin"]) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers });
    }

    try {
      if (url.pathname === "/api/health" && request.method === "GET") {
        return json({
          ok: true,
          service: "apokolips-builder-api",
          version: "0.2.0",
          bindings: { d1: Boolean(env.DB), r2: Boolean(env.ASSETS) }
        }, 200, headers);
      }

      const auth = await requireUser(request, env, headers);
      if (auth.response) return auth.response;

      if (url.pathname === "/api/me" && request.method === "GET") {
        return json({ user: auth.user }, 200, headers);
      }

      if (url.pathname === "/api/sites" && request.method === "GET") {
        const unavailable = requireStorage(env, headers);
        return unavailable || await listSites(auth.user.id, env, headers);
      }

      if (url.pathname === "/api/sites" && request.method === "POST") {
        const unavailable = requireStorage(env, headers);
        return unavailable || await createSite(request, auth.user.id, env, headers);
      }

      const match = url.pathname.match(/^\/api\/sites\/([a-f0-9-]+)$/i);
      if (match) {
        const unavailable = requireStorage(env, headers);
        if (unavailable) return unavailable;
        const siteId = match[1];
        if (request.method === "GET") return await getSite(siteId, auth.user.id, env, headers);
        if (request.method === "PUT") return await saveSite(request, siteId, auth.user.id, env, headers);
        if (request.method === "DELETE") return await deleteSite(siteId, auth.user.id, env, headers);
      }

      return json({ error: "Not found" }, 404, headers);
    } catch (error) {
      return json({
        error: "The Builder API could not complete this request.",
        detail: env.ENVIRONMENT === "development" ? String(error) : undefined
      }, 500, headers);
    }
  }
};
