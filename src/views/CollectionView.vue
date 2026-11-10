<template>
  <main class="collection-page">
    <section class="collection-head">
      <div class="shell collection-head__grid">
        <div>
          <p class="collection-kicker">保存在当前浏览器</p>
          <h1>我的诗卷</h1>
          <p class="collection-copy">
            收藏、最近读过的诗，以及自己写下的作品。它们首先服务于你，而不是一串用来展示增长的指标。
          </p>
        </div>
        <dl class="collection-stats">
          <div>
            <dt>收藏</dt>
            <dd>{{ savedPoems.length }}</dd>
          </div>
          <div>
            <dt>最近读过</dt>
            <dd>{{ recentPoems.length }}</dd>
          </div>
          <div>
            <dt>本地作品</dt>
            <dd>{{ works.length }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <div class="shell collection-layout">
      <section class="collection-main">
        <div class="collection-tabs" role="tablist" aria-label="诗卷分类">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :id="`collection-tab-${tab.id}`"
            type="button"
            role="tab"
            :aria-selected="activeTab === tab.id"
            aria-controls="collection-tab-panel"
            :class="{ 'is-active': activeTab === tab.id }"
            @click="setTab(tab.id)"
          >
            {{ tab.label }}
            <span>{{ tabCount(tab.id) }}</span>
          </button>
        </div>

        <div
          id="collection-tab-panel"
          role="tabpanel"
          :aria-labelledby="`collection-tab-${activeTab}`"
        >
          <div v-if="activeTab === 'saved'">
            <div v-if="savedPoems.length" class="saved-list">
              <PoemRow
                v-for="(poem, index) in savedPoems"
                :key="poem.id"
                :poem="poem"
                :index="String(index + 1).padStart(2, '0')"
                :saved="true"
                @toggle="removeSaved"
              />
            </div>
            <div v-else class="empty-state">
              <h2>诗卷还没有折角</h2>
              <p>在今日读诗或诗词索引里点一下书签，喜欢的那首就会留在这里。</p>
              <router-link class="button button--solid" to="/explore">去寻一首诗</router-link>
            </div>
          </div>

          <div v-else-if="activeTab === 'recent'">
            <div v-if="recentPoems.length" class="saved-list">
              <PoemRow
                v-for="(poem, index) in recentPoems"
                :key="poem.id"
                :poem="poem"
                :index="String(index + 1).padStart(2, '0')"
                :saved="isSaved(poem.id)"
                @toggle="toggleSavedPoem"
              />
            </div>
            <div v-else class="empty-state">
              <h2>还没有最近读诗</h2>
              <p>打开任意一首诗的详情页，它就会安静地记在这里，最多保留十二首。</p>
              <router-link class="button button--solid" to="/">从今日读诗开始</router-link>
            </div>
          </div>

          <div v-else>
            <div class="works-toolbar">
              <p>发布后会立即写入当前浏览器的演示数据。</p>
              <router-link class="button button--solid" to="/compose">
                <AppIcon name="pen" :size="16" />
                写一首诗
              </router-link>
            </div>
            <div v-if="works.length" class="works-list">
              <article v-for="work in works" :key="work.id" class="work-item">
                <div>
                  <p>{{ work.category }} · {{ work.author }}</p>
                  <h3>
                    <router-link :to="{ name: 'poem', params: { id: work.id } }">{{ work.title }}</router-link>
                  </h3>
                  <p class="work-item__line">{{ work.paragraph || work.paragraphs?.[0] }}</p>
                </div>
                <AppIcon name="arrow-right" :size="18" />
              </article>
            </div>
            <div v-else class="empty-state">
              <h2>还没有自己的作品</h2>
              <p>可以从一句此刻想到的话开始。表单不会上传到服务器，除非你配置了自建 API。</p>
              <router-link class="button button--solid" to="/compose">打开写作台</router-link>
            </div>
          </div>
        </div>
      </section>

      <aside class="account-panel">
        <template v-if="isLoggedIn">
          <div class="account-identity">
            <span class="account-avatar">{{ initial }}</span>
            <div>
              <h2>{{ profile.user_name }}</h2>
              <p>@{{ profile.username }}</p>
            </div>
          </div>
          <p class="account-intro">{{ profile.intro }}</p>

          <details class="profile-editor">
            <summary>编辑公开资料</summary>
            <form @submit.prevent="saveProfile">
              <label class="field-label">
                显示名称
                <input v-model="nameDraft" class="field" maxlength="30" autocomplete="nickname" />
              </label>
              <label class="field-label">
                一句简介
                <textarea v-model="introDraft" class="field" rows="3" maxlength="120" />
              </label>
              <button class="button" type="submit">保存资料</button>
            </form>
          </details>

          <div class="account-actions">
            <router-link class="button button--solid" to="/compose">
              <AppIcon name="pen" :size="16" />
              写一首诗
            </router-link>
            <button class="button" type="button" @click="logout">退出登录</button>
          </div>
        </template>

        <template v-else>
          <p class="account-mark" aria-hidden="true">客</p>
          <h2>登录后再写一首</h2>
          <p>
            收藏和最近阅读不需要登录；登录只用于本地演示作品发布与资料保存。
          </p>
          <router-link class="button button--solid" to="/login?next=/collection">登录或创建账号</router-link>
          <p class="demo-note">演示账号：demo / lanze2026</p>
        </template>

        <div class="local-note">
          <span aria-hidden="true" />
          <p>这里是纯前端演示。账号和作品不跨设备同步，也不构成线上社区服务。</p>
        </div>
      </aside>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppIcon from "../components/AppIcon.vue";
import PoemRow from "../components/PoemRow.vue";
import { loadCatalog, useLibrary } from "../composables/useLibrary.js";
import { useSession } from "../composables/useSession.js";
import { PoetryCustom } from "../apis/api/list.js";
import { normalizeListResponse } from "../utils/response.js";
import { notify } from "../composables/useNotices.js";

const route = useRoute();
const router = useRouter();
const {
  savedPoems,
  recentPoems,
  isSaved,
  toggleSaved,
} = useLibrary();
const { isLoggedIn, profile, updateProfile, clearSession } = useSession();

const works = ref([]);
const activeTab = ref(["saved", "recent", "works"].includes(String(route.query.tab)) ? String(route.query.tab) : "saved");
const initial = computed(() => (profile.value.user_name || "诗").slice(0, 1));
const nameDraft = ref(profile.value.user_name || "");
const introDraft = ref(profile.value.intro || "");

const tabs = [
  { id: "saved", label: "收藏" },
  { id: "recent", label: "最近" },
  { id: "works", label: "作品" },
];

const tabCount = (id) => {
  if (id === "saved") return savedPoems.value.length;
  if (id === "recent") return recentPoems.value.length;
  return works.value.length;
};

const setTab = (id) => {
  activeTab.value = id;
  router.replace({ name: "collection", query: { tab: id } });
};

const removeSaved = (poem) => {
  toggleSaved(poem);
  notify(`已移除《${poem.title}》`, "info");
};

const toggleSavedPoem = (poem) => {
  const added = toggleSaved(poem);
  notify(added ? `已收藏《${poem.title}》` : `已取消收藏《${poem.title}》`, added ? "success" : "info");
};

const loadWorks = async () => {
  try {
    const response = await PoetryCustom();
    works.value = normalizeListResponse(response, []);
  } catch {
    works.value = [];
  }
};

const saveProfile = () => {
  updateProfile({
    user_name: nameDraft.value.trim() || profile.value.user_name,
    intro: introDraft.value.trim() || profile.value.intro,
  });
  notify("公开资料已保存到当前浏览器", "success");
};

const logout = () => {
  clearSession();
  router.replace("/");
  notify("已退出本地演示账号", "info");
};

watch(
  () => route.query.tab,
  (value) => {
    if (["saved", "recent", "works"].includes(String(value))) activeTab.value = String(value);
  },
);

watch(profile, (value) => {
  nameDraft.value = value.user_name || "";
  introDraft.value = value.intro || "";
});

onMounted(async () => {
  await Promise.all([loadCatalog({ force: true }), loadWorks()]);
});
</script>

<style scoped>
.collection-page {
  min-height: 80dvh;
  padding-bottom: max(calc(84px + env(safe-area-inset-bottom)), var(--fixed-layer-space));
}

.collection-head {
  border-bottom: 1px solid var(--line);
  background:
    linear-gradient(110deg, rgba(168, 196, 184, 0.24), transparent 54%),
    var(--porcelain);
}

.collection-head__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 60px;
  padding-block: 66px 52px;
}

