<template>
  <!-- 摘录页面 -->
  <article class="mt-3 mb-3">
    <el-row class="elrow" justify="center">
      <!-- 中间主体部分 -->
      <div class="chevron1 chevron" @click="skip1">
        <i class="fas fa-chevron-left"></i>
      </div>
      <div class="col-10 col-lg-9 dox bgwhite">
        <section class="section1 col-10 col-md-7 col-lg-3">
          <div v-loading='loding' element-loading-text="加载中..." class="box" :class="{'animationC':anima1,'animationD':anima2}" @click="xiangqing">
            <span @click="shouchang(1)" :class="shouchang1?'shouchang-yes':'shouchang-no'" class="shouchang">收藏</span>
            <p>{{ scArr1.content }}</p>
            <h5>— {{ scArr1.author }}</h5>
            <img src="../../assets/beijing/fanzou.png" alt="">
          </div>
        </section>
        <section class="section2 col-10 col-md-8 col-lg-3 hidden-md-and-down">
          <div v-loading='loding' element-loading-text="加载中..." class="box" :class="{'animationC':anima1,'animationD':anima2}">
            <span @click="shouchang(2)" :class="shouchang2?'shouchang-yes':'shouchang-no'" class="shouchang">收藏</span>
            <p>{{ scArr2.content }}</p>
            <h5>— {{ scArr2.author }}</h5>
            <img src="../../assets/beijing/fanzou.png" alt="">
          </div>
        </section>
        <section class="section3 col-10 col-md-8 col-lg-3 hidden-md-and-down">
          <div v-loading='loding' element-loading-text="加载中..." class="box" :class="{'animationC':anima1,'animationD':anima2}">
            <span @click="shouchang(3)" :class="shouchang3?'shouchang-yes':'shouchang-no'" class="shouchang">收藏</span>
            <p>{{ scArr3.content }}</p>
            <h5>— {{ scArr3.author }}</h5>
            <img src="../../assets/beijing/fanzou.png" alt="">
          </div>
        </section>
      </div>
      <div class="chevron2 chevron" @click="skip2">
        <i class="fas fa-chevron-right"></i>
      </div>
    </el-row>
  </article>
</template>

<script>
  import 'element-plus/theme-chalk/display.css'
  import {ref,onMounted} from 'vue'
  import axios from "axios"
  import { ElMessage } from 'element-plus'
  import {useRouter,useRoute} from 'vue-router'

  export default {
    name: 'ZhaiLu',
    setup() {
      // 点击收藏切换样式
      let shouchang1 = ref(false),shouchang2 = ref(false),shouchang3 = ref(false)
      // 诗词数组
      let scArr1 = ref({}),scArr2 = ref({}),scArr3 = ref({})
      // 点击切换诗词
      let anima1 = ref(false),anima2 = ref(false)
      // 加载动画
      let loding = ref(false)
      // 编程路由
      const $router = useRouter()
      const $route = useRoute()

      // 切换古诗词内容，函数
      function skiip() {
        // 发送请求到“古诗词.一言api”获取随机一首古诗词(部分)
        // 数据内容：作者：response.data.author，类型：response.data.category
        // 内容：response.data.content，诗名：response.data.origin
        axios.get('https://v1.jinrishici.com/all.json')
          .then(response => {
            scArr1.value = response.data;
          })
          axios.get('https://v1.jinrishici.com/all.json')
          .then(response => {
            scArr2.value = response.data;
          })
          axios.get('https://v1.jinrishici.com/all.json')
          .then(response => {
            scArr3.value = response.data;
          })
      }

      // 点击收藏
      function shouchang(value) {
        switch(value) {
          case 1:
            shouchang1.value = !shouchang1.value
            break;
          case 2:
            shouchang2.value = !shouchang2.value
            break;
          case 3:
            shouchang3.value = !shouchang3.value
            break;
        }
      }

      // 点击切换(左)随机诗词内容
      function skip1() {
        loding.value = true
        anima1.value = true
        setTimeout(() => {
          anima1.value = false
        },2000)
        setTimeout(() => {
          ElMessage({
            message:'切换成功！',
            type:'success'
          })
          skiip()
          loding.value = false
        },1000)
      }

      // 点击切换(右)随机诗词内容
      function skip2() {
        loding.value = true
        anima2.value = true
        setTimeout(() => {
          anima2.value = false
        },2000)
        setTimeout(() => {
          ElMessage({
            message:'切换成功！',
            type:'success'
          })
          skiip()
          loding.value = false
        },1000)
      }

      function xiangqing() {
        $router.push({
          name:'details'
        })
      }

      // 生命周期钩子，当页面挂载时执行
      onMounted(() => {
        // 调用ajax函数，初始化古诗词
        skiip()
      })

      return {
        shouchang,
        shouchang1,
        shouchang2,
        shouchang3,
        scArr1,
        scArr2,
        scArr3,
        anima1,
        anima2,
        skip1,
        skip2,
        loding,
        xiangqing
      }
    }
    
  }
