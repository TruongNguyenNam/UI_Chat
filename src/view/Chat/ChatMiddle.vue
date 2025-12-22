<template>
  <div class="flex-1 flex">
    <div class="flex-1 flex flex-col" style="border: 1px solid red;">
      <div v-if="selectedFriend" class="flex flex-col h-full">
        <!-- Header -->
        <div class="p-4 border-b flex items-center gap-3">
          <img
            :src="selectedFriend.avatarUrl"
            alt="avatar"
            class="w-10 h-10 rounded-full border"
            @error="onImageError"
          />
          <div>
            <p class="font-semibold">{{ selectedFriend.fullName }}</p>
          </div>

          <div class="ml-auto">
            <Button icon="pi pi-phone" size="large" />
            <Button class="ml-1" icon="pi pi-phone" size="large" />
          </div>
        </div>

        <!-- Chat content -->
        <div ref="chatContentRef" class="flex-1 p-4 overflow-y-auto space-y-4">
          <!-- Loading -->
          <div v-if="loading" class="flex justify-center items-center h-32">
            <i class="pi pi-spin pi-spinner text-2xl"></i>
          </div>

          <!-- No messages -->
          <div
            v-else-if="messages.length === 0"
            class="flex flex-col items-center justify-center h-full text-gray-400"
          >
            <i class="pi pi-comments text-5xl mb-2"></i>
            <p>Chưa có tin nhắn nào</p>
          </div>

          <!-- Messages -->
          <div
            v-else
            v-for="message in messages"
            :key="message.id"
            :ref="el => setMessageRef(el, message.id)"
            :class="[
              'flex transition-all duration-300',
              message.senderId === currentUserId ? 'justify-end' : 'justify-start',
              highlightedMessageId === message.id ? 'bg-yellow-100 rounded-lg p-1' : ''
            ]"
          >
            <div class="relative group max-w-[80%]">
              <div
                :class="[
                  'p-3 rounded-lg relative',
                  message.senderId === currentUserId ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black',
                  message.isPending ? 'opacity-70' : '',
                  message.isError ? 'bg-red-100 text-red-900' : '',
                ]"
              >
                <!-- Reply -->
                <div
                  v-if="message.parentMessageId"
                  class="text-sm border-l-2 pl-2 mb-2 opacity-70 italic cursor-pointer hover:underline"
                  @click="scrollToParent(message.parentMessageId)"
                >
                  💬 Trả lời: {{ getParentContent(message.parentMessageId) }}
                </div>

                <!-- Media (nhiều file) -->
                <div v-if="message.mediaUrl?.length" class="mb-2 grid grid-cols-2 gap-2">
                  <div v-for="(url, idx) in message.mediaUrl" :key="idx">
                    <img
                      v-if="message.messageType === 'IMAGE'"
                      :src="url"
                      class="rounded-lg max-w-[180px] cursor-pointer"
                      @error="onImageError"
                      @click="openImageModal(url)"
                    />
                    <video
                      v-else-if="message.messageType === 'VIDEO'"
                      :src="url"
                      controls
                      class="rounded-lg max-w-[180px]"
                      @error="onImageError"
                    ></video>
                  </div>
                </div>

                <!-- Content -->
                <p>{{ message.content || (message.mediaUrl?.length ? 'Tin nhắn media' : 'Tin nhắn trống') }}</p>

                <!-- Time -->
                <p class="text-xs mt-1 opacity-70">
                  {{ formatTime(message.sentAt) }}
                </p>

                <!-- Reactions -->
                <div v-if="message.reactions?.length" class="mt-1 flex gap-1 text-sm">
                  <span
                    v-for="(r, i) in message.reactions"
                    :key="i"
                    class="bg-white/30 rounded px-1"
                  >
                    {{ r }}
                  </span>
                </div>

                <!-- Pending -->
                <div v-if="message.isPending" class="absolute -top-2 -right-2">
                  <i class="pi pi-spin pi-spinner text-xs"></i>
                </div>

                <!-- Error -->
                <div v-if="message.isError" class="absolute -top-2 -right-2 flex gap-1">
                  <i class="pi pi-exclamation-triangle text-red-500 text-xs"></i>
                  <button @click="retrySend(message)" class="text-red-500 text-xs underline">
                    Thử lại
                  </button>
                </div>
              </div>

              <!-- Actions -->
              <div class="absolute -bottom-6 left-0 flex gap-2 opacity-0 group-hover:opacity-100 transition text-gray-500 text-sm">
                <button @click="toggleEmojiPicker(message.id)">😊</button>
                <button @click="setReplyMessage(message)">↩️</button>
              </div>

              <!-- Emoji Picker -->
              <div v-if="activeEmojiMessageId === message.id" class="absolute z-50 mt-2">
                <EmojiPicker @select="addReaction($event, message)" theme="light" style="width: 250px" />
              </div>
            </div>
          </div>
        </div>

        <!-- Reply preview -->
        <div
          v-if="replyingToMessage"
          class="border-t border-gray-300 bg-gray-100 p-2 flex justify-between items-center text-sm"
        >
          <div class="text-gray-700 truncate">
            💬 Trả lời: <span class="font-medium">{{ getReplyPreview(replyingToMessage) }}</span>
          </div>
          <Button icon="pi pi-times" class="p-button-text text-red-500" @click="cancelReply" />
        </div>

        <!-- Input -->
        <div class="p-4 border-t flex items-center gap-2">
          <InputText
            v-model="newMessage"
            placeholder="Nhập tin nhắn..."
            class="w-full"
            @keyup.enter="sendMessage"
            :disabled="sending"
          />
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            @change="onFileSelect"
            class="hidden"
            ref="fileInputRef"
          />
          <Button icon="pi pi-microphone" :disabled="sending" />
          <Button
            icon="pi pi-paperclip"
            @click="fileInputRefClick"
            :disabled="sending || selectedFiles.length > 0"
          />
          <Button
            icon="pi pi-send"
            @click="sendMessage"
            :loading="sending"
            :disabled="!newMessage.trim() && selectedFiles.length === 0"
          />
        </div>

        <!-- Preview nhiều file -->
        <div
          v-if="selectedFiles.length > 0"
          class="p-2 border-t bg-gray-100 flex flex-wrap gap-3"
        >
          <div v-for="(file, idx) in selectedFiles" :key="idx" class="relative">
            <img
              v-if="file.type.startsWith('image/')"
              :src="previewUrls[idx]"
              class="w-20 h-20 rounded-lg object-cover"
            />
            <video
              v-else-if="file.type.startsWith('video/')"
              :src="previewUrls[idx]"
              class="w-20 h-20 rounded-lg"
              controls
            />
            <Button
              icon="pi pi-times"
              class="absolute -top-2 -right-2 p-button-rounded p-button-text text-red-500"
              @click="removeFile(idx)"
            />
            <p class="text-xs text-gray-600">{{ file.name }}</p>
          </div>
        </div>
      </div>

      <div v-else class="flex items-center justify-center h-full text-gray-400">
        Hãy chọn một người để bắt đầu chat
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from "vue";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import EmojiPicker from "vue3-emoji-picker";
import "vue3-emoji-picker/css";
import type { PropType } from "vue";
import type { MessageResponseDTO } from "../../model/message/MessageResponseDTO";
import type { MessageRequestDTO } from "../../model/message/MessageRequestDTO";
import type { MediaResponseDTO } from "../../model/media/MediaResponseDTO";
import type { ChatResponseDTO } from "../../model/chat/ChatResponseDTO";
import { MessageContentType } from "../../model/message/MessageContentType";
import { MessageService } from "../../service/MessageService";
import { MediaService } from "../../service/MediaService";
import { subscribe, unsubscribe } from "../../service/WebSocketService";
import { useAuthStore } from "../../stores/auth";

