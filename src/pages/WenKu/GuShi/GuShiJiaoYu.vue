<template>
    <div v-loading="loading" class="body">
        <button class="btn btn-primary" @click="lunyuClick">论语</button>
        <button class="btn btn-primary">四书五经</button>
        <button class="btn btn-primary">蒙学</button>
        <button class="btn btn-primary">蒙学</button>
    </div>
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
    .body {
        width: 100%;
        min-height: 80vh;
    }
  </style>