<template>
    <!-- 作品 -->
    <article class="box">
        <button @click="publishClick" type="button" class="btn btn-primary">发布作品</button>
    </article>
</template>

<script>
    import { useRouter } from "vue-router";
    import { ElMessage } from "element-plus";

    export default {
        name: 'SampleReels',
        setup() {
            const $router = useRouter()

            function publishClick() {
                if($cookies.get('lanze_user')) {
                    $router.push({
                    name:'publishpoem'
                })
                } else {
                    ElMessage({
                        type:'warning',
                        message:'请先登录！'
                    })
                }
            }

            return {
                publishClick
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