const props = defineProps({
  selectedFriend: Object as PropType<ChatResponseDTO | null>,
});

const authStore = useAuthStore();
const currentUserId = authStore.userId || 0;
const mediaList = ref<MediaResponseDTO[]>([]);
const messages = ref<MessageResponseDTO[]>([]);
const newMessage = ref("");
const activeEmojiMessageId = ref<number | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const selectedFiles = ref<File[]>([]);
const previewUrls = ref<string[]>([]);
const chatContentRef = ref<HTMLElement | null>(null);
const currentSubId = ref<string | null>(null);
const replyingToMessage = ref<MessageResponseDTO | null>(null);
const highlightedMessageId = ref<number | null>(null);
const messageRefs = ref<Record<number, HTMLElement>>({});
const loading = ref(false);
const sending = ref(false);

const setMessageRef = (el: HTMLElement | null, id: number) => {
  if (el) messageRefs.value[id] = el;
};

// Hàm sort + scroll (gọi mỗi khi messages thay đổi)
const sortAndScroll = () => {
  messages.value.sort((a, b) => {
    const timeA = new Date(a.sentAt).getTime();
    const timeB = new Date(b.sentAt).getTime();
    if (timeA !== timeB) return timeA - timeB;
    return (b.id ?? 0) - (a.id ?? 0); // ổn định thứ tự
  });

  setTimeout(() => {
    if (chatContentRef.value) {
      chatContentRef.value.scrollTop = chatContentRef.value.scrollHeight;
    }
  }, 50);
};

