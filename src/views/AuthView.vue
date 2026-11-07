<template>
  <main class="auth-page">
    <section class="auth-art" aria-hidden="true">
      <img :src="authImage" alt="" />
      <div class="auth-art__veil" />
      <router-link class="auth-brand" to="/">
        <span>兰</span>
        <strong>兰泽</strong>
      </router-link>
      <div class="auth-verse">
        <p>山有木兮木有枝</p>
        <p>心悦君兮君不知</p>
        <span>《越人歌》</span>
      </div>
      <p class="auth-art__note">读诗不需要登录。登录只用于本地演示的作品与资料。</p>
    </section>

    <section class="auth-panel">
      <router-link class="auth-back" to="/">
        <AppIcon name="arrow-left" :size="16" />
        回到今日读诗
      </router-link>

      <div class="auth-form-wrap">
        <p class="auth-kicker">{{ isRegister ? "新的本地账号" : "欢迎回来" }}</p>
        <h1>{{ isRegister ? "创建你的诗卷" : "接着读，接着写" }}</h1>
        <p class="auth-copy">
          {{ isRegister
            ? "账号只保存在当前浏览器，用来演示作品发布与资料编辑。"
            : "使用演示账号体验完整流程，或继续使用你在这台设备上创建过的账号。" }}
        </p>

        <div class="auth-tabs" role="tablist" aria-label="账号操作">
          <router-link :to="{ name: 'login', query: route.query }" :class="{ 'is-active': !isRegister }">
            登录
          </router-link>
          <router-link :to="{ name: 'register', query: route.query }" :class="{ 'is-active': isRegister }">
            创建账号
          </router-link>
        </div>

        <form class="auth-form" @submit.prevent="submit">
          <label class="field-label" for="auth-user">
            账号
            <input
              id="auth-user"
              v-model="form.username"
              class="field"
              type="text"
              autocomplete="username"
              aria-label="登录账号"
              maxlength="20"
              placeholder="3–20 个字符"
            />
          </label>
          <label class="field-label" for="auth-password">
            密码
            <span class="password-field">
              <input
                id="auth-password"
                v-model="form.password"
                class="field"
                :type="showPassword ? 'text' : 'password'"
                :autocomplete="isRegister ? 'new-password' : 'current-password'"
                aria-label="登录密码"
                maxlength="30"
                placeholder="至少 6 个字符"
              />
              <button type="button" @click="showPassword = !showPassword">
                {{ showPassword ? "隐藏" : "显示" }}
              </button>
            </span>
          </label>
          <label v-if="isRegister" class="field-label" for="auth-confirm">
            再输一次密码
            <input
              id="auth-confirm"
              v-model="form.confirm"
              class="field"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              maxlength="30"
              placeholder="确认密码"
            />
          </label>

          <p v-if="error" class="form-error" role="alert">{{ error }}</p>

          <button class="button button--solid auth-submit" type="submit" :disabled="busy"
            :aria-label="isRegister ? '提交注册' : '提交登录'">
            {{ busy ? "请稍候" : isRegister ? "创建账号" : "登录" }}
            <AppIcon :name="isRegister ? 'feather' : 'arrow-right'" :size="17" />
          </button>
        </form>

        <div v-if="!isRegister" class="demo-box">
          <p>本地演示账号</p>
          <button type="button" @click="fillDemo">填入 demo / lanze2026</button>
        </div>

        <p class="auth-fineprint">
          不要在这里输入真实密码。这个演示没有线上密码安全、跨设备同步或找回密码服务。
        </p>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppIcon from "../components/AppIcon.vue";
import { userLogin, userReg } from "../apis/api/login.js";
import { useSession } from "../composables/useSession.js";
import { notify } from "../composables/useNotices.js";
import authImage from "../assets/LunBo/1.webp";

const route = useRoute();
const router = useRouter();
const { setSession } = useSession();
const isRegister = computed(() => route.name === "register");
const busy = ref(false);
const error = ref("");
const showPassword = ref(false);
const form = reactive({ username: "", password: "", confirm: "" });

const resetMessages = () => {
  error.value = "";
};

const fillDemo = () => {
  form.username = "demo";
  form.password = "lanze2026";
  resetMessages();
};

const safeNext = () => {
  const target = String(route.query.next || "");
  return target.startsWith("/") && !target.startsWith("//") ? target : "/collection";
};

const validate = () => {
  if (form.username.trim().length < 3) return "账号至少需要 3 个字符";
  if (form.password.length < 6) return "密码至少需要 6 个字符";
  if (isRegister.value && form.password !== form.confirm) return "两次输入的密码不一致";
  return "";
};

const submit = async () => {
  resetMessages();
  const message = validate();
  if (message) {
    error.value = message;
    return;
  }

  busy.value = true;
  try {
    if (isRegister.value) {
      const response = await userReg({
        user_name: form.username.trim(),
        username: form.username.trim(),
        password: form.password,
      });
      if (Number(response?.code) !== 200) {
        error.value = response?.msg || "注册失败，请稍后重试";
        return;
      }
      notify("账号已创建，请登录", "success");
      await router.replace({ name: "login", query: route.query });
      form.password = "";
      form.confirm = "";
      return;
    }

    const response = await userLogin({
      username: form.username.trim(),
      password: form.password,
    });
    if (Number(response?.code) !== 200) {
      error.value = response?.msg || "登录失败，请检查账号密码";
      return;
    }
    setSession({ user: response.data, profile: response.data });
    notify("已登录本地演示账号", "success");
    await router.replace(safeNext());
  } catch (requestError) {
    error.value = requestError?.message || "请求失败，请稍后重试";
  } finally {
    busy.value = false;
  }
};

