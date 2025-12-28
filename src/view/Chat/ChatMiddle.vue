<template>
  <div class="h-full flex">
    <!-- Phần chat chính -->
    <div class="w-197 bg-white border-r border-gray-200 flex flex-col shrink-0">
      <div v-if="selectedFriend" class="flex flex-col h-full">
        <!-- Header -->
        <div class="bg-white border-b border-gray-200 px-5 py-4 flex items-center gap-4 shadow-sm">
          <img
            :src="selectedFriend.avatarUrl || '/default-avatar.png'"
            alt="avatar"
            class="w-12 h-12 rounded-full object-cover ring-2 ring-gray-300"
            @error="onImageError"
          />
          <div class="flex-1">
            <p class="font-semibold text-lg text-gray-900">{{ selectedFriend?.fullName }}</p>
            <p class="text-sm flex items-center gap-2 mt-1" :class="statusColor">
              <span class="relative flex h-3 w-3">
                <span
                  :class="[
                    'absolute inline-flex h-full w-full rounded-full opacity-75',
                    isOnline ? 'animate-ping bg-green-400' : ''
                  ]"
                ></span>
                <span
                  :class="[
                    'relative inline-flex rounded-full h-3 w-3',
                    isOnline ? 'bg-green-500' : 'bg-gray-500'
                  ]"
                ></span>
              </span>
              <span>{{ statusText }}</span>
            </p>
          </div>
          <div class="flex gap-3">
            <Button icon="pi pi-phone" rounded text severity="secondary" size="large" />
            <Button icon="pi pi-video" rounded text severity="secondary" size="large" />
            <Button
              icon="pi pi-info-circle"
              rounded
              text
              severity="secondary"
              size="large"
              :class="panelOpen ? 'bg-blue-100 text-blue-600' : ''"
              @click="panelOpen = !panelOpen"
            />
            <Button icon="pi pi-ellipsis-v" rounded text severity="secondary" size="large" />
          </div>
        </div>

        <!-- Nội dung tin nhắn -->
        <div ref="chatContentRef" class="flex-1 overflow-y-auto px-6 py-8 bg-gradient-to-b from-gray-50 to-gray-100">
          <div v-if="loading" class="flex justify-center items-center h-64">
            <i class="pi pi-spin pi-spinner text-4xl text-gray-400"></i>
          </div>

          <div v-else-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400">
            <i class="pi pi-comments text-8xl mb-6 opacity-30"></i>
            <p class="text-xl">Bắt đầu cuộc trò chuyện nào!</p>
          </div>

          <div v-else class="space-y-5">
            <div
              v-for="message in messages"
              :key="message.id"
              :ref="el => setMessageRef(el, message.id)"
              :class="['flex items-end gap-3 transition-all duration-300', message.senderId === currentUserId ? 'flex-row-reverse' : 'flex-row']"
            >
              <img
                v-if="message.senderId !== currentUserId"
                :src="selectedFriend.avatarUrl || '/default-avatar.png'"
                class="w-9 h-9 rounded-full flex-shrink-0"
                @error="onImageError"
              />

              <div class="relative group max-w-2xl">
                <div
                  :class="[
                    'px-5 py-3 rounded-3xl shadow-md relative break-words',
                    message.senderId === currentUserId ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none',
                    message.isPending ? 'opacity-60' : '',
                    message.isError ? 'bg-red-100 border-red-300' : ''
                  ]"
                >
                  <!-- Trả lời -->
                  <div v-if="message.parentMessageId" class="mb-3 p-3 bg-black/10 rounded-2xl text-sm cursor-pointer hover:bg-black/20" @click="scrollToParent(message.parentMessageId)">
                    <span class="opacity-80">↩ Trả lời:</span>
                    <p class="font-medium mt-1 truncate">{{ getParentContent(message.parentMessageId) }}</p>
                  </div>

                  <!-- Media -->
                  <div v-if="message.mediaUrl?.length" class="mb-4">
                    <img
                      v-if="message.messageType === 'IMAGE'"
                      :src="message.mediaUrl[0]"
                      class="rounded-xl max-w-full cursor-pointer hover:brightness-95 transition"
                      @click="message.mediaUrl?.[0] ? openImageModal(message.mediaUrl[0]) : null"
                      @load="onMediaLoad"
                    />
                    <video
                      v-else-if="message.messageType === 'VIDEO'"
                      :src="message.mediaUrl[0]"
                      controls
                      class="rounded-xl max-w-full"
                      @loadeddata="onMediaLoad"
                    />
                  </div>

                  <!-- Nội dung -->
                  <div
                    class="text-base leading-relaxed"
                    v-html="renderEmoji(message.content || (message.mediaUrl?.length ? 'Đã gửi media' : ''))"
                  ></div>

                  <!-- Thời gian -->
                  <div class="flex justify-end items-center gap-2 mt-2 text-xs opacity-70">
                    {{ formatTime(message.sentAt) }}
                    <i v-if="message.senderId === currentUserId && !message.isPending && !message.isError" class="pi pi-check-circle"></i>
                  </div>

                  <!-- Reactions -->
                  <div v-if="message.reactions?.length" class="absolute -bottom-4 flex gap-1 bg-white rounded-full px-3 py-1.5 shadow-lg border text-lg" :class="message.senderId === currentUserId ? '-left-4' : '-right-4'">
                    <span v-for="(r, i) in message.reactions" :key="i">{{ r }}</span>
                    <span class="text-xs text-gray-500 ml-1">{{ message.reactions.length }}</span>
                  </div>
                </div>

                <!-- Actions -->
                <div class="absolute top-1/2 -translate-y-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition" :class="message.senderId === currentUserId ? '-left-14' : '-right-14'">
                  <button @click="toggleEmojiPicker(message.id)" class="bg-white rounded-full p-2.5 shadow-lg hover:scale-110">
                    <span class="text-2xl">😊</span>
                  </button>
                  <button @click="setReplyMessage(message)" class="bg-white rounded-full p-2.5 shadow-lg hover:scale-110">
                    <i class="pi pi-reply text-gray-700"></i>
                  </button>
                </div>

                <!-- Emoji Picker cho reaction -->
                <div v-if="activeEmojiMessageId === message.id" class="absolute z-50 -top-4 -translate-y-full" :class="message.senderId === currentUserId ? 'right-0' : 'left-0'">
                  <EmojiPicker @select="addReaction($event, message)" theme="light" :native="true" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Preview trả lời -->
        <div v-if="replyingToMessage" class="mx-6 mb-2 bg-blue-50 border-l-4 border-blue-500 px-4 py-3 rounded-r-lg flex justify-between items-center text-sm">
          <div class="text-blue-900">
            <span class="font-semibold">↩ Đang trả lời:</span>
            <span class="ml-3">{{ getReplyPreview(replyingToMessage) }}</span>
          </div>
          <Button icon="pi pi-times" text rounded @click="cancelReply" />
        </div>

        <!-- Input area -->
        <div class="bg-white border-t border-gray-200 p-5">
          <div v-if="selectedFiles.length > 0" class="mb-4 flex flex-wrap gap-4">
            <div v-for="(file, idx) in selectedFiles" :key="idx" class="relative group">
              <img
                v-if="file.type.startsWith('image/')"
                :src="previewUrls[idx]"
                class="w-28 h-28 rounded-2xl object-cover shadow-lg"
              />
              <video
                v-else
                :src="previewUrls[idx]"
                class="w-28 h-28 rounded-2xl object-cover shadow-lg"
                controls
              />
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-2xl transition flex items-center justify-center">
                <Button icon="pi pi-times" rounded severity="danger" @click="removeFile(idx)" />
              </div>
              <p class="text-xs text-center mt-2 text-gray-600 truncate w-28">{{ file.name }}</p>
            </div>
          </div>

          <div class="flex items-end gap-3">
            <Button
              icon="pi pi-face-smile"
              rounded
              text
              severity="secondary"
              size="large"
              @click="emojiPickerOpen = !emojiPickerOpen"
              :class="emojiPickerOpen ? 'bg-blue-100 text-blue-600' : ''"
            />
            <Button
              icon="pi pi-paperclip"
              rounded
              text
              severity="secondary"
              size="large"
              @click="fileInputRefClick"
              :disabled="sending"
            />
            <InputText
              ref="messageInputRef"
              v-model="newMessage"
              placeholder="Nhập tin nhắn..."
              class="flex-1"
              pt:input:class="py-4 px-6 text-base rounded-full bg-gray-100 focus:bg-white border border-gray-300 focus:border-blue-500 focus:shadow-lg transition"
              @keyup.enter.exact="sendMessage"
              @keyup.enter.shift.exact="newMessage += '\n'"
              :disabled="sending"
            />
            <Button
              icon="pi pi-send"
              rounded
              severity="info"
              size="large"
              :loading="sending"
              @click="sendMessage"
              :disabled="!newMessage.trim() && selectedFiles.length === 0"
            />
          </div>

          <transition name="fade">
            <div v-if="emojiPickerOpen" class="mt-4">
              <EmojiPicker @select="addEmojiToInput" theme="light" :native="true" style="width: 100%;" />
            </div>
          </transition>
        </div>
      </div>

      <!-- Không chọn bạn chat -->
      <div v-else class="flex-1 flex items-center justify-center text-gray-400">
        <div class="text-center">
          <i class="pi pi-comments text-8xl mb-6 opacity-30"></i>
          <p class="text-2xl">Chọn một người để bắt đầu chat</p>
        </div>
      </div>
    </div>

    <!-- Panel bên phải -->
    <ChatMediaPanel
      v-if="panelOpen && selectedFriend"
      :mediaList="mediaList"
      :fullName="selectedFriend.fullName"
      :avatarUrl="selectedFriend.avatarUrl"
    />

    <!-- Hidden file input -->
    <input type="file" accept="image/*,video/*" multiple @change="onFileSelect" class="hidden" ref="fileInputRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick, computed } from "vue";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import EmojiPicker from "vue3-emoji-picker";
