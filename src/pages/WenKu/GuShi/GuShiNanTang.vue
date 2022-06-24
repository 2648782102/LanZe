<template>
    <div v-loading="loading" class="body">
        <button class="btn btn-info" @click="nantangClick">南唐二主词</button>
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
    }
  </style>