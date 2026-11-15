<template>
  <div class="empty-state" :class="{ 'is-compact': compact }">
    <span class="empty-state__mark" aria-hidden="true">{{ mark }}</span>
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  mark: { type: String, default: "空" },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  compact: { type: Boolean, default: false },
});
</script>

<style scoped>
.empty-state {
  display: grid;
  justify-items: start;
  gap: 14px;
  padding: 60px 0;
  border-top: 1px solid var(--line);
  color: var(--ink-soft);
}

.empty-state__mark {
  display: grid;
  width: 46px;
  height: 46px;
  place-items: center;
  margin-bottom: 4px;
  border: 1px solid var(--line-strong);
  color: var(--brass-text);
  font-family: var(--font-poem);
  font-size: 21px;
  line-height: 1;
  transform: rotate(-2deg);
}

.empty-state h2 {
  margin: 0;
  color: var(--ink);
  font-family: var(--font-poem);
  font-size: 26px;
  font-weight: 400;
  letter-spacing: 0.02em;
}

.empty-state p {
  max-width: 460px;
  margin: 0;
  line-height: var(--leading-copy);
  text-wrap: pretty;
}

.empty-state :deep(.button) {
  margin-top: 6px;
}

@media (max-width: 820px) {
  .empty-state {
    gap: 12px;
    padding: 40px 0;
  }

  .empty-state__mark {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  .empty-state h2 {
    font-size: 22px;
  }

  .empty-state p {
    font-size: var(--text-note);
  }
}

.empty-state.is-compact {
  padding: 32px 0;
}
</style>
