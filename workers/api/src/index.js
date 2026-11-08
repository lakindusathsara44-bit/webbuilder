import { createRemoteJWKSet, jwtVerify } from "jose";

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
  const headers = { "Vary": "Origin" };
  if (origin && env.DASHBOARD_ORIGIN && origin === env.DASHBOARD_ORIGIN) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type";
    headers["Access-Control-Max-Age"] = "86400";
  }
  return headers;
}

let jwksCache;

function getJwks(env) {
  if (!env.SUPABASE_URL) {
    throw new Error("SUPABASE_URL is not configured");
  }
  if (!jwksCache) {
    const issuerUrl = env.SUPABASE_URL.replace(/\/$/, "");
    jwksCache = createRemoteJWKSet(
      new URL(`${issuerUrl}/auth/v1/.well-known/jwks.json`)
    );
  }
  return jwksCache;
}

async function requireUser(request, env) {
  const authorization = request.headers.get("Authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return { response: json({ error: "Authentication required" }, 401) };
  }

  try {
    const issuer = env.SUPABASE_URL.replace(/\/$/, "") + "/auth/v1";
    const { payload } = await jwtVerify(match[1], getJwks(env), {
      issuer,
      audience: "authenticated"
    });
    if (!payload.sub) {
      return { response: json({ error: "Invalid access token" }, 401) };
    }
    return { user: { id: payload.sub, role: payload.role || null } };
  } catch {
    return { response: json({ error: "Invalid or expired access token" }, 401) };
  }
}

export default {
  async fetch(request, env) {
    const headers = corsHeaders(request, env);
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      if (!headers["Access-Control-Allow-Origin"]) {
        return new Response(null, { status: 403 });
      }
      return new Response(null, { status: 204, headers });
    }

    if (url.pathname === "/api/health" && request.method === "GET") {
      return json({
        ok: true,
        service: "apokolips-builder-api",
        version: "0.1.0",
        bindings: {
          d1: Boolean(env.DB),
          r2: Boolean(env.ASSETS)
        }
      }, 200, headers);
    }

    if (url.pathname === "/api/me" && request.method === "GET") {
      const auth = await requireUser(request, env);
      if (auth.response) {
        return json({ error: "Authentication required or token invalid" }, 401, headers);
      }
      return json({ user: auth.user }, 200, headers);
    }

    return json({ error: "Not found" }, 404, headers);
  }
};
