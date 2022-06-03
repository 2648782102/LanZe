<template>
  <h1>产品展示</h1>
  <el-button type="success" @click="btn">跳转</el-button>
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

</style>