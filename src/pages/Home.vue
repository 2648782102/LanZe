<template>
  <article>
    <section>
      <el-container>
        <el-header style="padding: 0;">
          <el-affix :offset="0">
            <el-menu router default-active="/zhailu"
              class="el-menu-demo" mode="horizontal" @select="handleSelect">
              <el-col :span="2" style="text-align: center;" :offset="0">
                <el-image @click="$router.push({name:'productdisplay'})" class="logo-img" :src="logoUrl" fit="fill" lazy></el-image>
              </el-col>
              <el-col :span="15" :offset="0">
                <!-- 搜索框 -->
                <el-input @focus="elinput1focus = true" @blur="elinput1focus = false" class="me-2 elinput1"
                  :class="elinput1focus?'elinput1focus':''" v-model="inputS" placeholder="搜索诗词" prefix-icon="Search"
                  clearable />
              </el-col>
              <el-menu-item index="/zhailu">摘录</el-menu-item>
              <el-menu-item index="/wenku">文库</el-menu-item>
              <el-menu-item index="/chashe">茶社</el-menu-item>
              <el-menu-item index="/duxue">笃学</el-menu-item>
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
        <main>
          <router-view></router-view>
        </main>
        <el-footer class="footer">
          <el-row justify="center">
            <el-col :span="24" :offset="0">
              <h1>底部</h1>
            </el-col>
          </el-row>
        </el-footer>
      </el-container>
    </section>
  </article>
</template>

<script>
  import { ref } from 'vue'
  import logo from '../assets/logo.png'

  export default {
    name: 'Home',
    setup() {
      // 搜索框model
      let inputS = ref('')
      // logo图片
      let logoUrl = logo
      // 搜索框状态，聚焦/失焦
      let elinput1focus = ref(false)

      return {
        inputS,
        logoUrl,
        elinput1focus,
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
    background-image: url(../assets/beijing/home1.jpg);
  }

  section {
    width: 100%;
    overflow: hidden;
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
    background-color: rgba(37, 37, 42, 0.95);
    color: white;
  }
</style>