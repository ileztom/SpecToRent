import { api } from './http';
import { Order, OrderStatus } from '../types';

export interface CreateOrderPayload {
  renterId: number;
  itemId: number;
  startDate: string;
  endDate: string;
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const backend = await api<any>('/requests', {
    method: 'POST',
    body: JSON.stringify({
      renter: { id: payload.renterId },
      item: { id: payload.itemId },
      startDate: payload.startDate,
      endDate: payload.endDate,
      status: OrderStatus.NEW,
    }),
  });

  return {
    id: backend.id,
    renterId: backend.renter?.id,
    itemId: backend.item?.id,
    startDate: backend.startDate,
    endDate: backend.endDate,
    status: backend.status,
  };
}

export async function getOrders(): Promise<Order[]> {
  const list = await api<any[]>('/requests');
  return list.map((backend) => ({
    id: backend.id,
    renterId: backend.renter?.id,
    itemId: backend.item?.id,
    startDate: backend.startDate,
    endDate: backend.endDate,
    status: backend.status,
  }));
}
