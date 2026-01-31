import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface ChatMessage {
  id?: number;
  roomId?: string;
  sender?: { id: number };
  content: string;
  createdAt?: string;
}

export class ChatSocket {
  private client: Client;
  private roomId: string;

  constructor(roomId: string) {
    this.roomId = roomId;
    this.client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      reconnectDelay: 3000,
    });
  }

  connect(onMessage: (msg: ChatMessage) => void) {
    this.client.onConnect = () => {
      this.client.subscribe(`/topic/chat/${this.roomId}`, (message: IMessage) => {
        const payload = JSON.parse(message.body) as ChatMessage;
        onMessage(payload);
      });
    };
    this.client.activate();
  }

  sendMessage(senderId: number, content: string) {
    const payload: ChatMessage = {
      sender: { id: senderId },
      content,
      createdAt: new Date().toISOString(),
    };
    this.client.publish({
      destination: `/app/chat/${this.roomId}`,
      body: JSON.stringify(payload),
    });
  }

  disconnect() {
    if (this.client.active) {
      this.client.deactivate();
    }
  }
}
