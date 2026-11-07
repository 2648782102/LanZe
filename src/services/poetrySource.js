import { demoExcerpts } from "../data/poems.js";
import { poetrySourceConfig, normalizeExcerpt } from "../config/poetrySource.js";

const makeLocalExcerpt = (index) => {
  const source = demoExcerpts[Math.abs(index) % demoExcerpts.length];
  return {
    ...source,
    id: `excerpt-${source.content}`,
  };
};

const fetchRemoteExcerpt = async ({ signal, index }) => {
  const response = await fetch(poetrySourceConfig.requestUrl(index), {
    signal,
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`诗句源返回 ${response.status}`);
  const payload = await response.json();
  const excerpt = normalizeExcerpt(payload);
  if (!excerpt) throw new Error("诗句源未返回有效诗句");
  return excerpt;
};

export const loadExcerptFromSource = async ({ index = 0, previousContent = "" } = {}) => {
  const local = makeLocalExcerpt(index);
  if (!poetrySourceConfig.enabled || typeof fetch !== "function") {
    return { excerpt: local, source: "local", reason: "disabled" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), poetrySourceConfig.timeout);
  try {
    const excerpt = await fetchRemoteExcerpt({ signal: controller.signal, index });
    if (excerpt.content === previousContent) {
      return { excerpt: local, source: "local", reason: "duplicate" };
    }
    return { excerpt, source: "remote" };
  } catch (error) {
    return {
      excerpt: local,
      source: "local",
      reason: error?.name === "AbortError" ? "timeout" : "unavailable",
    };
  } finally {
    clearTimeout(timer);
  }
};

export { makeLocalExcerpt };
