<template>
  <nav class="mobile-dock" aria-label="移动端导航">
    <router-link
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      :class="{ 'is-active': isActive(item) }"
    >
      <AppIcon :name="item.icon" :size="19" />
      <span>{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { useRoute } from "vue-router";
import AppIcon from "./AppIcon.vue";

const route = useRoute();
const items = [
  { to: "/", label: "今日", icon: "feather" },
  { to: "/explore", label: "寻诗", icon: "search" },
  { to: "/compose", label: "写诗", icon: "pen" },
  { to: "/collection", label: "诗卷", icon: "bookmark" },
];

const isActive = (item) => {
  if (item.to === "/") return route.name === "read";
  if (item.to === "/explore") return ["explore", "poem"].includes(route.name);
  return route.path.startsWith(item.to);
};
</script>

<style scoped>
.mobile-dock {
  position: fixed;
  right: max(12px, env(safe-area-inset-right));
  bottom: max(12px, env(safe-area-inset-bottom));
  left: max(12px, env(safe-area-inset-left));
  z-index: 80;
  display: none;
  width: auto;
  max-width: calc(100vw - 24px - env(safe-area-inset-left) - env(safe-area-inset-right));
  padding: 4px 6px 6px;
  border: 1px solid rgba(168, 196, 184, 0.3);
  border-radius: 0;
  background: rgba(16, 40, 39, 0.94);
  box-shadow: 0 12px 32px rgba(16, 40, 39, 0.18);
  transition: background-color var(--motion-fast) var(--ease-standard);
}

.mobile-dock a {
  display: grid;
  justify-items: center;
  gap: 3px;
  min-height: 46px;
  padding: 7px 4px;
  border-radius: 0;
  color: rgba(251, 252, 249, 0.5);
  font-size: var(--text-meta);
  line-height: 1.2;
}

.mobile-dock a:focus-visible {
  outline-color: var(--brass-soft);
  outline-offset: -3px;
}

.mobile-dock a.is-active {
  background: rgba(168, 196, 184, 0.12);
  color: var(--porcelain-panel);
}

@media (max-width: 820px) {
  .mobile-dock {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
