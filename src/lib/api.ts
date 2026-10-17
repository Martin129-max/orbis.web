export const API_URL = process.env.NEXT_PUBLIC_API_URL;

const TOKEN_KEY = "access_token";

export type Credentials = { email: string; password: string };

export type Profile = { userId: number; email: string };

export function api(path: string, init?: RequestInit) {
  return fetch(`${API_URL}${path}`, init);
}

async function authenticate(path: string, credentials: Credentials) {
  const res = await api(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (res.status === 401) throw new Error("Invalid email or password");
  if (res.status === 409) throw new Error("Email is already registered");
  if (!res.ok) throw new Error("Something went wrong. Please try again.");

  const { access_token } = await res.json();
  localStorage.setItem(TOKEN_KEY, access_token);
}

export function signup(credentials: Credentials) {
  return authenticate("/auth/signup", credentials);
}

export function login(credentials: Credentials) {
  return authenticate("/auth/login", credentials);
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function getProfile(): Promise<Profile | null> {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  const res = await api("/users", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    logout();
    return null;
  }

  return res.json();
}
