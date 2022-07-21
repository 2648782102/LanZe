<template>
  <div v-loading="loading" class="body">
    <section class="sec col-10 col-xl-4" @click="TangShi"><p>唐诗三百首</p></section>
    <section class="sec col-10 col-xl-4" @click="SongCi"><p>宋词三百首</p></section>
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
        height: 90vh;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-around;
        align-items: center;
    }
    .sec {
      height: 30rem;
      background-color: #5b99af;
      display: flex;
      align-items: center;
      justify-content: center;
      writing-mode: vertical-lr;
      letter-spacing: 0.4rem;
      font-size: 3rem;
      color: white;
      cursor: pointer;
      border-radius: 0.5rem;
      text-shadow: 8px 8px 5px rgba(0, 0, 0, 0.3);
      transition: 0.6s;
      /* transform: rotateY(14deg) rotateX(-60deg) translateY(-1.4rem); */
      /* box-shadow: 5px 5px 5px rgba(174, 174, 174, 0.51); */
    }
    .sec:hover {
      transition: 0.4s;
      box-shadow: 1px 1px #3e3e3e, 4px 4px #3e3e3e, 3px 3px #3e3e3e, 4px 4px #3e3e3e, 5px 5px #3e3e3e, 6px 6px #3e3e3e, 7px 7px #3e3e3e, 8px 8px #3e3e3e;
    transform: translateX(-8px) translateY(-8px);
    }
</style>