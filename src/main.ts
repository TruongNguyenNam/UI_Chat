import { createApp } from "vue";
import App from "./App.vue";
import PrimeVue from "primevue/config";
import Aura from "@primevue/themes/aura";
import "primeicons/primeicons.css";
import router from "./router";
import { createPinia } from "pinia";
import ToastService from "primevue/toastservice";
import "./style.css";
import Toast from "primevue/toast";
import { useAuthStore } from "./stores/auth";

async function bootstrap() {
  const app = createApp(App);
  const pinia = createPinia();
  app.use(pinia);

  const authStore = useAuthStore();
  await authStore.restoreSession();

  router.beforeEach((to, from, next) => {
    console.log('🚦 Router guard:', to.path, 'Logged:', !!authStore.isLoggedIn);

    if (to.meta.requiresAuth && !authStore.isLoggedIn) {
      return next('/auth');
    }

    if (to.path === '/auth' && authStore.isLoggedIn) {
      return next('/chat');
    }

    next();
  });

  app.use(router);

  app.use(PrimeVue, { theme: { preset: Aura } });
  app.use(ToastService);
  app.component("Toast", Toast);
  // app.use(ToastService);

  app.mount("#app");
}

bootstrap();