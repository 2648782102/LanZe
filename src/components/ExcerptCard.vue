<template>
  <article
    class="legacy-card"
    :class="{ 'is-exchanging': isExchanging }"
    :aria-label="props.disabled ? '今日摘录卡片' : '今日摘录卡片，点击可换一句'"
    :tabindex="props.disabled ? -1 : 0"
    :role="props.disabled ? undefined : 'button'"
    @click="turnExcerpt"
    @keydown.enter.prevent="turnExcerpt"
    @keydown.space.prevent="turnExcerpt"
  >
    <p class="legacy-card__hint" aria-hidden="true">点击换一句</p>
    <ExcerptCardFace
      variant="current"
      :excerpt="displayExcerpt"
      :saved="displaySaved"
      interactive
      @toggle-save="emit('toggle-save', props.excerpt)"
    />
  </article>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from "vue";
import ExcerptCardFace from "./ExcerptCardFace.vue";

const props = defineProps({
  excerpt: { type: Object, required: true },
  saved: { type: Boolean, default: false },
  nextExcerpt: { type: Object, default: null },
  nextSaved: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});
const emit = defineEmits(["toggle-save", "needs-next", "turn", "settled"]);

const FADE_DURATION = 120;
const INK_DURATION = 260;
const isExchanging = ref(false);
const currentExcerpt = ref(props.excerpt);
const currentSaved = ref(props.saved);
let exchangeTimer;
let turnId = 0;

const displayExcerpt = computed(() => currentExcerpt.value || props.excerpt);
const displaySaved = computed(() => currentSaved.value);
const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const clearExchange = () => {
  window.clearTimeout(exchangeTimer);
  isExchanging.value = false;
};

const commitExcerpt = async () => {
  const next = props.nextExcerpt;
  const nextSaved = props.nextSaved;
  emit("settled");
  await nextTick();
  currentExcerpt.value = next || props.excerpt;
  currentSaved.value = nextSaved;
};

const turnExcerpt = async () => {
  if (props.disabled || isExchanging.value) return;
  emit("needs-next");
  emit("turn", "right");
  if (reducedMotion() || !props.nextExcerpt) {
    await commitExcerpt();
    return;
  }
  const id = ++turnId;
  isExchanging.value = true;
  exchangeTimer = window.setTimeout(async () => {
    if (id !== turnId) return;
    await commitExcerpt();
    exchangeTimer = window.setTimeout(() => {
      if (id === turnId) isExchanging.value = false;
    }, INK_DURATION);
  }, FADE_DURATION);
};

defineExpose({
  turn: turnExcerpt,
  isTurning: isExchanging,
});
onBeforeUnmount(clearExchange);
</script>

<style>
@font-face {
  font-family: "LanZeExcerptVerse";
  src: url("../assets/excerpt/piaoYiSong-excerpt.woff2") format("woff2");
  font-display: swap;
  ascent-override: 87.99%;
  descent-override: 12.01%;
  line-gap-override: 0%;
}

@font-face {
  font-family: "LanZeExcerptAuthor";
  src: url("../assets/excerpt/hongLei-excerpt.woff2") format("woff2");
  font-display: swap;
  ascent-override: 80.27%;
  descent-override: 29.2%;
  line-gap-override: 10.06%;
}
</style>

<style scoped>
.legacy-card {
  --legacy-scale: 1;
  --legacy-gutter: 12%;
  --ink-opacity: 1;
  --ink-shift: 0px;
  position: relative;
  width: min(100%, 330px);
  margin-inline: auto;
  padding-block: calc(16px * var(--legacy-scale, 1));
  cursor: pointer;
  user-select: none;
}

.legacy-card.is-exchanging {
  --ink-opacity: 0;
  --ink-shift: -6px;
}

.legacy-card:focus-visible {
  outline: 2px solid var(--brass);
  outline-offset: 4px;
}

.legacy-card__hint {
  position: absolute;
  right: 0;
  bottom: -12px;
  left: 0;
  z-index: 5;
  color: var(--ink-faint);
  font-size: var(--text-meta);
  letter-spacing: 0.08em;
  text-align: center;
  pointer-events: none;
}

.legacy-card :deep(.legacy-card__verse),
.legacy-card :deep(.legacy-card__author) {
  opacity: var(--ink-opacity);
  transform: translateY(var(--ink-shift));
  transition:
    opacity 120ms ease-in,
    transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
}

@media (max-width: 560px) {
  .legacy-card {
    --legacy-scale: 0.9090909;
    width: min(100%, 300px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .legacy-card.is-exchanging {
    --ink-opacity: 1;
    --ink-shift: 0px;
  }

  .legacy-card :deep(.legacy-card__verse),
  .legacy-card :deep(.legacy-card__author) {
    transition: none;
  }
}
</style>
