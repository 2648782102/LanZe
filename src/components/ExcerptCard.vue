<template>
  <article
    ref="cardElement"
    class="legacy-card"
    data-direction="right"
    :class="{
      'is-exchanging': isExchanging,
      'is-swiping': isSwiping,
      'is-disabled': props.disabled,
    }"
    :aria-label="props.disabled ? '今日摘录卡片' : '今日摘录卡片，点击或横向轻拂可换一句'"
    :style="cardStyle"
    :tabindex="props.disabled ? -1 : 0"
    :role="props.disabled ? undefined : 'button'"
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
      <ExcerptCardFace
        variant="current"
        :excerpt="displayExcerpt"
        :saved="displaySaved"
        :ghost="outgoing ? outgoing.excerpt : null"
        interactive
        @toggle-save="emit('toggle-save', displayExcerpt)"
      />
    </div>

    <div class="legacy-card__wash" aria-hidden="true">
      <span class="legacy-card__wash-paper"></span>
      <span class="legacy-card__wash-brush"></span>
      <span class="legacy-card__wash-seal"></span>
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
  nextExcerpt: { type: Object, default: null },
  nextSaved: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});
const emit = defineEmits(["toggle-save", "needs-next", "turn", "settled"]);

const CROSSFADE_DURATION = 240;
const SWIPE_COMMIT = 42;
const SWIPE_VELOCITY = 420;
const DRAG_DAMPING = 0.4;
const DRAG_LIMIT = 52;
const isExchanging = ref(false);
const isSwiping = ref(false);
const swipeProgress = ref(0);
const dragX = ref(0);
const currentExcerpt = ref(props.excerpt);
const currentSaved = ref(props.saved);
const outgoing = ref(null);
let crossfadeTimer;
let swipe = null;
let suppressClick = false;
let suppressClickTimer;
const cardElement = ref(null);

const displayExcerpt = computed(() => currentExcerpt.value || props.excerpt);
const displaySaved = computed(() => currentSaved.value);
const cardStyle = computed(() => ({
  "--swipe-progress": swipeProgress.value.toFixed(3),
  "--drag-x": `${dragX.value.toFixed(2)}px`,
}));
const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const clearSwipe = () => {
  swipe = null;
  isSwiping.value = false;
  swipeProgress.value = 0;
  dragX.value = 0;
  cardElement.value?.setAttribute("data-direction", "right");
};

const commitSwipeTurn = (direction) => {
  suppressClick = true;
  window.clearTimeout(suppressClickTimer);
  suppressClickTimer = window.setTimeout(() => {
    suppressClick = false;
  }, 400);
  turnExcerpt(direction);
};

const commitTurn = (next, nextSaved) => {
  const previous = { excerpt: displayExcerpt.value, saved: displaySaved.value };
  currentExcerpt.value = next;
  currentSaved.value = nextSaved;
  emit("settled");
  if (reducedMotion()) {
    outgoing.value = null;
    return;
  }
  outgoing.value = previous;
  isExchanging.value = true;
  window.clearTimeout(crossfadeTimer);
  crossfadeTimer = window.setTimeout(() => {
    isExchanging.value = false;
    outgoing.value = null;
  }, CROSSFADE_DURATION);
};

const turnExcerpt = async (turnDirection = "right") => {
  if (props.disabled || isExchanging.value) return;
  const next = props.nextExcerpt;
  const nextSaved = props.nextSaved;
  emit("needs-next");
  emit("turn", turnDirection);
  if (next) {
    commitTurn(next, nextSaved);
    return;
  }
  await nextTick();
  const fallback = props.nextExcerpt;
  if (fallback) {
    commitTurn(fallback, props.nextSaved);
  } else {
    emit("settled");
  }
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
  if (props.disabled || isExchanging.value || event.target.closest("button")) return;
  if (event.pointerType === "mouse" && typeof event.button === "number" && event.button !== 0) return;
  swipe = {
    id: event.pointerId,
    originX: event.clientX,
    x: event.clientX,
    time: event.timeStamp,
    velocity: 0,
    moved: false,
    target: event.currentTarget,
  };
  try {
    swipe.target.setPointerCapture?.(event.pointerId);
  } catch {}
};

