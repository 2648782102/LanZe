<template>
  <!-- 摘录页面 -->
  <article class="mt-3 mb-3">
    <el-row class="elrow" justify="center">
      <!-- 中间主体部分 -->
      <el-tooltip
        effect="dark"
        content="切换"
        placement="bottom-end"
      >
      <div class="chevron1 chevron hidden-sm-and-down" @click="skip1" role="button" tabindex="0"
        aria-label="切换到上一组诗词" @keyup.enter="skip1">
        <i class="fas fa-chevron-left"></i>
      </div>
      </el-tooltip>
      <div class="col-10 col-md-8 col-lg-9 dox bgwhite">
        <section @dragstart="tuoDongGo($event)" @dragend="tuoDongOff($event,1)" draggable="true" class="section1 col-10 col-md-7 col-lg-3">
          <div v-loading='loding1' element-loading-text="加载中..." element-loading-svg-view-box="-10, -10, 50, 50" :element-loading-spinner="loadingSVG" class="box"
            :class="{'animationC':anima1,'animationD':anima2}">
            <span @click="shouchang(1)" @keyup.enter="shouchang(1)" role="button" tabindex="0"
              :aria-pressed="shouchang1" :class="shouchang1?'shouchang-yes':'shouchang-no'" class="shouchang">收藏</span>
            <p>{{ scArr1.content }}</p>
            <h5>— {{ scArr1.author }}</h5>
            <img draggable="false" src="../../assets/beijing/fanzou.png" alt="">
          </div>
        </section>
        <section @dragstart="tuoDongGo($event)" @dragend="tuoDongOff($event,2)" draggable="true" class="section2 col-10 col-md-8 col-lg-3 hidden-sm-and-down">
          <div v-loading='loding2' element-loading-text="加载中..." element-loading-svg-view-box="-10, -10, 50, 50" :element-loading-spinner="loadingSVG" class="box"
            :class="{'animationC':anima1,'animationD':anima2}">
            <span @click="shouchang(2)" @keyup.enter="shouchang(2)" role="button" tabindex="0"
              :aria-pressed="shouchang2" :class="shouchang2?'shouchang-yes':'shouchang-no'" class="shouchang">收藏</span>
            <p>{{ scArr2.content }}</p>
            <h5>— {{ scArr2.author }}</h5>
            <img draggable="false" src="../../assets/beijing/fanzou.png" alt="">
          </div>
        </section>
        <section @dragstart="tuoDongGo($event)" @dragend="tuoDongOff($event,3)" draggable="true" class="section3 col-10 col-md-8 col-lg-3 hidden-sm-and-down">
          <div v-loading='loding3' element-loading-text="加载中..." element-loading-svg-view-box="-10, -10, 50, 50" :element-loading-spinner="loadingSVG" class="box"
            :class="{'animationC':anima1,'animationD':anima2}">
            <span @click="shouchang(3)" @keyup.enter="shouchang(3)" role="button" tabindex="0"
              :aria-pressed="shouchang3" :class="shouchang3?'shouchang-yes':'shouchang-no'" class="shouchang">收藏</span>
            <p>{{ scArr3.content }}</p>
            <h5>— {{ scArr3.author }}</h5>
            <img draggable="false" src="../../assets/beijing/fanzou.png" alt="">
          </div>
        </section>
      </div>
      <el-tooltip
        effect="dark"
        content="切换"
        placement="top-start"
      >
      <div class="chevron2 chevron hidden-sm-and-down" @click="skip2" role="button" tabindex="0"
        aria-label="切换到下一组诗词" @keyup.enter="skip2">
        <i class="fas fa-chevron-right"></i>
      </div>
    </el-tooltip>
    </el-row>
  </article>
</template>

