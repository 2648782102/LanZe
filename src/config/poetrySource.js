import { POETRY_SOURCE_URL, buildPoetrySourceRequest } from "./poetrySource.constants.js";

const trimTrailingSlash = (value) => String(value || "").trim().replace(/\/+$/, "");

export const createPoetrySourceConfig = (env = {}) => {
  const url = trimTrailingSlash(env.VITE_POETRY_SOURCE_URL) || POETRY_SOURCE_URL;
  return {
    enabled: ["1", "true", "on", "yes", "remote", "jinrishici"].includes(
      String(env.VITE_POETRY_SOURCE ?? "local").toLowerCase(),
    ),
    url,
    timeout: Number(env.VITE_POETRY_SOURCE_TIMEOUT) > 0 ? Number(env.VITE_POETRY_SOURCE_TIMEOUT) : 4000,
    requestUrl: (index = 0) => buildPoetrySourceRequest(url, index),
  };
};

export const poetrySourceConfig = createPoetrySourceConfig(
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env
    : {},
);

export const normalizeExcerpt = (payload = {}) => {
  const source = payload?.data && typeof payload.data === "object" ? payload.data : payload;
  const content = String(source?.content || source?.paragraph || "").trim();
  if (!content) return null;
  const author = String(source?.author || "佚名").trim();
  const origin = String(source?.origin || source?.title || "无题").trim();
  const category = String(source?.category || "摘录").replace(/^古诗文[-·]?/, "").trim() || "摘录";
  return {
    id: `excerpt-${content}`,
    content,
    author,
    origin,
    category,
  };
};

export { POETRY_SOURCE_URL, buildPoetrySourceRequest };
