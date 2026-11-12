<template>
  <article
    ref="cardElement"
    class="legacy-card"
    :class="{
      'is-dragging': isDragging,
      'is-returning': isReturning,
      'is-committing': isCommitting,
      'is-turning': isTurning,
      'is-hover-locked': hoverLocked,
      [`legacy-card--${direction}`]: direction,
    }"
    :style="cardStyle"
    aria-label="可拖走的诗词摘录卡片"
    tabindex="0"
    @pointerdown="startDrag"
    @pointermove="moveDrag"
    @pointerup="endDrag"
    @pointercancel="cancelDrag"
    @pointerenter="cancelHoverRelease"
    @pointerleave="releaseHoverLock"
    @keydown="handleKeydown"
  >
    <div class="legacy-card__hint" aria-hidden="true">轻轻一掀，换一句诗</div>

    <div class="legacy-card__stage">
      <ExcerptCardFace
        variant="current"
        :excerpt="displayCurrent"
        :saved="displayCurrentSaved"
        :data-incoming-verse="props.nextExcerpt?.content || ''"
        interactive
        @toggle-save="emit('toggle-save', displayCurrent)"
      />
      <div ref="veilElement" class="legacy-card__veil" aria-hidden="true">
        <span class="legacy-card__veil-mark"></span>
        <span class="legacy-card__veil-brush"></span>
      </div>
    </div>
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

const COVER_DURATION = 150;
const REVEAL_DURATION = 220;
const RETURN_DURATION = 320;
const isDragging = ref(false);
const isReturning = ref(false);
const isCommitting = ref(false);
const isTurning = ref(false);
const hoverLocked = ref(false);
const direction = ref("");
const dragOffset = ref({ x: 0, y: 0 });
const dragProgress = ref(0);
const frozenCurrent = ref(null);
const frozenCurrentSaved = ref(false);
const pointerOrigin = { x: 0, y: 0, id: null, target: null };
const pointerState = {
  x: 0,
  y: 0,
  time: 0,
  velocityX: 0,
  samples: [],
  frame: 0,
};
let commitTimer;
let returnTimer;
let coverAnimation = null;
let revealAnimation = null;
let turnId = 0;
let finishingTurn = false;
let hoverReleased = false;
const cardElement = ref(null);
const veilElement = ref(null);

const cardStyle = computed(() => ({
  "--drag-x": `${dragOffset.value.x}px`,
  "--drag-y": `${dragOffset.value.y}px`,
  "--drag-turn": `${Math.max(-7, Math.min(7, dragOffset.value.x * 0.045))}deg`,
  "--progress": dragProgress.value.toFixed(3),
  "--cover-duration": `${COVER_DURATION}ms`,
  "--reveal-duration": `${REVEAL_DURATION}ms`,
  "--return-duration": `${RETURN_DURATION}ms`,
}));

const displayCurrent = computed(() => frozenCurrent.value || props.excerpt);
const displayCurrentSaved = computed(() => (frozenCurrent.value
  ? frozenCurrentSaved.value
  : props.saved));

const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const stopAnimations = () => {
  coverAnimation?.cancel();
  revealAnimation?.cancel();
  coverAnimation = null;
  revealAnimation = null;
  const veil = veilElement.value;
  if (veil) veil.style.opacity = "";
};

const clearTimers = () => {
  window.clearTimeout(commitTimer);
  window.clearTimeout(returnTimer);
  window.cancelAnimationFrame(pointerState.frame);
  pointerState.frame = 0;
  stopAnimations();
  turnId += 1;
};

const finishTurn = async () => {
  if (!isCommitting.value || finishingTurn) return;
  finishingTurn = true;
  stopAnimations();
  window.clearTimeout(commitTimer);
  window.clearTimeout(returnTimer);
  emit("settled");
  await nextTick();
  frozenCurrent.value = null;
  frozenCurrentSaved.value = false;
  isCommitting.value = false;
  isTurning.value = false;
  dragOffset.value = { x: 0, y: 0 };
  dragProgress.value = 0;
  direction.value = "";
  pointerState.velocityX = 0;
  pointerState.samples = [];
  hoverLocked.value = cardElement.value?.matches(":hover") && !hoverReleased;
  finishingTurn = false;
};