import "vue3-emoji-picker/css";
import { useToast } from "primevue/usetoast";
import type { ComponentPublicInstance } from 'vue';
import type { PropType } from "vue";
import type { MessageResponseDTO } from "../../model/message/MessageResponseDTO";
import type { MessageRequestDTO } from "../../model/message/MessageRequestDTO";
import type { MediaResponseDTO } from "../../model/media/MediaResponseDTO";
import type { ChatResponseDTO } from "../../model/chat/ChatResponseDTO";
import { MessageContentType } from "../../model/message/MessageContentType";
import { MessageService } from "../../service/MessageService";
import { MediaService } from "../../service/MediaService";
import { subscribe, unsubscribe, getWebSocketClient } from "../../service/WebSocketService"; // lấy client trực tiếp
import { useAuthStore } from "../../stores/auth";
import ChatMediaPanel from "./ChatMediaPanel.vue";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

const props = defineProps({
  selectedFriend: Object as PropType<ChatResponseDTO | null>,
});

dayjs.updateLocale("en", {
  relativeTime: {
    future: "trong %s",
    past: "%s trước",
    s: "vài giây",
    ss: "%d giây",
    m: "1 phút",
    mm: "%d phút",
    h: "1 giờ",
    hh: "%d giờ",
    d: "1 ngày",
    dd: "%d ngày",
    M: "1 tháng",
    MM: "%d tháng",
    y: "1 năm",
    yy: "%d năm",
  },
});

