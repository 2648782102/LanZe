const COOKIE_MAX_AGE = 86400;

const encode = (value) => encodeURIComponent(value);
const decode = (value) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const parseValue = (value) => {
  const decoded = decode(value);
  if (!decoded) return null;
  if (decoded[0] !== "{" && decoded[0] !== "[") return decoded;
  try {
    return JSON.parse(decoded);
  } catch {
    return decoded;
  }
};

export const sessionCookies = {
  get(key) {
    if (typeof document === "undefined") return null;
    const prefix = `${encode(key)}=`;
    const entry = document.cookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(prefix));
    return entry ? parseValue(entry.slice(prefix.length)) : null;
  },

  set(key, value) {
    if (typeof document === "undefined") return;
    const encoded = typeof value === "string" ? value : JSON.stringify(value);
    document.cookie = `${encode(key)}=${encode(encoded)}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`;
  },

  remove(key) {
    if (typeof document === "undefined") return;
    document.cookie = `${encode(key)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  },
};
