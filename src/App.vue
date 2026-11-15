<template>
  <div class="app-frame" :class="{ 'is-bare': isBare }">
    <div class="porcelain-grid" aria-hidden="true" />
    <SiteHeader v-if="!isBare" />
    <div class="route-stage">
      <router-view v-slot="{ Component }">
        <transition :name="pageTransition" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
    <SiteFooter v-if="!isBare" />
    <MobileDock v-if="!isBare" />
    <AudioDock v-if="!isBare" />
    <NoticeHost />
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import SiteHeader from "./components/SiteHeader.vue";
import SiteFooter from "./components/SiteFooter.vue";
import MobileDock from "./components/MobileDock.vue";
import AudioDock from "./components/AudioDock.vue";
import NoticeHost from "./components/NoticeHost.vue";

const route = useRoute();
const isBare = computed(() => Boolean(route.meta.bare));

/*
 * 路由顺序即「层级顺序」：首页 → 索引 → 单篇 → 诗卷/写作。
 * 前进时内容轻轻从右侧推入，后退时从左侧推入，用户因此能感知自己在
 * 诗馆里往哪个方向走，而不是每次都是同一种淡入。
 */
const navOrder = ["read", "explore", "poem", "collection", "compose"];
const rankOf = (name) => {
  const index = navOrder.indexOf(String(name || ""));
  return index === -1 ? 0 : index;
};

const direction = ref("none");
let lastRank = rankOf(route.name);

watch(() => route.name, (name) => {
  const current = rankOf(name);
  if (current === lastRank) {
    direction.value = "none";
  } else {
    direction.value = current > lastRank ? "forward" : "back";
  }
  lastRank = current;
  // 过渡名必须在渲染前确定，否则会用到上一次的方向。
}, { flush: "sync" });

const pageTransition = computed(() => (direction.value === "none" ? "page" : `page-${direction.value}`));
</script>

<style>
.app-frame {
  position: relative;
  isolation: isolate;
  min-height: 100dvh;
  background: var(--canvas);
  background: var(--porcelain);
}

.app-frame:not(.is-bare) {
  padding-bottom: env(safe-area-inset-bottom);
}

.app-frame:not(.is-bare) .route-stage > main {
  padding-bottom: var(--fixed-layer-space);
}

.route-stage {
  position: relative;
  z-index: 1;
}

html.is-drawer-open .route-stage {
  z-index: 86;
}

.app-frame:not(.is-bare) .route-stage {
  min-height: calc(100dvh - var(--header-height));
}

.app-frame .route-stage > main {
  position: relative;
  z-index: 1;
}

.page-enter-active,
.page-leave-active {
  transition: opacity var(--motion-fast) var(--ease-standard);
}

.page-enter-from {
  opacity: 0;
}

.page-leave-to {
  opacity: 0;
}

/* 前后方向：位移很小（10px），够表达方向而不喧宾夺主。 */
.page-forward-enter-active {
  transition:
    opacity var(--motion-base) var(--ease-out),
    transform var(--motion-base) var(--ease-out);
}

.page-forward-leave-active {
  transition:
    opacity var(--motion-fast) var(--ease-exit),
    transform var(--motion-fast) var(--ease-exit);
}

.page-forward-enter-from {
  opacity: 0;
  transform: translate3d(10px, 0, 0);
}

.page-forward-leave-to {
  opacity: 0;
  transform: translate3d(-6px, 0, 0);
}

.page-back-enter-active {
  transition:
    opacity var(--motion-base) var(--ease-out),
    transform var(--motion-base) var(--ease-out);
}

.page-back-leave-active {
  transition:
    opacity var(--motion-fast) var(--ease-exit),
    transform var(--motion-fast) var(--ease-exit);
}

.page-back-enter-from {
  opacity: 0;
  transform: translate3d(-10px, 0, 0);
}

.page-back-leave-to {
  opacity: 0;
  transform: translate3d(6px, 0, 0);
}
</style>
