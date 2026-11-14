<template>
  <footer class="museum-footer">
    <div class="museum-footer__inner">
      <div class="footer-brand">
        <span>兰泽</span>
        <small>一间安静的数字诗馆</small>
      </div>
      <p>收藏与作品留在此浏览器，不设线上账号，也不连接托管服务。</p>
      <div class="footer-links">
        <a href="https://github.com/2648782102/LanZe">GitHub</a>
        <router-link to="/explore">索引</router-link>
        <span>MIT · {{ year }}</span>
      </div>
    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear();
</script>

<style scoped>
.museum-footer {
  padding: 30px 0 max(80px, var(--fixed-layer-space));
  border-top: 1px solid var(--line);
  background: var(--porcelain-deep);
  color: var(--ink-faint);
  font-size: var(--text-note);
}

.museum-footer__inner {
  display: grid;
  width: var(--shell);
  margin-inline: auto;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 32px;
}

.footer-brand {
  display: flex;
  align-items: baseline;
  gap: 14px;
}

.footer-brand span {
  color: var(--ink);
  font-family: var(--font-poem);
  font-size: 21px;
  letter-spacing: 0.16em;
}

.footer-brand small {
  font-size: var(--text-meta);
  letter-spacing: 0.1em;
}

.museum-footer p {
  margin: 0;
  text-align: center;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 18px;
}

.footer-links a:hover {
  color: var(--brass-text);
}

.footer-links a {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
}

@media (max-width: 820px) {
  .museum-footer__inner {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .museum-footer p {
    text-align: left;
  }
}
</style>
