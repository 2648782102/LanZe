<template>
<!-- 文库栏 -->
  <article>
    <el-main>
    <el-row justify="center">
    <el-col class="bgwhite elcol1" :span="24" :offset="0">
      <!-- 左侧古诗/古词卡片，具有切换功能 -->
      <div class="tab-left">
        <router-link :to="{name: 'gushi'}">古诗</router-link>
        <router-link :to="{name: 'guci'}">古词</router-link>
      </div>
      <!-- 主体 -->
      <div class="col-9 col-md-10"> 
        <router-view></router-view>
      </div>
    </el-col>
    </el-row>
    </el-main>
</article>
</template>

<script>
// import { ref } from 'vue'
export default {
    name: 'WenKu',
    setup() {
    }
}
</script>

<style scoped>
    .tab-left {
      width: 7rem;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      margin-right: 1rem;
      margin-left: 1rem;
    }
    .tab-left>a {
      width: 7rem;
      height: 46vh;
      border-radius: 1rem;
      background: #ffffff;
      box-shadow:  5px 5px 10px #b2cbd73b,
             -5px -5px 10px #c4e1ed51;
    }
    .elcol1 {
      display:flex;
      min-height:100vh;
    }
</style>