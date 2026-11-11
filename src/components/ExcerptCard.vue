<template>
  <article
    class="legacy-card"
    :class="{
      'is-dragging': isDragging,
      'is-lifting': isLifting,
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

    <div class="legacy-card__box legacy-card__box--incoming" aria-hidden="true">
      <button
        class="legacy-card__save"
        type="button"
        :class="incomingSaved ? 'legacy-card__save--yes' : 'legacy-card__save--no'"
        :aria-pressed="incomingSaved"
        :aria-label="incomingSaved ? '取消收藏下一句摘录' : '收藏下一句摘录'"
        tabindex="-1"
        @click.stop="emit('toggle-save', incomingExcerpt)"
      >
        {{ incomingSaved ? "已藏" : "收藏" }}
      </button>
      <p class="legacy-card__verse" :class="incomingDensity">
        <span
          v-for="(character, characterIndex) in incomingCharacters"
          :key="`${character}-${characterIndex}`"
          class="legacy-card__ink"
          :style="{ '--ink-delay': `${characterIndex * 28}ms` }"
        >{{ character }}</span>
      </p>
      <h5 class="legacy-card__author">— {{ incomingExcerpt.author }}</h5>
      <img
        class="legacy-card__art"
        :src="fanzouImage"
        alt=""
        width="720"
        height="412"
        draggable="false"
      />
    </div>

    <div class="legacy-card__box legacy-card__box--current">
      <button
        class="legacy-card__save"
        type="button"
        :class="saved ? 'legacy-card__save--yes' : 'legacy-card__save--no'"
        :aria-pressed="saved"
        :aria-label="saved ? '取消收藏这句摘录' : '收藏这句摘录'"
        @click.stop="emit('toggle-save', excerpt)"
      >
        {{ saved ? "已藏" : "收藏" }}
      </button>
      <p class="legacy-card__verse" :class="verseDensity">{{ excerpt.content }}</p>
      <h5 class="legacy-card__author">— {{ excerpt.author }}</h5>
      <img
        class="legacy-card__art"
        :src="fanzouImage"
        alt=""
        width="720"
        height="412"
        draggable="false"
      />
    </div>

    <button
      class="legacy-card__turn"
      type="button"
      aria-label="掀开卡片换一句摘录"
      :disabled="disabled || isTurning"
      @click.stop="turnFromButton"
    >
      <AppIcon name="chevron-right" :size="16" />
      <span>掀开</span>
    </button>
  </article>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from "vue";
import AppIcon from "./AppIcon.vue";
import fanzouImage from "../assets/excerpt/fanzou-720.png";

const props = defineProps({
  excerpt: { type: Object, required: true },
  saved: { type: Boolean, default: false },
  nextExcerpt: { type: Object, default: null },
  nextSaved: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});
const emit = defineEmits(["toggle-save", "needs-next", "turn", "settled"]);

const isDragging = ref(false);
const isLifting = ref(false);
const isWriting = ref(false);
const isTurning = ref(false);
const direction = ref("");
const dragOffset = ref({ x: 0, y: 0 });
const pointerOrigin = { x: 0, y: 0, id: null, target: null };
const pointerState = {
  x: 0,
  y: 0,
  time: 0,
  velocityX: 0,
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
}));

const densityFor = (content) => {
  const length = Array.from(content || "").length;
  if (length > 16) return "legacy-card__verse--dense";
  if (length > 12) return "legacy-card__verse--medium";
  return "legacy-card__verse--open";
};
const verseDensity = computed(() => densityFor(props.excerpt.content));
const incomingExcerpt = computed(() => props.nextExcerpt || props.excerpt);
const incomingSaved = computed(() => props.nextSaved);
const incomingDensity = computed(() => densityFor(incomingExcerpt.value?.content));
const incomingCharacters = computed(() => Array.from(incomingExcerpt.value?.content || ""));

