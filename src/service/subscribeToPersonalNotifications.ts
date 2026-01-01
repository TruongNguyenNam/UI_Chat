import { type IMessage, type StompSubscription } from "@stomp/stompjs";
import { getWebSocketClient } from "./WebSocketService"; // nếu client nằm ở file khác

let personalNotifSub: StompSubscription | null = null;

export const subscribeToPersonalNotifications = (
  onMessage: (msg: any) => void
) => {
  const client = getWebSocketClient();
  if (!client?.connected) return;

  // 🔥 unsubscribe cũ nếu có
  if (personalNotifSub) {
    personalNotifSub.unsubscribe();
    personalNotifSub = null;
  }

  personalNotifSub = client.subscribe(
    "/user/queue/notifications",
    (stompMsg: IMessage) => {
      try {
        onMessage(JSON.parse(stompMsg.body));
      } catch (e) {
        console.error("Parse personal notification failed", e);
      }
    }
  );

  console.log("✅ Subscribed /user/queue/notifications");
};

export const unsubscribePersonalNotifications = () => {
  if (personalNotifSub) {
    personalNotifSub.unsubscribe();
    personalNotifSub = null;
  }
};
