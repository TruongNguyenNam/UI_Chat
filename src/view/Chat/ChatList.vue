<template>
  <div class="flex h-screen">
    <!-- Sidebar bạn bè -->
    <div style="width: 350px; border-right: 1px solid #ddd;" class="p-4">
      <h1 class="text-2xl font-bold mb-4 text-center">Danh sách bạn bè</h1>

      <!-- Thanh search + nút thêm -->
      <div class="mb-4 flex items-center justify-between">
        <div class="flex items-center w-2/3 max-w-md">
          <IconField class="flex-1">
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText placeholder="Search" class="w-65" />
          </IconField>
        </div>

        <Button icon="pi pi-user-plus" class="ml-2 text-xs px-2 py-1"
        @click="showAddFriendDialog = true"
        />
      </div>

      <div>
        <h2 class="text-lg font-semibold mb-2">Danh sách người dùng</h2>
      </div>

      <div v-if="listChats.length === 0">
        <p class="text-gray-500">chưa có bạn bè nào</p>
      </div>

      <ScrollPanel style="width: 100%; height: calc(100vh - 120px);">
        <ul class="space-y-2">
          <li
            v-for="friend in listChats"
            :key="friend.chatId"
            class="flex items-center gap-3 p-2 rounded hover:bg-gray-100 cursor-pointer"
            @click="selectFriend(friend)"
          >
            <!-- Avatar + trạng thái -->
            <div class="relative">
              <img :src="friend.avatarUrl" class="w-12 h-12 rounded-full border" />
              <!-- <span
                v-if="friend.userStatus === 'online'"
                class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border border-white rounded-full"
              ></span> -->
            </div>

            <!-- Thông tin -->
            <div class="flex flex-col">
              <p class="font-semibold">{{ friend.fullName }}</p>
              <!-- <p v-if="friend.userStatus === 'online'" class="text-sm text-green-500">Online</p>
              <p v-else class="text-sm text-gray-500">{{ friend.userStatus }}</p> -->
            </div>
          </li>
        </ul>
      </ScrollPanel>
    </div>
    <!-- Khu vực chat -->
    <ChatMiddle :selectedFriend="selectedFriend" />


    <Dialog
      v-model:visible="showAddFriendDialog"
      header="Tìm bạn bằng số điện thoại"
      modal
      style="width: 400px"
    >
      <!-- Input phone -->
      <div class="flex gap-2 mb-3">
        <InputText
          v-model="phoneSearch"
          placeholder="Nhập số điện thoại"
          class="flex-1"
        />
        <Button
          label="Tìm"
          icon="pi pi-search"
          :loading="searching"
          @click="searchByPhone"
        />
  </div>

  <!-- Loading -->
  <div v-if="searching" class="flex justify-center">
    <ProgressSpinner style="width: 30px; height: 30px" />
  </div>

  <!-- Kết quả -->
  <div v-if="searchResult" class="flex items-center gap-3 mt-3 p-2 border rounded">
    <img
      :src="searchResult.avatarUrl"
      class="w-12 h-12 rounded-full border"
    />

    <div class="flex-1">
      <p class="font-semibold">{{ searchResult.fullName }}</p>
      <p class="text-sm text-gray-500">{{ searchResult.phone }}</p>
    </div>

    <Button
      label="Kết bạn"
      icon="pi pi-user-plus"
      size="small"
      
    />
  </div>

  <!-- Không tìm thấy -->
  <p v-if="!searchResult && !searching && phoneSearch" class="text-sm text-gray-500">
    Không tìm thấy người dùng
  </p>
    </Dialog>


  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputText from "primevue/inputtext";
import ScrollPanel from "primevue/scrollpanel";
import ChatMiddle from "./ChatMiddle.vue";
import { Button } from "primevue";
import type { FriendResponseDTO } from "../../model/friend/FriendResponseDTO";
import { FriendService } from "../../service/FriendService";
import { ChatService } from "../../service/ChatService";
import type { ChatResponseDTO } from "../../model/chat/ChatResponseDTO";
import { useAuthStore } from "../../stores/auth";
import Dialog from "primevue/dialog";
import ProgressSpinner from "primevue/progressspinner";

const authStore = useAuthStore();
const loading = ref(false);
const listChats = ref<ChatResponseDTO[]>([]);
const selectedFriend = ref<ChatResponseDTO | null>(null);
const showAddFriendDialog = ref(false);
const phoneSearch = ref("");
const searchResult = ref<FriendResponseDTO | null>(null);
const searching = ref(false);


const searchByPhone = async () => {
  if (!phoneSearch.value) return;

  try {
    searching.value = true;
    searchResult.value = null;

    const response = await FriendService.findByPhone(phoneSearch.value);
    searchResult.value = response.data ?? null;

  } catch (error) {
    searchResult.value = null;
  } finally {
    searching.value = false;
  }
};


const fetchChatlist = async () => {
  try {
    loading.value = true;
    const response = await ChatService.findAllByChatType();
    listChats.value = response.data || [];
    console.log("listContacts", listChats.value);
  } catch (error) {
    console.error("Failed to fetch contacts:", error);
  } finally {
    loading.value = false;
  }
};

const selectFriend = (friend: ChatResponseDTO) => {
  selectedFriend.value = friend;
};

onMounted(() => {
  console.log(authStore.userInfo?.userId)
  // fetchContacts();
  fetchChatlist();
});
</script>
