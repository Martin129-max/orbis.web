import type { ThemeMode } from "@/stores/theme-store";

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type Credentials = { email: string; password: string };

export type Profile = {
  userId: number;
  email: string;
  theme: ThemeMode;
  appearOffline: boolean;
};

export type Community = {
  id: number;
  name: string;
  ownerId: number;
  createdAt: string;
};

export async function api(path: string, init?: RequestInit) {
  try {
    return await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new Error("Can't reach Orbis right now. Please try again.");
  }
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

export type Author = { id: number; email: string; name: string | null };

export type Post = {
  id: number;
  communityId: number;
  content: string;
  createdAt: string;
  author: Author;
  community?: Pick<Community, "id" | "name">;
};

export type Member = {
  userId: number;
  email: string;
  name: string | null;
  nickname: string | null;
  joinedAt: string;
  isOwner: boolean;
};

export async function updatePreferences(
  token: string,
  preferences: Partial<Pick<Profile, "theme" | "appearOffline">>,
): Promise<Profile> {
  const res = await api("/users/me/preferences", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(preferences),
  });

  if (!res.ok) throw new Error("Could not save your preferences.");
  return res.json();
}

export async function getCommunities(token: string): Promise<Community[]> {
  const res = await api("/communities", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.ok ? res.json() : [];
}

export async function getCommunity(
  token: string,
  id: string,
): Promise<Community | null> {
  const res = await api(`/communities/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.ok ? res.json() : null;
}

export async function reorderCommunities(
  token: string,
  communityIds: number[],
): Promise<void> {
  const res = await api("/communities/order", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ communityIds }),
  });

  if (!res.ok) throw new Error("Could not save the new order.");
}

export async function createCommunity(
  token: string,
  name: string,
): Promise<Community> {
  const res = await api("/communities", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) throw new Error("Could not create the community. Please try again.");
  return res.json();
}

export async function getPosts(
  token: string,
  communityId: number,
): Promise<Post[]> {
  const res = await api(`/communities/${communityId}/posts`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.ok ? res.json() : [];
}

export async function getFeed(token: string): Promise<Post[]> {
  const res = await api("/feed", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Could not load your feed.");
  return res.json();
}

export async function createPost(
  token: string,
  communityId: number,
  content: string,
): Promise<Post> {
  const res = await api(`/communities/${communityId}/posts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });

  if (res.status === 400) throw new Error("Write something before posting.");
  if (!res.ok) throw new Error("Could not post. Please try again.");
  return res.json();
}

export async function getMembers(
  token: string,
  communityId: number,
): Promise<Member[]> {
  const res = await api(`/communities/${communityId}/members`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.ok ? res.json() : [];
}

export type FriendUser = { userId: number; email: string; name: string | null };

export type Friend = FriendUser & { online: boolean };

export type FriendList = {
  friends: Friend[];
  incoming: FriendUser[];
  outgoing: FriendUser[];
};

export type FriendTarget = { userId: number } | { email: string };

export async function getFriends(token: string): Promise<FriendList> {
  const res = await api("/friends", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Could not load your friends.");
  return res.json();
}

export async function addFriend(
  token: string,
  target: FriendTarget,
): Promise<void> {
  const res = await api("/friends", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(target),
  });

  if (res.status === 404) throw new Error("No one with that email is on Orbis.");
  if (res.status === 400) throw new Error("You can't add yourself.");
  if (res.status === 409) {
    const { message } = await res.json();
    throw new Error(`${message}.`);
  }
  if (!res.ok) throw new Error("Could not send the request. Please try again.");
}

export async function removeFriend(token: string, userId: number): Promise<void> {
  const res = await api(`/friends/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok && res.status !== 404) {
    throw new Error("Could not update your friends. Please try again.");
  }
}
