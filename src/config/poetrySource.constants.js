export const POETRY_SOURCE_URL = "https://v1.jinrishici.com/all.json";

export const buildPoetrySourceRequest = (url = POETRY_SOURCE_URL, index = 0) => {
  const separator = String(url).includes("?") ? "&" : "?";
  return `${url}${separator}t=${encodeURIComponent(`${Date.now()}-${index}`)}`;
};
