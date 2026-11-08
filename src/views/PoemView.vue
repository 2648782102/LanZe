<template>
  <main class="poem-page">
    <div class="shell">
      <nav class="breadcrumb" aria-label="面包屑">
        <router-link to="/explore">诗词索引</router-link>
        <AppIcon name="chevron-right" :size="14" />
        <span>{{ poem?.category || "读诗" }}</span>
      </nav>

      <article v-if="poem" class="poem-sheet">
        <aside class="poem-side">
          <p class="poem-side__category">{{ poem.category }}</p>
          <p class="poem-side__author">{{ poem.author }}</p>
          <div class="poem-side__actions">
            <button
              class="icon-action"
              type="button"
              :class="{ 'is-saved': saved }"
              :aria-label="saved ? '取消收藏' : '收入诗卷'"
              :aria-pressed="saved"
              @click="toggleSave"
            >
              <AppIcon :name="saved ? 'check' : 'bookmark'" :size="19" />
              <span>{{ saved ? "已收入" : "收入诗卷" }}</span>
            </button>
            <button class="icon-action" type="button" aria-label="朗读这首诗" @click="speakPoem">
              <AppIcon name="volume" :size="19" />
              <span>朗读</span>
            </button>
            <button class="icon-action" type="button" aria-label="复制这首诗的链接" @click="copyLink">
              <AppIcon name="copy" :size="19" />
              <span>复制链接</span>
            </button>
          </div>
          <router-link class="poem-side__back" to="/explore">
            <AppIcon name="arrow-left" :size="16" />
            返回索引
          </router-link>
        </aside>

        <div class="poem-body">
          <header class="poem-head">
            <p>{{ sourceLabel }}</p>
            <h1 :class="{ 'has-parts': titleParts.length > 1 }">
              <span v-for="(part, index) in titleParts" :key="index">{{ part }}</span>
            </h1>
            <span>{{ poem.author }}</span>
          </header>

          <div class="poem-text">
            <p v-for="(line, index) in poemLines" :key="index">{{ line }}</p>
          </div>

          <div v-if="poem.tags?.length" class="poem-tags" aria-label="诗词标签">
            <span v-for="tag in poem.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>

          <section v-if="annotation.length" class="annotation" aria-labelledby="annotation-heading">
            <h2 id="annotation-heading">笺注</h2>
            <p v-for="(note, index) in annotation" :key="index">{{ note }}</p>
          </section>

          <p class="poem-disclaimer">
            演示文本用于界面展示。引用、出版或教学使用前，请自行核对底本与点校信息。
          </p>

          <nav v-if="adjacent.previous || adjacent.next" class="reading-continuation" aria-label="连续阅读">
            <router-link
              v-if="adjacent.previous"
              class="reading-continuation__link"
              :to="{ name: 'poem', params: { id: adjacent.previous.id } }"
            >
              <AppIcon name="arrow-left" :size="16" />
              <span>上一首</span>
              <strong>{{ adjacent.previous.title }}</strong>
            </router-link>
            <router-link
              v-if="adjacent.next"
              class="reading-continuation__link reading-continuation__link--next"
              :to="{ name: 'poem', params: { id: adjacent.next.id } }"
            >
              <span>下一首</span>
              <AppIcon name="arrow-right" :size="16" />
              <strong>{{ adjacent.next.title }}</strong>
            </router-link>
          </nav>
        </div>
      </article>

      <section v-else class="empty-state">
        <h2>这首诗没有留在索引里</h2>
        <p>链接可能来自旧版页面，或数据只存在于创建它的浏览器中。</p>
        <router-link class="button button--solid" to="/explore">回到诗词索引</router-link>
      </section>

      <section v-if="related.length" class="related-section" aria-labelledby="related-heading">
        <header>
          <h2 id="related-heading">再读几首</h2>
          <router-link to="/explore">
            全部诗目
            <AppIcon name="arrow-right" :size="15" />
          </router-link>
        </header>
        <div class="related-list">
          <router-link
            v-for="item in related"
            :key="item.id"
            :to="{ name: 'poem', params: { id: item.id } }"
          >
            <span>{{ item.category }}</span>
            <strong>{{ item.title }}</strong>
            <em>{{ item.author }}</em>
          </router-link>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import AppIcon from "../components/AppIcon.vue";
import { normalizePoem } from "../data/poems.js";
import { loadCatalog, relatedLibraryPoems, useCatalogVersion, useLibrary } from "../composables/useLibrary.js";
import { getAdjacentLibraryPoems } from "../data/poetryCatalog.js";
import { notify } from "../composables/useNotices.js";
import { normalizeDetails, parseJsonObject } from "../utils/poemQuery.js";

const route = useRoute();
const { getPoem, isSaved, toggleSaved, recordRecent } = useLibrary();
const catalogVersion = useCatalogVersion();