<script>
  import 'element-plus/theme-chalk/display.css'
  import { ref, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { PoetryRandomExcerpt } from '../../apis/api/list.js'

  export default {
    name: 'ZhaiLu',
    setup() {
      // 生命周期钩子，当页面挂载时执行
      onMounted(() => {
        // 调用ajax函数，初始化古诗词
        skiip()
      })

      const loadingSVG = `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `

      let excerptIndex = 0;
      async function loadExcerpt(serial = 0) {
        const response = await PoetryRandomExcerpt({ index: excerptIndex++ });
        const excerpt = response?.data || {};
        const refs = [scArr1, scArr2, scArr3];
        if (refs[serial]) refs[serial].value = excerpt;
      }

      async function skiip() {
        try {
          await Promise.all([loadExcerpt(0), loadExcerpt(1), loadExcerpt(2)]);
        } catch (error) {
          ElMessage({ message: "诗词加载失败，请稍后再试", type: "warning" });
        }
      }

      // 点击收藏切换样式
      let shouchang1 = ref(false), shouchang2 = ref(false), shouchang3 = ref(false)
      // 点击收藏
      function shouchang(value) {
        switch (value) {
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

      // 诗词数组
      let scArr1 = ref({}), scArr2 = ref({}), scArr3 = ref({})
      // 点击切换诗词，动画效果播放控制
      let anima1 = ref(false), anima2 = ref(false)
      // 加载动画
      let loding1 = ref(false),loding2 = ref(false),loding3 = ref(false)
      async function switchExcerpts(direction) {
        if (direction === 1) anima1.value = true;
        else anima2.value = true;
        loding1.value = true, loding2.value = true, loding3.value = true;
        setTimeout(() => {
          anima1.value = false;
          anima2.value = false;
        }, 700);
        try {
          await skiip();
          ElMessage({ message: "切换成功！", type: "success" });
        } finally {
          loding1.value = false, loding2.value = false, loding3.value = false;
        }
      }

      function skip1() { return switchExcerpts(1); }
      function skip2() { return switchExcerpts(2); }

      // 拖动开始事件
      let tuox = 0  //记录拖动前元素的x轴坐标
      let tuoy = 0  //记录拖动前元素的y轴坐标
      function tuoDongGo(e) {
        tuox = e.clientX
        tuoy = e.clientY
      }

      // 拖动结束事件
      let numX = 0  
      let numY = 0
      function tuoDongOff(e,serial) {
        numX = e.clientX-tuox
        numY = e.clientY-tuoy
        if(numX>150||numY>150||numX<-150||numY<-150) {
          switch(serial) {
              case 1: loding1.value = true
                      break
              case 2: loding2.value = true
                      break
              case 3: loding3.value = true
                      break
            }
          loadExcerpt(serial - 1).finally(() => {
            if (serial === 1) loding1.value = false;
            if (serial === 2) loding2.value = false;
            if (serial === 3) loding3.value = false;
          });
        }
      }

      return {
        shouchang, shouchang1, shouchang2, shouchang3,
        scArr1, scArr2, scArr3,
        anima1, anima2,
        skip1, skip2,
        loding1,loding2,loding3,
        tuoDongGo,tuoDongOff,loadingSVG
      }
    }

  }
</script>

<style scoped>
  .elrow {
    position: relative;
    width: 100%;
    margin: 0;
    font-family: FangZhengSong;
    font-weight: 600;
  }

  .lottie {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 4;
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
    background-color: white;
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
    font-size: 18px;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    transform: rotateZ(-40deg);
    cursor: pointer;
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
    font-family: piaoYiSong;
  }

  section>.box>h5 {
    writing-mode: vertical-rl;
    font-size: 22px;
    font-family: hongLei;
  }

  .chevron1 {
    display: flex;
    position: absolute;
    top: 40%;
    left: 4%;
    cursor: pointer;
    /* animation: xiangzuo 1s infinite alternate ease-in-out; */
  }

  @keyframes xiangzuo {
    from {
      left: 4%;
    }
    to {
      left: 2%;
    }
  }

  .chevron2 {
    display: flex;
    position: absolute;
    top: 40%;
    right: 4%;
    cursor: pointer;
    /* animation: xiangyou 1s infinite alternate ease-in-out; */
  }

  @keyframes xiangyou {
    from{
      right: 4%;
    }
    to {
      right: 2%;
    }
  }

  .chevron>i {
    font-size: 5rem;
    color: #e6e6e6;
    transition: 0.4s;
  }

  .chevron>i:hover {
    color: #b9dfd9;
    transition: 0.3s;
  }

  /* 点击切换诗词随机诗词动画效果(左) */
  .animationC {
    animation: animationc 2s ease-in-out;
    box-shadow: 8px 8px 8px rgba(120, 120, 120, 0.126);
  }

  @keyframes animationc {
    0% {
      transform: rotateY(0);
    }

    50% {
      transform: rotateY(-45deg) skewY(-10deg);
    }

    100% {
      transform: rotateY(0);
    }
  }

  /* 点击切换诗词随机诗词动画效果(右) */
  .animationD {
    animation: animationd 2s ease-in-out;
    box-shadow: -8px 4px 8px rgba(120, 120, 120, 0.126);
  }

  @keyframes animationd {
    0% {
      transform: rotateY(0);
    }

    50% {
      transform: rotateY(45deg) skewY(10deg);
    }

    100% {
      transform: rotateY(0);
    }
  }
</style>
