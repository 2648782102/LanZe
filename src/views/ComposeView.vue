<template>
  <main class="compose-page">
    <div class="shell compose-head">
      <router-link class="back-link" :to="isLoggedIn ? '/collection?tab=works' : '/'">
        <AppIcon name="arrow-left" :size="16" />
        {{ isLoggedIn ? "回到我的诗卷" : "回到今日读诗" }}
      </router-link>
      <div class="compose-head__row">
        <div>
          <p>写作台 · 一盏灯</p>
          <h1>写一首诗</h1>
        </div>
        <p class="compose-head__copy">
          字句先落在纸上，待你确认，再收进这间诗馆里的个人诗卷。
        </p>
      </div>
    </div>

    <div class="shell compose-grid">
      <form class="compose-form" @submit.prevent="publish">
        <div class="form-row form-row--two">
          <label class="field-label" for="poem-title">
            题目
            <input
              id="poem-title"
              v-model="form.title"
              class="field"
              type="text"
              maxlength="60"
              placeholder="给这首诗一个名字"
              required
            />
          </label>
          <label class="field-label" for="poem-author">
            署名
            <input
              id="poem-author"
              v-model="form.author"
              class="field"
              type="text"
              maxlength="30"
              placeholder="写作时的名字"
            />
          </label>
        </div>

        <label class="field-label" for="poem-category">
          体裁或标签
          <input
            id="poem-category"
            v-model="form.category"
            class="field"
            type="text"
            maxlength="20"
            placeholder="例如：五言、即兴、赠友"
          />
        </label>

        <label class="field-label" for="poem-content">
          正文
          <textarea
            id="poem-content"
            v-model="form.content"
            class="field compose-textarea"
            rows="11"
            placeholder="从第一句开始；换行或标点会保留为诗句边界。"
            required
          />
          <span class="field-hint">{{ contentLength }} 字 · 草稿自动保存在当前浏览器</span>
        </label>

        <p class="draft-status" role="status" aria-live="polite">
          <span :class="{ 'is-saving': draftSaving }" aria-hidden="true" />
          {{ draftStatusLabel }}
        </p>

        <label class="field-label" for="poem-note">
          小注
          <textarea
            id="poem-note"
            v-model="form.note"
            class="field"
            rows="3"
            placeholder="可选：写下写作缘由、用典或一句注释。"
          />
        </label>

        <p v-if="!isLoggedIn" class="compose-login-note" role="status">
          访客可先写下并预览；发布时留个名字，草稿会替你收好。
          <router-link :to="{ name: 'login', query: { next: '/compose' } }">先去登录</router-link>
        </p>

        <div class="form-actions" :class="{ 'is-submitting': submitting }">
          <button class="button button--solid" type="submit" :disabled="submitting" :aria-busy="submitting">
            <AppIcon name="feather" :size="17" />
            {{ submitting ? "正在收入诗卷" : isLoggedIn ? "发布到我的诗卷" : "登录后发布" }}
          </button>
          <button class="button" type="button" :disabled="submitting" @click="clearDraft">清空草稿</button>
        </div>
      </form>

      <aside class="preview-panel" aria-label="作品预览" :class="{ 'is-refreshing': previewChanged }">
        <div class="preview-panel__top">
          <span>预览 · 非定稿</span>
          <span>{{ form.category || "未分类" }} · {{ contentLength }} 字</span>
        </div>
        <div class="preview-sheet">
          <p class="preview-category">兰泽 · 我的诗卷</p>
          <h2>{{ form.title || "无题" }}</h2>
          <p class="preview-author">{{ form.author || profile.user_name || "佚名" }}</p>
          <div class="preview-lines">
            <p v-for="(line, index) in previewLines" :key="index">{{ line }}</p>
          </div>
          <p v-if="form.note" class="preview-note">{{ form.note }}</p>
        </div>
      </aside>
    </div>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import AppIcon from "../components/AppIcon.vue";
import { userPublishPoem } from "../apis/api/login.js";
import { useSession } from "../composables/useSession.js";
import { loadCatalog } from "../composables/useLibrary.js";
import { notify } from "../composables/useNotices.js";
import { readStore, removeStore, writeStore } from "../services/browserStore.js";

const DRAFT_KEY = "lanze_compose_draft";
const router = useRouter();
const { isLoggedIn, profile } = useSession();
const submitting = ref(false);
const draftSaving = ref(false);
const draftSavedAt = ref("");
const previewChanged = ref(false);
const savedDraft = readStore(DRAFT_KEY, {});
let draftTimer;
let previewTimer;
const form = reactive({
  title: savedDraft.title || "",
  author: savedDraft.author || profile.value.user_name || "",
  category: savedDraft.category || "",
  content: savedDraft.content || "",
  note: savedDraft.note || "",
});

