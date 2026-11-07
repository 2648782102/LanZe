<template>
  <main class="index-page">
    <section class="index-banner">
      <div class="shell index-banner__inner">
        <div class="index-label">
          <span>02</span>
          <p>诗词索引</p>
        </div>
        <div class="index-banner__copy">
          <h1>在诗名、作者<br />与句子之间寻找</h1>
          <p>当前索引来自仓库内置演示诗目与本机作品。分类数量按实际条目显示。</p>
        </div>
        <div class="index-banner__total">
          <strong>{{ String(catalog.length).padStart(2, "0") }}</strong>
          <span>首可检索诗目</span>
        </div>
      </div>
    </section>

    <section class="search-room">
      <div class="shell">
        <form class="index-search" role="search" @submit.prevent="syncRoute">
          <label class="sr-only" for="global-search">搜索诗词</label>
          <AppIcon name="search" :size="23" />
          <input
            id="global-search"
            v-model="query"
            type="search"
            placeholder="输入诗名、作者、体裁或一句诗"
            autocomplete="off"
          />
          <button v-if="query" class="index-search__clear" type="button" aria-label="清空搜索" @click="clearSearch">
            <AppIcon name="close" :size="16" />
          </button>
          <button class="index-search__button" type="submit">检索</button>
        </form>
        <div class="quick-terms">
          <span>常见入口</span>
          <button v-for="hint in hints" :key="hint" type="button" @click="pickHint(hint)">{{ hint }}</button>
        </div>
      </div>
    </section>

    <section class="index-content">
      <div class="shell index-grid">
        <aside class="filter-wall">
          <p class="eyebrow">体裁 / CLASS</p>
          <div class="filter-list" role="group" aria-label="按体裁筛选">
            <button
              v-for="item in categories"
              :key="item.name"
              type="button"
              :class="{ 'is-active': category === item.name }"
              :aria-pressed="category === item.name"
              @click="selectCategory(item.name)"
            >
              <span>{{ item.name }}</span>
              <em>{{ String(item.count).padStart(2, "0") }}</em>
            </button>
          </div>
          <p class="filter-note">索引只列出已有诗目。未收录的体裁不显示为可点入口。</p>
        </aside>

        <section class="result-room" aria-labelledby="result-heading">
          <header class="result-head">
            <div>
              <p class="eyebrow">检索结果 / RESULT</p>
              <h2 id="result-heading">{{ resultHeading }}</h2>
            </div>
            <div class="result-head__right">
              <span>{{ resultSummary }}</span>
              <button v-if="query || category !== '全部'" type="button" @click="resetFilters">清除条件</button>
            </div>
          </header>

          <div v-if="loading" class="catalog-loading" role="status">正在整理诗目……</div>
          <div v-else-if="results.length" class="poem-list">
            <PoemRow
              v-for="(poem, index) in results"
              :key="poem.id"
              :poem="poem"
              :index="String(index + 1).padStart(2, '0')"
              :saved="isSaved(poem.id)"
              @toggle="savePoem"
            />
          </div>
          <div v-else class="empty-state">
            <h2>没有找到相合的诗句</h2>
            <p>换一个作者名，或减少关键词；也可以清除体裁筛选后再看一次。</p>
            <button class="button" type="button" @click="resetFilters">查看全部诗目</button>
          </div>
        </section>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppIcon from "../components/AppIcon.vue";
import PoemRow from "../components/PoemRow.vue";
import { loadCatalog, useLibrary } from "../composables/useLibrary.js";
import { notify } from "../composables/useNotices.js";

const route = useRoute();
const router = useRouter();
const { catalog, loading, isSaved, toggleSaved, queryPoems } = useLibrary();
const query = ref(String(route.query.q || ""));
const category = ref(String(route.query.category || "全部"));
const hints = ["月亮", "李白", "宋词", "春天"];

const categoryOrder = ["唐诗", "宋词", "诗经", "楚辞", "元曲", "花间集", "南唐词", "魏晋", "用户作品"];
const categories = computed(() => {
  const counts = new Map();
  for (const poem of catalog.value) {
    counts.set(poem.category, (counts.get(poem.category) || 0) + 1);
  }
  const names = [...counts.keys()].sort((left, right) => {
    const leftIndex = categoryOrder.indexOf(left);
    const rightIndex = categoryOrder.indexOf(right);
    return (leftIndex < 0 ? 99 : leftIndex) - (rightIndex < 0 ? 99 : rightIndex);
  });
  return [
    { name: "全部", count: catalog.value.length },
    ...names.map((name) => ({ name, count: counts.get(name) })),
  ];
});

const results = computed(() => queryPoems(query.value, category.value));
const resultHeading = computed(() => {
  if (query.value.trim()) return `“${query.value.trim()}”`;
  if (category.value !== "全部") return category.value;
  return "全部诗目";
});
const resultSummary = computed(() => {
  const scope = category.value === "全部" ? "全部体裁" : category.value;
  return `${scope} · 找到 ${results.value.length} 首`;
});

const syncRoute = () => {
  const nextQuery = {};
  if (query.value.trim()) nextQuery.q = query.value.trim();
  if (category.value !== "全部") nextQuery.category = category.value;
  router.replace({ name: "explore", query: nextQuery });
};

const pickHint = (hint) => {
  query.value = hint;
  syncRoute();
};

const clearSearch = () => {
  query.value = "";
  syncRoute();
};

const selectCategory = (name) => {
  category.value = name;
  syncRoute();
};

