<template>
  <!-- 登录页面父组件 -->
  <article>
    <!-- <router-link :to="{name: 'login'}" class="btn btn-outline-primary" >登录</router-link>
    <router-link :to="{name: 'adduser'}" class="btn btn-outline-primary" >注册</router-link>
    <router-link :to="{name: 'datauser'}" class="btn btn-outline-primary" >修改</router-link>
    <router-link :to="{name: 'deleteuser'}" class="btn btn-outline-primary" >注销</router-link> -->
    <div class="at2"></div>
    <!-- 罗蒂动画位置 -->
    <section class="lottie col-12 col-md-8 col-lg-5 col-xl-4">
      <lottie-player src="https://assets6.lottiefiles.com/packages/lf20_ucbyrun5.json" background="transparent"
        speed="1" style="width: 100%; height: 100%;" loop autoplay></lottie-player>
    </section>
    <!-- 路由子组件位置 -->
    <section class="routerView col-12 col-md-10 col-lg-6 col-xl-6 me-5 ms-5 p-5">
      <router-view></router-view>
    </section>
  </article>
</template>

<script>
  export default {
    name: 'loginIndex',
    setup() {
    }
  }
</script>

<style scoped>
  article {
    position: relative;
    min-width: 100%;
    min-height: 100vh;
    background-color: aliceblue;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    flex-wrap: wrap-reverse;
    perspective: 1000px;
    overflow: hidden;
    font-family: FangZhengSong;
  }

  .at2 {
    width: 100%;
    height: 10rem;
    background-color: rgba(183, 194, 191, 0.2);
    border: 1px solid rgba(70, 177, 154, 0.2);
    position: absolute;
    bottom: 0;
    transform: rotateX(60deg) rotateY(0) rotateZ(0);
  }

</style>