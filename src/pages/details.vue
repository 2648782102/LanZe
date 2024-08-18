<template>
  <!-- 详情页 -->
  <article>
    <el-row class="elrow pt-3 pb-3" :gutter="20" justify="center">
      <el-col class="bgwhite text-center p-3" :xs="22" :sm="22" :md="16" :lg="16" :xl="16" :offset="0">
        <p class="biaoTi">{{ title }}</p>
        <p>{{ author }}</p>
        <p class="tags-box" v-if="tags"><span class="tac" v-for="(item,index) in tags" :key="index">{{ item }}</span></p>
        <p class="content" v-for="(item,index) in paragraphs" :key="index">{{ item }}</p>
        <!-- <div class="title" v-show="title">
          <p v-for="(item,index) in title" :key="index">{{ item }}</p>
        </div> -->
      </el-col>
      <!-- <button @click="back" class="btn btn-primary fanhui">返回</button> -->
      <el-tooltip content="返回" placement="top" effect="dark">
        <lottie-player @click="back" class="fanhui" src="https://assets9.lottiefiles.com/packages/lf20_gigyrcoy.json"
          background="transparent" speed="1" loop autoplay></lottie-player>
      </el-tooltip>

    </el-row>
  </article>
</template>

<script>
  import { useRoute, useRouter } from "vue-router";
  import axios from 'axios';

  export default {
    name: 'details',
    setup() {

      const $route = useRoute()
      const $router = useRouter()
      let author = '无题';
      let tags = [];
      let paragraphs = [];
      let title = '无';
      // let title = null;

      // 接收传参
      let shici = JSON.parse($route.query.shici)

      console.log(shici);

      if (shici) {
        // 接收传值
        author = shici.author  // 作者
        tags = JSON.parse(shici.tags)  //  标签
        paragraphs = JSON.parse(shici.paragraphs)  // 正文
        title = shici.title  //  诗名
        // if (shici.title) {
        //   title = JSON.parse(shici.title)
        // }
      }
      // else {
      //     // 接收传值
      //     author = shici.author  // 作者
      //     category.push(shici.category)  //  类型
      //     content.push(shici.content)  // 正文
      //     origin = shici.origin  //  诗名
      // }

      function back() {
        $router.back()
      }

      return {
        author, tags, paragraphs, title,
        back,
      }
    }
  }
</script>

<style scoped>
  article {
    width: 100%;
    min-height: 700px;
    background-color: #dff2f4;
  }

  .biaoTi {
    font-family: piaoYiSong;
  }

  .elrow {
    width: 100%;
  }

  .el-col>p {
    position: relative;
    font-size: 1.5rem;
  }

  .el-col>p:nth-child(1) {
    font-size: 2.8rem;
    font-weight: 600;
    letter-spacing: 0.4rem;
    color: linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%);
  }

  .el-col>p:nth-child(2) {
    font-size: 1.4rem;
    font-weight: 600;
    color: #444444;
    letter-spacing: 0.2rem;
  }

  .el-col>p:nth-child(3) {
    font-size: 1rem;
    color: #878787;
  }

  .content {
    letter-spacing: 0.1rem;
    font-family: hongLei;
  }

  .fanhui {
    width: 7rem;
    height: 7rem;
    position: fixed;
    bottom: 14%;
    right: 7%;
    cursor: pointer;
  }

  .title {
    text-align: left;
    color: rgb(104, 107, 110);
    font-size: 0.8rem;
    margin-top: 3rem;
  }

  .tags-box span {
    margin-left: 1rem;
    margin-right: 1rem;
  }

</style>