const resetFilters = () => {
  query.value = "";
  category.value = "全部";
  syncRoute();
};

const savePoem = (poem) => {
  const added = toggleSaved(poem);
  notify(added ? `已收藏《${poem.title}》` : `已取消收藏《${poem.title}》`, added ? "success" : "info");
};

watch(() => route.query.q, (value) => {
  if (String(value || "") !== query.value) query.value = String(value || "");
});
watch(() => route.query.category, (value) => {
  if (String(value || "全部") !== category.value) category.value = String(value || "全部");
});

onMounted(async () => {
  await loadCatalog();
  if (category.value !== "全部" && !categories.value.some((item) => item.name === category.value)) {
    category.value = "全部";
  }
});
</script>

<style scoped>
.index-page {
  min-height: 80vh;
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
  font-size: 10px;
  letter-spacing: 0.16em;
  writing-mode: vertical-rl;
}

.index-banner__copy h1 {
  margin: 0;
  font-family: var(--font-poem);
  font-size: clamp(42px, 6vw, 78px);
  font-weight: 400;
  letter-spacing: 0.05em;
  line-height: 1.18;
}

.index-banner__copy > p {
  margin: 20px 0 0;
  color: var(--ink-soft);
  font-size: 12px;
  line-height: 1.9;
}

.index-banner__total {
  display: grid;
  justify-items: end;
  padding-bottom: 6px;
}

.index-banner__total strong {
  color: var(--celadon-deep);
  font-family: var(--font-number);
  font-size: clamp(52px, 7vw, 90px);
  font-weight: 300;
  line-height: 1;
}

.index-banner__total span {
  color: var(--ink-faint);
  font-size: 10px;
  letter-spacing: 0.12em;
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
  width: 32px;
  height: 32px;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--ink-faint);
}

.index-search__button {
  min-width: 92px;
  height: 50px;
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
  font-size: 10px;
}

.quick-terms button {
  min-height: 26px;
  padding: 4px 10px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--ink-soft);
  font-size: 10px;
}

.quick-terms button:hover {
  border-color: var(--brass);
  color: var(--brass);
}

.index-content {
  padding-block: 60px 100px;
}

.index-grid {
  display: grid;
  grid-template-columns: 190px minmax(0, 1fr);
  gap: clamp(50px, 8vw, 120px);
  min-width: 0;
}

.filter-wall {
  align-self: start;
  position: sticky;
  top: 106px;
  min-width: 0;
}

.filter-list {
  display: grid;
  margin-top: 14px;
  border-top: 1px solid var(--line-strong);
  min-width: 0;
}

.filter-list button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border: 0;
  border-bottom: 1px solid var(--line);
  background: transparent;
  color: var(--ink-soft);
  font-size: 12px;
  text-align: left;
}

.filter-list button:hover,
.filter-list button.is-active {
  color: var(--brass);
}

.filter-list button.is-active span {
  font-weight: 600;
}

.filter-list em {
  color: var(--ink-faint);
  font-family: var(--font-number);
  font-size: 9px;
  font-style: normal;
}

.filter-note {
  margin: 18px 0 0;
  color: var(--ink-faint);
  font-size: 10px;
  line-height: 1.8;
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
}

.result-head__right {
  display: grid;
  justify-items: end;
  gap: 7px;
  color: var(--ink-faint);
  font-size: 10px;
}

.result-head__right button {
  padding: 0;
  border: 0;
  border-bottom: 1px solid var(--line-strong);
  background: transparent;
  color: var(--ink-soft);
  font-size: 10px;
}

.result-head__right button:hover {
  color: var(--brass);
}

.catalog-loading {
  padding: 72px 0;
  color: var(--ink-soft);
}

.poem-list {
  border-bottom: 1px solid var(--line);
}

@media (max-width: 900px) {
  .index-banner__inner {
    grid-template-columns: 40px 1fr;
    gap: 22px;
  }

  .index-banner__total {
    display: none;
  }

  .index-grid {
    grid-template-columns: 1fr;
    gap: 40px;
    min-width: 0;
  }

  .filter-wall {
    position: static;
  }

  .filter-list {
    display: flex;
    width: 100%;
    max-width: 100%;
    gap: 8px;
    overflow-x: auto;
    overscroll-behavior-inline: contain;
    scrollbar-width: none;
    padding-bottom: 4px;
    border-top: 0;
  }

  .filter-list::-webkit-scrollbar {
    display: none;
  }

  .filter-list button {
    flex: 0 0 auto;
    gap: 8px;
    padding: 7px 11px;
    border: 1px solid var(--line);
    white-space: nowrap;
  }

  .filter-list button.is-active {
    border-color: var(--ink);
    background: var(--ink);
    color: var(--porcelain-panel);
  }

  .filter-list button.is-active em {
    color: rgba(251, 252, 249, 0.58);
  }

  .filter-note {
    display: none;
  }

  .result-room {
    width: 100%;
    min-width: 0;
  }
}

@media (max-width: 600px) {
  .index-banner {
    padding-block: 38px 32px;
  }

  .index-label span {
    font-size: 30px;
  }

  .index-label p {
    display: none;
  }

  .index-banner__copy h1 {
    font-size: 40px;
  }

  .index-search {
    grid-template-columns: auto 1fr auto;
    padding-left: 14px;
  }

  .index-search__button {
    display: none;
  }

  .index-content {
    padding-block: 44px 70px;
  }

  .result-head {
    align-items: flex-start;
  }
}
</style>