.collection-kicker {
  margin: 0 0 16px;
  color: var(--brass);
  font-size: var(--text-note);
  letter-spacing: 0.12em;
}

.collection-head h1 {
  margin: 0;
  font-family: var(--font-poem);
  font-size: clamp(48px, 7vw, 92px);
  font-weight: 400;
  letter-spacing: 0.1em;
  line-height: 1;
}

.collection-copy {
  max-width: min(610px, var(--measure-copy));
  margin: 20px 0 0;
  color: var(--ink-soft);
  font-size: 13px;
  line-height: var(--leading-copy);
  text-wrap: pretty;
}

.collection-stats {
  display: flex;
  align-items: flex-end;
  gap: 36px;
  margin: 0;
}

.collection-stats div {
  display: grid;
  gap: 0;
  min-width: 62px;
}

.collection-stats dt {
  order: 2;
  color: var(--ink-faint);
  font-size: var(--text-meta);
}

.collection-stats dd {
  margin: 0;
  font-family: var(--font-accent);
  font-size: 48px;
  line-height: 1;
}

.collection-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 350px);
  align-items: start;
  gap: clamp(44px, 7vw, 100px);
  padding-top: 48px;
}

.collection-tabs {
  display: flex;
  gap: 30px;
  border-bottom: 1px solid var(--line-strong);
}

.collection-tabs button {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: -1px;
  min-height: 46px;
  padding: 13px 4px;
  border: 0;
  border-bottom: 1px solid transparent;
  background: transparent;
  color: var(--ink-faint);
  font-size: 13px;
}

