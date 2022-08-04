<template>
  <section>
    <el-carousel height="92vh" direction="vertical" :autoplay="false">
      <el-carousel-item>
        <GuShiDiv :address="'yuanqu'" :title="book[0].title" :author="book[0].author" :age="book[0].age"
          :synopsis="book[0].synopsis" />
      </el-carousel-item>
    </el-carousel>
  </section>
</template>

<script>
  import GuShiDiv from "../../../components/GuShiDiv.vue";

  export default {
    name: 'GuShiYuanQu',
    components: {
      GuShiDiv
    },
    setup() {
      // 封面固定组件传值数组
      const book = [
        { title: '元曲', author: '关汉卿 马致远 白朴 郑光祖...', age: '元', synopsis: '元曲是盛行于元代的一种文艺形式，为元代儒客文人智慧精髓，包括杂剧和散曲，有时专指杂剧。 杂剧，宋代以滑稽搞笑为特点的一种表演形式，元代发展成戏曲形式。每本以四折为主，在开头或折间另加楔子，每折用同宫调同韵的北曲套曲和宾白组成。如关汉卿的《窦娥冤》等。流行于大都（今北京）一带。' },
      ]

      return {
        book
      }
    }
  }
</script>

<style scoped>
  * {
    box-sizing: border-box;
  }

  section {
    width: 100%;
    height: 100%;
  }

  .el-carousel {
    border-radius: 10px;
  }

</style>