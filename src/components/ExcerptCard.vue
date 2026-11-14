<template>
  <article
    ref="cardElement"
    class="legacy-card"
    data-direction="right"
    :class="{
      'is-swiping': isSwiping,
      'is-disabled': props.disabled,
    }"
    :aria-label="props.disabled ? '今日摘录卡片' : '今日摘录卡片，轻拂可换一句'"
    :style="cardStyle"
    :data-turn-count="turnCount"
    :tabindex="props.disabled ? -1 : 0"
    :role="props.disabled ? undefined : 'group'"
    @click="handleClick"
    @pointerdown="startSwipe"
    @pointermove="moveSwipe"
    @pointerup="endSwipe"
    @pointercancel="cancelSwipe"
    @keydown="handleKeydown"
  >
    <span class="legacy-card__corner legacy-card__corner--top" aria-hidden="true"></span>
    <span class="legacy-card__corner legacy-card__corner--bottom" aria-hidden="true"></span>

    <div class="legacy-card__stack">
      <button
        class="legacy-card__turn"
        type="button"
        :disabled="props.disabled"
        aria-label="换一句摘录"
        @keydown.enter.prevent="handleClick"
        @keydown.space.prevent="handleClick"
      />
      <ExcerptCardFace
        v-if="flingingEntry"
        :key="`fling-${deckVersion}-${flingingEntry.key}`"
        variant="current"
        class="legacy-card__layer--0 legacy-card__fling-layer"
        data-flinging="true"
        :style="flingLayerStyle"
        :excerpt="flingingEntry.excerpt"
        :saved="flingingEntry.saved"
      />
      <ExcerptCardFace
        v-for="(entry, index) in deck"
        :key="entry.key"
        variant="current"
        :class="[
          `legacy-card__layer--${index}`,
          { 'is-promoting': Boolean(flingingEntry) },
          { 'is-refreshing': Boolean(flingingEntry) && index === 2 },
          `is-turn-${deckVersion % 2}`,
        ]"
        :style="layerStyle(index)"
        :excerpt="entry.excerpt"
        :saved="entry.saved"
        :interactive="index === 0 && !flingingEntry"
        @toggle-save="emit('toggle-save', entry.excerpt)"
      />
    </div>

    <div class="legacy-card__gesture" aria-hidden="true">
      <span class="legacy-card__gesture-ink"></span>
      <span class="legacy-card__gesture-dot"></span>
    </div>

    <p class="legacy-card__hint" aria-hidden="true">点击或轻拂换一句</p>
  </article>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import ExcerptCardFace from "./ExcerptCardFace.vue";

const props = defineProps({
  excerpt: { type: Object, required: true },
  saved: { type: Boolean, default: false },
  upcomingExcerpts: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
});
const emit = defineEmits(["toggle-save", "needs-next", "settled"]);

const FLING_DURATION = 460;
const SWIPE_COMMIT = 42;
const SWIPE_VELOCITY = 420;
const DRAG_DAMPING = 0.55;
const DRAG_LIMIT = 92;
const FLING_DISTANCE = 720;
const FLING_ROTATE = 18;
const isSwiping = ref(false);
const swipeProgress = ref(0);
const turnCount = ref(0);
const flingingEntry = ref(null);
const dragX = ref(0);
const dragRot = ref(0);
const dragDuration = ref(0);
const flingDirection = ref(1);
const flingStartX = ref(0);
const flingStartRot = ref(0);
const makeDeck = () => {
  const entries = [props.excerpt, ...props.upcomingExcerpts].slice(0, 3);
  while (entries.length < 3) entries.push(entries[entries.length - 1] || props.excerpt);
  return entries.map((entry, index) => ({
    key: `${entry.content || "excerpt"}-${index}`,
    excerpt: entry,
    saved: index === 0 ? props.saved : Boolean(entry.saved),
  }));
};
const deck = ref(makeDeck());
const deckVersion = ref(0);
let swipe = null;
let suppressClick = false;
let flingTimer;
const cardElement = ref(null);

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const cardStyle = computed(() => ({
  "--swipe-progress": swipeProgress.value.toFixed(3),
}));

