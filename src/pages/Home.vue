<template>
  <Vue3Lottie v-show="isLottie" class="lottie hidden-sm-and-down" ref="demoRefHua" :animationData="qieHuan" :loop="1"
    height="240vh" width="240vh" :autoPlay="false" />
  <article>
    <section>
      <el-container>
        <!-- 大屏幕显示为顶部导航栏 -->
        <el-header style="padding: 0" class="hidden-sm-and-down tab-top">
          <el-affix :offset="0">
            <el-menu router default-active="/zhailu" class="el-menu-demo" active-text-color='#5b99af' mode="horizontal">
              <!-- 网站logo -->
              <el-col :span="2" :offset="0" class="log-col">
                <el-image @click="$router.push({ name: 'home' })" class="logo-img" :src="logoUrl" fit="fill" lazy
                  aria-label="返回兰泽诗词首页" role="button">
                </el-image>
              </el-col>
              <el-col :span="15" :offset="0" class="input-col">
                <!-- 搜索框 -->
                <el-input id="home-search-desktop" @focus="elinput1focus = true" @blur="elinput1focus = false"
                  class="me-2 elinput1" :class="elinput1focus ? 'elinput1focus' : ''" v-model="inputS"
                  placeholder="搜索诗词" prefix-icon="Search" clearable @keyup.enter="inputEnter"
                  aria-label="搜索诗词，按回车提交" />
              </el-col>
              <!-- 右侧导航 -->
              <el-menu-item index="/zhailu">涉猎</el-menu-item>
              <el-menu-item index="/wenku">文库</el-menu-item>
              <el-menu-item index="/chalou">茶楼</el-menu-item>
              <el-menu-item index="/duxue">笃学</el-menu-item>
              <!-- 个人中心下拉菜单 -->
              <el-sub-menu index="4">
                <template #title>个人中心</template>
                <el-menu-item index="personalziLiao">个人资料</el-menu-item>
                <el-menu-item index="favorite">收藏</el-menu-item>
                <el-menu-item index="samplereels">作品</el-menu-item>
                <el-menu-item index="shezhi">设置</el-menu-item>
              </el-sub-menu>
            </el-menu>
          </el-affix>
        </el-header>
        <!-- 小屏幕显示为底部导航栏 -->
        <div class="min-tap-top hidden-md-and-up">
          <el-input id="home-search-mobile" @focus="elinput1focus = true" @blur="elinput1focus = false"
            class="me-2 elinput1" :class="elinput1focus ? 'elinput1focus' : ''" v-model="inputS"
            placeholder="搜索诗词" prefix-icon="Search" clearable @keyup.enter="inputEnter"
            aria-label="搜索诗词，按回车提交" />
          <el-image @click="$router.push({ name: 'home' })" class="logo-img" :src="logoUrl" fit="fill" lazy
            aria-label="返回兰泽诗词首页" role="button">
          </el-image>
        </div>
        <div class="min-tab-bottom hidden-md-and-up">
          <div class="tab-bottom-box">
            <div>
              <router-link active-class="bottom-active" :to="{name: 'chalou'}" aria-label="前往茶楼">
                <div class="box-i"><i class="fas fa-coffee tab-i"></i>
                  <p>茶楼</p>
                </div>
              </router-link>
            </div>
            <div>
              <router-link active-class="bottom-active" :to="{name: 'wenku'}" aria-label="前往文库">
                <div class="box-i"><i class="fas fa-book tab-i"></i>
                  <p>文库</p>
                </div>
              </router-link>
            </div>
            <div>
              <router-link active-class="bottom-active" :to="{name: 'zhailu'}" aria-label="前往涉猎">
                <div class="box-i"><i class="fas fa-chalkboard-teacher tab-i"></i>
                  <p>涉猎</p>
                </div>
              </router-link>
            </div>
            <div>
              <router-link active-class="bottom-active" :to="{name: 'duxue'}" aria-label="前往笃学">
                <div class="box-i"><i class="fas fa-pen-fancy tab-i"></i>
                  <p>笃学</p>
                </div>
              </router-link>
            </div>
            <div>
              <router-link active-class="bottom-active" :to="{name: 'personal'}" aria-label="前往个人中心">
                <div class="box-i"><i class="fas fa-user-alt tab-i"></i>
                  <p>中心</p>
                </div>
              </router-link>
            </div>
          </div>
        </div>
        <section class="section-main">
          <el-scrollbar ref="scrollbarRef" height="100vh" aria-label="页面内容滚动区域">
            <!-- 主体部分 -->
            <main id="main" v-loading="loading">
              <router-view></router-view>
            </main>
            <!-- 底部 -->
            <el-footer class="footer mt-2">
              <el-row justify="center">
                <el-col class="footerCol" :span="24" :offset="0">
                  <div class="foot-h5 pt-2">
                    <h5>Copyright &copy; 2022 lan-ze&nbsp;</h5>
                    <h5>All Rights Reserved</h5>
                  </div>
                  <p>本站仅供学习交流使用</p>
                </el-col>
              </el-row>
            </el-footer>
          </el-scrollbar>
        </section>
      </el-container>
    </section>
    <Audio class="Aud hidden-sm-and-down" />
  </article>
