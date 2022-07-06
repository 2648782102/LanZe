<template>
    <div v-loading="loading" class="body">
        <button class="btnYuan" @click="nantangClick">南唐二主词</button>
    </div>
  </template>
  
  <script>
import axios from 'axios'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

  export default {
      name: 'GuShiNanTang',
      setup() {
        const $router = useRouter()

        // 加载控制
        let loading = ref(false)

            function nantangClick() {
            loading.value = true
            axios.get('https://lanze-node.vercel.app/api/nantang')
            .then(response => {
                loading.value = false
                let chuciArr = JSON.stringify(response.data)
                $router.push({
                    name: 'searchul',
                    query:{
                        ulArr:chuciArr
                    }
                })
            })
            .catch(function(error) {
                console.log(error)
            })
            }

            return {
                nantangClick,
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
        align-items: center;
        justify-content: center;
    }
    .btnYuan {
        width: 400px;
        height: 200px;
        border: none;
        color: #5b99af;
        font-weight: 600;
        font-size: 3rem;
        border-radius: 50px;
        background-color: white;
        background: linear-gradient(145deg, #e6e6e6, #ffffff);
        box-shadow: 20px 20px 60px #d9d9d9,
            -20px -20px 60px #ffffff;
    }
  </style>