// src/service/WebSocketService.ts
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";

let client: Client | null = null;
const subscriptions = new Map<string, StompSubscription>();

export const connectWebSocket = (token: string): Promise<Client> => {
  return new Promise((resolve, reject) => {
    if (!token) {
      reject("JWT chưa sẵn sàng");
      return;
    }

    if (client?.connected) {
      resolve(client);
      return;
    }

    client = new Client({
      // ✅ DÙNG WS NATIVE
      brokerURL: "ws://localhost:8080/ws/websocket",

      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      reconnectDelay: 5000,
      debug: (msg) => console.log("[STOMP]", msg),

      onConnect: () => {
        console.log("✅ WebSocket CONNECTED");
        resolve(client!);
      },

      onStompError: (frame) => {
        console.error("❌ STOMP ERROR", frame);
        reject(frame);
      },

      onWebSocketClose: (evt) => {
        console.warn("⚠️ WS CLOSED", evt);
      },

      onWebSocketError: (evt) => {
        console.error("❌ WS ERROR", evt);
        reject(evt);
      },
    });

    client.activate();
  });
};

export const subscribe = (
  destination: string,
  callback: (msg: IMessage) => void
): string => {
  if (!client?.connected) {
    console.warn("⚠️ WS chưa connect:", destination);
    return "";
  }

  const sub = client.subscribe(destination, callback);
  subscriptions.set(sub.id, sub);
  return sub.id;
};

export const unsubscribe = (id: string) => {
  subscriptions.get(id)?.unsubscribe();
  subscriptions.delete(id);
};

export const disconnect = () => {
  subscriptions.clear();
  client?.deactivate();
  client = null;
  console.log("🔌 WebSocket DISCONNECTED");
};
