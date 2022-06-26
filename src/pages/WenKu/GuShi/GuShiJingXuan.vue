<template>
  <section v-loading="loading" class="section1">
    <div class="chun" @click="chuciClick">
      <h1>楚辞</h1>
    </div>
    <div class="xia" @click="shijingClick">
      <h1>诗经</h1>
    </div>
    <div class="qiu">
      <h1>曹操诗集</h1>
    </div>
    <div class="dong">
      <h1>幽梦影</h1>
    </div>
  </section>
</template>

<script>
import axios from 'axios';
import { useRouter } from "vue-router";
import { ref } from 'vue'

export default {
    name: 'GuShiJingXuan',
    setup() {
      const $router = useRouter()

      // 加载控制
      let loading = ref(false)

      function chuciClick() {
        loading.value = true
        axios.get('https://lanze-node.vercel.app/api/chuci')
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

      function shijingClick() {
        loading.value = true
        axios.get('https://lanze-node.vercel.app/api/shijing')
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
        chuciClick,
        shijingClick,
        loading
      }
    }
}
</script>

<style scoped>
  * {
    box-sizing: border-box;
  }
  .section1 {
    width: 100%;
    min-height: 90vh;
    display: flex;
    justify-content: space-around;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
  }
  .section1>div {
    width: 42%;
    height: 36vh;
    background-color: rgba(187, 228, 244, 0.15);
    border-radius: 0.4rem;
    box-shadow:  1rem 1rem 1rem #d9d9d983,
             -1rem -1rem 2rem #ffffff80;
    background-position: 0 bottom;
    background-image: url(../../../assets/beijing/diwen.png);
    background-size: 10rem 13rem;
    background-repeat: no-repeat;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: 1s;
  }

  .section1>div:hover {
    transform: translateY(1.2rem) translateX(1rem);
    transition: 0.8s;
  }

  .section1>div>h1 {
    font-size: 4rem;
  }
  .chun {
    color: rgba(117, 241, 167, 0.901);
  }
  .chun:hover {
    box-shadow: 0 0 3px 3px rgba(117, 241, 167, 0.15);
    border: 1px solid rgba(117, 241, 167, 0.15);
  }
  .xia {
    color: rgb(10, 122, 57);
  }
  .xia:hover {
    box-shadow: 0 0 3px 3px rgba(10, 122, 57, 0.15);
    border: 1px solid rgba(10, 122, 57, 0.15);
  }
  .qiu {
    color: rgb(255, 145, 0);
  }
  .qiu:hover {
    box-shadow: 0 0 3px 3px rgba(255, 145, 0, 0.15);
    border: 1px solid rgba(255, 145, 0, 0.15);
  }
  .dong {
    color: rgb(198, 210, 207);
  }
  .dong:hover {
    box-shadow: 0 0 3px 3px rgba(198, 210, 207, 0.15);
    border: 1px solid rgba(198, 210, 207, 0.15);
  }
</style>