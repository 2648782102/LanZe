<template>
  <article>
    <h1>{{ title }}</h1>
    <h2>作者&代表人物: {{ author }}</h2>
    <h3>年代：{{ age }}</h3>
    <h3>简介: {{ synopsis }}</h3>
    <button v-loading="loading" class="btn-go" @click="goClick" :aria-label="address?'开始鉴赏':'未添加'" v-text="address?'开始鉴赏':'未添加'"></button>
  </article>
</template>

<script>
  import { ref } from "vue";
  import { useRouter } from "vue-router";
import { ElMessage } from "element-plus/es/components/message/index.mjs";
  import { PoetryCollection } from "../apis/api/list.js";
  import { normalizeListResponse } from "../utils/response.js";

  export default {
    name: 'GuShiDiv',
    props: ['title', 'author', 'age', 'synopsis', 'address'],
    setup(props) {

      const $router = useRouter()

      // 加载控制
      let loading = ref(false)

      async function asyncFunc() {
        if (!props.address) {
          ElMessage({ message: "未添加此分栏，请等待更新！", type: "info" });
          return;
        }
        loading.value = true;
        try {
          const response = await PoetryCollection({ address: props.address });
          const poems = normalizeListResponse(response, []);
          await $router.push({
            name: "searchul",
            query: { ulArr: JSON.stringify(poems) },
          });
        } catch (error) {
          ElMessage({ message: error?.message || "诗集加载失败", type: "warning" });
        } finally {
          loading.value = false;
        }
      }

      // 单击鉴赏按钮
      function goClick() { return asyncFunc(); }

      return {
        goClick,
        loading
      }
    }

  }
</script>

<style scoped>
  article {
    position: relative;
    width: 100%;
    height: 100%;
    font-family: FangZhengSong;
    color: rgb(255, 255, 255);
    border-radius: 0.4rem;
    background-position: 0 bottom;
    background-repeat: no-repeat;
    cursor: pointer;
    transition: 0.6s;
    overflow: hidden;
    text-shadow: 8px 8px 5px rgba(0, 0, 0, 0.2);
    padding: 40px;
    /* background-image: url(../assets/beijing/k.webp);
    background-size: 100% 130%; */
    /* background-image: linear-gradient(to top, #30cfd0 0%, #330867 100%); */
    background-image: linear-gradient(15deg, #13547a 0%, #80d0c7 100%);
  }

  article>h1 {
    font-size: 4rem;
  }

  .btn-go {
    border: none;
    width: 10rem;
    height: 5rem;
    font-size: 1.4rem;
    font-family: FangZhengSong;
    color: white;
    border-radius: 19px;
    background-color: rgba(255, 255, 255, 0.249);
    box-shadow: 0.3rem 0.3rem 0.5rem rgba(0, 0, 0, 0.3);
    position: absolute;
    bottom: 3rem;
    right: 3rem;
    overflow: hidden;
    transition: 0.6s;
  }
  .btn-go:hover {
      transition: 0.8s;
      box-shadow: -0.2rem -0.2rem 0.2rem rgba(0, 0, 0, 0.3);
  }
</style>
