<template>
  <div class="app-frame" :class="{ 'is-bare': isBare }">
    <div class="porcelain-grid" aria-hidden="true" />
    <SiteHeader v-if="!isBare" />
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
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
  min-height: 100vh;
  background: var(--canvas);
  background: var(--porcelain);
}

.app-frame > main {
  position: relative;
  z-index: 1;
}

.page-enter-active,
.page-leave-active {
  transition: opacity 140ms ease;
}

.page-enter-from {
  opacity: 0;
}

.page-leave-to {
  opacity: 0;
}
</style>
