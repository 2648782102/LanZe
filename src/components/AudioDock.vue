<template>
  <aside class="audio-dock" aria-label="兰泽本地播放器">
    <audio
      ref="audioRef"
      :src="track.url"
      preload="none"
      @timeupdate="syncProgress"
      @loadedmetadata="syncProgress"
      @ended="isPlaying = false"
      @error="handleError"
      @pause="isPlaying = false"
      @play="isPlaying = true"
    />
    <button
      class="audio-dock__toggle"
      type="button"
      :aria-label="isPlaying ? '暂停本地演示音' : '播放本地演示音'"
      @click="toggle"
    >
      <AppIcon :name="isPlaying ? 'pause' : 'play'" :size="17" />
    </button>
    <div class="audio-dock__copy">
      <p class="audio-dock__title">{{ track.name }}</p>
      <p>{{ track.artist }}</p>
      <div class="audio-dock__track" aria-hidden="true">
        <span :style="{ width: `${progress}%` }" />
      </div>
    </div>
    <span class="audio-dock__state">{{ isPlaying ? "播放中" : "试听" }}</span>
  </aside>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import AppIcon from "./AppIcon.vue";
import { audioConfig } from "../config/audio.js";
import { notify } from "../composables/useNotices.js";

const audioRef = ref();
const isPlaying = ref(false);
const progress = ref(0);
const track = computed(() => audioConfig.tracks[0] || {
  name: "没有可用音轨",
  artist: "兰泽",
  url: "",
});

const syncProgress = () => {
  const audio = audioRef.value;
  if (!audio?.duration) {
    progress.value = 0;
    return;
  }
  progress.value = Math.min(100, (audio.currentTime / audio.duration) * 100);
};

const toggle = async () => {
  const audio = audioRef.value;
  if (!audio?.src) {
    notify("没有可用的本地音源", "warning");
    return;
  }
  if (audio.paused) {
    try {
      await audio.play();
    } catch {
      notify("浏览器没有开始播放本地演示音，请稍后再试", "warning");
    }
  } else {
    audio.pause();
  }
};

const handleError = () => {
  isPlaying.value = false;
  progress.value = 0;
  notify("音源无法加载。请检查自定义音轨地址，或改用仓库内的本地演示音。", "warning", 5200);
};

onMounted(() => {
  if (audioConfig.invalidCustom) {
    notify("自定义音源配置无效，已回退到仓库内的本地演示音。", "warning", 5200);
  }
});

onBeforeUnmount(() => {
  audioRef.value?.pause();
});
</script>

<style scoped>
.audio-dock {
  position: fixed;
  bottom: 18px;
  left: 18px;
  z-index: 70;
  display: grid;
  width: min(310px, calc(100vw - 36px));
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 11px;
  padding: 9px 12px 9px 9px;
  border: 1px solid rgba(168, 196, 184, 0.26);
  background: rgba(16, 40, 39, 0.94);
  color: var(--porcelain-panel);
  box-shadow: 0 14px 38px rgba(16, 40, 39, 0.2);
  backdrop-filter: blur(14px);
}

.audio-dock__toggle {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  padding: 0;
  border: 1px solid rgba(168, 196, 184, 0.34);
  border-radius: 50%;
  background: transparent;
  color: var(--porcelain-panel);
}

.audio-dock__copy {
  display: grid;
  min-width: 0;
  gap: 1px;
}

.audio-dock__copy p {
  margin: 0;
}

.audio-dock__title {
  overflow: hidden;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.audio-dock__copy > p:nth-child(2) {
  color: rgba(251, 252, 249, 0.48);
  font-size: 9px;
}

.audio-dock__track {
  width: 100%;
  height: 1px;
  margin-top: 4px;
  overflow: hidden;
  background: rgba(168, 196, 184, 0.24);
}

.audio-dock__track span {
  display: block;
  height: 100%;
  background: var(--brass-soft);
  transition: width 180ms linear;
}

.audio-dock__state {
  color: rgba(251, 252, 249, 0.5);
  font-size: 9px;
  letter-spacing: 0.1em;
}

audio {
  display: none;
}

@media (max-width: 820px) {
  .audio-dock {
    bottom: 88px;
    left: 16px;
    width: min(276px, calc(100vw - 32px));
  }
}

@media (max-width: 420px) {
  .audio-dock {
    left: 12px;
    width: min(238px, calc(100vw - 24px));
  }

  .audio-dock__state {
    display: none;
  }
}
</style>