watch(
  () => props.selectedFriend,
  async (friend) => {
    messages.value = [];

    if (currentSubId.value) {
      unsubscribe(currentSubId.value);
      currentSubId.value = null;
    }

    if (!friend?.chatId) return;

    loading.value = true;
    try {
      const res = await MessageService.getChatMessages(friend.chatId);
      messages.value = res.data || [];

      sortAndScroll();  // Sort và scroll sau khi load

      subscribeToChat(friend.chatId);

      const mediaRes = await MediaService.getAllMediaByChatId(friend.chatId);
      mediaList.value = mediaRes.data ?? [];
    } finally {
      loading.value = false;
    }
  },
  { immediate: true }
);

const sendMessage = async () => {
  if (!props.selectedFriend?.chatId) return;
  if (!newMessage.value.trim() && selectedFiles.value.length === 0) return;

  const tempId = -Date.now();
  const firstFile = selectedFiles.value[0];

  const payload: MessageRequestDTO = {
    chatId: props.selectedFriend.chatId,
    content: newMessage.value.trim(),
    messageType: firstFile
      ? firstFile.type.startsWith("image/")
        ? MessageContentType.IMAGE
        : MessageContentType.VIDEO
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
  sortAndScroll();  // Sort và scroll sau khi thêm optimistic

  newMessage.value = "";
  replyingToMessage.value = null;
  sending.value = true;

  try {
    await MessageService.sendMessage(payload, selectedFiles.value);
    optimisticMsg.isPending = false;
    clearPreview();
  } catch (e) {
    optimisticMsg.isPending = false;
    optimisticMsg.isError = true;
  } finally {
    sending.value = false;
  }
};

const normalizeIncomingMessage = (msg: any): MessageResponseDTO => {
  return {
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
  };
};

const subscribeToChat = (chatId: number) => {
   const topic = `/topic/chat/${chatId}`;

  currentSubId.value = subscribe(topic, (stompMsg) => {
    const body = JSON.parse(stompMsg.body);
    const incoming = normalizeIncomingMessage(body);

    if (incoming.senderId === currentUserId) {
      const pendingIndex = messages.value.findIndex(
        (m) => m.isPending && m.senderId === currentUserId
      );

      if (pendingIndex !== -1) {
        messages.value[pendingIndex] = incoming;
        sortAndScroll();  // Sort và scroll sau khi replace
        return;
      }
    }

    const existingIndex = messages.value.findIndex((m) => m.id === incoming.id);
    if (existingIndex === -1) {
      messages.value.push(incoming);
    } else {
      messages.value[existingIndex] = incoming;
    }
    sortAndScroll();  // Sort và scroll sau khi thêm tin mới
  });
};

const retrySend = async (message: MessageResponseDTO) => {
  if (sending.value) return;
  sending.value = true;

  message.isError = false;
  message.isPending = true;

  const payload: MessageRequestDTO = {
    chatId: message.chatId,
    content: message.content,
    messageType: message.messageType,
    parentMessageId: message.parentMessageId ?? null,
  };

  try {
    await MessageService.sendMessage(payload, selectedFiles.value);
    message.isPending = false;
    clearPreview();
  } catch (e: any) {
    message.isPending = false;
    message.isError = true;
    alert(`Retry thất bại: ${e.message || "Lỗi không xác định"}`);
  } finally {
    sending.value = false;
  }
};

const onFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const files = Array.from(input.files || []);
  selectedFiles.value = [];
  previewUrls.value = [];

  for (const file of files) {
    if (file.size > 10 * 1024 * 1024) {
      alert(`File "${file.name}" quá lớn! Giới hạn 10MB.`);
      continue;
    }
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      alert(`File "${file.name}" không hỗ trợ!`);
      continue;
    }
    selectedFiles.value.push(file);
    previewUrls.value.push(URL.createObjectURL(file));
  }
  input.value = "";
};

