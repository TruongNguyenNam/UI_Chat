<!-- chatList -->
<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar danh sách bạn bè -->
    <div class="w-96 border-r border-gray-300 bg-white flex flex-col" >
      <div class="p-6 border-b border-gray-200">
        <h1 class="text-2xl font-bold text-center text-gray-800">Danh sách bạn bè</h1>
      </div>

      <!-- Thanh tìm kiếm + nút thêm bạn -->
      <div class="p-4 flex items-center gap-3 border-b bg-white">
  <!-- Search -->
        <IconField class="flex-1">
          <InputIcon class="text-gray-400">
            <i class="pi pi-search" />
          </InputIcon>
          <InputText
            v-model="searchQuery"
            placeholder="Tìm kiếm bạn bè..."
            class="w-full rounded-full pl-10 bg-gray-100 border-none
                  focus:ring-2 focus:ring-blue-200"
          />
        </IconField>

        <!-- Add friend -->
        <Button
          icon="pi pi-user-plus"
          severity="secondary"
          rounded
          class="w-10 h-10 p-0"
          @click="showAddFriendDialog = true"
          title="Thêm bạn"
        />

        <!-- Create group -->
        <Button
          icon="pi pi-users"
          severity="info"
          rounded
          class="w-10 h-10 p-0"
          @click="showAddFriendDialog = true"
          title="Tạo nhóm chat"
        />
      </div>


      <!-- Tiêu đề danh sách -->
      <div class="px-6">
        <h2 class="text-lg font-semibold text-gray-700">Trò chuyện gần đây</h2>
      </div>

      <!-- Trạng thái chưa có bạn -->
      <div v-if="filteredChats.length === 0" class="flex-1 flex items-center justify-center">
        <p class="text-gray-500 text-center">
          {{ listChats.length === 0 ? 'Chưa có bạn bè nào' : 'Không tìm thấy kết quả' }}
        </p>
      </div>

      <!-- Danh sách bạn bè -->
      <ScrollPanel v-else class="flex-1 px-4 pb-4" style="height: calc(100vh - 260px)">
        <ul class="space-y-2 mt-3">
          <li
            v-for="friend in filteredChats"
            :key="friend.chatId"
            class="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-100 cursor-pointer transition-all duration-200"
            :class="{ 'bg-gray-50': selectedChat?.chatId === friend.chatId }"
            @click="selectFriend(friend)"
          >
            <!-- Avatar + trạng thái online -->
            <div class="relative flex-shrink-0">
              <img
                :src="friend.avatarUrl || '/default-avatar.png'"
                alt="Avatar"
                class="w-14 h-14 rounded-full border-2 border-gray-300 object-cover"
              />
              <!-- Badge unread -->
            <span
              v-if="friend.unreadCount && friend.unreadCount > 0"
              class="absolute -top-1 -right-1 bg-red-500 text-white text-xs
                    min-w-[20px] h-5 px-1 rounded-full
                    flex items-center justify-center font-bold"
            >
              {{ friend.unreadCount > 99 ? '99+' : friend.unreadCount }}
            </span>


              <!-- Chấm xanh online -->
              <span
                v-if="friend.isOnline"
                class="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-3 border-white rounded-full ring-2 ring-white"
              ></span>

              <!-- Thời gian hoạt động cuối (offline) -->
              <div
                v-else
                class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
              >
                <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {{ formatLastActive(friend.lastActive) }}
                </span>
              </div>
            </div>

            <!-- Thông tin bạn bè -->
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-gray-900 truncate">{{ friend.fullName }}</p>
              <p class="text-sm text-gray-500 truncate">
                {{ friend.isOnline ? 'Đang hoạt động' : 'Offline' }}
              </p>
            </div>
          </li>
        </ul>
      </ScrollPanel>
    </div>

    <!-- Khu vực chat chính -->
    <ChatMiddle :selectedChat="selectedChat" />

    <!-- Dialog thêm bạn bằng số điện thoại -->
    <Dialog
      v-model:visible="showAddFriendDialog"
      header="Thêm bạn mới"
      modal
      :style="{ width: '450px' }"
      :pt="{
        header: { class: 'text-xl font-bold text-gray-800' },
        content: { class: 'p-6' }
      }"
    >
      <div class="space-y-5">
        <div class="flex gap-3">
          <InputText
            v-model="phoneSearch"
            placeholder="Nhập số điện thoại (ví dụ: 0901234567)"
            class="flex-1"
            @keyup.enter="searchByPhone"
          />
          <Button
            label="Tìm kiếm"
            icon="pi pi-search"
            :loading="searching"
            @click="searchByPhone"
          />
        </div>

        <!-- Đang tìm -->
        <div v-if="searching" class="flex justify-center py-10">
          <ProgressSpinner style="width: 50px; height: 50px" />
        </div>

        <!-- Kết quả tìm thấy -->
        <div
          v-else-if="searchResult"
          class="flex items-center gap-4 p-5 border-2 border-gray-200 rounded-xl bg-gray-50"
        >
          <img
            :src="searchResult.avatarUrl || '/default-avatar.png'"
            class="w-16 h-16 rounded-full border-2 border-gray-300"
          />
          <div class="flex-1">
            <p class="font-bold text-lg">{{ searchResult.fullName }}</p>
            <p class="text-gray-600">{{ searchResult.phone }}</p>
          </div>
          <Button
            label="Kết bạn"
            icon="pi pi-user-plus"
            severity="success"
            @click="sendFriendRequest"
          />
        </div>

        <!-- Không tìm thấy -->
        <p v-else-if="phoneSearch && !searching" class="text-center text-gray-500 py-6">
          Không tìm thấy người dùng nào với số điện thoại này
        </p>

        <!-- Gợi ý ban đầu -->
        <p v-else class="text-center text-gray-400 italic">
          Nhập số điện thoại để tìm và kết bạn
        </p>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount, nextTick } from "vue";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputText from "primevue/inputtext";
