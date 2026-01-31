const API_URL = '/api';

export async function api<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(API_URL + path, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    let text = '';
    try {
      text = await res.text();
    } catch {
      /* ignore */
    }

    // Базовые человеко-понятные сообщения для самых частых ошибок
    if (res.status === 400) {
      throw new Error(text || 'Некорректные данные. Проверьте заполненные поля.');
    }
    if (res.status === 401) {
      throw new Error(text || 'Неверный email или пароль.');
    }

    throw new Error(text || `Ошибка ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
