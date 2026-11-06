<template>
  <div class="login-shell">
    <div class="login-side" aria-hidden="true">
      <p class="side-kicker">兰泽诗词</p>
      <p class="side-verse">山有木兮木有枝</p>
      <p class="side-verse">心悦君兮君不知</p>
      <span class="side-seal">兰泽</span>
    </div>
    <main class="login-main">
      <router-view />
    </main>
  </div>
</template>

<script>
export default { name: "loginIndex" };
</script>

<style scoped>
.login-shell {
  display: grid;
  grid-template-columns: minmax(280px, 42%) 1fr;
  min-height: 100vh;
  background:
    radial-gradient(circle at 12% 20%, rgba(255, 255, 255, 0.6), transparent 40%),
    var(--paper);
}

.login-side {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 60px;
  border-right: 1px solid var(--rule);
  background:
    linear-gradient(160deg, rgba(47, 93, 80, 0.08), transparent 55%),
    var(--paper-deep);
  overflow: hidden;
}

.login-side::after {
  content: "";
  position: absolute;
  inset: 24px;
  border: 1px solid var(--rule);
  pointer-events: none;
}

.side-kicker {
  margin: 0 0 38px;
  color: var(--jade);
  font-size: 13px;
  letter-spacing: 8px;
}

.side-verse {
  margin: 0;
  color: var(--ink);
  font-family: var(--font-display);
  font-size: clamp(28px, 3vw, 44px);
  letter-spacing: 10px;
  writing-mode: vertical-rl;
}

.side-seal {
  position: absolute;
  right: 54px;
  bottom: 54px;
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  border: 2px solid var(--seal);
  color: var(--seal);
  font-family: var(--font-display);
  font-size: 19px;
  letter-spacing: 2px;
}

.login-main {
  display: grid;
  place-items: center;
  padding: 48px 28px;
}

@media (max-width: 767px) {
  .login-shell { grid-template-columns: 1fr; }
  .login-side { display: none; }
  .login-main { padding: 28px 18px; }
}
</style>
