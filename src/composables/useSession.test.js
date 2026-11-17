import test from "node:test";
import assert from "node:assert/strict";
// 先让 Vue 在「没有 document」的环境完成初始化：@vue/runtime-dom 在模块加载时
// 会探测 document，如果此时已经装了假 cookie jar 就会走浏览器分支并报错。
import "vue";

/*
 * useSession 依赖 document.cookie（由 sessionCookies 封装）。
 * node:test 里没有 DOM，这里装一个最小 cookie jar：只实现 set/get/删除，
 * 语义与 sessionCookies 用到的部分一致（encode 后的键值、expires 过去时间即删除）。
 */
const installCookieJar = () => {
  const jar = new Map();
  const previous = globalThis.document;
  globalThis.document = {
    get cookie() {
      return [...jar.entries()].map(([key, value]) => `${key}=${value}`).join("; ");
    },
    set cookie(raw) {
      const [pair, ...attributes] = String(raw).split(";");
      const splitAt = pair.indexOf("=");
      const key = pair.slice(0, splitAt).trim();
      const value = pair.slice(splitAt + 1).trim();
      const expired = attributes.some((attribute) =>
        /expires=Thu, 01 Jan 1970/i.test(attribute.trim()));
      if (expired) jar.delete(key);
      else jar.set(key, value);
    },
  };
  return {
    raw: jar,
    restore() {
      if (previous === undefined) delete globalThis.document;
      else globalThis.document = previous;
    },
  };
};

const withSession = async (fn) => {
  const jar = installCookieJar();
  try {
    const session = await import("./useSession.js");
    await fn(session.useSession(), jar);
  } finally {
    jar.restore();
  }
};

test("未登录时回落到演示资料，且 isLoggedIn 为 false", async () => {
  await withSession(async (session) => {
    assert.equal(session.isLoggedIn.value, false);
    assert.equal(session.user.value, null);
    assert.equal(typeof session.profile.value.username, "string");
    assert.notEqual(session.profile.value.username, "");
  });
});

test("setSession 接受字符串账号并同步写入用户与资料 cookie", async () => {
  await withSession(async (session, jar) => {
    const normalized = session.setSession("lanze-reader");
    assert.equal(normalized.username, "lanze-reader");
    assert.equal(session.isLoggedIn.value, true);
    assert.equal(session.user.value.username, "lanze-reader");
    assert.equal(session.user.value.id, "local-lanze-reader");
    // 用户名要同时写进 profile，避免资料卡与登录态不一致
    assert.equal(session.profile.value.username, "lanze-reader");
    assert.equal(session.profile.value.user_name, "lanze-reader");
    assert.ok([...jar.raw.keys()].some((key) => key.includes("lanze_user")));
    assert.ok([...jar.raw.keys()].some((key) => key.includes("lanze_upload")));
  });
});

test("setSession 接受对象负载并从 user/data 字段取账号", async () => {
  await withSession(async (session) => {
    const fromData = session.setSession({ data: { user_name: "zhi-yu" } });
    assert.equal(fromData.username, "zhi-yu");
    const fromUser = session.setSession({ user: { username: "ting-feng", id: "u-42" } });
    assert.equal(fromUser.id, "u-42");
    assert.equal(session.user.value.id, "u-42");
  });
});

test("updateProfile 保留 id 并在缺省时沿用旧字段", async () => {
  await withSession(async (session) => {
    session.setSession("lanze-reader");
    const before = session.profile.value;
    const updated = session.updateProfile({ name: "兰泽读者", intro: "在读王维" });
    assert.equal(updated.id, before.id);
    assert.equal(updated.user_name, "兰泽读者");
    assert.equal(updated.intro, "在读王维");
    // 未提供的字段沿用旧值，不能因为局部更新被清空
    assert.equal(updated.head_img, before.head_img);
    assert.equal(session.profile.value.intro, "在读王维");
  });
});

test("clearSession 清空登录态与资料", async () => {
  await withSession(async (session, jar) => {
    session.setSession("lanze-reader");
    assert.equal(session.isLoggedIn.value, true);
    session.clearSession();
    assert.equal(session.isLoggedIn.value, false);
    assert.equal(session.user.value, null);
    assert.equal(jar.raw.size, 0);
  });
});