const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const clearTimers = () => {
  window.clearTimeout(writingTimer);
  window.clearTimeout(commitTimer);
  window.clearTimeout(releaseTimer);
};
const finishTurn = () => {
  isWriting.value = false;
  isDragging.value = false;
  isLifting.value = false;
  dragOffset.value = { x: 0, y: 0 };
  releaseTimer = window.setTimeout(() => {
    isTurning.value = false;
    direction.value = "";
    emit("settled");
  }, 0);
};

const turnCard = (turnDirection = "right") => {
  if (isTurning.value || props.disabled) return;
  emit("needs-next");
  clearTimers();
  window.cancelAnimationFrame(pointerState.frame);
  pointerState.frame = 0;
  isTurning.value = true;
  isDragging.value = false;
  isLifting.value = true;
  isWriting.value = false;
  direction.value = turnDirection;
  emit("turn", turnDirection);
  if (reducedMotion()) {
    finishTurn();
    return;
  }
  writingTimer = window.setTimeout(() => {
    isWriting.value = true;
  }, 210);
  const writingDuration = Math.max(260, incomingCharacters.value.length * 28 + 180);
  commitTimer = window.setTimeout(finishTurn, Math.min(900, Math.max(620, writingDuration)));
};

const startDrag = (event) => {
  if (isTurning.value || props.disabled || event.target.closest("button")) return;
  if (event.pointerType === "mouse" && event.button !== 0) return;
  pointerOrigin.x = event.clientX;
  pointerOrigin.y = event.clientY;
  pointerOrigin.id = event.pointerId;
  pointerOrigin.target = event.currentTarget;
  pointerOrigin.target.setPointerCapture?.(event.pointerId);
  pointerState.x = event.clientX;
  pointerState.y = event.clientY;
  pointerState.time = event.timeStamp;
  pointerState.velocityX = 0;
  pointerState.frame = 0;
  pointerState.turnRequested = false;
  dragOffset.value = { x: 0, y: 0 };
  direction.value = "";
  isDragging.value = true;
  emit("needs-next");
};

const moveDrag = (event) => {
  if (!isDragging.value || event.pointerId !== pointerOrigin.id) return;
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
    const nextX = pointerState.x - pointerOrigin.x;
    const nextY = pointerState.y - pointerOrigin.y;
    dragOffset.value = {
      x: Math.max(-220, Math.min(220, nextX)),
      y: Math.max(-140, Math.min(120, nextY)),
    };
    direction.value = dragOffset.value.x < 0 ? "left" : "right";
    const projected = Math.abs(dragOffset.value.x) + Math.abs(pointerState.velocityX) * 0.055;
    const width = pointerOrigin.target?.getBoundingClientRect().width || 330;
    const threshold = Math.min(64, Math.max(42, width * 0.17));
    if (!pointerState.turnRequested && Math.abs(dragOffset.value.x) > 12 && projected > threshold) {
      pointerState.turnRequested = true;
      pointerOrigin.target?.releasePointerCapture?.(pointerOrigin.id);
      turnCard(dragOffset.value.x < 0 ? "left" : "right");
    }
  });
};

const commitDragFrame = () => {
  if (!isDragging.value || pointerState.frame) return;
  const nextX = pointerState.x - pointerOrigin.x;
  const nextY = pointerState.y - pointerOrigin.y;
  dragOffset.value = {
    x: Math.max(-220, Math.min(220, nextX)),
    y: Math.max(-140, Math.min(120, nextY)),
  };
  direction.value = dragOffset.value.x < 0 ? "left" : "right";
};

const cancelDrag = () => {
  if (!isDragging.value) return;
  window.cancelAnimationFrame(pointerState.frame);
  pointerState.frame = 0;
  pointerOrigin.target?.releasePointerCapture?.(pointerOrigin.id);
  isDragging.value = false;
  dragOffset.value = { x: 0, y: 0 };
  direction.value = "";
};

