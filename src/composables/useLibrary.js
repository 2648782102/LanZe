import { computed, ref } from "vue";
import { demoPoems, normalizePoemList } from "../data/poems.js";
import {
  getLibraryPage,
  getLibraryPoem,
  getRelatedLibraryPoems,
  loadPoetryCatalog,
  poetryFacets,
  poetryStats,
} from "../data/poetryCatalog.js";
import { readStore, writeStore } from "../services/browserStore.js";

const SAVED_KEY = "lanze_saved_poems";
const RECENT_KEY = "lanze_recent_poems";

const catalog = ref(getLibraryPage({ page: 1, pageSize: 24 }).items);
const catalogError = ref("");
const catalogVersion = ref(0);
let catalogGeneration = 0;
const savedPoems = ref(normalizePoemList(readStore(SAVED_KEY, [])));
const recentPoems = ref(normalizePoemList(readStore(RECENT_KEY, [])));
const loading = ref(false);

const persistSaved = () => writeStore(SAVED_KEY, savedPoems.value);
const persistRecent = () => writeStore(RECENT_KEY, recentPoems.value);

export const loadCatalog = async ({ force = false } = {}) => {
  loading.value = true;
  catalogError.value = "";
  const generation = ++catalogGeneration;
  try {
    await loadPoetryCatalog({ force });
    if (generation !== catalogGeneration) return catalog.value;
    catalog.value = getLibraryPage({ page: 1, pageSize: 24 }).items;
    catalogVersion.value += 1;
  } catch {
    if (generation !== catalogGeneration) return catalog.value;
    catalogError.value = "馆藏分卷暂时无法读取，当前只显示精校短章。可刷新页面重试。";
    catalog.value = getLibraryPage({ page: 1, pageSize: 24 }).items;
    catalogVersion.value += 1;
  } finally {
    if (generation === catalogGeneration) loading.value = false;
  }
  return catalog.value;
};

export const queryCatalog = ({
  keyword = "",
  dynasty = "全部",
  genre = "全部",
  page = 1,
  pageSize = 24,
} = {}) => {
  const result = getLibraryPage({ keyword, dynasty, genre, page, pageSize });
  const works = normalizePoemList(readStore("lanze_demo_works", []));
  if (keyword.trim()) {
    const normalizedKeyword = keyword.trim().toLowerCase();
    const matchingWorks = works.filter((poem) =>
      [poem.title, poem.author, poem.content, ...(poem.tags || [])].join(" ").toLowerCase().includes(normalizedKeyword),
    );
    if (matchingWorks.length && result.page === 1) {
      result.items = [...matchingWorks, ...result.items].slice(0, result.pageSize);
    }
  }
  return result;
};

export const getLibraryStats = () => poetryStats;
export const getLibraryFacets = () => poetryFacets;
export const useCatalogVersion = () => catalogVersion;
export const useCatalogError = () => catalogError;

export const getLibraryRecord = (id) =>
  getLibraryPoem(id) ||
  savedPoems.value.find((poem) => poem.id === id) ||
  recentPoems.value.find((poem) => poem.id === id) ||
  normalizePoemList(readStore("lanze_demo_works", [])).find((poem) => poem.id === id) ||
  demoPoems.find((poem) => poem.id === id) ||
  null;

export const relatedLibraryPoems = (poem, limit = 3) => {
  if (poem?.curated || poem?.type === "customgushici") {
    return getLibraryPage({ genre: poem.category, page: 1, pageSize: limit + 1 }).items
      .filter((item) => item.id !== poem.id)
      .slice(0, limit);
  }
  return getRelatedLibraryPoems(poem, limit);
};

export const useLibrary = () => {
  const savedIds = computed(() => new Set(savedPoems.value.map((poem) => poem.id)));

  const getPoem = (id) =>
    getLibraryRecord(id) ||
    savedPoems.value.find((poem) => poem.id === id) ||
    recentPoems.value.find((poem) => poem.id === id) ||
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

  const queryPoems = (keyword, category = "全部", page = 1, pageSize = 24) =>
    queryCatalog({ keyword, genre: category, page, pageSize });

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
    queryCatalog,
    getLibraryStats,
    getLibraryFacets,
    relatedLibraryPoems,
    catalogError,
  };
};

export const __testing = {
  SAVED_KEY,
  RECENT_KEY,
};
