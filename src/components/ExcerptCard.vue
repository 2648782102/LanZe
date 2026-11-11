<template>
  <article
    class="legacy-card"
    :class="{
      'is-dragging': isDragging,
      'is-returning': isReturning,
      'is-committing': isCommitting,
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
      :excerpt="displayIncoming"
      :saved="displayIncomingSaved"
      :ink-window="inkWindow"
      ink
    />

    <ExcerptCardFace
      variant="current"
      :excerpt="displayCurrent"
      :saved="displayCurrentSaved"
      :interactive="!isCommitting"
      @toggle-save="emit('toggle-save', displayCurrent)"
    />

    <div
      v-if="outgoingExcerpt"
      class="legacy-card__outgoing"
      :style="{
        '--outgoing-offset': `${cardSize.offset}px`,
        '--outgoing-height': `${cardSize.height}px`,
      }"
      aria-hidden="true"
      @animationend="handleOutgoingAnimationEnd"
    >
      <ExcerptCardFace
        variant="outgoing"
        :excerpt="outgoingExcerpt"
        :saved="outgoingSaved"
      />
      <div v-if="isCommitting" class="legacy-card__dust" aria-hidden="true">
        <span
          v-for="particle in particles"
          :key="particle.id"
          class="legacy-card__pixel"
          :style="particle"
        />
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

const TURN_DURATION = 560;
const INK_WINDOW = TURN_DURATION;
const isDragging = ref(false);
const isReturning = ref(false);
const isCommitting = ref(false);
const isTurning = ref(false);
const inkWindow = ref(INK_WINDOW);
const direction = ref("");
const dragOffset = ref({ x: 0, y: 0 });
const dragProgress = ref(0);
const cardSize = ref({ width: 330, height: 620, offset: 16 });
const outgoingExcerpt = ref(null);
const outgoingSaved = ref(false);
const frozenCurrent = ref(null);
const frozenCurrentSaved = ref(false);
const frozenIncoming = ref(null);
const frozenIncomingSaved = ref(false);
const initialMotion = {
  duration: TURN_DURATION,
  ease: "linear",
  exitX: "0px",
  exitXEarly: "0px",
  exitXMid: "0px",
  exitXLate: "0px",
  exitY: "0px",
  exitYEarly: "0px",
  exitYMid: "0px",
  exitYLate: "0px",
  exitRot: "0deg",
  exitRotEarly: "0deg",
  exitRotMid: "0deg",
  exitRotLate: "0deg",
  exitRotY: "0deg",
};
const releaseMotion = ref({ ...initialMotion });
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
let settling = false;

const particleSeed = (value) => {
  const wave = Math.sin(value * 12.9898) * 43758.5453;
  return wave - Math.floor(wave);
};

const cardStyle = computed(() => ({
  "--drag-x": `${dragOffset.value.x}px`,
  "--drag-y": `${dragOffset.value.y}px`,
  "--drag-turn": `${dragOffset.value.x * 0.065}deg`,
  "--drag-tilt": `${Math.max(-9, Math.min(9, dragOffset.value.y * -0.032))}deg`,
  "--drag-lift": `${Math.min(1, Math.hypot(dragOffset.value.x, dragOffset.value.y) / 72)}`,
  "--progress": dragProgress.value.toFixed(3),
  "--incoming-opacity": (incomingPrepared.value ? dragProgress.value : 0).toFixed(3),
  "--current-ink-opacity": (1 - 0.72 * dragProgress.value).toFixed(3),
  "--ink-opacity": clamp((dragProgress.value - 0.28) / 0.58, 0, 1).toFixed(3),
  "--exit-duration": `${releaseMotion.value.duration}ms`,
  "--exit-ease": releaseMotion.value.ease,
  "--exit-x": releaseMotion.value.exitX,
  "--exit-x-early": releaseMotion.value.exitXEarly,
  "--exit-x-mid": releaseMotion.value.exitXMid,
  "--exit-x-late": releaseMotion.value.exitXLate,
  "--exit-y": releaseMotion.value.exitY,
  "--exit-y-early": releaseMotion.value.exitYEarly,
  "--exit-y-mid": releaseMotion.value.exitYMid,
  "--exit-y-late": releaseMotion.value.exitYLate,
  "--exit-rot": releaseMotion.value.exitRot,
  "--exit-rot-early": releaseMotion.value.exitRotEarly,
  "--exit-rot-mid": releaseMotion.value.exitRotMid,
  "--exit-rot-late": releaseMotion.value.exitRotLate,
  "--exit-rot-y": releaseMotion.value.exitRotY,
  "--ink-window": `${inkWindow.value}ms`,
  "--author-duration": `${Math.min(220, Math.max(90, Math.round(inkWindow.value * 0.4)))}ms`,
  "--author-delay": `${Math.round(inkWindow.value * 0.32)}ms`,
}));

