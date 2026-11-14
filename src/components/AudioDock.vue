<template>
  <aside
    class="audio-dock"
    :class="{
      'is-collapsed': isCollapsed,
      'is-error': hasError,
      'is-playing': isPlaying,
      'is-changing': trackChanged,
      'is-expanded': !isCollapsed,
    }"
    aria-label="兰泽本地声景播放器"
  >
    <audio
      ref="audioRef"
      :src="track.url"
      preload="none"
      @timeupdate="syncProgress"
      @loadedmetadata="handleReady"
      @canplay="handleReady"
      @ended="handleEnded"
      @error="handleError"
      @pause="isPlaying = false"
      @play="isPlaying = true"
      @volumechange="syncVolume"
    />

    <div class="audio-dock__bar">
      <button
        class="audio-dock__handle"
        type="button"
        :aria-label="isCollapsed ? '展开播放器' : '收起播放器'"
        :aria-expanded="!isCollapsed"
        @click="toggleCollapsed"
      >
        <span class="audio-dock__handle-label" aria-hidden="true">{{ isCollapsed ? "展开声景" : "收束" }}</span>
        <AppIcon :name="isCollapsed ? 'chevron-right' : 'chevron-left'" :size="13" />
      </button>

      <button
        class="audio-dock__toggle"
        type="button"
        :aria-label="isPlaying ? '暂停声景' : hasError ? '重试声景' : '播放声景'"
        @click="togglePlayback"
      >
        <AppIcon :name="isPlaying ? 'pause' : 'play'" :size="17" />
      </button>

      <div class="audio-dock__stage">
        <div class="audio-dock__meta">
          <img
            class="audio-dock__cover"
            :src="track.cover || './media/lanze-qingshan-cover.svg'"
            alt=""
            width="38"
            height="38"
          />
          <div class="audio-dock__copy">
            <p class="audio-dock__title">{{ track.name }}</p>
            <p class="audio-dock__subtitle">{{ track.mood || track.artist }}</p>
          </div>
          <span class="audio-dock__time" aria-live="off">{{ currentTimeLabel }} / {{ durationLabel }}</span>
        </div>
        <div class="audio-dock__seek-wrap">
          <input
            class="audio-dock__seek"
            type="range"
            min="0"
            :max="Math.max(1, duration)"
            step="0.1"
            :value="currentTime"
            :style="{ '--seek': `${progress}%` }"
            aria-label="播放进度"
            :aria-valuetext="`${currentTimeLabel} / ${durationLabel}`"
            :disabled="hasError || !duration"
            @input="seek"
          />
        </div>
      </div>

      <span class="audio-dock__state" role="status" aria-live="polite">{{ stateLabel }}</span>
      <div class="audio-dock__compact">
        <span class="audio-dock__compact-title">{{ track.name }}</span>
        <span class="audio-dock__compact-state" role="status" aria-live="polite">{{ stateLabel }}</span>
      </div>
    </div>

    <div class="audio-dock__controls">
      <span class="audio-dock__index" aria-hidden="true">{{ String(trackIndex + 1).padStart(2, "0") }} / {{ String(tracks.length).padStart(2, "0") }}</span>
      <button class="audio-dock__control--previous" type="button" aria-label="上一首声景" @click="selectTrack(trackIndex - 1)">
        <AppIcon name="skip-previous" :size="15" />
      </button>
      <button class="audio-dock__control--next" type="button" aria-label="下一首声景" @click="selectTrack(trackIndex + 1)">
        <AppIcon name="skip-next" :size="15" />
      </button>
      <button
        type="button"
        :aria-label="isMuted ? '取消静音' : '静音'"
        :aria-pressed="isMuted"
        @click="toggleMute"
      >
        <AppIcon :name="isMuted ? 'mute' : 'volume'" :size="15" />
      </button>
      <input
        class="audio-dock__volume"
        type="range"
        min="0"
        max="1"
        step="0.01"
        :value="isMuted ? 0 : volume"
        :style="{ '--volume': `${isMuted ? 0 : volume * 100}%` }"
        aria-label="音量"
        @input="setVolume"
      />
      <button
        type="button"
        class="audio-dock__playlist-toggle"
        aria-label="查看播放列表"
        :aria-expanded="playlistOpen"
        aria-controls="audio-playlist"
        @click="playlistOpen = !playlistOpen"
      >
        <AppIcon name="list" :size="15" />
      </button>
    </div>

    <transition name="playlist">
      <div v-if="playlistOpen && !isCollapsed" id="audio-playlist" class="audio-dock__playlist" role="list">
        <button
          v-for="(item, index) in tracks"
          :key="item.id || item.url"
          type="button"
          :class="{ 'is-active': index === trackIndex }"
          :aria-current="index === trackIndex ? 'true' : undefined"
          @click="selectTrack(index)"
        >
          <span>{{ String(index + 1).padStart(2, "0") }}</span>
          <strong>{{ item.name }}</strong>
          <em>{{ item.mood || item.artist }}</em>
        </button>
        <p>声景由仓库脚本合成，全部随构建产物本地分发；自定义音源仅在你显式配置后启用。</p>
      </div>
    </transition>
  </aside>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import AppIcon from "./AppIcon.vue";
