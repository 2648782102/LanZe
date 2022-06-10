<template>
    <!-- 精选诗文 -->
  <ul>
    <li v-for="(item,index) in liArr" :key="index">
      <Li :title="item.title" :name="item.name" :details="item.details" />
    </li>
  </ul>
</template>

<script>
  import {ref} from 'vue'
  import Li from '../../components/Li.vue'

export default {
    name: 'JingXuan',
    components: {
      Li
    },
    setup() {
      let liArr = ref([
        {
          name:'清平乐.雨晴烟晚',
          title:'[五代]冯延己',
          details:'雨晴烟晚，绿水新池满。双燕归来垂柳院，...'
        },
        {
          name:'鹧鸪天.彩袖殷勤捧玉钟',
          title:'[宋代]晏几道',
          details:'彩袖殷勤捧玉钟，去年拚却醉颜红，舞低杨柳楼心月，...'
        },
        {
          name:'清平乐.雨晴烟晚',
          title:'[4代]冯延己',
          details:'雨晴烟晚，绿水新池满。双燕归来垂柳院，...'
        },
        {
          name:'清平乐.雨晴烟晚',
          title:'[五代]冯延己',
          details:'雨晴烟晚，绿水新池满。双燕归来垂柳院，...'
        },
        {
          name:'清平乐.雨晴烟晚',
          title:'[五代]冯延己',
          details:'雨晴烟晚，绿水新池满。双燕归来垂柳院，...'
        },
        {
          name:'清平乐.雨晴烟晚',
          title:'[五代]冯延己',
          details:'雨晴烟晚，绿水新池满。双燕归来垂柳院，...'
        },
      ])

      return {
        liArr
      }
    }
}
</script>

<style scoped>
  ul {
    list-style-type: none;
    margin: 0;
    padding: 0 1rem 0 1rem;
  }
  li {
    padding: 1rem 1rem 0 1rem;
    border-radius: 0.4rem;
    cursor: pointer;
  }
  li:hover {
    background-color: rgba(240, 248, 255, 0.781);
  }
</style>