const flingLayerStyle = computed(() => ({
  "--fling-x": `${flingDirection.value * FLING_DISTANCE}px`,
  "--fling-start-x": `${flingStartX.value.toFixed(2)}px`,
  "--fling-start-rot": `${flingStartRot.value.toFixed(2)}deg`,
  "--fling-rotate": `${flingDirection.value * FLING_ROTATE}deg`,
  "--fling-lift": `${flingDirection.value * 3}deg`,
  animationDuration: `${FLING_DURATION}ms`,
}));

const layerStyle = (index) => {
  const slots = [
    { y: 0, scale: 1 },
    { y: 10, scale: 0.965 },
    { y: 20, scale: 0.93 },
  ];
  if (index === 0) {
    return {
      transform: `translate3d(${dragX.value.toFixed(2)}px, 0, 0) rotate(${dragRot.value.toFixed(2)}deg)`,
      transition: dragDuration.value > 0
        ? `transform ${dragDuration.value}ms cubic-bezier(0.22, 1, 0.36, 1)`
        : "none",
    };
  }
  const slot = slots[index];
  return {
    transform: `translate3d(0, ${slot.y}px, 0) scale(${slot.scale})`,
    transition: "none",
  };
};

const clearSwipe = () => {
  swipe = null;
  isSwiping.value = false;
  swipeProgress.value = 0;
  cardElement.value?.setAttribute("data-direction", "right");
};

const resetDrag = () => {
  dragDuration.value = 0;
  dragX.value = 0;
  dragRot.value = 0;
};

const springBack = () => {
  dragDuration.value = 260;
  dragX.value = 0;
  dragRot.value = 0;
};

const settleDeck = () => {
  window.clearTimeout(flingTimer);
  flingingEntry.value = null;
  resetDrag();
};

const commitTurn = async (direction = "right") => {
  emit("needs-next");
  const outgoing = deck.value[0];
  if (reducedMotion()) {
    emit("settled");
    turnCount.value += 1;
    deck.value = makeDeck();
    return;
  }
  flingStartX.value = dragX.value;
  flingStartRot.value = dragRot.value;
  flingDirection.value = direction === "left" ? -1 : 1;
  window.clearTimeout(flingTimer);
  flingingEntry.value = outgoing;
  resetDrag();
  emit("settled");
  turnCount.value += 1;
  deckVersion.value += 1;
  flingTimer = window.setTimeout(settleDeck, FLING_DURATION + 40);
  await nextTick();
  deck.value = makeDeck();
};

const turnExcerpt = (direction = "right") => {
  if (props.disabled) return;
  commitTurn(direction);
};

const handleClick = () => {
  if (suppressClick) {
    suppressClick = false;
    return;
  }
  turnExcerpt("right");
};

