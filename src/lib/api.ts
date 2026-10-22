import type { ThemeMode } from "@/stores/theme-store";

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type LoginCredentials = { identifier: string; password: string };

export type SignupDetails = { email: string; username: string; password: string };

export type Credentials = LoginCredentials | SignupDetails;

export type Profile = {
  userId: number;
  email: string;
  username: string;
  avatarUrl: string | null;
  theme: ThemeMode;
  appearOffline: boolean;
  createdAt: string;
};

export type CommunityRole = "owner" | "admin" | "member";

export type Community = {
  id: number;
  name: string;
  iconUrl: string | null;
  coverUrl: string | null;
  ownerId: number;
  isPublic: boolean;
  createdAt: string;
  role?: CommunityRole;
  memberCount?: number;
};

export type CommunitySearchResult = {
  id: number;
  name: string;
  iconUrl: string | null;
  memberCount: number;
  joined: boolean;
};

export async function api(path: string, init?: RequestInit) {
  try {
    return await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new Error("Can't reach Orbis right now. Please try again.");
  }
}

async function errorMessage(res: Response, fallback: string) {
  const { message } = await res.json().catch(() => ({ message: null }));
  return typeof message === "string" ? `${message}.` : fallback;
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

  if (res.status === 401) {
    throw new Error("Invalid username, email, or password.");
  }
  if (res.status === 409) {
    throw new Error(await errorMessage(res, "That account already exists."));
  }
  if (res.status === 400) {
    throw new Error(
      "Usernames are 3–20 characters: letters, numbers, or underscores.",
    );
  }
  if (!res.ok) throw new Error("Something went wrong. Please try again.");

  const { access_token } = await res.json();
  return access_token;
}

export function signup(details: SignupDetails) {
  return authenticate("/auth/signup", details);
}

export function login(credentials: LoginCredentials) {
  return authenticate("/auth/login", credentials);
}

