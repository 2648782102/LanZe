<template>
  <svg
    class="app-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-if="name === 'search'">
      <circle cx="10.8" cy="10.8" r="6.4" />
      <path d="m16 16 4.1 4.1" />
    </template>
    <template v-else-if="name === 'bookmark'">
      <path d="M6.5 4.5h11v15l-5.5-3.8-5.5 3.8z" />
    </template>
    <template v-else-if="name === 'arrow-right'">
      <path d="M5 12h14M14 7l5 5-5 5" />
    </template>
    <template v-else-if="name === 'arrow-left'">
      <path d="M19 12H5M10 7l-5 5 5 5" />
    </template>
    <template v-else-if="name === 'play'">
      <path d="m9 6 9 6-9 6z" />
    </template>
    <template v-else-if="name === 'pause'">
      <path d="M9 6v12M15 6v12" />
    </template>
    <template v-else-if="name === 'pen'">
      <path d="m4 20 4.3-1 10.2-10.2a2.1 2.1 0 0 0-3-3L5.3 16zM14.5 7.5l3 3" />
    </template>
    <template v-else-if="name === 'user'">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 20c.7-4 2.8-6 6.5-6s5.8 2 6.5 6" />
    </template>
    <template v-else-if="name === 'check'">
      <path d="m5 12 4.2 4.2L19 6.5" />
    </template>
    <template v-else-if="name === 'close'">
      <path d="m6 6 12 12M18 6 6 18" />
    </template>
    <template v-else-if="name === 'chevron-right'">
      <path d="m9 5 7 7-7 7" />
    </template>
    <template v-else-if="name === 'chevron-left'">
      <path d="m15 5-7 7 7 7" />
    </template>
    <template v-else-if="name === 'copy'">
      <rect x="8" y="8" width="11" height="11" rx="1" />
      <path d="M16 8V5H5v11h3" />
    </template>
    <template v-else-if="name === 'volume'">
      <path d="M5 10v4h3l4 3V7l-4 3zM16 9.5a4 4 0 0 1 0 5M18.5 7a7 7 0 0 1 0 10" />
    </template>
    <template v-else-if="name === 'feather'">
      <path d="M20 4c-5.2.4-9.2 2.8-11.3 6.1L5 16.5l4.4-3.7C12.7 10.6 15.8 7.9 20 4Z" />
      <path d="M8.4 16.5 5 20" />
    </template>
  </svg>
</template>

<script setup>
defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 20 },
});
</script>

<style scoped>
.app-icon {
  display: block;
  flex: 0 0 auto;
}
</style>
