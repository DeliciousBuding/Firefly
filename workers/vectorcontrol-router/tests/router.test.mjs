import assert from "node:assert/strict";
import test from "node:test";
import { routeFor } from "../src/index.mjs";

test("serves the blog shell from Pages", () => {
  assert.equal(routeFor(new URL("https://vectorcontrol.tech/posts/hello/")).kind, "pages");
});

test("keeps portal data and certificate challenges on hk1", () => {
  assert.equal(routeFor(new URL("https://vectorcontrol.tech/api/portal/summary")).kind, "origin");
  assert.equal(
    routeFor(new URL("https://vectorcontrol.tech/.well-known/acme-challenge/token")).kind,
    "origin",
  );
});

test("retires dead legacy APIs explicitly", () => {
  for (const path of ["/v2/", "/api/v2/redoc", "/api/admin/v2/config", "/wp-json/wp/v2/posts"]) {
    assert.equal(routeFor(new URL("https://vectorcontrol.tech" + path)).kind, "retired");
  }
});

test("does not expose unrelated APIs", () => {
  assert.equal(routeFor(new URL("https://vectorcontrol.tech/api/cloud/usage")).kind, "deny");
});

test("redirects www to the canonical apex", () => {
  const route = routeFor(new URL("https://www.vectorcontrol.tech/posts/example/?src=www"));
  assert.equal(route.kind, "redirect");
  assert.equal(route.url.toString(), "https://vectorcontrol.tech/posts/example/?src=www");
});