</template>

<script>
  import { ref, watch, onBeforeUnmount } from "vue";
  import logo from "../assets/logo.png";
  import { useRouter } from "vue-router";
  import { ElMessage } from "element-plus";
  import qieHuan from "../assets/lottieJSON/qieHuan.json";
  import { Vue3Lottie } from "vue3-lottie";
  import Audio from "./Audio.vue";
  import { searchList } from "../apis/api/list.js";
  import { useRouteTransition } from "../composables/useRouteTransition.js";
  import { normalizeListResponse } from "../utils/response.js";

  export default {
    name: "Home",
    components: {
      Vue3Lottie,
      Audio
    },
    setup() {

      // 路由器
      const $router = useRouter();
      // 搜索框model
      let inputS = ref("");

      const scrollbarRef = ref()
      const { transitionActive, start: startTransition, stop: stopTransition } = useRouteTransition();

      // 加载控制
      let loading = ref(false);
      // 发送请求返回根据输入框内容搜索到的内容
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
          await $router.push({
            name: "searchul",
            query: { ulArr: JSON.stringify(searchData), keyword },
          });
          ElMessage({
            message: searchData.length ? "搜索成功!" : "没有匹配结果，已展示推荐内容",
            type: searchData.length ? "success" : "info",
          });
          inputS.value = "";
        } catch (error) {
          ElMessage({ message: error?.message || "搜索失败，请稍后重试", type: "error" });
        } finally {
          loading.value = false;
        }
      }

      // logo图片
      let logoUrl = logo;
      // 搜索框状态，聚焦/失焦
      let elinput1focus = ref(false);

      // 页面切换动画效果
      let isLottie = transitionActive;
      let demoRefHua = ref(null);

      const resetScroll = () => {
        scrollbarRef.value?.setScrollTop?.(0);
      };

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
        inputS,
        logoUrl,
        elinput1focus,
        inputEnter,
        loading,
        qieHuan,
        demoRefHua,
        isLottie,
        scrollbarRef
      };
    },
  };
</script>

<style scoped>
  * {
    box-sizing: border-box;
  }

  #main {
    position: relative;
  }

  .lottie {
    position: absolute;
    top: 0;
    z-index: 10;
  }

  article {
    display: flex;
    justify-content: center;
    /* background-color: #5b99af; */
  }

  section {
    width: 100%;
  }

  .tab-top {
    box-shadow: 0 5px 5px rgba(0, 0, 0, 0.05);
    z-index: 3;
  }

  /* 小屏幕顶部 */
  .min-tap-top {
    width: 100%;
    height: 40px;
    background-color: white;
    box-shadow: 0 2px 2px 2px rgba(92, 92, 92, 0.293);
    z-index: 10;
    padding-left: 10px;
    padding-right: 10px;
    padding: 5px;
    display: flex;
    justify-content: space-between;
  }

  /* 小屏幕底部导航栏 */
  .min-tab-bottom {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 80px;
    background-color: white;
    border-radius: 20px 20px 0 0;
    box-shadow: 0 -2px 2px 2px rgba(126, 126, 127, 0.293);
    z-index: 20;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .tab-bottom-box {
    width: 100%;
    height: 60%;
    display: flex;
    justify-content: space-around;
    align-items: center;
  }

  .tab-bottom-box>div {
    width: 56px;
    height: 56px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: FangZhengSong;
  }

  .tab-bottom-box a {
    text-decoration: none;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .tab-bottom-box a:not(.bottom-active) {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 54px;
    height: 54px;
    color: rgba(36, 36, 38, 0.7);
    border-radius: 50%;
    border-radius: 50px;
    transition: 0.4s;
  }

  .bottom-active {
    width: 100%;
    height: 100%;
    color: black;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background: linear-gradient(145deg, #ffffff, #e6e6e6);
    box-shadow: 6px 6px 12px #dedede,
      -6px -6px 12px #ffffff;
    transition: 0.3s;
  }

  .box-i {
    width: 80%;
    height: 80%;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    padding: 6px;
    font-size: 20px;
  }

  .box-i p {
    font-size: 8px;
  }

  .log-col {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .input-col {
    display: flex;
    align-items: center;
  }

  .logo-img {
    width: 2rem;
    height: 2rem;
    cursor: pointer;
  }

  .elinput1 {
    transition: width 0.5s ease-in-out;
    width: 8.4rem;
  }

  .elinput1focus {
    width: 16rem;
  }

  .el-menu-demo {
    /* box-shadow: 0 5px 8px rgba(205, 219, 221, 0.392); */
    background-color: rgba(255, 255, 255, 0);
    border: none;
    font-family: maoKen;
  }

  .footer {
    box-shadow: 0 0 2px 6px #2c3a47e2;
    min-height: 140px;
    padding: 10px;
    background-color: #2C3A47;
    /* background-image: linear-gradient(#5b99af, #000000); */
    /* background-color: rgba(255, 255, 255, 0.9); */
    color: white;
    margin-bottom: 18px;
  }

  .footerCol {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .foot-h5 {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
  }

  .foot-h5>h5 {
    font-size: 0.8rem;
  }
</style>
