// src/service/WebSocketService.ts
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";

let client: Client | null = null;
const subscriptions = new Map<string, StompSubscription>();

// Danh sách callback khi kết nối thành công (bao gồm reconnect)
const onConnectCallbacks: (() => void)[] = [];
const onDisconnectCallbacks: (() => void)[] = [];

// Hàm đăng ký callback khi WebSocket connect/reconnect
export const onConnected = (callback: () => void) => {
  onConnectCallbacks.push(callback);
};

// Hàm đăng ký callback khi disconnect (tùy chọn)
export const onDisconnected = (callback: () => void) => {
  onDisconnectCallbacks.push(callback);
};

export const connectWebSocket = (token: string): Promise<Client> => {
  return new Promise((resolve, reject) => {
    if (!token) {
      reject(new Error("JWT token is required"));
      return;
    }

    // Nếu đã connected → resolve ngay và trigger callbacks
    if (client?.connected) {
      resolve(client);
      // Trigger lại các callback để resubscribe nếu cần
      onConnectCallbacks.forEach(cb => cb());
      return;
    }

    // Nếu đang activate → chờ
    if (client?.active) {
      // Có thể reject hoặc chờ, tùy nhu cầu. Ở đây resolve luôn để tránh block
      setTimeout(() => connectWebSocket(token).then(resolve).catch(reject), 100);
      return;
    }

    client = new Client({
      brokerURL: "ws://localhost:8080/ws/websocket",

      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      // Tự động reconnect mỗi 5 giây
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      debug: (str) => {
        console.log("[STOMP Debug]", str);
      },

      // Khi kết nối thành công (lần đầu hoặc reconnect)
      onConnect: () => {
        console.log("WebSocket CONNECTED");
        resolve(client!);

        // Gọi tất cả các callback đã đăng ký (rất quan trọng cho resubscribe)
        onConnectCallbacks.forEach(callback => {
          try {
            callback();
          } catch (err) {
            console.error("Error in onConnected callback:", err);
          }
        });
      },

      // Lỗi STOMP protocol
      onStompError: (frame) => {
        console.error("STOMP Error:", frame.headers["message"], frame.body);
      },

      // WebSocket đóng (mất mạng, server down, v.v.)
      onWebSocketClose: (evt) => {
        console.warn("WebSocket CLOSED", evt.reason || evt.code);

        // Gọi callback disconnect
        onDisconnectCallbacks.forEach(cb => {
          try {
            cb();
          } catch (err) {
            console.error("Error in onDisconnected callback:", err);
          }
        });
      },

      // Lỗi kết nối WebSocket
      onWebSocketError: (evt) => {
        console.error("WebSocket ERROR", evt);
      },
    });

    // Bắt đầu kết nối
    client.activate();
  });
};

export const subscribe = (
  destination: string,
  callback: (msg: IMessage) => void
): string => {
  if (!client?.connected) {
    console.warn(`Cannot subscribe to ${destination}: WebSocket not connected`);
    return "";
  }

  const subscription = client.subscribe(destination, callback);
  subscriptions.set(subscription.id, subscription);

  console.log(`Subscribed to ${destination} (id: ${subscription.id})`);
  return subscription.id;
};

export const unsubscribe = (id: string) => {
  const sub = subscriptions.get(id);
  if (sub) {
    sub.unsubscribe();
    subscriptions.delete(id);
    console.log(`Unsubscribed from subscription id: ${id}`);
  }
};

// Unsubscribe all trước khi disconnect
export const unsubscribeAll = () => {
  subscriptions.forEach((sub, id) => {
    sub.unsubscribe();
    console.log(`Unsubscribed ${id}`);
  });
  subscriptions.clear();
};

export const disconnect = async () => {
  if (client) {
    unsubscribeAll();
    await client.deactivate();
    client = null;
    console.log("WebSocket DISCONNECTED manually");
  }
};

export const getWebSocketClient = (): Client | null => client;

// Optional: Kiểm tra trạng thái
export const isConnected = (): boolean => client?.connected ?? false;