const incomingExcerpt = computed(() => props.nextExcerpt || props.excerpt);
const incomingSaved = computed(() => props.nextSaved);
const visibleCurrent = computed(() => frozenCurrent.value || props.excerpt);
const displayCurrent = computed(() => visibleCurrent.value);
const displayCurrentSaved = computed(() => (frozenCurrent.value
  ? frozenCurrentSaved.value
  : props.saved));
const displayIncoming = computed(() => frozenIncoming.value || incomingExcerpt.value);
const displayIncomingSaved = computed(() => (frozenIncoming.value
  ? frozenIncomingSaved.value
  : incomingSaved.value));
const incomingPrepared = computed(() => {
  const candidate = frozenIncoming.value || props.nextExcerpt;
  return Boolean(candidate && candidate.content !== visibleCurrent.value?.content);
});

const particleColumns = 10;
const particleRows = 18;
const particleDelays = computed(() => {
  const active = Math.round(TURN_DURATION * 0.16);
  return Array.from({ length: particleColumns * particleRows }, (_, index) => {
    const column = index % particleColumns;
    const row = Math.floor(index / particleColumns);
    const scatter = particleSeed(index + 11);
    return Math.round((column * 7 + row * 11 + Math.floor(scatter * 50)) % active);
  });
});
const particles = computed(() => Array.from({ length: particleColumns * particleRows }, (_, index) => {
  const column = index % particleColumns;
  const row = Math.floor(index / particleColumns);
  const scatter = particleSeed(index + 11);
  const drift = particleSeed(index + 29);
  const spin = particleSeed(index + 47);
  const toneSeed = particleSeed(index + 91);
  const sign = direction.value === "left" ? -1 : 1;
  let pixelColor = "rgba(255, 255, 255, 0.96)";
  if (row > 5 && row < 14 && column > 1 && column < 9 && toneSeed > 0.78) {
    pixelColor = "rgba(22, 44, 43, 0.82)";
  } else if (row > 12 && toneSeed > 0.72) {
    pixelColor = "rgba(81, 122, 112, 0.58)";
  } else if (row < 3 && column < 3 && toneSeed > 0.84) {
    pixelColor = "rgba(161, 65, 52, 0.72)";
  } else if (toneSeed > 0.9) {
    pixelColor = "rgba(232, 236, 229, 0.9)";
  }
  return {
    id: index,
    "--px": `${column / particleColumns * 100}%`,
    "--py": `${row / particleRows * 100}%`,
    "--pw": `${100 / particleColumns}%`,
    "--ph": `${100 / particleRows}%`,
    "--dx": `${Math.round(sign * (28 + column * 7) + (scatter - 0.5) * 80)}px`,
    "--dy": `${Math.round(-40 - row * 3 + (drift - 0.5) * 100)}px`,
    "--rot": `${Math.round((spin - 0.5) * 80)}deg`,
    "--delay": `${particleDelays.value[index]}ms`,
    "--pixel-color": pixelColor,
    "--pixel-opacity": (0.42 + particleSeed(index + 37) * 0.55).toFixed(2),
  };
}));

const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const clearTimers = () => {
  window.clearTimeout(commitTimer);
  window.clearTimeout(returnTimer);
  window.cancelAnimationFrame(pointerState.frame);
  pointerState.frame = 0;
};

const finishTurn = async () => {
  if (!isCommitting.value || settling) return;
  settling = true;
  clearTimers();
  const settledExcerpt = frozenIncoming.value || incomingExcerpt.value;
  const settledSaved = displayIncomingSaved.value;
  emit("settled");
  await nextTick();
  if (props.excerpt?.content !== settledExcerpt?.content) {
    frozenCurrent.value = { ...settledExcerpt };
    frozenCurrentSaved.value = settledSaved;
    frozenIncoming.value = { ...settledExcerpt };
    frozenIncomingSaved.value = settledSaved;
  }
  isCommitting.value = false;
  isTurning.value = false;
  outgoingExcerpt.value = null;
  frozenCurrent.value = null;
  frozenIncoming.value = null;
  dragOffset.value = { x: 0, y: 0 };
  dragProgress.value = 0;
  direction.value = "";
  releaseMotion.value = { ...initialMotion };
  inkWindow.value = INK_WINDOW;
  pointerState.velocityX = 0;
  pointerState.samples = [];
  settling = false;
};

