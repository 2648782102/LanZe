<template>
<!-- 音乐播放器 -->
  <div class="mainPage" ref="playerRef"></div>
</template>

<script>
export default {
  name: "Audio",
};
</script>

<script setup>
import "../../node_modules/aplayer/dist/APlayer.min.css";
import APlayer from "aplayer";
import {
  reactive, 
  onBeforeUnmount,
  getCurrentInstance,
  onMounted,
  ref,
} from "vue";

const playerRef = ref();
const { proxy } = getCurrentInstance();
const state = reactive({
  instance: null,
});
onMounted(() => {
    state.instance = new APlayer({
      container: playerRef.value,
      fixed:true,
      autoplay:true,
      audio: [
      // {
      //     name: '少年不凡',
      //     artist: '刘美麟',
      //     url: 'https://music.163.com/song/media/outer/url?id=1465288704.mp3',
      //     cover: 'http://p2.music.126.net/lvfb_64QYmbib7ccHgDNJA==/109951165165604312.jpg?param=130y130'
      //   },
      //   {
      //     name: '浣纱歌 (伴奏)',
      //     artist: '许多葵 / KasaYAYA / 齐栾 / 逆水寒',
      //     url: 'https://music.163.com/song/media/outer/url?id=862100710.mp3',
      //     cover: 'http://p1.music.126.net/H0p9gXKszyJfGCmmjgaFSg==/109951163380162384.jpg?param=130y130'
      //   },
      //   {
      //     name: '卡农',
      //     artist: 'dylanf',
      //     url: 'https://music.163.com/song/media/outer/url?id=478507889.mp3',
      //     cover: 'http://p2.music.126.net/fL7FAeRby1s7JreBqoOKjg==/109951165175371079.jpg?param=130y130'
      //   },
      //   {
      //     name: 'River Flows in You（你的心河）',
      //     artist: 'Yiruma',
      //     url: 'https://music.163.com/song/media/outer/url?id=22829932.mp3',
      //     cover: 'http://p2.music.126.net/hG_GIDqq9UP_uMStU11Tuw==/109951165967036244.jpg?param=130y130'
      //   },
      //   {
      //     name: 'Leaves in the Wind',
      //     artist: 'Isaac Shepard',
      //     url: 'https://music.163.com/song/media/outer/url?id=19934760.mp3',
      //     cover: 'http://p1.music.126.net/Sr0TIlk6ZRKYmiv00beGXA==/109951163935983939.jpg?param=130y130'
      //   },
        ],
    });
  // });
  // 销毁
  onBeforeUnmount(() => {
    state.instance.destroy();
  });
});
</script>

<style>

</style>