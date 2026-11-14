<template>
  <article
    ref="cardElement"
    class="legacy-card"
    data-direction="right"
    :class="{
      'is-swiping': isSwiping,
      'is-disabled': props.disabled,
    }"
    :aria-label="props.disabled ? '今日摘录卡片' : '今日摘录卡片，点击或横向轻拂可换一句'"
    :style="cardStyle"
    :data-turn-count="turnCount"
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
        :excerpt="stableExcerpt"
        :saved="stableSaved"
        :face-style="faceStyle"
        interactive
        @toggle-save="emit('toggle-save', stableExcerpt)"
      />
      <div
        v-if="ghost"
        :key="ghostKey"
        class="legacy-card__ghost"
        :style="ghostStyle"
        aria-hidden="true"
        @animationend.self="removeGhost"
      >
        <ExcerptCardFace
          variant="ghost"
          :excerpt="ghost.excerpt"
          :saved="ghost.saved"
        />
      </div>
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

const FLING_DURATION = 420;
const SWIPE_COMMIT = 42;
const SWIPE_VELOCITY = 420;
const DRAG_DAMPING = 0.55;
const DRAG_LIMIT = 92;
const FLING_DISTANCE = 680;
const FLING_ROTATE = 18;
const isSwiping = ref(false);
const swipeProgress = ref(0);
const stableExcerpt = ref(props.excerpt);
const stableSaved = ref(props.saved);
const ghost = ref(null);
const ghostKey = ref(0);
const ghostDirection = ref(1);
const ghostStartX = ref(0);
const ghostStartRot = ref(0);
const faceX = ref(0);
const faceRot = ref(0);
const faceDuration = ref(0);
const faceEase = ref("cubic-bezier(0.22, 1, 0.36, 1)");
const turnCount = ref(0);
let swipe = null;
let suppressClick = false;
let ghostTimer;
const cardElement = ref(null);

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const cardStyle = computed(() => ({
  "--swipe-progress": swipeProgress.value.toFixed(3),
}));
const faceStyle = computed(() => ({
  transform: `translateX(${faceX.value.toFixed(2)}px) rotate(${faceRot.value.toFixed(2)}deg)`,
  transition: faceDuration.value > 0
    ? `transform ${faceDuration.value}ms ${faceEase.value}`
    : "none",
}));
const ghostStyle = computed(() => ({
  "--fling-x": `${ghostDirection.value * FLING_DISTANCE}px`,
  "--fling-start-x": `${ghostStartX.value.toFixed(2)}px`,
  "--fling-start-rot": `${ghostStartRot.value.toFixed(2)}deg`,
  "--fling-y": "-24px",
  "--fling-rotate": `${ghostDirection.value * FLING_ROTATE}deg`,
  "--fling-lift": `${ghostDirection.value * 3}deg`,
  animationDuration: `${FLING_DURATION}ms`,
}));

const resetFace = () => {
  faceDuration.value = 0;
  faceX.value = 0;
  faceRot.value = 0;
};

const springBack = () => {
  faceDuration.value = 260;
  faceEase.value = "cubic-bezier(0.22, 1, 0.36, 1)";
  faceX.value = 0;
  faceRot.value = 0;
};

const clearSwipe = () => {
  swipe = null;
  isSwiping.value = false;
  swipeProgress.value = 0;
  cardElement.value?.setAttribute("data-direction", "right");
};

const removeGhost = () => {
  window.clearTimeout(ghostTimer);
  ghost.value = null;
};

const commitTurn = (next, nextSaved, direction = "right") => {
  turnCount.value += 1;
  if (reducedMotion()) {
    removeGhost();
    resetFace();
    stableExcerpt.value = next;
    stableSaved.value = nextSaved;
    emit("settled");
    return;
  }
  const outgoing = { excerpt: stableExcerpt.value, saved: stableSaved.value };
  ghostStartX.value = faceX.value;
  ghostStartRot.value = faceRot.value;
  stableExcerpt.value = next;
  stableSaved.value = nextSaved;
  resetFace();
  emit("settled");
  ghost.value = outgoing;
  ghostDirection.value = direction === "left" ? -1 : 1;
  ghostKey.value += 1;
  window.clearTimeout(ghostTimer);
  ghostTimer = window.setTimeout(removeGhost, FLING_DURATION + 80);
};

const commitSwipeTurn = (direction) => {
  turnExcerpt(direction);
};

const turnExcerpt = async (turnDirection = "right") => {
  if (props.disabled) return;
  const next = props.nextExcerpt;
  const nextSaved = props.nextSaved;
  emit("needs-next");
  emit("turn", turnDirection);
  if (next) {
    commitTurn(next, nextSaved, turnDirection);
    return;
  }
  await nextTick();
  const fallback = props.nextExcerpt;
  if (fallback) {
    commitTurn(fallback, props.nextSaved, turnDirection);
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
  suppressClick = false;
  if (props.disabled || event.target.closest("button")) return;
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
  faceDuration.value = 0;
  faceX.value = offset;
  faceRot.value = clamp(offset * 0.08, -10, 10);
  if (!swipe.committed && Math.abs(distance) >= SWIPE_COMMIT) {
    swipe.committed = true;
    swipeProgress.value = 0;
    commitSwipeTurn(direction);
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
    commitSwipeTurn(direction);
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

watch(() => props.excerpt, (value) => {
  stableExcerpt.value = value;
  stableSaved.value = props.saved;
});

watch(() => props.saved, (value) => {
  stableSaved.value = value;
});

defineExpose({
  turn: turnExcerpt,
  isTurning: computed(() => Boolean(ghost.value)),
});
onBeforeUnmount(() => {
  window.clearTimeout(ghostTimer);
  removeGhost();
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

.legacy-card__stack :deep(.legacy-card__box) {
  position: absolute;
  inset: 0;
  width: auto;
  aspect-ratio: auto;
}

.legacy-card__stack :deep(.legacy-card__box--current) {
  z-index: 1;
  will-change: transform;
}

.legacy-card__ghost {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  will-change: transform, opacity;
  transform-origin: 50% 90%;
  animation-name: lanze-fling-away;
  animation-timing-function: cubic-bezier(0.32, 0, 0.67, 0);
  animation-fill-mode: forwards;
}

@keyframes lanze-fling-away {
  0% {
    transform: translate3d(var(--fling-start-x), 0, 0) rotate(var(--fling-start-rot));
    opacity: 1;
  }

  16% {
    transform: translate3d(var(--fling-start-x), var(--fling-y), 0)
      rotate(calc(var(--fling-start-rot) + var(--fling-lift)));
    opacity: 1;
  }

  100% {
    transform: translate3d(var(--fling-x), calc(var(--fling-y) * 3), 0)
      rotate(var(--fling-rotate));
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

@media (max-width: 560px) {
  .legacy-card {
    --legacy-scale: 0.9090909;
    width: min(100%, 300px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .legacy-card__ghost {
    display: none;
  }

  .legacy-card__stack :deep(.legacy-card__box--current) {
    transition: none !important;
  }
}
</style>
