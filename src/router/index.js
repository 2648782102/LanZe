// 引入vuerouter
import { createRouter,createWebHashHistory } from 'vue-router'

// 路由懒加载
const ProductDisplay = import('../pages/ProductDisplay.vue')  
const Home = import('../pages/Home.vue' )    //home
const DuXue = import('../pages/DuXue/DuXue.vue')  //笃学
const ZhaiLu = import('../pages/ZhaiLu/ZhaiLu.vue')  //摘录
const WenKu = import('../pages/WenKu/WenKu.vue' )  // 文库
const ChaShe = import('../pages/ChaShe/ChaShe.vue')  //茶社
const PersonalZiLiao = import('../pages/Personal/PersonalZiLiao.vue')  //  个人资料
const SampleReels = import('../pages/Personal/SampleReels.vue')  //  作品
const Favorite = import('../pages/Personal/Favorite.vue')  // 收藏
const GuShi = import('../pages/WenKu/GuShi.vue')  //  文库子组件，古诗类
const GuCi = import('../pages/WenKu/GuCi.vue')  //文库子组件，古词类
const FengYa = import('../pages/ChaShe/FengYa.vue' )  // 茶社子组件，风俗雅文
const FeiHua = import('../pages/ChaShe/FeiHua.vue')  // 茶社子组件，飞花接龙
const JingXuan = import('../pages/ChaShe/JingXuan.vue')  //茶社子组件，精选诗文
const XianDai = import('../pages/ChaShe/XianDai.vue')  //茶社子组件，现代诗文
const SheZhi = import('../pages/Personal/SheZhi.vue')  //设置界面
const Personal = import('../pages/Personal/Personal.vue')  //个人中心
const PersonalHome = import('../pages/Personal/PersonalHome.vue')  // 个人中心首页
const Complaint = import('../pages/Personal/Complaint.vue')  //投诉意见

const router = createRouter({
    // 路由模式
    history: createWebHashHistory(),
    routes: [
        // 配置默认页面
    {
        path:'/',
        redirect:'/productdisplay',
    },
    {
        name: 'productdisplay',
        path: '/productdisplay',
        component: ProductDisplay,
        meta:{title: '产品介绍',isAush:false}
    },
    {
        name: 'home',
        path: '/home',
        component: Home,
        meta:{title: '首页/摘录',isAush:false},
        redirect:'/zhailu',
        children:[
            {
                name: 'zhailu',
                path: '/zhailu',
                component: ZhaiLu,
                meta: {title: '摘录',isAush: false}
            },
            {
                name: 'wenku',
                path: '/wenku',
                component: WenKu,
                meta: {title: '文库',isAush: false},
                redirect: '/gushi',
                children:[
                    {
                        name: 'gushi',
                        path: '/gushi',
                        component: GuShi,
                        meta: {title: '古诗类',isAush: false}
                    },
                    {
                        name: "guci",
                        path: '/guci',
                        component: GuCi,
                        meta: {title: '古词类',isAush: false}
                    }
                ]
            },
            {
                name: 'chashe',
                path: '/chashe',
                component: ChaShe,
                meta: {title: '茶社',isAush: false},
                redirect: '/jingxuan',
                children:[
                    {
                        name: 'feihua',
                        path: '/feihua',
                        component: FeiHua,
                        meta: {title: '飞花接龙',isAush: false}
                    },
                    {
                        name: 'fengya',
                        path: '/fengya',
                        component: FengYa,
                        meta: {title: '风俗雅文',isAush: false}
                    },
                    {
                        name: 'jingxuan',
                        path: '/jingxuan',
                        component: JingXuan,
                        meta: {title: '精选诗文',isAush: false}
                    },
                    {
                        name: 'xiandai',
                        path: '/xiandai',
                        component: XianDai,
                        meta: {title: '现代诗歌',isAush: false}
                    },
                    
                ]
            },
            {
                name: 'duxue',
                path: '/duxue',
                component: DuXue,
                meta: {title: '笃学',isAush: false}
            },
            {
                name: 'personal',
                path: '/personal',
                component: Personal,
                meta: {title: '个人中心',isAush: false},
                redirect: '/personalziLiao',
                children:[
                    {
                        name: 'personalhome',
                        path: '/personalhome',
                        component: PersonalHome,
                        meta: {title: '个人中心首页',isAush: false}
                    },
                    {
                        name: 'personalziLiao',
                        path: '/personalziLiao',
                        component: PersonalZiLiao,
                        meta: {title: '个人资料',isAush: false}
                    },
                    {
                        name: 'samplereels',
                        path: '/samplereels',
                        component: SampleReels,
                        meta: {title: '作品',isAush: false}
                    },
                    {
                        name: 'favorite',
                        path: '/favorite',
                        component: Favorite,
                        meta: {title: '收藏',isAush: false}
                    },
                    {
                        name: 'complaint',
                        path: '/complaint',
                        component: Complaint,
                        meta: {title: '投诉意见',isAush: false}
                    },
                    {
                        name: 'shezhi',
                        path: '/shezhi',
                        component: SheZhi,
                        meta: {title: '设置',isAush: false}
                    }
                ]
            },
        ]
    }
    ]
})

// 后置路由守卫
router.afterEach((to) => {
    // 判断目标组件是否配置title
    if(to.meta.title) {
        document.title = to.meta.title
    } else {
        document.title = '兰泽诗词'
    }
})

export default router;