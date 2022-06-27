<template>
    <!-- 设置 -->
    <article class="box">
        <router-link :to="{name:'loginindex'}" class="btn btn-primary">登录</router-link>
    </article>
</template>

<script>
    export default {
        name: 'SheZhi'
    }
</script>

<style scoped>
    * {
        box-sizing: border-box;
    }

    article {
        width: 100%;
        height: 700px;
    }
</style>