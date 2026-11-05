import test from "node:test";
import assert from "node:assert/strict";
import { demoUser } from "../data/demoUser.js";
import { demoExcerpts } from "../data/poems.js";
import {
  getMockData,
  mockDeleteUser,
  mockLogin,
  mockPoetryClass,
  mockPublishPoem,
  mockRandomExcerpt,
  mockRegister,
  mockSearchPoems,
  mockUpdatePassword,
  normalizeLoginPayload,
  normalizePasswordUpdatePayload,
  normalizeRegistrationPayload,
  resetDemoStore,
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

test("random excerpt supports deterministic indexes, bounds and omitted params", () => {
  const first = mockRandomExcerpt({ index: 0 }, () => 0.99);
  const wrapped = mockRandomExcerpt({ index: demoExcerpts.length }, () => 0.99);
  const invalid = mockRandomExcerpt({ index: -1 }, () => 0.51);
  const missing = mockRandomExcerpt({}, () => 0.51);

  assert.equal(first.data.content, demoExcerpts[0].content);
  assert.equal(wrapped.data.content, demoExcerpts[0].content);
  assert.equal(invalid.data.content, demoExcerpts[3].content);
  assert.equal(missing.data.content, demoExcerpts[3].content);
});

test("poetry class returns matching poems and falls back for unknown classes", () => {
  resetDemoStore();
  const matched = mockPoetryClass({ type: "tangshi300" });
  const unknown = mockPoetryClass({ type: "not-a-poetry-class" });
  const all = mockPoetryClass({ type: "" });

  assert.equal(matched.code, 200);
  assert.ok(matched.data.length > 0);
  assert.ok(matched.data.every((poem) => poem.type === "tangshi300"));
  assert.equal(unknown.data.length, all.data.length);
  assert.deepEqual(unknown.data, all.data);
  assert.ok(unknown.data.length > matched.data.length);
});

test("search normalizes whitespace and includes a newly published work once", () => {
  resetDemoStore();
  const uniqueTitle = `边界测试作品-${Date.now()}`;
  try {
    assert.equal(
      mockPublishPoem({ title: uniqueTitle, content: "窗前一盏灯，照亮旧诗行。" }).code,
      200,
    );
    const response = mockSearchPoems({ keyword: `  ${uniqueTitle}  ` });
    const matches = response.data.filter((poem) => poem.title === uniqueTitle);
    assert.equal(matches.length, 1);
    assert.ok(matches[0].id);
  } finally {
    resetDemoStore();
  }
});

test("search trims empty queries and ignores ASCII case", () => {
  resetDemoStore();
  const all = mockSearchPoems({ keyword: "" }).data;
  const whitespace = mockSearchPoems({ keyword: "   " }).data;
  assert.ok(all.length > 0);
  assert.equal(whitespace.length, all.length);

  assert.equal(
    mockPublishPoem({ title: "CaseStudy Poem", content: "A small regression poem." }).code,
    200,
  );
  const response = mockSearchPoems({ keyword: "  casestudy  " });
  assert.equal(response.data.length, 1);
  assert.equal(response.data[0].title, "CaseStudy Poem");
  resetDemoStore();
});

test("combined mock data keeps each published work only once", () => {
  resetDemoStore();
  const work = mockPublishPoem({ title: "去重验证作品", content: "一灯如豆，照见旧诗。" }).data;
  const matches = getMockData().filter((poem) => poem.id === work.id);
  assert.equal(matches.length, 1);
  assert.equal(matches[0].title, work.title);
  resetDemoStore();
});