const isOnline = computed(() => {
  if (!props.selectedFriend?.lastActive) return false;
  const last = dayjs(props.selectedFriend.lastActive);
  return dayjs().diff(last, "minute") < 5;
});

const statusText = computed(() => {
  if (!props.selectedFriend?.lastActive) return "Offline";
  return isOnline.value ? "Đang hoạt động" : dayjs(props.selectedFriend.lastActive).fromNow();
});

const statusColor = computed(() => {
  return isOnline.value ? "text-green-600" : "text-gray-500";
});

const authStore = useAuthStore();
const currentUserId = authStore.userId || 0;

const client = getWebSocketClient();

// Toast
const toast = useToast();

// State
const messages = ref<MessageResponseDTO[]>([]);
const mediaList = ref<MediaResponseDTO[]>([]);
const newMessage = ref("");
const sending = ref(false);
const loading = ref(false);
const selectedFiles = ref<File[]>([]);
const previewUrls = ref<string[]>([]);
const replyingToMessage = ref<MessageResponseDTO | null>(null);
const activeEmojiMessageId = ref<number | null>(null);
const highlightedMessageId = ref<number | null>(null);
const chatContentRef = ref<HTMLElement | null>(null);
const messageInputRef = ref<any>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const messageRefs = ref<Record<number, HTMLElement>>({});
const currentSubId = ref<string | null>(null);
const panelOpen = ref(false);
const emojiPickerOpen = ref(false);

