<template>
  <!-- 笃学 -->
  <article>
    <el-main>
    <div class="car">
      <!-- 轮播图 -->
      <el-carousel height='20rem' indicator-position="none">
        <el-carousel-item v-for="item in imgArr" :key="item">
          <el-image class="carousel-image" :src="item">
          </el-image>
        </el-carousel-item>
      </el-carousel>
    </div>
    <!-- 下方分栏 -->
    <el-row justify="center">
    <div class="col-12 col-md-9 mt-3 dox bgwhite">
        <div>
          <el-tabs type="card" style="width: 100%" class="gushi-tabs">
            <el-tab-pane label="我的笔记">我的笔记</el-tab-pane>
            <el-tab-pane label="我的默写">我的默写</el-tab-pane>
            <el-tab-pane label="学习日记">学习日记</el-tab-pane>
            <el-tab-pane label="灵光一现">灵光一现</el-tab-pane>
            </el-tabs>
        </div>
      </div>
    </el-row>
  </el-main>
  </article>
</template>

<script>
  import { ref } from "vue";
  import webpa from "../../assets/LunBo/1.webp";
  import webpb from "../../assets/LunBo/2.webp";
  import webpc from "../../assets/LunBo/4.webp";

export default {
    name: 'DuXue',
    setup() {
      let imgArr = ref([
        webpa,
        webpb,
        webpc
      ])

      return {
        imgArr
      }
    }
}
</script>

<style scoped>
  .carousel-image {
    width: 100%;
    height: 100%;
  }
    .car>.el-carousel {
      background-color: rgb(213, 217, 224);
      border-radius: 0.3rem;
    }
    .dox {
      min-height: 100vh;
    }
</style>