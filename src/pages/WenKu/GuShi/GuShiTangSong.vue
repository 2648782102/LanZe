<template>
  <div v-loading="loading" class="body">
    <section class="img-bg img-bg2" @click="TangShi"><p>唐诗三百首</p></section>
    <section class="img-bg img-bg1" @click="SongCi"><p>宋词三百首</p></section>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import axios from "axios";
import { ref } from 'vue'

export default {
    name: 'GuShiTangSong',
    setup() {
      const $router = useRouter()

      // 加载控制
      let loading = ref(false)

      function TangShi() {
        loading.value = true
        axios.get('https://lanze-node.vercel.app/api/tangshi300')
        .then(response => {
          loading.value = false
          // response.data[0].author:诗名   response.data[0].paragraphs:诗集   response.data[0].rhythmic:作者
          // response.data[0].tags:正文
          let chuciArr = JSON.stringify(response.data)
          $router.push({
            name:'searchul',
            query:{
              ulArr:chuciArr
            }
          })
        })
        .catch(function(error) {
          console.log(error);
        })
      }

      function SongCi() {
        loading.value = true
        axios.get('https://lanze-node.vercel.app/api/songci300')
        .then(response => {
          loading.value = false
          // response.data[0].author:诗名   response.data[0].paragraphs:诗集   response.data[0].rhythmic:作者
          // response.data[0].tags:正文
          let chuciArr = JSON.stringify(response.data)
          $router.push({
            name:'searchul',
            query:{
              ulArr:chuciArr
            }
          })
        })
        .catch(function(error) {
          console.log(error);
        })
      }

      return {
        TangShi,
        SongCi,
        loading
      }
    }
}
</script>

<style scoped>
 .body {
        width: 100%;
        min-height: 80vh;
        display: flex;
        /* padding: 0 5rem; */
        justify-content: space-around;
        align-items: center;
        perspective: 2000px;
        position: relative;
    }
    .img-bg {
      position: relative;
      width: 25rem;
      height: 34rem;
      background-image: url(../../../assets/beijing/huabian.png);
      background-size: 100% 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      writing-mode: vertical-lr;
      letter-spacing: 0.4rem;
      font-size: 2rem;
      cursor: pointer;
      transition: 0.6s;
      /* transform: rotateY(14deg) rotateX(-60deg) translateY(-1.4rem); */
      /* box-shadow: 5px 5px 5px rgba(174, 174, 174, 0.51); */
    }
    .img-bg:hover {
      text-shadow: 8px 8px 5px rgba(0, 0, 0, 0.3);
      transition: 0.5s;
    }
    @keyframes imgbg {
      from {
        transform: translateY(0);
      }
      to {
        transform: translateY(-1.6rem);
      }
    }
</style>