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
          <img src="../../assets/beijing/yulong.png" alt="">
        </router-link>
        <router-link style="position: relative;" :to="{name: 'guci'}">
          <h1>古 词</h1>
          <img src="../../assets/beijing/yulong.png" alt="">
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
      justify-content: space-around;
      margin-right: 1rem;
      margin-left: 1rem;
    }
    .tab-left>a {
      width: 7rem;
      height: 45%;
      border-radius: 1rem;
      background: #ffffff;
      box-shadow:  5px 5px 10px #b2cbd73b,
             -5px -5px 10px #c4e1ed51;
             display: flex;
             flex-direction: column;
             align-items: center;
             text-decoration: none;
    }
    .tab-left img {
      width: 80%;
      position: absolute;
      bottom: 0;
    }
    .tab-left h1 {
      writing-mode: vertical-lr;
      color: black;
      margin-top: 20%;
      font-size: 2.4rem;
    }
    .elcol1 {
      display:flex;
      min-height:100vh;
    }
</style>