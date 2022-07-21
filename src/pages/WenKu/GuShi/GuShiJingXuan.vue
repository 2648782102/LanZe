<template>
  <section v-loading="loading" class="section1">
    <div class="chun" @click="chuciClick">
      <h1>楚辞</h1>
    </div>
    <div class="xia" @click="shijingClick">
      <h1>诗经</h1>
    </div>
    <div class="qiu">
      <h1>曹操<br/><span class="ps-5">诗集</span></h1>
    </div>
    <div class="dong">
      <h1>论语</h1>
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
              name: 'searchul',
              query: {
                ulArr: chuciArr
              }
            })
          })
          .catch(function (error) {
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
              name: 'searchul',
              query: {
                ulArr: chuciArr
              }
            })
          })
          .catch(function (error) {
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
    background-color: #5b99af;
    color: white;
    border-radius: 0.4rem;
    background-position: 0 bottom;
    /* background-image: url(../../../assets/beijing/diwen.png); */
    background-repeat: no-repeat;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: 0.6s;
    overflow: hidden;
  }

  .section1>div:hover {
    transition: 0.4s;
    box-shadow: 1px 1px #3e3e3e, 2px 2px #3e3e3e, 3px 3px #3e3e3e, 4px 4px #3e3e3e, 5px 5px #3e3e3e, 6px 6px #3e3e3e, 7px 7px #3e3e3e, 8px 8px #3e3e3e;
    transform: translateX(-8px) translateY(-8px);
  }

  .section1>div>h1 {
    font-size: 4rem;
  }

</style>