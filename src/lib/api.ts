export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type Credentials = { email: string; password: string };

export type Profile = { userId: number; email: string };

export function api(path: string, init?: RequestInit) {
  return fetch(`${API_URL}${path}`, init);
}

async function authenticate(
  path: string,
  credentials: Credentials,
): Promise<string> {
  const res = await api(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (res.status === 401) throw new Error("Invalid email or password");
  if (res.status === 409) throw new Error("Email is already registered");
  if (!res.ok) throw new Error("Something went wrong. Please try again.");

  const { access_token } = await res.json();
  return access_token;
}

export function signup(credentials: Credentials) {
  return authenticate("/auth/signup", credentials);
}

export function login(credentials: Credentials) {
  return authenticate("/auth/login", credentials);
}

export async function getProfile(token: string): Promise<Profile | null> {
  const res = await api("/users", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.ok ? res.json() : null;
}
