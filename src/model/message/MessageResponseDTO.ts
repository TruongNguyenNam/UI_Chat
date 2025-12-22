import { MessageContentType } from "./MessageContentType";
export interface MessageResponseDTO {
    id: number;
    chatId: number;
    senderId: number;
    senderName?: string;
    senderAvatar?: string;
    content: string;
    mediaUrl: string[];         // backend trả List<String>
    messageType: MessageContentType;
    isRead: boolean;
    sentAt: Date;             // LocalDateTime → ISO string
    reactions?: string[];
    parentMessageId?: number | null;
    deleted: boolean;
    isPending?: boolean;
    isError?: boolean;
}

  