import ScrollPanel from "primevue/scrollpanel";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import ProgressSpinner from "primevue/progressspinner";
import ChatMiddle from "./ChatMiddle.vue";

import type { ChatResponseDTO } from "../../model/chat/ChatResponseDTO";
import type { ChatListUpdateMsg } from "@/model/chat/ChatListUpdateMsg";
import type { FriendResponseDTO } from "../../model/friend/FriendResponseDTO";
import type { UserMsg } from "../../service/AuthService";

import { ChatService } from "../../service/ChatService";
import { FriendService } from "../../service/FriendService";
import { useAuthStore } from "../../stores/auth";
import { ChatMemberService } from "../../service/ChatMemberService";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  subscribe,
  unsubscribe,
  onConnected,
} from "../../service/WebSocketService";
import {subscribeToPersonalNotifications} from "../../service/subscribeToPersonalNotifications";
dayjs.extend(relativeTime);

// Stores & trạng thái
const authStore = useAuthStore();
const listChats = ref<ChatResponseDTO[]>([]);
const selectedChat = ref<ChatResponseDTO | null>(null);

// Dialog thêm bạn
const showAddFriendDialog = ref(false);
const phoneSearch = ref("");
const searchResult = ref<FriendResponseDTO | null>(null);
const searching = ref(false);
const unreadCount = ref<number>(0)
// Tìm kiếm local trong danh sách bạn bè
const searchQuery = ref("");
const filteredChats = computed(() => {
  if (!searchQuery.value.trim()) return listChats.value;
  const query = searchQuery.value.toLowerCase();
  return listChats.value.filter(friend =>
    friend.fullName.toLowerCase().includes(query)
  );
});

// Subscription IDs
let onlineUsersSubId: string | null = null;
let userStatusSubId: string | null = null;
let chatListUpdateSubId: string | null = null;

// Format thời gian "5 phút trước"
const formatLastActive = (lastActive?: string | Date) => {
  if (!lastActive) return "không rõ";
  return dayjs(lastActive).fromNow();
};

// Cập nhật trạng thái online/offline cho một người cụ thể (tối ưu)
const updateFriendStatus = (userId: number, isOnline: boolean, lastActive?: string) => {
  const friend = listChats.value.find(f => f.friendUserId === userId);
  if (friend) {
    friend.isOnline = isOnline;
    if (lastActive) friend.lastActive = lastActive;
  }
};

// Xử lý danh sách online users từ backend (broadcast)
const handleOnlineUsersList = (onlineUserIds: number[]) => {
  listChats.value.forEach(chat => {
    chat.isOnline = onlineUserIds.includes(chat.friendUserId);
  });

  // Đảm bảo bản thân luôn hiện online
  const myId = authStore.userInfo?.userId;
  if (myId) {
    const me = listChats.value.find(c => c.friendUserId === myId);
    if (me) me.isOnline = true;
  }
};

// Xử lý cập nhật realtime từng user
const handleUserStatus = (status: UserMsg) => {
  updateFriendStatus(status.userId, status.isOnline, status.lastActive);
};

const subscribeChatListUpdate = () => {
  if (chatListUpdateSubId) unsubscribe(chatListUpdateSubId)

  chatListUpdateSubId = subscribe(
    "/user/queue/chat-list-update",
    (msg) => {
      try {
        const data: ChatListUpdateMsg = JSON.parse(msg.body)

        const chat = listChats.value.find(
          c => c.chatId === data.chatId
        )
        if (!chat) return

        // ✅ update badge
        chat.unreadCount = data.unreadCount

        // ✅ update last message
        chat.lastMessageContent = data.lastMessageContent
        chat.lastMessageTime = data.lastMessageTime

        // ✅ đẩy chat lên đầu danh sách
        listChats.value = [
          chat,
          ...listChats.value.filter(c => c.chatId !== data.chatId)
        ]
      } catch (e) {
        console.error("Parse chat-list-update failed", e)
      }
    }
  )
}

