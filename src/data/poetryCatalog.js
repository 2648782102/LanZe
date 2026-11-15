import { demoPoems } from "./poems.js";

const collectionNames = new Map([
  ["花间词", "花间集"],
  ["南唐词", "南唐词"],
  ["元曲", "元曲"],
  ["唐诗", "全唐诗"],
  ["宋词", "全宋词"],
  ["楚辞", "楚辞"],
  ["诗经", "诗经"],
  ["建安诗", "曹操诗集"],
  ["清词", "纳兰性德诗集"],
]);

const asRecord = (poem, index, curated = false) => ({
  id: poem.id || `poem-${index}`,
  title: poem.title || "无题",
  author: poem.author || "佚名",
  category: poem.genre || poem.category || "古诗",
  dynasty: poem.dynasty || "未编年",
  collection: poem.collection || poem.source || collectionNames.get(poem.genre) || "馆藏",
  source: poem.source || poem.collection || collectionNames.get(poem.genre) || "馆藏",
  paragraphs: Array.isArray(poem.paragraphs) ? poem.paragraphs : [],
  tags: Array.isArray(poem.tags) ? poem.tags : [poem.dynasty, poem.genre, poem.author].filter(Boolean),
  note: poem.note || "",
  curated,
  searchText: [
    poem.title,
    poem.author,
    poem.dynasty,
    poem.genre,
    poem.collection,
    poem.source,
    ...(poem.paragraphs || []),
    ...(poem.tags || []),
  ]
    .join(" ")
    .toLowerCase(),
});

export const curatedPoems = Object.freeze(
  demoPoems.map((poem, index) =>
    asRecord(
      {
        ...poem,
        dynasty: poem.dynasty || poem.category,
        collection: "兰泽精校",
        source: "兰泽精校",
        note: poem.type === "customgushici"
          ? "写于此处的作品，留在此设备上。"
          : "馆内精校短章，供阅读与检索；引用前请核对底本。",
      },
      index,
      true,
    ),
  ),
);

export let poetryCatalog = Object.freeze([...curatedPoems]);
let catalogVersion = 0;
export let poetryStats = {
  total: curatedPoems.length,
  curated: curatedPoems.length,
  authors: new Set(curatedPoems.map((poem) => poem.author)).size,
  collections: 1,
  loaded: false,
};
export let poetryFacets = {
  dynasties: [],
  genres: [],
  collections: [],
  authors: [],
};

/*
 * 一次遍历同时算出总量、作者/合集去重与各分面计数；旧实现要遍历 6 遍
 * 并对每个分面单独做 localeCompare 排序，9,350 条时会形成一个可见长任务。
 */
const refreshStats = () => {
  const authors = new Set();
  const collections = new Set();
  const dynasties = new Map();
  const genres = new Map();
  const collectionCounts = new Map();
  const authorCounts = new Map();

  const bump = (counts, key) => counts.set(key, (counts.get(key) || 0) + 1);

  for (const poem of poetryCatalog) {
    authors.add(poem.author);
    collections.add(poem.collection);
    bump(dynasties, poem.dynasty);
    bump(genres, poem.category);
    bump(collectionCounts, poem.collection);
    bump(authorCounts, poem.author);
  }

  const toFacet = (counts) => [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name, "zh-CN"));

  Object.assign(poetryStats, {
    total: poetryCatalog.length,
    curated: curatedPoems.length,
    authors: authors.size,
    collections: collections.size,
    loaded: true,
  });
  Object.assign(poetryFacets, {
    dynasties: toFacet(dynasties),
    genres: toFacet(genres),
    collections: toFacet(collectionCounts),
    authors: toFacet(authorCounts),
  });
};

