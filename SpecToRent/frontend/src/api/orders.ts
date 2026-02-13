import { api } from './http';
import { Order, OrderStatus } from '../types';

export interface CreateOrderPayload {
  renterId: number;
  itemId: number;
  startDate: string;
  endDate: string;
  quantity?: number;
  address?: string;
}

function mapBackendToOrder(backend: any): Order {
  return {
    id: backend.id,
    renterId: backend.renter?.id,
    itemId: backend.item?.id,
    startDate: backend.startDate,
    endDate: backend.endDate,
    status: backend.status,
    quantity: backend.quantity,
    address: backend.address,
    itemTitle: backend.item?.title,
    itemImageUrl: backend.item?.imageUrl,
    itemDailyPrice: backend.item?.dailyPrice,
    ownerId: backend.item?.owner?.id,
    ownerName: backend.item?.owner?.fullName,
    ownerAvatar: backend.item?.owner?.avatarUrl,
    ownerRegion: backend.item?.owner?.region,
    ownerCompanyName: backend.item?.owner?.companyName,
    ownerDescription: backend.item?.owner?.description,
    ownerPhone: backend.item?.owner?.phone,
    ownerEmail: backend.item?.owner?.email,
    renterName: backend.renter?.fullName,
    renterAvatar: backend.renter?.avatarUrl,
    renterRegion: backend.renter?.region,
    renterCompanyName: backend.renter?.companyName,
    renterDescription: backend.renter?.description,
    renterPhone: backend.renter?.phone,
    renterEmail: backend.renter?.email,
  };
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const backend = await api<any>('/requests', {
    method: 'POST',
    body: JSON.stringify({
      renterId: payload.renterId,
      itemId: payload.itemId,
      startDate: payload.startDate,
      endDate: payload.endDate,
      quantity: payload.quantity || 1,
      address: payload.address,
    }),
  });

  return mapBackendToOrder(backend);
}

export async function getOrders(): Promise<Order[]> {
  const list = await api<any[]>('/requests');
  return list.map(mapBackendToOrder);
}

export async function updateOrderStatus(orderId: number, status: OrderStatus): Promise<void> {
  const res = await fetch(`/api/requests/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Не удалось обновить статус');
  }
}
