import { api } from './http';
import { Machinery } from '../types';

interface BackendRentalItem {
  id: number;
  title: string;
  description?: string;
  region?: string;
  location?: string;
  category?: string;
  type?: string;
  imageUrl?: string;
  availableCount?: number;
  dailyPrice?: number;
  status?: string;
  owner?: { id: number };
}

function mapItem(item: BackendRentalItem): Machinery {
  const title = item.title || 'Без названия';
  return {
    id: item.id,
    name: title,
    title: title,
    description: item.description,
    region: item.region || item.location,
    location: item.location,
    category: item.category,
    type: item.type,
    imageUrl: item.imageUrl,
    availableCount: item.availableCount ?? 1,
    dailyPrice: item.dailyPrice,
    pricePerShift: item.dailyPrice,
    status: item.status,
    ownerId: item.owner?.id,
  };
}

export async function getItems(): Promise<Machinery[]> {
  const backend = await api<BackendRentalItem[]>('/items');
  return backend.map(mapItem);
}

export async function getItemsByOwner(ownerId: number): Promise<Machinery[]> {
  const all = await getItems();
  return all.filter(item => item.ownerId === ownerId);
}

export async function getItemById(id: number): Promise<Machinery> {
  const backend = await api<BackendRentalItem>(`/items/${id}`);
  return mapItem(backend);
}

export interface CreateItemPayload {
  title: string;
  description?: string;
  region?: string;
  location?: string;
  category?: string;
  type?: string;
  imageUrl?: string;
  availableCount?: number;
  dailyPrice?: number;
  ownerId: number;
}

export async function createItem(payload: CreateItemPayload): Promise<Machinery> {
  const backendPayload = {
    title: payload.title,
    description: payload.description,
    region: payload.region,
    location: payload.location,
    category: payload.category,
    type: payload.type,
    imageUrl: payload.imageUrl,
    availableCount: payload.availableCount ?? 1,
    dailyPrice: payload.dailyPrice,
    status: 'AVAILABLE',
    owner: { id: payload.ownerId },
  };

  const backend = await api<BackendRentalItem>('/items', {
    method: 'POST',
    body: JSON.stringify(backendPayload),
  });
  return mapItem(backend);
}

export async function updateItem(id: number, payload: Partial<CreateItemPayload>): Promise<Machinery> {
  const backendPayload: any = { ...payload };
  if (payload.ownerId) {
    backendPayload.owner = { id: payload.ownerId };
    delete backendPayload.ownerId;
  }

  const backend = await api<BackendRentalItem>(`/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(backendPayload),
  });
  return mapItem(backend);
}

export async function deleteItem(id: number): Promise<void> {
  const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    if (res.status === 400) {
      const data = await res.json();
      throw new Error(data.error || 'Не удалось удалить объявление');
    }
    throw new Error('Не удалось удалить объявление');
  }
}
