<template>
  <article class="box">
    <h1>发布作品</h1>
    <div class="col-11 col-md-9 col-xl-8">
      <form action="">
        <div>
          <label for="origin" class="form-label">诗词名：</label>
          <input v-model="form.origin" class="form-control" type="text" id="origin" aria-label="诗词名">
        </div>
        <div>
          <label for="author" class="form-label">作者：</label>
          <input v-model="form.author" class="form-control" type="text" id="author" aria-label="作者">
        </div>
        <div>
          <label for="category" class="form-label">标签：</label>
          <input v-model="form.category" class="form-control" type="text" id="category" aria-label="标签">
        </div>
        <div>
          <label for="content" class="form-label">正文：</label>
          <textarea class="form-control" v-model="form.content" id="content" aria-label="正文"></textarea>
        </div>
        <div>
          <label for="title" class="form-label">注释：</label>
          <textarea class="form-control" v-model="form.title" id="title" aria-label="注释"></textarea>
        </div>
        <div class="mt-3">
          <button class="btn btn-success" type="button" @click="onSubmit" aria-label="提交作品">提交</button>
        </div>
      </form>
    </div>
  </article>
</template>

<script>
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { userPublishPoem } from "../../../apis/api/login.js";
import { useSession } from "../../../composables/useSession.js";

export default {
  name: "publishPoem",
  setup() {
    const $router = useRouter()
    const { isLoggedIn, profile } = useSession()

    let form = reactive({
      origin: "",
      author: "",
      category: "",
      content: "",
      title: "",
    });

    async function onSubmit() {
      if (!isLoggedIn.value) {
        ElMessage({ type: 'warning', message: '请先登录后再发布作品' });
        $router.push({ name: 'loginindex' });
        return;
      }
      if (!form.origin.trim() || !form.content.trim()) {
        ElMessage({ type: 'warning', message: '诗词名与正文不能为空！' });
        return;
      }
      const response = await userPublishPoem({
        origin: form.origin.trim(),
        author: form.author.trim() || profile.value.user_name,
        category: form.category.trim() || '用户作品',
        content: form.content.trim(),
        title: form.title.trim(),
      });
      if (Number(response?.code) !== 200) {
        ElMessage({ type: 'error', message: response?.msg || '发布失败，请稍后重试' });
        return;
      }
      ElMessage({ type: 'success', message: '发布成功！' });
      Object.keys(form).forEach((key) => { form[key] = ""; });
      $router.push({ name: 'samplereels' });
    }

    return {
      form,
      onSubmit
    };
  },
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

article {
  width: 100%;
  min-height: 700px;
  display: flex;
  align-items: center;
  flex-direction: column;
}
</style>
