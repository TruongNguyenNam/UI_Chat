// src/model/message/ChatReadStatusDTO.ts
export interface ChatReadStatusDTO {
    chatId: number;
    userId: number;
    lastReadMessageId: number;
    readAt:string;
  }