watch(
  () => route.name,
  () => {
    resetMessages();
    form.password = "";
    form.confirm = "";
  },
);
</script>

<style scoped>
.auth-page {
  display: grid;
  min-height: 100vh;
  grid-template-columns: minmax(360px, 0.92fr) minmax(460px, 1.08fr);
  background: var(--porcelain-panel);
}

.auth-art {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: var(--night);
  color: var(--porcelain-panel);
}

.auth-art > img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.3) grayscale(0.4) contrast(1.06) brightness(0.72);
}

.auth-art__veil {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(16, 40, 39, 0.38), rgba(16, 40, 39, 0.82)),
    linear-gradient(90deg, rgba(16, 40, 39, 0.5), transparent);
}

.auth-brand {
  position: absolute;
  top: 38px;
  left: 42px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 12px;
}

.auth-brand span {
  display: grid;
  width: 35px;
  height: 41px;
  place-items: center;
  border: 1px solid var(--brass-soft);
  color: var(--brass-soft);
  font-family: var(--font-poem);
  font-size: 20px;
}

.auth-brand strong {
  font-family: var(--font-poem);
  font-size: 23px;
  font-weight: 400;
  letter-spacing: 0.16em;
}

.auth-verse {
  position: absolute;
  top: 50%;
  right: 12%;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  gap: 24px;
  transform: translateY(-50%);
  writing-mode: vertical-rl;
}

.auth-verse p {
  margin: 0;
  font-family: var(--font-poem);
  font-size: clamp(28px, 3.4vw, 48px);
  letter-spacing: 0.2em;
  line-height: 1.6;
}

.auth-verse span {
  align-self: flex-end;
  color: rgba(251, 252, 249, 0.54);
  font-family: var(--font-poem);
  font-size: 11px;
  letter-spacing: 0.16em;
}

.auth-art__note {
  position: absolute;
  right: 42px;
  bottom: 38px;
  left: 42px;
  z-index: 2;
  max-width: 330px;
  margin: 0;
  color: rgba(251, 252, 249, 0.54);
  font-size: 10px;
  line-height: 1.8;
}

.auth-panel {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 100vh;
  padding: 74px 34px;
}

.auth-back {
  position: absolute;
  top: 30px;
  left: 34px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--ink-faint);
  font-size: 11px;
}

.auth-back:hover {
  color: var(--brass);
}

.auth-form-wrap {
  width: min(100%, 430px);
}

.auth-kicker {
  margin: 0 0 12px;
  color: var(--brass);
  font-size: 11px;
  letter-spacing: 0.14em;
}

.auth-form-wrap h1 {
  margin: 0;
  font-family: var(--font-poem);
  font-size: clamp(36px, 4.5vw, 54px);
  font-weight: 400;
  letter-spacing: 0.04em;
  line-height: 1.2;
}

.auth-copy {
  margin: 16px 0 28px;
  color: var(--ink-soft);
  font-size: 12px;
  line-height: 1.85;
}

.auth-tabs {
  display: flex;
  gap: 26px;
  margin-bottom: 26px;
  border-bottom: 1px solid var(--line);
}

.auth-tabs a {
  margin-bottom: -1px;
  padding: 10px 0;
  border-bottom: 1px solid transparent;
  color: var(--ink-faint);
  font-size: 12px;
}

.auth-tabs a.is-active {
  border-bottom-color: var(--brass);
  color: var(--ink);
}

.auth-form {
  display: grid;
  gap: 18px;
}

.password-field {
  position: relative;
}

.password-field .field {
  padding-right: 62px;
}

.password-field .field,
.field {
  border-radius: 0;
}

.password-field button {
  position: absolute;
  top: 50%;
  right: 12px;
  padding: 5px;
  border: 0;
  background: transparent;
  color: var(--ink-faint);
  font-size: 10px;
  transform: translateY(-50%);
}

.form-error {
  margin: 0;
  padding: 10px 12px;
  border-left: 2px solid var(--brass);
  background: rgba(168, 130, 69, 0.09);
  color: #735629;
  font-size: 11px;
  line-height: 1.6;
}

.auth-submit {
  width: 100%;
  margin-top: 6px;
}

.auth-submit:disabled {
  cursor: wait;
  opacity: 0.6;
}

.demo-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 22px;
  padding: 12px 14px;
  border: 1px dashed var(--line-strong);
}

.demo-box p {
  margin: 0;
  color: var(--ink-soft);
  font-size: 10px;
}

.demo-box button {
  padding: 0;
  border: 0;
  border-bottom: 1px solid var(--ink);
  background: transparent;
  color: var(--ink);
  font-size: 10px;
}

.auth-fineprint {
  margin: 22px 0 0;
  color: var(--ink-faint);
  font-size: 9px;
  line-height: 1.8;
}

@media (max-width: 880px) {
  .auth-page {
    grid-template-columns: 1fr;
  }

  .auth-art {
    display: none;
  }

  .auth-panel {
    padding: 96px 24px 54px;
  }

  .auth-back {
    top: 28px;
    left: 24px;
  }
}
</style>