</script>

<style scoped>
  .elrow {
    position: relative;
    width: 100%;
    margin: 0;
  }

  .dox {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-around;
  }

  section {
    height: 86vh;
    padding: 1rem 0 1rem 0;
    position: relative;
  }

  section>.box {
    width: 100%;
    height: 100%;
    position: relative;
    background-color: rgba(223, 223, 223, 0.1);
    border-radius: 0.3rem;
    border: 1px solid rgba(84, 84, 84, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 30%;
    position: relative;
    /* 溢出隐藏 */
    overflow: hidden;
    /* 开启3D */
    transform-style: preserve-3d;
    /* 设置旋转元素的基点位置 */
    transform-style: top center;
    /* 设置过渡 */
    transition: 0.45s ease-in-out;
    cursor: pointer;
  }

  .shouchang {
    position: absolute;
    top: -8px;
    left: -32px;
    width: 94px;
    height: 44px;
    font-size: 18px;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    transform: rotateZ(-40deg);
    cursor: pointer;
    transition: 0.3s;
  }

  .shouchang:hover {
    color: rgba(43, 43, 43, 0.804);
    transition: 0.3s;
  }

  .shouchang-yes {
    background-color: red;
    color: white;
  }

  .shouchang-no {
    background-color: rgb(255, 255, 255);
    color: rgb(195, 195, 195);
  }

  section>.box::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    /* 背景渐变(高光效果) */
    background: linear-gradient(-226deg, rgba(225, 225, 225, 0) 40%,
        rgba(255, 254, 182, 0.3) 40%, rgba(225, 225, 225, 0) 60%);
    transform: translateY(-330px);
  }

  section>.box::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 120%;
    /* 背景渐变(高光效果) */
    background: linear-gradient(226deg, rgba(225, 225, 225, 0) 40%,
        rgba(232, 232, 232, 0.3) 50%, rgba(225, 225, 225, 0) 60%);
    /* 默认上移出可视范围 */
    transform: translateY(-100%);
    /* 设置过渡 */
    transition: transform 0.85s cubic-bezier(0.165, 0.84, 0.44, 1);
  }

  section>.box:hover {
    transform: rotateX(7deg) translateY(-6px);
    box-shadow: 0 10px 10px rgba(120, 120, 120, 0.126);
    transition: 0.45s ease-in-out;
  }

  section>.box:hover::after {
    transform: translateY(100%);
  }


  section>.box>img {
    width: 80%;
    position: absolute;
    bottom: 5%;
  }

  section>.box>p {
    writing-mode: vertical-rl;
    font-size: 20px;
    height: 196px;
    letter-spacing: 4px;
  }

  section>.box>h5 {
    writing-mode: vertical-rl;
    font-size: 22px;
  }

  .chevron1 {
    display: flex;
    position: absolute;
    top: 40%;
    left: 4%;
    cursor: pointer;
  }

  .chevron2 {
    display: flex;
    position: absolute;
    top: 40%;
    right: 4%;
    cursor: pointer;
  }
  .chevron>i {
    font-size: 120px;
    color: rgba(110, 110, 110, 0.662);
  }
  .chevron>i:hover {
    color: black;
  }

  /* 点击切换诗词随机诗词动画效果(左) */
  .animationC {
    animation: animationc 2s ease-in-out;
  }
  @keyframes animationc {
    0%{
      transform: rotateY(0);
    }
    50%{
      transform: rotateY(-45deg) skewY(-10deg);
    }
    100%{
      transform: rotateY(0);
    }
  }
  
  /* 点击切换诗词随机诗词动画效果(右) */
  .animationD {
    animation: animationd 2s ease-in-out;
  }
  @keyframes animationd {
    0%{
      transform: rotateY(0);
    }
    50%{
      transform: rotateY(45deg) skewY(10deg);
    }
    100%{
      transform: rotateY(0);
    }
  }
</style>