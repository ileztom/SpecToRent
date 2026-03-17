import { Client, IMessage } from '@stomp/stompjs';

export interface ChatMessage {
  id?: number;
  roomId?: string;
  sender?: { id: number; fullName?: string; role?: string };
  content: string;
  createdAt?: string;
}

export async function getChatHistory(roomId: string): Promise<ChatMessage[]> {
  const res = await fetch(`/api/chat/${roomId}/messages`);
  if (!res.ok) return [];
  return res.json();
}

export class ChatSocket {
  private client: Client;
  private roomId: string;

  constructor(roomId: string) {
    this.roomId = roomId;

    // Determine WebSocket URL dynamically based on current page location
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const backendWsUrl = `${protocol}//${window.location.host}/ws`;

    this.client = new Client({
      brokerURL: backendWsUrl,
      reconnectDelay: 5000,
      debug: (str) => {
        // Log STOMP protocol messages for debugging
        console.log('STOMP:', str);
      },
    });
  }

  connect(onMessage: (msg: ChatMessage) => void) {
    this.client.onConnect = () => {
      console.log('STOMP connected successfully');
      this.client.subscribe(`/topic/chat/${this.roomId}`, (message: IMessage) => {
        try {
          const payload = JSON.parse(message.body) as ChatMessage;
          onMessage(payload);
        } catch (e) {
          console.error('Failed to parse chat message:', e);
        }
      });
    };

    this.client.onDisconnect = () => {
      console.log('STOMP disconnected');
    };

    this.client.onStompError = (frame) => {
      console.error('STOMP error:', frame.headers['message'], frame.body);
    };

    this.client.onWebSocketError = (event) => {
      console.error('WebSocket error:', event);
    };

    this.client.onWebSocketClose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
    };

    this.client.activate();
  }

  sendMessage(senderId: number, content: string) {
    if (this.client.connected) {
      // Send via STOMP over WebSocket
      this.client.publish({
        destination: `/app/chat/${this.roomId}`,
        body: JSON.stringify({
          sender: { id: senderId },
          content,
        }),
      });
    } else {
      // Fallback: send via REST (backend will broadcast to WebSocket subscribers)
      console.warn('WebSocket not connected, sending via REST fallback');
      fetch(`/api/chat/${this.roomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId, content }),
      }).catch((err) => console.error('REST send failed:', err));
    }
  }

  disconnect() {
    if (this.client.active) {
      this.client.deactivate();
    }
  }
}