// Theo dõi chat hiện tại để tránh notification thừa
const currentChatId = ref<number | null>(null);

// ID subscription notification cá nhân
let notificationSubId = "";

// Hàm gửi enter / leave
const enterChat = (chatId: number) => {
  
  if (client?.connected) {
    client.publish({
      destination: "/app/chat.enter",
      body: JSON.stringify({ chatId }),
    });
  }
};

const leaveChat = (chatId: number) => {
  if (client?.connected) {
    client.publish({
      destination: "/app/chat.leave",
      body: JSON.stringify({ chatId }),
    });
  }
};

// let notificationSubId = ""; // string như currentSubId

const subscribeToPersonalNotifications = () => {
  if (!client?.connected || notificationSubId) return;

  // BẮT BUỘC dùng /user/queue cho notification cá nhân
  const destination = "/user/queue/notifications";

  const sub = client.subscribe(destination, (stompMsg) => {
    try {
      const notif = JSON.parse(stompMsg.body);
      // phát âm thanh (không crash nếu fail)
      new Audio("/notification.mp3").play().catch(() => {});

      if (
        notif.type === "MESSAGE" &&
        currentChatId.value !== notif.relatedId
      ) {
        toast.add({
          severity: "info",
          summary: "Tin nhắn mới",
          detail: notif.content,
          life: 8000,
        });
      }
    } catch (err) {
      console.error("❌ Parse notification failed:", err);
    }
  });

  notificationSubId = sub.id;
  console.log("✅ Subscribed personal notifications:", destination);
};


// Scroll
const scrollToBottomForce = () => {
  nextTick(() => {
    if (!chatContentRef.value) return;
    chatContentRef.value.scrollTop = chatContentRef.value.scrollHeight;
    [100, 300, 600].forEach(d => setTimeout(() => {
      if (chatContentRef.value) chatContentRef.value.scrollTop = chatContentRef.value.scrollHeight;
    }, d));
  });
};

const onMediaLoad = () => scrollToBottomForce();
watch(messages, () => scrollToBottomForce(), { deep: true });

