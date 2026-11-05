import { normalizePoemList } from "../data/poems.js";

export const success = (data, msg = "ok") => ({ code: 200, msg, data });

export const failure = (error, fallback = "网络出现异常，请稍后重试") => {
  const message =
    error?.response?.data?.msg ||
    error?.response?.data?.message ||
    error?.message ||
    fallback;
  return { code: error?.response?.status || 500, msg: message, data: null };
};

export const normalizeListResponse = (payload, fallback = []) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.list)) return payload.list;
  if (Array.isArray(payload?.results)) return payload.results;
  return fallback;
};

export const normalizePoemPayload = (payload, fallback = []) => {
  const list = normalizeListResponse(payload, fallback);
  return {
    ...(payload && typeof payload === "object" ? payload : {}),
    code: payload?.code ?? 200,
    data: normalizePoemList(list),
    list: normalizePoemList(list),
  };
};

export const isSuccess = (payload) => {
  const code = Number(payload?.code ?? payload?.status ?? 200);
  return code === 200 || code === 0 || code === 201;
};
