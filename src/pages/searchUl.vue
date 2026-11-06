<template>
    <!-- 搜索列表 -->
    <article>
        <el-row class="elrow pt-2" :gutter="20" justify="center" aria-label="搜索结果">
            <el-col class="bgwhite" :xs="22" :sm="20" :md="16" :lg="16" :xl="16" :offset="0">
                <el-page-header title="返回" icon="ArrowLeft" class="mt-4 ms-4" content="搜索内容" @back="goBack" />
                <ul v-if="ulArrD.length">
                    <li @click="xiangQing(item)" @keyup.enter="xiangQing(item)" role="button" tabindex="0"
                        :aria-label="`查看${item.title}`" v-for="(item,index) in ulArrD[ulNext-1]" :key="item.id || index">
                        <Li :title="item.author" :name="item.title" :details="firstParagraph(item.paragraphs)" />
                    </li>
                </ul>
                <el-empty v-else description="没有找到匹配的诗词" />
                <div class="paginationBox">
                    <el-pagination class="pagination hidden-md-and-up" background layout="prev, pager, next"
                        :current-page="ulNext" @update:current-page="currentPageClick" :page-count="ulArrD.length"
                        aria-label="搜索结果分页" />
                    <el-pagination class="pagination hidden-sm-and-down" background layout="prev, pager, next"
                        :current-page="ulNext" @update:current-page="currentPageClick" :page-count="ulArrD.length"
                        aria-label="搜索结果分页" />
                </div>
            </el-col>
        </el-row>
    </article>
</template>

<script>
    import {
        useRoute,
        useRouter
    } from "vue-router";
    import { ref, computed } from "vue";
    import Li from "../components/Li.vue";
    import { paginate, parseJsonArray, parseStringArray } from "../utils/poemQuery.js";
    import { normalizePoemList } from "../data/poems.js";
    // 引入element的响应式布局，断点
    import 'element-plus/theme-chalk/display.css'

    export default {
        name: 'searchUl',
        components: {
            Li
        },
        setup() {
            const $route = useRoute()
            const $router = useRouter()

            // 返回上一页
            function goBack() {
                $router.back()
            }

            function firstParagraph(value) {
                return parseStringArray(value, [])[0] || "暂无正文预览";
            }

            const ulArrD = computed(() => {
                const poems = normalizePoemList(parseJsonArray($route.query.ulArr, []));
                return paginate(poems, 10);
            })

            // 切换路由到详情页
            function xiangQing(value) {
                $router.push({
                    name: 'details',
                    query: {
                        shici: JSON.stringify(value)
                    }
                })
            }


            let ulNext = ref(1)

            // 点击页数变更事件
            function currentPageClick(value) {
                ulNext.value = value
            }

            return {
                ulArrD,
                firstParagraph,
                xiangQing,
                ulNext,
                currentPageClick,
                goBack
            }
        }
    }
</script>

<style scoped>
    article {
        width: 100%;
        min-height: 80vh;
        font-family: var(--font-song);
        padding: 28px 20px 20px;
    }

    .elrow {
        position: relative;
        width: 100%;
        margin: 0;
    }

    ul {
        min-height: 48rem;
        list-style-type: none;
        margin: 0;
        padding: 0.5rem 1.2rem 0;
    }

    li {
        height: auto;
        min-height: 6.5rem;
        padding: 1rem 0.8rem;
        border-bottom: 1px solid var(--rule);
        border-radius: 0;
        cursor: pointer;
        overflow: hidden;
        transition: background 0.2s ease;
    }

    li:hover {
        background: rgba(47, 93, 80, 0.055);
    }

    .paginationBox {
        display: flex;
        justify-content: center;
        margin: 1.5rem 0 0.5rem;
    }
</style>
