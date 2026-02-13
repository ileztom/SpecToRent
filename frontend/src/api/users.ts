import { api } from './http';
import { User, UserRole } from '../types';

interface BackendUser {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  companyName?: string;
  description?: string;
  region?: string;
  avatarUrl?: string;
}

function mapUser(u: BackendUser): User {
  return {
    id: String(u.id),
    name: u.fullName,
    email: u.email,
    role: u.role,
    phone: u.phone,
    companyName: u.companyName,
    description: u.description,
    region: u.region,
    avatar: u.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.fullName)}`,
  };
}

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}): Promise<User> {
  const backendPayload = {
    fullName: payload.name,
    email: payload.email,
    password: payload.password,
    role: payload.role,
  };

  const user = await api<BackendUser>('/users/register', {
    method: 'POST',
    body: JSON.stringify(backendPayload),
  });

  return mapUser(user);
}

export async function loginUser(email: string, password: string): Promise<User> {
  const user = await api<BackendUser>(`/users/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, {
    method: 'POST',
  });
  return mapUser(user);
}

export async function updateUserProfile(userId: number, payload: {
  fullName: string;
  phone?: string;
  companyName?: string;
  description?: string;
  region?: string;
  avatarUrl?: string;
}): Promise<User> {
  const backend = await api<BackendUser>(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return mapUser(backend);
}
