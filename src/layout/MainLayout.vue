<!-- src/layout/MainLayout.vue -->
<template>
  <div v-if="authStore.isLoggedIn" class="flex h-screen">
    <AppSidebar />

    <main class="flex-1 bg-gray-50">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "../stores/auth";
import AppSidebar from "./AppSiderBar.vue";
import { RouterView } from "vue-router";

const authStore = useAuthStore();
</script>
