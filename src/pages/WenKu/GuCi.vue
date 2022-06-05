<template>
    <!-- 古词类 -->
    <article>
        <el-tabs style="height: 100%" class="gushi-tabs">
        <el-tab-pane label="四 季">古词</el-tab-pane>
        <el-tab-pane label="山 水">山水</el-tab-pane>
        <el-tab-pane label="天 气">天气</el-tab-pane>
        <el-tab-pane label="人 物">人物</el-tab-pane>
        <el-tab-pane label="人 生">人生</el-tab-pane>
        <el-tab-pane label="节 日">节日</el-tab-pane>
        <el-tab-pane label="生 活">生活</el-tab-pane>
        <el-tab-pane label="选 集">选集</el-tab-pane>
        </el-tabs>
    </article>
</template>

<script>
export default {
    name: 'GuCi'
}
</script>

<style scoped>
    .el-tabs__item {
        width: 6rem;
        text-align: center;
    }
</style>