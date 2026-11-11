<template>
  <article
    class="legacy-card"
    :class="{
      'is-dragging': isDragging,
      'is-writing': isWriting,
      'is-turning': isTurning,
      [`legacy-card--${direction}`]: direction,
    }"
    :style="cardStyle"
    aria-label="可拖走的诗词摘录卡片"
    tabindex="0"
    @pointerdown="startDrag"
    @pointermove="moveDrag"
    @pointerup="endDrag"
    @pointercancel="cancelDrag"
    @keydown="handleKeydown"
  >
    <div class="legacy-card__hint" aria-hidden="true">轻轻一掀，换一句诗</div>

    <ExcerptCardFace
      variant="incoming"
      :excerpt="incomingExcerpt"
      :saved="incomingSaved"
      ink
      aria-hidden="true"
      @toggle-save="emit('toggle-save', incomingExcerpt)"
    />

    <ExcerptCardFace
      variant="current"
      :excerpt="excerpt"
      :saved="saved"
      interactive
      @toggle-save="emit('toggle-save', excerpt)"
    />

    <div class="legacy-card__shards" aria-hidden="true">
      <div
        v-for="shardIndex in 6"
        :key="shardIndex"
        class="legacy-card__shard"
        :style="{ '--shard-index': shardIndex - 1, ...shardStyle(shardIndex - 1) }"
      >
        <ExcerptCardFace variant="current" :excerpt="excerpt" :saved="saved" />
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from "vue";
import ExcerptCardFace from "./ExcerptCardFace.vue";

const props = defineProps({
  excerpt: { type: Object, required: true },
  saved: { type: Boolean, default: false },
  nextExcerpt: { type: Object, default: null },
  nextSaved: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});
const emit = defineEmits(["toggle-save", "needs-next", "turn", "settled"]);

const isDragging = ref(false);
const isWriting = ref(false);
const isTurning = ref(false);
const direction = ref("");
const dragOffset = ref({ x: 0, y: 0 });
const flingX = ref(0);
const flingDrift = ref(0);
const cardSize = ref({ width: 330, height: 620, offset: 16 });
const pointerOrigin = { x: 0, y: 0, id: null, target: null };
const pointerState = {
  x: 0,
  y: 0,
  time: 0,
  velocityX: 0,
  samples: 0,
  frame: 0,
  turnRequested: false,
};
let writingTimer;
let commitTimer;
let releaseTimer;

const cardStyle = computed(() => ({
  "--drag-x": `${dragOffset.value.x}px`,
  "--drag-y": `${dragOffset.value.y}px`,
  "--drag-turn": `${dragOffset.value.x * 0.065}deg`,
  "--drag-tilt": `${Math.max(-9, Math.min(9, dragOffset.value.y * -0.032))}deg`,
  "--drag-lift": `${Math.min(1, Math.hypot(dragOffset.value.x, dragOffset.value.y) / 72)}`,
  "--fling-x": `${flingX.value}px`,
  "--fling-drift": `${flingDrift.value}px`,
}));

const incomingExcerpt = computed(() => props.nextExcerpt || props.excerpt);
const incomingSaved = computed(() => props.nextSaved);
const incomingCharacters = computed(() => Array.from(incomingExcerpt.value?.content || ""));
const shardStyle = (index) => ({
  "--shard-top": `${index * 100 / 6}%`,
  "--shard-height": `${100 / 6}%`,
  "--shard-full-height": `${cardSize.value.height}px`,
  "--shard-width": `${cardSize.value.width}px`,
  "--shard-offset": `${cardSize.value.offset}px`,
  "--shard-side": `${index * 9 - 24}deg`,
  "--shard-lead": `${index * 26 - 72}px`,
});

const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const clearTimers = () => {
  window.clearTimeout(writingTimer);
  window.clearTimeout(commitTimer);
  window.clearTimeout(releaseTimer);
  window.cancelAnimationFrame(pointerState.frame);
  pointerState.frame = 0;
};
const finishTurn = () => {
  isWriting.value = false;
  isDragging.value = false;
  dragOffset.value = { x: 0, y: 0 };
  flingX.value = 0;
  flingDrift.value = 0;
  pointerState.turnRequested = false;
  pointerState.velocityX = 0;
  releaseTimer = window.setTimeout(() => {
    isTurning.value = false;
    direction.value = "";
    emit("settled");
  }, 0);
};

