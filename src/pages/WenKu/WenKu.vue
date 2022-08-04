<template>
  <!-- 文库栏 -->
  <article>
    <el-main>
      <el-row justify="center">
        <el-col class="bgwhite elcol1" :xs="24" :sm="22" :md="20" :lg="20" :xl="16">
          <!-- 主体 -->
          <div class="w-100">
            <router-view></router-view>
          </div>
        </el-col>
      </el-row>
    </el-main>
  </article>
</template>

<script>
  import { ref,watch,computed } from 'vue'
  export default {
    name: 'WenKu',
    setup() {

    }
  }
</script>

<style scoped>
  .elcol1 {
    display: flex;
    padding-top: 2rem;
    padding: 0;
    font-family: FangZhengSong;
  }
</style>