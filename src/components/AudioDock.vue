<template>
  <aside
    class="audio-dock"
    :class="{
      'is-collapsed': isCollapsed,
      'is-expanded': !isCollapsed,
      'is-error': hasError,
      'is-playing': isPlaying,
      'is-changing': trackChanged,
    }"
    aria-label="兰泽曲目播放器"
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

    <button
      class="audio-dock__handle"
      type="button"
      :aria-label="isCollapsed ? '展开播放器' : '收起播放器'"
      :aria-expanded="!isCollapsed"
      @click="toggleCollapsed"
    >
      <span class="audio-dock__handle-label" aria-hidden="true">{{ isCollapsed ? "展开曲目" : "收起" }}</span>
      <AppIcon :name="isCollapsed ? 'chevron-left' : 'chevron-right'" :size="16" />
    </button>

    <div class="audio-dock__body">
      <div class="audio-dock__top">
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
          </div>

          <div class="audio-dock__right">
            <span class="audio-dock__time" aria-live="off">{{ currentTimeLabel }} / {{ durationLabel }}</span>
            <span class="audio-dock__state" role="status" aria-live="polite">{{ stateLabel }}</span>
          </div>

          <div class="audio-dock__compact">
            <span class="audio-dock__compact-title">{{ track.name }}</span>
            <span class="audio-dock__compact-state" role="status" aria-live="polite">{{ stateLabel }}</span>
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
        <p>挑一支曲子，让读诗的时间慢下来。</p>
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
  name: "暂无曲目",
  artist: "兰泽",
  url: "",
});
let viewportQuery;
let trackChangeTimer;

const stateLabel = computed(() => {
  if (hasError.value) return "暂时无法播放";
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
    notify("暂时没有可播放的曲目，请稍后再试。", "warning");
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
    notify("曲目未能开始播放，请稍后再试。", "warning");
  }
};

const handleError = () => {
  isPlaying.value = false;
  currentTime.value = 0;
  hasError.value = true;
  notify("曲目暂时无法加载，请稍后再试。", "warning", 5200);
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
      notify("下一段曲目未能开始，请再点一次播放。", "warning");
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
    notify("音轨设置未能生效，已回到默认曲目。", "warning", 5200);
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
  --dock-brass: #d8bf8e;
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 70;
  display: block;
  width: 357px;
  height: 106px;
  overflow: hidden;
  border: 1px solid rgba(168, 196, 184, 0.24);
  border-radius: 0;
  background: #102827;
  color: #f7f8f4;
  box-shadow: none;
  transition: width var(--motion-base) var(--ease-standard), height var(--motion-base) var(--ease-standard);
}

.audio-dock::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 2;
  width: 3px;
  background: var(--dock-brass);
  content: "";
}

.audio-dock__handle {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 3px;
  z-index: 1;
  display: grid;
  width: 30px;
  place-items: center;
  padding: 0;
  border: 0;
  border-right: 1px solid rgba(168, 196, 184, 0.16);
  background: transparent;
  color: rgba(247, 248, 244, 0.68);
}

.audio-dock__handle:hover {
  color: #fff;
}

.audio-dock__handle-label {
  display: none;
}

.audio-dock__body {
  display: contents;
}

.audio-dock__top {
  display: contents;
}

.audio-dock__toggle {
  position: absolute;
  top: 9px;
  left: 50px;
  z-index: 1;
  display: grid;
  width: 36px;
  height: 38px;
  place-items: center;
  padding: 0;
  border: 1px solid rgba(168, 196, 184, 0.34);
  background: rgba(168, 196, 184, 0.04);
  color: #f7f8f4;
}

.audio-dock__toggle:hover,
.audio-dock.is-playing .audio-dock__toggle {
  border-color: var(--dock-brass);
  color: var(--dock-brass);
}

.audio-dock__stage {
  display: contents;
}

.audio-dock__meta {
  position: absolute;
  top: 9px;
  left: 94px;
  right: 98px;
  z-index: 1;
  display: grid;
  min-width: 0;
  grid-template-columns: 32px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
}

.audio-dock__cover {
  display: block;
  width: 32px;
  height: 32px;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.5);
  background: #f7f8f4;
}

.audio-dock__copy {
  display: grid;
  min-width: 0;
  gap: 0;
}

