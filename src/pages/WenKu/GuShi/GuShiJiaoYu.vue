<template>
  <section>
    <el-carousel height="92vh" direction="vertical" :autoplay="false">
      <el-carousel-item>
        <GuShiDiv :address="''" :title="book[0].title" :author="book[0].author" :age="book[0].age"
          :synopsis="book[0].synopsis" />
      </el-carousel-item>
      <el-carousel-item>
        <GuShiDiv :address="''" :title="book[1].title" :author="book[1].author" :age="book[1].age"
          :synopsis="book[1].synopsis" />
      </el-carousel-item>
      <el-carousel-item>
        <GuShiDiv :address="''" :title="book[2].title" :author="book[2].author" :age="book[2].age"
          :synopsis="book[2].synopsis" />
      </el-carousel-item>
      <el-carousel-item>
        <GuShiDiv :address="''" :title="book[3].title" :author="book[3].author" :age="book[3].age"
          :synopsis="book[3].synopsis" />
      </el-carousel-item>
    </el-carousel>
  </section>
</template>

<script>
  import GuShiDiv from "../../../components/GuShiDiv.vue";

  export default {
    name: 'GuShiJiaoYu',
    components: {
      GuShiDiv
    },
    setup() {
      // 封面固定组件传值数组
      const book = [
        {
          title: "小学课本诗词",
          author: "佚名",
          age: "现代",
          synopsis:
            "小学课本所出现诗词",
        },
        {
          title: "初高中课本诗集",
          author: "佚名",
          age: "现代",
          synopsis:
            "初中高中课本所出现诗词",
        },
        {
          title: "四书五经",
          author: "佚名",
          age: "...",
          synopsis:
            "四书五经是中国儒家经典的书籍，四书《大学》、《论语》、《孟子》、《中庸》是儒家文化思想教育的基本教材；五经《诗经》、《尚书》、《礼记》、《周易》、《春秋》这五部经典的合称。四书之名始于宋朝，五经之名始于汉武帝。",
        },
        {
          title: "蒙学",
          author: "佚名",
          age: "...",
          synopsis:
            "启蒙诗词",
        },
      ];

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