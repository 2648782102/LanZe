<template>
  <article class="box">
    <h1>发布作品</h1>
    <div class="col-11 col-md-9 col-xl-8">
      <form action="">
        <div>
          <label for="origin" class="form-label">诗词名：</label>
          <input v-model="form.origin" class="form-control" type="text" id="origin">
        </div>
        <div>
          <label for="author" class="form-label">作者：</label>
          <input v-model="form.author" class="form-control" type="text" id="author">
        </div>
        <div>
          <label for="category" class="form-label">标签：</label>
          <input v-model="form.category" class="form-control" type="text" id="category">
        </div>
        <div>
          <label for="content" class="form-label">正文：</label>
          <textarea class="form-control" v-model="form.content" type="text" id="content"></textarea>
        </div>
        <div>
          <label for="title" class="form-label">注释：</label>
          <textarea class="form-control" v-model="form.title" type="text" id="title"></textarea>
        </div>
        <div class="mt-3">
          <button class="btn btn-success" @click="onSubmit">提交</button>
        </div>
      </form>
    </div>
  </article>
</template>

<script>
import { reactive,ref } from "@vue/reactivity";
import { useRouter } from "vue-router";
import axios from 'axios';
import { ElMessage } from "element-plus";

export default {
  name: "publishPoem",
  setup() {
    const $router = useRouter()

    let form = reactive({
      origin: "",
      author: "",
      category: "",
      content: "",
      title: "",
    });

    function onSubmit() {
      if(form.origin,form.author,form.category,form.content,form.title) {
        let id = $cookies.get('lanze_user').id
        axios.get(`https://lan-ze-user.vercel.app/api/user/addGuShiCi?id=${id}&origin=${form.origin}&author=${form.author}
      &category=${form.category}&content=${form.content}&title=${form.title}`)
      .then(response => {
        console.log(response.data);
        if(response.data=='ok') {
          ElMessage({
            type:'success',
            message:'发布成功！'
          })
          $router.push({
            name: 'kongbai'
          })
        }
      })
      .catch(error => {
        console.log(error);
      })
      } else {
        alert('不能为空！')
      }
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