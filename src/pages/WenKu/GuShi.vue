<template>
  <!-- 古诗类 -->
  <article v-loading="loading">
    <el-row :gutter="30" justify="space-evenly">
      <el-col
        :xs="20"
        :sm="12"
        :md="8"
        :lg="6"
        :xl="6"
        v-for="(item, index) in carArr"
        :key="index"
        class="el-col"
        :span="6"
      >
        <el-card class="elCard" @click="asyncFunc(item.to)" shadow="hover" :body-style="{ padding: '0px' }">
          <img
            :src="item.imgSrc"
            class="image"
          />
          <div class="car-div">
            <h1>{{ item.title }}</h1>
            <p>作者或主要人物：{{ item.author }}</p>
            <p>时期：{{ item.age }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 大屏幕时在左边 -->
    <!-- <el-tabs type="border-card" tab-position="left" class="gushi-tabs hidden-sm-and-down">
            <el-tab-pane>
                <template #label>
                    <div>
                        <i class="fas fa-star"> 精选文集</i>
                    </div>
                </template>
                <GuShiJingXuan />
            </el-tab-pane>
            <el-tab-pane>
                <template #label>
                    <div>
                        <i class="fas fa-cannabis"> 唐诗.宋词</i>
                    </div>
                </template>
                <GuShiTangSong />
            </el-tab-pane>
            <el-tab-pane>
                <template #label>
                    <div>
                        <i class="fas fa-music"> 元曲</i>
                    </div>
                </template>
                <GuShiYuanQu />
            </el-tab-pane>
            <el-tab-pane>
                <template #label>
                    <div>
                        <i class="fas fa-feather-alt"> 南唐二主词</i>
                    </div>
                </template>
                <GuShiNanTang />
            </el-tab-pane>
            <el-tab-pane>
                <template #label>
                    <div>
                        <i class="fas fa-user-graduate"> 教育</i>
                    </div>
                </template>
                <GuShiJiaoYu />
            </el-tab-pane>
            <el-tab-pane>
                <template #label>
                    <div>
                        <i class="fas fa-fan"> 花间集</i>
                    </div>
                </template>
                <GuShiHuaJianJi />
            </el-tab-pane>
            <el-tab-pane label="全唐诗">
                <template #label>
                    <div class="gushi-tabs-span">
                        <i style="font-weight: 800;">唐</i>
                        &nbsp全唐诗
                    </div>
                </template>
                <GuShiTangShi />
            </el-tab-pane>
            <el-tab-pane>
                <template #label>
                    <div class="gushi-tabs-span">
                        <i style="font-weight: 800;">宋</i>
                        &nbsp全宋词
                    </div>
                </template>
                <GuShiSongCi />
            </el-tab-pane>
        </el-tabs>
         小屏幕时在上边 -->
    <!-- <el-tabs :stretch="true" type="border-card" tab-position="top" class="gushi-tabs hidden-md-and-up">
            <el-tab-pane>
                <template #label>
                    <div>
                        <i class="fas fa-star"> 精选文集</i>
                    </div>
                </template>
                <GuShiJingXuan />
            </el-tab-pane>
            <el-tab-pane>
                <template #label>
                    <div>
                        <i class="fas fa-cannabis"> 唐诗.宋词</i>
                    </div>
                </template>
                <GuShiTangSong />
            </el-tab-pane>
            <el-tab-pane>
                <template #label>
                    <div>
                        <i class="fas fa-music"> 元曲</i>
                    </div>
                </template>
                <GuShiYuanQu />
            </el-tab-pane>
            <el-tab-pane>
                <template #label>
                    <div>
                        <i class="fas fa-feather-alt"> 南唐二主词</i>
                    </div>
                </template>
                <GuShiNanTang />
            </el-tab-pane>
            <el-tab-pane>
                <template #label>
                    <div>
                        <i class="fas fa-user-graduate"> 教育</i>
                    </div>
                </template>
                <GuShiJiaoYu />
            </el-tab-pane>
            <el-tab-pane>
                <template #label>
                    <div>
                        <i class="fas fa-fan"> 花间集</i>
                    </div>
                </template>
                <GuShiHuaJianJi />
            </el-tab-pane>
            <el-tab-pane label="全唐诗">
                <template #label>
                    <div>
                        <i style="font-weight: 800;">唐</i>
                        &nbsp全唐诗
                    </div>
                </template>
                <GuShiTangShi />
            </el-tab-pane>
            <el-tab-pane>
                <template #label>
                    <div>
                        <i style="font-weight: 800;">宋</i>
                        &nbsp全宋词
                    </div>
                </template>
                <GuShiSongCi />
            </el-tab-pane>
        </el-tabs> -->
  </article>
</template>

<script>
// import GuShiJingXuan from './GuShi/GuShiJingXuan.vue'
// import GuShiTangSong from './GuShi/GuShiTangSong.vue'
// import GuShiYuanQu from './GuShi/GuShiYuanQu.vue'
// import GuShiNanTang from './GuShi/GuShiNanTang.vue'
// import GuShiTangShi from './GuShi/GuShiTangShi.vue'
// import GuShiSongCi from './GuShi/GuShiSongCi.vue'
// import GuShiHuaJianJi from './GuShi/GuShiHuaJianJi.vue'
// import GuShiJiaoYu from './GuShi/GuShiJiaoYu.vue'
import "element-plus/theme-chalk/display.css";
import { reactive,ref } from "vue";
import { useRouter } from "vue-router";
import chuci1 from "../../assets/beijing/chuci1.jpg";
import shijing1 from "../../assets/beijing/shijing1.jpg";
import songci300 from "../../assets/beijing/songci300.jpg";
import caocao from "../../assets/beijing/caocao.jpg";
import tangshi300 from "../../assets/beijing/tangshi300.jpg";
import supabase from "../../function/supabase.js";
import {PoetryClass} from '../../apis/api/list';


export default {
  name: "GuShi",
  setup() {
    let $router = useRouter()

    let carArr = reactive([
      {
        title: "楚辞",
        author: "屈原",
        age: "战国",
        imgSrc: chuci1,
        to:'chuci'
      },
      {
        title: "诗经",
        author: "佚名",
        age: "西周初至春秋中叶",
        imgSrc: shijing1,
        to:'shijing'
      },
      {
        title: "曹操诗集",
        author: "曹操",
        age: "东汉末",
        imgSrc: caocao,
        to:'caocao'
      },
      {
        title: "唐诗三百",
        author: "李白 杜甫...",
        age: "唐",
        imgSrc: tangshi300,
        to:1
      },
      {
        title: "宋词三百",
        author: "苏轼 李清照...",
        age: "宋",
        imgSrc: songci300,
        to:2
      },
    ]);

    // 加载控制
      let loading = ref(false)

    async function asyncFunc(va1) {


        loading.value = true        //加载动画启动

        // let { data: response, error } = await supabase           // 请求数据
        // .from(va1)
        // .select('*')

        let params = {
          type:va1
        }

        let response = await PoetryClass(params)

        console.log(response.data);
        console.log("------------------->");



        // author:作者   // tag:标签  // poemName:诗名  // textBody:正文

        loading.value = false

        let tangArr = JSON.stringify(response.data)

        $router.push({
              name: 'searchul',
              query: {
                ulArr: tangArr
              }
            })
      }
      

      // function carTo(value) {
      //   asyncFunc(value)
      // }

    return {
      carArr,
      asyncFunc,
      loading
    };
  },
  // components: {
  //     GuShiJingXuan,
  //     GuShiTangSong,
  //     GuShiYuanQu,
  //     GuShiNanTang,
  //     GuShiSongCi,
  //     GuShiTangShi,
  //     GuShiHuaJianJi,
  //     GuShiJiaoYu
  // }
};
</script>

<style scoped>
article {
  padding: 20px 20px 0 20px;
}

.gushi-tabs {
  width: 100%;
  height: 100%;
}
.el-tabs__nav > div > div {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.el-tabs__item {
  height: 4rem;
  width: 100%;
}

.elCard {
  cursor: pointer;
}

.image {
  width: 100%;
  height: 300px;
  display: block;
}

.el-col {
  margin-bottom: 20px;
}

.car-div {
  width: 100%;
  height: 100%;
  padding: 20px;
}

.car-div > p {
  font-size: 0.8rem;
  color: rgb(105, 105, 105);
  margin: 0;
}
</style>