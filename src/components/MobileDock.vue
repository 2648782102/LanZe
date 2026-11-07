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
  bottom: 12px;
  left: max(12px, env(safe-area-inset-left));
  z-index: 80;
  display: none;
  width: auto;
  max-width: calc(100vw - 24px - env(safe-area-inset-left) - env(safe-area-inset-right));
  padding: 6px;
  border: 1px solid rgba(168, 196, 184, 0.3);
  border-radius: 0;
  background: rgba(16, 40, 39, 0.96);
  box-shadow: 0 18px 44px rgba(16, 40, 39, 0.24);
  backdrop-filter: blur(16px);
}

.mobile-dock a {
  display: grid;
  justify-items: center;
  gap: 3px;
  padding: 7px 4px;
  color: rgba(251, 252, 249, 0.5);
  font-size: 10px;
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
