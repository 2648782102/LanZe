import { computed, ref } from "vue";
import { searchList } from "../apis/api/list.js";
import { demoPoems, normalizePoemList, searchPoems } from "../data/poems.js";
import { readStore, writeStore } from "../services/browserStore.js";
import { normalizeListResponse } from "../utils/response.js";

const SAVED_KEY = "lanze_saved_poems";
const RECENT_KEY = "lanze_recent_poems";

const catalog = ref(normalizePoemList(demoPoems));
const savedPoems = ref(normalizePoemList(readStore(SAVED_KEY, [])));
const recentPoems = ref(normalizePoemList(readStore(RECENT_KEY, [])));
const loading = ref(false);
let loadPromise = null;
let loadedOnce = false;

const persistSaved = () => writeStore(SAVED_KEY, savedPoems.value);
const persistRecent = () => writeStore(RECENT_KEY, recentPoems.value);

export const loadCatalog = async ({ force = false } = {}) => {
  if (loadPromise) return loadPromise;
  if (loadedOnce && !force) return catalog.value;
  loading.value = true;
  if (force) catalog.value = normalizePoemList(demoPoems);
  loadPromise = searchList({ keyword: "" })
    .then((response) => {
      const poems = normalizePoemList(normalizeListResponse(response, demoPoems));
      catalog.value = poems.length ? poems : normalizePoemList(demoPoems);
      loadedOnce = true;
      return catalog.value;
    })
    .catch(() => {
      catalog.value = normalizePoemList(demoPoems);
      loadedOnce = true;
      return catalog.value;
    })
    .finally(() => {
      loading.value = false;
      loadPromise = null;
    });
  return loadPromise;
};

export const useLibrary = () => {
  const savedIds = computed(() => new Set(savedPoems.value.map((poem) => poem.id)));

  const getPoem = (id) =>
    catalog.value.find((poem) => poem.id === id) ||
    savedPoems.value.find((poem) => poem.id === id) ||
    recentPoems.value.find((poem) => poem.id === id) ||
    demoPoems.find((poem) => poem.id === id) ||
    null;

  const isSaved = (id) => savedIds.value.has(id);

  const toggleSaved = (poem) => {
    const normalized = normalizePoemList([poem])[0];
    const index = savedPoems.value.findIndex((item) => item.id === normalized.id);
    if (index >= 0) {
      savedPoems.value = savedPoems.value.filter((item) => item.id !== normalized.id);
    } else {
      savedPoems.value = [normalized, ...savedPoems.value];
    }
    persistSaved();
    return index < 0;
  };

  const recordRecent = (poem) => {
    const normalized = normalizePoemList([poem])[0];
    recentPoems.value = [
      normalized,
      ...recentPoems.value.filter((item) => item.id !== normalized.id),
    ].slice(0, 12);
    persistRecent();
  };

  const queryPoems = (keyword, category = "全部") => {
    const matched = searchPoems(catalog.value, keyword);
    return category === "全部"
      ? matched
      : matched.filter((poem) => poem.category === category);
  };

  return {
    catalog,
    loading,
    savedPoems,
    recentPoems,
    savedIds,
    getPoem,
    isSaved,
    toggleSaved,
    recordRecent,
    queryPoems,
  };
};

export const __testing = {
  SAVED_KEY,
  RECENT_KEY,
};
