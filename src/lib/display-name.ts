export function displayName(user: {
  name: string | null;
  username: string;
  nickname?: string | null;
}) {
  return user.nickname ?? user.name ?? user.username;
}
