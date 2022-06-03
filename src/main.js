import { createApp } from 'vue'
import App from './App.vue'

// 映入vuerouter
import router from './router/index'
// 全局引入element-plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
app.use(ElementPlus);
app.use(router);
app.mount('#app');
