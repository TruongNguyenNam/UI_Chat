<template>
  <aside class="w-16 bg-white border-r flex flex-col items-center py-4 relative">
    <!-- Logo -->
    <div class="mb-6 cursor-pointer">
      <img src="../assets/img/logo.png" alt="Logo" class="w-15 h-15" />
    </div>

    <!-- Navigation -->
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

    <!-- Footer (avatar user) -->
    <div class="mt-auto relative">
      <img
        src="https://i.pravatar.cc/40?img=11"
        class="w-10 h-10 rounded-full border cursor-pointer"
        @click="toggleMenu"
      />

      <!-- Dropdown menu -->
      <transition name="fade">
        <div
          v-if="showMenu"
          class="absolute bottom-14 left-10 w-56 bg-white shadow-lg rounded-xl border p-2 z-50"
        >
          <div class="px-4 py-2 border-b text-gray-600 text-sm">
            truongnnph49746@gmail.com
          </div>

          <ul class="mt-2 text-sm text-gray-700">
            <RouterLink
              to="/auth"
              class="block hover:bg-gray-100 px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2"
            >
              <i class="pi pi-question-circle"></i> Login
            </RouterLink>

            <li class="hover:bg-gray-100 px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2">
              <i class="pi pi-star"></i> Nâng cấp gói
            </li>
            <li class="hover:bg-gray-100 px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2">
              <i class="pi pi-user-edit"></i> Cá nhân hóa
            </li>
            <li
              class="hover:bg-gray-100 px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2"
              @click="goToSettings"
            >
              <i class="pi pi-cog"></i> Cài đặt
            </li>
            <li class="hover:bg-gray-100 px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2">
              <i class="pi pi-question-circle"></i> Trợ giúp
            </li>
            <li class="hover:bg-gray-100 px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2 text-red-600">
              <i class="pi pi-sign-out"></i> Đăng xuất
            </li>
          </ul>
        </div>
      </transition>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showMenu = ref(false)

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.mt-auto')) showMenu.value = false
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))

const goToSettings = () => {
  router.push('/settings')
  showMenu.value = false
}

const navItems = [
  { name: "messages", to: "/chat", icon: "pi pi-comments" },
  { name: "contacts", to: "/contacts", icon: "pi pi-user" },
  { name: "notifications", to: "/notifications", icon: "pi pi-bell" },
  { name: "calls", to: "/call", icon: "pi pi-phone" },
  { name: "darkmode", to: "/dark", icon: "pi pi-moon" },
  { name: "settings", to: "/settings", icon: "pi pi-cog" },
]
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
