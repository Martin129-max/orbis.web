export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function api(path: string, init?: RequestInit) {
  return fetch(`${API_URL}${path}`, init);
}
