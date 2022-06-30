<template>
  <!-- 修改资料 -->
  <article class="box" v-loading="loading">
    <el-form
      :model="form"
      class="p-5 col-12 col-lg-9 col-xl-7"
      label-position="labelPosition"
    >
      <div class="text-center mb-4">
        <h1>个人资料<i class="fab fa-jedi-order ms-2"></i></h1>
      </div>

      <el-form-item label="选择头像：">
        <div class="headImg">
          <el-image
            v-for="(item, index) in imgSrc"
            :key="index"
            @click="imgClick(index)"
            :src="imgSrc[index]"
            :class="imgArr[index] ? 'activeImg' : ''"
            fit="cover"
          >
            <template #error>
              <div class="headBox">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
        </div>
      </el-form-item>

      <el-form-item prop="name" label="用户名称：">
        <el-input v-model="form.name" />
      </el-form-item>

      <el-form-item prop="intro" label="个性简介：">
        <el-input v-model="form.intro" />
      </el-form-item>
      <div class="mt-4 submit">
        <button
          class="col-4 col-md-4 btn btn-success"
          type="button"
          @click="submit"
        >
          提交审核
        </button>
      </div>
    </el-form>
  </article>
</template>

<script>
import { reactive, ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import hoad1 from '../../assets/hoad/hoad1.jpg'
import hoad2 from '../../assets/hoad/hoad2.jpg'
import hoad3 from '../../assets/hoad/hoad3.jpg'
import hoad4 from '../../assets/hoad/hoad4.jpg'
import hoad5 from '../../assets/hoad/hoad5.jpg'
import hoad6 from '../../assets/hoad/hoad6.jpg'
import hoad7 from '../../assets/hoad/hoad7.jpg'
import hoad8 from '../../assets/hoad/hoad8.jpg'
import hoad9 from '../../assets/hoad/hoad9.jpg'
import { useRouter } from "vue-router";
import axios from "axios";

export default {
  name: "dataMessage",
  setup() {
    const $router = useRouter();

    let form = reactive({
      name: "",
      intro: "",
    });

    // 页面挂载时初始化数据
    let loading = ref(false);
    onMounted(() => {
      let upload = $cookies.get("lanze_user");
      if (upload) {
        loading.value = true;
        axios
          .get(
            `https://lan-ze-user.vercel.app/api/user/getUpload?id=${upload.id}`
          )
          .then((response) => {
            loading.value = false;
            let iniUpload = response.data;
            form.name = iniUpload.user_name;
            form.intro = iniUpload.intro;
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });

    // 当选择多张图片时触发
    function handleExceed() {
      ElMessage({
        type: "error",
        message: "只能上传一张图片,请先移除前一张！",
      });
    }

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


    // 提交事件
    function submit() {
      loading.value = true
      let id = $cookies.get("lanze_user").id;
      axios
        .get(
          `https://lan-ze-user.vercel.app/api/user/userUpload?id=${id}&name=${
            form.name
          }&img=${sqlImg.value[lickImgIndex.value]}&intro=${form.intro}`
        )
        .then((response) => {
          loading.value = false
          if (response.data == "OK") {
            ElMessage({
              type: "success",
              message: "上传成功！",
            });
            $router.push({
              name: "kongbai",
            });
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }

    return {
      form,
      handleExceed,
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