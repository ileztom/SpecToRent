
export enum UserRole {
  RENTER = 'RENTER',
  OWNER = 'OWNER'
}

export enum OrderStatus {
  WAITING = 'WAITING', // Ждёт ответа арендодателя
  ACTIVE = 'ACTIVE',   // Актуально
  COMPLETED = 'COMPLETED' // Аренда прошла
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Machinery {
  id: string;
  name: string;
  type: string;
  category: string;
  pricePerShift: number;
  region: string;
  description: string;
  imageUrl: string;
  ownerId: string;
  availableCount: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export interface Order {
  id: string;
  machineryId: string;
  renterId: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  status: OrderStatus;
  totalPrice: number;
  createdAt: number;
  messages: ChatMessage[];
}
