<template>
    <!-- 个人中心 -->
    <article class="mb-3">
        <el-row class="elrow1" justify="center">
            <div class="col-10">
                <div class="top">
                    <!-- 上部头像，用户名等信息 -->
                    <main>
                        <div class="avatar">
                            <el-avatar :size="size"  />
                        </div>
                    </main>
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
                                <i class="fas fa-star" style="color: rgb(255, 226, 62);"></i>
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
                        <!-- 右侧信息展示 -->
                        <div class="col-12 col-md-3 footer-2">
                            <router-link :to="{name:'attention'}">
                                <span>{{ attentionNum }}</span>
                                <span class="text-secondary">关注</span>
                            </router-link>
                            <router-link :to="{name:'samplereels'}">
                                <span>{{ productionNum }}</span>
                                <span class="text-secondary">作品</span>
                            </router-link>
                            <router-link :to="{name:'favorite'}">
                                <span>{{ collectNum }}</span>
                                <span class="text-secondary">收藏</span>
                            </router-link>
                            <a>
                                <span>{{ clockInNum }}</span>
                                <span class="text-secondary">打卡</span>
                            </a>
                        </div>
                    </footer>
                </div>
                <!-- 主体部分 -->
                <div class="roubox mt-2 border-re2">
                    <router-view></router-view>
                </div>
            </div>
        </el-row>
    </article>
</template>

<script>
    import { ref } from 'vue'

    export default {
        name: 'Personal',
        setup() {
            let modelLis = ref('')
            let attentionNum = ref(0)
            let productionNum = ref(0)
            let collectNum = ref(0)
            let clockInNum = ref(1)

            // 输出内容
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
    article {
        width: 100%;    
    }

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
        position: relative;
        width: 100%;
        min-height: 10rem;
        background-image: url(../../assets/beijing/shuimo.png);
        background-size: 100%;
    }

    /* 头像 */
    .avatar {
        width: 4.2rem;
        height: 4.2rem;
        position: absolute;
        bottom: 3%;
        left: 5%;
        background-color: red;
    }

    .elrow1 {
        width: 100%;
        height: 100%;
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
        margin-left: 0.2rem;
        font-size: 0.8rem;
        color: black;
    }
    .footer-1>a>i {
        font-size: 1rem;
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