const moveSwipe = (event) => {
  if (!swipe || event.pointerId !== swipe.id || isExchanging.value) return;
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
  }
  const direction = distance < 0 ? "left" : "right";
  cardElement.value?.setAttribute("data-direction", direction);
  swipeProgress.value = Math.min(1, Math.abs(distance) / SWIPE_COMMIT);
  dragX.value = Math.max(-DRAG_LIMIT, Math.min(DRAG_LIMIT, distance * DRAG_DAMPING));
  if (!swipe.committed && Math.abs(distance) >= SWIPE_COMMIT) {
    swipe.committed = true;
    swipeProgress.value = 0;
    dragX.value = 0;
    commitSwipeTurn(direction);
  }
};

const endSwipe = (event) => {
  if (!swipe || event.pointerId !== swipe.id) return;
  const distance = swipe.x - swipe.originX;
  const committed = Boolean(swipe.committed);
  const fling = swipe.moved && !committed
    && Math.abs(swipe.velocity) >= SWIPE_VELOCITY && Math.abs(distance) >= 14;
  try {
    swipe.target?.releasePointerCapture?.(event.pointerId);
  } catch {}
  const direction = distance < 0 ? "left" : "right";
  clearSwipe();
  if (committed) return;
  if (fling) commitSwipeTurn(direction);
};

const cancelSwipe = (event) => {
  if (!swipe || event.pointerId !== swipe.id) return;
  try {
    swipe.target?.releasePointerCapture?.(event.pointerId);
  } catch {}
  clearSwipe();
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
onBeforeUnmount(() => {
  window.clearTimeout(crossfadeTimer);
  clearSwipe();
  window.clearTimeout(suppressClickTimer);
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
  --drag-x: 0px;
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
  transform: translateX(var(--drag-x));
  transition: transform 240ms var(--ease-out);
  will-change: transform;
}

.legacy-card.is-swiping .legacy-card__stack {
  transition: none;
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
  opacity: 0;
}

.legacy-card.is-exchanging .legacy-card__wash-paper {
  animation: legacy-wash 240ms var(--ease-standard) both;
}

@keyframes legacy-wash {
  0% { opacity: 0; transform: translateX(-16%); }
  42% { opacity: 0.82; }
  58% { opacity: 0.82; }
  100% { opacity: 0; transform: translateX(16%); }
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
  opacity: 0;
}

.legacy-card.is-exchanging .legacy-card__wash-brush {
  animation: legacy-brush 240ms var(--ease-out) both;
}

@keyframes legacy-brush {
  0% { opacity: 0; transform: translateX(-40px) rotate(-8deg); }
  40% { opacity: 1; transform: translateX(0) rotate(-8deg); }
  72% { opacity: 1; }
  100% { opacity: 0; transform: translateX(40px) rotate(-8deg); }
}

.legacy-card__wash-seal {
  position: absolute;
  right: calc(18px * var(--legacy-scale));
  bottom: calc(20px * var(--legacy-scale));
  width: calc(18px * var(--legacy-scale));
  height: calc(18px * var(--legacy-scale));
  border: 1px solid rgba(161, 65, 52, 0.38);
  border-radius: 50%;
  opacity: 0;
  transform: scale(0.6);
}

.legacy-card.is-exchanging .legacy-card__wash-seal {
  animation: legacy-seal 280ms var(--ease-out) 30ms both;
}

@keyframes legacy-seal {
  0% { opacity: 0; transform: scale(1.5); }
  45% { opacity: 1; transform: scale(0.94); }
  70% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(1); }
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
  .legacy-card__stack,
  .legacy-card__wash-paper,
  .legacy-card__wash-brush,
  .legacy-card__wash-seal {
    animation: none !important;
    transition: none !important;
  }

  .legacy-card__wash {
    display: none;
  }
}
</style>
