import { createApp } from 'vue'
import App from './App.vue'

// 映入vuerouter
import router from './router/index'
// 全局引入element-plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 全局引入font 图标
import fortawesome from '@fortawesome/fontawesome-free/css/all.css'

// 引入elementplus图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 引入cookies
import VueCookies from 'vue-cookies'

const app = createApp(App);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
app.use(ElementPlus);
app.use(fortawesome);
app.use(router);
app.config.globalProperties.$cookies = VueCookies
app.mount('#app');
