<template>
  <header class="museum-header">
    <div class="museum-header__inner">
      <router-link class="brand" to="/" aria-label="兰泽首页">
        <span class="brand__mark" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span class="brand__name">兰泽</span>
        <span class="brand__latin">LANZE</span>
      </router-link>

      <nav class="main-nav" aria-label="主导航">
        <router-link
          v-for="item in navigation"
          :key="item.name"
          :to="item.to"
          :class="{ 'is-active': isActive(item) }"
        >
          {{ item.label }}
        </router-link>
      </nav>

      <div class="header-tools">
        <router-link class="search-link" to="/explore" aria-label="搜索诗词">
          <AppIcon name="search" :size="18" />
        </router-link>
        <router-link class="account-link" :to="accountTarget" :aria-label="accountLabel">
          <span v-if="isLoggedIn">{{ initial }}</span>
          <AppIcon v-else name="user" :size="17" />
        </router-link>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import AppIcon from "./AppIcon.vue";
import { useSession } from "../composables/useSession.js";

const route = useRoute();
const { isLoggedIn, profile } = useSession();
const navigation = [
  { name: "read", label: "今日", to: "/" },
  { name: "explore", label: "寻诗", to: "/explore" },
  { name: "collection", label: "诗卷", to: "/collection" },
];
const initial = computed(() => (profile.value.user_name || "诗").slice(0, 1));
const accountTarget = computed(() => (isLoggedIn.value ? "/collection" : "/login"));
const accountLabel = computed(() => (isLoggedIn.value ? "打开我的诗卷" : "登录"));

const isActive = (item) => {
  if (item.name === "explore") return ["explore", "poem"].includes(route.name);
  if (item.name === "collection") return ["collection", "compose"].includes(route.name);
  return route.name === item.name;
};
</script>

<style scoped>
.museum-header {
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid var(--line);
  background: rgba(243, 245, 240, 0.97);
}

.museum-header__inner {
  display: grid;
  width: var(--shell);
  height: var(--header-height);
  margin-inline: auto;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 24px;
}

.brand {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-self: start;
  gap: 0;
}

.brand__mark {
  display: flex;
  width: 42px;
  height: 36px;
  align-items: flex-end;
  justify-content: center;
  gap: 5px;
  margin-right: 18px;
  border-bottom: 1px solid var(--brass);
}

.brand__mark i {
  display: block;
  width: 2px;
  height: 16px;
  background: var(--brass);
}

.brand__mark i:nth-child(2) {
  height: 28px;
}

.brand__mark i:nth-child(3) {
  height: 21px;
}

.brand__name {
  font-family: var(--font-poem);
  font-size: 26px;
  letter-spacing: 0.16em;
  line-height: 1;
}

.brand__latin {
  margin-left: 22px;
  align-self: center;
  padding-top: 10px;
  color: var(--ink-faint);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.18em;
  line-height: 1;
}

.main-nav {
  display: flex;
  align-items: center;
  gap: 36px;
}

.main-nav a {
  position: relative;
  padding: 27px 0;
  color: var(--ink-soft);
  font-size: 13px;
  letter-spacing: 0.14em;
}

.main-nav a::after {
  position: absolute;
  right: 50%;
  bottom: 19px;
  left: 50%;
  height: 1px;
  background: var(--brass);
  content: "";
  transition:
    left var(--motion-fast) var(--ease-standard),
    right var(--motion-fast) var(--ease-standard);
}

.main-nav a:hover,
.main-nav a.is-active {
  color: var(--ink);
}

.main-nav a.is-active::after,
.main-nav a:hover::after {
  right: 0;
  left: 0;
}

.header-tools {
  display: flex;
  align-items: center;
  justify-self: end;
  gap: 8px;
}

.search-link,
.account-link {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border: 1px solid transparent;
  color: var(--ink-soft);
}

.search-link:hover,
.account-link:hover {
  border-color: var(--line-strong);
  color: var(--ink);
}

.account-link {
  border-color: var(--line);
  border-radius: 50%;
  font-family: var(--font-poem);
  font-size: 14px;
}

@media (max-width: 820px) {
  .museum-header__inner {
    grid-template-columns: 1fr auto;
  }

  .main-nav {
    display: none;
  }

  .brand__latin {
    display: none;
  }
}
</style>
