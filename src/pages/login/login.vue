<template>
  <!-- 登录 -->
  <section v-loading="loading" element-loading-text="登录中..." class="card">
    <el-form :model="form" :rules="rules" class="p-5" label-position="labelPosition">
      <div class="text-center mb-4">
        <h1 style="color: rgb(53, 228, 170)">
          兰泽诗词<i class="fas fa-feather-alt"></i>
        </h1>
      </div>
      <el-form-item prop="user" label="账号">
        <el-input v-model="form.user" />
      </el-form-item>
      <el-form-item prop="password" label="密码">
        <el-input v-model="form.password" show-password />
      </el-form-item>
      <div>
        <Vcode :show="VcodeShow" @success="VcodeSuccess" @close="VcodeClose" @fail="VcodeFail" />
        <button class="yan-zheng" @click="btnVcode" type="button">验证</button>
      </div>
      <div class="addData pt-3">
        <el-link @click="routeClick('adduser')">
          <i class="far fa-edit me-1"></i>注册
        </el-link>
        <div>
          <el-link @click="routeClick('datauser')" class="ms-2">
            <i class="fas fa-pencil-alt me-1"></i>修改密码
          </el-link>
          <el-link @click="routeClick('deleteuser')" class="ms-2">
            <i class="far fa-trash-alt me-1"></i>注销
          </el-link>
        </div>
      </div>
      <div class="mt-4 submit">
        <button class="col-4 col-md-4" type="button" @click="loginClick">
          登录
        </button>
        <button class="col-4 col-md-4" type="button" @click="back">取消</button>
      </div>
    </el-form>
  </section>
</template>

<script>
  import { reactive, ref } from "vue";
  import { useRouter } from "vue-router";
  import Vcode from "vue3-puzzle-vcode";
  import { ElMessage } from "element-plus";
  import supabase from '../../function/supabase.js'
  import { userLogin } from '../../apis/api/login';

  export default {
    name: "login",
    components: {
      Vcode,
    },
    setup() {
      // 路由
      const $router = useRouter();

      // 表单信息双向绑定
      const form = reactive({
        user: "",
        password: "",
      });

      // 注册/修改/注销，跳转
      function routeClick(value) {
        $router.push({
          name: value,
        });
      }

      //取消操作，返回个人中心设置页
      function back() {
        // $router.push({
        //   name: "shezhi",
        // });
        $router.back()
      }

      // 验证规则
      const rules = reactive({
        user: [
          { required: true, message: "账号必须输入", trigger: "change" },
          { min: 5, max: 20, message: "长度为5-20", trigger: "change" },
        ],
        password: [
          { required: true, message: "密码必须输入", trigger: "change" },
          { min: 5, max: 20, message: "长度为5-20", trigger: "change" },
        ],
      });

      // 验证码是否显示
      let VcodeShow = ref(false);
      // 验证是否通过
      let VcodeOK = ref(false);
      function btnVcode() {
        VcodeShow.value = true;
      }

      // 验证成功的回调
      function VcodeSuccess() {
        VcodeShow.value = false;
        VcodeOK.value = true;
      }

      // 验证失败的回调
      function VcodeFail() {
        VcodeOK.value = false;
      }

      // 点击遮罩层外的位置触发
      function VcodeClose() {
        VcodeShow.value = false;
      }

      const userData = async (uid) => {            // 请求用户信息函数

        let data = {
          user_name: form.user,
          password: form.password
        }

        let like = userLogin(data)

        console.log(like);

        // let { data: response, error } = await supabase           // 请求数据
        //   .from('user_message')
        //   .select('*')
        //   .or(`id.eq.${uid}`)

        // try {

        //   $cookies.config('1d')
        //   $cookies.set('lanze_upload', response[0])
        //   $router.push({
        //     name: "shezhi",
        //   });
        //   loading.value = false;
        //   ElMessage({
        //     message: `登录成功！`,
        //     type: "success",
        //   });

        // } catch (error) {
        //   console.log(`用户信息请求失败了，原因${error}`);
        // }
      }

      const handleSubmit = async () => {

        let data = {
          username: form.user,
          password: form.password
        }

        let datas = await userLogin(data)

        let code = datas.code

        if(code === 200) {
          $cookies.config('1d')
          $cookies.set('lanze_user', form.user)
          $cookies.set('lanze_upload', {
            id:"43c1dff0-f889-11ec-8336-cf8928a48750",
            user_name:"666用户",
            head_img:"hoad6.jpg",
            intro:"很好"
          })
          loading.value = false;
          ElMessage({
                message: `登录成功！`,
                type: "success",
              });

              $router.push({
            name: "shezhi",
          });
        }

        // let { data: response, error } = await supabase           // 请求数据
        //   .from('us_er')
        //   .select('*')
        //   .or(`user.eq.${form.user}`)

        // try {
        //   if (response.length != 0) {
        //     if (response[0].password == form.password) {
        //       $cookies.config('1d')
        //       $cookies.set('lanze_user', response[0])
        //       userData(response[0].id)
        //     } else {
        //       loading.value = false;
        //       ElMessage({
        //         message: `密码错误！`,
        //         type: "warning",
        //       });
        //     }
        //   } else {
        //     console.log('no');
        //     loading.value = false;
        //     ElMessage({
        //       message: `此账号未注册！`,
        //       type: "info",
        //     });
        //   }

        // } catch (error) {
        //   console.log(`请求失败了，原因${error}`);
        // }
      }

      // handleSubmit();


      // 点击登录按钮
      let loading = ref(false); //加载效果
      function loginClick() {

        if (form.user == "" || form.password == "") {
          ElMessage({
            message: `账号或密码为空！`,
            type: "warning",
          });
        } else {
          if (VcodeOK.value) {
            loading.value = true;
            handleSubmit();
          } else {
            ElMessage({
              message: "请先验证",
              type: "warning",
            });
            VcodeShow.value = true;
          }
        }
      }

      return {
        form,
        routeClick,
        rules,
        VcodeSuccess,
        btnVcode,
        VcodeClose,
        VcodeFail,
        VcodeShow,
        loginClick,
        back,
        loading,
      };
    },
  };
</script>

<style scoped>
  .submit {
    height: 40px;
    display: flex;
    justify-content: space-around;
  }

  .submit>button {
    border: 0;
    background-color: white;
    transition: 0.3s;
  }

  .submit>button:hover {
    border-bottom: 5px solid rgb(53, 228, 170);
    border-radius: 10px;
    box-shadow: 2px -2px 2px rgba(142, 144, 150, 0.1);
    transition: 0.3s;
  }

  .addData {
    display: flex;
    justify-content: space-between;
  }

  .yan-zheng {
    width: 30%;
    border: 0;
    background-color: rgb(255, 255, 255);
    border-radius: 0.2rem;
    font-size: 0.8rem;
    transition: 0.4s;
    color: rgb(71, 31, 116);
    box-shadow: 0.2rem 0.2rem 0.2rem #d9d9d9, -0.2rem -0.2rem 0.2rem #f5f5f5;
  }

  .yan-zheng:hover {
    border-radius: 0.3rem;
    background: #ffffff;
    box-shadow: none;
    transition: 0.2s;
  }
</style>