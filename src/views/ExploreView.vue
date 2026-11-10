<template>
  <main class="index-page">
    <section class="index-banner">
      <div class="shell index-banner__inner">
        <div class="index-label">
          <span>02</span>
          <p>诗词索引</p>
        </div>
        <div class="index-banner__copy">
          <h1>一座可以翻检的<br />离线诗馆</h1>
          <p>
            馆藏来自仓库内的古典诗词选段，按朝代、体裁与字句编排；
            不依赖外部诗词 API，也不需要联网账号。
          </p>
        </div>
        <dl class="index-banner__stats">
          <div>
            <dt>馆藏篇目</dt>
            <dd>{{ stats.total.toLocaleString("zh-CN") }}</dd>
          </div>
          <div>
            <dt>署名作者</dt>
            <dd>{{ stats.authors.toLocaleString("zh-CN") }}</dd>
          </div>
          <div>
            <dt>精校短章</dt>
            <dd>{{ String(stats.curated).padStart(2, "0") }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <div class="mobile-filter-bar">
      <div class="shell mobile-filter-bar__inner">
        <button type="button" :aria-expanded="filtersOpen" aria-controls="mobile-filter-panel" @click="filtersOpen = !filtersOpen">
          <AppIcon name="filter" :size="16" />
          筛选
          <span v-if="hasFilters">{{ activeFilterCount }}</span>
        </button>
        <p>{{ resultSummary }}</p>
      </div>
    </div>

    <section class="search-room">
      <div class="shell">
        <form class="index-search" role="search" @submit.prevent="submitSearch">
          <label class="sr-only" for="global-search">搜索诗词</label>
          <AppIcon name="search" :size="23" />
          <input
            id="global-search"
            v-model="draftQuery"
            type="search"
            placeholder="输入诗名、作者、体裁、朝代或一句诗"
            autocomplete="off"
          />
          <button v-if="draftQuery" class="index-search__clear" type="button" aria-label="清空搜索" @click="clearSearch">
            <AppIcon name="close" :size="16" />
          </button>
          <button class="index-search__button" type="submit">翻检</button>
        </form>
        <div class="quick-terms">
          <span>常见入口</span>
          <button v-for="hint in hints" :key="hint" type="button" :aria-label="`搜索${hint}`" @click="pickHint(hint)">{{ hint }}</button>
        </div>
        <div class="poem-paths" aria-label="主题诗路">
          <button
            v-for="path in poemPaths"
            :key="path.label"
            type="button"
            :class="{ 'is-active': isPathActive(path) }"
            :aria-pressed="isPathActive(path)"
            @click="enterPath(path)"
          >
            <span>{{ path.index }}</span>
            <strong>{{ path.label }}</strong>
            <em>{{ path.note }}</em>
          </button>
        </div>
      </div>
    </section>

    <section class="index-content">
      <div class="shell index-grid">
        <aside id="mobile-filter-panel" class="filter-wall" :class="{ 'is-open': filtersOpen }" aria-label="馆藏筛选">
          <section class="facet">
            <div class="facet__head">
              <p class="eyebrow">朝代 / DYNASTY</p>
              <button v-if="dynasty !== '全部'" type="button" @click="resetFacet('dynasty')">重置</button>
            </div>
            <div class="facet__list" role="group" aria-label="按朝代筛选">
              <button
                v-for="item in dynasties"
                :key="item.name"
                type="button"
                :class="{ 'is-active': dynasty === item.name }"
                :aria-pressed="dynasty === item.name"
                @click="selectFacet('dynasty', item.name)"
              >
                <span>{{ item.name }}</span>
                <em>{{ item.count.toLocaleString("zh-CN") }}</em>
              </button>
            </div>
          </section>

          <section class="facet">
            <div class="facet__head">
              <p class="eyebrow">体裁 / FORM</p>
              <button v-if="genre !== '全部'" type="button" @click="resetFacet('genre')">重置</button>
            </div>
            <div class="facet__list" role="group" aria-label="按体裁筛选">
              <button
                v-for="item in genres"
                :key="item.name"
                type="button"
                :class="{ 'is-active': genre === item.name }"
                :aria-pressed="genre === item.name"
                @click="selectFacet('genre', item.name)"
              >
                <span>{{ item.name }}</span>
                <em>{{ item.count.toLocaleString("zh-CN") }}</em>
              </button>
            </div>
          </section>

          <p class="filter-note">
            数量为全馆计数；两轴筛选会缩小当前结果。馆藏是阅读选段，不是校勘定本。
          </p>
        </aside>

        <section class="result-room" aria-labelledby="result-heading">
          <header class="result-head">
            <div>
              <p class="eyebrow">检索结果 / RESULT</p>
              <h2 id="result-heading">{{ resultHeading }}</h2>
            </div>
            <div class="result-head__right">
              <span>{{ resultSummary }}</span>
              <button v-if="hasFilters" type="button" @click="resetFilters">清除条件</button>
            </div>
          </header>

          <p v-if="catalogError" class="catalog-notice" role="status">{{ catalogError }}</p>

          <div v-if="hasFilters" class="active-filters">
            <button v-if="query" type="button" @click="clearSearch">
              <span>字句</span>{{ query }}<AppIcon name="close" :size="12" />
            </button>
            <button v-if="dynasty !== '全部'" type="button" @click="resetFacet('dynasty')">
              <span>朝代</span>{{ dynasty }}<AppIcon name="close" :size="12" />
            </button>
            <button v-if="genre !== '全部'" type="button" @click="resetFacet('genre')">
              <span>体裁</span>{{ genre }}<AppIcon name="close" :size="12" />
            </button>
          </div>

          <div v-if="result.items.length" class="poem-list">
            <PoemRow
              v-for="(poem, index) in result.items"
              :key="poem.id"
              :poem="poem"
              :index="rowNumber(index)"
              :saved="isSaved(poem.id)"
              @toggle="savePoem"
            />
          </div>
          <div v-else class="empty-state">
            <h2>这一格暂时空着</h2>
            <p>换一个作者名，或减少朝代、体裁条件；也可以清除全部条件再翻检。</p>
            <button class="button" type="button" @click="resetFilters">查看全部馆藏</button>
          </div>

          <nav v-if="result.totalPages > 1" class="pagination" aria-label="检索结果分页">
            <button type="button" :disabled="result.page <= 1" aria-label="上一页" @click="goToPage(result.page - 1)">
              <AppIcon name="arrow-left" :size="16" />
            </button>
            <span>第 {{ result.page }} / {{ result.totalPages }} 页</span>
            <button
              type="button"
              :disabled="result.page >= result.totalPages"
              aria-label="下一页"
              @click="goToPage(result.page + 1)"
            >
              <AppIcon name="arrow-right" :size="16" />
            </button>
          </nav>

          <p class="corpus-note">
            语料来自 <code>chinese-poetry/chinese-poetry</code> 固定提交的 MIT 授权选段与兰泽精校短章；
            繁简、异体与断句保持上游形态，引用前请核对底本。
          </p>
        </section>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppIcon from "../components/AppIcon.vue";
import PoemRow from "../components/PoemRow.vue";
import {
  getLibraryFacets,
  getLibraryStats,
  useLibrary,
  useCatalogVersion,
  loadCatalog,
  queryCatalog,
} from "../composables/useLibrary.js";
import { notify } from "../composables/useNotices.js";

const route = useRoute();
const router = useRouter();
const { isSaved, toggleSaved, catalogError } = useLibrary();
const catalogVersion = useCatalogVersion();
const hints = ["月亮", "李白", "宋词", "春天", "关雎"];
const poemPaths = [
  { index: "一", label: "月与夜", note: "明月、夜色与独坐", keyword: "月", genre: "全部" },
  { index: "二", label: "春与归", note: "春风、花开与归程", keyword: "春", genre: "全部" },
  { index: "三", label: "宋词小令", note: "从短句进入词牌", keyword: "", genre: "宋词" },
];
const pageSize = 24;
const filtersOpen = ref(false);

const stats = computed(() => ({ ...getLibraryStats(), version: catalogVersion.value }));
const facets = computed(() => ({ ...getLibraryFacets(), version: catalogVersion.value }));
const draftQuery = ref(String(route.query.q || ""));
const query = ref(String(route.query.q || ""));
const dynasty = ref(String(route.query.dynasty || "全部"));
const genre = ref(String(route.query.genre || route.query.category || "全部"));
const page = ref(Math.max(1, Number(route.query.page) || 1));

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
    pageSize,
  });
});
const hasFilters = computed(() => Boolean(query.value.trim()) || dynasty.value !== "全部" || genre.value !== "全部");
const activeFilterCount = computed(() =>
  Number(Boolean(query.value.trim())) + Number(dynasty.value !== "全部") + Number(genre.value !== "全部"),
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

const syncRoute = ({ resetPage = false } = {}) => {
  const nextQuery = {};
  if (query.value.trim()) nextQuery.q = query.value.trim();
  if (dynasty.value !== "全部") nextQuery.dynasty = dynasty.value;
  if (genre.value !== "全部") nextQuery.genre = genre.value;
  if (!resetPage && page.value > 1) nextQuery.page = page.value;
  router.replace({ name: "explore", query: nextQuery });
};

const submitSearch = () => {
  query.value = draftQuery.value.trim();
  page.value = 1;
  filtersOpen.value = false;
  syncRoute({ resetPage: true });
};

const pickHint = (hint) => {
  draftQuery.value = hint;
  query.value = hint;
  page.value = 1;
  filtersOpen.value = false;
  syncRoute({ resetPage: true });
};

const isPathActive = (path) =>
  query.value.trim() === path.keyword && (path.genre === "全部" || genre.value === path.genre);

const enterPath = (path) => {
  draftQuery.value = path.keyword;
  query.value = path.keyword;
  dynasty.value = "全部";
  genre.value = path.genre;
  page.value = 1;
  filtersOpen.value = false;
  syncRoute({ resetPage: true });
  window.requestAnimationFrame(() => {
    document.querySelector(".result-room")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
};

const clearSearch = () => {
  draftQuery.value = "";
  query.value = "";
  page.value = 1;
  filtersOpen.value = false;
  syncRoute({ resetPage: true });
};

const selectFacet = (key, name) => {
  if (key === "dynasty") dynasty.value = name;
  if (key === "genre") genre.value = name;
  page.value = 1;
  syncRoute({ resetPage: true });
};

onMounted(() => {
  const desktopQuery = window.matchMedia("(min-width: 901px)");
  const syncFilters = (event) => {
    if (event.matches) filtersOpen.value = false;
  };
  desktopQuery.addEventListener("change", syncFilters);
  onBeforeUnmount(() => desktopQuery.removeEventListener("change", syncFilters));
  loadCatalog();
});

const resetFacet = (key) => selectFacet(key, "全部");

const resetFilters = () => {
  draftQuery.value = "";
  query.value = "";
  dynasty.value = "全部";
  genre.value = "全部";
  page.value = 1;
  filtersOpen.value = false;
  syncRoute({ resetPage: true });
};

const goToPage = (nextPage) => {
  page.value = Math.max(1, Math.min(result.value.totalPages, nextPage));
  syncRoute();
  const top = document.querySelector(".result-room")?.getBoundingClientRect().top;
  if (typeof top === "number" && top < 0) window.scrollTo({ top: window.scrollY + top - 96, behavior: "smooth" });
};

const savePoem = (poem) => {
  const added = toggleSaved(poem);
  notify(added ? `已收藏《${poem.title}》` : `已取消收藏《${poem.title}》`, added ? "success" : "info");
};

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

watch([dynasty, genre], () => {
  if (dynasty.value !== "全部" && !facets.value.dynasties.some((item) => item.name === dynasty.value)) dynasty.value = "全部";
  if (genre.value !== "全部" && !facets.value.genres.some((item) => item.name === genre.value)) genre.value = "全部";
});

</script>

<style scoped>
.index-page {
  min-height: 80dvh;
  background: var(--porcelain);
}

.index-banner {
  border-bottom: 1px solid var(--line);
  background:
    linear-gradient(90deg, rgba(168, 196, 184, 0.18), transparent 58%),
    var(--porcelain-deep);
}

.index-banner__inner {
  display: grid;
  grid-template-columns: 90px minmax(0, 1fr) auto;
  align-items: end;
  gap: 40px;
  padding-block: 58px 46px;
}

.index-label {
  display: grid;
  align-content: start;
  gap: 15px;
}

.index-label span {
  color: var(--brass);
  font-family: var(--font-number);
  font-size: 42px;
  font-weight: 300;
  line-height: 1;
}

.index-label p {
  margin: 0;
  color: var(--ink-soft);
  font-size: var(--text-meta);
  letter-spacing: 0.14em;
  writing-mode: vertical-rl;
}

.index-banner__copy h1 {
  margin: 0;
  font-family: var(--font-poem);
  font-size: clamp(42px, 6vw, 78px);
  font-weight: 400;
  letter-spacing: 0.03em;
  line-height: 1.18;
  text-wrap: balance;
}

.index-banner__copy > p {
  max-width: min(48em, var(--measure-copy));
  margin: 20px 0 0;
  color: var(--ink-soft);
  font-size: 13px;
  line-height: var(--leading-copy);
  text-wrap: pretty;
}

.index-banner__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(84px, auto));
  gap: 0;
  margin: 0;
  padding-bottom: 6px;
}

.index-banner__stats > div {
  padding: 0 18px;
  border-left: 1px solid var(--line);
}

.index-banner__stats dt {
  color: var(--ink-faint);
  font-size: var(--text-meta);
  letter-spacing: 0.06em;
}

.index-banner__stats dd {
  margin: 8px 0 0;
  color: var(--celadon-deep);
  font-family: var(--font-number);
  font-size: 32px;
  font-weight: 300;
  line-height: 1;
}

.search-room {
  padding-block: 34px 38px;
  border-bottom: 1px solid var(--line);
  background: var(--porcelain-panel);
}

.index-search {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: 13px;
  padding: 5px 5px 5px 20px;
  border: 1px solid var(--line-strong);
  background: var(--porcelain);
  box-shadow: var(--shadow-tiny);
}

.index-search > :deep(svg) {
  color: var(--brass);
}

.index-search:focus-within {
  border-color: var(--celadon-deep);
  box-shadow: 0 0 0 3px rgba(81, 122, 112, 0.12);
}

.index-search input {
  min-width: 0;
  height: 52px;
  border: 0;
  background: transparent;
  color: var(--ink);
  font-family: var(--font-poem);
  font-size: 17px;
  outline: none;
}

.index-search input::placeholder {
  color: var(--ink-faint);
  font-family: var(--font-ui);
  font-size: 13px;
}

.index-search__clear {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--ink-faint);
}