const resolveUrl = (path) => {
  if (typeof document !== "undefined") return new URL(path.replace(/^\.\//, ""), document.baseURI).href;
  if (typeof location !== "undefined") return new URL(path.replace(/^\.\//, ""), location.href).href;
  return new URL(path.replace(/^\.\//, ""), "http://127.0.0.1/").href;
};

let loadPromise = null;
export const loadPoetryCatalog = async ({ force = false } = {}) => {
  if (loadPromise) return loadPromise;
  if (poetryStats.loaded && !force) return poetryCatalog;
  loadPromise = (async () => {
    const manifestResponse = await fetch(resolveUrl("data/poetry/manifest.json"));
    if (!manifestResponse.ok) throw new Error(`馆藏目录返回 ${manifestResponse.status}`);
    const manifest = await manifestResponse.json();
    const collections = await Promise.all(
      (manifest.collections || []).map(async (entry) => {
        const response = await fetch(resolveUrl(`data/poetry/${entry.id}.json`));
        if (!response.ok) throw new Error(`${entry.id} 返回 ${response.status}`);
        return response.json();
      }),
    );
    const corpusPoems = collections.flatMap((items, collectionIndex) =>
      items.map((poem, index) => asRecord(poem, `${collectionIndex}-${index}`)),
    );
    poetryCatalog = Object.freeze([...curatedPoems, ...corpusPoems]);
    catalogVersion += 1;
    refreshStats();
    return poetryCatalog;
  })().catch((error) => {
    loadPromise = null;
    throw error;
  });
  return loadPromise;
};

export const asLibraryPoem = (poem, index = 0) => ({
  id: poem.id || `poem-${index}`,
  title: poem.title || "无题",
  author: poem.author || "佚名",
  category: poem.category || poem.genre || "古诗",
  paragraph: poem.paragraphs?.[0] || "",
  paragraphs: poem.paragraphs || [],
  textBody: (poem.paragraphs || []).join(""),
  content: (poem.paragraphs || []).join("\n"),
  poemName: poem.title || "无题",
  origin: poem.title || "无题",
  rhythmic: "",
  titleNote: poem.note || "馆藏语料用于阅读与检索；引用、出版或教学前请核对底本。",
  tags: poem.tags || [poem.category, poem.author].filter(Boolean),
  type: poem.type || "library",
  dynasty: poem.dynasty || "未编年",
  collection: poem.collection || "馆藏",
  source: poem.source || poem.collection || "馆藏",
  curated: Boolean(poem.curated),
  searchText: poem.searchText || "",
});

export const getLibraryPoem = (id) => {
  const record = poetryCatalog.find((poem) => poem.id === id);
  return record ? asLibraryPoem(record) : null;
};

/*
 * 匹配结果按「条件 + 馆藏版本」缓存：翻页、切换收藏态、组件重渲染都可能
 * 反复调用同一组条件，没必要每次重新线性扫 9,350 条并做 includes。
 * 缓存只保存命中的记录引用，切片与归一化仍每次现算（数据量只有一页）。
 */
const matchCache = new Map();
let cachedVersion = -1;

const matchedPoems = (keyword, dynasty, genre) => {
  if (cachedVersion !== catalogVersion) {
    matchCache.clear();
    cachedVersion = catalogVersion;
  }
  const normalized = String(keyword || "").trim().toLowerCase();
  const key = `${normalized}\u0000${dynasty}\u0000${genre}`;
  const hit = matchCache.get(key);
  if (hit) return hit;
  const matched = poetryCatalog.filter((poem) => {
    if (dynasty !== "全部" && poem.dynasty !== dynasty) return false;
    if (genre !== "全部" && poem.category !== genre) return false;
    return !normalized || poem.searchText.includes(normalized);
  });
  // 只保留有限条目，避免用户输入大量不同关键词时缓存无限增长。
  if (matchCache.size > 24) matchCache.clear();
  matchCache.set(key, matched);
  return matched;
};

export const getLibraryPage = ({ keyword = "", dynasty = "全部", genre = "全部", page = 1, pageSize = 24 } = {}) => {
  const matched = matchedPoems(keyword, dynasty, genre);
  const safePageSize = Math.max(1, Math.min(60, Number(pageSize) || 24));
  const totalPages = Math.max(1, Math.ceil(matched.length / safePageSize));
  const safePage = Math.max(1, Math.min(totalPages, Number(page) || 1));
  const start = (safePage - 1) * safePageSize;
  return {
    items: matched.slice(start, start + safePageSize).map(asLibraryPoem),
    total: matched.length,
    page: safePage,
    pageSize: safePageSize,
    totalPages,
    facets: { dynasties: poetryFacets.dynasties, genres: poetryFacets.genres },
  };
};

export const getRelatedLibraryPoems = (poem, limit = 3) => {
  if (!poem) return [];
  const sameCollection = poetryCatalog.filter(
    (item) => item.id !== poem.id && item.collection === poem.collection,
  );
  const sameAuthor = poetryCatalog.filter(
    (item) => item.id !== poem.id && item.collection !== poem.collection && item.author === poem.author,
  );
  const sameGenre = poetryCatalog.filter(
    (item) => item.id !== poem.id && item.category === poem.category && item.collection !== poem.collection,
  );
  return [...sameCollection, ...sameAuthor, ...sameGenre].slice(0, limit).map(asLibraryPoem);
};

export const getAdjacentLibraryPoems = (poem) => {
  if (!poem || poetryCatalog.length < 2) return { previous: null, next: null };
  const index = poetryCatalog.findIndex((item) => item.id === poem.id);
  if (index < 0) return { previous: null, next: null };
  const wrap = (offset) => (index + offset + poetryCatalog.length) % poetryCatalog.length;
  return {
    previous: asLibraryPoem(poetryCatalog[wrap(-1)]),
    next: asLibraryPoem(poetryCatalog[wrap(1)]),
  };
};

export const getDailyLibraryPoem = (date = new Date()) => {
  const dayIndex = Math.floor(date.getTime() / 86400000);
  return asLibraryPoem(curatedPoems[Math.abs(dayIndex) % curatedPoems.length]);
};

export const getLibraryExcerpt = (index = 0) => {
  const poems = curatedPoems.filter((poem) => poem.paragraphs.length);
  const poem = poems[Math.abs(index) % poems.length];
  const line = poem.paragraphs[Math.abs(index) % poem.paragraphs.length];
  return {
    id: `library-excerpt-${poem.id}-${line}`,
    content: line,
    author: poem.author,
    origin: poem.title,
    category: poem.dynasty,
  };
};
