<template>
  <!-- 茶楼，用户创作诗词展示 -->
  <section>
    <div class="dox-left">
      <h4>{{ name }}</h4>
      <p>{{ details }}</p>
    </div>
    <div class="avatar">
      <el-avatar class="elavatar" v-loading="loading" :src="imgsrc" icon="UserFilled" />
      <span class="pe-2 pt-3">{{ userObj.user_name }}</span>
    </div>
  </section>
  <el-divider />
</template>

<script>
import { computed, onMounted, ref } from "vue";
import hoad1 from "../assets/hoad/hoad1.jpg";
import hoad2 from "../assets/hoad/hoad2.jpg";
import hoad3 from "../assets/hoad/hoad3.jpg";
import hoad4 from "../assets/hoad/hoad4.jpg";
import hoad5 from "../assets/hoad/hoad5.jpg";
import hoad6 from "../assets/hoad/hoad6.jpg";
import hoad7 from "../assets/hoad/hoad7.jpg";
import hoad8 from "../assets/hoad/hoad8.jpg";
import hoad9 from "../assets/hoad/hoad9.jpg";
import { userProfile } from "../apis/api/login.js";
import { useSession } from "../composables/useSession.js";

const avatarByFilename = {
  "hoad1.jpg": hoad1, "hoad2.jpg": hoad2, "hoad3.jpg": hoad3,
  "hoad4.jpg": hoad4, "hoad5.jpg": hoad5, "hoad6.jpg": hoad6,
  "hoad7.jpg": hoad7, "hoad8.jpg": hoad8, "hoad9.jpg": hoad9,
};

export default {
  name: "UserLi",
  props: ["title", "name", "details", "id"],
  setup(props) {
    const { profile } = useSession();
    let userObj = ref({ user_name: "兰泽诗友" });
    let imgsrc = ref(null);
    let loading = ref(false);  // 加载
    const currentAvatar = computed(() => avatarByFilename[profile.value.head_img] || hoad1);
    onMounted(() => {
      loading.value = true;
      userProfile({ id: props.id })
        .then((response) => {
          const remoteProfile = response?.data?.data || response?.data || {};
          if (remoteProfile && typeof remoteProfile === "object") {
            userObj.value = { ...userObj.value, ...remoteProfile };
            imgsrc.value = avatarByFilename[remoteProfile.head_img] || currentAvatar.value;
          }
        })
        .finally(() => {
          loading.value = false;
          if (!imgsrc.value) imgsrc.value = currentAvatar.value;
        });
    });

    return {
      userObj,
      imgsrc,
      loading,
    };
  },
};
</script>

<style scoped>
span {
  float: right;
  color: var(--jade);
  font-size: 0.85rem;
  letter-spacing: 2px;
}
p { color: var(--ink-soft); }
h4 { margin: 0 0 0.4rem; color: var(--ink); font-family: var(--font-display); letter-spacing: 3px; }
section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
.dox-left  {
    width: 80%;
    overflow: hidden;
}
.dox-left>p {
    width: 100%;
    height: 1.7rem;
    margin: 0;
    overflow: hidden;
}
.elavatar {
  width: 2.6rem;
  height: 2.6rem;
  font-size: 1.5rem;
  border: 1px solid var(--rule);
}
</style>
