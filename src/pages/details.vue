<template>
  <!-- 详情页 -->
  <article>
    <el-row class="elrow pt-3 pb-3" :gutter="20" justify="center">
      <el-col class="bgwhite text-center p-3" :xs="22" :sm="22" :md="16" :lg="16" :xl="16" :offset="0">
        <p class="biaoTi">{{ details.title }}</p>
        <p>{{ details.author }}</p>
        <p class="tags-box" v-if="details.tags.length"><span class="tac" v-for="(item,index) in details.tags" :key="index">{{ item }}</span></p>
        <p class="content" v-for="(item,index) in details.paragraphs" :key="index">{{ item }}</p>
        <div class="title" v-if="details.annotation.length">
          <p v-for="(item,index) in details.annotation" :key="index">{{ item }}</p>
        </div>
      </el-col>
      <!-- <button @click="back" class="btn btn-primary fanhui">返回</button> -->
      <el-tooltip content="返回" placement="top" effect="dark">
        <lottie-player @click="back" @keyup.enter="back" role="button" tabindex="0" aria-label="返回上一页"
          class="fanhui" :src="animationSource"
          background="transparent" speed="1" loop autoplay></lottie-player>
      </el-tooltip>

    </el-row>
  </article>
</template>

<script>
  import { computed } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { normalizeDetails, parseJsonObject } from "../utils/poemQuery.js";
  import fanHui from "../assets/lottieJSON/fanHui.json";
  import { useLottieSource } from "../composables/useLottieSource.js";

  export default {
    name: 'details',
    setup() {

      const $route = useRoute()
      const $router = useRouter()
      const animationSource = useLottieSource(fanHui);
      const details = computed(() =>
        normalizeDetails(parseJsonObject($route.query.shici, {})),
      );

      function back() {
        $router.back()
      }

      return {
        details,
        animationSource,
        back,
      }
    }
  }
</script>

<style scoped>
  article {
    width: 100%;
    min-height: 700px;
    padding: 48px 20px;
    background:
      radial-gradient(circle at 50% 0%, rgba(255,255,255,.55), transparent 45%),
      var(--paper);
  }

  .biaoTi {
    font-family: var(--font-display);
  }

  .elrow {
    width: 100%;
    margin: 0;
  }

  .el-col>p {
    position: relative;
    font-size: 1.15rem;
  }

  .el-col>p:nth-child(1) {
    margin-bottom: 0.5rem;
    font-size: 2.6rem;
    font-family: var(--font-display);
    font-weight: 400;
    letter-spacing: 8px;
    color: var(--jade-deep);
  }

  .el-col>p:nth-child(2) {
    font-size: 1rem;
    color: var(--ink-soft);
    letter-spacing: 4px;
  }

  .el-col>p:nth-child(3) {
    font-size: 1rem;
    color: #878787;
  }

  .content {
    margin: 0.8rem 0;
    color: var(--ink);
    font-size: 1.25rem;
    letter-spacing: 3px;
    line-height: 2.2;
    font-family: var(--font-display);
  }

  .fanhui {
    width: 4.5rem;
    height: 4.5rem;
    position: fixed;
    bottom: 9%;
    right: 5%;
    cursor: pointer;
  }

  .title {
    text-align: left;
    color: var(--ink-soft);
    font-size: 0.85rem;
    margin-top: 2.5rem;
    padding-top: 1.2rem;
    border-top: 1px solid var(--rule);
  }

  .tags-box span {
    display: inline-block;
    margin: 0 0.4rem;
    padding: 2px 8px;
    border: 1px solid var(--rule);
    color: var(--jade);
    font-size: 0.75rem;
  }

</style>
