<template>
  <section class="search-room">
    <div class="shell">
      <form class="index-search" role="search" @submit.prevent="emit('submit')">
        <label class="sr-only" for="global-search">搜索诗词</label>
        <AppIcon name="search" :size="23" />
        <input
          id="global-search"
          v-model="draft"
          type="search"
          placeholder="输入诗名、作者、体裁、朝代或一句诗"
          autocomplete="off"
        />
        <button v-if="draft" class="index-search__clear" type="button" aria-label="清空搜索" @click="emit('clear')">
          <AppIcon name="close" :size="16" />
        </button>
        <button class="index-search__button" type="submit">翻检</button>
      </form>

      <div class="quick-terms">
        <span>常见入口</span>
        <button
          v-for="hint in hints"
          :key="hint"
          type="button"
          :aria-label="`搜索${hint}`"
          @click="emit('pick-hint', hint)"
        >{{ hint }}</button>
      </div>

      <div class="poem-paths" aria-label="主题诗路">
        <button
          v-for="path in paths"
          :key="path.label"
          type="button"
          :class="{ 'is-active': activePath(path) }"
          :aria-pressed="activePath(path)"
          @click="emit('enter-path', path)"
        >
          <span>{{ path.index }}</span>
          <strong>{{ path.label }}</strong>
          <em>{{ path.note }}</em>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";
import AppIcon from "./AppIcon.vue";

const props = defineProps({
  modelValue: { type: String, default: "" },
  hints: { type: Array, default: () => [] },
  paths: { type: Array, default: () => [] },
  activePath: { type: Function, required: true },
});

const emit = defineEmits(["update:modelValue", "submit", "clear", "pick-hint", "enter-path"]);

// 用可写 computed 让父级的 v-model 继续生效，组件内部不持有搜索状态。
const draft = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});
</script>

<style scoped>
.search-room {
  padding-block: 34px 38px;
  border-bottom: 1px solid var(--line);
  background: var(--porcelain-panel);
}

.index-search {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: 13px;
  padding: 5px 5px 5px 20px;
  border: 1px solid var(--line-strong);
  background: var(--porcelain);
  box-shadow: var(--shadow-tiny);
}

.index-search > :deep(svg) {
  color: var(--brass-text);
}

.index-search:focus-within {
  border-color: var(--celadon-deep);
  box-shadow: 0 0 0 3px rgba(81, 122, 112, 0.22);
}

.index-search:has(input:focus-visible) {
  outline: 2px solid var(--celadon-deep);
  outline-offset: 2px;
}

.index-search input {
  min-width: 0;
  height: 52px;
  border: 0;
  background: transparent;
  color: var(--ink);
  font-family: var(--font-poem);
  font-size: 17px;
  outline: none;
}

.index-search input::placeholder {
  color: var(--ink-faint);
  font-family: var(--font-ui);
  font-size: var(--text-body);
}

.index-search__clear {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--ink-faint);
}

.index-search__button {
  min-width: 92px;
  min-height: 50px;
  border: 0;
  background: var(--ink);
  color: var(--porcelain-panel);
  font-size: var(--text-body);
  letter-spacing: 0.12em;
}

.index-search__button:hover {
  background: var(--celadon-deep);
}

.quick-terms {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 13px;
  color: var(--ink-faint);
  font-size: var(--text-meta);
}

.quick-terms button {
  min-height: 42px;
  padding: 7px 12px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--ink-soft);
  font-size: var(--text-meta);
}

.quick-terms button:hover {
  border-color: var(--brass);
  color: var(--brass-text);
}

.poem-paths {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 24px;
}

.poem-paths button {
  display: grid;
  min-width: 0;
  min-height: 84px;
  grid-template-columns: 28px minmax(0, 1fr);
  align-items: center;
  column-gap: 12px;
  padding: 12px 16px;
  border: var(--card-border);
  background: var(--surface);
  box-shadow: var(--card-shadow);
  color: var(--ink-soft);
  text-align: left;
  transition:
    border-color var(--motion-fast) var(--ease-standard),
    background-color var(--motion-fast) var(--ease-standard),
    box-shadow var(--motion-base) var(--ease-standard),
    transform var(--motion-fast) var(--ease-out);
}

.poem-paths button:hover {
  border-color: var(--celadon-deep);
  transform: translateY(-1px);
  box-shadow: var(--card-shadow-raised);
}

.poem-paths button:active {
  transform: translateY(0);
}

.poem-paths button.is-active {
  border-color: var(--brass);
  background: rgba(216, 191, 142, 0.12);
}

.poem-paths span {
  grid-row: 1 / 3;
  color: var(--brass-text);
  font-family: var(--font-poem);
  font-size: 22px;
}

.poem-paths strong {
  color: var(--ink);
  font-family: var(--font-poem);
  font-size: 17px;
  font-weight: 400;
  letter-spacing: 0.06em;
}

.poem-paths em {
  overflow: hidden;
  color: var(--ink-faint);
  font-size: var(--text-meta);
  font-style: normal;
  line-height: 1.5;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
