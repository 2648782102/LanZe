<template>
  <section>
    <el-carousel height="92vh" direction="vertical" :autoplay="false">
      <el-carousel-item @click="TangShi">
        <GuShiDiv :address="'tangshi300'" :title="book[0].title" :author="book[0].author" :age="book[0].age"
          :synopsis="book[0].synopsis" />
      </el-carousel-item>
      <el-carousel-item @click="SongCi">
        <GuShiDiv :address="'songci300'" :title="book[1].title" :author="book[1].author" :age="book[1].age"
          :synopsis="book[1].synopsis" />
      </el-carousel-item>
    </el-carousel>
  </section>
</template>

<script>
  import GuShiDiv from "../../../components/GuShiDiv.vue";

  export default {
    name: 'GuShiTangSong',
    components: {
      GuShiDiv
    },
    setup() {
      const book = [
        { title: '唐诗三百首', author: '李白 杜甫...', age: '唐', synopsis: '绿蚁新醅酒，红泥小火炉。横吹曲辞 关山月。相和歌辞 燕歌行。将进酒，杯莫停，与君歌一曲，请君为我倾耳听！' },
        { title: '宋词三百首', author: '苏轼 李清照...', age: '宋', synopsis: '齐天乐 菩萨蛮。虞美人 临江仙。薄暮浓云愁永昼，瑞脑消金兽。莫听穿林打叶声，何妨吟啸且徐行，竹杖芒鞋轻胜马，谁怕！' },
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