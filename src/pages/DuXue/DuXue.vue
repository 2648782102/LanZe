<template>
  <!-- 笃学 -->
  <article>
    <el-main>
    <div class="car">
      <!-- 轮播图 -->
      <el-carousel indicator-position="none">
        <el-carousel-item v-for="item in 3" :key="item">
          <el-image class="carousel-image" src="" fit="fill" :lazy="true">
            <template #error>
              <div class="d-flex justify-content-center align-items-center w-100 h-100">
                <el-icon size="5rem" color="white"><Picture /></el-icon>
              </div>
            </template>
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
export default {
    name: 'DuXue'
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