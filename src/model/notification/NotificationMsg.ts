import { NotificationType } from "./NotificationType";
export interface NotificationMsg{
    type: NotificationType;
    content: string;
    relatedId: number;
    senderId: number;
    senderUsername: string;
    senderDisplayName: string;
    senderAvatar: string;
    timestamp: string;
}


