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
  phone?: string;
  companyName?: string;
  description?: string;
  region?: string;
}

export interface Machinery {
  id: number;
  name: string;
  title?: string;
  description?: string;
  region?: string;
  location?: string;
  category?: string;
  type?: string;
  imageUrl?: string;
  availableCount?: number;
  dailyPrice?: number;
  pricePerShift?: number;
  status?: string;
  ownerId?: number;
}

export enum OrderStatus {
  NEW = 'NEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELED = 'CANCELED',
  COMPLETED = 'COMPLETED',
  EARLY_COMPLETED = 'EARLY_COMPLETED',
}

export interface Order {
  id: number;
  renterId: number;
  itemId: number;
  startDate: string;
  endDate: string;
  status: OrderStatus;
  quantity?: number;
  address?: string;
  itemTitle?: string;
  itemImageUrl?: string;
  itemDailyPrice?: number;
  ownerId?: number;
  ownerName?: string;
  ownerAvatar?: string;
  ownerRegion?: string;
  ownerCompanyName?: string;
  ownerDescription?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  renterName?: string;
  renterAvatar?: string;
  renterRegion?: string;
  renterCompanyName?: string;
  renterDescription?: string;
  renterPhone?: string;
  renterEmail?: string;
}