import { audioConfig } from "../config/audio.js";
import { readStore, writeStore } from "../services/browserStore.js";
import { notify } from "../composables/useNotices.js";

const AUDIO_PREFERENCES_KEY = "lanze_audio_preferences";
const audioRef = ref();
const isPlaying = ref(false);
const isCollapsed = ref(true);
const hasError = ref(false);
const compactViewport = ref(false);
const playlistOpen = ref(false);
const trackChanged = ref(false);
const isMuted = ref(false);
const currentTime = ref(0);
const duration = ref(audioConfig.tracks[0]?.duration || 0);
const volume = ref(0.72);
const tracks = computed(() => audioConfig.tracks);
const trackIndex = ref(0);
const track = computed(() => tracks.value[trackIndex.value] || {
  name: "没有可用声景",
  artist: "兰泽",
  url: "",
});
let viewportQuery;
let trackChangeTimer;

const stateLabel = computed(() => {
  if (hasError.value) return "声景不可达";
  return isPlaying.value ? "播放中" : "试听";
});
const progress = computed(() => duration.value ? Math.min(100, currentTime.value / duration.value * 100) : 0);
const formatTime = (value) => {
  const seconds = Math.max(0, Math.floor(Number(value) || 0));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};
const currentTimeLabel = computed(() => formatTime(currentTime.value));
const durationLabel = computed(() => formatTime(duration.value));

const syncPreferences = () => writeStore(AUDIO_PREFERENCES_KEY, {
  trackIndex: trackIndex.value,
  volume: volume.value,
  muted: isMuted.value,
});

const applyAudioSettings = () => {
  const audio = audioRef.value;
  if (!audio) return;
  audio.volume = volume.value;
  audio.muted = isMuted.value;
};

const syncProgress = () => {
  const audio = audioRef.value;
  if (!audio) return;
  currentTime.value = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
  if (Number.isFinite(audio.duration) && audio.duration > 0) duration.value = audio.duration;
};

const handleReady = () => {
  hasError.value = false;
  syncProgress();
  applyAudioSettings();
};

const syncVolume = () => {
  const audio = audioRef.value;
  if (!audio || audio.muted) return;
  volume.value = audio.volume;
};

const togglePlayback = async () => {
  const audio = audioRef.value;
  if (!audio?.src) {
    notify("没有可用声景，请检查配置或改用仓库内的本地声景。", "warning");
    return;
  }
  if (!audio.paused) {
    audio.pause();
    return;
  }
  const retry = hasError.value;
  hasError.value = false;
  try {
    if (retry) audio.load();
    await audio.play();
  } catch {
    hasError.value = true;
    notify("浏览器没有开始播放声景，请检查地址、格式或稍后重试。", "warning");
  }
};

