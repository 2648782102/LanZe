<template>
    <div v-loading="loading" class="body">
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
    </div>
  </template>
  
  <script>
    import axios from 'axios'
    import { useRouter } from 'vue-router'
    import { ref } from 'vue'

  export default {
      name: 'GuShiHuaJianJi',
      setup() {
        const $router = useRouter()

        // 加载控制
        let loading = ref(false)

        function huajianjiClick() {
            loading.value = true
            axios.get('https://lanze-node.vercel.app/api/huajianjia')
            .then(response => {
                loading.value = false
                $router.push({
                name: 'details',
                query:{
                    shici:JSON.stringify(response.data[0])
                }
            })
            })
            .catch(function(error) {
                console.log(error)
            })
        }

        function shijiClick(value) {
            loading.value = true
            axios.get('https://lanze-node.vercel.app/api/huajianji')
            .then(response => {
                loading.value = false
                let Arr = response.data.slice(value*50,(value+1)*50)
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
            shijiClick,
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