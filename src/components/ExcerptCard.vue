<template>
  <article
    class="legacy-card"
    :class="{
      'is-exchanging': isExchanging,
      'is-arriving': isArriving,
      'is-disabled': props.disabled,
    }"
    :aria-label="props.disabled ? '今日摘录卡片' : '今日摘录卡片，点击可换一句'"
    :tabindex="props.disabled ? -1 : 0"
    :role="props.disabled ? undefined : 'button'"
    @click="turnExcerpt"
    @keydown.enter.prevent="turnExcerpt"
    @keydown.space.prevent="turnExcerpt"
  >
    <span class="legacy-card__corner legacy-card__corner--top" aria-hidden="true"></span>
    <span class="legacy-card__corner legacy-card__corner--bottom" aria-hidden="true"></span>

    <ExcerptCardFace
      variant="current"
      :excerpt="displayExcerpt"
      :saved="displaySaved"
      interactive
      @toggle-save="emit('toggle-save', props.excerpt)"
    />

    <div class="legacy-card__wash" aria-hidden="true">
      <span class="legacy-card__wash-paper"></span>
      <span class="legacy-card__wash-brush"></span>
      <span class="legacy-card__wash-seal"></span>
    </div>

    <p class="legacy-card__hint" aria-hidden="true">点击换一句</p>
  </article>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import ExcerptCardFace from "./ExcerptCardFace.vue";

const props = defineProps({
  excerpt: { type: Object, required: true },
  saved: { type: Boolean, default: false },
  nextExcerpt: { type: Object, default: null },
  nextSaved: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});
const emit = defineEmits(["toggle-save", "needs-next", "turn", "settled"]);

const WITHER_DURATION = 160;
const ARRIVE_DURATION = 420;
const isExchanging = ref(false);
const isArriving = ref(false);
const currentExcerpt = ref(props.excerpt);
const currentSaved = ref(props.saved);
let witherTimer;
let arriveTimer;
let turnId = 0;

const displayExcerpt = computed(() => currentExcerpt.value || props.excerpt);
const displaySaved = computed(() => currentSaved.value);
const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const stopExchange = () => {
  window.clearTimeout(witherTimer);
  window.clearTimeout(arriveTimer);
  isExchanging.value = false;
  isArriving.value = false;
};

const settleDisplay = async (next, nextSaved) => {
  emit("settled");
  await nextTick();
  currentExcerpt.value = next || props.excerpt;
  currentSaved.value = nextSaved;
};

const finishAnimation = (id) => {
  arriveTimer = window.setTimeout(() => {
    if (id === turnId) {
      isExchanging.value = false;
      isArriving.value = false;
    }
  }, ARRIVE_DURATION);
};

const turnExcerpt = async () => {
  if (props.disabled || isExchanging.value) return;
  emit("needs-next");
  await Promise.resolve();
  await nextTick();
  emit("turn", "right");
  const id = ++turnId;
  const next = props.nextExcerpt;
  const nextSaved = props.nextSaved;
  if (reducedMotion() || !next) {
    stopExchange();
    await settleDisplay(next, nextSaved);
    return;
  }
  isExchanging.value = true;
  isArriving.value = false;
  witherTimer = window.setTimeout(async () => {
    if (id !== turnId) return;
    await settleDisplay(next, nextSaved);
    isArriving.value = true;
    finishAnimation(id);
  }, WITHER_DURATION);
};

watch(() => props.excerpt, (value) => {
  if (!isExchanging.value) {
    currentExcerpt.value = value;
    currentSaved.value = props.saved;
  }
});

watch(() => props.saved, (value) => {
  if (!isExchanging.value) currentSaved.value = value;
});

defineExpose({
  turn: turnExcerpt,
  isTurning: isExchanging,
});
onBeforeUnmount(stopExchange);
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
  --verse-blur: 0px;
  --paper-opacity: 0;
  --paper-shift: -18%;
  --brush-opacity: 0;
  --brush-shift: -40px;
  --seal-opacity: 0;
  --seal-scale: 0.88;
  position: relative;
  width: min(100%, 330px);
  margin-inline: auto;
  padding: calc(16px * var(--legacy-scale));
  cursor: pointer;
  user-select: none;
}

.legacy-card.is-disabled {
  cursor: default;
}

.legacy-card.is-exchanging {
  --ink-opacity: 0;
  --ink-shift: -9px;
  --verse-blur: 2px;
  --paper-opacity: 1;
  --paper-shift: 0%;
  --brush-opacity: 1;
  --brush-shift: 0px;
  --seal-opacity: 0;
  --seal-scale: 0.88;
}

.legacy-card.is-arriving {
  --ink-opacity: 1;
  --ink-shift: 0px;
  --verse-blur: 0px;
  --paper-opacity: 0;
  --paper-shift: 16%;
  --brush-opacity: 0;
  --brush-shift: 40px;
  --seal-opacity: 1;
  --seal-scale: 1;
}

.legacy-card:focus-visible {
  outline: 2px solid var(--brass);
  outline-offset: 4px;
}