const revealVerse = (id) => {
  if (id !== turnId || !isCommitting.value) return;
  const veil = veilElement.value;
  if (!veil?.animate || reducedMotion()) {
    finishTurn();
    return;
  }
  revealAnimation = veil.animate(
    [{ opacity: 1 }, { opacity: 0 }],
    { duration: REVEAL_DURATION, easing: "ease-out", fill: "forwards" },
  );
  revealAnimation.finished.then(() => {
    if (id === turnId && isCommitting.value) finishTurn();
  }).catch(() => {});
};

const coverVerse = (id) => {
  if (id !== turnId || !isCommitting.value) return;
  const veil = veilElement.value;
  if (!veil?.animate || reducedMotion()) {
    finishTurn();
    return;
  }
  coverAnimation = veil.animate(
    [{ opacity: 0 }, { opacity: 1 }],
    { duration: COVER_DURATION, easing: "ease-in", fill: "forwards" },
  );
  coverAnimation.finished.then(async () => {
    if (id !== turnId || !isCommitting.value) return;
    emit("settled");
    await nextTick();
    frozenCurrent.value = null;
    frozenCurrentSaved.value = false;
    dragOffset.value = { x: 0, y: 0 };
    dragProgress.value = 0;
    direction.value = "";
    if (id === turnId && isCommitting.value) revealVerse(id);
  }).catch(() => {});
};

const releaseHoverLock = (event) => {
  if (event.target !== event.currentTarget) return;
  hoverReleased = true;
  if (!isCommitting.value && !isReturning.value && !isTurning.value) {
    hoverLocked.value = false;
  }
};

const cancelHoverRelease = (event) => {
  if (event.target !== event.currentTarget) return;
  hoverReleased = false;
};

const commitDistance = (width) => Math.min(180, Math.max(96, width * 0.42));
const progressFor = ({ x, velocityX }, width) => {
  const velocityLead = Math.min(72, Math.abs(velocityX) * 0.055);
  return Math.min(1, (Math.abs(x) + velocityLead) / commitDistance(width));
};
const shouldCommit = ({ x, velocityX }, width) =>
  progressFor({ x, velocityX }, width) > 0.62
  || (Math.abs(velocityX) > 850 && Math.abs(x) > 16);

const startCommit = (turnDirection) => {
  if (isTurning.value || props.disabled) return;
  window.clearTimeout(commitTimer);
  window.clearTimeout(returnTimer);
  window.cancelAnimationFrame(pointerState.frame);
  pointerState.frame = 0;
  stopAnimations();
  const id = ++turnId;
  if (!props.nextExcerpt
    || props.nextExcerpt.content === props.excerpt?.content) {
    emit("needs-next");
    startReturn();
    return;
  }
  frozenCurrent.value = { ...props.excerpt };
  frozenCurrentSaved.value = props.saved;
  direction.value = turnDirection;
  isDragging.value = false;
  isReturning.value = false;
  isCommitting.value = true;
  isTurning.value = true;
  hoverLocked.value = true;
  hoverReleased = false;
  dragProgress.value = 1;
  emit("needs-next");
  emit("turn", turnDirection);
  coverVerse(id);
  commitTimer = window.setTimeout(() => {
    if (id === turnId && isCommitting.value) finishTurn();
  }, COVER_DURATION + REVEAL_DURATION + 40);
};

const startReturn = () => {
  clearTimers();
  frozenCurrent.value = null;
  frozenCurrentSaved.value = false;
  isDragging.value = false;
  isReturning.value = true;
  hoverLocked.value = true;
  hoverReleased = false;
  dragOffset.value = { x: 0, y: 0 };
  dragProgress.value = 0;
  direction.value = "";
  pointerState.velocityX = 0;
  pointerState.samples = [];
  returnTimer = window.setTimeout(() => {
    isReturning.value = false;
    hoverLocked.value = cardElement.value?.matches(":hover") && !hoverReleased;
  }, RETURN_DURATION);
};

