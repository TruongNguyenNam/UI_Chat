<template>
  <RouterView />
</template>

<!-- <script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'  // Đảm bảo path đúng

const authStore = useAuthStore()

onMounted(() => {
  authStore.restoreSession()  // ← Gọi ở đây: sau khi app mount, Pinia sẵn sàng
  console.log("App mounted - restoreSession called")
})
</script> -->