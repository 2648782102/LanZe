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
        name: 'loginindex',  //登录页面父组件
        path: '/loginindex',
        component:() => import('../pages/login/loginIndex.vue'),
        meta:{title: '登录页面',isAush:false},
        redirect: '/login',
        children:[
            {
                name: 'login',  //登录
                path: '/login',
                component:() => import('../pages/login/login.vue'),
                meta:{title: '登录',isAush:false},
            },
            {
                name: 'adduser',  //注册
                path: '/adduser',
                component:() => import('../pages/login/addUser.vue'),
                meta:{title: '注册',isAush:false},
            },
            {
                name: 'datauser',  //修改
                path: '/datauser',
                component:() => import('../pages/login/dataUser.vue'),
                meta:{title: '修改',isAush:false},
            },
            {
                name: 'deleteuser',  //注销
                path: '/deleteuser',
                component:() => import('../pages/login/deleteUser.vue'),
                meta:{title: '注销',isAush:false},
            },
        ]
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
                name: 'chalou',  //茶社
                path: '/chalou',
                component:() => import('../pages/ChaLou/ChaLou.vue'),
                meta: {title: '茶社',isAush: false},
                redirect: '/jingxuan',
                children:[
                    {
                        name: 'feihua',  //飞花接龙
                        path: '/feihua',
                        component:() => import('../pages/ChaLou/FeiHua.vue'),
                        meta: {title: '飞花接龙',isAush: false}
                    },
                    { 
                        name: 'fengya',  //风俗雅文
                        path: '/fengya',
                        component:() => import('../pages/ChaLou/FengYa.vue'),
                        meta: {title: '风俗雅文',isAush: false}
                    },
                    {
                        name: 'jingxuan',  //精选诗文
                        path: '/jingxuan',
                        component:() => import('../pages/ChaLou/JingXuan.vue'),
                        meta: {title: '精选诗文',isAush: false}
                    },
                    {
                        name: 'xiandai',  //现代诗歌
                        path: '/xiandai',
                        component:() => import('../pages/ChaLou/XianDai.vue'),
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
                        name: 'datamessage',  //修改资料
                        path: '/datamessage',
                        component:() => import('../pages/Personal/son/dataMessage.vue'),
                        meta: {title: '修改资料',isAush: false}
                    },
                    {
                        name: 'samplereels',  //作品
                        path: '/samplereels',
                        component:() => import('../pages/Personal/SampleReels.vue'),
                        meta: {title: '作品',isAush: false}
                    },
                    {
                        name: 'publishpoem',  //作品
                        path: '/publishpoem',
                        component:() => import('../pages/Personal/son/publishPoem.vue'),
                        meta: {title: '发布作品',isAush: false}
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
            },
            {
                name:'kongbai',
                path:'/kongbai',
                component:() => import('../pages/kongbai.vue'),
                meta: {title: '空白页',isAush: false}
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