.index-search__button {
  min-width: 92px;
  min-height: 50px;
  border: 0;
  background: var(--ink);
  color: var(--porcelain-panel);
  font-size: 13px;
  letter-spacing: 0.12em;
}

.index-search__button:hover {
  background: var(--celadon-deep);
}

.quick-terms {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 13px;
  color: var(--ink-faint);
  font-size: var(--text-meta);
}

.quick-terms button {
  min-height: 42px;
  padding: 7px 12px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--ink-soft);
  font-size: var(--text-meta);
}

.quick-terms button:hover {
  border-color: var(--brass);
  color: var(--brass);
}

.poem-paths {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 18px;
}

.poem-paths button {
  display: grid;
  min-width: 0;
  min-height: 76px;
  grid-template-columns: 28px minmax(0, 1fr);
  align-items: center;
  column-gap: 12px;
  padding: 12px 16px;
  border: 1px solid var(--line);
  background: rgba(251, 252, 249, 0.58);
  color: var(--ink-soft);
  text-align: left;
  transition:
    border-color var(--motion-fast) var(--ease-standard),
    background-color var(--motion-fast) var(--ease-standard),
    transform var(--motion-fast) var(--ease-out);
}

.poem-paths button:hover {
  border-color: var(--celadon-deep);
  transform: translateY(-1px);
}

