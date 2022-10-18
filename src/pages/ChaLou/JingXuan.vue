<template>
  <!-- 精选诗文 -->
  <ul class="box-ul" v-loading="loading">
    <li
      @click="xiangQing(item)"
      v-for="item in liArrUl[ArrText - 1]"
      :key="item.id"
    >
      <UserLi
        :title="item.author"
        :name="item.poemName"
        :details="item.textBody"
        :id="item.id"
      />
    </li>
  </ul>
  <section class="sec-pag">
    <el-pagination
      class="pagination hidden-sm-and-down"
      background
      layout="prev, pager, next"
      :current-page="ArrText"
      @update:current-page="currentPageClick"
      :page-count="liArrUl.length"
    />
  </section>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import UserLi from "../../components/UserLi.vue";
import axios from "axios";
import { useRouter } from "vue-router";
import supabase from '../function/supabase.js'

export default {
  name: "JingXuan",
  components: {
    UserLi,
  },
  setup() {
    const $router = useRouter();
    let liArr = ref([]);

    // 数据分页
    let liArrUl = computed(() => {
      let Arr = [];
      while (liArr.value.length / 8) {
        Arr.push(liArr.value.splice(0, 8));
      }
      return Arr;
    });

    // 页数更新
    let ArrText = ref(1);
    function currentPageClick(abc) {
      ArrText.value = abc;
    }

    function xiangQing(value) {
      $router.push({
        name: "details",
        query: {
          shici: JSON.stringify(value),
        },
      });
    }

    let loading = ref(false);
    onMounted(() => {
      async function asyncFunc() {

      loading.value = true        //加载动画启动

      let { data: response, error } = await supabase           // 请求数据
        .from('customgushici')
        .select('*')

      // author:作者   // tag:标签  // poemName:诗名  // textBody:正文

      loading.value = false

      liArr.value = response;

      }

      asyncFunc();

      // axios
      //   .get(`https://lan-ze-user.vercel.app/api/user/getCustomShiCi`)
      //   .then((response) => {
      //     loading.value = false;
      //     liArr.value = response.data;
      //   })
      //   .catch((error) => {
      //     console.log(error);
      //   });
    });

    return {
      liArr,
      loading,
      liArrUl,
      currentPageClick,
      ArrText,
      xiangQing,
    };
  },
};
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
.box-ul {
  min-height: 100vh;
}
.sec-pag {
  display: flex;
  justify-content: center;
}
</style>