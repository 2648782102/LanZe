<template>
  <article class="legacy-card" aria-label="旧版诗词摘录卡片">
    <div class="legacy-card__box">
      <button
        class="legacy-card__save"
        type="button"
        :class="saved ? 'legacy-card__save--yes' : 'legacy-card__save--no'"
        :aria-pressed="saved"
        :aria-label="saved ? '取消收藏这句摘录' : '收藏这句摘录'"
        @click="emit('toggle-save')"
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
  </article>
</template>

<script setup>
import { computed } from "vue";
import fanzouImage from "../assets/excerpt/fanzou-720.png";

const props = defineProps({
  excerpt: { type: Object, required: true },
  saved: { type: Boolean, default: false },
});
const emit = defineEmits(["toggle-save"]);

const verseDensity = computed(() => {
  const length = Array.from(props.excerpt.content || "").length;
  if (length > 16) return "legacy-card__verse--dense";
  if (length > 12) return "legacy-card__verse--medium";
  return "legacy-card__verse--open";
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
  width: min(100%, 330px);
  margin-inline: auto;
  padding-block: calc(16px * var(--legacy-scale, 1));
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
  transition: 0.45s ease-in-out;
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

.legacy-card__box:hover {
  transform: rotateX(5deg) translateY(calc(-3px * var(--legacy-scale)));
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.72),
    0 calc(8px * var(--legacy-scale)) calc(18px * var(--legacy-scale)) rgba(22, 49, 46, 0.09);
  transition: 0.45s ease-in-out;
}

.legacy-card__box:hover::after {
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
  left: 50%;
  z-index: 2;
  width: 88%;
  height: calc(252px * var(--legacy-scale));
  margin: 0;
  color: var(--ink);
  font-family: "LanZeExcerptVerse", "Songti SC", serif;
  font-size: calc(20px * var(--legacy-scale));
  letter-spacing: calc(4px * var(--legacy-scale));
  line-height: 1.5;
  text-align: start;
  transform: translateX(-50%);
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
  left: 8%;
  display: block;
  width: 84%;
  height: auto;
  opacity: 0.96;
  mix-blend-mode: multiply;
  -webkit-mask-image: linear-gradient(180deg, transparent 0%, #000 8%, #000 92%, transparent 100%);
  mask-image: linear-gradient(180deg, transparent 0%, #000 8%, #000 92%, transparent 100%);
  pointer-events: none;
}

@media (max-width: 560px) {
  .legacy-card {
    --legacy-scale: 0.9090909;
    width: min(100%, 300px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .legacy-card__box,
  .legacy-card__box::after,
  .legacy-card__save {
    transition: none;
  }

  .legacy-card__box:hover {
    transform: none;
  }
}
</style>
