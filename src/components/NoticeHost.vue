<template>
  <div class="notice-host" aria-live="polite" aria-atomic="false">
    <transition-group name="notice">
      <div
        v-for="notice in notices"
        :key="notice.id"
        class="notice"
        :class="`notice--${notice.tone}`"
        role="status"
      >
        <span>{{ notice.message }}</span>
        <button type="button" aria-label="关闭提示" @click="dismissNotice(notice.id)">
          <AppIcon name="close" :size="15" />
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import AppIcon from "./AppIcon.vue";
import { useNotices } from "../composables/useNotices.js";

const { notices, dismissNotice } = useNotices();
</script>

<style scoped>
.notice-host {
  position: fixed;
  right: max(24px, env(safe-area-inset-right));
  bottom: 120px;
  z-index: 120;
  display: grid;
  gap: 8px;
  width: min(340px, calc(100vw - 48px - env(safe-area-inset-left) - env(safe-area-inset-right)));
  max-width: calc(100vw - 48px - env(safe-area-inset-left) - env(safe-area-inset-right));
  pointer-events: none;
}

.notice {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 13px 12px 15px;
  border-left: 2px solid var(--brass-soft);
  background: rgba(16, 40, 39, 0.96);
  color: var(--porcelain-panel);
  box-shadow: 0 18px 44px rgba(16, 40, 39, 0.22);
  font-size: var(--text-note);
  line-height: 1.55;
  pointer-events: auto;
}

.notice--success {
  border-left-color: var(--celadon);
}

.notice--warning,
.notice--error {
  border-left-color: var(--brass);
}

.notice button {
  display: grid;
  flex: 0 0 auto;
  width: 40px;
  height: 40px;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  opacity: 0.6;
}

.notice button:hover {
  opacity: 1;
}

.notice button:focus-visible {
  outline-color: var(--brass-soft);
  outline-offset: -3px;
}

.notice-enter-active,
.notice-leave-active {
  transition:
    opacity var(--motion-fast) var(--ease-standard),
    transform var(--motion-fast) var(--ease-out);
}

.notice-enter-from,
.notice-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (max-width: 820px) {
  .notice-host {
    right: max(16px, env(safe-area-inset-right));
    left: max(16px, env(safe-area-inset-left));
    bottom: calc(208px + env(safe-area-inset-bottom));
    width: auto;
    max-width: calc(100vw - 32px - env(safe-area-inset-left) - env(safe-area-inset-right));
  }
}
</style>