.poem-paths button:active {
  transform: translateY(0);
}

.poem-paths button.is-active {
  border-color: var(--brass);
  background: rgba(216, 191, 142, 0.12);
}

.poem-paths span {
  grid-row: 1 / 3;
  color: var(--brass);
  font-family: var(--font-poem);
  font-size: 22px;
}

.poem-paths strong {
  color: var(--ink);
  font-family: var(--font-poem);
  font-size: 17px;
  font-weight: 400;
  letter-spacing: 0.06em;
}

.poem-paths em {
  overflow: hidden;
  color: var(--ink-faint);
  font-size: var(--text-meta);
  font-style: normal;
  line-height: 1.5;
  text-overflow: ellipsis;
  white-space: nowrap;
}

  .quick-terms button:focus-visible,
  .mobile-filter-bar button:focus-visible,
  .facet__list button:focus-visible {
    outline-offset: -3px;
  }

.index-content {
  padding-block: 52px max(76px, var(--fixed-layer-space));
}

.mobile-filter-bar {
  display: none;
}

.index-grid {
  display: grid;
  grid-template-columns: 210px minmax(0, 1fr);
  gap: clamp(50px, 8vw, 120px);
  min-width: 0;
}

.filter-wall {
  align-self: start;
  position: sticky;
  top: 106px;
  min-width: 0;
}

