import { NotificationType } from "./NotificationType";
export interface NotificationRequestDTO{
    userId: number;

     type : NotificationType;

    content: string;

    relatedId: number;


}




