const PORTAL_PREFIX = "/api/portal/";
const RETIRED_PREFIXES = ["/v2", "/api/v2", "/api/admin/v2", "/wp-json"];

function matchesPrefix(pathname, prefix) {
  return pathname === prefix || pathname.startsWith(prefix + "/");
}

export function routeFor(url) {
  if (url.hostname === "www.vectorcontrol.tech") {
    const canonical = new URL(url);
    canonical.hostname = "vectorcontrol.tech";
    return { kind: "redirect", url: canonical };
  }
  if (
    url.pathname === "/api/portal" ||
    url.pathname.startsWith(PORTAL_PREFIX) ||
    url.pathname.startsWith("/.well-known/acme-challenge/")
  ) {
    return { kind: "origin" };
  }
  if (RETIRED_PREFIXES.some((prefix) => matchesPrefix(url.pathname, prefix))) {
    return { kind: "retired" };
  }
  if (url.pathname === "/api" || url.pathname.startsWith("/api/")) {
    return { kind: "deny" };
  }
  return { kind: "pages" };
}

function joinBase(base, url) {
  return base.replace(/\/$/u, "") + url.pathname + url.search;
}

async function proxy(request, target, tag, resolveHost) {
  const headers = new Headers(request.headers);
  headers.set("Host", new URL(target).host);
  headers.set("X-Forwarded-Proto", "https");
  headers.set("X-Forwarded-Host", new URL(request.url).host);
  const init = {
    method: request.method,
    headers,
    redirect: "manual",
  };
  if (resolveHost) init.cf = { resolveOverride: resolveHost };
  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
  }
  const upstream = await fetch(target, init);
  const out = new Headers(upstream.headers);
  out.set("x-vectorcontrol-router", tag);
  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: out,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const route = routeFor(url);
    if (route.kind === "redirect") {
      return Response.redirect(route.url.toString(), 301);
    }
    if (route.kind === "retired") {
      return new Response(null, {
        status: 410,
        headers: { "cache-control": "public, max-age=3600", "x-vectorcontrol-router": "retired" },
      });
    }
    if (route.kind === "deny") {
      return new Response('{"error":"not_found"}\n', {
        status: 404,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "x-vectorcontrol-router": "deny",
        },
      });
    }
    if (route.kind === "origin") {
      return proxy(
        request,
        joinBase("https://" + env.ORIGIN_HOST, url),
        "origin",
        env.ORIGIN_RESOLVE_HOST,
      );
    }
    return proxy(request, joinBase(env.PAGES_BASE, url), "pages");
  },
};