const contentLength = computed(() => form.content.trim().length);
const draftStatusLabel = computed(() => {
  if (draftSaving.value) return "正在保存草稿";
  if (submitting.value) return "正在收入诗卷";
  if (draftSavedAt.value) return `草稿已保存 · ${draftSavedAt.value}`;
  return "草稿会保存在当前浏览器";
});
const previewLines = computed(() => {
  const lines = form.content
    .split(/\n|[，。；;]/)
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.length ? lines : ["诗句会在这里排成一首。"];
});

const persistDraft = () => {
  writeStore(DRAFT_KEY, {
    title: form.title,
    author: form.author,
    category: form.category,
    content: form.content,
    note: form.note,
  });
  draftSaving.value = true;
  window.clearTimeout(draftTimer);
  draftTimer = window.setTimeout(() => {
    draftSaving.value = false;
    draftSavedAt.value = new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date());
  }, 260);
};

const clearDraft = () => {
  form.title = "";
  form.author = profile.value.user_name || "";
  form.category = "";
  form.content = "";
  form.note = "";
  removeStore(DRAFT_KEY);
  draftSavedAt.value = "";
  draftSaving.value = false;
  window.clearTimeout(draftTimer);
  notify("草稿已清空", "info");
};

const publish = async () => {
  if (!isLoggedIn.value) {
    persistDraft();
    await new Promise((resolve) => window.setTimeout(resolve, 280));
    notify("草稿已收好，登录后可以继续", "info");
    router.push({ path: "/login", query: { next: "/compose" } });
    return;
  }
  if (!form.title.trim() || !form.content.trim()) {
    notify("题目和正文不能为空", "warning");
    return;
  }

  submitting.value = true;
  try {
    const response = await userPublishPoem({
      origin: form.title.trim(),
      author: form.author.trim() || profile.value.user_name,
      category: form.category.trim() || "用户作品",
      content: form.content.trim(),
      title: form.note.trim(),
    });
    if (Number(response?.code) !== 200) {
      notify(response?.msg || "发布失败，请稍后重试", "error");
      return;
    }
    removeStore(DRAFT_KEY);
    window.clearTimeout(draftTimer);
    await loadCatalog({ force: true });
    notify("作品已收入你的诗卷", "success");
    router.push({ name: "collection", query: { tab: "works" } });
  } catch (error) {
    notify(error?.message || "发布失败，请稍后重试", "error");
  } finally {
    submitting.value = false;
  }
};

watch(form, persistDraft, { deep: true });
watch([() => form.title, () => form.content, () => form.category, () => form.author, () => form.note], () => {
  previewChanged.value = false;
  window.clearTimeout(previewTimer);
  window.requestAnimationFrame(() => {
    previewChanged.value = true;
    previewTimer = window.setTimeout(() => {
      previewChanged.value = false;
    }, 320);
  });
});
watch(
  () => profile.value.user_name,
  (name) => {
    if (!form.author) form.author = name || "";
  },
);

onMounted(() => {
  loadCatalog();
});
onBeforeUnmount(() => {
  window.clearTimeout(draftTimer);
  window.clearTimeout(previewTimer);
});
</script>

<style scoped>
.compose-page {
  min-height: 80dvh;
  background: var(--porcelain);
  padding-bottom: max(calc(84px + env(safe-area-inset-bottom)), var(--fixed-layer-space));
}

.compose-head {
  padding-block: var(--hero-pad-top) var(--hero-pad-bottom);
}

.back-link {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  gap: 7px;
  color: var(--ink-faint);
  font-size: var(--text-meta);
}

.back-link:hover {
  color: var(--brass);
}

.compose-head__row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 60px;
  margin-top: 34px;
}

.compose-head__row > div > p {
  margin: 0 0 10px;
  color: var(--brass);
  font-size: var(--text-meta);
  letter-spacing: 0.14em;
}

.compose-head h1 {
  margin: 0;
  font-family: var(--font-poem);
  font-size: clamp(46px, 6vw, 80px);
  font-weight: 400;
  letter-spacing: 0.08em;
  line-height: 1;
}

.compose-head__copy {
  max-width: min(400px, var(--measure-copy));
  margin: 0;
  color: var(--ink-soft);
  font-size: var(--text-body);
  line-height: var(--leading-copy);
  text-wrap: pretty;
}

.compose-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.98fr) minmax(320px, 0.72fr);
  align-items: start;
  gap: clamp(44px, 8vw, 120px);
}

.compose-form {
  display: grid;
  gap: 22px;
}

.form-row--two {
  display: grid;
  grid-template-columns: 1.4fr 0.8fr;
  gap: 16px;
}

.compose-textarea {
  min-height: 285px;
  font-family: var(--font-poem);
  font-size: 18px;
  letter-spacing: 0.05em;
  line-height: 1.9;
  resize: vertical;
}

.compose-textarea::placeholder {
  font-size: var(--text-body);
  line-height: 1.7;
}

.field-hint {
  color: var(--ink-faint);
  font-size: var(--text-meta);
}