// Watch selectedFriend – xử lý enter/leave + load chat
watch(
  () => props.selectedFriend,
  async (friend, oldFriend) => {
    // Rời chat cũ nếu có
    if (oldFriend?.chatId && oldFriend.chatId !== friend?.chatId) {
      leaveChat(oldFriend.chatId);
    }

    // Reset
    messages.value = [];
    mediaList.value = [];
    panelOpen.value = false;
    emojiPickerOpen.value = false;

    if (currentSubId.value) unsubscribe(currentSubId.value);

    if (!friend?.chatId) {
      currentChatId.value = null;
      return;
    }

    const chatId = friend.chatId;
    currentChatId.value = chatId;

    // Báo server đang vào chat
    enterChat(chatId);

    loading.value = true;

    try {
      const [msgRes, mediaRes] = await Promise.all([
        MessageService.getChatMessages(chatId),
        MediaService.getAllMediaByChatId(chatId),
      ]);

      if (props.selectedFriend?.chatId !== chatId) return;

      messages.value = msgRes.data || [];
      mediaList.value = mediaRes.data ?? [];
      scrollToBottomForce();
      subscribeToChat(chatId);
    } catch (err) {
      console.error("Load chat failed:", err);
    } finally {
      if (props.selectedFriend?.chatId === chatId) loading.value = false;
    }
  },
  { immediate: true }
);

// Gửi tin nhắn
const sendMessage = async () => {
  if (!props.selectedFriend?.chatId) return;
  if (!newMessage.value.trim() && selectedFiles.value.length === 0) return;

  const tempId = -Date.now();
  const firstFile = selectedFiles.value[0];

  const payload: MessageRequestDTO = {
    chatId: props.selectedFriend.chatId,
    content: newMessage.value.trim(),
    messageType: firstFile
      ? firstFile.type.startsWith("image/") ? MessageContentType.IMAGE : MessageContentType.VIDEO
      : MessageContentType.TEXT,
    parentMessageId: replyingToMessage.value?.id ?? null,
  };

  const optimisticMsg: MessageResponseDTO = {
    id: tempId,
    chatId: payload.chatId,
    senderId: currentUserId,
    content: payload.content,
    mediaUrl: previewUrls.value,
    messageType: payload.messageType,
    sentAt: new Date(),
    reactions: [],
    isRead: false,
    deleted: false,
    isPending: true,
    isError: false,
  };

  messages.value.push(optimisticMsg);
  scrollToBottomForce();

  newMessage.value = "";
  replyingToMessage.value = null;
  sending.value = true;

  try {
    await MessageService.sendMessage(payload, selectedFiles.value);
    optimisticMsg.isPending = false;
    clearPreview();
  } catch {
    optimisticMsg.isPending = false;
    optimisticMsg.isError = true;
  } finally {
    sending.value = false;
    await nextTick();
    messageInputRef.value?.$el.querySelector('input')?.focus();
  }
};

const addEmojiToInput = (emoji: any) => {
  const native = emoji.i || emoji.native || emoji;
  newMessage.value += native;
  emojiPickerOpen.value = false;
  nextTick(() => messageInputRef.value?.$el.querySelector('input')?.focus());
};

// WebSocket chat topic
const normalizeIncomingMessage = (msg: any): MessageResponseDTO => ({
  id: msg.id,
  chatId: msg.chatId,
  senderId: msg.senderId,
  content: msg.content,
  mediaUrl: msg.mediaUrls || [],
  messageType: msg.messageType,
  isRead: msg.isRead,
  sentAt: new Date(msg.sentAt),
  reactions: msg.reactions || [],
  parentMessageId: msg.parentMessageId,
  deleted: msg.deleted,
  isPending: false,
  isError: false,
});

const subscribeToChat = (chatId: number) => {
  const topic = `/topic/chat/${chatId}`;
  currentSubId.value = subscribe(topic, (stompMsg) => {
    const incoming = normalizeIncomingMessage(JSON.parse(stompMsg.body));

    if (incoming.senderId === currentUserId) {
      const idx = messages.value.findIndex(m => m.id < 0 || m.isPending);
      if (idx !== -1) {
        messages.value[idx] = { ...incoming, isPending: false, isError: false };
        scrollToBottomForce();
        return;
      }
    }

    const dupIdx = messages.value.findIndex(m =>
      m.content === incoming.content &&
      m.messageType === incoming.messageType &&
      Math.abs(new Date(m.sentAt).getTime() - new Date(incoming.sentAt).getTime()) < 5000
    );
    if (dupIdx !== -1) {
      messages.value[dupIdx] = incoming;
      scrollToBottomForce();
      return;
    }

    messages.value.push(incoming);
    scrollToBottomForce();
  });
};

