<template>
<!-- 文库栏 -->
  <article>
    <el-main>
    <el-row justify="center">
    <el-col class="bgwhite elcol1" :span="24" :offset="0">
      <!-- 左侧古诗/古词卡片，具有切换功能 -->
      <div class="tab-left">
        <router-link style="position: relative;" :to="{name: 'gushi'}">
          <h1>古 诗</h1>
          <!-- <img class="imgshi" src="../../assets/beijing/yulong.png" alt=""> -->
        </router-link>
        <router-link style="position: relative;" :to="{name: 'guci'}">
          <h1>古 词</h1>
          <!-- <img class="imgci" src="../../assets/beijing/yulong.png" alt=""> -->
        </router-link>
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
      margin-right: 1rem;
      margin-left: 1rem;
    }
    .tab-left>a {
      position: relative;
      width: 7rem;
      height: 18rem;
    }

    .tab-left>a:hover h1{
      transform: rotateY(26deg);
      transition: 0.7s;
      text-shadow: -8px 3px 3px rgba(0, 0, 0, 0.304);
    }

    .tab-left>a::after {
      content: '';
      width: 200%;
      height: 18rem;
      background-image: url(../../assets/beijing/huabian.png);
      background-size: 100% 100%;
      position: absolute;
      top: -4%;
      left: -44%;
    }
    .tab-left img {
      width: 80%;
      position: absolute;
      bottom: 0;
    }

    .tab-left h1 {
      writing-mode: vertical-lr;
      color: black;
      font-size: 2.4rem;
      position: absolute;
      top: 5rem;
      left: -3.2rem;
      transition: 1.5s;
      z-index: 8;
    }
    .elcol1 {
      display:flex;
      min-height:100vh;
      padding-top: 2rem;
    }
</style>