const handleError = () => {
  isPlaying.value = false;
  currentTime.value = 0;
  hasError.value = true;
  notify("声景无法加载。请检查自定义音轨地址，或改用仓库内的本地声景。", "warning", 5200);
};

const handleEnded = () => {
  isPlaying.value = false;
  if (tracks.value.length > 1) selectTrack(trackIndex.value + 1, { autoplay: true });
};

const seek = (event) => {
  const audio = audioRef.value;
  const nextTime = Number(event.target.value);
  if (!audio || !Number.isFinite(nextTime) || !duration.value) return;
  audio.currentTime = Math.min(duration.value, Math.max(0, nextTime));
  currentTime.value = audio.currentTime;
};

const setVolume = (event) => {
  const audio = audioRef.value;
  const nextVolume = Number(event.target.value);
  if (!audio || !Number.isFinite(nextVolume)) return;
  volume.value = Math.min(1, Math.max(0, nextVolume));
  isMuted.value = volume.value === 0;
  applyAudioSettings();
  syncPreferences();
};

const toggleMute = () => {
  isMuted.value = !isMuted.value;
  applyAudioSettings();
  syncPreferences();
};

const selectTrack = async (index, { autoplay = false } = {}) => {
  if (!tracks.value.length) return;
  const count = tracks.value.length;
  const nextIndex = ((index % count) + count) % count;
  const audio = audioRef.value;
  const shouldResume = autoplay || Boolean(audio && !audio.paused);
  if (nextIndex === trackIndex.value && !autoplay) {
    playlistOpen.value = false;
    return;
  }
  trackIndex.value = nextIndex;
  currentTime.value = 0;
  duration.value = track.value.duration || 0;
  hasError.value = false;
  playlistOpen.value = false;
  trackChanged.value = false;
  syncPreferences();
  await nextTick();
  trackChanged.value = true;
  window.clearTimeout(trackChangeTimer);
  trackChangeTimer = window.setTimeout(() => {
    trackChanged.value = false;
  }, 320);
  const current = audioRef.value;
  if (!current) return;
  current.load();
  applyAudioSettings();
  if (shouldResume) {
    try {
      await current.play();
    } catch {
      hasError.value = true;
      notify("浏览器没有开始播放下一段声景，请再次点击播放。", "warning");
    }
  }
};

const syncViewportPreference = (event) => {
  if (event.matches === compactViewport.value) return;
  compactViewport.value = event.matches;
  if (event.matches) {
    isCollapsed.value = true;
    playlistOpen.value = false;
    audioRef.value?.pause();
    isPlaying.value = false;
  }
};

const toggleCollapsed = () => {
  isCollapsed.value = !isCollapsed.value;
  if (isCollapsed.value) playlistOpen.value = false;
};

onMounted(() => {
  if (audioConfig.invalidCustom) {
    notify("自定义音源配置无效，已回退到仓库内的本地声景。", "warning", 5200);
  }
  const preferences = readStore(AUDIO_PREFERENCES_KEY, {});
  const savedIndex = Number(preferences?.trackIndex);
  if (Number.isInteger(savedIndex) && savedIndex >= 0 && savedIndex < tracks.value.length) {
    trackIndex.value = savedIndex;
    duration.value = track.value.duration || 0;
  }
  const savedVolume = Number(preferences?.volume);
  if (Number.isFinite(savedVolume) && savedVolume >= 0 && savedVolume <= 1) volume.value = savedVolume;
  isMuted.value = Boolean(preferences?.muted);
  applyAudioSettings();
  const audio = audioRef.value;
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
  isPlaying.value = false;
  viewportQuery = window.matchMedia?.("(max-width: 820px)");
  if (!viewportQuery) return;
  compactViewport.value = viewportQuery.matches;
  isCollapsed.value = true;
  playlistOpen.value = false;
  viewportQuery.addEventListener("change", syncViewportPreference);
});

