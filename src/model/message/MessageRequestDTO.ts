import { MessageContentType } from "./MessageContentType";
export interface MessageRequestDTO {
  chatId: number;             // chat private / group
  // senderId: number;
  content: string;
  mediaUrl?: string[];       // optional nếu chỉ gửi text
  messageType: MessageContentType;
  parentMessageId?: number | null;
}

 