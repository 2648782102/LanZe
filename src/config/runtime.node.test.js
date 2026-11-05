import test from "node:test";
import assert from "node:assert/strict";
import { createRuntimeConfig, hasRemoteApi, hasSupabase } from "./runtime.node.js";

test("uses mock data when no API base URL is configured", () => {
  const config = createRuntimeConfig({});
  assert.equal(config.apiBaseUrl, "");
  assert.equal(config.useMock, true);
  assert.equal(hasRemoteApi(config), false);
  assert.equal(hasSupabase(config), false);
});

test("prefers a configured real API and normalizes its base URL", () => {
  const config = createRuntimeConfig({
    VITE_API_BASE_URL: "https://api.example.test/v1",
    VITE_USE_MOCK: "false",
    VITE_API_TIMEOUT: "8000",
  });
  assert.equal(config.apiBaseUrl, "https://api.example.test/v1/");
  assert.equal(config.apiTimeout, 8000);
  assert.equal(hasRemoteApi(config), true);
});

test("requires both Supabase URL and key", () => {
  const incomplete = createRuntimeConfig({ VITE_SUPABASE_URL: "https://example.test" });
  const complete = createRuntimeConfig({
    VITE_SUPABASE_URL: "https://example.test",
    VITE_SUPABASE_ANON_KEY: "anonymous-key",
  });
  assert.equal(hasSupabase(incomplete), false);
  assert.equal(hasSupabase(complete), true);
});
