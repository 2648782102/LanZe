<template>
    <!-- 资料 -->
    <article class="box">
        <button @click="xiugai" class="btn btn-primary">
            修改资料
        </button>
    </article>
</template>

<script>
    import { useRouter } from "vue-router";
    import { ElMessage } from 'element-plus'

    export default {
        name: 'PersonalZiLiao',
        setup() {
            const $router = useRouter()
            function xiugai() {
                if($cookies.get('lanze_user')) {
                    $router.push({
                    name: 'datamessage'
                })
                } else {
                    ElMessage({
                        type: 'error',
                        message: '请先登录！'
                    })
                }
            }

            return {
                    xiugai
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