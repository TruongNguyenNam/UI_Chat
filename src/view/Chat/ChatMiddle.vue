<!-- ChatMiddle -->
<template>
  <div class="h-full flex">
    <!-- Phần chat chính -->
    <div class="w-197 bg-white border-r border-gray-200 flex flex-col shrink-0">
      <div v-if="selectedChat" class="flex flex-col h-full">
        <!-- Header -->
        <div class="bg-white border-b border-gray-200 px-5 py-4 flex items-center gap-4 shadow-sm">
          <img
            :src="selectedChat?.avatarUrl || '/default-avatar.png'"
            alt="avatar"
            class="w-12 h-12 rounded-full object-cover ring-2 ring-gray-300"
            @error="onImageError"
          />
          <div class="flex-1">
            <p class="font-semibold text-lg text-gray-900">{{ selectedChat?.fullName }}</p>
            <p class="text-sm flex items-center gap-2 mt-1" :class="statusColor">
              <span class="relative flex h-3 w-3">
                <!-- Hiệu ứng ping khi online -->
                <span
                  v-if="isOnline"
                  class="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"
                ></span>
                <span
                  :class="[
                    'relative inline-flex rounded-full h-3 w-3',
                    isOnline ? 'bg-green-500' : 'bg-gray-400'
                  ]"
                ></span>
              </span>
              <span>{{ statusText }}</span>
            </p>
          </div>
          <!-- Các nút hành động -->
          <div class="flex gap-3">
            <Button icon="pi pi-phone" rounded text severity="secondary" size="large" />
            <Button icon="pi pi-video" rounded text severity="secondary" size="large" />
            <Button
              icon="pi pi-info-circle"
              rounded text severity="secondary" size="large"
              :class="panelOpen ? 'bg-blue-100 text-blue-600' : ''"
              @click="panelOpen = !panelOpen"
            />
            <Button icon="pi pi-ellipsis-v" rounded text severity="secondary" size="large" />
          </div>
        </div>

        <!--hiển thị Nội dung tin nhắn -->
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
            <!-- image  -->
              <div class="relative group">
                <img
                  v-if="message.senderId !== currentUserId"
                  :src="selectedChat.avatarUrl || '/default-avatar.png'"
                  class="w-9 h-9 rounded-full flex-shrink-0 cursor-pointer"
                  @error="onImageError"
                />

                <!-- Tooltip -->
                <div
                  class="absolute left-1/2 -translate-x-1/2 -top-8
                        bg-black text-white text-xs px-2 py-1 rounded
                        opacity-0 group-hover:opacity-100 transition
                        whitespace-nowrap"
                >
                  {{ message.senderName }}
                </div>
              </div>


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
                    <div v-if="!message.deleted && message.mediaUrl?.length" class="mb-4">
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
                    <div v-if="message.deleted"
                        class="text-sm italic text-gray-400 flex items-center gap-2">
                      <i class="pi pi-ban"></i>
                      Tin nhắn đã bị thu hồi
                    </div>

                    <div
                      v-else
                      class="text-base leading-relaxed"
                      v-html="renderEmoji(
                        message.content || (message.mediaUrl?.length ? 'Đã gửi media' : '')
                      )"
                    ></div>


                    <!-- Thời gian -->
                    <div class="flex justify-end items-center gap-1.5 mt-2 text-xs opacity-70">
                      <!-- Thời gian -->
                      <span>{{ formatTime(message.sentAt) }}</span>

                      <!-- Trạng thái chỉ hiển thị cho tin nhắn của mình -->
                      <div v-if="message.senderId === currentUserId" class="flex items-center">
                        <!-- Đang gửi -->
                        <i v-if="message.isPending" class="pi pi-clock text-gray-400"></i>

                        <!-- Gửi lỗi -->
                        <i v-else-if="message.isError" class="pi pi-exclamation-circle text-red-500"></i>

                        <!-- Đã gửi thành công -->
                        <template v-else>
                          <!-- Nếu đối phương đã đọc đến tin nhắn này hoặc mới hơn → double tick xanh -->
                          <div class="relative flex items-center">
                        <!-- Tick thứ nhất -->
                        <i
                          class="pi pi-check"
                          :class="isMessageRead(message) ? 'text-blue-500' : 'text-gray-400'"
                        ></i>

                        <!-- Tick thứ hai (chỉ hiện khi đã đọc) -->
                        <i
                          v-if="isMessageRead(message)"
                          class="pi pi-check text-blue-500 absolute top-0 left-0 -ml-2"
                        ></i>
                      </div>
                        </template>
                      </div>
                    </div>

                    <!-- Reactions -->
                    <div v-if="!message.deleted && message.reactions?.length" class="absolute -bottom-4 flex gap-1 bg-white rounded-full px-3 py-1.5 shadow-lg border text-lg" :class="message.senderId === currentUserId ? '-left-4' : '-right-4'">
                      <span v-for="(r, i) in message.reactions" :key="i">{{ r }}</span>
                      <span class="text-xs text-gray-500 ml-1">{{ message.reactions.length }}</span>
                    </div>
                  </div>

                  <!-- phản hồi -->
                  <div
                    v-if="!message.deleted"
                    class="absolute top-1/2 -translate-y-1/2 flex gap-1
                          opacity-0 group-hover:opacity-100 transition"
                    :class="message.senderId === currentUserId ? '-left-10' : '-right-10'"
                  >
                    <!-- Reaction -->
                    <button
                      @click="toggleEmojiPicker(message.id)"
                      class="w-7 h-7 flex items-center justify-center
                            bg-white rounded-full shadow
                            hover:scale-110 transition"
                    >
                      😊
                    </button>

                    <!-- Reply -->
                    <button
                      @click="setReplyMessage(message)"
                      class="w-7 h-7 flex items-center justify-center
                            bg-white rounded-full shadow"
                    >
                      <i class="pi pi-reply text-xs"></i>
                    </button>

                    <!-- Edit (chỉ tin nhắn của mình) -->
                    <button
                      v-if="message.senderId === currentUserId"
                      @click=""
                      class="w-7 h-7 flex items-center justify-center
                            bg-white rounded-full shadow"
                    >
                      <i class="pi pi-pencil text-xs"></i>
                    </button>

                    <!-- Delete (chỉ tin nhắn của mình) -->
                    <button
                      v-if="message.senderId === currentUserId"
                      @click="deleteMessage(message.id)"
                      class="w-7 h-7 flex items-center justify-center
                            bg-white rounded-full shadow hover:bg-red-50"
                    >
                      <i class="pi pi-trash text-xs text-red-500"></i>
                    </button>
                  </div>


                  <!-- Emoji Picker cho message_reaction -->
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

        <!-- nhập gửi tin nhắn -->
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
      v-if="panelOpen && selectedChat"
      :mediaList="mediaList"
      :fullName="displayChatName"
      :avatarUrl="displayAvatar"
      :memberList="memberList"
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
import type {ChatReadStatusDTO} from "../../model/chat/ChatReadStatusDTO";
import type { ChatMemberResponseDTO } from "../../model/chat_member/ChatMemberResponseDTO";
import { MessageContentType } from "../../model/message/MessageContentType";
import { MessageService } from "../../service/MessageService";
import { MediaService } from "../../service/MediaService";
import { subscribe, unsubscribe, getWebSocketClient } from "../../service/WebSocketService"; // lấy client trực tiếp
import {subscribeToPersonalNotifications} from "../../service/subscribeToPersonalNotifications";
import { useAuthStore } from "../../stores/auth";
import { ChatService } from "../../service/ChatService";
import { ChatMemberService } from "../../service/ChatMemberService";
import ChatMediaPanel from "./ChatMediaPanel.vue";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import avatarfermale from "../../assets/img/avatarfermale.png"
import type { StompSubscription } from '@stomp/stompjs';
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