const legacyPoem = computed(() => {
  if (route.params.id !== "legacy") return null;
  const source = parseJsonObject(route.query.shici, null);
  if (!source) return null;
  const details = normalizeDetails(source);
  return normalizePoem({
    id: `legacy-${details.title}`,
    title: details.title,
    author: details.author,
    category: "旧版摘录",
    tags: details.tags,
    paragraphs: details.paragraphs,
    paragraph: details.paragraphs[0] || "",
    titleNote: details.annotation,
    type: "legacy",
  });
});

const poem = computed(() => legacyPoem.value || getPoem(String(route.params.id || "")));
const poemLines = computed(() => poem.value?.paragraphs || [poem.value?.paragraph].filter(Boolean));
const sourceLabel = computed(() =>
  [poem.value?.dynasty, poem.value?.collection || poem.value?.source].filter(Boolean).join(" · ") || "馆藏",
);
const annotation = computed(() => {
  const value = poem.value?.titleNote;
  if (Array.isArray(value)) return value;
  return value ? [String(value)] : [];
});
const titleParts = computed(() => {
  const title = String(poem.value?.title || "");
  const separator = title.indexOf("·");
  if (separator > 0) return [title.slice(0, separator), title.slice(separator + 1).trim()].filter(Boolean);
  return [title];
});
const saved = computed(() => (poem.value ? isSaved(poem.value.id) : false));
const related = computed(() => {
  catalogVersion.value;
  if (!poem.value) return [];
  return relatedLibraryPoems(poem.value, 3);
});
const adjacent = computed(() => {
  catalogVersion.value;
  return getAdjacentLibraryPoems(poem.value);
});

const toggleSave = () => {
  if (!poem.value) return;
  const added = toggleSaved(poem.value);
  notify(added ? "已收入你的诗卷" : "已从诗卷移除", added ? "success" : "info");
};

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    notify("链接已复制", "success");
  } catch {
    notify("浏览器不允许自动复制，请从地址栏复制", "warning");
  }
};

const speakPoem = () => {
  if (!("speechSynthesis" in window) || !poem.value) {
    notify("当前浏览器不支持朗读", "warning");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(
    `${poem.value.title}。${poem.value.author}。${poemLines.value.join("。")}`,
  );
  utterance.lang = "zh-CN";
  utterance.rate = 0.86;
  window.speechSynthesis.speak(utterance);
};

watch(
  poem,
  (value) => {
    if (value?.id) recordRecent(value);
  },
  { immediate: true },
);

onMounted(loadCatalog);

</script>

<style scoped>
.poem-page {
  min-height: 80dvh;
  padding: 28px 0 80px;
  background: var(--porcelain);
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  color: var(--ink-faint);
  font-size: 11px;
}

.breadcrumb a:hover {
  color: var(--clay);
}

.poem-sheet {
  display: grid;
  grid-template-columns: minmax(150px, 0.28fr) minmax(0, 1fr);
  min-height: 650px;
  border-radius: 0;
  margin-top: 24px;
  border: 1px solid var(--line);
  background: var(--porcelain-panel);
  box-shadow: var(--shadow-soft);
}

.poem-side {
  display: flex;
  flex-direction: column;
  padding: 46px 28px 32px;
  border-right: 1px solid var(--line);
  background: var(--porcelain-deep);
}

.poem-side__category {
  margin: 0 0 7px;
  color: var(--brass);
  font-size: 11px;
  letter-spacing: 0.14em;
}

.poem-side__author {
  margin: 0;
  color: var(--ink-soft);
  font-family: var(--font-poem);
  font-size: 17px;
  letter-spacing: 0.12em;
}

.poem-side__actions {
  display: grid;
  gap: 4px;
  margin-top: 38px;
}

.icon-action {
  display: flex;
  min-height: 44px;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border: 0;
  background: transparent;
  color: var(--ink-soft);
  font-size: 12px;
  text-align: left;
}

.icon-action:hover,
.icon-action.is-saved {
  color: var(--brass);
}

.poem-side__back {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  gap: 7px;
  margin-top: auto;
  padding-top: 30px;
  color: var(--ink-faint);
  font-size: 11px;
}

.poem-side__back:hover {
  color: var(--ink);
}

.poem-body {
  display: flex;
  min-width: 0;
  flex-direction: column;
  padding: clamp(48px, 8vw, 104px) clamp(32px, 10vw, 150px) 54px;
}

.poem-head {
  display: grid;
  justify-items: center;
  gap: 10px;
  text-align: center;
}

.poem-head p {
  margin: 0;
  color: var(--brass);
  font-size: 10px;
  letter-spacing: 0.2em;
}

.poem-head h1 {
  max-width: 760px;
  margin: 0;
  font-family: var(--font-poem);
  font-size: clamp(38px, 5.4vw, 70px);
  font-weight: 400;
  letter-spacing: 0.08em;
  line-height: 1.2;
}

.poem-head h1.has-parts {
  font-size: clamp(34px, 4.6vw, 58px);
}

.poem-head h1.has-parts span {
  display: block;
}

.poem-head h1.has-parts span + span {
  margin-top: 8px;
  color: var(--ink-soft);
  font-size: 0.7em;
  letter-spacing: 0.1em;
}

.poem-head span {
  color: var(--ink-soft);
  font-family: var(--font-poem);
  font-size: 15px;
  letter-spacing: 0.18em;
}

.poem-text {
  display: grid;
  max-width: 760px;
  gap: 12px;
  margin: clamp(46px, 7vw, 78px) auto 0;
  text-align: center;
}

.poem-text p {
  margin: 0;
  font-family: var(--font-poem);
  font-size: clamp(21px, 2.4vw, 31px);
  letter-spacing: 0.11em;
  line-height: 1.75;
  transition: color var(--motion-fast) var(--ease-standard);
}

.poem-text p:hover {
  color: var(--brass);
}

.poem-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 44px;
}

