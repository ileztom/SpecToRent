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
    throw new Error(text || res.statusText);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