export async function getProfile(token: string): Promise<Profile | null> {
  const res = await api("/users", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.ok ? res.json() : null;
}

export type Author = {
  id: number;
  username: string;
  name: string | null;
  avatarUrl: string | null;
};

export type CommunitySummary = Pick<Community, "id" | "name" | "iconUrl">;

export type Post = {
  type: "post";
  id: number;
  communityId: number;
  content: string;
  commentCount: number;
  createdAt: string;
  author: Author;
  community: CommunitySummary;
};

export type Thread = {
  type: "thread";
  id: number;
  communityId: number;
  title: string;
  content: string;
  score: number;
  commentCount: number;
  myVote: number;
  createdAt: string;
  author: Author;
  community: CommunitySummary;
};

export type FeedItem = Post | Thread;

export type Page<T> = { items: T[]; nextCursor: string | null };

export type ThreadSort = "hot" | "new" | "top";

export type Comment = {
  id: number;
  parentId: number | null;
  content: string;
  score: number;
  myVote: number;
  createdAt: string;
  author: Author;
};

export type Commentable = { type: FeedItem["type"]; id: number };

export type Votable = { type: "thread" | "comment"; id: number };

export type VoteResult = { score: number; myVote: number };

export type Member = {
  userId: number;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  nickname: string | null;
  joinedAt: string;
  isOwner: boolean;
  isAdmin: boolean;
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

export async function uploadAvatar(
  token: string,
  file: File,
): Promise<Profile> {
  const body = new FormData();
  body.append("file", file);

  const res = await api("/users/me/avatar", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body,
  });

  if (res.status === 413) throw new Error("Pictures must be 10 MB or smaller.");
  if (!res.ok) {
    throw new Error(await errorMessage(res, "Could not upload your picture."));
  }
  return res.json();
}

export async function removeAvatar(token: string): Promise<Profile> {
  const res = await api("/users/me/avatar", {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Could not remove your picture.");
  return res.json();
}

export async function getCommunities(token: string): Promise<Community[]> {
  const res = await api("/communities", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.ok ? res.json() : [];
}

export function canManage(community: Community) {
  return community.role === "owner" || community.role === "admin";
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
  isPublic: boolean,
): Promise<Community> {
  const res = await api("/communities", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, isPublic }),
  });

  if (!res.ok) throw new Error("Could not create the community. Please try again.");
  return res.json();
}

export async function updateCommunity(
  token: string,
  communityId: number,
  changes: Partial<Pick<Community, "name" | "isPublic">>,
): Promise<Community> {
  const res = await api(`/communities/${communityId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(changes),
  });

  if (res.status === 403) throw new Error("Only admins can change these settings.");
  if (!res.ok) throw new Error("Could not save the settings. Please try again.");
  return res.json();
}

export type CommunityImage = "icon" | "cover";

async function sendCommunityImage(
  token: string,
  communityId: number,
  image: CommunityImage,
  init: RequestInit,
): Promise<Community> {
  const res = await api(`/communities/${communityId}/${image}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 403) throw new Error(`Only admins can change the ${image}.`);
  if (res.status === 413) throw new Error("Images must be 10 MB or smaller.");
  if (!res.ok) {
    throw new Error(await errorMessage(res, `Could not save the ${image}.`));
  }
  return res.json();
}

export function uploadCommunityImage(
  token: string,
  communityId: number,
  image: CommunityImage,
  file: File,
): Promise<Community> {
  const body = new FormData();
  body.append("file", file);
  return sendCommunityImage(token, communityId, image, { method: "POST", body });
}

export function removeCommunityImage(
  token: string,
  communityId: number,
  image: CommunityImage,
): Promise<Community> {
  return sendCommunityImage(token, communityId, image, { method: "DELETE" });
}

export async function deleteCommunity(
  token: string,
  communityId: number,
): Promise<void> {
  const res = await api(`/communities/${communityId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 403) throw new Error("Only the owner can delete this community.");
  if (!res.ok) throw new Error("Could not delete the community. Please try again.");
}

export async function setCommunityAdmin(
  token: string,
  communityId: number,
  userId: number,
  isAdmin: boolean,
): Promise<Member[]> {
  const res = await api(`/communities/${communityId}/admins/${userId}`, {
    method: isAdmin ? "PUT" : "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 403) throw new Error("Only the owner can change admins.");
  if (!res.ok) throw new Error("Could not update admins. Please try again.");
  return res.json();
}

export async function searchCommunities(
  token: string,
  query: string,
): Promise<CommunitySearchResult[]> {
  const res = await api(
    `/communities/search?${new URLSearchParams({ q: query })}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!res.ok) throw new Error("Could not search communities.");
  return res.json();
}

export async function joinCommunity(
  token: string,
  communityId: number,
): Promise<Community> {
  const res = await api(`/communities/${communityId}/join`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 404) throw new Error("This community is no longer public.");
  if (!res.ok) throw new Error("Could not join the community. Please try again.");
  return res.json();
}

function withQuery(path: string, query: Record<string, string | undefined>) {
  const params = new URLSearchParams(
    Object.entries(query).filter(
      (entry): entry is [string, string] => entry[1] !== undefined,
    ),
  );
  return params.size ? `${path}?${params}` : path;
}

export async function getPosts(
  token: string,
  communityId: number,
  cursor?: string,
): Promise<Page<Post>> {
  const res = await api(withQuery(`/communities/${communityId}/posts`, { cursor }), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Could not load posts.");
  return res.json();
}

export async function getFeed(
  token: string,
  cursor?: string,
): Promise<Page<FeedItem>> {
  const res = await api(withQuery("/feed", { cursor }), {
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

export type FriendUser = {
  userId: number;
  username: string;
  name: string | null;
  avatarUrl: string | null;
};

export type Friend = FriendUser & { online: boolean };

export type FriendList = {
  friends: Friend[];
  incoming: FriendUser[];
  outgoing: FriendUser[];
};

export type FriendTarget = { userId: number } | { username: string };

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

  if (res.status === 404) {
    throw new Error("No one with that username is on Orbis.");
  }
  if (res.status === 400 || res.status === 409) {
    throw new Error(await errorMessage(res, "That isn't a valid username."));
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

export async function getThreads(
  token: string,
  communityId: number,
  sort: ThreadSort,
  cursor?: string,
): Promise<Page<Thread>> {
  const res = await api(
    withQuery(`/communities/${communityId}/threads`, { sort, cursor }),
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!res.ok) throw new Error("Could not load threads.");
  return res.json();
}

export async function createThread(
  token: string,
  communityId: number,
  thread: { title: string; content: string },
): Promise<Thread> {
  const res = await api(`/communities/${communityId}/threads`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(thread),
  });

  if (res.status === 400) throw new Error("Add a title for your thread.");
  if (!res.ok) throw new Error("Could not post the thread. Please try again.");
  return res.json();
}

export async function getComments(
  token: string,
  { type, id }: Commentable,
): Promise<Comment[]> {
  const res = await api(withQuery("/comments", { type, id: String(id) }), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Could not load comments.");
  return res.json();
}

export async function createComment(
  token: string,
  { type, id }: Commentable,
  content: string,
  parentId?: number,
): Promise<Comment> {
  const res = await api("/comments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type, id, parentId, content }),
  });

  if (res.status === 400) throw new Error("Write something before commenting.");
  if (!res.ok) throw new Error("Could not post the comment. Please try again.");
  return res.json();
}

export async function vote(
  token: string,
  { type, id }: Votable,
  value: number,
): Promise<VoteResult> {
  const res = await api("/votes", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type, id, value }),
  });

  if (!res.ok) throw new Error("Could not save your vote.");
  return res.json();
}

export type Stats = {
  members: number;
  communities: number;
  posts: number;
  threads: number;
  comments: number;
};

export async function getStats(): Promise<Stats> {
  const res = await api("/stats");

  if (!res.ok) throw new Error("Could not load statistics.");
  return res.json();
}
