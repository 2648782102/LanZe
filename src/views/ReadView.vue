<template>
  <main class="gallery">
    <div class="gallery__ambient" aria-hidden="true">
      <span class="halo" />
      <span class="halo halo--small" />
      <span class="gallery__vertical">LANZE · POETRY ROOM</span>
    </div>

    <section class="gallery__room">
      <div class="shell room-grid">
        <header class="room-head">
          <p class="eyebrow">今日展厅 · {{ dateLabel }}</p>
          <div class="room-count">
            <span>{{ String((page % Math.max(catalog.length, 1)) + 1).padStart(2, "0") }}</span>
            <em>/ {{ String(Math.max(catalog.length, 1)).padStart(2, "0") }}</em>
          </div>
        </header>

        <div class="poem-plinth">
          <p class="poem-plinth__meta">
            <span>{{ poem.category }}</span>
            <span aria-hidden="true" />
            <span>{{ poem.author }}</span>
          </p>
          <h1 :class="`title-length--${titleScale}`">
            <span v-for="(part, index) in titleParts" :key="index">{{ part }}</span>
          </h1>
          <div class="poem-plinth__body" :class="{ 'is-switching': isSwitching }">
            <p v-for="(line, index) in poemLines" :key="`${poem.id}-${index}`">{{ line }}</p>
          </div>
          <div class="poem-plinth__actions">
            <button class="gallery-action" type="button" @click="toggleSave">
              <AppIcon :name="saved ? 'check' : 'bookmark'" :size="17" />
              {{ saved ? "已收入诗卷" : "收入诗卷" }}
            </button>
            <button class="gallery-action" type="button" @click="speakPoem">
              <AppIcon name="volume" :size="17" />
              朗读
            </button>
            <router-link class="gallery-action" :to="{ name: 'poem', params: { id: poem.id } }">
              展开笺注
              <AppIcon name="arrow-right" :size="16" />
            </router-link>
          </div>
        </div>

        <div class="exhibit-card" aria-label="今日诗意图">
          <div class="exhibit-card__frame">
            <img
              :src="exhibitImage"
              alt="月色与白花构成的青灰色诗意图"
              width="672"
              height="768"
              decoding="async"
              fetchpriority="high"
            />
            <span class="exhibit-card__seal">兰泽馆藏</span>
          </div>
          <div class="exhibit-card__caption">
            <div>
              <small>视觉注释</small>
              <strong>{{ poem.tags?.[1] || "诗与夜色" }}</strong>
            </div>
            <button type="button" aria-label="换一首诗" @click="nextPoem">
              <AppIcon name="chevron-right" :size="20" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="gallery__strips">
      <div class="shell strips-grid">
        <article class="strip-intro">
          <p class="eyebrow">余韵 · 三则</p>
          <h2>读完一首，<br />让句子再走一段。</h2>
          <p>摘录来自仓库内置示例。它们不假装是运营数据，只是此刻顺手翻到的三行。</p>
          <router-link class="button" to="/explore">
            进入诗词索引
            <AppIcon name="arrow-right" :size="16" />
          </router-link>
        </article>
        <ol class="strip-list">
          <li v-for="(excerpt, index) in excerpts" :key="excerpt.content">
            <span>{{ String(index + 1).padStart(2, "0") }}</span>
            <p>{{ excerpt.content }}</p>
            <small>{{ excerpt.author }} · {{ excerpt.origin }}</small>
          </li>
        </ol>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import AppIcon from "../components/AppIcon.vue";
import { demoExcerpts } from "../data/poems.js";
import { loadCatalog, useLibrary } from "../composables/useLibrary.js";
import { notify } from "../composables/useNotices.js";
import exhibitImage from "../assets/exhibit/songci300-768.jpg";

const { catalog, isSaved, toggleSaved } = useLibrary();
const now = new Date();
const dateLabel = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric",
}).format(now);
const dayIndex = Math.floor(Date.now() / 86400000);
const page = ref(dayIndex % 10);
const isSwitching = ref(false);
let switchTimer;

