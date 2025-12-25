<template>
  <div class="flex h-screen bg-gray-100 relative">
    <!-- Sidebar -->
    <aside class="w-20 bg-gray-900 flex flex-col items-center py-6 shadow-xl z-10">
      <!-- Logo -->
      <div class="mb-10 cursor-pointer group">
        <div class="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <img src="../assets/img/logo.png" alt="Logo" class="w-9 h-9 rounded-lg" />
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 flex flex-col gap-4">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="item.to"
          class="relative group flex items-center justify-center w-12 h-12 rounded-2xl hover:bg-blue-600 transition-all duration-200"
          active-class="bg-blue-600 text-white"
        >
          <i :class="item.icon" class="text-2xl text-gray-400 group-hover:text-white transition-colors" />
          <!-- Tooltip -->
          <span class="absolute left-16 ml-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
            {{ item.label }}
          </span>
        </RouterLink>
      </nav>

      <!-- User Avatar -->
      <div class="mt-auto relative group">
        <img
          :src="avatarUrl"
          :alt="fullName"
          class="w-12 h-12 rounded-2xl border-4 border-gray-800 cursor-pointer hover:border-blue-600 transition-all object-cover"
          @click="toggleUserMenu"
        />

        <!-- Online dot -->
        <span
          v-if="isOnline"
          class="absolute bottom-1 right-1 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"
        ></span>

        <!-- User Menu Dialog -->
        <Dialog
          v-model:visible="showUserDialog"
          header="Menu người dùng"
          :style="{ width: '22rem' }"
          modal
          :draggable="false"
          class="shadow-2xl"
          @hide="showUserDialog = false"
        >
          <div class="flex flex-col gap-4 p-2">
            <div class="flex items-center gap-3 mb-2">
              <img :src="avatarUrl" class="w-12 h-12 rounded-full object-cover" />
              <div>
                <p class="font-semibold">{{ fullName }}</p>
                <p class="text-sm text-gray-500">@{{ username }}</p>
              </div>
            </div>

            <Button
              label="👤 Xem hồ sơ"
              icon="pi pi-user"
              class="w-full justify-start text-left"
              severity="secondary"
              @click="goToProfile"
            />

            <Button
              label="🚪 Đăng xuất"
              icon="pi pi-sign-out"
              severity="danger"
              class="w-full justify-start text-left"
              @click="logout"
            />
          </div>
        </Dialog>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 overflow-y-auto">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import Dialog from "primevue/dialog";
import Button from "primevue/button";

const router = useRouter();
const authStore = useAuthStore();

const navItems = [
  { name: "messages", to: "/chat", icon: "pi pi-comments", label: "Tin nhắn" },
  { name: "contacts", to: "/contacts", icon: "pi pi-users", label: "Danh bạ" },
  { name: "notifications", to: "/notifications", icon: "pi pi-bell", label: "Thông báo" },
  { name: "calls", to: "/call", icon: "pi pi-phone", label: "Cuộc gọi" },
  { name: "settings", to: "/settings", icon: "pi pi-cog", label: "Cài đặt" },
];

const avatarUrl = computed(() => authStore.userInfo?.avatarUrl || "https://i.pravatar.cc/300?img=1");
const fullName = computed(() => authStore.userInfo?.fullName || "Người dùng");
const username = computed(() => authStore.userInfo?.username || "guest");
const isOnline = computed(() => authStore.userInfo?.status === "ONLINE");

const showUserDialog = ref(false);

const toggleUserMenu = () => {
  showUserDialog.value = !showUserDialog.value;
};

const goToProfile = () => {
  showUserDialog.value = false;
  router.push("/profile"); // Đảm bảo bạn có route /profile
};

const logout = async () => {
  showUserDialog.value = false;
  await authStore.logout(); // Clear token, disconnect WS, set isLoggedIn = false
  router.push("/auth");     // Force redirect – an toàn nhất
};
</script>

<style scoped>
/* Tailwind đã đủ, không cần thêm */
</style>