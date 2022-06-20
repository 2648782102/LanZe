<template>
  <button class="btn btn-success" @click="TangShi">唐诗三百首</button>
  <button class="btn btn-success" @click="SongCi">宋词三百首</button>
</template>

<script>
import { useRouter } from "vue-router";
import axios from "axios";

export default {
    name: 'GuShiTangSong',
    setup() {
      const $router = useRouter()

      function TangShi() {
        axios.get('http://192.168.44.1:3000/api/GuShiCiApi/TangShi.php')
        .then(response => {
          // response.data[0][0].author:诗名   response.data[0][0].paragraphs:诗集   response.data[0][0].rhythmic:作者
          // response.data[0][0].tags:正文
          let chuciArr = JSON.stringify(response.data[0])
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
        axios.get('http://192.168.44.1:3000/api/GuShiCiApi/SongCi.php')
        .then(response => {
          // response.data[0][0].author:诗名   response.data[0][0].paragraphs:诗集   response.data[0][0].rhythmic:作者
          // response.data[0][0].tags:正文
          let chuciArr = JSON.stringify(response.data[0])
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
        SongCi
      }
    }
}
</script>

<style scoped>

</style>