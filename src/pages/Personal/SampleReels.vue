<template>
    <!-- 作品 -->
    <article class="box">
        <button @click="publishClick" type="button" class="btn btn-primary" aria-label="发布新作品">发布作品</button>
        <ul class="work-list" aria-label="已发布作品">
          <li v-for="work in works" :key="work.id">
            <h2>{{ work.title }}</h2>
            <p>{{ work.author }} · {{ work.category }}</p>
            <p class="work-text">{{ work.content || work.textBody }}</p>
          </li>
        </ul>
        <p v-if="!works.length" class="empty">还没有作品，点击上方按钮发布第一首。</p>
    </article>
</template>

<script>
    import { computed, onMounted, ref } from "vue";
    import { useRouter } from "vue-router";
import { ElMessage } from "element-plus/es/components/message/index.mjs";
    import { useSession } from "../../composables/useSession.js";
    import { PoetryCustom } from "../../apis/api/list.js";
    import { normalizeListResponse } from "../../utils/response.js";

    export default {
        name: 'SampleReels',
        setup() {
            const $router = useRouter()
            const { isLoggedIn } = useSession()
            const works = ref([])

            onMounted(async () => {
              try {
                const response = await PoetryCustom();
                works.value = normalizeListResponse(response, []);
              } catch (error) {
                ElMessage({ message: error?.message || "作品加载失败", type: "warning" });
              }
            })

            function publishClick() {
                if(isLoggedIn.value) {
                    $router.push({
                    name:'publishpoem'
                })
                } else {
                    ElMessage({
                        type:'warning',
                        message:'请先登录！'
                    })
                }
            }

            return {
                publishClick,
                works
            }
        }
    }
</script>

<style scoped>
    * {
        box-sizing: border-box;
    }

    article {
        width: 100%;
        height: 700px;
        padding: 2rem;
    }

    .work-list {
        width: min(100%, 46rem);
        list-style: none;
        padding: 0;
    }

    .work-list li {
        margin-top: 1rem;
        padding: 1rem;
        border-radius: 0.4rem;
        background: rgba(91, 153, 175, 0.08);
    }

    .work-text {
        color: #55636e;
        white-space: pre-line;
    }

    .empty {
        color: #7a8790;
    }
</style>
