import { demoExcerpts } from "../data/poems.js";
import { getLibraryExcerpt } from "../data/poetryCatalog.js";
import { poetrySourceConfig, normalizeExcerpt } from "../config/poetrySource.js";

const makeLocalExcerpt = (index) => {
  const useLibrary = Math.abs(index) % 2 === 1;
  const source = useLibrary
    ? getLibraryExcerpt(Math.floor(Math.abs(index) / 2))
    : demoExcerpts[Math.abs(index) % demoExcerpts.length];
  return {
    ...source,
    id: `excerpt-${source.content || source.origin}`,
  };
};

const fetchRemoteExcerpt = async ({ signal, index, config }) => {
  const response = await fetch(config.requestUrl(index), {
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

export const loadExcerptFromSource = async ({ index = 0, previousContent = "", config = poetrySourceConfig } = {}) => {
  const local = makeLocalExcerpt(index);
  if (!config.enabled || typeof fetch !== "function") {
    return { excerpt: local, source: "local", reason: "disabled" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeout);
  try {
    const excerpt = await fetchRemoteExcerpt({ signal: controller.signal, index, config });
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
