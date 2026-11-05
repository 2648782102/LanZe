const memoryStore = new Map();

const getBrowserStorage = () => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

export const readStore = (key, fallback) => {
  const storage = getBrowserStorage();
  if (!storage) return memoryStore.has(key) ? memoryStore.get(key) : fallback;
  try {
    const raw = storage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

export const writeStore = (key, value) => {
  const storage = getBrowserStorage();
  if (!storage) {
    memoryStore.set(key, value);
    return;
  }
  try {
    storage.setItem(key, JSON.stringify(value));
    memoryStore.set(key, value);
  } catch {
    memoryStore.set(key, value);
  }
};

export const removeStore = (key) => {
  const storage = getBrowserStorage();
  memoryStore.delete(key);
  if (storage) {
    try {
      storage.removeItem(key);
    } catch {
      return;
    }
  }
};
