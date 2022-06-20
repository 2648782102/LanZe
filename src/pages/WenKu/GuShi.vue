<template>
    <!-- 古诗类 -->
    <article>
        <el-tabs class="gushi-tabs">
            <el-tab-pane label="精选文集"><GuShiJingXuan/></el-tab-pane>
            <el-tab-pane label="唐诗.宋词"><GuShiTangSong/></el-tab-pane>
            <el-tab-pane label="天 气"><GuShiTianQi/></el-tab-pane>
            <el-tab-pane label="人 物"><GuShiRenWu/></el-tab-pane>
            <el-tab-pane label="人 生"><GuShiRenSheng/></el-tab-pane>
            <el-tab-pane label="节 日"><GuShiJieRi/></el-tab-pane>
            <el-tab-pane label="生 活"><GuShiShengHuo/></el-tab-pane>
            <el-tab-pane label="选 集"><GuShiXuanJi/></el-tab-pane>
        </el-tabs>
    </article>
</template>

<script>
    import GuShiJingXuan from './GuShi/GuShiJingXuan.vue'
    import GuShiTangSong from './GuShi/GuShiTangSong.vue'
    import GuShiTianQi from './GuShi/GuShiTianQi.vue'
    import GuShiRenWu from './GuShi/GuShiRenWu.vue'
    import GuShiRenSheng from './GuShi/GuShiRenSheng.vue'
    import GuShiJieRi from './GuShi/GuShiJieRi.vue'
    import GuShiXuanJi from './GuShi/GuShiXuanJi.vue'
    import GuShiShengHuo from './GuShi/GuShiShengHuo.vue'

export default {
    name: 'GuShi',
    components: {
        GuShiJingXuan,
        GuShiTangSong,
        GuShiTianQi,
        GuShiRenWu,
        GuShiRenSheng,
        GuShiJieRi,
        GuShiXuanJi,
        GuShiShengHuo
    }
}
</script>

<style scoped>
    .gushi-tabs {
        width: 100%;
        padding-right: 20px;
    }
</style>