onBeforeUnmount(() => {
  audioRef.value?.pause();
  window.clearTimeout(trackChangeTimer);
  viewportQuery?.removeEventListener("change", syncViewportPreference);
});
</script>

<style scoped>
.audio-dock {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 70;
  display: flex;
  width: min(388px, calc(100vw - 36px));
  flex-direction: column;
  gap: 0;
  padding: 0;
  border: 1px solid rgba(168, 196, 184, 0.34);
  border-left: 2px solid var(--brass-soft);
  background: var(--night);
  color: var(--porcelain-panel);
  transition:
    width var(--motion-base) var(--ease-standard),
    background-color var(--motion-fast) var(--ease-standard),
    border-color var(--motion-fast) var(--ease-standard);
}

.audio-dock.is-collapsed {
  width: 176px;
}

.audio-dock__bar {
  display: grid;
  min-height: 50px;
  grid-template-columns: 28px 40px minmax(0, 1fr) auto;
  align-items: center;
  gap: 0 9px;
  padding: 3px 10px 3px 5px;
}

.audio-dock__handle {
  display: grid;
  width: 28px;
  height: 40px;
  place-items: center;
  padding: 0;
  border: 0;
  border-right: 1px solid rgba(168, 196, 184, 0.16);
  background: transparent;
  color: rgba(251, 252, 249, 0.62);
}

.audio-dock__handle:hover {
  color: var(--porcelain-panel);
}

.audio-dock__handle-label {
  display: none;
}

.audio-dock__toggle {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  padding: 0;
  border: 1px solid rgba(168, 196, 184, 0.36);
  background: rgba(168, 196, 184, 0.06);
  color: var(--porcelain-panel);
}

.audio-dock__toggle:hover,
.audio-dock.is-playing .audio-dock__toggle {
  border-color: var(--brass-soft);
  color: var(--brass-soft);
}

.audio-dock__stage {
  display: grid;
  min-width: 0;
  gap: 0;
}

.audio-dock__meta {
  display: grid;
  min-width: 0;
  grid-template-columns: 32px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
}

