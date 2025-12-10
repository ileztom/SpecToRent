import { api } from './http';
import { User, UserRole } from '../types';

interface BackendUser {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  password?: string;
}

function mapUser(u: BackendUser): User {
  return {
    id: String(u.id),
    name: u.fullName,
    email: u.email,
    role: u.role,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.fullName)}`,
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
  // Упрощённый логин: ищем по email, пароль не проверяется (для дипломного проекта)
  const users = await api<BackendUser[]>('/users');
  const found = users.find((u) => u.email === email);
  if (!found) throw new Error('Пользователь не найден');
  return mapUser(found);
}
