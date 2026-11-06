<template>
  <article aria-label="兰泽诗词应用">
    <router-view />
  </article>
</template>

<script>
export default { name: "App" };
</script>

<style>
@font-face {
  font-family: "LanZeSong";
  src: url("./assets/ZiTi/FangZhengSong.ttf") format("truetype");
  font-display: swap;
}

@font-face {
  font-family: "LanZeDisplay";
  src: url("./assets/ZiTi/piaoYiSong.ttf") format("truetype");
  font-display: swap;
}

:root {
  --paper: #ece8de;
  --paper-deep: #ded7c9;
  --paper-light: #f7f4ec;
  --ink: #26352f;
  --ink-soft: #5a655d;
  --jade: #2f5d50;
  --jade-deep: #1f4038;
  --seal: #9e3b2f;
  --rule: rgba(47, 93, 80, 0.22);
  --rule-strong: rgba(38, 53, 47, 0.42);
  --shadow: 0 18px 48px rgba(31, 64, 56, 0.12);
  --font-song: "LanZeSong", "Songti SC", "Noto Serif CJK SC", "Source Han Serif SC", serif;
  --font-display: "LanZeDisplay", "LanZeSong", "Songti SC", serif;
  --font-sans: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
}

* { box-sizing: border-box; }

html {
  font-size: 16px;
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-song);
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
}

button, input, textarea { font: inherit; }
button { cursor: pointer; }
a { color: inherit; }

:focus-visible {
  outline: 2px solid var(--seal);
  outline-offset: 3px;
}

::selection { background: rgba(158, 59, 47, 0.22); }

.paper-shell {
  min-height: 100vh;
  background:
    radial-gradient(circle at 18% 0%, rgba(255, 255, 255, 0.55), transparent 42%),
    repeating-linear-gradient(90deg, transparent 0 47px, rgba(47, 93, 80, 0.025) 47px 48px),
    var(--paper);
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.el-input__wrapper,
.el-textarea__inner {
  background: rgba(247, 244, 236, 0.9) !important;
  box-shadow: 0 0 0 1px var(--rule) inset !important;
  border-radius: 2px !important;
}

.el-input__wrapper.is-focus,
.el-textarea__inner:focus {
  box-shadow: 0 0 0 1px var(--jade) inset !important;
}

.el-button,
.el-pagination.is-background .el-pager li,
.el-pagination.is-background .btn-next,
.el-pagination.is-background .btn-prev {
  border-radius: 2px !important;
}

.el-tabs__item.is-active { color: var(--jade) !important; }
.el-tabs__active-bar { background-color: var(--jade) !important; }
.el-pagination.is-background .el-pager li.is-active { background: var(--jade) !important; }
.el-menu { background: transparent !important; border: 0 !important; }
.el-menu-item.is-active { color: var(--jade) !important; border-bottom-color: var(--jade) !important; }
.el-loading-spinner .path { stroke: var(--jade) !important; }
.el-loading-spinner .el-loading-text { color: var(--jade) !important; }
.el-message { border-radius: 2px !important; }

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
