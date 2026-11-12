<template>
  <div class="legacy-card__box" :class="`legacy-card__box--${variant}`" :aria-hidden="interactive ? undefined : 'true'">
    <component
      :is="interactive ? 'button' : 'span'"
      class="legacy-card__save"
      :class="saved ? 'legacy-card__save--yes' : 'legacy-card__save--no'"
      :type="interactive ? 'button' : undefined"
      :tabindex="interactive ? undefined : -1"
      :aria-pressed="interactive ? saved : undefined"
      :aria-label="interactive ? (saved ? '取消收藏这句摘录' : '收藏这句摘录') : undefined"
      @click.stop="handleSave"
    >
      {{ saved ? "已藏" : "收藏" }}
    </component>
    <p class="legacy-card__verse" :class="[verseDensity, { 'legacy-card__verse--ink': ink }]">
      <template v-if="ink">
        <span
          v-for="(character, characterIndex) in characters"
          :key="`${character}-${characterIndex}`"
          class="legacy-card__glyph"
          :data-char="character"
        >{{ character }}</span>
      </template>
      <template v-else>{{ excerpt.content }}</template>
    </p>
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
</template>

<script setup>
import { computed } from "vue";
import fanzouImage from "../assets/excerpt/fanzou-720.png";

const props = defineProps({
  excerpt: { type: Object, required: true },
  saved: { type: Boolean, default: false },
  variant: { type: String, required: true },
  interactive: { type: Boolean, default: false },
  ink: { type: Boolean, default: false },
});
const emit = defineEmits(["toggle-save"]);

const densityFor = (content) => {
  const graphemes = Array.from(content || "");
  const length = graphemes.length;
  const breaks = graphemes.filter((character) => "，。？！；：、".includes(character)).length;
  if (length > 20 || breaks > 2) return "legacy-card__verse--dense";
  if (length > 14 || breaks > 1) return "legacy-card__verse--medium";
  return "legacy-card__verse--open";
};
const verseDensity = computed(() => densityFor(props.excerpt.content));
const characters = computed(() => Array.from(props.excerpt?.content || ""));
const handleSave = () => {
  if (props.interactive) emit("toggle-save");
};
</script>

<style>
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
  line-height: 1.7;
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

.legacy-card__glyph {
  display: inline-block;
}

.legacy-card__verse--ink {
  --ink-duration: 180ms;
  opacity: 1;
  clip-path: inset(0 0 100% 0);
  filter: blur(1.6px);
  transform: translate3d(-0.08em, 0.12em, 0) rotate(-1.5deg) scale(0.96);
  transform-origin: 50% 100%;
  transition: none;
  will-change: clip-path, opacity, filter, transform;
}

.legacy-card.is-committing .legacy-card__box--incoming .legacy-card__verse--ink {
  animation: brush-write var(--ink-duration) cubic-bezier(0.18, 0.62, 0.3, 1) both;
}

.legacy-card__box--incoming .legacy-card__author {
  opacity: 0;
  filter: blur(2px);
  transform: translateY(-5px);
  transition: none;
}

.legacy-card.is-committing .legacy-card__box--incoming .legacy-card__author {
  animation: brush-fade var(--author-duration) cubic-bezier(0.22, 0.61, 0.36, 1) var(--author-delay) both;
}

@keyframes brush-write {
  0% {
    opacity: 0;
    clip-path: inset(0 0 100% 0);
    filter: blur(2.8px);
    text-shadow: 0 0 0 rgba(22, 44, 43, 0);
    transform: translate3d(-0.12em, 0.18em, 0) rotate(-2deg) scale(0.92);
  }
  35% {
    opacity: 0.72;
    clip-path: inset(0 0 52% 0);
    filter: blur(1.5px);
    text-shadow: 0 0 2px rgba(22, 44, 43, 0.34);
  }
  72% {
    opacity: 0.94;
    clip-path: inset(0 0 12% 0);
    filter: blur(0.55px);
    text-shadow: 0 0 3px rgba(22, 44, 43, 0.2);
  }
  100% {
    opacity: 1;
    clip-path: inset(0 0 0 0);
    filter: blur(0);
    text-shadow: 0 0 0 rgba(22, 44, 43, 0);
    transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
  }
}

@keyframes ink-bleed {
  0% {
    opacity: 0;
    clip-path: inset(0 0 100% 0);
    transform: translate3d(0.04em, -0.02em, 0);
  }
  35% {
    opacity: 0.34;
    clip-path: inset(0 0 48% 0);
  }
  72% {
    opacity: 0.18;
    clip-path: inset(0 0 8% 0);
  }
  100% {
    opacity: 0;
    clip-path: inset(0 0 0 0);
    transform: translate3d(-0.03em, 0.02em, 0);
  }
}

@keyframes brush-fade {
  from {
    opacity: 0;
    filter: blur(2px);
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    filter: blur(0);
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .legacy-card__box,
  .legacy-card__box::after,
  .legacy-card__save,
  .legacy-card__verse--ink,
  .legacy-card__box--incoming .legacy-card__author {
    animation: none !important;
    transition: none !important;
  }

  .legacy-card:not(.is-turning):not(.is-hover-locked):hover .legacy-card__box--current {
    transform: none;
  }

  .legacy-card__verse--ink,
  .legacy-card__box--incoming .legacy-card__author {
    opacity: 1;
    clip-path: none;
    filter: none;
    transform: none;
  }
}
</style>
