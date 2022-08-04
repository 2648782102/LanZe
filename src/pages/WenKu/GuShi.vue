<template>
    <!-- 古诗类 -->
    <article>
        <!-- 大屏幕时在左边 -->
        <el-tabs type="border-card" tab-position="left" class="gushi-tabs hidden-sm-and-down">
            <el-tab-pane>
                <template #label>
                    <div>
                        <i class="fas fa-star"> 精选文集</i>
                    </div>
                </template>
                <GuShiJingXuan />
            </el-tab-pane>
            <el-tab-pane>
                <template #label>
                    <div>
                        <i class="fas fa-cannabis"> 唐诗.宋词</i>
                    </div>
                </template>
                <GuShiTangSong />
            </el-tab-pane>
            <el-tab-pane>
                <template #label>
                    <div>
                        <i class="fas fa-music"> 元曲</i>
                    </div>
                </template>
                <GuShiYuanQu />
            </el-tab-pane>
            <el-tab-pane>
                <template #label>
                    <div>
                        <i class="fas fa-feather-alt"> 南唐二主词</i>
                    </div>
                </template>
                <GuShiNanTang />
            </el-tab-pane>
            <el-tab-pane>
                <template #label>
                    <div>
                        <i class="fas fa-user-graduate"> 教育</i>
                    </div>
                </template>
                <GuShiJiaoYu />
            </el-tab-pane>
            <el-tab-pane>
                <template #label>
                    <div>
                        <i class="fas fa-fan"> 花间集</i>
                    </div>
                </template>
                <GuShiHuaJianJi />
            </el-tab-pane>
            <el-tab-pane label="全唐诗">
                <template #label>
                    <div class="gushi-tabs-span">
                        <i style="font-weight: 800;">唐</i>
                        &nbsp全唐诗
                    </div>
                </template>
                <GuShiTangShi />
            </el-tab-pane>
            <el-tab-pane>
                <template #label>
                    <div class="gushi-tabs-span">
                        <i style="font-weight: 800;">宋</i>
                        &nbsp全宋词
                    </div>
                </template>
                <GuShiSongCi />
            </el-tab-pane>
        </el-tabs>
        <!-- 小屏幕时在上边 -->
        <el-tabs :stretch="true" type="border-card" tab-position="top" class="gushi-tabs hidden-md-and-up">
            <el-tab-pane>
                <template #label>
                    <div>
                        <i class="fas fa-star"> 精选文集</i>
                    </div>
                </template>
                <GuShiJingXuan />
            </el-tab-pane>
            <el-tab-pane>
                <template #label>
                    <div>
                        <i class="fas fa-cannabis"> 唐诗.宋词</i>
                    </div>
                </template>
                <GuShiTangSong />
            </el-tab-pane>
            <el-tab-pane>
                <template #label>
                    <div>
                        <i class="fas fa-music"> 元曲</i>
                    </div>
                </template>
                <GuShiYuanQu />
            </el-tab-pane>
            <el-tab-pane>
                <template #label>
                    <div>
                        <i class="fas fa-feather-alt"> 南唐二主词</i>
                    </div>
                </template>
                <GuShiNanTang />
            </el-tab-pane>
            <el-tab-pane>
                <template #label>
                    <div>
                        <i class="fas fa-user-graduate"> 教育</i>
                    </div>
                </template>
                <GuShiJiaoYu />
            </el-tab-pane>
            <el-tab-pane>
                <template #label>
                    <div>
                        <i class="fas fa-fan"> 花间集</i>
                    </div>
                </template>
                <GuShiHuaJianJi />
            </el-tab-pane>
            <el-tab-pane label="全唐诗">
                <template #label>
                    <div>
                        <i style="font-weight: 800;">唐</i>
                        &nbsp全唐诗
                    </div>
                </template>
                <GuShiTangShi />
            </el-tab-pane>
            <el-tab-pane>
                <template #label>
                    <div>
                        <i style="font-weight: 800;">宋</i>
                        &nbsp全宋词
                    </div>
                </template>
                <GuShiSongCi />
            </el-tab-pane>
        </el-tabs>
    </article>
</template>

<script>
    import GuShiJingXuan from './GuShi/GuShiJingXuan.vue'
    import GuShiTangSong from './GuShi/GuShiTangSong.vue'
    import GuShiYuanQu from './GuShi/GuShiYuanQu.vue'
    import GuShiNanTang from './GuShi/GuShiNanTang.vue'
    import GuShiTangShi from './GuShi/GuShiTangShi.vue'
    import GuShiSongCi from './GuShi/GuShiSongCi.vue'
    import GuShiHuaJianJi from './GuShi/GuShiHuaJianJi.vue'
    import GuShiJiaoYu from './GuShi/GuShiJiaoYu.vue'
    import 'element-plus/theme-chalk/display.css'

    export default {
        name: 'GuShi',
        components: {
            GuShiJingXuan,
            GuShiTangSong,
            GuShiYuanQu,
            GuShiNanTang,
            GuShiSongCi,
            GuShiTangShi,
            GuShiHuaJianJi,
            GuShiJiaoYu
        }
    }
</script>

<style>
    .gushi-tabs {
        width: 100%;
        height: 100%;
    }
    .el-tabs__nav>div>div {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .el-tabs__item {
        height: 4rem;
        width: 100%;
    }
</style>