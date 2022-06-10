<template>
    <!-- 搜索，茶社等列表的子项(li)中组件，复用率最高 -->
    <span>{{ title }}</span>
    <h4>{{ name }}</h4>
    <p>{{ details }}</p>
    <el-divider />
</template>

<script>
export default {
    name:'Li',
    props: ['title','name','details'],
}
</script>

<style scoped>
    span {
    float: right;
  }
  p,span {
    color: rgb(152, 152, 152);
  }
</style>