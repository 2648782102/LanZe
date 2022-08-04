<template>
  <section>
    <el-carousel height="92vh" direction="vertical" :autoplay="false">
      <el-carousel-item>
        <GuShiDiv :address="'chuci'" :title="book[0].title" :author="book[0].author" :age="book[0].age"
          :synopsis="book[0].synopsis" />
      </el-carousel-item>
      <el-carousel-item>
        <GuShiDiv :address="'shijing'" :title="book[1].title" :author="book[1].author" :age="book[1].age"
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
    name: "GuShiJingXuan",
    components: {
      GuShiDiv,
    },
    setup() {

      // 封面固定组件传值数组
      const book = [
        {
          title: "楚辞",
          author: "屈原",
          age: "战国",
          synopsis:
            "楚辞，也作“楚词”，是战国时期楚国诗人屈原创作的一种新的诗歌体裁。屈原的抒情长诗《离骚》，具有浪漫主义风格，是楚辞的代表作，楚辞因此又称为“骚体”。",
        },
        {
          title: "诗经",
          author: "佚名",
          age: "西周初至春秋中叶",
          synopsis:
            "《诗经》，是中国古代诗歌的开端，最早的一部诗歌总集，收集了西周初年至春秋中叶（前11世纪至前6世纪）的诗歌，共311篇，其中6篇为笙诗，即只有标题，没有内容，称为笙诗六篇（《南陔》《白华》《华黍》《由庚》《崇丘》《由仪》），反映了周初至周晚期约五百年间的社会面貌。",
        },
        {
          title: "曹操诗集",
          author: "曹操",
          age: "东汉末",
          synopsis:
            "魏武帝曹操（155年 [1]  —220年3月15日 [2]  ），字孟德，一名吉利，小字阿瞒 [164]  ，一说本姓夏侯 [169]  ，沛国谯县（今安徽省亳州市）人 [3-4]  。中国古代杰出的政治家、军事家、文学家、书法家、诗人 [5-6]  。东汉末年权相，太尉曹嵩之子，曹魏的奠基者。",
        },
        {
          title: "论语",
          author: "孔子及其弟子",
          age: "春秋战国",
          synopsis:
            "《论语》（lún yǔ），是春秋时期思想家、教育家孔子的弟子及再传弟子记录孔子及其弟子言行而编成的语录文集，成书于战国前期。全书共20篇492章，以语录体为主，叙事体为辅，较为集中地体现了孔子及儒家学派的政治主张、伦理思想、道德观念、教育原则等。作品多为语录，但辞约义富，有些语句、篇章形象生动。",
        },
      ];

      return {
        book,
      };
    },
  };
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
    height: 100%;
  }
</style>