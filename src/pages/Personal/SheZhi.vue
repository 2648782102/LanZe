<template>
    <!-- 设置 -->
    <article class="box">
        <router-link v-if="!userCookie" :to="{name:'loginindex'}" class="btn btn-primary">
            登录
        </router-link>
        <router-link v-if="userCookie" :to="{name:'loginindex'}" class="btn btn-primary">
            切换登录
        </router-link>
        <h1 v-if="userCookie">当前登录账号为：{{ userCookie.user }}</h1>
    </article>
</template>

<script>
    import { onMounted,computed } from "vue";

    export default {
        name: 'SheZhi',
        setup() {
            // cookies
            let userCookie = computed(() => {
                return $cookies.get('lanze_user')
            })

            //页面挂载时执行 
            onMounted(() => {
                console.log($cookies.get('lanze_user'));
            })

            return {
                userCookie
            }
        }
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