const poem = computed(() => catalog.value[page.value % Math.max(catalog.value.length, 1)] || {});
const poemLines = computed(() => poem.value.paragraphs || [poem.value.paragraph || "正在展开诗笺……"]);
const titleScale = computed(() => {
  const length = String(poem.value.title || "").length;
  if (length >= 10 || String(poem.value.title || "").includes("·")) return "long";
  if (length > 6) return "medium";
  return "short";
});
const titleParts = computed(() => {
  const title = String(poem.value.title || "");
  const separator = title.indexOf("·");
  if (separator > 0) {
    return [title.slice(0, separator), title.slice(separator + 1).trim()].filter(Boolean);
  }
  if (title.length > 8) {
    const middle = Math.ceil(title.length / 2);
    return [title.slice(0, middle), title.slice(middle)];
  }
  return [title];
});
const saved = computed(() => isSaved(poem.value.id));
const excerpts = computed(() => {
  const start = page.value % demoExcerpts.length;
  return Array.from({ length: 3 }, (_, index) => demoExcerpts[(start + index) % demoExcerpts.length]);
});

const nextPoem = () => {
  if (isSwitching.value) return;
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  isSwitching.value = true;
  window.clearTimeout(switchTimer);
  switchTimer = window.setTimeout(() => {
    page.value = (page.value + 1) % Math.max(catalog.value.length, 1);
    switchTimer = window.setTimeout(() => { isSwitching.value = false; }, reducedMotion ? 0 : 140);
  }, reducedMotion ? 0 : 120);
};

const toggleSave = () => {
  if (!poem.value.id) return;
  const added = toggleSaved(poem.value);
  notify(added ? "已收入你的诗卷" : "已从诗卷移除", added ? "success" : "info");
};

const speakPoem = () => {
  if (!("speechSynthesis" in window)) {
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

onMounted(loadCatalog);
onBeforeUnmount(() => window.clearTimeout(switchTimer));
</script>

<style scoped>
.gallery {
  position: relative;
  overflow: hidden;
  background: var(--porcelain);
}

.gallery__ambient {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 76% 31%, rgba(168, 196, 184, 0.33), transparent 30%),
    linear-gradient(115deg, rgba(255, 255, 255, 0.66), transparent 38%);
  pointer-events: none;
}

.halo {
  position: absolute;
  right: -10vw;
  top: -24vw;
  width: 64vw;
  height: 64vw;
  border: 1px solid rgba(81, 122, 112, 0.12);
  border-radius: 50%;
}

.halo--small {
  right: 3vw;
  top: -9vw;
  width: 40vw;
  height: 40vw;
  border-color: rgba(168, 130, 69, 0.12);
}

.gallery__vertical {
  position: absolute;
  right: 18px;
  top: 36%;
  color: rgba(22, 44, 43, 0.18);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.32em;
  writing-mode: vertical-rl;
}

.gallery__room {
  position: relative;
  z-index: 1;
  min-height: calc(100vh - var(--header-height));
  display: grid;
  align-items: center;
}

.gallery__room::before,
.gallery__room::after {
  position: absolute;
  top: 9%;
  bottom: 9%;
  width: 1px;
  background: linear-gradient(transparent, var(--line), transparent);
  content: "";
}

.gallery__room::before { left: max(24px, calc((100vw - 1240px) / 2 - 36px)); }
.gallery__room::after { right: max(24px, calc((100vw - 1240px) / 2 - 36px)); }

.room-grid {
  position: relative;
  display: grid;
  min-height: 660px;
  min-width: 0;
  grid-template-columns: minmax(0, 0.92fr) minmax(260px, 0.52fr);
  align-content: space-between;
  column-gap: clamp(48px, 8vw, 118px);
  row-gap: 46px;
  padding-block: 48px 54px;
}

.room-head {
  display: flex;
  grid-column: 1 / -1;
  align-items: flex-start;
  justify-content: space-between;
  min-width: 0;
}

.room-count {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-family: var(--font-number);
}

.room-count span {
  color: var(--brass);
  font-size: 34px;
  font-weight: 300;
  line-height: 1;
}

.room-count em {
  color: var(--ink-faint);
  font-size: 10px;
  font-style: normal;
  letter-spacing: 0.12em;
}

.poem-plinth {
  align-self: center;
  min-width: 0;
  max-width: 680px;
  min-height: 440px;
}

.poem-plinth__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 20px;
  color: var(--brass);
  font-size: 11px;
  letter-spacing: 0.2em;
}

