import { createApp } from "vue";
import VueCookies from "vue-cookies";
import App from "./App.vue";
import router from "./router/index.js";
import "./styles/base.css";

createApp(App).use(router).use(VueCookies).mount("#app");
