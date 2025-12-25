// src/main.ts
import { createApp } from "vue";
import App from "./App.vue";
import PrimeVue from "primevue/config";
import Aura from "@primevue/themes/aura";
import "primeicons/primeicons.css";
import router from "./router"; // giữ import ở trên
import { createPinia } from "pinia";
import ToastService from "primevue/toastservice";
import "./style.css";

import { useAuthStore } from "./stores/auth";

async function bootstrap() {
  const app = createApp(App);
  const pinia = createPinia();
  app.use(pinia);

  // Restore session sớm
  const authStore = useAuthStore();
  await authStore.restoreSession();

  // 🔥🔥 ĐĂNG KÝ GUARD TRƯỚC KHI USE ROUTER
  router.beforeEach((to, from, next) => {
    console.log('🚦 Router guard:', to.path, 'Logged:', !!authStore.isLoggedIn);

    // Nếu route cần auth mà chưa login → về /auth
    if (to.meta.requiresAuth && !authStore.isLoggedIn) {
      return next('/auth');
    }

    // Nếu đang ở /auth mà đã login → về /chat
    if (to.path === '/auth' && authStore.isLoggedIn) {
      return next('/chat');
    }

    next();
  });

  // Giờ mới use router (sau khi guard đã sẵn sàng)
  app.use(router);

  app.use(PrimeVue, { theme: { preset: Aura } });
  app.use(ToastService);

  app.mount("#app");
}

bootstrap();