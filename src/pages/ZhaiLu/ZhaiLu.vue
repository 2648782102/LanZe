<template>
  <!-- 摘录页面 -->
  <article class="mt-3 mb-3">
    <el-row class="elrow" justify="center">
      <!-- 中间主体部分 -->
      <div class="col-10 col-lg-9 dox bgwhite">
        <section class="section1 col-10 col-md-7 col-lg-3">
          <div class="box">
            <span @click="shouchang(1)" :class="shouchang1?'shouchang-yes':'shouchang-no'" class="shouchang">收藏</span>
            <p>去年东武今夕<br />明月不胜愁</p>
            <h5>——苏轼</h5>
            <img src="../../assets/beijing/fanzou.png" alt="">
          </div>
        </section>
        <section class="section2 col-10 col-md-8 col-lg-3 hidden-md-and-down">
          <div class="box">
            <span @click="shouchang(2)" :class="shouchang2?'shouchang-yes':'shouchang-no'" class="shouchang">收藏</span>
            <p>去年元夜时<br />花市灯如昼</p>
            <h5>——欧阳修</h5>
            <img src="../../assets/beijing/fanzou.png" alt="">
          </div>
        </section>
        <section class="section3 col-10 col-md-8 col-lg-3 hidden-md-and-down">
          <div class="box">
            <span @click="shouchang(3)" :class="shouchang3?'shouchang-yes':'shouchang-no'" class="shouchang">收藏</span>
            <p>天长雁影稀<br />月落山蓉瘦<br />冷清清暮秋时候</p>
            <h5>——关汉卿</h5>
            <img src="../../assets/beijing/fanzou.png" alt="">
          </div>
        </section>
      </div>
    </el-row>
  </article>
</template>

<script>
  import 'element-plus/theme-chalk/display.css'
  import {ref, watch} from 'vue'

  export default {
    name: 'ZhaiLu',
    setup() {
      let shouchang1 = ref(false)
      let shouchang2 = ref(false)
      let shouchang3 = ref(false)

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

      return {
        shouchang,
        shouchang1,
        shouchang2,
        shouchang3
      }
    }
  }
</script>

<style scoped>
  .elrow {
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
  }

  .shouchang {
    position: absolute;
    top: -8px;
    left: -32px;
    width: 94px;
    height: 44px;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    transform: rotateZ(-40deg);
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .shouchang:hover {
    background-color: red;
    color: white;
    transition: background-color 0.3s;
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
    transform: translateY(-300px);
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
  }

  section>.box>h5 {
    writing-mode: vertical-rl;
    font-size: 22px;
  }
</style>