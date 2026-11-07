<template>
  <footer class="museum-footer">
    <div class="museum-footer__inner">
      <div class="footer-brand">
        <span>兰泽</span>
        <small>一间可本地运行的数字诗馆</small>
      </div>
      <p>演示数据只保存在当前浏览器；不提供线上账号或托管后端。</p>
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
  padding: 30px 0 80px;
  border-top: 1px solid var(--line);
  background: var(--porcelain-deep);
  color: var(--ink-faint);
  font-size: 11px;
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
  font-size: 9px;
  letter-spacing: 0.12em;
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
  color: var(--brass);
}

.footer-links a {
  display: inline-flex;
  min-height: 40px;
  align-items: center;
}

@media (max-width: 760px) {
  .museum-footer {
    padding-bottom: calc(116px + env(safe-area-inset-bottom));
  }

  .museum-footer__inner {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .museum-footer p {
    text-align: left;
  }
}
</style>
