<template>
    <!-- 详情页 -->
    <article>
        <el-row class="elrow pt-2" :gutter="20" justify="center">
            <el-col class="bgwhite" :span="16" :offset="0">
                <p>作者：</p>
                <p>朝代：</p>
                <p>朝代：</p>
                <p>朝代：</p>
                <p>朝代：</p>
                <p>朝代：</p>
            </el-col>
        </el-row>
    </article>
</template>

<script>


export default {
    name: 'details'
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