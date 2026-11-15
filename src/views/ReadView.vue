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
          <p class="room-archive">今日展厅 · 十首精校短章</p>
          <div class="room-count">
            <span>{{ String((page % featured.length) + 1).padStart(2, "0") }}</span>
            <em>/ {{ String(featured.length).padStart(2, "0") }}</em>
          </div>
        </header>

        <div class="poem-plinth" :key="poem.id">
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
            <button class="gallery-action" type="button" :class="{ 'is-confirmed': saved && savePulse }" @click="toggleSave">
              <AppIcon :name="saved ? 'check' : 'bookmark'" :size="17" />
              {{ saved ? "已收入诗卷" : "收入诗卷" }}
            </button>
            <button
              class="gallery-action"
              type="button"
              :aria-pressed="isSpeaking"
              :aria-label="isSpeaking ? '停止朗读' : '朗读这首诗'"
              @click="speakPoem"
            >
              <AppIcon :name="isSpeaking ? 'pause' : 'volume'" :size="17" />
              {{ isSpeaking ? "停止" : "朗读" }}
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
              alt="月色与花枝构成的青灰色诗意图"
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
            <button type="button" aria-label="换一首诗" :class="{ 'is-turning': isSwitching }" @click="nextPoem">
              <AppIcon name="chevron-right" :size="20" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <ExcerptSection
      :excerpt="stack[0] || null"
      :upcoming="stack.slice(1)"
      :depth="depth"
      :loading="status === 'loading'"
      :source-label="sourceLabel"
      @toggle-save="toggleSavedExcerpt"
      @needs-next="prepareRemote"
      @settled="turn"
    />
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from "vue";
import AppIcon from "../components/AppIcon.vue";
import ExcerptSection from "../components/ExcerptSection.vue";
import { useLibrary } from "../composables/useLibrary.js";
import { useExcerptDeck } from "../composables/useExcerptDeck.js";
import { notify } from "../composables/useNotices.js";
import { curatedPoems, getDailyLibraryPoem, asLibraryPoem } from "../data/poetryCatalog.js";
import exhibitImage from "../assets/exhibit/poem-768.jpg";

const { isSaved, toggleSaved } = useLibrary();
const {
  stack,
  status,
  sourceLabel,
  depth,
  prepareRemote,
  turn,
  toggleSavedExcerpt,
} = useExcerptDeck();
const getFeaturedPoems = () => [
  getDailyLibraryPoem(),
  ...curatedPoems.slice(1, 10).map(asLibraryPoem),
];
const now = new Date();
const dateLabel = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric",
}).format(now);
const dayIndex = Math.floor(Date.now() / 86400000);
const featured = getFeaturedPoems();
const page = ref(dayIndex % featured.length);
const isSwitching = ref(false);
const isSpeaking = ref(false);
const savePulse = ref(false);
let switchTimer;
let saveTimer;

const poem = computed(() => featured[page.value % featured.length] || getDailyLibraryPoem());
const poemLines = computed(() => poem.value.paragraphs || [poem.value.paragraph || "正在铺开诗笺……"]);
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

const nextPoem = () => {
  if (isSwitching.value) return;
  if (isSpeaking.value) {
    window.speechSynthesis?.cancel();
    isSpeaking.value = false;
  }
  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  isSwitching.value = true;
  window.clearTimeout(switchTimer);
  switchTimer = window.setTimeout(() => {
    page.value = (page.value + 1) % featured.length;
    switchTimer = window.setTimeout(() => { isSwitching.value = false; }, prefersReducedMotion ? 0 : 140);
  }, prefersReducedMotion ? 0 : 120);
};

const toggleSave = () => {
  if (!poem.value.id) return;
  const added = toggleSaved(poem.value);
  savePulse.value = false;
  if (added) {
    requestAnimationFrame(() => {
      savePulse.value = true;
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(() => {
        savePulse.value = false;
      }, 420);
    });
  }
  notify(added ? "已收入你的诗卷" : "已从诗卷移除", added ? "success" : "info");
};

const speakPoem = () => {
  if (!("speechSynthesis" in window)) {
    notify("当前浏览器不支持朗读", "warning");
    return;
  }
  window.speechSynthesis.cancel();
  if (isSpeaking.value) {
    isSpeaking.value = false;
    return;
  }
  const utterance = new SpeechSynthesisUtterance(
    `${poem.value.title}。${poem.value.author}。${poemLines.value.join("。")}`,
  );
  utterance.lang = "zh-CN";
  utterance.rate = 0.86;
  utterance.onend = () => { isSpeaking.value = false; };
  utterance.onerror = () => { isSpeaking.value = false; };
  isSpeaking.value = true;
  window.speechSynthesis.speak(utterance);
};

onBeforeUnmount(() => {
  window.clearTimeout(switchTimer);
  window.clearTimeout(saveTimer);
  if (isSpeaking.value) {
    window.speechSynthesis?.cancel();
    isSpeaking.value = false;
  }
});
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
  right: 0;
  top: -24vw;
  width: 64vw;
  height: 64vw;
  border: 1px solid rgba(81, 122, 112, 0.12);
  border-radius: 50%;
}

.halo--small {
  right: 0;
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
  font-size: var(--text-meta);
  font-weight: 600;
  letter-spacing: 0.28em;
  writing-mode: vertical-rl;
}

