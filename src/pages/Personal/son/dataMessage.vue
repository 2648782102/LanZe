<template>
  <!-- 修改资料 -->
  <article class="box" v-loading="loading">
    <el-form
      :model="form"
      class="p-5 col-12 col-lg-7 col-xl-9"
      label-position="right"
    >
      <div class="text-center mb-4">
        <h1>个人资料<i class="fab fa-jedi-order ms-2 tou-biao"></i></h1>
      </div>

      <el-form-item label="选择头像：">
        <div class="headImg">
          <el-image
            v-for="(item, index) in imgSrc"
            :key="index"
            @click="imgClick(index)"
            @keyup.enter="imgClick(index)"
            role="button"
            tabindex="0"
            :aria-label="`选择第 ${index + 1} 张头像`"
            :src="imgSrc[index]"
            :class="imgArr[index] ? 'activeImg' : ''"
            fit="cover"
          >
            <template #error>
              <div class="headBox">
                <el-icon>
                  <Picture />
                </el-icon>
              </div>
            </template>
          </el-image>
        </div>
      </el-form-item>

      <el-form-item prop="name" label="用户名称：">
        <el-input v-model="form.name" aria-label="用户名称" />
      </el-form-item>

      <el-form-item prop="intro" label="个性简介：">
        <el-input v-model="form.intro" aria-label="个性简介" />
      </el-form-item>
      <div class="mt-4 submit">
        <button
          class="col-4 col-md-4 btn"
          style="background: #5b99af; color: white"
          type="button"
          @click="submit"
          aria-label="提交个人资料"
        >
          提交审核
        </button>
      </div>
    </el-form>
  </article>
</template>

<script>
import { reactive, ref, onMounted, watch } from "vue";
import { ElMessage } from "element-plus";
import hoad1 from "../../../assets/hoad/hoad1.jpg";
import hoad2 from "../../../assets/hoad/hoad2.jpg";
import hoad3 from "../../../assets/hoad/hoad3.jpg";
import hoad4 from "../../../assets/hoad/hoad4.jpg";
import hoad5 from "../../../assets/hoad/hoad5.jpg";
import hoad6 from "../../../assets/hoad/hoad6.jpg";
import hoad7 from "../../../assets/hoad/hoad7.jpg";
import hoad8 from "../../../assets/hoad/hoad8.jpg";
import hoad9 from "../../../assets/hoad/hoad9.jpg";
import { useRouter } from "vue-router";
import { useSession } from "../../../composables/useSession.js";

export default {
  name: "dataMessage",
  setup() {
    const $router = useRouter();
    const { isLoggedIn, profile, updateProfile } = useSession();

    let form = reactive({
      name: "",
      intro: "",
    });

    // 页面挂载时初始化数据
    let loading = ref(false);
    const syncForm = () => {
      form.name = profile.value.user_name || "";
      form.intro = profile.value.intro || "";
      const selected = sqlImg.value.indexOf(profile.value.head_img);
      lickImgIndex.value = selected >= 0 ? selected : 0;
      imgArr.value = imgArr.value.map((_, index) => index === lickImgIndex.value);
    };

    onMounted(syncForm);
    watch(profile, syncForm);

    // 单选图片绑定
    let imgArr = ref([
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ]); //图片状态，true为选中，false为未选中
    // 图片url地址
    let imgSrc = ref([
      hoad1,
      hoad2,
      hoad3,
      hoad4,
      hoad5,
      hoad6,
      hoad7,
      hoad8,
      hoad9,
    ]);
    // 数据库中存放的图片信息，解决图片动态引入路径问题
    let sqlImg = ref([
      "hoad1.jpg",
      "hoad2.jpg",
      "hoad3.jpg",
      "hoad4.jpg",
      "hoad5.jpg",
      "hoad6.jpg",
      "hoad7.jpg",
      "hoad8.jpg",
      "hoad9.jpg",
    ]);
    let lickImgIndex = ref(0); //选中的图片编号
    function imgClick(value) {
      // 更新图片状态，点击的图片为已选中
      imgArr.value.forEach((element, index) => {
        if (index == value) {
          imgArr.value[index] = true;
          lickImgIndex.value = index;
        } else {
          imgArr.value[index] = false;
        }
      });
    }

    async function submit() {
      if (!isLoggedIn.value) {
        ElMessage({ type: "warning", message: "请先登录后再修改资料" });
        $router.push({ name: "loginindex" });
        return;
      }
      if (!form.name.trim()) {
        ElMessage({ type: "warning", message: "用户名称不能为空" });
        return;
      }
      loading.value = true;
      try {
        updateProfile({
          user_name: form.name.trim(),
          intro: form.intro.trim(),
          head_img: sqlImg.value[lickImgIndex.value],
        });
        ElMessage({ type: "success", message: "资料已保存！" });
        $router.push({ name: "personalziLiao" });
      } catch (error) {
        ElMessage({ type: "error", message: error?.message || "保存失败，请稍后重试" });
      } finally {
        loading.value = false;
      }
    }

    return {
      form,
      imgClick,
      imgArr,
      imgSrc,
      submit,
      loading,
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
  justify-content: center;
}

.tou-biao {
  color: #5b99af;
}

.upload {
  width: 200px;
  height: 200px;
}

.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}

.headImg {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}

.submit {
  display: flex;
  justify-content: end;
}

.headImg > .el-image {
  width: 7rem;
  height: 7rem;
  margin-top: 0.8rem;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.headImg > .el-image img {
  transition: 0.8s;
}

.headImg > .el-image:hover img {
  width: 8.4rem;
  height: 8.4rem;
  transition: 0.6s;
}

.headBox {
  width: 100%;
  height: 100%;
  color: #a7aeb7;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e7ecf488;
}

.headBox > .el-icon {
  font-size: 3rem;
}

.activeImg {
  /* border: 5px solid rgb(15, 245, 160); */
  outline-style: dashed;
  outline-color: #a7aeb7bd;
  border-radius: 0.3rem;
}
</style>
