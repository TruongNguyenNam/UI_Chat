<template>
    <div class="w-80 border-l bg-white flex flex-col h-full">
      <!-- PROFILE HEADER -->
      <div class="p-4 border-b text-center">
        <img
          :src="avatarUrl || '/default-avatar.png'"
          class="w-20 h-20 rounded-full mx-auto object-cover"
        />
   
        <p class="text-sm text-gray-500">
          @{{ fullName }}
        </p>
  
        <!-- ACTION ICONS -->
        <div class="flex justify-center gap-5 mt-4 text-gray-600">
          <i class="pi pi-phone cursor-pointer hover:text-black"></i>
          <i class="pi pi-video cursor-pointer hover:text-black"></i>
          <i class="pi pi-sign-out cursor-pointer hover:text-black"></i>
          <i class="pi pi-info-circle cursor-pointer hover:text-black"></i>
          <i class="pi pi-ellipsis-h cursor-pointer hover:text-black"></i>
        </div>
      </div>
  
      <!-- MEDIA HEADER -->
      <div class="p-3 border-b">
        <h3 class="font-semibold text-lg">Media</h3>
  
        <!-- Tabs -->
        <div class="flex gap-2 mt-2">
          <button
            v-for="tab in tabs"
            :key="tab"
            @click="activeTab = tab"
            class="px-3 py-1 text-sm rounded-md"
            :class="
              activeTab === tab
                ? 'bg-gray-200 font-medium'
                : 'text-gray-500 hover:bg-gray-100'
            "
          >
            {{ tab }}
          </button>
        </div>
      </div>
  
      <!-- CONTENT -->
      <div class="flex-1 p-3 overflow-y-auto">
        <!-- Empty -->
        <div
          v-if="filteredMedia.length === 0"
          class="text-gray-400 text-sm text-center mt-6"
        >
          Chưa có media
        </div>
  
        <!-- Grid -->
        <div class="grid grid-cols-3 gap-2">
          <div
            v-for="media in displayMedia"
            :key="media.id"
            class="relative cursor-pointer group"
          >
            <!-- IMAGE -->
            <img
              v-if="media.mediaType === 'IMAGE'"
              :src="media.mediaUrl"
              class="w-full h-24 object-cover rounded-md"
            />
  
            <!-- VIDEO -->
            <video
              v-else-if="media.mediaType === 'VIDEO'"
              :src="media.mediaUrl"
              class="w-full h-24 object-cover rounded-md"
              muted
            />
  
            <!-- FILE -->
            <div
              v-else
              class="w-full h-24 flex items-center justify-center bg-gray-100 rounded-md"
            >
              <i class="pi pi-file text-2xl text-gray-500"></i>
            </div>
          </div>
  
          <!-- 99+ -->
          <div
            v-if="filteredMedia.length > maxPreview"
            class="w-full h-24 flex items-center justify-center bg-gray-100 rounded-md text-gray-600 font-semibold"
          >
            {{ filteredMedia.length - maxPreview }}+
          </div>
        </div>
  
        <!-- Show more -->
        <button
          v-if="filteredMedia.length > maxPreview"
          @click="showAll = !showAll"
          class="mt-4 w-full border rounded-md py-2 text-sm hover:bg-gray-50 flex items-center justify-center gap-2"
        >
          {{ showAll ? 'Thu gọn' : 'Show more' }}
          <i class="pi pi-arrow-right"></i>
        </button>
      </div>
    </div>
  </template>
  
  
  <script setup lang="ts">
  import { computed, ref } from "vue"
  import type { MediaResponseDTO } from "@/model/media/MediaResponseDTO"
  
  const props = defineProps<{
    mediaList: MediaResponseDTO[]
    fullName?: string
    avatarUrl?: string
    }>()

  
  const tabs = ["Media", "Link", "Docs"]
  const activeTab = ref("Media")
  const showAll = ref(false)
  const maxPreview = 8
  
  const filteredMedia = computed(() => {
  if (activeTab.value === "Media") {
    return props.mediaList.filter(
      m => m.mediaType === "IMAGE" || m.mediaType === "VIDEO"
    )
  }
  if (activeTab.value === "Docs") {
    return props.mediaList.filter(m => m.mediaType === "FILE")
  }
  return []
})

  
  const displayMedia = computed(() =>
    showAll.value ? filteredMedia.value : filteredMedia.value.slice(0, maxPreview)
  )
  </script>
  
  