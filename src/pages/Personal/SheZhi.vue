<template>
    <!-- 设置 -->
    <article class="box">
        <router-link v-if="!isLoggedIn" :to="{name:'loginindex'}" class="btn btn-primary" aria-label="前往登录">
            登录
        </router-link>
        <router-link v-if="isLoggedIn" :to="{name:'loginindex'}" class="btn btn-primary" aria-label="切换登录账号">
            切换登录
        </router-link>
        <h1 v-if="isLoggedIn">当前登录账号为：{{ profile.user_name }}</h1>
        <p class="demo-hint">纯前端演示账号：demo / lanze2026；注册或修改密码的数据仅保存在当前浏览器。</p>
        <button v-if="isLoggedIn" type="button" class="btn btn-outline-secondary" @click="logout" aria-label="退出登录">退出登录</button>
    </article>
</template>

<script>
    import { useSession } from "../../composables/useSession.js";

    export default {
        name: 'SheZhi',
        setup() {
            const { isLoggedIn, profile, clearSession } = useSession();
            return {
                isLoggedIn,
                profile,
                clearSession,
                logout: clearSession,
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
        padding: 2rem;
    }

    .demo-hint {
        max-width: 40rem;
        color: #5f6b76;
        line-height: 1.8;
    }
</style>
