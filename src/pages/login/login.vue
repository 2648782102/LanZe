<template>
  <!-- 登录 -->
  <section v-loading="loading" element-loading-text="登录中..." class="card">
    <el-form :model="form" :rules="rules" class="p-5" label-position="right">
      <div class="text-center mb-4">
        <h1 class="login-title">
          兰泽诗词<span>登录</span>
        </h1>
      </div>
      <el-form-item prop="user" label="账号">
        <el-input v-model="form.user" aria-label="登录账号" autocomplete="username" />
      </el-form-item>
      <el-form-item prop="password" label="密码">
        <el-input v-model="form.password" show-password aria-label="登录密码" autocomplete="current-password" />
      </el-form-item>
      <div>
        <Vcode :show="VcodeShow" @success="VcodeSuccess" @close="VcodeClose" @fail="VcodeFail" />
        <button class="yan-zheng" @click="btnVcode" type="button" aria-label="打开滑块验证">验证</button>
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
        <button class="col-4 col-md-4" type="button" @click="loginClick" aria-label="提交登录">
          登录
        </button>
        <button class="col-4 col-md-4" type="button" @click="back" aria-label="取消登录">取消</button>
      </div>
    </el-form>
  </section>
</template>

<script>
  import { reactive, ref } from "vue";
  import { useRouter } from "vue-router";
  import Vcode from "vue3-puzzle-vcode";
import { ElMessage } from "element-plus/es/components/message/index.mjs";
  import { userLogin } from '../../apis/api/login';
  import { useSession } from '../../composables/useSession.js';

  export default {
    name: "login",
    components: {
      Vcode,
    },
    setup() {
      // 路由
      const $router = useRouter();
      const { setSession } = useSession();

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

      const handleSubmit = async () => {
        const response = await userLogin({
          username: form.user.trim(),
          password: form.password,
        });
        if (Number(response?.code) !== 200) {
          loading.value = false;
          ElMessage({ message: response?.msg || "登录失败，请检查账号密码", type: "warning" });
          return;
        }
        setSession({ user: response.data, profile: response.data });
        loading.value = false;
        ElMessage({ message: "登录成功！", type: "success" });
        $router.push({ name: "shezhi" });
      };

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
            handleSubmit().catch((error) => {
              loading.value = false;
              ElMessage({ message: error?.message || "登录失败，请稍后重试", type: "error" });
            });
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
  .login-title {
    margin: 0;
    color: var(--jade-deep);
    font-family: var(--font-display);
    font-size: 2rem;
    letter-spacing: 8px;
  }

  .login-title span {
    display: block;
    margin-top: 4px;
    color: var(--seal);
    font-size: 0.7rem;
    letter-spacing: 6px;
  }

  .card {
    width: min(100%, 430px);
    padding: 36px 34px;
    border: 1px solid var(--rule);
    background: var(--paper-light);
    box-shadow: var(--shadow);
  }

  .submit {
    display: flex;
    gap: 12px;
  }

  .submit>button {
    flex: 1;
    height: 42px;
    border: 1px solid var(--jade);
    background: var(--jade);
    color: var(--paper-light);
    letter-spacing: 4px;
    transition: 0.2s;
  }

  .submit>button:last-child {
    background: transparent;
    color: var(--jade);
  }

  .submit>button:hover {
    background: var(--jade-deep);
    color: var(--paper-light);
  }

  .addData {
    display: flex;
    justify-content: space-between;
  }

  .yan-zheng {
    width: 100%;
    height: 40px;
    border: 1px solid var(--rule);
    background: var(--paper-light);
    border-radius: 0;
    font-size: 0.9rem;
    letter-spacing: 4px;
    color: var(--jade);
    transition: 0.2s;
  }

  .yan-zheng:hover {
    border-color: var(--jade);
    background: rgba(47, 93, 80, 0.06);
  }
</style>
