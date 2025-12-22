import { MessageContentType } from "./MessageContentType";

export interface ChatMessage {
  messageId: number;
  senderName: string;
  senderAvatar: string;
  chatId: number;
  content: string;
  messageType: MessageContentType;   // TEXT | IMAGE | ...
  sentAt: string;             // ISO string từ LocalDateTime
  mediaUrls: string[];
  parentMessageId?: number | null;
}


  