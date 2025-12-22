<!-- cái này là sideder bar  -->
<template>
  <div class="flex h-screen relative">
    <!-- Sidebar -->
    <aside class="w-16 bg-white border-r flex flex-col items-center py-4 z-10">
      <!-- Logo -->
      <div class="mb-6 cursor-pointer flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100">
        <img src="../assets/img/logo.png" alt="Logo" class="w-8 h-8" />
      </div>

      <!-- Navigation icons -->
      <nav class="flex-1 flex flex-col gap-6">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="item.to"
          class="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100"
          active-class="bg-blue-100 text-blue-600"
        >
          <i :class="item.icon" class="text-xl"></i>
        </RouterLink>
      </nav>

      <!-- Footer avatar -->
      <div class="mt-auto relative">
        <img
          src="https://i.pravatar.cc/40?img=11"
          class="w-10 h-10 rounded-full border cursor-pointer hover:opacity-80"
          @click="openUserDialog"
        />
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 bg-gray-50 relative overflow-y-auto">
      <RouterView />
    </main>

    <!-- User Menu Dialog -->
    <Dialog
      v-model:visible="showUserDialog"
      header="User Menu"
      :style="{ width: '20rem' }"
      modal
      :draggable="false"
    >
      <div class="flex flex-col gap-3">
        <Button
          label="👤 View Profile"
          icon="pi pi-user"
          class="w-full"
          @click="goToProfile"
        />
        <Button
          label="🚪 Logout"
          icon="pi pi-sign-out"
          severity="danger"
          class="w-full"
          @click="logout"
        />
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
// import { useAuthStore } from "../stores/auth";



const router = useRouter()

const navItems = [
  { name: "messages", to: "/chat", icon: "pi pi-comments" },
  { name: "contacts", to: "/contacts", icon: "pi pi-user" },
  { name: "notifications", to: "/notifications", icon: "pi pi-bell" },
  { name: "calls", to: "/call", icon: "pi pi-phone" },
  { name: "darkmode", to: "/dark", icon: "pi pi-moon" },
  { name: "settings", to: "/settings", icon: "pi pi-cog" },
]

const showUserDialog = ref(false)

const openUserDialog = () => {
  showUserDialog.value = true
}

const goToProfile = () => {
  showUserDialog.value = false
  router.push('/profile')
}

const logout = () => {
  sessionStorage.removeItem('accessToken')
  showUserDialog.value = false
  router.push('/login')
}
</script>
