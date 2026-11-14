import { demoUser } from "../data/demoUser.js";

const readFlag = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  return !["0", "false", "off", "no"].includes(String(value).toLowerCase());
};

const normalizeBase = (value) => {
  if (!value || typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.endsWith("/") ? trimmed : `${trimmed}/`;
};

export const createRuntimeConfig = (env = {}) => ({
  apiBaseUrl: normalizeBase(env.VITE_API_BASE_URL),
  apiTimeout: Number(env.VITE_API_TIMEOUT) > 0 ? Number(env.VITE_API_TIMEOUT) : 4000,
  useMock: readFlag(env.VITE_USE_MOCK, !normalizeBase(env.VITE_API_BASE_URL)),
  demoUser,
});

export const runtimeConfig = createRuntimeConfig(
  typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : {},
);

export const hasRemoteApi = (config = runtimeConfig) => Boolean(config.apiBaseUrl) && !config.useMock;

export { demoUser };