const handleOutgoingAnimationEnd = (event) => {
  if (event.target !== event.currentTarget) return;
  if (!String(event.animationName || "").includes("card-out")) return;
  finishTurn();
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
  clearTimers();
  const currentSnapshot = frozenCurrent.value || props.excerpt;
  const preparedIncoming = frozenIncoming.value || props.nextExcerpt;
  if (!preparedIncoming || preparedIncoming.content === currentSnapshot?.content) {
    emit("needs-next");
    startReturn();
    return;
  }
  const sign = turnDirection === "left" ? -1 : 1;
  const currentSaved = frozenCurrent.value ? frozenCurrentSaved.value : props.saved;
  const incomingSavedSnapshot = frozenIncoming.value
    ? frozenIncomingSaved.value
    : props.nextSaved;
  const rawVelocity = Math.sign(pointerState.velocityX) === sign
    ? Math.abs(pointerState.velocityX)
    : 0;
  const momentum = Math.min(280, Math.max(0, rawVelocity * 0.16));
  const exitDistance = Math.round(Math.min(420, Math.max(160,
    Math.abs(dragOffset.value.x) * 1.35 + momentum,
  )));
  const duration = TURN_DURATION;
  const verticalLift = -Math.round(24 + exitDistance * 0.06);
  const rotation = Math.min(24, 10 + rawVelocity * 0.004);
  const signed = (value) => sign * Math.round(value);
  releaseMotion.value = {
    duration,
    ease: "linear",
    exitX: `${signed(exitDistance)}px`,
    exitXEarly: `${signed(exitDistance * 0.35)}px`,
    exitXMid: `${signed(exitDistance * 0.72)}px`,
    exitXLate: `${signed(exitDistance * 0.92)}px`,
    exitY: `${verticalLift}px`,
    exitYEarly: `${Math.round(verticalLift * 0.28)}px`,
    exitYMid: `${Math.round(verticalLift * 0.68)}px`,
    exitYLate: `${Math.round(verticalLift * 0.9)}px`,
    exitRot: `${signed(rotation)}deg`,
    exitRotEarly: `${signed(rotation * 0.24)}deg`,
    exitRotMid: `${signed(rotation * 0.68)}deg`,
    exitRotLate: `${signed(rotation * 0.92)}deg`,
    exitRotY: `${-sign * 28}deg`,
  };
  direction.value = turnDirection;
  frozenCurrent.value = { ...currentSnapshot };
  frozenCurrentSaved.value = currentSaved;
  frozenIncoming.value = { ...preparedIncoming };
  frozenIncomingSaved.value = incomingSavedSnapshot;
  outgoingExcerpt.value = frozenCurrent.value;
  outgoingSaved.value = frozenCurrentSaved.value;
  isDragging.value = false;
  isReturning.value = false;
  isCommitting.value = true;
  isTurning.value = true;
  dragProgress.value = 1;
  inkWindow.value = reducedMotion() ? 0 : duration;
  emit("needs-next");
  emit("turn", turnDirection);
  commitTimer = window.setTimeout(finishTurn, reducedMotion() ? 0 : duration + 80);
};

const startReturn = () => {
  clearTimers();
  isDragging.value = false;
  isReturning.value = true;
  dragOffset.value = { x: 0, y: 0 };
  dragProgress.value = 0;
  direction.value = "";
  releaseMotion.value = { ...initialMotion };
  inkWindow.value = INK_WINDOW;
  outgoingExcerpt.value = null;
  frozenCurrent.value = null;
  frozenIncoming.value = null;
  pointerState.velocityX = 0;
  pointerState.samples = [];
  returnTimer = window.setTimeout(() => {
    isReturning.value = false;
  }, 420);
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
    cardSize.value.width,
  );
};

const startDrag = (event) => {
  if (isTurning.value || props.disabled || event.target.closest("button")) return;
  if (event.pointerType === "mouse" && event.button !== 0) return;
  clearTimers();
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
  pointerState.samples = [{ x: event.clientX, time: event.timeStamp }];
  pointerState.frame = 0;
  dragOffset.value = { x: 0, y: 0 };
  dragProgress.value = 0;
  releaseMotion.value = { ...initialMotion };
  inkWindow.value = INK_WINDOW;
  outgoingExcerpt.value = null;
  frozenCurrent.value = { ...props.excerpt };
  frozenCurrentSaved.value = props.saved;
  if (props.nextExcerpt && props.nextExcerpt.content !== props.excerpt.content) {
    frozenIncoming.value = { ...props.nextExcerpt };
    frozenIncomingSaved.value = props.nextSaved;
  } else {
    frozenIncoming.value = null;
    frozenIncomingSaved.value = false;
  }
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
  if (shouldCommit(releaseState, cardSize.value.width)) {
    startCommit(releaseState.x < 0 ? "left" : "right");
  } else {
    startReturn();
  }
};