const turnCard = (turnDirection = "right", fromDrag = false) => {
  if (isTurning.value || props.disabled) return;
  emit("needs-next");
  clearTimers();
  const rawFling = Math.max(-72, Math.min(72, pointerState.velocityX * 0.028));
  flingX.value = fromDrag
    ? (turnDirection === "right" ? Math.max(0, rawFling) : Math.min(0, rawFling))
    : 0;
  const rawDrift = Math.max(-48, Math.min(48, pointerState.velocityX * 0.02));
  flingDrift.value = fromDrag
    ? (turnDirection === "right" ? Math.max(0, rawDrift) : Math.min(0, rawDrift))
    : 0;
  isTurning.value = true;
  isDragging.value = fromDrag;
  isWriting.value = false;
  direction.value = turnDirection;
  emit("turn", turnDirection);
  if (reducedMotion()) {
    finishTurn();
    return;
  }
  const fadeDelay = fromDrag ? 90 : 250;
  writingTimer = window.setTimeout(() => {
    isWriting.value = true;
  }, fadeDelay);
  const writingDuration = Math.max(300, incomingCharacters.value.length * 24 + 320);
  const settleDuration = fromDrag ? 560 : 720;
  commitTimer = window.setTimeout(finishTurn, Math.max(settleDuration, writingDuration + fadeDelay));
};

const startDrag = (event) => {
  if (isTurning.value || props.disabled || event.target.closest("button")) return;
  if (event.pointerType === "mouse" && event.button !== 0) return;
  const currentBox = event.currentTarget.querySelector(".legacy-card__box--current");
  const cardRect = event.currentTarget.getBoundingClientRect();
  const boxRect = currentBox?.getBoundingClientRect();
  cardSize.value = {
    width: boxRect?.width || 330,
    height: boxRect?.height || 620,
    offset: Math.max(0, (boxRect?.top || 0) - cardRect.top),
  };
  pointerOrigin.x = event.clientX;
  pointerOrigin.y = event.clientY;
  pointerOrigin.id = event.pointerId;
  pointerOrigin.target = event.currentTarget;
  pointerOrigin.target.setPointerCapture?.(event.pointerId);
  pointerState.x = event.clientX;
  pointerState.y = event.clientY;
  pointerState.time = event.timeStamp;
  pointerState.velocityX = 0;
  pointerState.samples = 0;
  pointerState.frame = 0;
  pointerState.turnRequested = false;
  dragOffset.value = { x: 0, y: 0 };
  flingX.value = 0;
  flingDrift.value = 0;
  direction.value = "";
  isDragging.value = true;
  emit("needs-next");
};

const shouldTurn = ({ x, velocityX }, width) => {
  const projected = Math.abs(x) + Math.abs(velocityX) * 0.065;
  const threshold = Math.min(58, Math.max(34, width * 0.13));
  return Math.abs(x) > 10 && projected > threshold;
};

const drawDragFrame = () => {
  const nextX = pointerState.x - pointerOrigin.x;
  const nextY = pointerState.y - pointerOrigin.y;
  dragOffset.value = {
    x: Math.max(-220, Math.min(220, nextX)),
    y: Math.max(-140, Math.min(120, nextY)),
  };
  direction.value = dragOffset.value.x < 0 ? "left" : "right";
};

const moveDrag = (event) => {
  if (!isDragging.value || isTurning.value || event.pointerId !== pointerOrigin.id) return;
  pointerState.samples += 1;
  const elapsed = Math.max(8, event.timeStamp - pointerState.time);
  const instantVelocity = (event.clientX - pointerState.x) / elapsed * 1000;
  pointerState.velocityX = pointerState.velocityX * 0.72 + instantVelocity * 0.28;
  pointerState.x = event.clientX;
  pointerState.y = event.clientY;
  pointerState.time = event.timeStamp;
  if (pointerState.frame) return;
  pointerState.frame = window.requestAnimationFrame(() => {
    pointerState.frame = 0;
    if (!isDragging.value) return;
    drawDragFrame();
    const width = pointerOrigin.target?.getBoundingClientRect().width || 330;
    if (!pointerState.turnRequested && pointerState.samples > 1 && shouldTurn(
      { x: dragOffset.value.x, velocityX: pointerState.velocityX },
      width,
    )) {
      pointerState.turnRequested = true;
      turnCard(dragOffset.value.x < 0 ? "left" : "right", true);
    }
  });
};

const commitDragFrame = () => {
  if (pointerState.frame) {
    window.cancelAnimationFrame(pointerState.frame);
    pointerState.frame = 0;
  }
  drawDragFrame();
};

const cancelDrag = () => {
  if (isTurning.value) {
    isDragging.value = false;
    pointerOrigin.target?.releasePointerCapture?.(pointerOrigin.id);
    return;
  }
  commitDragFrame();
  pointerOrigin.target?.releasePointerCapture?.(pointerOrigin.id);
  isDragging.value = false;
  dragOffset.value = { x: 0, y: 0 };
  flingX.value = 0;
  flingDrift.value = 0;
  pointerState.velocityX = 0;
  pointerState.turnRequested = false;
  direction.value = "";
};