const fileInputRefClick = () => fileInputRef.value?.click();
const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1);
  previewUrls.value.splice(index, 1);
};
const clearPreview = () => {
  previewUrls.value.forEach(URL.revokeObjectURL);
  selectedFiles.value = [];
  previewUrls.value = [];
};

const setReplyMessage = (msg: MessageResponseDTO) => (replyingToMessage.value = msg);
const cancelReply = () => (replyingToMessage.value = null);

const getReplyPreview = (msg: MessageResponseDTO) => {
  if (msg.messageType === "IMAGE") return "Ảnh";
  if (msg.messageType === "VIDEO") return "Video";
  return msg.content || "Tin nhắn trống";
};

const getParentContent = (parentId: number) => {
  const parent = messages.value.find(m => m.id === parentId);
  if (!parent) return `Tin nhắn #${parentId}`;
  if (parent.messageType === "IMAGE") return "Ảnh";
  if (parent.messageType === "VIDEO") return "Video";
  return parent.content || "Tin nhắn trống";
};

const scrollToBottom = () => {
  if (chatContentRef.value) {
    chatContentRef.value.scrollTop = chatContentRef.value.scrollHeight;
  }
};

const scrollToParent = (id: number) => {
  const target = messageRefs.value[id];
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    highlightedMessageId.value = id;
    setTimeout(() => (highlightedMessageId.value = null), 2000);
  }
};

const toggleEmojiPicker = (id: number) =>
  (activeEmojiMessageId.value = activeEmojiMessageId.value === id ? null : id);

const addReaction = (emoji: any, msg: MessageResponseDTO) => {
  const react = emoji.i;
  msg.reactions = msg.reactions ? msg.reactions + "," + react : react;
  activeEmojiMessageId.value = null;
  // TODO: Gửi reaction lên server
};

const formatTime = (t: string | Date) => {
  const date = new Date(t);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 60 * 60 * 1000) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const openImageModal = (url: string) => window.open(url, "_blank");

const onImageError = (e: Event) => {
  (e.target as HTMLImageElement).src = "/default-avatar.png";
};

onUnmounted(() => {
  if (currentSubId.value) {
    unsubscribe(currentSubId.value);
    currentSubId.value = null;
  }
  clearPreview();
});
</script>

<style scoped>
.group:hover button {
  opacity: 1;
}
</style>