const turnFromButton = () => {
  if (isTurning.value || props.disabled) return;
  pointerState.velocityX = 0;
  pointerState.samples = [];
  dragOffset.value = { x: 0, y: 0 };
  dragProgress.value = 1;
  releaseMotion.value = { ...initialMotion };
  frozenCurrent.value = null;
  frozenIncoming.value = null;
  startCommit("right");
};

const handleKeydown = (event) => {
  if (event.target !== event.currentTarget) return;
  if (event.key === "ArrowRight" || event.key === "ArrowLeft" || event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    if (isTurning.value || props.disabled) return;
    pointerState.velocityX = 0;
    pointerState.samples = [];
    dragOffset.value = { x: 0, y: 0 };
    dragProgress.value = 1;
    releaseMotion.value = { ...initialMotion };
    frozenCurrent.value = null;
    frozenIncoming.value = null;
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
  --drag-tilt: 0deg;
  --drag-lift: 0;
  --progress: 0;
  --incoming-opacity: 0;
  --ink-opacity: 0;
  --current-ink-opacity: 1;
  --exit-x: 0px;
  --exit-x-early: 0px;
  --exit-x-mid: 0px;
  --exit-x-late: 0px;
  --exit-y: 0px;
  --exit-y-early: 0px;
  --exit-y-mid: 0px;
  --exit-y-late: 0px;
  --exit-rot: 0deg;
  --exit-rot-early: 0deg;
  --exit-rot-mid: 0deg;
  --exit-rot-late: 0deg;
  --exit-rot-y: 0deg;
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

.legacy-card__box--incoming {
  position: absolute;
  inset: calc(16px * var(--legacy-scale)) 0 auto;
  z-index: 1;
  opacity: var(--incoming-opacity);
  transform: none;
  will-change: opacity;
}

.legacy-card.is-committing .legacy-card__box--incoming {
  opacity: 1;
}

.legacy-card__box--current {
  position: relative;
  z-index: 2;
  transform-origin: 50% 92%;
  will-change: transform, opacity;
}

.legacy-card.is-dragging .legacy-card__box--current {
  transform: var(--drag-transform);
  box-shadow:
    0 calc(8px + 16px * var(--drag-lift)) calc(18px + 24px * var(--drag-lift))
    rgba(16, 40, 39, calc(0.08 + 0.12 * var(--drag-lift)));
  transition: none;
}

.legacy-card.is-dragging .legacy-card__box--incoming {
  transition: none !important;
}

.legacy-card.is-returning .legacy-card__box--current {
  transform: none;
  transition:
    transform 380ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 380ms var(--ease-standard);
}

.legacy-card.is-returning .legacy-card__box--incoming {
  opacity: 0;
  transition: opacity 260ms var(--ease-standard) !important;
}

.legacy-card.is-committing .legacy-card__box--current {
  opacity: 0;
  visibility: hidden;
  transform: none !important;
  transition: none !important;
}

.legacy-card.is-committing .legacy-card__box--incoming {
  opacity: 1;
  transform: none;
  transition: none !important;
}

.legacy-card__box--current :deep(.legacy-card__verse),
.legacy-card__box--current :deep(.legacy-card__author) {
  opacity: var(--current-ink-opacity);
  transition: opacity 80ms linear;
}

.legacy-card.is-committing .legacy-card__box--current :deep(.legacy-card__verse),
.legacy-card.is-committing .legacy-card__box--current :deep(.legacy-card__author) {
  opacity: 1;
  transition: none;
}

.legacy-card__box--incoming :deep(.legacy-card__author) {
  opacity: var(--ink-opacity);
}

.legacy-card.is-committing .legacy-card__box--incoming :deep(.legacy-card__author) {
  opacity: 1;
}

.legacy-card__outgoing {
  position: absolute;
  top: var(--outgoing-offset, 16px);
  left: 0;
  z-index: 3;
  width: 100%;
  height: var(--outgoing-height, 620px);
  opacity: 1;
  transform: var(--drag-transform);
  transform-origin: 50% 92%;
  overflow: visible;
  pointer-events: none;
  will-change: transform, opacity;
}

.legacy-card__outgoing :deep(.legacy-card__box) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  aspect-ratio: auto;
  border: 0;
  border-radius: calc(0.3rem * var(--legacy-scale));
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.72),
    0 calc(8px * var(--legacy-scale)) calc(18px * var(--legacy-scale)) rgba(22, 49, 46, 0.09);
  overflow: hidden;
  transform: none;
  transition: none;
}

