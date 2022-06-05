<template>
<!-- 茶社 -->
  <article class="mt-3 mb-3">
  <el-row class="elrow" justify="center">
    <!-- 走马灯轮播图 -->
    <el-carousel height="15rem" class="col-11 col-md-9" :interval="4000" type="card">
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
      <!-- 下方分栏 -->
    <div class="col-11 col-md-9 bgwhite">
        <el-menu default-active="jingxuan" mode="horizontal" @select="handleSelect" router>
          <el-menu-item class="col-2" index="jingxuan">精选诗文</el-menu-item>
          <el-menu-item class="col-2" index="fengya">风俗雅文</el-menu-item>
          <el-menu-item class="col-2" index="feihua">飞花接龙</el-menu-item>
          <el-menu-item class="col-2" index="xiandai">现代诗歌</el-menu-item>
        </el-menu>
      <div class="dox-box mt-2">
        <!-- 主体部分 -->
      <div>
        <router-view></router-view>
      </div>
    </div>
    </div>
  </el-row>
  </article>
</template>

<script>
  export default {
    name: 'ChaShe'
  }
</script>

<style scoped>
  * {
    box-sizing: border-box;
  }

  .carousel-image {
    width: 100%;
    height: 100%;
  }

  .el-carousel__item:nth-child(2n) {
    background-color: #99a9bf;
  }

  .el-carousel__item:nth-child(2n + 1) {
    background-color: #d3dce6;
  }

  .elrow {
    width: 100%;
  }

  .el-menu {
    height: 2.4rem;
    font-size: 1rem;
  }

  .dox-box {
    min-height: 100vh;
  }
</style>