.draft-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: -12px 0 0;
  color: var(--ink-faint);
  font-size: var(--text-meta);
  letter-spacing: 0.04em;
}

.draft-status span {
  width: 6px;
  height: 6px;
  border: 1px solid var(--celadon-deep);
  border-radius: 50%;
}

.draft-status span.is-saving {
  animation: draft-pulse var(--motion-base) var(--ease-standard) infinite alternate;
}

@keyframes draft-pulse {
  from { transform: scale(0.7); opacity: 0.45; }
  to { transform: scale(1.2); opacity: 1; }
}

.form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding-top: 8px;
  transition: opacity var(--motion-fast) var(--ease-standard);
}

.form-actions.is-submitting {
  opacity: 0.7;
}

.compose-login-note {
  margin: 0;
  padding: 12px 14px;
  border-left: 2px solid var(--brass);
  background: var(--porcelain-deep);
  color: var(--ink-soft);
  font-size: var(--text-body);
  line-height: var(--leading-copy);
  text-wrap: pretty;
}

.compose-login-note a {
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  color: var(--celadon-deep);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.button:disabled {
  cursor: wait;
}

.preview-panel {
  position: sticky;
  top: 104px;
  max-height: calc(100dvh - 104px - 120px);
  overflow-y: auto;
  overscroll-behavior: contain;
  transition: filter var(--motion-base) var(--ease-standard);
}

.preview-panel.is-refreshing {
  filter: saturate(1.04);
}

.preview-panel__top {
  display: flex;
  justify-content: space-between;
  padding-bottom: 11px;
  border-bottom: 1px solid var(--line-strong);
  color: var(--ink-faint);
  font-size: var(--text-meta);
  letter-spacing: 0.08em;
}

.preview-sheet {
  min-height: 420px;
  padding: 42px 34px;
  border: var(--card-border-strong);
  border-top: 0;
  background: var(--surface);
  box-shadow: var(--card-shadow-raised);
  box-shadow: var(--shadow-soft);
  text-align: center;
  transition:
    border-color var(--motion-base) var(--ease-standard),
    box-shadow var(--motion-base) var(--ease-standard);
}

.preview-panel.is-refreshing .preview-sheet {
  border-color: rgba(168, 130, 69, 0.42);
  box-shadow: 0 0 0 3px rgba(168, 130, 69, 0.08), var(--shadow-soft);
}

.preview-category {
  margin: 0 0 22px;
  color: var(--brass);
  font-size: var(--text-meta);
  letter-spacing: 0.14em;
}

.preview-sheet h2 {
  margin: 0;
  font-family: var(--font-poem);
  font-size: clamp(30px, 4vw, 46px);
  font-weight: 400;
  letter-spacing: 0.08em;
  line-height: 1.3;
  text-wrap: balance;
}

.preview-author {
  margin: 9px 0 40px;
  color: var(--ink-soft);
  font-family: var(--font-poem);
  font-size: var(--text-body);
  letter-spacing: 0.16em;
}

.preview-lines {
  display: grid;
  gap: 9px;
}

.preview-lines p {
  margin: 0;
  font-family: var(--font-poem);
  font-size: 17px;
  letter-spacing: 0.07em;
  line-height: 1.75;
}

.preview-note {
  margin: 42px auto 0;
  padding-top: 18px;
  border-top: 1px solid var(--line);
  color: var(--ink-soft);
  font-size: var(--text-note);
  line-height: var(--leading-copy);
  white-space: pre-line;
}

@media (max-width: 940px) {
  .compose-grid {
    grid-template-columns: 1fr;
  }

  .preview-panel {
    position: static;
  }

  .preview-sheet {
    min-height: 420px;
  }
}

@media (max-width: 650px) {
  .compose-head {
    padding-block: 24px 30px;
  }

  .compose-head__row {
    display: grid;
    gap: 18px;
    margin-top: 28px;
  }

  .compose-head h1 {
    font-size: clamp(40px, 12vw, 60px);
  }

  .compose-head__copy {
    font-size: var(--text-note);
    line-height: 1.8;
  }

  .compose-grid,
  .compose-form {
    gap: 18px;
  }

  .form-row--two {
    grid-template-columns: 1fr;
  }

  .compose-textarea {
    min-height: 210px;
    font-size: 16px;
  }

  .compose-login-note {
    padding: 10px 12px;
    font-size: var(--text-note);
    line-height: 1.75;
  }

  .form-actions {
    gap: 8px;
  }

  .form-actions .button {
    padding-inline: 14px;
  }

  .preview-sheet {
    min-height: 360px;
    padding: 34px 22px;
  }
}

@media (max-width: 380px) {
  .form-row--two {
    gap: 12px;
  }

  .compose-textarea {
    min-height: 180px;
  }

  .compose-login-note a {
    display: block;
  }

  .form-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .form-actions .button {
    width: 100%;
    padding-inline: 8px;
  }

  .preview-sheet {
    padding: 26px 16px;
  }
}
</style>
