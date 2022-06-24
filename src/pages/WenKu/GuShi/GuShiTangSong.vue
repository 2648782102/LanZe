<template>
  <div v-loading="loading" class="body">
    <button class="btn btn-success" @click="TangShi">唐诗三百首</button>
    <button class="btn btn-success" @click="SongCi">宋词三百首</button>
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
    }
</style>