const endDrag = (event) => {
  if (!isDragging.value || event.pointerId !== pointerOrigin.id) return;
  commitDragFrame();
  pointerOrigin.target?.releasePointerCapture?.(event.pointerId);
  const width = event.currentTarget.getBoundingClientRect().width || 330;
  const threshold = Math.min(64, Math.max(42, width * 0.17));
  const offset = dragOffset.value;
  const projected = Math.abs(offset.x) + Math.abs(pointerState.velocityX) * 0.055;
  if (Math.abs(offset.x) > 12 && projected > threshold) turnCard(offset.x < 0 ? "left" : "right");
  else cancelDrag();
};

const turnFromButton = () => {
  emit("needs-next");
  turnCard("right");
};

const handleKeydown = (event) => {
  if (event.target !== event.currentTarget) return;
  if (event.key === "ArrowRight" || event.key === "ArrowLeft" || event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    emit("needs-next");
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
  z-index: 3;
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

.legacy-card__box--incoming {
  will-change: transform, opacity;
}

.legacy-card__box--current {
  will-change: transform;
}

.legacy-card__box {
  position: relative;
  width: 100%;
  aspect-ratio: 330 / 620;
  overflow: hidden;
  border: 1px solid rgba(84, 84, 84, 0.08);
  border-radius: calc(0.3rem * var(--legacy-scale));
  background-color: #fff;
  background-image:
    radial-gradient(ellipse at 18% 10%, rgba(22, 44, 43, 0.025), transparent 32%),
    linear-gradient(180deg, transparent 66%, rgba(232, 236, 229, 0.22));
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.72),
    0 calc(2px * var(--legacy-scale)) calc(14px * var(--legacy-scale)) rgba(22, 49, 46, 0.035);
  transform-style: preserve-3d;
  transition:
    transform 0.45s var(--ease-out),
    box-shadow 0.45s var(--ease-standard);
}

.legacy-card__box::before {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: linear-gradient(108deg, transparent 45%, rgba(255, 255, 255, 0.42) 50%, transparent 55%);
  opacity: 0.7;
  content: "";
  pointer-events: none;
}

.legacy-card__box::after {
  position: absolute;
  inset: 0 0 auto;
  z-index: 3;
  height: 120%;
  background: linear-gradient(
    112deg,
    rgba(255, 255, 255, 0) 43%,
    rgba(255, 255, 255, 0.58) 50%,
    rgba(255, 255, 255, 0) 57%
  );
  transform: translateY(-100%);
  opacity: 0;
  transition:
    transform 0.85s cubic-bezier(0.165, 0.84, 0.44, 1),
    opacity 0.2s ease;
  content: "";
  pointer-events: none;
}

.legacy-card:not(.is-turning):not(.is-dragging):hover .legacy-card__box--current {
  transform: rotateX(5deg) translateY(calc(-3px * var(--legacy-scale)));
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.72),
    0 calc(8px * var(--legacy-scale)) calc(18px * var(--legacy-scale)) rgba(22, 49, 46, 0.09);
}

.legacy-card:not(.is-turning):not(.is-dragging):hover .legacy-card__box--current::after {
  transform: translateY(100%);
  opacity: 1;
}

.legacy-card__box--incoming {
  position: absolute;
  inset: calc(16px * var(--legacy-scale)) 0 auto;
  z-index: 1;
  opacity: 0;
  transform: translateY(-8px) scale(0.992);
}

.legacy-card__box--current {
  position: relative;
  z-index: 2;
  transform-origin: 50% 92%;
}

.legacy-card__save {
  position: absolute;
  top: calc(24px * var(--legacy-scale));
  left: calc(2px * var(--legacy-scale));
  z-index: 4;
  display: flex;
  width: calc(96px * var(--legacy-scale));
  height: calc(42px * var(--legacy-scale));
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: calc(2px * var(--legacy-scale));
  padding: 0;
  font-family: "LanZeExcerptAuthor", "Songti SC", serif;
  font-size: calc(17px * var(--legacy-scale));
  font-weight: 400;
  letter-spacing: calc(2px * var(--legacy-scale));
  line-height: 1;
  transform: rotateZ(-38deg);
  transform-origin: center;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
  pointer-events: auto;
}

