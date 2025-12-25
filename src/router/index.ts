// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '../layout/MainLayout.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        { path: "", redirect: "/chat" },
        { path: "chat", component: () => import("../view/Chat/ChatList.vue") },
        { path: "chat/:chatId", component: () => import("../view/Chat/ChatMiddle.vue"), props: true },
        { path: "contacts", component: () => import("../view/Contact/ContactList.vue") },
        { path: "notifications", component: () => import("../view/Notification/NotificationList.vue") },
        { path: "call", component: () => import("../view/Call/Call.vue") },
        { path: "settings", component: () => import("../view/Settings/Settings.vue") },
      ],
    },
    {
      path: "/auth",
      component: () => import("../view/Auth/Login.vue"),
    },
  ],
});

export default router;