<template>
    <button class="btn btn-primary" @click="lunyuClick">论语</button>
    <button class="btn btn-primary">四书五经</button>
    <button class="btn btn-primary">蒙学</button>
  </template>
  
  <script>
import axios from 'axios'
import { useRouter } from 'vue-router'

  export default {
      name: 'GuShiJiaoYu',
      setup() {
        const $router = useRouter()

        function lunyuClick() {
            axios.get('http://192.168.44.1:3000/api/GuShiCiApi/LunYu.php')
            .then(response => {
                console.log(response.data[0])
                let Arr = JSON.stringify(response.data[0])
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
            lunyuClick
        }
      }
  }
  </script>
  
  <style scoped>
  
  </style>