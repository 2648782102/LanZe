<template>
    <!-- 个人中心 -->
    <article class="mb-3">
        <el-row class="elrow1" justify="center">
            <div class="col-10">
                <div class="top">
                    <!-- 上部头像，用户名等信息 -->
                    <main>
                        <div v-if="!lanze_upload" class="avatar">
                            <el-avatar class="elavatar" icon="UserFilled" />
                            <span v-if="!lanze_upload" class="ps-2">请先登录</span>
                        </div>
                        <div v-if="lanze_upload" class="avatar">
                            <el-avatar class="elavatar" :src="imgsrc" icon="UserFilled" />
                            <span v-if="lanze_upload" class="ps-2">{{ lanze_upload.user_name }}</span>
                        </div>
                        <div class="text1">
                            <h3 v-if="!lanze_upload">简介</h3>
                            <h3 v-if="lanze_upload">{{ lanze_upload.intro }}</h3>
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
    import { ref, onMounted, computed } from 'vue'
    import hoad1 from '../../assets/hoad/hoad1.jpg'
    import hoad2 from '../../assets/hoad/hoad2.jpg'
    import hoad3 from '../../assets/hoad/hoad3.jpg'
    import hoad4 from '../../assets/hoad/hoad4.jpg'
    import hoad5 from '../../assets/hoad/hoad5.jpg'
    import hoad6 from '../../assets/hoad/hoad6.jpg'
    import hoad7 from '../../assets/hoad/hoad7.jpg'
    import hoad8 from '../../assets/hoad/hoad8.jpg'
    import hoad9 from '../../assets/hoad/hoad9.jpg'

    export default {
        name: 'Personal',
        setup() {
            let modelLis = ref('')
            let attentionNum = ref(0)
            let productionNum = ref(0)
            let collectNum = ref(0)
            let clockInNum = ref(1)


            // 头像的地址
            let imgsrc = ref(null)
            let lanze_upload = computed(() => {
                return $cookies.get('lanze_upload')
            })
            onMounted(() => {
                if (lanze_upload.value) {
                    switch (lanze_upload.value.head_img) {
                        case 'hoad1.jpg':
                            imgsrc.value = hoad1
                            break;
                        case 'hoad2.jpg':
                            imgsrc.value = hoad2
                            break;
                        case 'hoad3.jpg':
                            imgsrc.value = hoad3
                            break;
                        case 'hoad4.jpg':
                            imgsrc.value = hoad4
                            break;
                        case 'hoad5.jpg':
                            imgsrc.value = hoad5
                            break;
                        case 'hoad6.jpg':
                            imgsrc.value = hoad6
                            break;
                        case 'hoad7.jpg':
                            imgsrc.value = hoad7
                            break;
                        case 'hoad8.jpg':
                            imgsrc.value = hoad8
                            break;
                        case 'hoad9.jpg':
                            imgsrc.value = hoad9
                            break;
                        default:
                            imgsrc.value = hoad1
                    }
                } else {

                }
            })

            // 输出内容
            return {
                modelLis,
                attentionNum,
                productionNum,
                collectNum,
                clockInNum,
                imgsrc,
                lanze_upload
            }
        }
    }
</script>

<style scoped>
    article {
        width: 100%;
        font-family: FangZhengSong;
    }

    .top {
        min-height: 14rem;
        background-color: rgb(255, 255, 255);
        border-radius: 0 0 0.2rem 0.2rem;
        overflow: hidden;
        box-shadow: 5px 5px 5px rgba(169, 176, 176, 0.615);
    }

    .roubox {
        background-color: rgb(255, 255, 255);
        box-shadow: 5px 5px 5px rgba(169, 176, 176, 0.615);
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
        position: absolute;
        bottom: 3%;
        left: 5%;
    }

    .elavatar {
        width: 3.8rem;
        height: 3.8rem;
        font-size: 40px;
    }

    .huizhang {
        width: 1.2rem;
        height: 1.2rem;
    }

    .text1 {
        position: absolute;
        right: 1rem;
        bottom: 0;
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
        transition: 0.5s;
    }

    .footer-1>a>span {
        margin-left: 0.2rem;
        font-size: 0.8rem;
        color: black;
    }

    .footer-1>a>i {
        font-size: 1rem;
    }

    .footer-1>a:hover {
        text-shadow: 3px 3px 3px rgba(152, 152, 152, 0.322);
        transition: 0.2s;
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