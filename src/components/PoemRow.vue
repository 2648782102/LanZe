<template>
  <article class="poem-row">
    <router-link class="poem-row__main" :to="{ name: 'poem', params: { id: poem.id } }">
      <span class="poem-row__number">{{ index }}</span>
      <div class="poem-row__title">
        <h3>{{ poem.title }}</h3>
        <p>{{ poem.dynasty || "未编年" }} · {{ poem.author }} · {{ poem.category }}</p>
      </div>
      <p class="poem-row__line">{{ firstLine }}</p>
      <AppIcon class="poem-row__arrow" name="arrow-right" :size="17" />
    </router-link>
    <button
      class="poem-row__save"
      type="button"
      :class="{ 'is-saved': saved }"
      :aria-label="saved ? `取消收藏${poem.title}` : `收藏${poem.title}`"
      :aria-pressed="saved"
      @click="$emit('toggle', poem)"
    >
      <AppIcon name="bookmark" :size="17" />
    </button>
  </article>
</template>

<script setup>
import { computed } from "vue";
import AppIcon from "./AppIcon.vue";

const props = defineProps({
  poem: { type: Object, required: true },
  saved: { type: Boolean, default: false },
  index: { type: String, default: "—" },
});

defineEmits(["toggle"]);

const firstLine = computed(() =>
  props.poem.paragraph || props.poem.paragraphs?.[0] || props.poem.content || "暂未收录正文",
);
</script>

<style scoped>
.poem-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 40px;
  align-items: center;
  min-height: 78px;
  min-width: 0;
  border-bottom: 1px solid var(--line);
}

.poem-row__main {
  display: grid;
  min-width: 0;
  grid-template-columns: 52px minmax(180px, 0.9fr) minmax(180px, 1.2fr) auto;
  align-items: center;
  gap: 20px;
  padding: 20px 0;
  transition: transform var(--motion-fast) var(--ease-out);
}

.poem-row__main:hover {
  transform: translateX(3px);
}

.poem-row__number {
  color: var(--brass);
  font-family: var(--font-number);
  font-size: 11px;
}

.poem-row__title {
  min-width: 0;
}

.poem-row__title h3 {
  overflow: hidden;
  margin: 0;
  font-family: var(--font-poem);
  font-size: 20px;
  font-weight: 400;
  letter-spacing: 0.05em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.poem-row__title p {
  overflow: hidden;
  margin: 4px 0 0;
  color: var(--ink-faint);
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.poem-row__line {
  overflow: hidden;
  min-width: 0;
  margin: 0;
  color: var(--ink-soft);
  font-family: var(--font-poem);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.poem-row__arrow {
  color: var(--ink-faint);
  transition:
    color var(--motion-fast) var(--ease-standard),
    transform var(--motion-fast) var(--ease-out);
}

.poem-row__main:hover .poem-row__arrow {
  color: var(--brass);
  transform: translateX(3px);
}

.poem-row__main:hover h3 {
  color: var(--brass);
}

.poem-row__save {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--ink-faint);
  transition:
    background-color var(--motion-fast) var(--ease-standard),
    color var(--motion-fast) var(--ease-standard),
    transform var(--motion-fast) var(--ease-out);
}

.poem-row__save:hover {
  background: rgba(81, 122, 112, 0.1);
  color: var(--brass);
}

.poem-row__save.is-saved {
  color: var(--brass);
}

.poem-row__save.is-saved :deep(svg) {
  fill: currentColor;
}

.poem-row__save:active {
  transform: scale(0.88);
}

@media (max-width: 700px) {
  .poem-row {
    min-height: 86px;
  }

  .poem-row__main {
    grid-template-columns: 26px minmax(0, 1fr) auto;
    gap: 8px 10px;
    padding: 17px 0;
  }

  .poem-row__title {
    grid-column: 2;
    overflow: hidden;
  }

  .poem-row__title h3 {
    font-size: 18px;
  }

  .poem-row__line {
    grid-column: 2 / 4;
    font-size: 12px;
  }

  .poem-row__arrow {
    grid-column: 3;
    grid-row: 1;
  }
}

@media (max-width: 380px) {
  .poem-row {
    grid-template-columns: minmax(0, 1fr) 36px;
  }

  .poem-row__main {
    grid-template-columns: 22px minmax(0, 1fr);
    column-gap: 8px;
  }

  .poem-row__arrow {
    display: none;
  }

  .poem-row__line {
    grid-column: 2;
  }

  .poem-row__save {
    width: 36px;
  }
}
</style>