const handleKeydown = (event) => {
  if (!["Enter", " ", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
  event.preventDefault();
  turnExcerpt(event.key === "ArrowLeft" ? "left" : "right");
};

const startSwipe = (event) => {
  suppressClick = false;
  if (props.disabled || event.target.closest(".legacy-card__save")) return;
  if (event.pointerType === "mouse" && typeof event.button === "number" && event.button !== 0) return;
  swipe = {
    id: event.pointerId,
    originX: event.clientX,
    x: event.clientX,
    time: event.timeStamp,
    velocity: 0,
    moved: false,
    committed: false,
    target: event.currentTarget,
  };
  try {
    swipe.target.setPointerCapture?.(event.pointerId);
  } catch {}
};

const moveSwipe = (event) => {
  if (!swipe || event.pointerId !== swipe.id) return;
  const distance = event.clientX - swipe.originX;
  const elapsed = Math.max(8, event.timeStamp - swipe.time);
  swipe.velocity = swipe.velocity * 0.3
    + (event.clientX - (swipe.previousX || swipe.originX)) / elapsed * 1000 * 0.7;
  swipe.previousX = event.clientX;
  swipe.x = event.clientX;
  swipe.time = event.timeStamp;
  if (Math.abs(distance) < 6) return;
  if (!swipe.moved) {
    swipe.moved = true;
    isSwiping.value = true;
    suppressClick = true;
  }
  const direction = distance < 0 ? "left" : "right";
  cardElement.value?.setAttribute("data-direction", direction);
  swipeProgress.value = Math.min(1, Math.abs(distance) / SWIPE_COMMIT);
  const offset = clamp(distance * DRAG_DAMPING, -DRAG_LIMIT, DRAG_LIMIT);
  dragDuration.value = 0;
  dragX.value = offset;
  dragRot.value = clamp(offset * 0.08, -10, 10);
  if (!swipe.committed && Math.abs(distance) >= SWIPE_COMMIT) {
    swipe.committed = true;
    swipeProgress.value = 0;
    turnExcerpt(direction);
  }
};

const endSwipe = (event) => {
  if (!swipe || event.pointerId !== swipe.id) return;
  const distance = swipe.x - swipe.originX;
  const committed = Boolean(swipe.committed);
  const moved = Boolean(swipe.moved);
  const fling = moved && !committed
    && Math.abs(swipe.velocity) >= SWIPE_VELOCITY && Math.abs(distance) >= 14;
  try {
    swipe.target?.releasePointerCapture?.(event.pointerId);
  } catch {}
  const direction = distance < 0 ? "left" : "right";
  clearSwipe();
  if (committed) return;
  if (fling) {
    turnExcerpt(direction);
  } else if (moved) {
    springBack();
  }
};

const cancelSwipe = (event) => {
  if (!swipe || event.pointerId !== swipe.id) return;
  const moved = Boolean(swipe.moved);
  const committed = Boolean(swipe.committed);
  try {
    swipe.target?.releasePointerCapture?.(event.pointerId);
  } catch {}
  clearSwipe();
  if (moved && !committed) springBack();
};

defineExpose({
  turn: turnExcerpt,
  isTurning: computed(() => Boolean(flingingEntry.value)),
});
watch(() => [props.excerpt, props.saved, props.upcomingExcerpts], () => {
  if (!flingingEntry.value) deck.value = makeDeck();
}, { deep: true });
onBeforeUnmount(() => {
  window.clearTimeout(flingTimer);
  clearSwipe();
});
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
  --swipe-progress: 0;
  --fling-duration: 460ms;
  position: relative;
  width: min(100%, 330px);
  margin-inline: auto;
  padding: calc(16px * var(--legacy-scale));
  cursor: pointer;
  touch-action: pan-y;
  user-select: none;
}

.legacy-card.is-disabled {
  cursor: default;
}

.legacy-card:focus-visible {
  outline: 2px solid var(--brass);
  outline-offset: 4px;
}

.legacy-card__stack {
  position: relative;
  z-index: 1;
  width: 100%;
  aspect-ratio: 330 / 620;
}

.legacy-card__turn {
  position: absolute;
  inset: 22% 0 0;
  z-index: 10;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.legacy-card__turn:focus-visible {
  outline: 2px solid var(--brass);
  outline-offset: -6px;
}

.legacy-card__stack :deep(.legacy-card__box) {
  position: absolute;
  inset: 0;
  width: auto;
  aspect-ratio: auto;
  will-change: transform;
}

.legacy-card__stack :deep(.legacy-card__layer--0) {
  z-index: 3;
}

.legacy-card__stack :deep(.legacy-card__layer--1) {
  z-index: 2;
}

.legacy-card__stack :deep(.legacy-card__layer--2) {
  z-index: 1;
}

.legacy-card__stack :deep(.legacy-card__fling-layer) {
  z-index: 4;
  transform-origin: 50% 90%;
  animation-name: lanze-fling-away;
  animation-timing-function: cubic-bezier(0.32, 0, 0.67, 0);
  animation-fill-mode: forwards;
}

.legacy-card__stack :deep(.legacy-card__box.is-promoting) {
  animation-duration: var(--fling-duration);
  animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
  animation-fill-mode: both;
}

.legacy-card__stack :deep(.legacy-card__layer--0.is-promoting.is-turn-0),
.legacy-card__stack :deep(.legacy-card__layer--0.is-promoting.is-turn-1) {
  animation-name: lanze-promote-top;
}

.legacy-card__stack :deep(.legacy-card__layer--1.is-promoting.is-turn-0),
.legacy-card__stack :deep(.legacy-card__layer--1.is-promoting.is-turn-1) {
  animation-name: lanze-promote-middle;
}

.legacy-card__stack :deep(.legacy-card__layer--2.is-refreshing) {
  animation-name: lanze-refresh-bottom;
  animation-duration: var(--fling-duration);
  animation-timing-function: var(--ease-out);
  animation-fill-mode: both;
}

@keyframes lanze-promote-top {
  from { transform: translate3d(0, 10px, 0) scale(0.965); }
  to { transform: translate3d(0, 0, 0) scale(1); }
}

@keyframes lanze-promote-middle {
  from { transform: translate3d(0, 20px, 0) scale(0.93); }
  to { transform: translate3d(0, 10px, 0) scale(0.965); }
}

@keyframes lanze-refresh-bottom {
  from { opacity: 0; transform: translate3d(0, 30px, 0) scale(0.9); }
  to { opacity: 1; transform: translate3d(0, 20px, 0) scale(0.93); }
}

@keyframes lanze-fling-away {
  0% {
    transform: translate3d(var(--fling-start-x), 0, 0) rotate(var(--fling-start-rot));
    opacity: 1;
  }

  16% {
    transform: translate3d(var(--fling-start-x), -24px, 0)
      rotate(calc(var(--fling-start-rot) + var(--fling-lift)));
    opacity: 1;
  }

  100% {
    transform: translate3d(var(--fling-x), -72px, 0) rotate(var(--fling-rotate));
    opacity: 0;
  }
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
  bottom: -32px;
  left: 0;
  z-index: 5;
  margin: 0;
  padding-top: 0;
  color: var(--ink-faint);
  font-size: var(--text-meta);
  letter-spacing: 0.08em;
  text-align: center;
  pointer-events: none;
}

.legacy-card__gesture {
  position: absolute;
  right: calc(24px * var(--legacy-scale));
  bottom: calc(24px * var(--legacy-scale));
  left: calc(24px * var(--legacy-scale));
  z-index: 6;
  height: calc(2px * var(--legacy-scale));
  pointer-events: none;
}

.legacy-card__gesture-ink {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg,
    rgba(22, 49, 46, 0),
    rgba(22, 49, 46, 0.24) 18%,
    rgba(122, 70, 52, 0.16) 52%,
    rgba(22, 49, 46, 0));
  opacity: calc(var(--swipe-progress) * 0.9);
  transform: scaleX(var(--swipe-progress));
  transform-origin: left center;
  transition: opacity 120ms ease-out, transform 120ms ease-out;
}

.legacy-card[data-direction="left"] .legacy-card__gesture-ink {
  transform-origin: right center;
}

.legacy-card__gesture-dot {
  position: absolute;
  top: 50%;
  left: calc(var(--swipe-progress) * 100%);
  width: calc(7px * var(--legacy-scale));
  height: calc(7px * var(--legacy-scale));
  border: 1px solid rgba(161, 65, 52, 0.42);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.86);
  opacity: calc(var(--swipe-progress) * 0.8);
  transform: translate(-50%, -50%);
  transition: opacity 120ms ease-out;
}

.legacy-card[data-direction="left"] .legacy-card__gesture-dot {
  left: calc((1 - var(--swipe-progress)) * 100%);
}

.legacy-card.is-swiping .legacy-card__gesture-ink,
.legacy-card.is-swiping .legacy-card__gesture-dot {
  transition: none;
}

@media (max-width: 560px) {
  .legacy-card {
    --legacy-scale: 0.9090909;
    width: min(100%, 300px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .legacy-card__stack :deep(.legacy-card__box) {
    animation: none !important;
    transition: none !important;
  }

  .legacy-card__stack :deep(.legacy-card__layer--0[data-flinging]) {
    display: none;
  }
}
</style>