.facet + .facet {
  margin-top: 34px;
}

.facet__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.facet__head p {
  margin: 0;
}

.facet__head button {
  min-height: 40px;
  padding: 0 4px;
  border: 0;
  background: transparent;
  color: var(--ink-faint);
  font-size: var(--text-meta);
}

.facet__head button:hover {
  color: var(--brass);
}

.facet__list {
  display: grid;
  margin-top: 14px;
  border-top: 1px solid var(--line-strong);
  min-width: 0;
  max-height: 336px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.facet__list button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 42px;
  padding: 10px 0;
  border: 0;
  border-bottom: 1px solid var(--line);
  background: transparent;
  color: var(--ink-soft);
  font-size: 12px;
  text-align: left;
  transition:
    color var(--motion-fast) var(--ease-standard),
    background-color var(--motion-fast) var(--ease-standard),
    border-color var(--motion-fast) var(--ease-standard);
}

.facet__list button:hover,
.facet__list button.is-active {
  color: var(--brass);
}

.facet__list button.is-active span {
  font-weight: 600;
}

.facet__list button.is-active {
  position: relative;
}

.facet__list button.is-active::before {
  position: absolute;
  top: 9px;
  bottom: 9px;
  left: -8px;
  width: 2px;
  background: var(--brass);
  content: "";
}

