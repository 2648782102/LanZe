import { apiConfig, baseUrl } from "./env.js";
import { failure, isSuccess, normalizePoemPayload } from "../utils/response.js";
import { notify } from "../composables/useNotices.js";
import {
  mockCollectionPoems,
  mockCustomPoems,
  mockDeleteUser,
  mockGetUserProfile,
  mockHuajianjiChapter,
  mockHuajianjiIntro,
  mockLogin,
  mockPoetryClass,
  mockPublishPoem,
  mockRandomExcerpt,
  mockRandomPoem,
  mockRegister,
  mockSearchPoems,
  mockUpdatePassword,
  mockUpdateProfile,
  result,
} from "../services/mockApi.js";
import { hasRemoteApi } from "../config/runtime.js";

let fallbackNoticeShown = false;

const fetchRemote = async (url, { method, data, params, timeout }) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  const target = new URL(`${baseUrl}${url}`);
  for (const [key, value] of Object.entries(params || {})) {
    if (value !== undefined && value !== null) target.searchParams.set(key, String(value));
  }
  try {
    const response = await fetch(target, {
      method: String(method || "get").toUpperCase(),
      headers: data === null || data === undefined ? undefined : { "Content-Type": "application/json" },
      body: data === null || data === undefined ? undefined : JSON.stringify(data),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`远端接口返回 ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
};

const showFallbackNotice = (message) => {
  if (fallbackNoticeShown || typeof document === "undefined") return;
  fallbackNoticeShown = true;
  notify(`${message}，已显示馆内内容`, "warning", 4200);
};

const getMockResponse = (url, method, data, params) => {
  const payload = { ...(params || {}), ...(data || {}) };
  const path = String(url || "").replace(/^\/+/, "");

  if (path === "poetry/random") return mockRandomPoem();
  if (path === "poetry/random-excerpt") return mockRandomExcerpt(payload);
  if (path === "poetry/search") return mockSearchPoems(payload);
  if (path === "poetry/poetry-class") return mockPoetryClass(payload);
  if (path === "poetry/collection") return mockCollectionPoems(payload);
  if (path === "poetry/huajianji-intro") return mockHuajianjiIntro();
  if (path === "poetry/huajianji") return mockHuajianjiChapter(payload.chapter);
  if (path === "poetry/custom") return mockCustomPoems();
  if (path === "user/login") return mockLogin(payload, apiConfig);
  if (path === "user/reg") return mockRegister(payload);
  if (path === "user/update") return mockUpdatePassword(payload);
  if (path === "user/delete") return mockDeleteUser(payload);
  if (path === "user/profile") return mockGetUserProfile(payload.id);
  if (path === "user/profile/update") return mockUpdateProfile(payload);
  if (path === "user/poem/publish") return mockPublishPoem(payload);
  return result(null, 404, "暂时无法完成这次请求");
};

const shouldFallback = (payload) => {
  if (!payload || typeof payload !== "object") return true;
  if (payload.code !== undefined && !isSuccess(payload)) return false;
  if (payload.data === undefined && payload.list === undefined && !Array.isArray(payload)) return true;
  return false;
};

const normalizeRemoteResponse = (payload, url, getFallback) => {
  if (Array.isArray(payload)) return normalizePoemPayload(payload, getFallback());
  if (payload && typeof payload === "object") {
    if (typeof payload.data === "string" && ["ok", "OK"].includes(payload.data)) {
      return { ...payload, code: 200, msg: payload.msg || "ok" };
    }
    if (Array.isArray(payload.data) || payload.list || payload.results) {
      return normalizePoemPayload(payload, getFallback());
    }
    return payload;
  }
  return getFallback();
};

export const request = async (url, method = "get", data = null, params = null) => {
  const useRemote = hasRemoteApi(apiConfig);
  let remoteError = null;
  const getFallback = () => getMockResponse(url, method, data, params);

  if (useRemote) {
    try {
      const response = await fetchRemote(url, {
        method,
        data,
        params,
        timeout: apiConfig.apiTimeout,
      });
      const normalized = normalizeRemoteResponse(response, url, getFallback);
      if (!shouldFallback(normalized)) return normalized;
      showFallbackNotice("在线内容暂时没有回应");
      return getFallback();
    } catch (error) {
      remoteError = error;
    }
  }

  if (remoteError) showFallbackNotice("在线内容暂时无法读取");
  return getFallback();
};

export const requestOrThrow = async (...args) => {
  const payload = await request(...args);
  if (!payload || !isSuccess(payload)) {
    throw new Error(payload?.msg || "请求失败");
  }
  return payload;
};

export const describeError = (error) => failure(error).msg;
