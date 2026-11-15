import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "read",
    component: () => import("../views/ReadView.vue"),
    meta: { title: "今日展厅" },
  },
  {
    path: "/explore",
    name: "explore",
    component: () => import("../views/ExploreView.vue"),
    meta: { title: "寻诗" },
  },
  {
    path: "/poem/:id",
    name: "poem",
    component: () => import("../views/PoemView.vue"),
    meta: { title: "读诗" },
  },
  {
    path: "/collection",
    name: "collection",
    component: () => import("../views/CollectionView.vue"),
    meta: { title: "我的诗卷" },
  },
  {
    path: "/compose",
    name: "compose",
    component: () => import("../views/ComposeView.vue"),
    meta: { title: "写一首诗" },
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/AuthView.vue"),
    meta: { title: "登录", bare: true },
  },
  {
    path: "/register",
    name: "register",
    component: () => import("../views/AuthView.vue"),
    meta: { title: "创建账号", bare: true },
  },
  { path: "/home", redirect: "/" },
  { path: "/zhailu", redirect: "/" },
  { path: "/wenku", redirect: "/explore" },
  { path: "/gushi", redirect: "/explore" },
  { path: "/searchul", redirect: (to) => ({ path: "/explore", query: to.query }) },
  { path: "/details", redirect: (to) => ({ path: "/poem/legacy", query: to.query }) },
  { path: "/chalou", redirect: "/explore" },
  { path: "/jingxuan", redirect: "/explore" },
  { path: "/fengya", redirect: "/explore" },
  { path: "/feihua", redirect: "/explore" },
  { path: "/xiandai", redirect: "/explore" },
  { path: "/duxue", redirect: "/collection" },
  { path: "/personal", redirect: "/collection" },
  { path: "/personalhome", redirect: "/collection" },
  { path: "/personalziLiao", redirect: "/collection" },
  { path: "/datamessage", redirect: "/collection" },
  { path: "/favorite", redirect: "/collection" },
  { path: "/samplereels", redirect: "/collection" },
  { path: "/attention", redirect: "/collection" },
  { path: "/complaint", redirect: "/collection" },
  { path: "/shezhi", redirect: "/collection" },
  { path: "/publishpoem", redirect: "/compose" },
  { path: "/loginindex", redirect: "/login" },
  { path: "/adduser", redirect: "/register" },
  { path: "/datauser", redirect: "/login" },
  { path: "/deleteuser", redirect: "/login" },
  { path: "/audio", redirect: "/" },
  { path: "/kongbai", redirect: "/" },
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

const baseUrl = import.meta.env.BASE_URL || "/";

/*
 * 旧链接兼容必须先于路由创建执行：既往分享的 /#/poem/xxx 仍要能打开。
 * 把 hash 改写成等价 path（保留 query），history 路由随后直接命中目标页。
 */
if (typeof window !== "undefined" && window.location.hash.startsWith("#/")) {
  const migrated = window.location.hash.slice(1);
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const path = migrated.replace(/^\//, "");
  window.history.replaceState(null, "", `${normalizedBase}${path}${window.location.search}`);
}

/*
 * 真实路径（非 hash）是能被搜索引擎收录的前提：/poem/demo-jingyesi 是一个
 * 独立 URL，而 hash 版本 /#/poem/... 抓取时会被当成首页。
 */
const router = createRouter({
  history: createWebHistory(baseUrl),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

const updateTitle = (to) => {
  document.title = to.meta.title ? `${to.meta.title} · 兰泽` : "兰泽 · 读诗的地方";
};

router.afterEach(updateTitle);
updateTitle(router.currentRoute.value);

export default router;
