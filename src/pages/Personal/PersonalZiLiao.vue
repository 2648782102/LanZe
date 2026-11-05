<template>
    <!-- 资料 -->
    <article class="box">
        <div class="alert alert-danger">
            <strong>未登录状态，请先</strong><router-link class="alert-link" :to="{name:'loginindex'}">登录!</router-link>
        </div>
    </article>
</template>

<script>
    import { useRouter } from "vue-router";
import { ElMessage } from 'element-plus/es/components/message/index.mjs';
    import { onBeforeMount } from "vue";
    import { useSession } from '../../composables/useSession.js';

    export default {
        name: 'PersonalZiLiao',
        setup() {
            const $router = useRouter()
            const { isLoggedIn } = useSession()

            onBeforeMount(() => {
                if(isLoggedIn.value) {
                    $router.push({
                    name: 'datamessage'
                })
                } else {
                    ElMessage({
                        type: 'warning',
                        message: '请先登录！'
                    })
                }
            })

            return {
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
