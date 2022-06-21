<template>
    <button class="btn btn-warning" @click="yuanquClick">元曲</button>
  </template>
  
  <script>
import axios from 'axios'
import { useRouter } from 'vue-router'
  export default {
      name: 'GuShiYuanQu',
      setup() {
        const $router = useRouter()

        function yuanquClick() {
            axios.get('http://192.168.44.1:3000/api/GuShiCiApi/YuanQu.php')
            .then(response => {
                let chuciArr = JSON.stringify(response.data[0].splice(0,1100))
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
            yuanquClick
        }
      }
  }
  </script>
  
  <style scoped>
  
  </style>