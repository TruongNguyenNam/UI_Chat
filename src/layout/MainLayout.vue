<template>
    <div class="flex h-screen">
      <AppSidebar />
      <main class="flex-1 bg-gray-50">
        <RouterView />
      </main>
    </div>
  </template>
  
  <script setup lang="ts">
  import AppSidebar from './AppSiderBar.vue'
  import { RouterView } from 'vue-router';
  </script>
  