.facet__list em {
  color: var(--ink-faint);
  font-family: var(--font-number);
  font-size: var(--text-meta);
  font-style: normal;
}

.filter-note {
  margin: 24px 0 0;
  color: var(--ink-faint);
  font-size: var(--text-meta);
  line-height: var(--leading-copy);
  text-wrap: pretty;
}

.result-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  min-width: 0;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--line-strong);
}

.result-head h2 {
  margin: 6px 0 0;
  font-family: var(--font-poem);
  font-size: clamp(30px, 4vw, 48px);
  font-weight: 400;
  letter-spacing: 0.04em;
  text-wrap: balance;
}

.result-head__right {
  display: grid;
  justify-items: end;
  gap: 7px;
  color: var(--ink-faint);
  font-size: var(--text-meta);
}

.result-head__right button {
  min-height: 40px;
  padding: 0 2px;
  border: 0;
  border-bottom: 1px solid var(--line-strong);
  background: transparent;
  color: var(--ink-soft);
  font-size: var(--text-meta);
}

.result-head__right button:hover {
  color: var(--brass);
}

.active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 18px 0 6px;
}

.catalog-notice {
  margin: 18px 0 0;
  padding: 10px 14px;
  border-left: 2px solid var(--brass);
  background: var(--porcelain-deep);
  color: var(--ink-soft);
  font-size: 11px;
}

.active-filters button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 40px;
  padding: 7px 11px;
  border: 1px solid var(--line);
  background: var(--porcelain-panel);
  color: var(--ink-soft);
  font-size: 11px;
}

.active-filters button span {
  color: var(--ink-faint);
  font-size: var(--text-meta);
}

.active-filters button:hover {
  border-color: var(--celadon-deep);
  color: var(--celadon-deep);
}

.poem-list {
  border-bottom: 1px solid var(--line);
}

.empty-state {
  min-height: 320px;
  display: grid;
  place-content: center;
  justify-items: start;
  gap: 14px;
  border-bottom: 1px solid var(--line);
  color: var(--ink-soft);
}

.empty-state h2 {
  margin: 0;
  font-family: var(--font-poem);
  font-size: 30px;
  font-weight: 400;
}

.empty-state p {
  margin: 0;
  font-size: 12px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  min-height: 76px;
  color: var(--ink-faint);
  font-size: 11px;
}

.pagination button {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--ink-soft);
}

.pagination button:disabled {
  opacity: 0.35;
}

.pagination button:not(:disabled):hover {
  border-color: var(--celadon-deep);
  color: var(--celadon-deep);
}

.corpus-note {
  margin: 18px 0 0;
  color: var(--ink-faint);
  font-size: var(--text-meta);
  line-height: var(--leading-copy);
  text-wrap: pretty;
}

.corpus-note code {
  font-family: var(--font-ui);
  font-size: var(--text-meta);
}

