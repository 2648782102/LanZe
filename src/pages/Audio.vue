<template>
  <div class="mainPage" ref="playerRef" aria-label="兰泽诗词音乐播放器"></div>
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
