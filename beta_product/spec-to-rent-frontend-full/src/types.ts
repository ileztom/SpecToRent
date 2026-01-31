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

  // Название для отображения (карточка, детали)
  name: string;

  // Старое поле для обратной совместимости с текущим каталогом
  title?: string;

  description?: string;

  // Регион (город) для фильтрации
  region?: string;

  // Произвольное текстовое местоположение/адрес
  location?: string;

  category?: string;

  // Тип техники (экскаватор, автокран и т.п.)
  type?: string;

  // Ссылка на изображение техники
  imageUrl?: string;

  // Доступное количество единиц техники
  availableCount?: number;

  // Цена за смену из бэкенда
  dailyPrice?: number;

  // Алиас под дизайн alpha‑проекта (pricePerShift)
  pricePerShift?: number;

  status?: string;

  // Владелец техники
  ownerId?: number;
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
