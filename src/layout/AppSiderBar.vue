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
        class="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100"
        active-class="bg-blue-100 text-blue-600"
      >
        <i :class="item.icon" class="text-xl"></i>

        <span
          v-if="item.hasBadge && unreadCount > 0"
          class="absolute -top-1 -right-1 min-w-[18px] h-[18px]
                bg-red-500 text-white text-[11px] font-bold
                rounded-full flex items-center justify-center
                ring-2 ring-white"
        >
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>

      </RouterLink>

      
    </nav>

    <!-- Footer (avatar user) -->
    <div class="mt-auto relative">
      <img
        :src="avatarUrl"
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
            <li
              class="hover:bg-gray-100 px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2 text-red-600"
              @click="logout"
            >
              <i class="pi pi-sign-out"></i> Đăng xuất
            </li>
          </ul>
        </div>
      </transition>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount,computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'  // Đảm bảo đường dẫn đúng với store auth của bạn
import { ChatMemberService } from '../service/ChatMemberService';
import avatarfermale from '../assets/img/avatarfermale.png';
import { getWebSocketClient } from "../service/WebSocketService";
// import { subscribe } from "../service/WebSocketService"
const router = useRouter()
const authStore = useAuthStore()
const showMenu = ref(false)
const unreadCount = ref<number>(0)
const toggleMenu = () => {
  showMenu.value = !showMenu.value
}
const client = getWebSocketClient();
const avatarUrl = computed(
  () => authStore.userInfo?.avatarUrl 
|| avatarfermale);

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

const logout = async () => {
  showMenu.value = false
  await authStore.logout()  // Gọi hàm logout từ store để clear session, disconnect WS, v.v.
  router.push('/auth')      // Chuyển hướng về trang login
}

const fecthBageUnread = async () => {
  try {
      const response = await ChatMemberService.sumUnreadByMe();
      unreadCount.value = response.data || 0;
    
  } catch (error) {
      console.log(error)
  }

}
const subscribeUnreadSync = () => {
  if (!client || !client.connected) {
    console.warn("WS chưa connect, không subscribe unread-sync")
    return
  }

  client.subscribe("/user/queue/unread-sync", (msg) => {
    const total = Number(msg.body)
    unreadCount.value = total
    console.log("🔔 Badge sync =", total)
  })
}




onMounted(() => {
    fecthBageUnread()
    subscribeUnreadSync()
})


const navItems = [
  { name: "messages", to: "/chat", icon: "pi pi-comments",hasBadge: true },
  { name: "contacts", to: "/contacts", icon: "pi pi-user" },
  { name: "notifications", to: "/notifications", icon: "pi pi-bell" },
  { name: "calls", to: "/call", icon: "pi pi-phone" },
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