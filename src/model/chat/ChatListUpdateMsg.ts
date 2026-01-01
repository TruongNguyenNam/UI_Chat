export interface ChatListUpdateMsg{
    chatId: number;
    lastMessageId: number;
    lastMessageContent: string;
    lastMessageTime: string;
    senderId: number;
    senderName: string;
    unreadCount: number;
}
