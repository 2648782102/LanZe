<template>
    <section v-loading="loading" class="section1">
        <div class="xlbody gushi-tabs hidden-sm-and-down">
            <div @mouseenter="xuanfu(0)" :class="xuanClass[0]?'col-md-2':'col-xl-1'" class="xlbox btn top btn-dark text-while col-12" @click="huajianjiClick"><p>花间集介绍</p><h5>赵崇祚 后蜀广政三年 (940)</h5></div>
            <div @mouseenter="xuanfu(1)" :class="xuanClass[1]?'col-md-2':'col-xl-1'" class="xlbox btn col-12" @click="shijiClick(0)"><p>花间集.其<span>一</span></p><h4 class="text-white">花间集第一部分 . . .</h4></div>
            <div @mouseenter="xuanfu(2)" :class="xuanClass[2]?'col-md-2':'col-xl-1'" class="xlbox btn col-12" @click="shijiClick(1)"><p>花间集.其<span>二</span></p><h4 class="text-white">花间集第二部分 . . .</h4></div>
            <div @mouseenter="xuanfu(3)" :class="xuanClass[3]?'col-md-2':'col-xl-1'" class="xlbox btn col-12" @click="shijiClick(2)"><p>花间集.其<span>三</span></p><h4 class="text-white">花间集第三部分 . . .</h4></div>
            <div @mouseenter="xuanfu(4)" :class="xuanClass[4]?'col-md-2':'col-xl-1'" class="xlbox btn col-12" @click="shijiClick(3)"><p>花间集.其<span>四</span></p><h4 class="text-white">花间集第四部分 . . .</h4></div>
            <div @mouseenter="xuanfu(5)" :class="xuanClass[5]?'col-md-2':'col-xl-1'" class="xlbox btn col-12" @click="shijiClick(4)"><p>花间集.其<span>五</span></p><h4 class="text-white">花间集第五部分 . . .</h4></div>
            <div @mouseenter="xuanfu(6)" :class="xuanClass[6]?'col-md-2':'col-xl-1'" class="xlbox btn col-12" @click="shijiClick(5)"><p>花间集.其<span>六</span></p><h4 class="text-white">花间集第六部分 . . .</h4></div>
            <div @mouseenter="xuanfu(7)" :class="xuanClass[7]?'col-md-2':'col-xl-1'" class="xlbox btn col-12" @click="shijiClick(6)"><p>花间集.其<span>七</span></p><h4 class="text-white">花间集第七部分 . . .</h4></div>
            <div @mouseenter="xuanfu(8)" :class="xuanClass[8]?'col-md-2':'col-xl-1'" class="xlbox btn col-12" @click="shijiClick(7)"><p>花间集.其<span>八</span></p><h4 class="text-white">花间集第八部分 . . .</h4></div>
            <div @mouseenter="xuanfu(9)" :class="xuanClass[9]?'col-md-2':'col-xl-1'" class="xlbox btn col-12" @click="shijiClick(8)"><p>花间集.其<span>九</span></p><h4 class="text-white">花间集第九部分 . . .</h4></div>
            <div @mouseenter="xuanfu(10)" :class="xuanClass[10]?'col-md-2':'col-xl-1'" class="xlbox btn col-12" @click="shijiClick(9)"><p>花间集.其<span>十</span></p><h4 class="text-white">花间集第十部分 . . .</h4></div>
        </div>
        <div class="lgbody gushi-tabs hidden-md-and-up">
            <div class="lgbox btn btn-dark text-while" @click="huajianjiClick"><p>花间集介绍</p><h5>赵崇祚 后蜀广政三年 (940)</h5></div>
            <div class="lgbox btn btn-success" @click="shijiClick(1)"><p>花间集.其<span>一</span></p><h4 class="text-white">花间集第一部分 . . .</h4></div>
            <div class="lgbox btn btn-success" @click="shijiClick(2)"><p>花间集.其<span>二</span></p><h4 class="text-white">花间集第二部分 . . .</h4></div>
            <div class="lgbox btn btn-success" @click="shijiClick(3)"><p>花间集.其<span>三</span></p><h4 class="text-white">花间集第三部分 . . .</h4></div>
            <div class="lgbox btn btn-success" @click="shijiClick(4)"><p>花间集.其<span>四</span></p><h4 class="text-white">花间集第四部分 . . .</h4></div>
            <div class="lgbox btn btn-success" @click="shijiClick(5)"><p>花间集.其<span>五</span></p><h4 class="text-white">花间集第五部分 . . .</h4></div>
            <div class="lgbox btn btn-success" @click="shijiClick(6)"><p>花间集.其<span>六</span></p><h4 class="text-white">花间集第六部分 . . .</h4></div>
            <div class="lgbox btn btn-success" @click="shijiClick(7)"><p>花间集.其<span>七</span></p><h4 class="text-white">花间集第七部分 . . .</h4></div>
            <div class="lgbox btn btn-success" @click="shijiClick(8)"><p>花间集.其<span>八</span></p><h4 class="text-white">花间集第八部分 . . .</h4></div>
            <div class="lgbox btn btn-success" @click="shijiClick(9)"><p>花间集.其<span>九</span></p><h4 class="text-white">花间集第九部分 . . .</h4></div>
        </div>
      </section>
  </template>
  
  <script>
    import axios from 'axios'
    import { useRouter } from 'vue-router'
    import { ref } from 'vue'
    import 'element-plus/theme-chalk/display.css'

  export default {
      name: 'GuShiHuaJianJi',
      setup() {
        const $router = useRouter()

        // 加载控制
        let loading = ref(false)

        // 点击花间集
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

        // 点击诗集
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
        
        // 鼠标悬浮事件
        let xuanClass = ref([true,false,false,false,false,false,false,false,false,false,false])
        let inx = ref(0)     // 保存鼠标悬浮的下标
        function xuanfu(index) {
            inx.value = index
            setTimeout(() => {
                if(inx.value==index) {
                    xuanClass.value[index] = true
                xuanClass.value.forEach((element,a) => {
                    if(a!=index) {
                        xuanClass.value[a] = false
                    }
                });
                }
            },500)
        }

        return {
            huajianjiClick,
            shijiClick,
            loading,
            xuanfu,xuanClass
        }
      }
  }
  </script>
  
  <style scoped>
    .section1 {
        width: 100%;
        height: 90vh;
    }
    .xlbody {
            width: 100%;
            min-height: 80vh;
        }
        .xlbox {
            height: 90vh;
            transition: 0.5s;
            writing-mode: vertical-lr;
        }
        .xlbox:not(.top) {
            font-weight: 600;
            background-color: #5b99af;
            border: 1px solid rgba(107, 84, 129, 0.207);
        }
        .xlbox>p {
            writing-mode: vertical-lr;
            letter-spacing: 1rem;
            font-size: 1.2rem;
        }
        .xlbox>p>span {
            color: #EA2027;
            font-size: 1.3rem;
            text-shadow: 4px 4px 5px rgba(0, 0, 0, 0.2);
        }
        .lgbody {
            width: 100%;
        }
        .lgbox {
            width: 100%;
            margin-top: 1rem;
        }
  </style>