const endDrag = (event) => {
  if (event.pointerId !== pointerOrigin.id) return;
  if (!isDragging.value) return;
  if (isTurning.value) {
    isDragging.value = false;
    pointerOrigin.target?.releasePointerCapture?.(event.pointerId);
    return;
  }
  commitDragFrame();
  pointerOrigin.target?.releasePointerCapture?.(event.pointerId);
  const width = event.currentTarget.getBoundingClientRect().width || 330;
  if (shouldTurn(
    { x: dragOffset.value.x, velocityX: pointerState.velocityX },
    width,
  )) turnCard(dragOffset.value.x < 0 ? "left" : "right", true);
  else cancelDrag();
};

const turnFromButton = () => {
  pointerState.velocityX = 0;
  turnCard("right");
};

const handleKeydown = (event) => {
  if (event.target !== event.currentTarget) return;
  if (event.key === "ArrowRight" || event.key === "ArrowLeft" || event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    pointerState.velocityX = 0;
    turnCard(event.key === "ArrowLeft" ? "left" : "right");
  }
};

defineExpose({
  turn: turnFromButton,
  isTurning,
});
onBeforeUnmount(() => {
  clearTimers();
  window.cancelAnimationFrame(pointerState.frame);
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
  --drag-x: 0px;
  --drag-y: 0px;
  --drag-turn: 0deg;
  --drag-tilt: 0deg;
  --drag-lift: 0;
  --fling-x: 0px;
  --fling-drift: 0px;
  --drag-transform:
    translate3d(var(--drag-x), var(--drag-y), calc(18px + 18px * var(--drag-lift)))
    rotateZ(var(--drag-turn))
    rotateY(calc(var(--drag-turn) * -0.42))
    rotateX(var(--drag-tilt));
  position: relative;
  width: min(100%, 330px);
  margin-inline: auto;
  padding-block: calc(16px * var(--legacy-scale, 1));
  cursor: grab;
  perspective: 1200px;
  touch-action: none;
  user-select: none;
}

.legacy-card:focus-visible {
  outline: 2px solid var(--brass);
  outline-offset: 4px;
}

.legacy-card.is-dragging {
  cursor: grabbing;
}

.legacy-card__hint {
  position: absolute;
  right: 0;
  bottom: -12px;
  left: 0;
  z-index: 4;
  color: var(--ink-faint);
  font-size: var(--text-meta);
  letter-spacing: 0.08em;
  text-align: center;
  transition: opacity var(--motion-fast) var(--ease-standard);
  pointer-events: none;
}

.legacy-card.is-dragging .legacy-card__hint,
.legacy-card.is-turning .legacy-card__hint {
  opacity: 0;
}

.legacy-card.is-dragging .legacy-card__box--current {
  transform: var(--drag-transform);
  box-shadow:
    0 calc(8px + 16px * var(--drag-lift)) calc(18px + 24px * var(--drag-lift))
    rgba(16, 40, 39, calc(0.08 + 0.12 * var(--drag-lift)));
  transition: none;
}

.legacy-card__box--incoming {
  position: absolute;
  inset: calc(16px * var(--legacy-scale)) 0 auto;
  z-index: 1;
  opacity: 0;
  transform: translateY(-8px) scale(0.992);
  will-change: transform, opacity;
}

.legacy-card__box--current {
  position: relative;
  z-index: 2;
  transform-origin: 50% 92%;
  will-change: transform, opacity;
}

.legacy-card.is-dragging .legacy-card__box--current :deep(.legacy-card__verse),
.legacy-card.is-dragging .legacy-card__box--current :deep(.legacy-card__author) {
  opacity: calc(1 - 0.35 * var(--drag-lift));
}

.legacy-card.is-dragging .legacy-card__box--incoming {
  opacity: calc(0.18 + 0.62 * var(--drag-lift));
  transform: translateY(calc(-8px + 6px * var(--drag-lift))) scale(0.992);
  transition: none;
}

.legacy-card__shards {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
}

.legacy-card__shard {
  position: absolute;
  top: var(--shard-offset, 16px);
  left: 0;
  z-index: 3;
  width: 100%;
  height: 100%;
  overflow: hidden;
  clip-path: polygon(
    0 var(--shard-top, 0%),
    100% calc(var(--shard-top, 0%) + 1.5%),
    100% calc(var(--shard-top, 0%) + var(--shard-height, 16.6667%) - 1%),
    0 calc(var(--shard-top, 0%) + var(--shard-height, 16.6667%) + 0.8%)
  );
  opacity: 0;
  visibility: hidden;
  transform-origin: 50% 92%;
  will-change: transform, opacity;
  pointer-events: none;
}

.legacy-card__shard .legacy-card__box {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: var(--shard-full-height, 620px);
  min-height: var(--shard-full-height, 620px);
  aspect-ratio: auto;
  border: 0;
  border-radius: 0;
  box-shadow: none;
}

.legacy-card__shard .legacy-card__save {
  display: none;
}

.legacy-card.is-turning .legacy-card__box--current {
  animation: card-dissolve 260ms var(--ease-standard) both;
}

.legacy-card.is-turning .legacy-card__shard {
  visibility: visible;
  transform: var(--drag-transform);
  animation: card-tear 620ms cubic-bezier(0.18, 0.72, 0.28, 1) calc(var(--shard-index, 0) * 18ms) both;
}

@keyframes card-dissolve {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

.legacy-card.is-turning.legacy-card--right .legacy-card__shard {
  animation-name: card-tear-right;
}

.legacy-card.is-turning.legacy-card--left .legacy-card__shard {
  animation-name: card-tear-left;
}

.legacy-card.is-turning .legacy-card__box--incoming {
  animation: card-settle 480ms cubic-bezier(0.22, 0.61, 0.36, 1) 40ms both;
}

.legacy-card.is-turning .legacy-card__shard :deep(.legacy-card__verse),
.legacy-card.is-turning .legacy-card__shard :deep(.legacy-card__author) {
  animation: ink-vanish 300ms var(--ease-standard) both;
}

.legacy-card__box--incoming :deep(.legacy-card__verse),
.legacy-card__box--incoming :deep(.legacy-card__author) {
  opacity: 0;
  filter: blur(4px);
  transform: translateY(-5px);
  transition:
    opacity 420ms var(--ease-standard),
    filter 420ms var(--ease-standard),
    transform 420ms var(--ease-out);
}

.legacy-card.is-writing .legacy-card__box--incoming :deep(.legacy-card__verse),
.legacy-card.is-writing .legacy-card__box--incoming :deep(.legacy-card__author) {
  opacity: 1;
  filter: blur(0);
  transform: translateY(0);
}

@keyframes card-tear-right {
  0% {
    opacity: 0;
    transform: var(--drag-transform);
  }
  12% {
    opacity: 1;
  }
  22% {
    opacity: 1;
    transform:
      translate3d(calc(var(--drag-x) + var(--fling-x) + 7%), calc(var(--drag-y) - 3%), 66px)
      rotateZ(calc(var(--drag-turn) + var(--shard-side) * 0.2))
      rotateY(-12deg) rotateX(5deg);
  }
  100% {
    opacity: 0;
    transform:
      translate3d(calc(108% + var(--fling-drift)), calc(-42% + var(--shard-lead)), 140px)
      rotateZ(calc(18deg + var(--shard-side)))
      rotateY(-48deg) rotateX(calc(9deg + var(--shard-side) * 0.12))
      scale(0.9);
  }
}

@keyframes card-tear-left {
  0% {
    opacity: 0;
    transform: var(--drag-transform);
  }
  12% {
    opacity: 1;
  }
  22% {
    opacity: 1;
    transform:
      translate3d(calc(var(--drag-x) + var(--fling-x) - 7%), calc(var(--drag-y) - 3%), 66px)
      rotateZ(calc(var(--drag-turn) - var(--shard-side) * 0.2))
      rotateY(12deg) rotateX(5deg);
  }
  100% {
    opacity: 0;
    transform:
      translate3d(calc(-108% + var(--fling-drift)), calc(-42% + var(--shard-lead)), 140px)
      rotateZ(calc(-18deg - var(--shard-side)))
      rotateY(48deg) rotateX(calc(9deg + var(--shard-side) * 0.12))
      scale(0.9);
  }
}

@keyframes card-settle {
  from {
    opacity: 0.72;
    transform: translateY(-8px) scale(0.992) rotateX(3deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1) rotateX(0deg);
  }
}

@keyframes ink-vanish {
  from {
    opacity: calc(1 - 0.72 * var(--drag-lift));
    filter: blur(calc(2px * var(--drag-lift)));
    transform: translateY(0);
  }
  to {
    opacity: 0;
    filter: blur(5px);
    transform: translateY(-8px);
  }
}

@media (max-width: 560px) {
  .legacy-card {
    --legacy-scale: 0.9090909;
    width: min(100%, 300px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .legacy-card__shard {
    display: none;
  }


  .legacy-card__box,
  .legacy-card__box::after,
  .legacy-card__save,
  .legacy-card__hint,
  .legacy-card__ink {
    animation: none !important;
    transition: none !important;
  }

  .legacy-card:not(.is-turning):hover .legacy-card__box--current {
    transform: none;
  }

  .legacy-card__box--incoming :deep(.legacy-card__verse),
  .legacy-card__box--incoming :deep(.legacy-card__author),
  .legacy-card__ink {
    opacity: 1;
    filter: none;
    transform: none;
  }
}
</style>