.legacy-card.is-dragging .legacy-card__save,
.legacy-card.is-turning .legacy-card__save {
  pointer-events: none;
}

.legacy-card__save:focus-visible {
  outline: 2px solid var(--brass);
  outline-offset: -4px;
}

.legacy-card__save--yes {
  background-color: #a14134;
  color: #fff;
  box-shadow: 0 calc(4px * var(--legacy-scale)) calc(12px * var(--legacy-scale)) rgba(112, 46, 37, 0.18);
}

.legacy-card__save--no {
  background-color: transparent;
  color: rgba(84, 103, 100, 0.76);
}

.legacy-card__verse {
  position: absolute;
  top: 25%;
  left: var(--legacy-gutter);
  right: calc(var(--legacy-gutter) + 2%);
  z-index: 2;
  width: auto;
  height: calc(252px * var(--legacy-scale));
  margin: 0;
  color: var(--ink);
  font-family: "LanZeExcerptVerse", "Songti SC", serif;
  font-size: calc(20px * var(--legacy-scale));
  letter-spacing: calc(4px * var(--legacy-scale));
  line-height: 1.5;
  text-align: start;
  writing-mode: vertical-rl;
}

.legacy-card__verse--medium {
  font-size: calc(18px * var(--legacy-scale));
  letter-spacing: calc(3px * var(--legacy-scale));
}

.legacy-card__verse--dense {
  font-size: calc(16px * var(--legacy-scale));
  letter-spacing: calc(2px * var(--legacy-scale));
  line-height: 1.6;
}

.legacy-card__author {
  position: absolute;
  top: 25%;
  left: 28%;
  z-index: 2;
  margin: 0;
  color: rgba(22, 44, 43, 0.88);
  font-family: "LanZeExcerptAuthor", "Songti SC", serif;
  font-size: calc(21px * var(--legacy-scale));
  font-weight: 400;
  letter-spacing: calc(2px * var(--legacy-scale));
  writing-mode: vertical-rl;
}

