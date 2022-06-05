<template>
  <!-- 摘录页面 -->
    <article class="mt-3 mb-3">
      <el-row class="elrow" justify="center">
        <!-- 中间主体部分 -->
        <div class="col-10 col-lg-9 dox bgwhite">
          <section class="section1 col-10 col-md-7 col-lg-3">
            <div class="box">
              <p>去年东武今夕<br/>明月不胜愁</p>
              <h5>——苏轼</h5>
              <img src="../../assets/beijing/fanzou.png" alt="">
            </div>
          </section>
          <section class="section2 col-10 col-md-8 col-lg-3 hidden-md-and-down">
            <div class="box">
              <p>去年元夜时<br/>花市灯如昼</p>
              <h5>——欧阳修</h5>
              <img src="../../assets/beijing/fanzou.png" alt="">
            </div>
          </section>
          <section class="section3 col-10 col-md-8 col-lg-3 hidden-md-and-down">
            <div class="box">
              <p>天长雁影稀<br/>月落山蓉瘦<br/>冷清清暮秋时候</p>
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

export default {
    name: 'ZhaiLu'
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
    }
    section>.box {
      width: 100%;
      height: 100%;
      background-color: rgba(223, 223, 223, 0.1);
      border-radius: 0.3rem;
      border: 2px solid rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 30%;
      position: relative;
      z-index: 2;
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