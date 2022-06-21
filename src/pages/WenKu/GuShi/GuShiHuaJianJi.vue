<template>
    <button class="btn btn-dark text-while" @click="huajianjiClick">花间集介绍</button>
    <button class="btn btn-success" @click="shijiClick(0)">花间集.其一</button>
    <button class="btn btn-success" @click="shijiClick(1)">花间集.其二</button>
    <button class="btn btn-success" @click="shijiClick(2)">花间集.其三</button>
    <button class="btn btn-success" @click="shijiClick(3)">花间集.其四</button>
    <button class="btn btn-success" @click="shijiClick(4)">花间集.其五</button>
    <button class="btn btn-success" @click="shijiClick(5)">花间集.其六</button>
    <button class="btn btn-success" @click="shijiClick(6)">花间集.其七</button>
    <button class="btn btn-success" @click="shijiClick(7)">花间集.其八</button>
    <button class="btn btn-success" @click="shijiClick(8)">花间集.其九</button>
    <button class="btn btn-success" @click="shijiClick(9)">花间集.其十</button>
  </template>
  
  <script>
    import axios from 'axios'
    import { useRouter } from 'vue-router'
  export default {
      name: 'GuShiHuaJianJi',
      setup() {
        const $router = useRouter()

        function huajianjiClick() {
            axios.get('http://192.168.44.1:3000/api/GuShiCiApi/HuaJianJiUser.php')
            .then(response => {
                $router.push({
                name: 'details',
                query:{
                    shici:JSON.stringify(response.data[0][0])
                }
            })
            })
            .catch(function(error) {
                console.log(error)
            })
        }

        function shijiClick(value) {
            axios.get('http://192.168.44.1:3000/api/GuShiCiApi/HuaJianJi.php')
            .then(response => {
                let Arr = response.data[0].slice(value*50,(value+1)*50)
                $router.push({
                name: 'searchul',
                query:{
                    ulArr:JSON.stringify(Arr)
                }
            })
            })
            .catch(function(error) {
                console.log(error)
            })
        }

        return {
            huajianjiClick,
            shijiClick
        }
      }
  }
  </script>
  
  <style scoped>
  
  </style>