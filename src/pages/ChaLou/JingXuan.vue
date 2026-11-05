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
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { PoetryCustom } from "../../apis/api/list.js";
import { normalizeListResponse } from "../../utils/response.js";

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
      const pages = [];
      const items = [...liArr.value];
      while (items.length) pages.push(items.splice(0, 8));
      return pages;
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
    onMounted(async () => {
      loading.value = true;
      try {
        const response = await PoetryCustom();
        liArr.value = normalizeListResponse(response, []);
      } catch (error) {
        ElMessage({ message: error?.message || "作品加载失败", type: "warning" });
      } finally {
        loading.value = false;
      }
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