@media (max-width: 900px) {
  .index-banner__inner {
    grid-template-columns: 40px 1fr;
    gap: 22px;
  }

  .index-banner__stats {
    grid-column: 2;
    grid-template-columns: repeat(3, 1fr);
    padding-top: 12px;
  }

  .index-banner__stats > div {
    padding: 0 10px;
  }

  .index-banner__stats > div:first-child {
    padding-left: 0;
    border-left: 0;
  }

  .index-banner__stats dd {
    font-size: 24px;
  }

  .index-grid {
    grid-template-columns: 1fr;
    gap: 40px;
    min-width: 0;
  }

  .mobile-filter-bar {
    display: block;
    border-bottom: 1px solid var(--line);
    background: var(--porcelain-panel);
  }

  .mobile-filter-bar__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    min-height: 56px;
    position: sticky;
    top: var(--header-height);
    z-index: 4;
  }

  .mobile-filter-bar button {
    display: inline-flex;
    min-height: 40px;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    border: 1px solid var(--line-strong);
    background: transparent;
    color: var(--ink);
    font-size: 12px;
  }

  .mobile-filter-bar button span {
    display: grid;
    width: 19px;
    height: 19px;
    place-items: center;
    border-radius: 50%;
    background: var(--ink);
    color: var(--porcelain-panel);
    font-family: var(--font-number);
    font-size: var(--text-meta);
  }

  .mobile-filter-bar p {
    margin: 0;
    min-width: 0;
    color: var(--ink-faint);
    font-size: var(--text-meta);
    text-align: right;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .filter-wall {
    display: none;
    position: static;
    min-width: 0;
    padding: 22px 0;
    border-bottom: 1px solid var(--line-strong);
  }

  .filter-wall.is-open {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
    max-height: min(360px, 60dvh);
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .facet__list button.is-active::before {
    left: -1px;
  }

  .facet + .facet {
    margin-top: 0;
  }

  .facet__list {
    display: flex;
    min-width: 0;
    max-height: 132px;
    flex-wrap: wrap;
    align-content: start;
    gap: 8px;
    overflow-x: auto;
    overflow-y: auto;
    border-top: 0;
    overscroll-behavior: contain;
  }

  .facet__list button {
    flex: 0 0 auto;
    gap: 8px;
    min-height: 40px;
    padding: 8px 12px;
    border: 1px solid var(--line);
    white-space: nowrap;
  }

  .facet__list button.is-active {
    border-color: var(--ink);
    background: var(--ink);
    color: var(--porcelain-panel);
  }

  .facet__list button.is-active em {
    color: inherit;
  }

  .filter-note {
    grid-column: 1 / -1;
    margin-top: 0;
  }
}

@media (max-width: 560px) {
  .index-banner__inner {
    gap: 12px;
    padding-block: 28px 20px;
  }

  .index-label span {
    font-size: 30px;
  }

  .index-banner__copy h1 {
    font-size: clamp(34px, 8.4vw, 48px);
    line-height: 1.22;
  }

  .index-banner__copy > p {
    max-width: 34em;
    margin-top: 10px;
    font-size: var(--text-note);
    line-height: 1.8;
  }

  .index-banner__stats dd {
    font-size: 20px;
  }

  .search-room {
    padding-block: 14px 16px;
  }

  .index-search {
    grid-template-columns: auto 1fr auto;
    gap: 8px;
    padding-left: 12px;
  }

  .index-search__button {
    min-width: 64px;
  }

  .quick-terms {
    margin-top: 8px;
  }

  .poem-paths {
    grid-template-columns: 1fr;
    gap: 7px;
    margin-top: 10px;
  }

  .poem-paths button {
    min-height: 56px;
    padding: 7px 12px;
  }

  .poem-paths span {
    font-size: 19px;
  }

  .filter-wall {
    grid-template-columns: 1fr;
  }

  .filter-wall.is-open {
    grid-template-columns: 1fr;
  }

  .facet__list {
    max-height: 116px;
    flex-wrap: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .result-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .result-head__right {
    justify-items: start;
  }

  .mobile-filter-bar__inner {
    min-height: 54px;
  }

  .mobile-filter-bar p {
    max-width: 62%;
    line-height: 1.4;
  }
}

@media (max-width: 380px) {
  .index-label {
    display: none;
  }

  .index-banner__inner {
    grid-template-columns: 1fr;
  }

  .index-banner__copy h1 br {
    display: none;
  }

  .index-banner__stats {
    grid-column: 1;
  }

  .index-banner__stats > div {
    padding-inline: 8px;
  }

  .quick-terms > span {
    display: none;
  }

  .quick-terms button {
    min-height: 36px;
    padding: 6px 9px;
  }

  .poem-paths em {
    font-size: var(--text-meta);
  }

  .mobile-filter-bar__inner {
    gap: 8px;
    min-height: 50px;
  }

  .mobile-filter-bar button {
    padding-inline: 10px;
  }

  .mobile-filter-bar p {
    max-width: 52%;
  }

  .filter-wall.is-open {
    grid-template-columns: 1fr;
  }

  .result-head h2 {
    font-size: 28px;
  }

  .corpus-note code {
    overflow-wrap: anywhere;
  }
}
</style>
