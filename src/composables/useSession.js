import { computed, getCurrentInstance, inject, ref } from "vue";
import VueCookies from "vue-cookies";
import { getDemoProfile, mockUpdateProfile } from "../services/mockApi.js";

export const SESSION_KEY = "$cookies";
const fallbackCookies = VueCookies;
const sessionVersion = ref(0);

const getCookies = () => {
  const instance = getCurrentInstance();
  return (
    instance?.proxy?.$cookies ||
    inject(SESSION_KEY, null) ||
    fallbackCookies
  );
};

const readCookie = (key) => {
  try {
    return getCookies().get(key);
  } catch {
    return null;
  }
};

const writeCookie = (key, value) => {
  try {
    const cookies = getCookies();
    cookies.config("1d");
    cookies.set(key, value);
    sessionVersion.value += 1;
  } catch {
    return;
  }
};

const removeCookie = (key) => {
  try {
    getCookies().remove(key);
    sessionVersion.value += 1;
  } catch {
    return;
  }
};

const normalizeUser = (value) => {
  if (!value) return null;
  if (typeof value === "object") {
    const username = value.username || value.user_name || value.user || "";
    return {
      id: value.id || `local-${username || "guest"}`,
      username,
      user: username,
      user_name: value.user_name || username,
      ...value,
    };
  }
  const username = String(value);
  return {
    id: `local-${username}`,
    username,
    user: username,
    user_name: username,
  };
};

const normalizeProfile = (value, user) => {
  const current = value && typeof value === "object" ? value : {};
  return {
    ...getDemoProfile(),
    ...current,
    id: current.id || user?.id || getDemoProfile().id,
    username: current.username || user?.username || getDemoProfile().username,
    user_name: current.user_name || user?.user_name || user?.username || getDemoProfile().user_name,
  };
};

export const useSession = () => {
  const user = computed(() => {
    sessionVersion.value;
    return normalizeUser(readCookie("lanze_user"));
  });
  const profile = computed(() => {
    sessionVersion.value;
    return normalizeProfile(readCookie("lanze_upload"), user.value);
  });
  const isLoggedIn = computed(() => Boolean(user.value));

  const setSession = (payload) => {
    const normalized = normalizeUser(payload?.user || payload?.data || payload);
    if (!normalized) return null;
    writeCookie("lanze_user", normalized);
    const uploaded = {
      ...getDemoProfile(),
      ...(payload?.profile || payload?.upload || {}),
      ...normalized,
      id: normalized.id,
      username: normalized.username,
      user_name: normalized.user_name || normalized.username,
    };
    writeCookie("lanze_upload", uploaded);
    return normalized;
  };

  const updateProfile = (payload) => {
    const current = profile.value;
    const updated = {
      ...current,
      ...payload,
      id: current.id,
      user_name: payload.user_name || payload.name || current.user_name,
      intro: payload.intro || current.intro,
      head_img: payload.head_img || current.head_img,
    };
    mockUpdateProfile(updated);
    writeCookie("lanze_upload", updated);
    return updated;
  };

  const clearSession = () => {
    removeCookie("lanze_user");
    removeCookie("lanze_upload");
  };

  return {
    user,
    profile,
    isLoggedIn,
    setSession,
    updateProfile,
    clearSession,
  };
};

export const useCookies = () => getCookies();
