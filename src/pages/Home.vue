<template>
  <div class="paper-shell">
    <lottie-player v-show="isLottie" class="route-veil" ref="demoRefHua" :src="qieHuanSource"
      background="transparent" speed="1" aria-hidden="true" />

    <header class="site-head tab-top hidden-sm-and-down">
      <div class="head-inner">
        <button class="brand" type="button" @click="$router.push({ name: 'home' })" aria-label="返回兰泽诗词首页">
          <span class="brand-seal" aria-hidden="true">兰<br>泽</span>
          <span class="brand-name">兰泽诗词<span>LANZE</span></span>
        </button>

        <form class="search" role="search" @submit.prevent="inputEnter">
          <label class="visually-hidden" for="home-search-desktop">搜索诗词</label>
          <input id="home-search-desktop" v-model="inputS" type="search" placeholder="搜索诗词、作者" autocomplete="off"
            aria-label="搜索诗词，按回车提交" @keyup.enter="inputEnter">
          <button type="submit" aria-label="提交搜索">检</button>
        </form>

        <nav class="main-nav" aria-label="主导航">
          <router-link v-for="item in navItems" :key="item.name" :to="{ name: item.name }"
            :class="{ 'is-current': isCurrent(item.name) }">{{ item.label }}</router-link>
          <router-link :to="{ name: 'personal' }" :class="{ 'is-current': isCurrent('personal') }">个人</router-link>
        </nav>
      </div>
    </header>

    <header class="mobile-head hidden-md-and-up">
      <form class="search mobile-search" role="search" @submit.prevent="inputEnter">
        <label class="visually-hidden" for="home-search-mobile">搜索诗词</label>
        <input id="home-search-mobile" v-model="inputS" type="search" placeholder="搜索诗词" autocomplete="off"
          aria-label="搜索诗词，按回车提交" @keyup.enter="inputEnter">
        <button type="submit" aria-label="提交搜索">检</button>
      </form>
      <button class="brand compact" type="button" @click="$router.push({ name: 'home' })" aria-label="返回兰泽诗词首页">
        <span class="brand-seal" aria-hidden="true">兰</span>
      </button>
    </header>

    <div class="mobile-veil hidden-md-and-up" aria-hidden="true"></div>
    <nav class="tab-bottom min-tab-bottom hidden-md-and-up" aria-label="移动端导航">
      <router-link v-for="item in mobileItems" :key="item.name" :to="{ name: item.name }" active-class="bottom-active"
        :aria-label="`前往${item.label}`">
        <span class="tab-glyph" aria-hidden="true">{{ item.glyph }}</span>
        <span>{{ item.label }}</span>
      </router-link>
    </nav>

    <section class="section-main">
      <el-scrollbar ref="scrollbarRef" height="100vh" aria-label="页面内容滚动区域">
        <main id="main" v-loading="loading">
          <router-view />
        </main>
        <footer class="site-foot">
          <div class="foot-rule" aria-hidden="true"></div>
          <div class="foot-inner">
            <p class="foot-colophon">兰泽诗词 · 卷帙常新</p>
            <p>开源学习项目 · 演示数据仅存于本机浏览器 · MIT 许可</p>
            <p>Copyright © 2022–2026 LanZe contributors</p>
          </div>
        </footer>
      </el-scrollbar>
    </section>

    <Audio class="Aud hidden-sm-and-down" />
  </div>
</template>

<script>
import { ref, watch, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus/es/components/message/index.mjs";
import qieHuan from "../assets/lottieJSON/qieHuan.json";
import { useLottieSource } from "../composables/useLottieSource.js";
import { useRouteTransition } from "../composables/useRouteTransition.js";
import Audio from "./Audio.vue";
import { searchList } from "../apis/api/list.js";
import { normalizeListResponse } from "../utils/response.js";

export default {
  name: "Home",
  components: { Audio },
  setup() {
    const $router = useRouter();
    const $route = useRoute();
    const inputS = ref("");
    const loading = ref(false);
    const scrollbarRef = ref();
    const { transitionActive, start: startTransition, stop: stopTransition } = useRouteTransition();
    const navItems = [
      { name: "zhailu", label: "涉猎" },
      { name: "wenku", label: "文库" },
      { name: "chalou", label: "茶楼" },
      { name: "duxue", label: "笃学" },
    ];
    const mobileItems = [
      { name: "chalou", label: "茶楼", glyph: "茶" },
      { name: "wenku", label: "文库", glyph: "卷" },
      { name: "zhailu", label: "涉猎", glyph: "诗" },
      { name: "duxue", label: "笃学", glyph: "学" },
      { name: "personal", label: "中心", glyph: "人" },
    ];

    const isCurrent = (name) => {
      const path = $route.path.toLowerCase();
      if (name === "wenku") return path.includes("wenku") || path.includes("gushi");
      if (name === "chalou") return /chalou|jingxuan|fengya|feihua|xiandai/.test(path);
      if (name === "personal") return /personal|favorite|samplereels|shezhi|publishpoem/.test(path);
      return path.includes(name);
    };

    async function inputEnter() {
      const keyword = inputS.value.trim();
      if (!keyword) {
        ElMessage({ message: "请输入诗词、作者或标签", type: "warning" });
        return;
      }
      loading.value = true;
      try {
        const response = await searchList({ keyword });
        const searchData = normalizeListResponse(response, []);
        await $router.push({ name: "searchul", query: { ulArr: JSON.stringify(searchData), keyword } });
        ElMessage({
          message: searchData.length ? "已找到相关诗句" : "没有匹配结果，已展示推荐内容",
          type: searchData.length ? "success" : "info",
        });
        inputS.value = "";
      } catch (error) {
        ElMessage({ message: error?.message || "搜索失败，请稍后重试", type: "error" });
      } finally {
        loading.value = false;
      }
    }

    const isLottie = transitionActive;
    const demoRefHua = ref(null);
    const qieHuanSource = useLottieSource(qieHuan);
    const resetScroll = () => scrollbarRef.value?.setScrollTop?.(0);
    const stopRouteWatcher = watch(
      () => $router.currentRoute.value.fullPath,
      () => {
        resetScroll();
        startTransition(500);
        demoRefHua.value?.play?.();
      },
    );
    const stopAnimationWatcher = watch(transitionActive, (active) => {
      if (!active) demoRefHua.value?.stop?.();
    });
    onBeforeUnmount(() => {
      stopRouteWatcher();
      stopAnimationWatcher();
      stopTransition();
    });

    return {
      inputS, loading, inputEnter, scrollbarRef, navItems, mobileItems, isCurrent,
      qieHuanSource, demoRefHua, isLottie,
    };
  },
};
</script>

<style scoped>
.paper-shell { position: relative; }

.route-veil {
  position: fixed;
  inset: -20vh;
  width: 140vh;
  height: 140vh;
  z-index: 30;
  pointer-events: none;
  opacity: 0.38;
}

.site-head {
  position: relative;
  z-index: 12;
  height: 88px;
  border-bottom: 1px solid var(--rule);
  background: rgba(247, 244, 236, 0.92);
  backdrop-filter: blur(8px);
}

.head-inner {
  max-width: 1360px;
  height: 100%;
  margin: 0 auto;
  padding: 0 42px;
  display: grid;
  grid-template-columns: 260px minmax(180px, 300px) 1fr;
  align-items: center;
  gap: 32px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--ink);
  text-align: left;
}