.legacy-card__art {
  position: absolute;
  z-index: 1;
  bottom: 4%;
  left: var(--legacy-gutter);
  display: block;
  width: calc(100% - 24%);
  height: auto;
  opacity: 0.96;
  mix-blend-mode: multiply;
  -webkit-mask-image: linear-gradient(180deg, transparent 0%, #000 8%, #000 92%, transparent 100%);
  mask-image: linear-gradient(180deg, transparent 0%, #000 8%, #000 92%, transparent 100%);
  pointer-events: none;
}

.legacy-card__turn {
  position: absolute;
  right: calc(10px * var(--legacy-scale));
  bottom: calc(18px * var(--legacy-scale));
  z-index: 5;
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border: 1px solid rgba(22, 44, 43, 0.18);
  background: rgba(251, 252, 249, 0.88);
  color: var(--ink);
  font-size: var(--text-meta);
  letter-spacing: 0.06em;
}

.legacy-card__turn:disabled {
  cursor: not-allowed;
  opacity: 0.56;
}

.legacy-card__turn:focus-visible {
  outline: 2px solid var(--brass);
  outline-offset: 2px;
}

.legacy-card.is-dragging .legacy-card__box--current {
  transform:
    translate3d(var(--drag-x), var(--drag-y), calc(18px + 18px * var(--drag-lift)))
    rotateZ(var(--drag-turn))
    rotateY(calc(var(--drag-turn) * -0.42))
    rotateX(var(--drag-tilt));
  box-shadow:
    0 calc(8px + 16px * var(--drag-lift)) calc(18px + 24px * var(--drag-lift))
    rgba(16, 40, 39, calc(0.08 + 0.12 * var(--drag-lift)));
  transition: none;
}

.legacy-card.is-dragging .legacy-card__box--incoming {
  opacity: calc(0.18 + 0.62 * var(--drag-lift));
  transform: translateY(calc(-8px + 6px * var(--drag-lift))) scale(0.992);
  transition: none;
}

.legacy-card.is-lifting .legacy-card__box--current {
  transform-origin: 50% 96%;
}

.legacy-card.is-turning.legacy-card--right .legacy-card__box--current {
  animation: card-lift-right 560ms cubic-bezier(0.18, 0.72, 0.28, 1) both;
}

.legacy-card.is-turning.legacy-card--left .legacy-card__box--current {
  animation: card-lift-left 560ms cubic-bezier(0.18, 0.72, 0.28, 1) both;
}

.legacy-card.is-turning .legacy-card__box--incoming {
  animation: card-settle 480ms cubic-bezier(0.22, 0.61, 0.36, 1) 80ms both;
}

.legacy-card__box--incoming .legacy-card__verse,
.legacy-card__box--incoming .legacy-card__author {
  opacity: 0;
  transition: opacity 260ms var(--ease-standard);
}

.legacy-card.is-writing .legacy-card__box--incoming .legacy-card__verse,
.legacy-card.is-writing .legacy-card__box--incoming .legacy-card__author {
  opacity: 1;
}

.legacy-card__ink {
  display: inline;
  opacity: 0;
  filter: blur(2px);
  transform: translateY(-3px);
}

.legacy-card.is-writing .legacy-card__ink {
  animation: ink-appear 220ms var(--ease-out) var(--ink-delay) both;
}

@keyframes card-lift-right {
  0% {
    opacity: 1;
    transform:
      translate3d(var(--drag-x), var(--drag-y), calc(18px + 18px * var(--drag-lift)))
      rotateZ(var(--drag-turn)) rotateY(calc(var(--drag-turn) * -0.42)) rotateX(var(--drag-tilt));
  }
  28% {
    opacity: 1;
    transform: translate3d(calc(var(--drag-x) + 9%), calc(var(--drag-y) - 6%), 78px) rotateZ(7deg) rotateY(-24deg) rotateX(9deg);
  }
  100% {
    opacity: 0;
    transform: translate3d(92%, -48%, 124px) rotateZ(18deg) rotateY(-52deg) rotateX(16deg) scale(0.92);
  }
}

@keyframes card-lift-left {
  0% {
    opacity: 1;
    transform:
      translate3d(var(--drag-x), var(--drag-y), calc(18px + 18px * var(--drag-lift)))
      rotateZ(var(--drag-turn)) rotateY(calc(var(--drag-turn) * -0.42)) rotateX(var(--drag-tilt));
  }
  28% {
    opacity: 1;
    transform: translate3d(calc(var(--drag-x) - 9%), calc(var(--drag-y) - 6%), 78px) rotateZ(-7deg) rotateY(24deg) rotateX(9deg);
  }
  100% {
    opacity: 0;
    transform: translate3d(-92%, -48%, 124px) rotateZ(-18deg) rotateY(52deg) rotateX(16deg) scale(0.92);
  }
}

@keyframes card-settle {
  from {
    opacity: 0.78;
    transform: translateY(-8px) scale(0.992) rotateX(3deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1) rotateX(0deg);
  }
}

@keyframes ink-appear {
  from {
    opacity: 0;
    filter: blur(2px);
    transform: translateY(-3px);
  }
  to {
    opacity: 1;
    filter: blur(0);
    transform: translateY(0);
  }
}

@media (max-width: 560px) {
  .legacy-card {
    --legacy-scale: 0.9090909;
    width: min(100%, 300px);
  }

  .legacy-card__box--incoming {
    inset: calc(16px * var(--legacy-scale)) 0 auto;
  }
}

@media (prefers-reduced-motion: reduce) {
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

  .legacy-card__box--incoming .legacy-card__verse,
  .legacy-card__box--incoming .legacy-card__author,
  .legacy-card__ink {
    opacity: 1;
    filter: none;
    transform: none;
  }
}
</style>
