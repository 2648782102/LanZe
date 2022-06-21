<template>
    <!-- 古诗类 -->
    <article>
        <el-tabs class="gushi-tabs">
            <el-tab-pane label="精选文集"><GuShiJingXuan/></el-tab-pane>
            <el-tab-pane label="唐诗.宋词"><GuShiTangSong/></el-tab-pane>
            <el-tab-pane label="元曲"><GuShiYuanQu/></el-tab-pane>
            <el-tab-pane label="南唐二主词"><GuShiNanTang/></el-tab-pane>
            <el-tab-pane label="全唐诗"><GuShiTangShi/></el-tab-pane>
            <el-tab-pane label="全宋词"><GuShiSongCi/></el-tab-pane>
            <el-tab-pane label="教育"><GuShiJiaoYu/></el-tab-pane>
            <el-tab-pane label="花间集"><GuShiHuaJianJi/></el-tab-pane>
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

<style scoped>
    .gushi-tabs {
        width: 100%;
        padding-right: 20px;
    }
</style>