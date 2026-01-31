import { api } from './http';
import { Machinery } from '../types';

// Тип ответа от бэкенда (RentalItem)
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

export async function getItems(): Promise<Machinery[]> {
  const backend = await api<BackendRentalItem[]>('/items');
  return backend.map((item) => ({
    id: item.id,
    name: item.title,
    title: item.title,
    description: item.description,
    region: item.region ?? item.location,
    location: item.location,
    category: item.category,
    type: item.type,
    imageUrl: item.imageUrl,
    availableCount: item.availableCount ?? 1,
    dailyPrice: item.dailyPrice,
    pricePerShift: item.dailyPrice,
    status: item.status,
    ownerId: item.owner?.id,
  }));
}
