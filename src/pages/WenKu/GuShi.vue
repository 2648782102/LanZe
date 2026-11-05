<template>
  <!-- 古诗类 -->
  <article v-loading="loading">
    <el-row :gutter="30" justify="space-evenly">
      <el-col
        :xs="20"
        :sm="12"
        :md="8"
        :lg="6"
        :xl="6"
        v-for="(item, index) in carArr"
        :key="index"
        class="el-col"
        :span="6"
      >
        <el-card class="elCard" @click="asyncFunc(item.to)" @keyup.enter="asyncFunc(item.to)"
          role="button" tabindex="0" :aria-label="`查看${item.title}`" shadow="hover"
          :body-style="{ padding: '0px' }">
          <img
            :src="item.imgSrc"
            class="image"
          />
          <div class="car-div">
            <h1>{{ item.title }}</h1>
            <p>作者或主要人物：{{ item.author }}</p>
            <p>时期：{{ item.age }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

  </article>
</template>

<script>
import "element-plus/theme-chalk/display.css";
import { reactive,ref } from "vue";
import { useRouter } from "vue-router";
import chuci1 from "../../assets/beijing/chuci1.jpg";
import shijing1 from "../../assets/beijing/shijing1.jpg";
import songci300 from "../../assets/beijing/songci300.jpg";
import caocao from "../../assets/beijing/caocao.jpg";
import tangshi300 from "../../assets/beijing/tangshi300.jpg";
import { ElMessage } from "element-plus/es/components/message/index.mjs";
import { PoetryClass } from "../../apis/api/list.js";
import { normalizeListResponse } from "../../utils/response.js";


export default {
  name: "GuShi",
  setup() {
    let $router = useRouter()

    let carArr = reactive([
      {
        title: "楚辞",
        author: "屈原",
        age: "战国",
        imgSrc: chuci1,
        to:'chuci'
      },
      {
        title: "诗经",
        author: "佚名",
        age: "西周初至春秋中叶",
        imgSrc: shijing1,
        to:'shijing'
      },
      {
        title: "曹操诗集",
        author: "曹操",
        age: "东汉末",
        imgSrc: caocao,
        to:'caocao'
      },
      {
        title: "唐诗三百",
        author: "李白 杜甫...",
        age: "唐",
        imgSrc: tangshi300,
        to:1
      },
      {
        title: "宋词三百",
        author: "苏轼 李清照...",
        age: "宋",
        imgSrc: songci300,
        to:2
      },
    ]);

    // 加载控制
      let loading = ref(false)

    async function asyncFunc(type) {
      loading.value = true;
      try {
        const response = await PoetryClass({ type });
        const poems = normalizeListResponse(response, []);
        await $router.push({
          name: "searchul",
          query: { ulArr: JSON.stringify(poems) },
        });
      } catch (error) {
        ElMessage({ message: error?.message || "分类加载失败", type: "warning" });
      } finally {
        loading.value = false;
      }
    }

    return {
      carArr,
      asyncFunc,
      loading
    };
  },
};
</script>

<style scoped>
article {
  padding: 20px 20px 0 20px;
}

.gushi-tabs {
  width: 100%;
  height: 100%;
}
.el-tabs__nav > div > div {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.el-tabs__item {
  height: 4rem;
  width: 100%;
}

.elCard {
  cursor: pointer;
}

.image {
  width: 100%;
  height: 300px;
  display: block;
}

.el-col {
  margin-bottom: 20px;
}

.car-div {
  width: 100%;
  height: 100%;
  padding: 20px;
}

.car-div > p {
  font-size: 0.8rem;
  color: rgb(105, 105, 105);
  margin: 0;
}
</style>
