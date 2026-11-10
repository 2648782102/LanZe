<template>
  <div class="app-frame" :class="{ 'is-bare': isBare }">
    <div class="porcelain-grid" aria-hidden="true" />
    <SiteHeader v-if="!isBare" />
    <div class="route-stage">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
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
import { computed } from "vue";
import { useRoute } from "vue-router";
import SiteHeader from "./components/SiteHeader.vue";
import SiteFooter from "./components/SiteFooter.vue";
import MobileDock from "./components/MobileDock.vue";
import AudioDock from "./components/AudioDock.vue";
import NoticeHost from "./components/NoticeHost.vue";

const route = useRoute();
const isBare = computed(() => Boolean(route.meta.bare));
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

:where(.app-frame:not(.is-bare) .route-stage > main) {
  padding-bottom: var(--fixed-layer-space);
}

.route-stage {
  position: relative;
  z-index: 1;
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
</style>