.brand-seal {
  display: grid;
  place-items: center;
  width: 38px;
  height: 46px;
  border: 2px solid var(--seal);
  color: var(--seal);
  font-family: var(--font-display);
  font-size: 15px;
  line-height: 1.05;
  letter-spacing: 1px;
}

.brand-name {
  font-family: var(--font-display);
  font-size: 25px;
  letter-spacing: 5px;
  white-space: nowrap;
}

.brand-name span {
  display: block;
  margin-top: -3px;
  font-family: var(--font-sans);
  font-size: 9px;
  letter-spacing: 4px;
  color: var(--ink-soft);
}

.search {
  display: flex;
  align-items: stretch;
  height: 38px;
  border-bottom: 1px solid var(--rule-strong);
}

.search input {
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  color: var(--ink);
  font-size: 14px;
  letter-spacing: 1px;
  outline: none;
}

.search input::placeholder { color: #8a9088; }
.search input::-webkit-search-cancel-button { cursor: pointer; }

.search button {
  width: 34px;
  border: 0;
  background: transparent;
  color: var(--jade);
  font-family: var(--font-display);
  font-size: 18px;
}

.main-nav {
  display: flex;
  justify-content: flex-end;
  gap: 34px;
}

.main-nav a {
  position: relative;
  padding: 8px 0;
  color: var(--ink-soft);
  font-size: 15px;
  letter-spacing: 4px;
  text-decoration: none;
  transition: color 0.2s ease;
}

.main-nav a::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 2px;
  width: 0;
  height: 2px;
  background: var(--jade);
  transition: width 0.25s ease;
}

.main-nav a:hover,
.main-nav a.is-current { color: var(--jade-deep); }
.main-nav a.is-current::after { width: 100%; }

.section-main { position: relative; }
#main { position: relative; min-height: 84vh; }

.site-foot {
  position: relative;
  margin: 0 42px 28px;
  padding: 30px 0 24px;
  border-top: 1px solid var(--rule);
  color: var(--ink-soft);
  text-align: center;
}

.foot-rule {
  width: 46px;
  height: 1px;
  margin: -31px auto 30px;
  background: var(--seal);
}

.foot-inner p { margin: 2px 0; font-size: 12px; letter-spacing: 2px; }
.foot-colophon {
  font-family: var(--font-display);
  font-size: 18px !important;
  letter-spacing: 8px !important;
  color: var(--jade-deep);
}

.mobile-head {
  position: relative;
  z-index: 12;
  display: flex;
  align-items: center;
  gap: 14px;
  height: 64px;
  padding: 0 18px;
  border-bottom: 1px solid var(--rule);
  background: rgba(247, 244, 236, 0.96);
}

.mobile-search { flex: 1; height: 34px; }
.brand.compact { padding: 0; border: 0; background: none; }
.brand.compact .brand-seal { width: 34px; height: 38px; font-size: 18px; }
.mobile-veil { display: none; }

.tab-bottom {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
  display: flex;
  justify-content: space-around;
  height: 72px;
  border-top: 1px solid var(--rule);
  background: rgba(247, 244, 236, 0.97);
  backdrop-filter: blur(10px);
}

.tab-bottom a {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  color: var(--ink-soft);
  font-size: 11px;
  letter-spacing: 2px;
  text-decoration: none;
}

.tab-glyph {
  font-family: var(--font-display);
  font-size: 19px;
  line-height: 1;
}

.bottom-active { color: var(--jade-deep); }
.bottom-active .tab-glyph { color: var(--seal); }

@media (max-width: 1100px) {
  .head-inner { grid-template-columns: 200px minmax(150px, 220px) 1fr; gap: 20px; padding: 0 24px; }
  .main-nav { gap: 20px; }
  .main-nav a { letter-spacing: 2px; }
  .site-foot { margin: 0 24px 24px; }
}

@media (max-width: 767px) {
  #main { min-height: 72vh; }
  .site-foot { margin: 0 18px 90px; padding-bottom: 12px; }
  .foot-inner p { font-size: 11px; letter-spacing: 1px; }
}
</style>
