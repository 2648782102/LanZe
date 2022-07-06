<template>
    <section v-loading="loading" class="section1">
        <div class="lunyu" @click="lunyuClick">
          <h1>论语</h1>
        </div>
        <div class="keben">
            <h1>课本<br/><span class="ps-5">诗集</span></h1>
        </div>
        <div class="sishu">
          <h1>四书<br/><span class="ps-5">五经</span></h1>
        </div>
        <div class="meng">
          <h1>蒙学</h1>
        </div>
      </section>
  </template>
  
  <script>
import axios from 'axios'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

  export default {
      name: 'GuShiJiaoYu',
      setup() {
        const $router = useRouter()

        // 加载控制
        let loading = ref(false)

        function lunyuClick() {
            loading.value = true
            axios.get('https://lanze-node.vercel.app/api/lunyu')
            .then(response => {
                loading.value = false
                let Arr = JSON.stringify(response.data)
                $router.push({
                name: 'searchul',
                query:{
                    ulArr:Arr
                }
            })
            })
            .catch(function(error) {
                console.log(error)
            })
        }
        
        return {
            lunyuClick,
            loading
        }
      }
  }
  </script>
  
  <style scoped>
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
    transition: 0.8s;
    overflow: hidden;
    text-shadow: 8px 8px 5px rgba(0, 0, 0, 0.3);
  }

  .section1>div:hover {
    transition: 0.6s;
    box-shadow:  1rem 1rem 1.6rem #c3c3c3b4,
                1rem 1rem 1.6rem #ffffff;
  }

  .section1>div>h1 {
    font-size: 4rem;
  }

  </style>