.legacy-card__corner {
  position: absolute;
  z-index: 4;
  width: calc(38px * var(--legacy-scale));
  height: calc(38px * var(--legacy-scale));
  border: 0 solid rgba(22, 49, 46, 0.22);
  pointer-events: none;
}

.legacy-card__corner--top {
  top: calc(9px * var(--legacy-scale));
  right: calc(9px * var(--legacy-scale));
  border-top-width: 1px;
  border-right-width: 1px;
}

.legacy-card__corner--bottom {
  bottom: calc(9px * var(--legacy-scale));
  left: calc(9px * var(--legacy-scale));
  border-bottom-width: 1px;
  border-left-width: 1px;
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

.legacy-card :deep(.legacy-card__box--current) {
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.72),
    0 calc(2px * var(--legacy-scale)) calc(14px * var(--legacy-scale)) rgba(22, 49, 46, 0.035),
    0 calc(14px * var(--legacy-scale)) calc(34px * var(--legacy-scale)) rgba(22, 49, 46, 0.055);
}

.legacy-card :deep(.legacy-card__box--current)::before {
  background:
    linear-gradient(108deg, transparent 45%, rgba(255, 255, 255, 0.42) 50%, transparent 55%),
    radial-gradient(circle at 82% 18%, rgba(22, 49, 46, 0.035), transparent 20%);
}

.legacy-card :deep(.legacy-card__verse),
.legacy-card :deep(.legacy-card__author) {
  opacity: var(--ink-opacity);
  transform: translateY(var(--ink-shift));
  filter: blur(var(--verse-blur));
  transition:
    opacity 160ms ease-in,
    transform 420ms cubic-bezier(0.22, 1, 0.36, 1),
    filter 160ms ease-in;
}

.legacy-card.is-arriving :deep(.legacy-card__author) {
  transition-delay: 90ms;
}

.legacy-card__wash {
  position: absolute;
  inset: calc(16px * var(--legacy-scale));
  z-index: 3;
  overflow: hidden;
  border-radius: calc(0.3rem * var(--legacy-scale));
  pointer-events: none;
}

.legacy-card__wash-paper {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(100deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.78) 18%,
      rgba(249, 250, 247, 0.96) 52%,
      rgba(255, 255, 255, 0.74) 82%,
      rgba(255, 255, 255, 0) 100%),
    radial-gradient(ellipse at 30% 52%, rgba(22, 49, 46, 0.028), transparent 42%);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.58);
  opacity: var(--paper-opacity);
  transform: translateX(var(--paper-shift));
  transition:
    opacity 150ms ease-in,
    transform 280ms cubic-bezier(0.22, 0.72, 0.18, 1);
}

.legacy-card.is-arriving .legacy-card__wash-paper {
  transition-duration: 300ms, 420ms;
  transition-timing-function: ease-out, cubic-bezier(0.22, 1, 0.36, 1);
}

.legacy-card__wash-brush {
  position: absolute;
  top: 31%;
  right: 16%;
  left: 16%;
  height: calc(1px * var(--legacy-scale));
  background: linear-gradient(90deg,
    rgba(22, 49, 46, 0),
    rgba(22, 49, 46, 0.34) 16%,
    rgba(122, 70, 52, 0.22) 48%,
    rgba(22, 49, 46, 0.12) 82%,
    rgba(22, 49, 46, 0));
  box-shadow: 0 calc(3px * var(--legacy-scale)) calc(10px * var(--legacy-scale)) rgba(22, 49, 46, 0.08);
  opacity: var(--brush-opacity);
  transform: translateX(var(--brush-shift)) rotate(-8deg);
  transition:
    opacity 140ms ease-in,
    transform 260ms cubic-bezier(0.22, 0.72, 0.18, 1);
}

.legacy-card__wash-seal {
  position: absolute;
  right: calc(18px * var(--legacy-scale));
  bottom: calc(20px * var(--legacy-scale));
  width: calc(18px * var(--legacy-scale));
  height: calc(18px * var(--legacy-scale));
  border: 1px solid rgba(161, 65, 52, 0.38);
  border-radius: 50%;
  opacity: var(--seal-opacity);
  transform: scale(var(--seal-scale));
  transition:
    opacity 220ms ease-out,
    transform 320ms cubic-bezier(0.22, 1, 0.36, 1);
}

.legacy-card__wash-seal::after {
  position: absolute;
  inset: 4px;
  border-top: 1px solid rgba(161, 65, 52, 0.26);
  content: "";
  transform: rotate(-38deg);
}

@media (max-width: 560px) {
  .legacy-card {
    --legacy-scale: 0.9090909;
    width: min(100%, 300px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .legacy-card.is-exchanging,
  .legacy-card.is-arriving {
    --ink-opacity: 1;
    --ink-shift: 0px;
    --verse-blur: 0px;
    --paper-opacity: 0;
    --brush-opacity: 0;
    --seal-opacity: 0;
  }

  .legacy-card__wash {
    display: none;
  }

  .legacy-card :deep(.legacy-card__verse),
  .legacy-card :deep(.legacy-card__author),
  .legacy-card__wash-paper,
  .legacy-card__wash-brush,
  .legacy-card__wash-seal {
    transition: none;
  }
}
</style>
