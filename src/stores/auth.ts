// src/stores/authStore.ts
import { defineStore } from "pinia";
import { AuthService } from "../service/AuthService";
import { connectWebSocket, disconnect } from "../service/WebSocketService";
import type { LoginForm, LoginInfoDto } from "@/service/AuthService";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    userInfo: JSON.parse(sessionStorage.getItem("userInfo") || "null") as LoginInfoDto | null,
    isLoggedIn: !!sessionStorage.getItem("accessToken"),
  }),

  getters: {
    username: (state) => state.userInfo?.username,
    userId: (state) => state.userInfo?.userId,
    token: () => sessionStorage.getItem("accessToken"),
  },

  actions: {
    // 🔐 LOGIN
    async login(form: LoginForm) {
      const res = await AuthService.Login(form);
      const data = res.data;

      if (!data?.token) {
        return { success: false, message: "Sai tài khoản hoặc mật khẩu" };
      }

      sessionStorage.setItem("accessToken", data.token);
      sessionStorage.setItem("refreshToken", data.refreshToken ?? "");
      sessionStorage.setItem("userInfo", JSON.stringify(data));

      this.userInfo = data;
      this.isLoggedIn = true;

      // ✅ CONNECT WS SAU KHI TOKEN ĐÃ CÓ
      await connectWebSocket(data.token);
      console.log("🔌 WS connected after login");

      return { success: true };
    },

    // 🔄 F5 / REFRESH
    async restoreSession() {
      const token = sessionStorage.getItem("accessToken");
      const user = sessionStorage.getItem("userInfo");

      if (token && user) {
        this.userInfo = JSON.parse(user);
        this.isLoggedIn = true;

        await connectWebSocket(token);
        console.log("♻ WS reconnected after refresh");
      }
    },

    // 🚪 LOGOUT
    logout() {
      sessionStorage.clear();
      this.userInfo = null;
      this.isLoggedIn = false;
      disconnect();
    },
  },
});