.poem-plinth__meta span:nth-child(2) {
  width: 34px;
  height: 1px;
  background: var(--brass-soft);
}

.poem-plinth__meta span:last-child {
  color: var(--ink-soft);
  letter-spacing: 0.12em;
}

.poem-plinth h1 {
  max-width: 100%;
  margin: 0;
  font-family: var(--font-poem);
  font-size: clamp(48px, 6.2vw, 86px);
  font-weight: 400;
  letter-spacing: 0.04em;
  line-height: 1.16;
  overflow-wrap: anywhere;
}

.poem-plinth h1 span {
  display: inline;
}

.poem-plinth h1.title-length--medium {
  font-size: clamp(42px, 5.2vw, 72px);
  letter-spacing: 0.025em;
}

.poem-plinth h1.title-length--long {
  font-size: clamp(36px, 4.4vw, 60px);
  letter-spacing: 0.015em;
  line-height: 1.2;
}

.poem-plinth h1.title-length--long span {
  display: block;
}

.poem-plinth h1.title-length--long span + span {
  margin-top: 4px;
  padding-left: 0.8em;
  border-left: 1px solid var(--brass-soft);
  color: var(--ink-soft);
}

.poem-plinth__body {
  display: grid;
  gap: 10px;
  margin-top: clamp(28px, 4vw, 48px);
  padding: 10px 0 10px 28px;
  border-left: 1px solid var(--brass-soft);
  transition: opacity 120ms ease;
}

.poem-plinth__body.is-switching {
  opacity: 0.28;
}

.poem-plinth__body p {
  margin: 0;
  font-family: var(--font-poem);
  font-size: clamp(18px, 1.75vw, 24px);
  letter-spacing: 0.08em;
  line-height: 1.7;
}

.poem-plinth__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 34px;
}

.gallery-action {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  gap: 9px;
  padding: 9px 16px;
  border: 1px solid var(--line-strong);
  background: rgba(251, 252, 249, 0.62);
  color: var(--ink-soft);
  font-size: 12px;
  letter-spacing: 0.06em;
}

.gallery-action:hover {
  border-color: var(--brass);
  background: var(--porcelain-panel);
  color: var(--ink);
}

.exhibit-card {
  align-self: center;
  justify-self: end;
  width: min(100%, 320px);
}

.exhibit-card__frame {
  position: relative;
  padding: 13px;
  border: 1px solid var(--line);
  background: rgba(251, 252, 249, 0.7);
  box-shadow: 0 12px 32px rgba(22, 49, 46, 0.08);
}

.exhibit-card__frame::before {
  position: absolute;
  inset: 5px;
  border: 1px solid rgba(168, 130, 69, 0.28);
  content: "";
}

.exhibit-card__frame img {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  aspect-ratio: 0.76;
  height: auto;
  object-fit: cover;
  filter: saturate(0.5) contrast(1.04);
}

.exhibit-card__seal {
  position: absolute;
  right: 23px;
  bottom: 23px;
  z-index: 2;
  padding: 6px 8px;
  border: 1px solid rgba(238, 246, 241, 0.5);
  background: rgba(16, 40, 39, 0.42);
  color: rgba(251, 252, 249, 0.9);
  font-family: var(--font-poem);
  font-size: 9px;
  letter-spacing: 0.14em;
}

.exhibit-card__caption {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding-top: 15px;
}

.exhibit-card__caption > div {
  display: grid;
  gap: 2px;
}

.exhibit-card__caption small {
  color: var(--ink-faint);
  font-size: 9px;
  letter-spacing: 0.13em;
}

.exhibit-card__caption strong {
  font-family: var(--font-poem);
  font-size: 15px;
  font-weight: 400;
  letter-spacing: 0.08em;
}

.exhibit-card__caption button {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border: 1px solid var(--line-strong);
  border-radius: 50%;
  background: transparent;
  color: var(--ink);
}

.exhibit-card__caption button:hover {
  border-color: var(--brass);
  background: var(--ink);
  color: var(--porcelain-panel);
}

