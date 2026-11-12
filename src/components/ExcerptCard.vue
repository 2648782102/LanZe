<template>
  <article
    class="legacy-card"
    :aria-label="props.disabled ? '今日摘录卡片' : '今日摘录卡片，点击可换一句'"
    :tabindex="props.disabled ? -1 : 0"
    :role="props.disabled ? undefined : 'button'"
    @click="turnExcerpt"
    @keydown.enter.prevent="turnExcerpt"
    @keydown.space.prevent="turnExcerpt"
  >
    <p class="legacy-card__hint" aria-hidden="true">点击换一句</p>
    <ExcerptCardFace
      variant="current"
      :excerpt="props.excerpt"
      :saved="props.saved"
      interactive
      @toggle-save="emit('toggle-save', props.excerpt)"
    />
  </article>
</template>

<script setup>
import ExcerptCardFace from "./ExcerptCardFace.vue";

const props = defineProps({
  excerpt: { type: Object, required: true },
  saved: { type: Boolean, default: false },
  nextExcerpt: { type: Object, default: null },
  nextSaved: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});
const emit = defineEmits(["toggle-save", "needs-next", "turn", "settled"]);

const turnExcerpt = () => {
  if (props.disabled) return;
  emit("needs-next");
  emit("turn", "right");
  emit("settled");
};

defineExpose({
  turn: turnExcerpt,
  isTurning: false,
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
  position: relative;
  width: min(100%, 330px);
  margin-inline: auto;
  padding-block: calc(16px * var(--legacy-scale, 1));
  cursor: pointer;
  user-select: none;
}

.legacy-card:focus-visible {
  outline: 2px solid var(--brass);
  outline-offset: 4px;
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

@media (max-width: 560px) {
  .legacy-card {
    --legacy-scale: 0.9090909;
    width: min(100%, 300px);
  }
}
</style>
