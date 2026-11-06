<template>
  <div class="mainPage" ref="playerRef" aria-label="兰泽诗词音乐播放器">
    <p v-if="audioConfig.invalidCustom" class="audioFallback" role="status">
      自定义音源配置无效，已回退到仓库内的本地演示音。
    </p>
  </div>
</template>

<script setup>
defineOptions({ name: "Audio" });

import "aplayer/dist/APlayer.min.css";
import APlayer from "aplayer";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { audioConfig } from "../config/audio.js";

const playerRef = ref();
let instance = null;

onMounted(() => {
  if (!playerRef.value || !audioConfig.tracks.length) return;
  instance = new APlayer({
    container: playerRef.value,
    fixed: true,
    autoplay: false,
    preload: "none",
    audio: audioConfig.tracks,
  });
});

onBeforeUnmount(() => {
  instance?.destroy?.();
  instance = null;
});
</script>

<style scoped>
.audioFallback {
  position: fixed;
  right: 1rem;
  bottom: 6.5rem;
  z-index: 2100;
  max-width: min(24rem, calc(100vw - 2rem));
  margin: 0;
  padding: 0.65rem 0.9rem;
  border: 1px solid var(--rule);
  border-radius: 0;
  background: var(--paper-light);
  color: var(--jade-deep);
  box-shadow: var(--shadow);
  font-size: 0.875rem;
  line-height: 1.5;
}
</style>