const drawDragFrame = () => {
  const nextX = pointerState.x - pointerOrigin.x;
  const nextY = pointerState.y - pointerOrigin.y;
  dragOffset.value = {
    x: Math.max(-220, Math.min(220, nextX)),
    y: Math.max(-140, Math.min(120, nextY)),
  };
  direction.value = dragOffset.value.x < -4 ? "left" : dragOffset.value.x > 4 ? "right" : "";
  dragProgress.value = progressFor(
    { x: dragOffset.value.x, velocityX: pointerState.velocityX },
    cardElement.value?.getBoundingClientRect().width || 330,
  );
};

const startDrag = (event) => {
  if (isTurning.value || props.disabled || event.target.closest("button")) return;
  if (event.pointerType === "mouse" && event.button !== 0) return;
  clearTimers();
  frozenCurrent.value = { ...props.excerpt };
  frozenCurrentSaved.value = props.saved;
  hoverLocked.value = false;
  hoverReleased = false;
  pointerOrigin.x = event.clientX;
  pointerOrigin.y = event.clientY;
  pointerOrigin.id = event.pointerId;
  pointerOrigin.target = event.currentTarget;
  pointerOrigin.target.setPointerCapture?.(event.pointerId);
  pointerState.x = event.clientX;
  pointerState.y = event.clientY;
  pointerState.time = event.timeStamp;
  pointerState.velocityX = 0;
  pointerState.samples = [{ x: event.clientX, time: event.timeStamp }];
  pointerState.frame = 0;
  dragOffset.value = { x: 0, y: 0 };
  dragProgress.value = 0;
  direction.value = "";
  isDragging.value = true;
  isReturning.value = false;
  isCommitting.value = false;
  isTurning.value = false;
  emit("needs-next");
};

