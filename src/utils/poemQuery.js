export const getQueryText = (value) =>
  Array.isArray(value) ? String(value[0] ?? "") : String(value ?? "");

export const parseJsonArray = (value, fallback = []) => {
  const text = getQueryText(value);
  if (!text) return fallback;
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

export const parseJsonObject = (value, fallback = null) => {
  const text = getQueryText(value);
  if (!text) return fallback;
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

export const parseStringArray = (value, fallback = []) => {
  if (Array.isArray(value)) {
    const first = value[0];
    const looksLikeQueryString =
      typeof first === "string" &&
      (first.trim().startsWith("[") || /[\n，,]/.test(first));
    if (looksLikeQueryString) return parseStringArray(first, fallback);
    return value.map((item) => String(item));
  }
  const source = getQueryText(value);
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = parseJsonArray(source, null);
  if (parsed) return parsed.map((item) => String(item));
  return String(source)
    .split(/[\n，,]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

export const parseTags = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item));
  const parsed = parseJsonArray(value, null);
  if (parsed) return parsed.map((item) => String(item));
  if (value === undefined || value === null || value === "") return [];
  return [String(value)];
};

export const paginate = (items, pageSize = 10) => {
  const list = Array.isArray(items) ? [...items] : [];
  const size = Number(pageSize) > 0 ? Number(pageSize) : 10;
  const pages = [];
  for (let index = 0; index < list.length; index += size) {
    pages.push(list.slice(index, index + size));
  }
  return pages;
};

export const normalizeDetails = (source = {}) => ({
  title: source.title || source.poemName || source.origin || source.name || "无题",
  author: source.author || "佚名",
  tags: parseTags(source.tags),
  paragraphs: parseStringArray(
    source.paragraphs ?? source.content ?? source.textBody,
    [],
  ),
  annotation: parseStringArray(source.titleNote ?? source.annotation, []),
});
