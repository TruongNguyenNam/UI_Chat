<template>
  <div class="w-80 bg-white border-l border-gray-200 flex flex-col h-full shadow-xl">
    <!-- PROFILE HEADER -->
    <div class="p-6 text-center border-b border-gray-200">
      <img
        :src="avatarUrl || '/default-avatar.png'"
        alt="avatar"
        class="w-28 h-28 rounded-full mx-auto object-cover ring-4 ring-blue-100 shadow-lg"
        @error="onImageError"
      />

      <p class="mt-4 font-bold text-xl text-gray-900">{{ fullName }}</p>
      <p class="text-sm text-gray-500">@{{ username }}</p>

      <!-- ACTION ICONS -->
      <div class="flex justify-center gap-6 mt-6 text-gray-600">
        <i class="pi pi-phone text-2xl cursor-pointer hover:text-blue-600 transition"></i>
        <i class="pi pi-video text-2xl cursor-pointer hover:text-blue-600 transition"></i>
        <i class="pi pi-bell text-2xl cursor-pointer hover:text-gray-800 transition"></i>
        <i class="pi pi-search text-2xl cursor-pointer hover:text-gray-800 transition"></i>
      </div>
    </div>

    <!-- MEDIA HEADER -->
    <div class="p-4 border-b border-gray-200">
      <h3 class="font-semibold text-lg mb-3">Tệp đính kèm</h3>

      <!-- Tabs -->
      <div class="flex gap-2">
        <button
          v-for="tab in tabs"
          :key="tab"
          @click="activeTab = tab"
          class="px-4 py-2 rounded-lg text-sm font-medium transition"
          :class="activeTab === tab ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'"
        >
          {{ tab }}
        </button>
      </div>
    </div>

    <!-- CONTENT -->
    <div class="flex-1 overflow-y-auto p-4">
      <!-- Empty state -->
      <div v-if="filteredMedia.length === 0" class="text-center text-gray-400 py-12">
        Chưa có tệp nào
      </div>

      <!-- Media grid -->
      <div v-else class="grid grid-cols-3 gap-3">
        <div
          v-for="media in displayMedia"
          :key="media.id"
          class="relative overflow-hidden rounded-lg cursor-pointer group"
          @click="openImageModal(media.mediaUrl)"
        >
          <!-- Image -->
          <img
            v-if="media.mediaType === 'IMAGE'"
            :src="media.mediaUrl"
            class="w-full h-28 object-cover transition group-hover:scale-110"
            @error="onImageError"
          />

          <!-- Video -->
          <video
            v-else-if="media.mediaType === 'VIDEO'"
            :src="media.mediaUrl"
            class="w-full h-28 object-cover transition group-hover:scale-110"
            muted
            playsinline
          />

          <!-- File (Docs) -->
          <div
            v-else
            class="w-full h-28 bg-gray-100 flex items-center justify-center rounded-lg"
          >
            <i class="pi pi-file text-4xl text-gray-400"></i>
          </div>

          <!-- Play icon overlay for video -->
          <div
            v-if="media.mediaType === 'VIDEO'"
            class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/30"
          >
            <i class="pi pi-play-circle text-4xl text-white"></i>
          </div>
        </div>

        <!-- More count overlay -->
        <div
          v-if="filteredMedia.length > maxPreview && !showAll"
          class="h-28 bg-gray-200/80 rounded-lg flex items-center justify-center text-2xl font-bold text-gray-600"
        >
          +{{ filteredMedia.length - maxPreview }}
        </div>
      </div>

      <!-- Show more / collapse button -->
      <button
        v-if="filteredMedia.length > maxPreview"
        @click="showAll = !showAll"
        class="mt-6 w-full py-3 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
      >
        {{ showAll ? 'Thu gọn' : 'Xem thêm' }}
        <i :class="showAll ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { MediaResponseDTO } from "@/model/media/MediaResponseDTO";

const props = defineProps<{
  mediaList: MediaResponseDTO[];
  fullName: string;
  avatarUrl?: string;
}>();

// Tạo username từ fullName (giống như trong ChatMiddle)
const username = computed(() => {
  return props.fullName.toLowerCase().replace(/\s/g, "");
});

const tabs = ["Media", "Link", "Docs"] as const;
type TabType = (typeof tabs)[number];

const activeTab = ref<TabType>("Media");
const showAll = ref(false);
const maxPreview = 9;

const filteredMedia = computed(() => {
  if (activeTab.value === "Media") {
    return props.mediaList.filter(
      (m) => m.mediaType === "IMAGE" || m.mediaType === "VIDEO"
    );
  }
  if (activeTab.value === "Docs") {
    return props.mediaList.filter((m) => m.mediaType === "FILE");
  }
  // Link tab hiện tại chưa có data → trả về mảng rỗng
  return [];
});

const displayMedia = computed(() =>
  showAll.value ? filteredMedia.value : filteredMedia.value.slice(0, maxPreview)
);

// Mở ảnh/video trong tab mới (có thể thay bằng modal lightbox sau)
const openImageModal = (url: string) => {
  window.open(url, "_blank");
};

// Fallback avatar
const onImageError = (e: Event) => {
  (e.target as HTMLImageElement).src = "/default-avatar.png";
};
</script>

<style scoped>
/* Không cần style scoped đặc biệt vì đã dùng Tailwind */
</style>