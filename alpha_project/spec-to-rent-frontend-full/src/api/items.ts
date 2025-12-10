import { api } from './http';
import { Machinery } from '../types';

export async function getItems(): Promise<Machinery[]> {
  return api<Machinery[]>('/items');
}
