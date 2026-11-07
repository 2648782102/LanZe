<template>
  <article class="excerpt-card" aria-label="今日摘录卡片">
    <div class="excerpt-card__head">
      <span class="excerpt-card__index" aria-hidden="true">{{ indexLabel }}</span>
      <button
        class="excerpt-card__save"
        type="button"
        :class="{ 'is-saved': saved }"
        :aria-pressed="saved"
        :aria-label="saved ? `取消收藏第${indexLabel}张摘录` : `收藏第${indexLabel}张摘录`"
        @click="emit('toggle-save')"
      >
        <AppIcon :name="saved ? 'check' : 'bookmark'" :size="14" />
        <span>{{ saved ? "已藏" : "收藏" }}</span>
      </button>
    </div>

    <div class="excerpt-card__body">
      <span class="excerpt-card__category">{{ excerpt.category }}</span>
      <p class="excerpt-card__verse">{{ excerpt.content }}</p>
      <p class="excerpt-card__attribution">— {{ excerpt.author }}</p>
    </div>

    <div class="excerpt-card__foot">
      <span class="excerpt-card__origin">{{ excerpt.origin }}</span>
      <router-link
        class="excerpt-card__detail"
        :to="{ name: 'poem', params: { id: 'legacy' }, query: { shici: detailQuery } }"
        :aria-label="`展开《${excerpt.origin}》摘录笺注`"
      >
        展开
        <AppIcon name="arrow-right" :size="14" />
      </router-link>
    </div>

    <span class="excerpt-card__edge" aria-hidden="true" />
  </article>
</template>

<script setup>
import { computed } from "vue";
import AppIcon from "./AppIcon.vue";

const props = defineProps({
  excerpt: { type: Object, required: true },
  index: { type: Number, required: true },
  saved: { type: Boolean, default: false },
});
const emit = defineEmits(["toggle-save"]);

const numerals = ["壹", "贰", "叁"];
const indexLabel = computed(() => numerals[props.index] || String(props.index + 1));
const detailQuery = computed(() => JSON.stringify({
  title: props.excerpt.origin,
  author: props.excerpt.author,
  tags: [props.excerpt.category, "摘录"],
  paragraphs: [props.excerpt.content],
  titleNote: ["本页只展示一句摘录，不替代完整底本。"],
}));
</script>

<style scoped>
.excerpt-card {
  position: relative;
  display: grid;
  min-width: 0;
  min-height: 310px;
  grid-template-rows: auto 1fr auto;
  padding: 20px 20px 16px;
  border: 1px solid var(--line-strong);
  background: rgba(251, 252, 249, 0.78);
  overflow: hidden;
}

.excerpt-card::before {
  position: absolute;
  inset: 7px;
  border: 1px solid rgba(81, 122, 112, 0.12);
  content: "";
  pointer-events: none;
}

.excerpt-card__edge {
  position: absolute;
  top: 7px;
  right: 7px;
  bottom: 7px;
  width: 10px;
  background: linear-gradient(90deg, transparent, rgba(81, 122, 112, 0.07));
  pointer-events: none;
}

.excerpt-card__head,
.excerpt-card__foot {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.excerpt-card__head {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--line);
}

.excerpt-card__index {
  color: var(--brass);
  font-family: var(--font-poem);
  font-size: 14px;
  letter-spacing: 0.2em;
}

.excerpt-card__save {
  display: inline-flex;
  min-height: 30px;
  align-items: center;
  gap: 6px;
  padding: 4px 9px;
  border: 1px solid var(--line-strong);
  background: transparent;
  color: var(--ink-soft);
  font-size: 10px;
  letter-spacing: 0.08em;
  transition: border-color 160ms ease, background 160ms ease, color 160ms ease;
}

.excerpt-card__save:hover,
.excerpt-card__save.is-saved {
  border-color: var(--celadon-deep);
  background: rgba(168, 196, 184, 0.16);
  color: var(--ink);
}

.excerpt-card__body {
  position: relative;
  z-index: 1;
  display: grid;
  align-content: center;
  min-width: 0;
  padding: 22px 16px 18px;
  text-align: center;
}

.excerpt-card__category {
  color: var(--ink-faint);
  font-size: 9px;
  letter-spacing: 0.22em;
}

.excerpt-card__verse {
  margin: 16px 0 14px;
  color: var(--ink);
  font-family: var(--font-poem);
  font-size: clamp(18px, 1.5vw, 23px);
  letter-spacing: 0.1em;
  line-height: 1.8;
  overflow-wrap: anywhere;
}

.excerpt-card__attribution {
  margin: 0;
  color: var(--ink-soft);
  font-family: var(--font-poem);
  font-size: 12px;
  letter-spacing: 0.12em;
}

.excerpt-card__foot {
  padding-top: 14px;
  border-top: 1px solid var(--line);
}

.excerpt-card__origin {
  min-width: 0;
  overflow: hidden;
  color: var(--ink-faint);
  font-size: 10px;
  letter-spacing: 0.1em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.excerpt-card__detail {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--celadon-deep);
  font-size: 10px;
  letter-spacing: 0.1em;
  white-space: nowrap;
}

.excerpt-card__detail:hover {
  color: var(--brass);
}

@media (max-width: 560px) {
  .excerpt-card {
    min-height: 268px;
    padding: 17px 17px 14px;
  }

  .excerpt-card__body {
    padding-inline: 10px;
  }

  .excerpt-card__verse {
    font-size: 19px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .excerpt-card__save {
    transition: none;
  }
}
</style>
