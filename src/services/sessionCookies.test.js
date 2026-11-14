import test from "node:test";
import assert from "node:assert/strict";
import { sessionCookies } from "./sessionCookies.js";

const withDocumentCookie = (value, run) => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { cookie: value },
  });
  try {
    run();
  } finally {
    if (original) Object.defineProperty(globalThis, "document", original);
    else delete globalThis.document;
  }
};

test("parses JSON cookie values written by the session adapter", () => {
  withDocumentCookie("", () => {
    sessionCookies.set("lanze_user", { id: "local-demo", username: "demo" });
    assert.equal(document.cookie.includes("max-age=86400"), true);
    assert.deepEqual(sessionCookies.get("lanze_user"), { id: "local-demo", username: "demo" });
  });
});

test("reads legacy plain cookie values and removes cookies", () => {
  withDocumentCookie("lanze_user=demo; other=1", () => {
    assert.equal(sessionCookies.get("lanze_user"), "demo");
    sessionCookies.remove("lanze_user");
    assert.equal(document.cookie.includes("expires=Thu, 01 Jan 1970"), true);
  });
});

test("returns null for missing or malformed cookies", () => {
  withDocumentCookie("other=1", () => {
    assert.equal(sessionCookies.get("lanze_user"), null);
  });
  withDocumentCookie("lanze_user=%E0%A4%A", () => {
    assert.equal(typeof sessionCookies.get("lanze_user"), "string");
  });
});
