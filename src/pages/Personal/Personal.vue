<template>
    <!-- 个人中心 -->
    <section class="mb-3">
        <el-row :gutter="20" justify="center">
            <div class="col-10">
                <div class="top">
                    <main></main>
                    <footer>
                        <div class="col-12 col-md-6 footer-1">
                            <!-- 主页 -->
                            <router-link :to="{name:'personalhome'}">
                                <i class="fas fa-home" style="color: rgb(33, 196, 58);"></i>
                                <span>主页</span>
                            </router-link>
                            <!-- 个人资料 -->
                            <router-link :to="{name:'personalziLiao'}">
                                <i class="fas fa-folder-open" style="color: rgb(56, 147, 237);"></i>
                                <span>个人资料</span>
                            </router-link>
                            <!-- 收藏 -->
                            <router-link :to="{name:'favorite'}">
                                <i class="fas fa-star" style="color: rgb(237, 208, 41);"></i>
                                <span>收藏</span>
                            </router-link>
                            <!-- 作品 -->
                            <router-link :to="{name:'samplereels'}">
                                <i class="fas fa-pen" style="color: rgb(251, 86, 86);"></i>
                                <span>作品</span>
                            </router-link>
                            <!-- 投诉意见 -->
                            <router-link :to="{name:'complaint'}">
                                <i class="fas fa-edit" style="color: rgb(33, 193, 196);"></i>
                                <span>投诉意见</span>
                            </router-link>
                            <!-- 设置 -->
                            <router-link :to="{name:'shezhi'}">
                                <i class="fas fa-cog" style="color: rgb(72, 68, 121);"></i>
                                <span>设置</span>
                            </router-link>
                        </div>
                        <div class="col-12 col-md-3 footer-2">
                            <a href="">
                                <span>{{ attentionNum }}</span>
                                <span class="text-secondary">关注</span>
                            </a>
                            <a href="">
                                <span>{{ productionNum }}</span>
                                <span class="text-secondary">作品</span>
                            </a>
                            <a href="">
                                <span>{{ collectNum }}</span>
                                <span class="text-secondary">收藏</span>
                            </a>
                            <a href="">
                                <span>{{ clockInNum }}</span>
                                <span class="text-secondary">打卡</span>
                            </a>
                        </div>
                    </footer>
                </div>
                <div class="roubox mt-2 border-re2">
                    <router-view></router-view>
                </div>
            </div>
        </el-row>
    </section>
</template>
    
    <script>
        import {ref} from 'vue'

    export default {
        name: 'Personal',
        setup() {
            let modelLis = ref('')
            let attentionNum = ref(0)
            let productionNum = ref(0)
            let collectNum = ref(0)
            let clockInNum = ref(0)

            return {
                modelLis,
                attentionNum,
                productionNum,
                collectNum,
                clockInNum,
            }
        }
    }
    </script>
    
    <style scoped>
        .top {
            min-height: 14rem;
            background-color: white;
            border-radius: 0 0 0.2rem 0.2rem;
            overflow: hidden;
        }
        .roubox {
            background-color: rgb(255, 255, 255);
        }
        main {
            width: 100%;
            min-height: 10rem;
            background-color: rebeccapurple;
        }
        footer {
            width: 100%;
            min-height: 4rem;
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            padding: 0.5rem;
            background-color: white;
        }
        footer>div {
            display: flex;
            align-items: center;
        }
        .footer-1 {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-around;
        }
        .footer-1>a {
            text-decoration: none;
        }
        .footer-1>a>span {
            margin-left: 0.1rem;
            font-size: 0.8rem;
            color: black;
        }
        .footer-2 {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-around;
        }
        .footer-2>a {
            display: flex;
            flex-direction: column;
            text-align: center;
            text-decoration: none;
            font-size: 0.6rem;  
            color: black;
        }
    </style>