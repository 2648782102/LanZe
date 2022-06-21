<template>
    <!-- 详情页 -->
    <article>
        <el-row class="elrow pt-2" :gutter="20" justify="center">
            <el-col class="bgwhite text-center" :xs="22" :sm="22" :md="16" :lg="16" :xl="16" :offset="0">
                <p>诗词名：{{ origin }}</p>
                <p>作者：{{ author }}</p>
                <p>标签：{{ category }}</p>
                <p>正文：</p>
                <p v-for="(item,index) in content" :key="index">{{ item }}</p>
                <div class="title" v-show="title">
                    <p>注释:</p>
                    <p v-for="(item,index) in title" :key="index">{{ item }}</p>
                </div>
            </el-col>
            <button @click="back" class="btn btn-primary fanhui">返回</button>
        </el-row>
    </article>
</template>

<script>
import { useRoute,useRouter } from "vue-router";

export default {
    name: 'details',
    setup() {
        const $route = useRoute()
        const $router = useRouter()
        let author = '无题';
        let category = [];
        let content = [];
        let origin = '无';
        let title = null;

        // 接收传参
        let shici = JSON.parse($route.query.shici)

        if(shici.paragraphs) {
            // 接收传值
            author = shici.author  // 作者
            category = shici.tags  //  类型
            content = JSON.parse(shici.paragraphs)  // 正文
            origin = shici.rhythmic  //  诗名
            if(shici.title) {
                title = JSON.parse(shici.title)
            }
        } else {
            // 接收传值
            author = shici.author  // 作者
            category.push(shici.category)  //  类型
            content.push(shici.content)  // 正文
            origin = shici.origin  //  诗名
        }

        function back() {
            $router.back()
        }

        return {
            author,category,content,origin,title,
            back,
        }
    }
}
</script>

<style scoped>
    article {
        width: 100%;
        min-height: 700px;
    }
    .elrow {
    width: 100%;
  }
  .el-col>p {
    font-size: 1.5rem;
  }
  .fanhui {
    position: fixed;
    top: 3  0%;
    right: 10%;
  }
  .title {
    text-align: left;
    color: rgb(104, 107, 110);
  }
</style>