const moveDrag = (event) => {
  if (!isDragging.value || event.pointerId !== pointerOrigin.id) return;
  pointerState.samples.push({ x: event.clientX, time: event.timeStamp });
  while (pointerState.samples.length > 4
    || (pointerState.samples.length > 2 && event.timeStamp - pointerState.samples[0].time > 90)) {
    pointerState.samples.shift();
  }
  const firstSample = pointerState.samples[0];
  const elapsed = Math.max(8, event.timeStamp - firstSample.time);
  const recentVelocity = (event.clientX - firstSample.x) / elapsed * 1000;
  pointerState.velocityX = pointerState.velocityX * 0.35 + recentVelocity * 0.65;
  pointerState.x = event.clientX;
  pointerState.y = event.clientY;
  pointerState.time = event.timeStamp;
  if (pointerState.frame) return;
  pointerState.frame = window.requestAnimationFrame(() => {
    pointerState.frame = 0;
    if (!isDragging.value) return;
    drawDragFrame();
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
  if (!isDragging.value) return;
  commitDragFrame();
  pointerOrigin.target?.releasePointerCapture?.(pointerOrigin.id);
  startReturn();
};

const endDrag = (event) => {
  if (!isDragging.value || event.pointerId !== pointerOrigin.id) return;
  commitDragFrame();
  pointerOrigin.target?.releasePointerCapture?.(event.pointerId);
  const releaseState = { x: dragOffset.value.x, velocityX: pointerState.velocityX };
  if (shouldCommit(releaseState, cardElement.value?.getBoundingClientRect().width || 330)) {
    startCommit(releaseState.x < 0 ? "left" : "right");
  } else {
    startReturn();
  }
};

const turnFromButton = () => {
  if (isTurning.value || props.disabled) return;
  frozenCurrent.value = { ...props.excerpt };
  frozenCurrentSaved.value = props.saved;
  pointerState.velocityX = 0;
  pointerState.samples = [];
  dragOffset.value = { x: 0, y: 0 };
  dragProgress.value = 1;
  startCommit("right");
};

const handleKeydown = (event) => {
  if (event.target !== event.currentTarget) return;
  if (event.key === "ArrowRight" || event.key === "ArrowLeft" || event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    if (isTurning.value || props.disabled) return;
    frozenCurrent.value = { ...props.excerpt };
    frozenCurrentSaved.value = props.saved;
    pointerState.velocityX = 0;
    pointerState.samples = [];
    dragOffset.value = { x: 0, y: 0 };
    dragProgress.value = 1;
    startCommit(event.key === "ArrowLeft" ? "left" : "right");
  }
};

defineExpose({
  turn: turnFromButton,
  isTurning,
});
onBeforeUnmount(() => {
  clearTimers();
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
  --progress: 0;
  --cover-duration: 150ms;
  --reveal-duration: 220ms;
  --return-duration: 320ms;
  --drag-transform: translate3d(var(--drag-x), var(--drag-y), 0) rotateZ(var(--drag-turn));
  position: relative;
  width: min(100%, 330px);
  margin-inline: auto;
  padding-block: calc(16px * var(--legacy-scale, 1));
  cursor: grab;
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
  z-index: 5;
  color: var(--ink-faint);
  font-size: var(--text-meta);
  letter-spacing: 0.08em;
  text-align: center;
  transition: opacity var(--motion-fast) var(--ease-standard);
  pointer-events: none;
}

.legacy-card.is-dragging .legacy-card__hint,
.legacy-card.is-returning .legacy-card__hint,
.legacy-card.is-turning .legacy-card__hint,
.legacy-card.is-committing .legacy-card__hint {
  opacity: 0;
}

.legacy-card__stage {
  position: relative;
  width: 100%;
  transform-origin: 50% 50%;
  will-change: transform;
}

.legacy-card__veil {
  position: absolute;
  inset: 0;
  z-index: 10;
  overflow: hidden;
  border-radius: calc(0.3rem * var(--legacy-scale));
  background-color: #fff;
  background-image:
    linear-gradient(180deg, rgba(22, 44, 43, 0.025), transparent 22%),
    linear-gradient(0deg, rgba(232, 236, 229, 0.24), transparent 32%);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.72);
  opacity: 0;
  pointer-events: none;
  will-change: opacity;
}

.legacy-card__veil::before,
.legacy-card__veil::after {
  position: absolute;
  right: 18%;
  left: 18%;
  height: 1px;
  background: rgba(84, 84, 84, 0.08);
  content: "";
}

.legacy-card__veil::before {
  top: 42%;
}

.legacy-card__veil::after {
  top: 58%;
}

.legacy-card__veil-mark {
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(22px * var(--legacy-scale));
  height: calc(22px * var(--legacy-scale));
  border-top: 1px solid rgba(22, 49, 46, 0.22);
  border-right: 1px solid rgba(22, 49, 46, 0.22);
  transform: translate(-50%, -50%) rotate(45deg);
}

.legacy-card__veil-brush {
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(96px * var(--legacy-scale));
  height: calc(1px * var(--legacy-scale));
  background: linear-gradient(90deg,
    rgba(22, 49, 46, 0),
    rgba(22, 49, 46, 0.2) 18%,
    rgba(22, 49, 46, 0.08) 78%,
    rgba(22, 49, 46, 0));
  transform: translate(-50%, -50%) rotate(-18deg);
}

.legacy-card.is-dragging .legacy-card__stage,
.legacy-card.is-committing .legacy-card__stage {
  transform: var(--drag-transform);
  transition: none;
}

.legacy-card.is-returning .legacy-card__stage {
  transform: none;
  transition: transform var(--return-duration) cubic-bezier(0.22, 1, 0.36, 1);
}

.legacy-card:not(.is-turning):not(.is-dragging):not(.is-hover-locked):hover .legacy-card__box--current {
  transform: rotateX(5deg) translateY(calc(-3px * var(--legacy-scale)));
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.72),
    0 calc(8px * var(--legacy-scale)) calc(18px * var(--legacy-scale)) rgba(22, 49, 46, 0.09);
}

.legacy-card:not(.is-turning):not(.is-dragging):not(.is-hover-locked):hover .legacy-card__box--current::after {
  transform: translateY(100%);
  opacity: 1;
}

.legacy-card.is-dragging .legacy-card__box--current::after,
.legacy-card.is-returning .legacy-card__box--current::after,
.legacy-card.is-turning .legacy-card__box--current::after,
.legacy-card.is-hover-locked .legacy-card__box--current::after {
  transition: none;
}

@media (max-width: 560px) {
  .legacy-card {
    --legacy-scale: 0.9090909;
    width: min(100%, 300px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .legacy-card__veil {
    display: none;
  }

  .legacy-card__stage {
    transition: none !important;
  }

  .legacy-card__box,
  .legacy-card__box::after,
  .legacy-card__save,
  .legacy-card__hint {
    animation: none !important;
    transition: none !important;
  }
}
</style>
