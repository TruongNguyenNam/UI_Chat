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

    <!-- MEDIA SECTION -->
    <div
      class="flex-1 bg-white rounded-2xl shadow-sm p-4
            overflow-y-auto max-h-[420px]
            scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
    >

      <!-- Empty -->
      <div
        v-if="filteredMedia.length === 0"
        class="flex flex-col items-center justify-center text-gray-400 py-16"
      >
        <i class="pi pi-folder-open text-4xl mb-3"></i>
        <p class="text-sm">Chưa có tệp nào</p>
      </div>

      <!-- Media grid -->
      <div v-else class="grid grid-cols-3 gap-3">
        <div
          v-for="media in displayMedia"
          :key="media.id"
          class="relative group overflow-hidden rounded-xl cursor-pointer
                bg-gray-100 shadow-sm hover:shadow-md transition"
          @click="openImageModal(media.mediaUrl)"
        >
          <!-- IMAGE -->
          <img
            v-if="media.mediaType === 'IMAGE'"
            :src="media.mediaUrl"
            class="w-full h-28 object-cover
                  transition-transform duration-300
                  group-hover:scale-110"
            @error="onImageError"
          />

          <!-- VIDEO -->
          <video
            v-else-if="media.mediaType === 'VIDEO'"
            :src="media.mediaUrl"
            class="w-full h-28 object-cover
                  transition-transform duration-300
                  group-hover:scale-110"
            muted
            playsinline
          />

          <!-- FILE -->
          <div
            v-else
            class="w-full h-28 flex items-center justify-center bg-gray-100"
          >
            <i class="pi pi-file text-4xl text-gray-400"></i>
          </div>

          <!-- Play overlay -->
          <div
            v-if="media.mediaType === 'VIDEO'"
            class="absolute inset-0 flex items-center justify-center
                  bg-black/40 opacity-0
                  group-hover:opacity-100 transition"
          >
            <i class="pi pi-play-circle text-5xl text-white drop-shadow"></i>
          </div>
        </div>

        <!-- More overlay -->
        <div
          v-if="filteredMedia.length > maxPreview && !showAll"
          class="h-28 rounded-xl bg-black/60
                flex items-center justify-center
                text-white text-xl font-semibold"
        >
          +{{ filteredMedia.length - maxPreview }}
        </div>
      </div>

      <!-- Toggle -->
      <button
        v-if="filteredMedia.length > maxPreview"
        @click="showAll = !showAll"
        class="mt-6 w-full py-2.5 rounded-xl
              border text-sm font-medium
              flex items-center justify-center gap-2
              hover:bg-gray-100 transition"
      >
        {{ showAll ? 'Thu gọn' : 'Xem thêm' }}
        <i :class="showAll ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"></i>
      </button>
    </div>      
     
    <!-- MEMBER LIST -->
    <div
      class="mt-4 bg-white rounded-2xl shadow-sm p-4
            max-h-[300px] overflow-y-auto
            scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
    >

      <!-- Header -->
      <h3 class="font-semibold text-base mb-4 flex items-center gap-2">
        <i class="pi pi-users text-gray-500"></i>
        Danh sách thành viên
        <span class="text-xs text-gray-500">
          ({{ memberList.length }})
        </span>
      </h3>

      <!-- Members -->
      <div class="space-y-2">
        <div
          v-for="member in memberList"
          :key="member.id"
          class="flex items-center gap-3 p-2 rounded-lg
                hover:bg-gray-100 transition cursor-pointer"
        >
          <img
            :src="member.avatarUrl || '/default-avatar.png'"
            class="w-10 h-10 rounded-full object-cover
                  ring-1 ring-gray-200"
            @error="onImageError"
          />

          <div class="flex-1 min-w-0">
            <p class="font-medium text-sm text-gray-800 truncate">
              {{ member.fullName }}
            </p>
            <!-- <p class="text-xs text-gray-500 truncate">
              {{ member.phone }}
            </p> -->
          </div>
        </div>
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { MediaResponseDTO } from "@/model/media/MediaResponseDTO";
import type { ChatMemberResponseDTO } from "@/model/chat_member/ChatMemberResponseDTO";
  const props = defineProps<{
    mediaList: MediaResponseDTO[];
    fullName?: string;
    avatarUrl?: string;
    memberList:ChatMemberResponseDTO[];
  }>();

// Tạo username từ fullName (giống như trong ChatMiddle)
const username = computed(() => {
  return props.fullName?.toLowerCase().replace(/\s/g, "");
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