.gallery__room {
  position: relative;
  z-index: 1;
  min-height: calc(100dvh - var(--header-height));
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
  min-height: 620px;
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
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-width: 0;
}

.room-archive {
  margin: 0 auto 0 24px;
  color: var(--ink-faint);
  font-size: var(--text-meta);
  letter-spacing: 0.04em;
}

.room-count {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-family: var(--font-number);
}

.room-count span {
  color: var(--brass-text);
  font-size: 34px;
  font-weight: 300;
  line-height: 1;
}

.room-count em {
  color: var(--ink-faint);
  font-size: var(--text-meta);
  font-style: normal;
  letter-spacing: 0.1em;
}

.poem-plinth {
  align-self: center;
  min-width: 0;
  max-width: 680px;
  min-height: 440px;
  animation: plinth-arrive var(--motion-slow) var(--ease-out) both;
}

@keyframes plinth-arrive {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.poem-plinth__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 20px;
  color: var(--brass-text);
  font-size: var(--text-meta);
  letter-spacing: 0.12em;
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
  text-wrap: balance;
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
  transition:
    opacity var(--motion-fast) var(--ease-standard),
    transform var(--motion-base) var(--ease-out);
}

.poem-plinth__body.is-switching {
  opacity: 0.28;
  transform: translateY(4px);
}

.poem-plinth__body p {
  margin: 0;
  font-family: var(--font-poem);
  font-size: clamp(18px, 1.75vw, 24px);
  letter-spacing: var(--tracking-poem);
  line-height: 1.8;
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
  font-size: var(--text-body);
  letter-spacing: 0.05em;
  transition:
    border-color var(--motion-fast) var(--ease-standard),
    background-color var(--motion-fast) var(--ease-standard),
    color var(--motion-fast) var(--ease-standard),
    transform var(--motion-fast) var(--ease-standard);
}

.gallery-action:hover {
  border-color: var(--brass);
  background: var(--porcelain-panel);
  color: var(--ink);
}

.gallery-action:active {
  transform: scale(0.98);
}

.gallery-action.is-confirmed {
  border-color: var(--brass);
  color: var(--brass-text);
  animation: ink-confirm var(--motion-base) var(--ease-out);
}

@keyframes ink-confirm {
  0% { transform: scale(1); }
  45% { transform: scale(1.035); }
  100% { transform: scale(1); }
}

.exhibit-card {
  align-self: center;
  justify-self: end;
  width: min(100%, 320px);
  animation: exhibit-arrive var(--motion-slow) var(--ease-out) var(--motion-stagger) both;
}

@keyframes exhibit-arrive {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
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
  font-size: var(--text-meta);
  letter-spacing: 0.12em;
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
  font-size: var(--text-meta);
  letter-spacing: 0.11em;
}

.exhibit-card__caption strong {
  font-family: var(--font-poem);
  font-size: 15px;
  font-weight: 400;
  letter-spacing: 0.08em;
}

.exhibit-card__caption button {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border: 1px solid var(--line-strong);
  border-radius: 50%;
  background: transparent;
  color: var(--ink);
  transition:
    border-color var(--motion-fast) var(--ease-standard),
    background-color var(--motion-fast) var(--ease-standard),
    color var(--motion-fast) var(--ease-standard),
    transform var(--motion-base) var(--ease-out);
}

.exhibit-card__caption button:hover {
  border-color: var(--brass);
  background: var(--ink);
  color: var(--porcelain-panel);
}

.exhibit-card__caption button.is-turning {
  transform: translateX(4px);
}

@media (max-width: 1000px) {
  .room-grid {
    grid-template-columns: minmax(0, 1fr) 250px;
    column-gap: 32px;
  }

  /* 窄一些的桌面/平板横屏下，不再强撑整屏高，避免正文下方出现大片空白。 */
  .gallery__room {
    min-height: 0;
    align-items: start;
  }

  .room-grid {
    min-height: 0;
    padding-block: 40px 44px;
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

}

@media (max-width: 560px) {
  .room-grid {
    gap: 22px;
    padding-block: 14px 32px;
  }

  .poem-plinth__meta {
    margin-bottom: 14px;
  }

  .poem-plinth__body {
    margin-top: 16px;
    gap: 7px;
  }

  .poem-plinth__body p {
    font-size: 17px;
    line-height: 1.72;
  }

  .poem-plinth__actions {
    margin-top: 16px;
  }

  .exhibit-card__frame {
    padding: 9px;
  }

  .exhibit-card__frame img {
    aspect-ratio: 1.75;
  }

  .exhibit-card__caption {
    padding-top: 10px;
    padding-right: 104px;
  }

  .room-head {
    padding-top: 4px;
    overflow: hidden;
  }

  .room-archive {
    display: none;
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
    font-size: 17px;
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

}

@media (max-width: 380px) {
  .poem-plinth h1 {
    font-size: clamp(34px, 10vw, 44px);
  }

  .poem-plinth h1.title-length--medium {
    font-size: clamp(30px, 8.6vw, 38px);
  }

  .poem-plinth h1.title-length--long {
    font-size: clamp(24px, 7vw, 30px);
  }

  .gallery-action {
    padding-inline: 10px;
  }

}
</style>
