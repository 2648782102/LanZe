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
          ? "演示用户作品，仅存于当前浏览器。"
          : "兰泽精校演示篇目，短章用于界面展示；引用前请核对底本。",
      },
      index,
      true,
    ),
  ),
);

export let poetryCatalog = Object.freeze([...curatedPoems]);
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

const countBy = (key) => {
  const counts = new Map();
  for (const poem of poetryCatalog) counts.set(poem[key], (counts.get(poem[key]) || 0) + 1);
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name, "zh-CN"));
};

const refreshStats = () => {
  Object.assign(poetryStats, {
    total: poetryCatalog.length,
    curated: curatedPoems.length,
    authors: new Set(poetryCatalog.map((poem) => poem.author)).size,
    collections: new Set(poetryCatalog.map((poem) => poem.collection)).size,
    loaded: true,
  });
  Object.assign(poetryFacets, {
    dynasties: countBy("dynasty"),
    genres: countBy("category"),
    collections: countBy("collection"),
    authors: countBy("author"),
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

export const getLibraryPage = ({ keyword = "", dynasty = "全部", genre = "全部", page = 1, pageSize = 24 } = {}) => {
  const normalized = String(keyword || "").trim().toLowerCase();
  const matched = poetryCatalog.filter((poem) => {
    if (dynasty !== "全部" && poem.dynasty !== dynasty) return false;
    if (genre !== "全部" && poem.category !== genre) return false;
    return !normalized || poem.searchText.includes(normalized);
  });
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
