<template>
  <article>
    <router-view></router-view>
  </article>
</template>

<script>

export default {
  name: 'App',
  components: {
  }
}
</script>

<style>
  /* 公用属性 */
  .bgwhite {
      background-color: rgba(255, 255, 255, 0.8);
      border-radius: 0.2rem;
      box-shadow: 2px 2px 5px 5px rgba(0, 0, 0, 0.05);
  }
  .border-re2 {
    border-radius: 0.2rem;
  }
  @font-face {
    font-family: FangZhengSong;
    src: url(./assets/ZiTi/FangZhengSong.ttf);
  }
  @font-face {
    font-family: piaoYiSong;
    src: url(./assets/ZiTi/piaoYiSong.ttf);
  }
  @font-face {
    font-family: hongLei;
    src: url(./assets/ZiTi/hongLei.ttf);
  }
  @font-face {
    font-family: maoKen;
    src: url(./assets/ZiTi/maoKen.ttf);
  }
</style>