.collection-tabs button.is-active {
  border-bottom-color: var(--brass);
  color: var(--ink);
}

.collection-tabs button span {
  color: var(--ink-faint);
  font-size: var(--text-meta);
}

.saved-list {
  border-bottom: 1px solid var(--line);
}

.works-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 22px 0;
}

.works-toolbar p {
  margin: 0;
  color: var(--ink-faint);
  font-size: 11px;
}

.works-list {
  display: grid;
  border-top: 1px solid var(--line);
}

.work-item {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 22px;
  padding: 24px 0;
  border-bottom: 1px solid var(--line);
}

.work-item > div > p:first-child {
  margin: 0 0 5px;
  color: var(--ink-faint);
  font-size: var(--text-meta);
}

.work-item h3 {
  margin: 0;
  font-family: var(--font-poem);
  font-size: 23px;
  font-weight: 400;
  letter-spacing: 0.04em;
}

.work-item h3 a:hover {
  color: var(--brass);
}

.work-item__line {
  margin: 8px 0 0;
  color: var(--ink-soft);
  font-family: var(--font-poem);
  font-size: 13px;
}

.work-item > :deep(svg) {
  color: var(--ink-faint);
}

.account-panel {
  position: sticky;
  top: 104px;
  padding: 28px;
  border: 1px solid var(--line);
  background: var(--surface);
}

.account-identity {
  display: flex;
  align-items: center;
  gap: 15px;
}

.account-avatar {
  display: grid;
  width: 50px;
  height: 50px;
  place-items: center;
  border: 1px solid var(--brass);
  border-radius: 50%;
  color: var(--brass);
  font-family: var(--font-poem);
  font-size: 20px;
}

.account-identity h2,
.account-panel > h2 {
  margin: 0;
  font-family: var(--font-poem);
  font-size: 24px;
  font-weight: 400;
}

.account-identity p {
  margin: 1px 0 0;
  color: var(--ink-faint);
  font-size: var(--text-meta);
}

.account-intro,
.account-panel > p {
  margin: 18px 0;
  color: var(--ink-soft);
  font-size: 13px;
  line-height: var(--leading-copy);
  text-wrap: pretty;
}

.account-panel :where(.demo-note, .local-note p) {
  text-wrap: pretty;
}

.profile-editor {
  margin: 24px 0;
  padding: 16px 0;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

.profile-editor summary {
  cursor: pointer;
  color: var(--ink-soft);
  font-size: 12px;
}

.profile-editor form {
  display: grid;
  gap: 14px;
  margin-top: 18px;
}

.profile-editor textarea {
  resize: vertical;
}

.account-actions {
  display: grid;
  gap: 9px;
}

.account-mark {
  margin: 0 0 8px;
  color: var(--brass);
  font-family: var(--font-accent);
  font-size: 70px;
  line-height: 1;
  opacity: 0.7;
}

.demo-note {
  padding-top: 12px;
  color: var(--ink-faint) !important;
  font-size: var(--text-meta) !important;
  line-height: var(--leading-copy);
}

.local-note {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-top: 24px;
  padding-top: 18px;
  border-top: 1px solid var(--line);
}

.local-note span {
  flex: 0 0 auto;
  width: 7px;
  height: 7px;
  margin-top: 6px;
  border: 1px solid var(--moss-deep);
  border-radius: 50%;
}

.local-note p {
  margin: 0;
  color: var(--ink-faint);
  font-size: var(--text-meta);
  line-height: var(--leading-copy);
  text-wrap: pretty;
}

@media (max-width: 980px) {
  .collection-layout {
    grid-template-columns: 1fr;
  }

  .account-panel {
    position: static;
  }

  .account-actions {
    display: flex;
    flex-wrap: wrap;
  }
}

@media (max-width: 720px) {
  .collection-head__grid {
    grid-template-columns: 1fr;
    gap: 24px;
    padding-block: 36px 28px;
  }

  .collection-head h1 {
    font-size: clamp(42px, 12vw, 64px);
  }

  .collection-copy {
    margin-top: 14px;
    font-size: 13px;
    line-height: 1.8;
  }

  .collection-stats {
    gap: 28px;
  }

  .collection-stats dd {
    font-size: 38px;
  }

  .collection-layout {
    padding-top: 34px;
  }

  .collection-tabs {
    gap: 4px;
    overflow-x: auto;
    scrollbar-width: thin;
  }

  .collection-tabs button {
    flex: 1 0 auto;
    justify-content: center;
    padding-inline: 12px;
  }

  .works-toolbar {
    display: grid;
    justify-items: start;
  }

  .account-panel {
    padding: 22px;
  }
}

@media (max-width: 380px) {
  .collection-stats {
    gap: 16px;
  }

  .collection-stats div {
    min-width: 54px;
  }

  .collection-stats dd {
    font-size: 32px;
  }

  .collection-tabs button {
    padding-inline: 8px;
    font-size: 12px;
  }

  .empty-state {
    padding: 42px 0;
  }

  .empty-state h2 {
    font-size: 24px;
  }

  .account-panel {
    padding: 18px;
  }
}
</style>