.legacy-card__outgoing :deep(.legacy-card__save) {
  display: none;
}

.legacy-card__outgoing :deep(.legacy-card__verse),
.legacy-card__outgoing :deep(.legacy-card__author) {
  opacity: 1;
}

.legacy-card__dust {
  position: absolute;
  inset: 0;
  z-index: 4;
  overflow: visible;
  pointer-events: none;
}

.legacy-card__pixel {
  position: absolute;
  top: var(--py);
  left: var(--px);
  width: var(--pw);
  height: var(--ph);
  pointer-events: none;
}

.legacy-card__pixel::before,
.legacy-card__pixel::after {
  position: absolute;
  inset: 0;
  display: block;
  content: "";
  transform-origin: center;
  will-change: transform, opacity;
}

.legacy-card__pixel::before {
  background: var(--porcelain);
  opacity: 0;
  transform: scale(0);
}

.legacy-card__pixel::after {
  background: var(--pixel-color);
  opacity: 0;
}

.legacy-card.is-committing .legacy-card__outgoing {
  animation: card-out var(--exit-duration) var(--exit-ease) both;
}

.legacy-card.is-committing .legacy-card__pixel::before {
  animation: pixel-hole 180ms steps(2, end) var(--delay) forwards;
}

.legacy-card.is-committing .legacy-card__pixel::after {
  animation: pixel-fly calc(var(--exit-duration) - 90ms) var(--exit-ease) var(--delay) both;
}

@keyframes card-out {
  0% {
    opacity: 1;
    transform: var(--drag-transform);
  }
  28% {
    opacity: 1;
    transform:
      translate3d(calc(var(--drag-x) + var(--exit-x-early)), calc(var(--drag-y) + var(--exit-y-early)), 68px)
      rotateZ(calc(var(--drag-turn) + var(--exit-rot-early)))
      rotateY(var(--exit-rot-y))
      rotateX(4deg);
  }
  62% {
    opacity: 0.82;
    transform:
      translate3d(calc(var(--drag-x) + var(--exit-x-mid)), calc(var(--drag-y) + var(--exit-y-mid)), 112px)
      rotateZ(calc(var(--drag-turn) + var(--exit-rot-mid)))
      rotateY(var(--exit-rot-y))
      rotateX(8deg)
      scale(0.97);
  }
  88% {
    opacity: 0.36;
    transform:
      translate3d(calc(var(--drag-x) + var(--exit-x-late)), calc(var(--drag-y) + var(--exit-y-late)), 142px)
      rotateZ(calc(var(--drag-turn) + var(--exit-rot-late)))
      rotateY(var(--exit-rot-y))
      rotateX(11deg)
      scale(0.92);
  }
  100% {
    opacity: 0;
    transform:
      translate3d(calc(var(--drag-x) + var(--exit-x)), calc(var(--drag-y) + var(--exit-y)), 154px)
      rotateZ(calc(var(--drag-turn) + var(--exit-rot)))
      rotateY(var(--exit-rot-y))
      rotateX(12deg)
      scale(0.88);
  }
}

@keyframes pixel-hole {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  45% {
    opacity: 1;
    transform: scale(1.12);
  }
  100% {
    opacity: 1;
    transform: scale(1.04);
  }
}

@keyframes pixel-fly {
  0% {
    opacity: var(--pixel-opacity);
    transform: translate3d(0, 0, 0) scale(1);
  }
  18% {
    opacity: var(--pixel-opacity);
  }
  100% {
    opacity: 0;
    transform: translate3d(var(--dx), var(--dy), 0) rotate(var(--rot)) scale(0.18);
  }
}

@media (max-width: 560px) {
  .legacy-card {
    --legacy-scale: 0.9090909;
    width: min(100%, 300px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .legacy-card__outgoing,
  .legacy-card__dust {
    display: none;
  }

  .legacy-card.is-committing .legacy-card__box--current {
    opacity: 1;
    visibility: visible;
    transform: none;
  }

  .legacy-card.is-committing .legacy-card__box--incoming {
    opacity: 1;
  }

  .legacy-card__box,
  .legacy-card__box::after,
  .legacy-card__save,
  .legacy-card__hint,
  .legacy-card__pixel::before,
  .legacy-card__pixel::after {
    animation: none !important;
    transition: none !important;
  }

  .legacy-card__box--current :deep(.legacy-card__verse),
  .legacy-card__box--current :deep(.legacy-card__author),
  .legacy-card__box--incoming :deep(.legacy-card__author),
  .legacy-card__ink {
    opacity: 1;
  }
}
</style>
