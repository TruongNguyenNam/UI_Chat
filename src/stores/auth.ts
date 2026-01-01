// src/stores/authStore.ts
import { defineStore } from "pinia";
import { AuthService } from "../service/AuthService";
import { connectWebSocket, disconnect } from "../service/WebSocketService";
import type { LoginForm, LoginInfoDto,UserOnlineDTO } from "@/service/AuthService";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    userInfo: JSON.parse(sessionStorage.getItem("userInfo") || "null") as LoginInfoDto | null,
    isLoggedIn: !!sessionStorage.getItem("accessToken"),
    onlineUsers: [] as UserOnlineDTO[],
  }),

  getters: {
    username: (state) => state.userInfo?.username,
    userId: (state) => state.userInfo?.userId,
    token: () => sessionStorage.getItem("accessToken"),
    isUserOnline: (state) => (userId: number) =>
    state.onlineUsers.some((u) => u.userId === userId),
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
    async logout() {
      try {
        // 1️⃣ Gọi backend logout (cập nhật isOnline = false)
        await AuthService.logout();
      } catch (error) {
        console.warn("Backend logout failed", error);
      } finally {
        // 2️⃣ Disconnect WebSocket
        disconnect();
    
        // 3️⃣ Clear session
        sessionStorage.clear();
    
        // 4️⃣ Reset store
        this.userInfo = null;
        this.isLoggedIn = false;
      }
    },

    async fetchOnlineUsers() {
      try {
        const res = await AuthService.getAllUserIsOnline();
        this.onlineUsers = res.data ?? [];
      } catch (e) {
        console.error("❌ fetchOnlineUsers failed", e);
      }
    },
    
    setUserOnline(userId: number, lastActive: string) {
      const user = this.onlineUsers.find(u => u.userId === userId);
    
      if (!user) {
        this.onlineUsers.push({
          userId,
          isOnline: true,
          lastActive,
        });
      } else {
        user.isOnline = true;
        user.lastActive = lastActive;
      }
    },
    
    
    setUserOffline(userId: number) {
      this.onlineUsers = this.onlineUsers.filter(
        (u) => u.userId !== userId
      );
    },



  },
});