.gallery__strips {
  position: relative;
  z-index: 1;
  border-top: 1px solid var(--line);
  background: rgba(232, 236, 229, 0.56);
}

.strips-grid {
  display: grid;
  grid-template-columns: minmax(260px, 0.62fr) minmax(0, 1.38fr);
  gap: clamp(50px, 9vw, 130px);
  padding-block: 78px 90px;
}

.strip-intro {
  display: grid;
  align-content: start;
  justify-items: start;
  gap: 18px;
}

.strip-intro h2 {
  margin: 0;
  font-family: var(--font-poem);
  font-size: clamp(30px, 4vw, 48px);
  font-weight: 400;
  letter-spacing: 0.05em;
  line-height: 1.35;
}

.strip-intro > p:not(.eyebrow) {
  max-width: 380px;
  margin: 0;
  color: var(--ink-soft);
  font-size: 12px;
  line-height: 1.9;
}

.strip-list {
  display: grid;
  margin: 0;
  padding: 0;
  list-style: none;
}

.strip-list li {
  display: grid;
  grid-template-columns: 44px 1fr auto;
  align-items: baseline;
  gap: 18px;
  padding: 24px 0;
  border-bottom: 1px solid var(--line);
}

.strip-list li:first-child {
  padding-top: 4px;
}

.strip-list li > span {
  color: var(--brass);
  font-family: var(--font-number);
  font-size: 11px;
}

.strip-list p {
  margin: 0;
  font-family: var(--font-poem);
  font-size: 19px;
  letter-spacing: 0.06em;
}

.strip-list small {
  color: var(--ink-faint);
  font-size: 10px;
  white-space: nowrap;
}

@media (max-width: 1000px) {
  .room-grid {
    grid-template-columns: minmax(0, 1fr) 250px;
    column-gap: 32px;
  }

  .poem-plinth h1 {
    font-size: clamp(42px, 6vw, 68px);
  }

  .poem-plinth h1.title-length--medium {
    font-size: clamp(38px, 5.2vw, 58px);
  }

  .poem-plinth h1.title-length--long {
    font-size: clamp(32px, 4.2vw, 48px);
  }
}

@media (max-width: 820px) {
  .gallery__vertical,
  .gallery__room::before,
  .gallery__room::after,
  .halo {
    display: none;
  }

  .room-grid {
    min-height: auto;
    grid-template-columns: 1fr;
    gap: 40px;
    padding-block: 28px 52px;
  }

  .poem-plinth h1 {
    font-size: clamp(40px, 10vw, 66px);
  }

  .poem-plinth h1.title-length--medium {
    font-size: clamp(34px, 8.6vw, 56px);
  }

  .poem-plinth h1.title-length--long {
    font-size: clamp(27px, 6.8vw, 42px);
  }

  .poem-plinth h1.title-length--long span + span {
    padding-left: 0.35em;
  }

  .exhibit-card {
    justify-self: stretch;
    width: 100%;
  }

  .exhibit-card__frame img {
    aspect-ratio: 1.5;
  }

  .strips-grid {
    grid-template-columns: 1fr;
    gap: 44px;
    padding-block: 58px 66px;
  }
}

@media (max-width: 560px) {
  .room-head {
    padding-top: 4px;
    overflow: hidden;
  }

  .room-count {
    transform: scale(0.82);
    transform-origin: right center;
    white-space: nowrap;
  }

  .poem-plinth__body {
    padding-left: 18px;
  }

  .poem-plinth {
    min-height: 0;
  }

  .poem-plinth__body p {
    font-size: 18px;
  }

  .poem-plinth h1.title-length--long {
    font-size: clamp(25px, 7vw, 34px);
    letter-spacing: 0;
  }

  .poem-plinth h1.title-length--long span + span {
    padding-left: 0;
    border-left: 0;
  }

  .poem-plinth__actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .poem-plinth__actions .gallery-action:last-child {
    grid-column: 1 / -1;
  }

  .strip-list li {
    grid-template-columns: 30px 1fr;
    gap: 8px 12px;
  }

  .strip-list small {
    grid-column: 2;
  }
}
</style>
