/*
 * 诗词索引的「查询状态机」：URL 是唯一事实来源，组件状态只是它的镜像。
 * 这里刻意不碰 DOM、不引用任何视图选择器，因此可以被别的列表页复用，
 * 也能脱离浏览器环境做单元测试。
 */
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  getLibraryFacets,
  getLibraryStats,
  queryCatalog,
  useCatalogVersion,
} from "./useLibrary.js";

export const EXPLORE_PAGE_SIZE = 24;

const pageWindowFor = (page, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const pages = new Set([1, total, page, page - 1, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((entry) => pages.add(entry));
  if (page >= total - 2) [total - 3, total - 2, total - 1].forEach((entry) => pages.add(entry));
  const sorted = [...pages].filter((entry) => entry >= 1 && entry <= total).sort((a, b) => a - b);
  return sorted.reduce((list, entry, index) => {
    if (index && entry - sorted[index - 1] > 1) list.push("…");
    list.push(entry);
    return list;
  }, []);
};

export const useExploreQuery = () => {
  const route = useRoute();
  const router = useRouter();
  const catalogVersion = useCatalogVersion();

  const draftQuery = ref(String(route.query.q || ""));
  const query = ref(String(route.query.q || ""));
  const dynasty = ref(String(route.query.dynasty || "全部"));
  const genre = ref(String(route.query.genre || route.query.category || "全部"));
  const page = ref(Math.max(1, Number(route.query.page) || 1));

  // version 是响应式依赖：馆藏异步载入完成后结果会自动重算。
  const stats = computed(() => ({ ...getLibraryStats(), version: catalogVersion.value }));
  const facets = computed(() => ({ ...getLibraryFacets(), version: catalogVersion.value }));
  const withAll = (items) => [{ name: "全部", count: stats.value.total }, ...items];
  const dynasties = computed(() => withAll(facets.value.dynasties));
  const genres = computed(() => withAll(facets.value.genres));

  const result = computed(() => {
    catalogVersion.value;
    return queryCatalog({
      keyword: query.value,
      dynasty: dynasty.value,
      genre: genre.value,
      page: page.value,
      pageSize: EXPLORE_PAGE_SIZE,
    });
  });

  const hasFilters = computed(() =>
    Boolean(query.value.trim()) || dynasty.value !== "全部" || genre.value !== "全部",
  );
  const activeFilterCount = computed(() =>
    Number(Boolean(query.value.trim()))
    + Number(dynasty.value !== "全部")
    + Number(genre.value !== "全部"),
  );
  const resultHeading = computed(() => {
    if (query.value.trim()) return `“${query.value.trim()}”`;
    if (dynasty.value !== "全部" && genre.value !== "全部") return `${dynasty.value} · ${genre.value}`;
    if (dynasty.value !== "全部") return dynasty.value;
    if (genre.value !== "全部") return genre.value;
    return "全部馆藏";
  });
  const resultSummary = computed(() =>
    `找到 ${result.value.total.toLocaleString("zh-CN")} 篇 · 本页 ${result.value.items.length} 篇`,
  );
  const rowNumber = (index) =>
    String((result.value.page - 1) * result.value.pageSize + index + 1).padStart(2, "0");
  const pageWindow = computed(() => pageWindowFor(result.value.page, result.value.totalPages));

  const replaceUrl = ({ resetPage = false } = {}) => {
    const next = {};
    if (query.value.trim()) next.q = query.value.trim();
    if (dynasty.value !== "全部") next.dynasty = dynasty.value;
    if (genre.value !== "全部") next.genre = genre.value;
    if (!resetPage && page.value > 1) next.page = page.value;
    router.replace({ name: "explore", query: next });
  };

  const submitSearch = () => {
    query.value = draftQuery.value.trim();
    page.value = 1;
    replaceUrl({ resetPage: true });
  };

  const pickHint = (hint) => {
    draftQuery.value = hint;
    query.value = hint;
    page.value = 1;
    replaceUrl({ resetPage: true });
  };

  const enterPath = (path) => {
    draftQuery.value = path.keyword;
    query.value = path.keyword;
    dynasty.value = "全部";
    genre.value = path.genre;
    page.value = 1;
    replaceUrl({ resetPage: true });
  };

  const clearSearch = () => {
    draftQuery.value = "";
    query.value = "";
    page.value = 1;
    replaceUrl({ resetPage: true });
  };

  const selectFacet = (key, name) => {
    if (key === "dynasty") dynasty.value = name;
    if (key === "genre") genre.value = name;
    page.value = 1;
    replaceUrl({ resetPage: true });
  };

  const resetFacet = (key) => selectFacet(key, "全部");

  const resetFilters = () => {
    draftQuery.value = "";
    query.value = "";
    dynasty.value = "全部";
    genre.value = "全部";
    page.value = 1;
    replaceUrl({ resetPage: true });
  };

  const goToPage = (nextPage) => {
    const target = Math.max(1, Math.min(result.value.totalPages, nextPage));
    if (target === page.value) return false;
    page.value = target;
    replaceUrl();
    return true;
  };

  const isPathActive = (path) =>
    query.value.trim() === path.keyword
    && (path.genre === "全部" || genre.value === path.genre);

  // 浏览器前进/后退或外部改 URL 时，把状态拉回与 URL 一致。
  watch(() => route.query, (value) => {
    const nextQuery = String(value.q || "");
    const nextDynasty = String(value.dynasty || "全部");
    const nextGenre = String(value.genre || value.category || "全部");
    const nextPage = Math.max(1, Number(value.page) || 1);
    if (nextQuery !== query.value) {
      query.value = nextQuery;
      draftQuery.value = nextQuery;
    }
    if (nextDynasty !== dynasty.value) dynasty.value = nextDynasty;
    if (nextGenre !== genre.value) genre.value = nextGenre;
    if (nextPage !== page.value) page.value = nextPage;
  }, { deep: true });

  // 馆藏载入后分面可能变化，清掉 URL 里已不存在的条件。
  watch([dynasty, genre], () => {
    if (dynasty.value !== "全部"
      && !facets.value.dynasties.some((item) => item.name === dynasty.value)) dynasty.value = "全部";
    if (genre.value !== "全部"
      && !facets.value.genres.some((item) => item.name === genre.value)) genre.value = "全部";
  });

  return {
    draftQuery,
    query,
    dynasty,
    genre,
    page,
    stats,
    dynasties,
    genres,
    result,
    hasFilters,
    activeFilterCount,
    resultHeading,
    resultSummary,
    rowNumber,
    pageWindow,
    submitSearch,
    pickHint,
    enterPath,
    clearSearch,
    selectFacet,
    resetFacet,
    resetFilters,
    goToPage,
    isPathActive,
  };
};

export const __testing = { pageWindowFor };
