<template>
  <div class="box">
    <h1 @click="btn()">兰泽诗词</h1>
    <el-icon class="icon"><CaretTop /></el-icon>
  </div>
</template>

<script>
import {useRouter} from 'vue-router'

export default {
    name: 'ProductDisplay',
    setup() {
        const router = useRouter()

        function btn() {
            router.push({
                name: 'home'
            })
        }

        return {
            btn
        }
    }
}
</script>

<style scoped>

    .box {
        width: 100%;
        height: 100vh;
        background-image: url(../assets/guGong.jpg);
        background-size: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: end;
    }

    .box>h1 {
        font-family: hongLei;
        font-size: 30px;
        margin-bottom: 3vh;
        color: rgb(217, 233, 224);
        cursor: pointer;
        transition: 1s;
        text-shadow: 10px 10px black;
    }

    .box>h1:hover {
        transition: 1s;
        text-shadow: none;
    }

    .icon {
        font-size: 10vh;
        color: white;
        position: relative;
        transition: 1s;
        animation: laihui 1s infinite alternate ease-in-out;
    }

    @keyframes laihui  {
        from{
            bottom: 2vh;
        }
        to{
            bottom: 6vh;
        }
    }
</style>