.audio-dock__copy p {
  overflow: hidden;
  margin: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.audio-dock__title {
  font-family: var(--font-poem);
  font-size: 14px;
  letter-spacing: 0.03em;
  line-height: 1.3;
}

.audio-dock__subtitle {
  color: rgba(247, 248, 244, 0.5);
  font-size: var(--text-note);
  line-height: 1.3;
}

.audio-dock.is-changing .audio-dock__title {
  animation: track-settle var(--motion-base) var(--ease-out);
}

.audio-dock.is-changing .audio-dock__cover {
  animation: cover-settle var(--motion-base) var(--ease-out);
}

@keyframes track-settle {
  from { opacity: 0.45; transform: translateY(2px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes cover-settle {
  from { transform: scale(0.94); }
  to { transform: scale(1); }
}

.audio-dock__right {
  position: absolute;
  top: 8px;
  right: 14px;
  z-index: 1;
  display: grid;
  justify-items: end;
  gap: 1px;
}

.audio-dock__time {
  color: rgba(247, 248, 244, 0.64);
  font-family: var(--font-number);
  font-size: var(--text-body);
  white-space: nowrap;
}

.audio-dock__state {
  color: rgba(247, 248, 244, 0.76);
  font-size: var(--text-note);
  letter-spacing: 0.08em;
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

.audio-dock__seek-wrap {
  position: absolute;
  top: 43px;
  left: 130px;
  right: 14px;
  z-index: 1;
  min-width: 0;
  padding: 0;
}

.audio-dock__seek,
.audio-dock__volume {
  width: 100%;
  height: 24px;
  margin: 0;
  padding: 0;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

.audio-dock__seek::-webkit-slider-runnable-track,
.audio-dock__volume::-webkit-slider-runnable-track {
  height: 2px;
  background: linear-gradient(90deg, var(--dock-brass) var(--seek, 0%), rgba(168, 196, 184, 0.24) var(--seek, 0%));
}

.audio-dock__volume::-webkit-slider-runnable-track {
  background: linear-gradient(90deg, var(--dock-brass) var(--volume, 0%), rgba(168, 196, 184, 0.24) var(--volume, 0%));
}

.audio-dock__seek::-webkit-slider-thumb,
.audio-dock__volume::-webkit-slider-thumb {
  width: 10px;
  height: 10px;
  margin-top: -4px;
  appearance: none;
  border: 0;
  border-radius: 50%;
  background: var(--dock-brass);
}

.audio-dock__seek::-moz-range-track,
.audio-dock__volume::-moz-range-track {
  height: 2px;
  background: rgba(168, 196, 184, 0.24);
}

.audio-dock__seek::-moz-range-progress,
.audio-dock__volume::-moz-range-progress {
  height: 2px;
  background: var(--dock-brass);
}

.audio-dock__seek::-moz-range-thumb,
.audio-dock__volume::-moz-range-thumb {
  width: 10px;
  height: 10px;
  border: 0;
  border-radius: 50%;
  background: var(--dock-brass);
}

.audio-dock :focus-visible {
  outline: 2px solid var(--dock-brass);
  outline-offset: 2px;
}

.audio-dock__controls {
  position: absolute;
  top: 62px;
  left: 50px;
  right: 14px;
  z-index: 1;
  display: flex;
  height: 40px;
  align-items: center;
  gap: 8px;
  padding: 0;
  border-top: 1px solid rgba(168, 196, 184, 0.18);
}

.audio-dock__index {
  flex: 0 0 44px;
  color: var(--dock-brass);
  font-family: var(--font-number);
  font-size: var(--text-body);
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.audio-dock__controls button {
  display: grid;
  flex: 0 0 34px;
  width: 34px;
  height: 38px;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: rgba(247, 248, 244, 0.68);
}

.audio-dock__controls button:hover,
.audio-dock__controls button[aria-expanded="true"],
.audio-dock__controls button[aria-pressed="true"] {
  color: var(--dock-brass);
}

.audio-dock__volume {
  flex: 1 1 44px;
  min-width: 44px;
  height: 24px;
}

.audio-dock.is-collapsed {
  width: 192px;
  height: 60px;
}

.audio-dock.is-collapsed .audio-dock__toggle {
  top: 13px;
  left: 40px;
  width: 34px;
  height: 34px;
}

.audio-dock.is-collapsed .audio-dock__stage {
  display: contents;
}

.audio-dock.is-collapsed .audio-dock__meta,
.audio-dock.is-collapsed .audio-dock__right,
.audio-dock.is-collapsed .audio-dock__seek-wrap,
.audio-dock.is-collapsed .audio-dock__controls,
.audio-dock.is-collapsed .audio-dock__playlist {
  display: none;
}

.audio-dock.is-collapsed .audio-dock__compact {
  position: absolute;
  top: 12px;
  left: 84px;
  right: 12px;
  z-index: 1;
  display: grid;
  gap: 2px;
}

.audio-dock.is-collapsed .audio-dock__compact-title {
  display: block;
  overflow: hidden;
  font-family: var(--font-poem);
  font-size: 14px;
  letter-spacing: 0.04em;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.audio-dock.is-collapsed .audio-dock__compact-state {
  display: block;
  color: rgba(247, 248, 244, 0.5);
  font-size: var(--text-note);
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
  bottom: calc(100% + 6px);
  left: 0;
  z-index: 2;
  display: grid;
  padding: 6px;
  border: 1px solid rgba(168, 196, 184, 0.3);
  border-left: 2px solid var(--dock-brass);
  background: #183a38;
  box-shadow: 0 12px 28px rgba(16, 40, 39, 0.2);
}

.audio-dock__playlist button {
  display: grid;
  min-height: 34px;
  grid-template-columns: 26px minmax(0, 1fr) auto;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  border: 0;
  border-bottom: 1px solid rgba(168, 196, 184, 0.12);
  background: transparent;
  color: rgba(247, 248, 244, 0.7);
  text-align: left;
}

.audio-dock__playlist button.is-active {
  background: rgba(168, 196, 184, 0.12);
  color: #fff;
}

.audio-dock__playlist button span {
  color: var(--dock-brass);
  font-family: var(--font-number);
  font-size: 10px;
}

.audio-dock__playlist button strong {
  overflow: hidden;
  font-size: var(--text-note);
  font-weight: 400;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.audio-dock__playlist button em {
  color: rgba(247, 248, 244, 0.42);
  font-size: var(--text-meta);
  font-style: normal;
}

.audio-dock__playlist > p {
  margin: 6px 6px 2px;
  color: rgba(247, 248, 244, 0.45);
  font-size: var(--text-meta);
  line-height: 1.5;
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
  transform: translateY(5px);
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
  }

  .audio-dock.is-expanded {
    width: min(360px, calc(100vw - 24px));
  }

  .audio-dock.is-collapsed {
    width: 192px;
  }

  .audio-dock__playlist {
    max-height: min(240px, 50dvh);
    overflow-y: auto;
  }
}

@media (max-width: 420px) {
  .audio-dock__index,
  .audio-dock__control--next {
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
