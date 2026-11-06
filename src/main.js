import { createApp } from 'vue'
import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import 'element-plus/theme-chalk/display.css'
import './styles/lanze-pages.css'

// 映入vuerouter
import router from './router/index'
import { ElAffix } from 'element-plus/es/components/affix/index.mjs';
import { ElAvatar } from 'element-plus/es/components/avatar/index.mjs';
import { ElCard } from 'element-plus/es/components/card/index.mjs';
import { ElCarousel } from 'element-plus/es/components/carousel/index.mjs';
import { ElCarouselItem } from 'element-plus/es/components/carousel/index.mjs';
import { ElCol } from 'element-plus/es/components/col/index.mjs';
import { ElContainer } from 'element-plus/es/components/container/index.mjs';
import { ElDivider } from 'element-plus/es/components/divider/index.mjs';
import { ElEmpty } from 'element-plus/es/components/empty/index.mjs';
import { ElFooter } from 'element-plus/es/components/container/index.mjs';
import { ElForm } from 'element-plus/es/components/form/index.mjs';
import { ElFormItem } from 'element-plus/es/components/form/index.mjs';
import { ElHeader } from 'element-plus/es/components/container/index.mjs';
import { ElIcon } from 'element-plus/es/components/icon/index.mjs';
import { ElImage } from 'element-plus/es/components/image/index.mjs';
import { ElInput } from 'element-plus/es/components/input/index.mjs';
import { ElLink } from 'element-plus/es/components/link/index.mjs';
import { ElMain } from 'element-plus/es/components/container/index.mjs';
import { ElMenu } from 'element-plus/es/components/menu/index.mjs';
import { ElMenuItem } from 'element-plus/es/components/menu/index.mjs';
import { ElPageHeader } from 'element-plus/es/components/page-header/index.mjs';
import { ElPagination } from 'element-plus/es/components/pagination/index.mjs';
import { ElRow } from 'element-plus/es/components/row/index.mjs';
import { ElScrollbar } from 'element-plus/es/components/scrollbar/index.mjs';
import { ElSubMenu } from 'element-plus/es/components/menu/index.mjs';
import { ElTabPane } from 'element-plus/es/components/tabs/index.mjs';
import { ElTabs } from 'element-plus/es/components/tabs/index.mjs';
import { ElTooltip } from 'element-plus/es/components/tooltip/index.mjs';
import 'element-plus/dist/index.css'

// 引入cookies
import VueCookies from 'vue-cookies'
import '@lottiefiles/lottie-player'

const app = createApp(App);

for (const component of [
  ElAffix,
  ElAvatar,
  ElCard,
  ElCarousel,
  ElCarouselItem,
  ElCol,
  ElContainer,
  ElDivider,
  ElEmpty,
  ElFooter,
  ElForm,
  ElFormItem,
  ElHeader,
  ElIcon,
  ElImage,
  ElInput,
  ElLink,
  ElMain,
  ElMenu,
  ElMenuItem,
  ElPageHeader,
  ElPagination,
  ElRow,
  ElScrollbar,
  ElSubMenu,
  ElTabPane,
  ElTabs,
  ElTooltip,
]) {
  app.component(component.name, component)
}
app.use(router);
app.use(VueCookies);
app.mount('#app');
