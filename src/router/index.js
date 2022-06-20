// 引入vuerouter
import { createRouter,createWebHashHistory } from 'vue-router'

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
        name: 'productdisplay',  //产品介绍
        path: '/productdisplay',
        component:() => import('../pages/ProductDisplay.vue'),
        meta:{title: '产品介绍',isAush:false}
    },
    {
        name: 'home',  //首页/摘录
        path: '/home',
        component:() => import('../pages/Home.vue'),
        meta:{title: '首页/摘录',isAush:false},
        redirect:'/zhailu',
        children:[
            {
                name: 'zhailu',  //摘录
                path: '/zhailu',
                component:() => import('../pages/ZhaiLu/ZhaiLu.vue'),
                meta: {title: '摘录',isAush: false}
            },
            {
                name: 'wenku',  //文库
                path: '/wenku',
                component:() => import('../pages/WenKu/WenKu.vue'),
                meta: {title: '文库',isAush: false},
                redirect: '/gushi',
                children:[
                    {
                        name: 'gushi',  //古诗类
                        path: '/gushi',
                        component:() => import('../pages/WenKu/GuShi.vue'),
                        meta: {title: '古诗类',isAush: false}
                    },
                    {
                        name: "guci",  //古词类
                        path: '/guci',
                        component:() => import('../pages/WenKu/GuCi.vue'),
                        meta: {title: '古词类',isAush: false}
                    }
                ]
            },
            {
                name: 'chashe',  //茶社
                path: '/chashe',
                component:() => import('../pages/ChaShe/ChaShe.vue'),
                meta: {title: '茶社',isAush: false},
                redirect: '/jingxuan',
                children:[
                    {
                        name: 'feihua',  //飞花接龙
                        path: '/feihua',
                        component:() => import('../pages/ChaShe/FeiHua.vue'),
                        meta: {title: '飞花接龙',isAush: false}
                    },
                    { 
                        name: 'fengya',  //风俗雅文
                        path: '/fengya',
                        component:() => import('../pages/ChaShe/FengYa.vue'),
                        meta: {title: '风俗雅文',isAush: false}
                    },
                    {
                        name: 'jingxuan',  //精选诗文
                        path: '/jingxuan',
                        component:() => import('../pages/ChaShe/JingXuan.vue'),
                        meta: {title: '精选诗文',isAush: false}
                    },
                    {
                        name: 'xiandai',  //现代诗歌
                        path: '/xiandai',
                        component:() => import('../pages/ChaShe/XianDai.vue'),
                        meta: {title: '现代诗歌',isAush: false}
                    },
                    
                ]
            },
            {
                name: 'duxue',  //笃学
                path: '/duxue',
                component:() => import('../pages/DuXue/DuXue.vue'),
                meta: {title: '笃学',isAush: false}
            },
            {
                name: 'personal',  //个人中心
                path: '/personal',
                component:() => import('../pages/Personal/Personal.vue'),
                meta: {title: '个人中心',isAush: false},
                redirect: '/personalziLiao',
                children:[
                    {
                        name: 'personalhome',  //个人中心首页
                        path: '/personalhome',
                        component:() => import('../pages/Personal/PersonalHome.vue'),
                        meta: {title: '个人中心首页',isAush: false}
                    },
                    {
                        name: 'personalziLiao',  //个人资料
                        path: '/personalziLiao',
                        component:() => import('../pages/Personal/PersonalZiLiao.vue'),
                        meta: {title: '个人资料',isAush: false}
                    },
                    {
                        name: 'samplereels',  //作品
                        path: '/samplereels',
                        component:() => import('../pages/Personal/SampleReels.vue'),
                        meta: {title: '作品',isAush: false}
                    },
                    {
                        name: 'favorite',  //收藏
                        path: '/favorite',
                        component:() => import('../pages/Personal/Favorite.vue'),
                        meta: {title: '收藏',isAush: false}
                    },
                    {
                        name: 'complaint',  //投诉意见
                        path: '/complaint',
                        component:() => import('../pages/Personal/Complaint.vue'),
                        meta: {title: '投诉意见',isAush: false}
                    },
                    {
                        name: 'shezhi',  //设置
                        path: '/shezhi',
                        component:() => import('../pages/Personal/SheZhi.vue'),
                        meta: {title: '设置',isAush: false}
                    },
                    {
                        name: 'attention',  //关注
                        path: '/attention',
                        component:() => import('../pages/Personal/Attention.vue'),
                        meta: {title: '关注',isAush: false}
                    }
                ]
            },
            {
                name:'details',
                path:'/details',
                component:() => import('../pages/details.vue'),
                meta: {title: '详情',isAush: false}
            },
            {
                name:'searchul',
                path:'/searchul',
                component:() => import('../pages/searchUl.vue'),
                meta: {title: '搜索结果',isAush: false}
            }
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