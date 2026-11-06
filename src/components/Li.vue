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
    props: ['title','name','details','id'],
}
</script>

<style scoped>
  span {
    float: right;
    color: var(--jade);
    font-size: 0.85rem;
    letter-spacing: 2px;
  }

  h4 {
    margin: 0 0 0.3rem;
    color: var(--ink);
    font-family: var(--font-display);
    font-size: 1.35rem;
    letter-spacing: 3px;
  }

  p {
    margin: 0;
    color: var(--ink-soft);
    font-size: 0.9rem;
    letter-spacing: 1px;
  }
</style>
