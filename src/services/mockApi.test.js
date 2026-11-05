import test from "node:test";
import assert from "node:assert/strict";
import { demoUser } from "../data/demoUser.js";
import { resetDemoStore } from "./mockApi.js";
import {
  mockDeleteUser,
  mockLogin,
  mockRegister,
  mockSearchPoems,
  mockUpdatePassword,
  normalizeLoginPayload,
  normalizePasswordUpdatePayload,
  normalizeRegistrationPayload,
} from "./mockApi.js";

test("normalizes legacy and modern account field names", () => {
  assert.deepEqual(normalizeLoginPayload({ user: "poet", password: "123456" }), {
    username: "poet",
    password: "123456",
  });
  assert.deepEqual(normalizeRegistrationPayload({ user_name: "poet", password: "123456" }), {
    username: "poet",
    password: "123456",
  });
  assert.deepEqual(
    normalizePasswordUpdatePayload({
      user: "poet",
      passwordOld: "oldpass",
      passwordOk: "newpass",
    }),
    { username: "poet", oldPassword: "oldpass", newPassword: "newpass" },
  );
});

test("supports demo login and rejects wrong password", () => {
  resetDemoStore();
  const ok = mockLogin({ username: demoUser.username, password: demoUser.password }, { demoUser });
  assert.equal(ok.code, 200);
  assert.equal(ok.data.username, demoUser.username);
  const failed = mockLogin({ username: demoUser.username, password: "wrong" }, { demoUser });
  assert.equal(failed.code, 401);
});

test("register, update password, and delete an account locally", () => {
  resetDemoStore();
  const username = "test-poet";
  assert.equal(mockRegister({ user_name: username, password: "firstpass" }).code, 200);
  assert.equal(mockRegister({ user_name: username, password: "firstpass" }).code, 409);
  assert.equal(mockLogin({ username, password: "firstpass" }, { demoUser }).code, 200);
  assert.equal(
    mockUpdatePassword({ user_name: username, passwordOld: "firstpass", passwordNew: "secondpass" }).code,
    200,
  );
  assert.equal(mockLogin({ username, password: "firstpass" }, { demoUser }).code, 401);
  assert.equal(mockLogin({ username, password: "secondpass" }, { demoUser }).code, 200);
  assert.equal(mockDeleteUser({ username, password: "secondpass" }).code, 200);
  assert.equal(mockLogin({ username, password: "secondpass" }, { demoUser }).code, 401);
});

test("search returns normalized poems from local data", () => {
  resetDemoStore();
  const response = mockSearchPoems({ keyword: "李白" });
  assert.equal(response.code, 200);
  assert.ok(response.data.length > 0);
  assert.equal(response.data[0].paragraphs.length > 0, true);
  assert.equal(response.data[0].tags.length > 0, true);
});
