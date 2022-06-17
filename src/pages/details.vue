<template>
    <!-- 详情页 -->
    <article>
        <el-row class="elrow pt-2" :gutter="20" justify="center">
            <el-col class="bgwhite" :span="16" :offset="0">
                <p>诗词名：{{ author }}</p>
                <p>作者：{{ category }}</p>
                <p>类型：{{ content }}</p>
                <p>正文：{{ origin }}</p>
            </el-col>
        </el-row>
    </article>
</template>

<script>
import { onMounted } from "vue";
import { useRoute } from "vue-router";

export default {
    name: 'details',
    setup() {
        const $route = useRoute()

        // 接收传值
        let author = $route.query.author  // 作者
        let category = $route.query.category
        let content = $route.query.content
        let origin = $route.query.origin

        onMounted(() => {
        })

        return {
            author,category,content,origin
        }
    }
}
</script>

<style scoped>
    article {
        width: 100%;
        height: 700px;
    }
    .elrow {
    position: relative;
    width: 100%;
    margin: 0;
  }
</style>