.audio-dock__index {
  padding-left: 2px;
  color: var(--brass-soft);
  font-family: var(--font-number);
  font-size: var(--text-meta);
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.audio-dock__cover {
  display: block;
  width: 32px;
  height: 32px;
  object-fit: cover;
  border: 1px solid rgba(168, 196, 184, 0.2);
}

.audio-dock__copy {
  display: grid;
  min-width: 0;
  gap: 1px;
}

.audio-dock__copy p {
  overflow: hidden;
  margin: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.audio-dock__title {
  font-family: var(--font-poem);
  font-size: 12px;
  letter-spacing: 0.04em;
  line-height: 1.35;
  transition: color var(--motion-fast) var(--ease-standard);
}

.audio-dock.is-changing .audio-dock__title {
  animation: track-settle var(--motion-base) var(--ease-out);
}

.audio-dock.is-changing .audio-dock__cover {
  animation: cover-settle var(--motion-base) var(--ease-out);
}

@keyframes track-settle {
  from { opacity: 0.45; transform: translateY(3px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes cover-settle {
  from { transform: scale(0.94); }
  to { transform: scale(1); }
}

.audio-dock__subtitle {
  color: rgba(251, 252, 249, 0.48);
  font-size: var(--text-meta);
  line-height: 1.4;
}

.audio-dock__time {
  color: rgba(251, 252, 249, 0.5);
  font-family: var(--font-number);
  font-size: var(--text-meta);
  white-space: nowrap;
}

.audio-dock__seek-wrap {
  min-width: 0;
  padding-left: 40px;
}

.audio-dock__seek,
.audio-dock__volume {
  width: 100%;
  height: 24px;
  margin: 0;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

.audio-dock__seek::-webkit-slider-runnable-track,
.audio-dock__volume::-webkit-slider-runnable-track {
  height: 2px;
  background: linear-gradient(90deg, var(--brass-soft) var(--seek, 0%), rgba(168, 196, 184, 0.24) var(--seek, 0%));
}

.audio-dock__volume::-webkit-slider-runnable-track {
  background: linear-gradient(90deg, var(--brass-soft) var(--volume, 0%), rgba(168, 196, 184, 0.24) var(--volume, 0%));
}

.audio-dock__seek::-webkit-slider-thumb,
.audio-dock__volume::-webkit-slider-thumb {
  width: 9px;
  height: 9px;
  margin-top: -3.5px;
  appearance: none;
  border: 0;
  border-radius: 50%;
  background: var(--brass-soft);
}

.audio-dock__seek::-moz-range-track,
.audio-dock__volume::-moz-range-track {
  height: 2px;
  background: rgba(168, 196, 184, 0.24);
}

.audio-dock__seek::-moz-range-progress,
.audio-dock__volume::-moz-range-progress {
  height: 2px;
  background: var(--brass-soft);
}

.audio-dock__seek::-moz-range-thumb,
.audio-dock__volume::-moz-range-thumb {
  width: 9px;
  height: 9px;
  border: 0;
  border-radius: 50%;
  background: var(--brass-soft);
}

.audio-dock :focus-visible {
  outline: 2px solid var(--brass-soft);
  outline-offset: 2px;
}

.audio-dock__state {
  align-self: center;
  color: rgba(251, 252, 249, 0.5);
  font-size: var(--text-meta);
  letter-spacing: 0.06em;
  white-space: nowrap;
}

.audio-dock__compact {
  display: none;
  min-width: 0;
}

.audio-dock__compact-title,
.audio-dock__compact-state {
  display: none;
}

.audio-dock__controls {
  display: grid;
  min-height: 40px;
  grid-template-columns: 28px repeat(3, 36px) minmax(48px, 1fr) 36px;
  align-items: center;
  gap: 8px;
  margin: 0 10px 0 42px;
  padding: 2px 0 3px;
  border-top: 1px solid rgba(168, 196, 184, 0.18);
}

.audio-dock__controls button {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  padding: 0;
  border: 1px solid transparent;
  background: transparent;
  color: rgba(251, 252, 249, 0.55);
}

.audio-dock__controls button:hover,
.audio-dock__controls button[aria-expanded="true"],
.audio-dock__controls button[aria-pressed="true"] {
  border-color: rgba(216, 191, 142, 0.42);
  color: var(--brass-soft);
}

.audio-dock.is-collapsed .audio-dock__stage,
.audio-dock.is-collapsed .audio-dock__state,
.audio-dock.is-collapsed .audio-dock__controls,
.audio-dock.is-collapsed .audio-dock__playlist {
  display: none;
}

.audio-dock.is-collapsed .audio-dock__bar {
  min-height: 46px;
  grid-template-columns: 28px 38px minmax(0, 1fr);
  gap: 0 8px;
  padding: 4px 8px 4px 4px;
}

.audio-dock.is-collapsed .audio-dock__handle {
  height: 38px;
  border-right: 0;
}

.audio-dock.is-collapsed .audio-dock__toggle {
  width: 38px;
  height: 38px;
}

.audio-dock.is-collapsed .audio-dock__compact {
  display: grid;
  gap: 1px;
}

.audio-dock.is-collapsed .audio-dock__compact-title {
  display: block;
  overflow: hidden;
  color: var(--porcelain-panel);
  font-family: var(--font-poem);
  font-size: 12px;
  letter-spacing: 0.06em;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.audio-dock.is-collapsed .audio-dock__compact-state {
  display: block;
  color: rgba(251, 252, 249, 0.5);
  font-size: var(--text-meta);
  line-height: 1.3;
}

.audio-dock.is-error {
  border-color: rgba(214, 132, 115, 0.55);
}

.audio-dock.is-error .audio-dock__state {
  color: #e2aca0;
}

.audio-dock__playlist {
  position: absolute;
  right: 0;
  bottom: calc(100% + 8px);
  left: 0;
  z-index: 2;
  display: grid;
  padding: 8px;
  border: 1px solid rgba(168, 196, 184, 0.34);
  border-left: 2px solid var(--brass-soft);
  background: var(--night-raised);
  box-shadow: 0 18px 36px rgba(16, 40, 39, 0.18);
}

.audio-dock__playlist button {
  display: grid;
  min-height: 40px;
  grid-template-columns: 28px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  padding: 5px 8px;
  border: 0;
  border-bottom: 1px solid rgba(168, 196, 184, 0.12);
  background: transparent;
  color: rgba(251, 252, 249, 0.7);
  text-align: left;
}

.audio-dock__playlist button.is-active {
  background: rgba(168, 196, 184, 0.12);
  color: var(--porcelain-panel);
}

.audio-dock__playlist button span {
  color: var(--brass-soft);
  font-family: var(--font-number);
  font-size: var(--text-meta);
}

.audio-dock__playlist button strong {
  overflow: hidden;
  font-size: var(--text-note);
  font-weight: 400;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.audio-dock__playlist button em {
  color: rgba(251, 252, 249, 0.42);
  font-size: var(--text-meta);
  font-style: normal;
}

.audio-dock__playlist > p {
  margin: 8px 8px 2px;
  color: rgba(251, 252, 249, 0.45);
  font-size: var(--text-meta);
  line-height: 1.6;
}

.playlist-enter-active,
.playlist-leave-active {
  transition:
    opacity var(--motion-fast) var(--ease-standard),
    transform var(--motion-fast) var(--ease-out);
}

.playlist-enter-from,
.playlist-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

audio {
  display: none;
}

@media (max-width: 820px) {
  .audio-dock {
    right: max(12px, env(safe-area-inset-right));
    bottom: calc(84px + env(safe-area-inset-bottom));
    left: max(12px, env(safe-area-inset-left));
    width: auto;
    margin-left: auto;
    border-bottom: 0;
  }

  .audio-dock.is-collapsed {
    width: 176px;
  }

  .audio-dock__bar {
    grid-template-columns: 28px 38px minmax(0, 1fr) auto;
    gap: 0 8px;
    padding: 4px 9px 4px 4px;
  }

  .audio-dock__controls {
    grid-template-columns: repeat(3, 36px) minmax(48px, 1fr) 36px;
    margin-left: 38px;
  }

  .audio-dock.is-collapsed .audio-dock__handle,
  .audio-dock.is-collapsed .audio-dock__toggle {
    width: 28px;
    height: 36px;
  }

  .audio-dock__playlist {
    max-height: min(280px, 58dvh);
    overflow-y: auto;
  }
}

@media (max-width: 420px) {
  .audio-dock__bar {
    grid-template-columns: 28px 36px minmax(0, 1fr) auto;
    gap: 0 7px;
    padding-right: 7px;
  }

  .audio-dock__toggle {
    width: 36px;
    height: 36px;
  }

  .audio-dock__meta {
    grid-template-columns: 30px minmax(0, 1fr) auto;
  }

  .audio-dock__time {
    display: none;
  }

  .audio-dock__cover {
    width: 30px;
    height: 30px;
  }

  .audio-dock__seek-wrap {
    padding-left: 38px;
  }

  .audio-dock__controls {
    grid-template-columns: 28px repeat(3, 36px) 36px;
    justify-content: start;
    margin-left: 35px;
  }

  .audio-dock__control--next,
  .audio-dock__volume {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .audio-dock,
  .audio-dock__title,
  .audio-dock__cover,
  .playlist-enter-active,
  .playlist-leave-active {
    animation: none;
    transition: none;
  }

  .playlist-enter-from,
  .playlist-leave-to {
    opacity: 1;
    transform: none;
  }
}
</style>
