import {
  demoPoems,
  demoExcerpts,
  normalizePoem,
  normalizePoemList,
  searchPoems,
  getPoemsByClass,
  getRandomExcerpt as pickRandomExcerpt,
} from "../data/poems.js";
import { demoUser } from "../data/demoUser.js";
import { getLibraryPage, getLibraryPoem, getRelatedLibraryPoems, poetryStats } from "../data/poetryCatalog.js";
import { readStore, writeStore, removeStore } from "./browserStore.js";

const USERS_KEY = "lanze_demo_users";
const WORKS_KEY = "lanze_demo_works";
const PROFILE_KEY = "lanze_demo_profile";

const makeId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `demo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

export const result = (data, code = 200, msg = "ok", meta = {}) => ({ code, msg, data, ...meta });

const getAccountField = (data = {}, ...keys) => {
  for (const key of keys) {
    if (data[key] !== undefined && data[key] !== null && data[key] !== "") return String(data[key]);
  }
  return "";
};

const getPasswordField = (data = {}, ...keys) => {
  for (const key of keys) {
    if (data[key] !== undefined && data[key] !== null && data[key] !== "") return String(data[key]);
  }
  return "";
};

const getUsers = () => {
  const users = readStore(USERS_KEY, null);
  if (Array.isArray(users)) return users;
  const defaults = [demoUser];
  writeStore(USERS_KEY, defaults);
  return defaults;
};

const saveUsers = (users) => {
  writeStore(USERS_KEY, users);
  return users;
};

const publicUser = (user) => ({
  id: user.id,
  username: user.username,
  user_name: user.user_name || user.username,
  head_img: user.head_img || "hoad1.jpg",
  intro: user.intro || "还没有写下简介。",
});

const getWorks = () => {
  const works = readStore(WORKS_KEY, null);
  if (Array.isArray(works)) return works;
  const defaults = demoPoems
    .filter((poem) => poem.type === "customgushici")
    .map(normalizePoem);
  writeStore(WORKS_KEY, defaults);
  return defaults;
};

const saveWorks = (works) => {
  writeStore(WORKS_KEY, works);
  return works;
};

export const getDemoProfile = () =>
  readStore(PROFILE_KEY, {
    id: demoUser.id,
    username: demoUser.username,
    user_name: demoUser.user_name,
    head_img: demoUser.head_img,
    intro: demoUser.intro,
  });

export const normalizeLoginPayload = (payload = {}) => ({
  username: getAccountField(payload, "username", "user_name", "user", "account"),
  password: getPasswordField(payload, "password", "passwordNew"),
});

export const normalizeRegistrationPayload = (payload = {}) => ({
  username: getAccountField(payload, "username", "user_name", "user", "account"),
  password: getPasswordField(payload, "password"),
});

export const normalizePasswordUpdatePayload = (payload = {}) => ({
  username: getAccountField(payload, "username", "user_name", "user", "account"),
  oldPassword: getPasswordField(payload, "passwordOld", "oldPassword", "password"),
  newPassword: getPasswordField(payload, "passwordNew", "newPassword", "passwordOk"),
});

export const isSuccessCode = (code) => Number(code) === 200 || Number(code) === 0;

export const resetDemoStore = () => {
  removeStore(USERS_KEY);
  removeStore(WORKS_KEY);
  removeStore(PROFILE_KEY);
};

export const mockGetUsers = () => getUsers();

export const mockFindUser = (username) =>
  getUsers().find((item) => item.username === String(username || ""));

export const mockDeleteAccount = (username) => {
  const users = getUsers();
  const remaining = users.filter((item) => item.username !== String(username || ""));
  saveUsers(remaining);
  return remaining;
};

export const mockSetPassword = (username, password) => {
  const users = getUsers();
  const index = users.findIndex((item) => item.username === String(username || ""));
  if (index < 0) return false;
  users[index] = { ...users[index], password: String(password || "") };
  saveUsers(users);
  return true;
};

export const getMockData = (items = demoPoems) =>
  [...(Array.isArray(items) ? items : demoPoems), ...getWorks()]
    .map(normalizePoem)
    .filter((poem, index, all) => all.findIndex((item) => item.id === poem.id) === index);

export const mockRandomPoem = (random = Math.random) => {
  const value = random();
  const page = Number.isFinite(value)
    ? getLibraryPage({ page: Math.floor(value * (poetryStats.total - 1)) + 1, pageSize: 1 })
    : getLibraryPage({ page: 1, pageSize: 1 });
  return result(page.items[0] || normalizePoem(demoPoems[0]));
};

export const mockRandomExcerpt = (params = {}, random = Math.random) => {
  const index = Number(params?.index);
  const excerpt =
    Number.isInteger(index) && index >= 0
      ? demoExcerpts[index % demoExcerpts.length]
      : pickRandomExcerpt(demoExcerpts, random);
  return result(excerpt);
};

export const mockSearchPoems = (params = {}) => {
  const keyword = params.keyword ?? params.q ?? params.search ?? "";
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 24;
  const dynasty = params.dynasty || "全部";
  const genre = params.genre || params.category || "全部";
  if (Number(pageSize) > 60 || Number(pageSize) < 1) return result(searchPoems(getMockData(), keyword));
  const matched = getLibraryPage({ keyword, dynasty, genre, page, pageSize });
  const works = getWorks().map(normalizePoem);
  if (keyword) {
    const matchingWorks = searchPoems(works, keyword);
    if (matchingWorks.length && page === 1) matched.items = [...matchingWorks, ...matched.items].slice(0, pageSize);
  }
  return result(matched.items, 200, "ok", {
    pageCount: matched.totalPages,
    total: matched.total,
    page: matched.page,
    pageSize: matched.pageSize,
  });
};

export const mockLibraryStats = () => result(poetryStats);

export const mockLibraryPoem = (params = {}) => result(getLibraryPoem(params.id));

export const mockRelatedPoems = (params = {}) =>
  result(getRelatedLibraryPoems(getLibraryPoem(params.id), Number(params.limit) || 3));

export const mockPoetryClass = (params = {}) => {
  const type = params.type ?? params.class ?? params.category ?? "";
  const genreMap = {
    tangshi300: "唐诗",
    songci300: "宋词",
    shijing: "诗经",
    chuci: "楚辞",
    caocao: "建安诗",
    huajianji: "花间词",
    nantang: "南唐词",
    yuanqu: "元曲",
  };
  const genre = genreMap[type] || (type ? type : "全部");
  const page = getLibraryPage({ genre, page: 1, pageSize: 60 });
  return result(page.items.length ? page.items : getMockData());
};

export const mockHuajianjiIntro = () =>
  result({
    title: "花间集",
    author: "赵崇祚",
    tags: JSON.stringify(["词集", "后蜀"]),
    paragraphs: JSON.stringify([
      "《花间集》是中国文学史上最早的词总集之一。",
      "收录晚唐至五代十八家词作，以婉约清丽见长。",
    ]),
  });

export const mockHuajianjiChapter = (chapter = 0) => {
  const poems = getPoemsByClass(getMockData(), "huajianji");
  const start = Number(chapter) * 50;
  const chapterPoems = poems.length ? poems : getMockData().slice(0, 3);
  return result(chapterPoems.slice(start, start + 50));
};

export const mockGetUserProfile = (id) =>
  result(publicUser({ ...getDemoProfile(), id: id || getDemoProfile().id }));

export const mockLogin = (payload = {}, config = {}) => {
  const { username, password } = normalizeLoginPayload(payload);
  const users = getUsers();
  const demo = config.demoUser || {};
  const user =
    users.find((item) => item.username === username) ||
    (username === demo.username && password === demo.password
      ? { ...demo, id: demo.id || "demo-user-001" }
      : null);

  if (!user || user.password !== password) {
    return result(null, 401, "账号或密码不正确，可试用体验账号");
  }
  const profile = publicUser(user);
  writeStore(PROFILE_KEY, profile);
  return result({ ...profile, user: username }, 200, "登录成功");
};

export const mockRegister = (payload = {}) => {
  const { username, password } = normalizeRegistrationPayload(payload);
  if (!username || !password) return result(null, 400, "账号或密码不能为空");
  const users = getUsers();
  if (users.some((item) => item.username === username)) {
    return result(null, 409, "账号已存在，请直接登录");
  }
  const user = {
    id: makeId(),
    username,
    password,
    user_name: username,
    head_img: "hoad1.jpg",
    intro: "还没有写下简介。",
  };
  saveUsers([...users, user]);
  return result(publicUser(user), 200, "注册成功");
};

export const mockUpdatePassword = (payload = {}) => {
  const { username, oldPassword, newPassword } = normalizePasswordUpdatePayload(payload);
  const users = getUsers();
  const index = users.findIndex(
    (item) => item.username === username && item.password === oldPassword,
  );
  if (index < 0) return result(null, 401, "原账号或原密码不正确");
  users[index] = { ...users[index], password: newPassword };
  saveUsers(users);
  return result(null, 200, "密码修改成功");
};

export const mockDeleteUser = (payload = {}) => {
  const { username, password } = normalizeLoginPayload(payload);
  const users = getUsers();
  const user = users.find((item) => item.username === username);
  if (!user || user.password !== password) return result(null, 401, "账号或密码错误");
  saveUsers(users.filter((item) => item.username !== username));
  return result(null, 200, "注销成功");
};

export const mockUpdateProfile = (payload = {}) => {
  const profile = {
    ...getDemoProfile(),
    user_name: payload.user_name || payload.name || getDemoProfile().user_name,
    head_img: payload.head_img || getDemoProfile().head_img,
    intro: payload.intro || getDemoProfile().intro,
    id: payload.id || getDemoProfile().id,
  };
  writeStore(PROFILE_KEY, profile);
  return result(publicUser(profile));
};

export const mockPublishPoem = (payload = {}) => {
  const title = payload.origin || payload.title || payload.poemName || "无题";
  const author = payload.author || getDemoProfile().user_name || "佚名";
  const category = payload.category || "用户作品";
  const paragraphs = String(payload.content || "")
    .split(/[\n，。；;]/)
    .map((line) => line.trim())
    .filter(Boolean);
  const work = normalizePoem({
    id: makeId(),
    title,
    author,
    category,
    paragraph: paragraphs[0] || "",
    paragraphs: paragraphs.length ? paragraphs : [payload.content || ""],
    tags: [category, "用户作品"],
    textBody: payload.content || "",
    titleNote: payload.title || "",
    type: "customgushici",
  });
  saveWorks([work, ...getWorks()]);
  return result(work, 200, "发布成功");
};

export const mockCustomPoems = () => result(getWorks().map(normalizePoem));

export const mockCollectionPoems = (params = {}) => {
  const address = params.address ?? params.type ?? params.class ?? "";
  const matched = getPoemsByClass(getMockData(), address);
  return result(matched.length ? matched : normalizePoemList(getMockData()));
};