// Các hàm phụ trợ (giữ nguyên)
const setMessageRef = (el: Element | ComponentPublicInstance | null, id: number) => {
  if (el instanceof HTMLElement) {
    messageRefs.value[id] = el;
  }
};
const scrollToParent = (id: number) => {
  const el = messageRefs.value[id];
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    highlightedMessageId.value = id;
    setTimeout(() => highlightedMessageId.value = null, 2000);
  }
};
const toggleEmojiPicker = (id: number) => activeEmojiMessageId.value = activeEmojiMessageId.value === id ? null : id;
const addReaction = (emoji: any, msg: MessageResponseDTO) => {
  const e = emoji.i || emoji.native || emoji;
  msg.reactions = msg.reactions ? [...msg.reactions, e] : [e];
  activeEmojiMessageId.value = null;
};
const renderEmoji = (text: string) => {
  if (!text) return "";
  return text
    .replace(/\n/g, "<br>")
    .replace(/:\)/g, "😊")
    .replace(/:D/g, "😄")
    .replace(/<3/g, "❤️")
    .replace(/:\(/g, "😢")
    .replace(/:P/g, "😛")
    .replace(/;\)/g, "😉");
};
const formatTime = (t: string | Date) => {
  const d = new Date(t);
  const now = new Date();
  if (now.getTime() - d.getTime() < 24 * 60 * 60 * 1000) {
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("vi-VN");
};
const getReplyPreview = (msg: MessageResponseDTO) => msg.messageType === "IMAGE" ? "Ảnh" : msg.messageType === "VIDEO" ? "Video" : msg.content || "Tin nhắn";
const getParentContent = (id: number) => {
  const m = messages.value.find(x => x.id === id);
  return m ? (m.messageType === "IMAGE" ? "Ảnh" : m.messageType === "VIDEO" ? "Video" : m.content || "Tin nhắn") : "Tin nhắn đã xóa";
};
const fileInputRefClick = () => fileInputRef.value?.click();
const onFileSelect = (e: Event) => {
  const files = Array.from((e.target as HTMLInputElement).files || []);
  selectedFiles.value = [];
  previewUrls.value = [];
  files.forEach(file => {
    if (file.size > 10 * 1024 * 1024) alert(`File ${file.name} quá lớn!`);
    else if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      selectedFiles.value.push(file);
      previewUrls.value.push(URL.createObjectURL(file));
    }
  });
  (e.target as HTMLInputElement).value = "";
};
const removeFile = (i: number) => { selectedFiles.value.splice(i, 1); previewUrls.value.splice(i, 1); };
const clearPreview = () => { previewUrls.value.forEach(URL.revokeObjectURL); selectedFiles.value = []; previewUrls.value = []; };
const setReplyMessage = (msg: MessageResponseDTO) => replyingToMessage.value = msg;
const cancelReply = () => replyingToMessage.value = null;
const openImageModal = (url: string) => window.open(url, "_blank");
const onImageError = (e: Event) => (e.target as HTMLImageElement).src = "/default-avatar.png";

// Lifecycle
onMounted(() => {
  nextTick(() => {
    subscribeToPersonalNotifications();
  });
});

onBeforeUnmount(() => {
  if (currentChatId.value) {
    leaveChat(currentChatId.value);
  }

  if (notificationSubId) {
    unsubscribe(notificationSubId);
    notificationSubId = ""; // hoặc null
  }

  if (currentSubId.value) unsubscribe(currentSubId.value);
  clearPreview();
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.group:hover button { opacity: 1; }
</style>