const props = defineProps({
  selectedChat: Object as PropType<ChatResponseDTO | null>,
});

const displayChatName = computed(() =>
props.selectedChat?.chatType === 'GROUP'
    ?  props.selectedChat?.chatName
    :  props.selectedChat?.fullName
);

const displayAvatar = computed(() =>
  props.selectedChat?.chatType === 'GROUP'
    ? avatarfermale
    : props.selectedChat?.avatarUrl
);

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
  return props.selectedChat?.isOnline ?? false;
});

const statusText = computed(() => {
  if (!props.selectedChat) return "";
  if (isOnline.value) return "Đang hoạt động";
  
  // Nếu offline, hiển thị thời gian hoạt động cuối (nếu có)
  if (props.selectedChat.lastActive) {
    return dayjs(props.selectedChat.lastActive).fromNow();
  }
  return "Offline";
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
const memberList = ref<ChatMemberResponseDTO[]>([]);
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
const readSubId = ref<string | null>(null)
// Thêm vào phần ref hiện có
const partnerReadAt = ref<Date | null>(null);
// ID subscription notification cá nhân
let notificationSubId = "";
// id deleteSub
let deleteSub: StompSubscription | null = null;
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

// const subscribeToPersonalNotifications = () => {
//   if (!client?.connected) return;

//   // 🔥 LUÔN unsubscribe cũ (rất quan trọng)
//   if (notificationSubId) {
//     unsubscribe(notificationSubId);
//     notificationSubId = "";
//   }

//   const destination = "/user/queue/notifications";

//   const sub = client.subscribe(destination, (stompMsg) => {
//     try {
//       const notif = JSON.parse(stompMsg.body);

//       new Audio("/notification.mp3").play().catch(() => {});

//       if (
//         notif.type === "MESSAGE" &&
//         currentChatId.value !== notif.relatedId
//       ) {
//         toast.add({
//           severity: "info",
//           summary: "Tin nhắn mới",
//           detail: notif.content,
//           life: 8000,
//         });
//       }
//     } catch (e) {
//       console.error("Parse notification failed", e);
//     }
//   });

//   notificationSubId = sub.id;
//   console.log("✅ Subscribed /user/queue/notifications");
// };



const deleteMessage = async (messageId: number) => {
  try {
    await MessageService.deleteMessage(messageId);
  } catch (error) {
    console.error("Delete message failed", error);
  }
};


const subscribeMessageDelete = (chatId: number) => {
  if (!client) {
    console.warn("STOMP client chưa khởi tạo");
    return;
  }

  deleteSub?.unsubscribe();

  deleteSub = client.subscribe(
    `/topic/chat/${chatId}/message-delete`,
    (msg) => {
      const messageId = JSON.parse(msg.body);

      messages.value = messages.value.map(m =>
        m.id === messageId
          ? { ...m, deleted: true }
          : m
      );
    }
  );
};


const subscribeReadStatus = (chatId: number) => {
  if (!client?.connected) return;

  if (readSubId.value) {
    unsubscribe(readSubId.value);
    readSubId.value = null;
  }

  const sub = client.subscribe(`/topic/chat/${chatId}/read`, (msg) => {
    try {
      const data: ChatReadStatusDTO = JSON.parse(msg.body);

      // Chỉ xử lý khi:
      // 1. Cùng chat
      // 2. Người đọc KHÔNG phải mình
      if (data.chatId === chatId && data.userId !== currentUserId) {
        partnerReadAt.value = new Date(data.readAt);
      }

    } catch (err) {
      console.error("Parse failed:", err);
    }
  });

  readSubId.value = sub.id;
};


// const subscribeReadStatus = (chatId: number) => {
//   if (!client?.connected) return;

//   if (readSubId.value) {
//     unsubscribe(readSubId.value);
//     readSubId.value = null;
//   }

//   const sub = client.subscribe(`/topic/chat/${chatId}/read`, (msg) => {
//   try {
//     const data: ChatReadStatusDTO = JSON.parse(msg.body);

//     console.log("🔴 Nhận read status từ server:", data);
//     console.log("FriendUserId hiện tại:", props.selectedChat?.friendUserId);
//     console.log("So sánh:", data.userId, "===", props.selectedChat?.friendUserId);

//     if (data.userId === props.selectedChat?.friendUserId) {
//         partnerReadAt.value = new Date(data.readAt);
//         console.log("✅ partnerReadAt =", partnerReadAt.value);
//       }
//  else {
//       console.log("❌ Bỏ qua vì không phải đối phương");
//     }
//   } catch (err) {
//     console.error("Parse failed:", err);
//   }
// });

//   readSubId.value = sub.id;
// };



const isMessageRead = (message: MessageResponseDTO) => {
  if (!partnerReadAt.value) return false;
  if (message.senderId !== currentUserId) return false;

  return new Date(message.sentAt).getTime()
       <= partnerReadAt.value.getTime();
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
  () => props.selectedChat,
  async (friend, oldFriend) => {
    // Rời chat cũ nếu có
    if (oldFriend?.chatId && oldFriend.chatId !== friend?.chatId) {
      leaveChat(oldFriend.chatId);
    }

    // Reset
    messages.value = [];
    mediaList.value = [];
    memberList.value = [];  // reset lạ khi không chọn đoạn chat đó
    panelOpen.value = false;
    emojiPickerOpen.value = false;
    partnerReadAt.value = null;
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
      const [msgRes, mediaRes,memberRes] = await Promise.all([
        MessageService.getChatMessages(chatId),
        MediaService.getAllMediaByChatId(chatId),
        ChatMemberService.findByChatId(chatId),
      ]);
      // console.log("danh sách thành viên của nhóm chat" + mediaRes.data)

      if (props.selectedChat?.chatId !== chatId) return;
       
      await ChatService.markMessagesAsRead(chatId)
      // if (props.selectedChat) {
      //   props.selectedChat.unreadCount = 0;
      // }

      messages.value = msgRes.data || [];
      mediaList.value = mediaRes.data ?? [];
      memberList.value = memberRes.data ?? [];
      scrollToBottomForce();
      subscribeToChat(chatId);
      subscribeReadStatus(chatId);
      subscribeMessageDelete(chatId);
    } catch (err) {
      console.error("Load chat failed:", err);
    } finally {
      if (props.selectedChat?.chatId === chatId) loading.value = false;
    }
  },
  { immediate: true }
);

// Gửi tin nhắn
const sendMessage = async () => {
  if (!props.selectedChat?.chatId) return;
  if (!newMessage.value.trim() && selectedFiles.value.length === 0) return;

  const tempId = -Date.now();
  const firstFile = selectedFiles.value[0];

  const payload: MessageRequestDTO = {
    chatId: props.selectedChat.chatId,
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
    subscribeToPersonalNotifications((notif) => {
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
  });
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