// Subscribe tới các topic online status
const subscribeToTopics = () => {
  // Dọn dẹp subscription cũ
  if (onlineUsersSubId) unsubscribe(onlineUsersSubId);
  if (userStatusSubId) unsubscribe(userStatusSubId);

  // Danh sách online users (broadcast khi có login/logout)
  onlineUsersSubId = subscribe("/topic/online-users", (msg) => {
    try {
      const onlineUserIds: number[] = JSON.parse(msg.body);
      handleOnlineUsersList(onlineUserIds);
    } catch (e) {
      console.error("Lỗi parse /topic/online-users:", e);
    }
  });

  // Cập nhật chi tiết từng user (lastActive chính xác)
  userStatusSubId = subscribe("/topic/user-status", (msg) => {
    try {
      const status: UserMsg = JSON.parse(msg.body);
      handleUserStatus(status);
    } catch (e) {
      console.error("Lỗi parse /topic/user-status:", e);
    }
  });

  console.log("Đã subscribe online status topics");
};

// Load danh sách chat và subscribe WebSocket
const fetchChatlist = async () => {
  try {
    const res = await ChatService.findAllByChatType();
    listChats.value = res.data || [];

    await nextTick();
    subscribeToTopics();
    subscribeChatListUpdate();
    
    // Tự động resubscribe khi WebSocket reconnect
    onConnected(() => {
      console.log("WebSocket tái kết nối → subscribe lại online status");
      subscribeToTopics();
      subscribeChatListUpdate()
    });
  } catch (error) {
    console.error("Không thể tải danh sách chat:", error);
  }
};

// Chọn bạn để chat
const selectFriend = async  (friend: ChatResponseDTO) => {
  selectedChat.value = friend;
  friend.unreadCount = 0
};

// Tìm kiếm người dùng theo số điện thoại
const searchByPhone = async () => {
  const phone = phoneSearch.value.trim();
  if (!phone) return;

  try {
    searching.value = true;
    searchResult.value = null;

    const res = await FriendService.findByPhone(phone);
    searchResult.value = res.data ?? null;
  } catch (error) {
    console.error("Tìm kiếm thất bại:", error);
    searchResult.value = null;
  } finally {
    searching.value = false;
  }
};

// Gửi lời mời kết bạn (bạn có thể implement API thật ở đây)
const sendFriendRequest = async () => {
  if (!searchResult.value) return;

  try {
    // Gọi API gửi friend request ở đây
    // await FriendService.sendFriendRequest(searchResult.value.userId);

    alert(`Đã gửi lời mời kết bạn tới ${searchResult.value.fullName}!`);
    showAddFriendDialog.value = false;
    phoneSearch.value = "";
    searchResult.value = null;

    // Optional: refresh danh sách nếu cần
    // await fetchChatlist();
  } catch (error) {
    console.error("Gửi lời mời thất bại:", error);
    alert("Không thể gửi lời mời kết bạn");
  }
};

// Theo dõi đăng nhập / đăng xuất
watch(
  () => authStore.userInfo,
  (user) => {
    if (user) {
      fetchChatlist();
    } else {
      // Đăng xuất
      listChats.value = [];
      selectedChat.value = null;
      searchQuery.value = "";

      if (onlineUsersSubId) unsubscribe(onlineUsersSubId);
      if (userStatusSubId) unsubscribe(userStatusSubId);
      if (chatListUpdateSubId) unsubscribe(chatListUpdateSubId)
      chatListUpdateSubId = null;
      onlineUsersSubId = null;
      userStatusSubId = null;
    }
  },
  { immediate: true }
);

const fecthBageUnread = async () => {
    try {
      const response = await ChatMemberService.sumUnreadByMe();
      unreadCount.value = response.data || 0;
      
    } catch (error) {
      console.log("không lấy được danh sách" + error)
    }

}

onConnected(() => {
  console.log("🔁 WebSocket reconnect → resubscribe ALL");

  subscribeToTopics();
  subscribeChatListUpdate();

  // 🔥 GỌI CHUNG, KHÔNG DUP
  subscribeToPersonalNotifications(() => {});
  fecthBageUnread()
});



// Dọn dẹp khi component bị hủy
onBeforeUnmount(() => {
  if (onlineUsersSubId) unsubscribe(onlineUsersSubId);
  if (userStatusSubId) unsubscribe(userStatusSubId);
  if (chatListUpdateSubId) unsubscribe(chatListUpdateSubId)
});
</script>

<style scoped>
/* Tùy chỉnh nhẹ cho PrimeVue */
:deep(.p-scrollpanel-bar) {
  background: rgba(0, 0, 0, 0.2);
}
:deep(.p-scrollpanel-bar:hover) {
  background: rgba(0, 0, 0, 0.4);
}
</style>