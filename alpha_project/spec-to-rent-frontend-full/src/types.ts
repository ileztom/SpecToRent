export enum UserRole {
  OWNER = 'OWNER',
  RENTER = 'RENTER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Machinery {
  id: number;
  title: string;
  description?: string;
  location?: string;
  category?: string;
  dailyPrice?: number;
  status?: string;
}

export enum OrderStatus {
  NEW = 'NEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELED = 'CANCELED',
}

export interface Order {
  id: number;
  renterId: number;
  itemId: number;
  startDate: string;
  endDate: string;
  status: OrderStatus;
}
