<template>
    <button class="btn btn-info" @click="nantangClick">南唐二主词</button>
  </template>
  
  <script>
import axios from 'axios'
import { useRouter } from 'vue-router'
  export default {
      name: 'GuShiNanTang',
      setup() {
        const $router = useRouter()

            function nantangClick() {
            axios.get('http://192.168.44.1:3000/api/GuShiCiApi/NanTang.php')
            .then(response => {
                let chuciArr = JSON.stringify(response.data[0])
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
                nantangClick
            }
      }
  }
  </script>
  
  <style scoped>
  
  </style>