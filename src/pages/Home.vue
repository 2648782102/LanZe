<template>
  <article>
    <section>
      <el-container>
        <el-header style="padding: 0;">
          <el-affix :offset="0">
            <el-menu router default-active="/zhailu"
              class="el-menu-demo" mode="horizontal">
              <!-- 网站logo -->
              <el-col :span="2" :offset="0" class="log-col">
                <el-image @click="$router.push({name:'home'})" class="logo-img" :src="logoUrl" fit="fill" lazy></el-image>
              </el-col>
              <el-col :span="15" :offset="0" class="input-col">
                <!-- 搜索框 -->
                <el-input @focus="elinput1focus = true" @blur="elinput1focus = false" class="me-2 elinput1"
                  :class="elinput1focus?'elinput1focus':''" v-model="inputS" placeholder="搜索诗词" prefix-icon="Search"
                  clearable @keyup.enter="inputEnter"/>
              </el-col>
              <!-- 右侧导航 -->
              <el-menu-item index="/zhailu">涉猎</el-menu-item>
              <el-menu-item index="/wenku">文库</el-menu-item>
              <el-menu-item index="/chashe">茶楼</el-menu-item>
              <el-menu-item index="/duxue">笃学</el-menu-item>
              <!-- 个人中心下拉菜单 -->
              <el-sub-menu index="4">
                <template #title>个人中心</template>
                <el-menu-item index="personalziLiao">个人资料</el-menu-item>
                <el-menu-item index="favorite">收藏</el-menu-item>
                <el-menu-item index="samplereels">作品</el-menu-item>
                <el-menu-item index="shezhi">设置</el-menu-item>
              </el-sub-menu>
            </el-menu>
          </el-affix>
        </el-header>
        <section class="section-main">
          <el-scrollbar height="100vh">
          <!-- 主体部分 -->
          <main>
            <el-scrollbar>
                <router-view></router-view>
            </el-scrollbar>
          </main>
          <!-- 底部 -->
          <el-footer class="footer mt-2">
            <el-row justify="center">
              <el-col class="footerCol" :span="24" :offset="0">
                <h4>本站仅供学习交流使用，不得用于一切商业盈利活动</h4>
              </el-col>
            </el-row>
          </el-footer>
          </el-scrollbar>
        </section>
      </el-container>
    </section>
  </article>
</template>

<script>
  import { ref,watch } from 'vue'
  import logo from '../assets/logo.png'
import axios from 'axios'
import { useRouter,useRoute } from "vue-router";

  export default {
    name: 'Home',
    setup() {
      // 路由器
      const $router = useRouter()
      const $route = useRoute()
      // 搜索框model
      let inputS = ref('')
      // 发送请求返回根据输入框内容搜索到的内容
      function inputEnter() {
        axios.get(`http://192.168.44.1:3000/api/GuShiCiApi/ChaXun.php?author=${inputS.value}`)
        .then(response => {
          // author:词人姓名 paragraphs：内容 rhythmic：词牌名 tags：类型
          // console.log(response.data[0]);
          let dataArr = JSON.stringify(response.data[0])    
          inputS.value = '';
          // 路由切换，query传参
          $router.push({
            name: 'searchul',
            query:{
              ulArr:dataArr
            }
        })
        })
        .catch(function(error) {
          console.log(error);
        })
      }

      // 解决路由切换后滚动条不重置问题
      // watch($route,(newvalue,oldvalue) => {
        // document.getElementById("main").scrollIntoView()
        // document.getElementById('main').scrollTop = 0
        // console.log(document.getElementById('main').scrollTop);
      // })

      // logo图片
      let logoUrl = logo
      // 搜索框状态，聚焦/失焦
      let elinput1focus = ref(false)

      return {
        inputS,
        logoUrl,
        elinput1focus,
        inputEnter
      }
    }
  }
</script>

<style scoped>
  * {
    box-sizing: border-box;
  }

  article {
    display: flex;
    justify-content: center;
    /* background-image: url(../assets/beijing/home1.jpg); */
    background-color: aliceblue;
  }

  section {
    width: 100%;
  }

  .log-col {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .input-col {
    display: flex;
    align-items: center;
  }

  .logo-img {
    width: 2rem;
    height: 2rem;
    cursor: pointer;
  }

  .elinput1 {
    transition: width 0.5s ease-in-out;
    width: 5rem;
  }

  .elinput1focus {
    width: 16rem;
  }

  .el-menu-demo {
    box-shadow: 0 5px 8px rgba(205, 219, 221, 0.392);
  }

  .footer {
    min-height: 20vh;
    background-color: rgba(37, 37, 42, 0.98);
    color: white;
  }
  .footerCol {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>