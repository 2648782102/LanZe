<template>
  <article class="legacy-card" aria-label="旧版诗词摘录卡片">
    <div class="legacy-card__box">
      <button
        class="legacy-card__save"
        type="button"
        :class="saved ? 'legacy-card__save--yes' : 'legacy-card__save--no'"
        :aria-pressed="saved"
        aria-label="收藏这句摘录"
        @click="emit('toggle-save')"
      >
        收藏
      </button>
      <p class="legacy-card__verse">{{ excerpt.content }}</p>
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
import fanzouImage from "../assets/excerpt/fanzou-720.png";

defineProps({
  excerpt: { type: Object, required: true },
  saved: { type: Boolean, default: false },
});
const emit = defineEmits(["toggle-save"]);
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
  border: 1px solid rgba(84, 84, 84, 0.1);
  border-radius: calc(0.3rem * var(--legacy-scale));
  background: #fff;
  box-shadow: 0 0 0 rgba(120, 120, 120, 0);
  transform-style: preserve-3d;
  transition: 0.45s ease-in-out;
}

.legacy-card__box::before {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    -226deg,
    rgba(225, 225, 225, 0) 40%,
    rgba(255, 254, 182, 0.3) 40%,
    rgba(225, 225, 225, 0) 60%
  );
  transform: translateY(-100%);
  content: "";
  pointer-events: none;
}

.legacy-card__box::after {
  position: absolute;
  inset: 0 0 auto;
  height: 120%;
  background: linear-gradient(
    226deg,
    rgba(225, 225, 225, 0) 40%,
    rgba(232, 232, 232, 0.3) 50%,
    rgba(225, 225, 225, 0) 60%
  );
  transform: translateY(-100%);
  transition: transform 0.85s cubic-bezier(0.165, 0.84, 0.44, 1);
  content: "";
  pointer-events: none;
}

.legacy-card__box:hover {
  transform: rotateX(7deg) translateY(calc(-6px * var(--legacy-scale)));
  box-shadow: 0 calc(10px * var(--legacy-scale)) calc(10px * var(--legacy-scale)) rgba(120, 120, 120, 0.126);
  transition: 0.45s ease-in-out;
}

.legacy-card__box:hover::after {
  transform: translateY(100%);
}

.legacy-card__save {
  position: absolute;
  top: calc(-8px * var(--legacy-scale));
  left: calc(-32px * var(--legacy-scale));
  z-index: 2;
  display: flex;
  width: calc(94px * var(--legacy-scale));
  height: calc(44px * var(--legacy-scale));
  align-items: flex-end;
  justify-content: center;
  border: 0;
  padding: 0;
  font-size: calc(18px * var(--legacy-scale));
  transform: rotateZ(-40deg);
  transition: 0.3s;
}

.legacy-card__save--yes {
  background-color: red;
  color: #fff;
}

.legacy-card__save--no {
  background-color: #fff;
  color: rgb(195, 195, 195);
}

.legacy-card__verse {
  position: absolute;
  top: 30%;
  left: 50%;
  z-index: 1;
  width: 90%;
  height: calc(196px * var(--legacy-scale));
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

.legacy-card__author {
  position: absolute;
  top: 30%;
  left: 28%;
  z-index: 1;
  margin: 0;
  color: var(--ink);
  font-family: "LanZeExcerptAuthor", "Songti SC", serif;
  font-size: calc(22px * var(--legacy-scale));
  font-weight: 400;
  letter-spacing: calc(1px * var(--legacy-scale));
  writing-mode: vertical-rl;
}

.legacy-card__art {
  position: absolute;
  bottom: 5%;
  left: 10%;
  display: block;
  width: 80%;
  height: auto;
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
}
</style>