.annotation {
  max-width: 680px;
  margin: 52px auto 0;
  padding-top: 24px;
  border-top: 1px solid var(--line);
}

.annotation h2 {
  margin: 0 0 12px;
  font-family: var(--font-poem);
  font-size: 20px;
  font-weight: 400;
  letter-spacing: 0.1em;
}

.annotation p {
  margin: 0 0 8px;
  color: var(--ink-soft);
  font-size: 13px;
  line-height: 1.9;
}

.poem-disclaimer {
  margin: auto auto 0;
  padding-top: 54px;
  color: var(--ink-faint);
  font-size: 10px;
  letter-spacing: 0.03em;
  text-align: center;
}

.reading-continuation {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 36px;
  padding-top: 24px;
  border-top: 1px solid var(--line);
}

.reading-continuation__link {
  display: grid;
  min-width: 0;
  min-height: 64px;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 4px 8px;
  padding: 10px 14px;
  border: 1px solid var(--line);
  color: var(--ink-soft);
  transition:
    border-color var(--motion-fast) var(--ease-standard),
    background-color var(--motion-fast) var(--ease-standard),
    transform var(--motion-fast) var(--ease-out);
}

.reading-continuation__link:hover {
  border-color: var(--brass);
  background: rgba(216, 191, 142, 0.1);
  transform: translateY(-1px);
}

.reading-continuation__link--next {
  grid-template-columns: minmax(0, 1fr) auto;
  justify-items: end;
  text-align: right;
}

.reading-continuation__link > span {
  color: var(--brass);
  font-size: 10px;
  letter-spacing: 0.12em;
}

.reading-continuation__link > strong {
  grid-column: 1 / -1;
  overflow: hidden;
  font-family: var(--font-poem);
  font-size: 15px;
  font-weight: 400;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.related-section {
  margin-top: 74px;
}

.related-section > header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 20px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--line-strong);
}

.related-section h2 {
  margin: 0;
  font-family: var(--font-poem);
  font-size: 30px;
  font-weight: 400;
  letter-spacing: 0.08em;
}

.related-section header a {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--ink-soft);
  font-size: 11px;
}

.related-section header a:hover {
  color: var(--brass);
}

.related-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.related-list a {
  display: grid;
  gap: 7px;
  padding: 24px 24px 24px 0;
  border-bottom: 1px solid var(--line);
}

.related-list a + a {
  padding-left: 24px;
  border-left: 1px solid var(--line);
}

.related-list span {
  color: var(--brass);
  font-size: 10px;
}

.related-list strong {
  font-family: var(--font-poem);
  font-size: 20px;
  font-weight: 400;
  letter-spacing: 0.04em;
}

.related-list em {
  color: var(--ink-faint);
  font-size: 11px;
  font-style: normal;
}

.related-list a:hover strong {
  color: var(--brass);
}

@media (max-width: 820px) {
  .poem-sheet {
    grid-template-columns: 1fr;
  }

  .poem-side {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 10px 20px;
    padding: 24px 22px;
    border-right: 0;
    border-bottom: 1px solid var(--line);
  }

  .poem-side__actions {
    display: flex;
    grid-column: 1 / -1;
    grid-row: 2;
    gap: 22px;
    margin-top: 12px;
    overflow-x: auto;
  }

  .icon-action {
    flex: 0 0 auto;
  }

  .poem-side__back {
    grid-column: 2;
    grid-row: 1;
    align-self: center;
    margin-top: 0;
    padding-top: 8px;
  }

  .poem-body {
    padding: 54px 22px 36px;
  }

  .reading-continuation {
    grid-template-columns: 1fr;
  }

  .related-list {
    grid-template-columns: 1fr;
  }

  .related-list a + a {
    padding-left: 0;
    border-left: 0;
  }
}

@media (max-width: 520px) {
  .poem-page {
    padding-top: 14px;
  }

  .poem-head h1 {
    font-size: 39px;
  }

  .poem-head h1.has-parts {
    font-size: 32px;
  }

  .poem-head h1.has-parts span + span {
    font-size: 0.76em;
  }

  .poem-text {
    margin-top: 42px;
  }

  .poem-text p {
    font-size: 20px;
  }
}
</style>
