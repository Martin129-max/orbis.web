import {
  setLike,
  vote,
  type Likeable,
  type LikeResult,
  type Votable,
  type VoteResult,
} from "@/lib/api";
import { currentPath, loginUrl } from "@/lib/login";
import { useAuthStore } from "@/stores/auth-store";

function requireLogin() {
  window.location.assign(loginUrl(currentPath()));
}

export async function castVote(
  target: Votable,
  current: VoteResult,
  value: 1 | -1,
  onChange: (result: VoteResult) => void,
) {
  const { token } = useAuthStore.getState();
  if (!token) return requireLogin();

  const next = current.myVote === value ? 0 : value;
  onChange({ score: current.score - current.myVote + next, myVote: next });

  try {
    onChange(await vote(token, target, next));
  } catch {
    onChange(current);
  }
}

export async function toggleLike(
  target: Likeable,
  current: LikeResult,
  onChange: (result: LikeResult) => void,
) {
  const { token } = useAuthStore.getState();
  if (!token) return requireLogin();

  const liked = !current.liked;
  onChange({ liked, likeCount: current.likeCount + (liked ? 1 : -1) });

  try {
    onChange(await setLike(token, target, liked));
  } catch {
    onChange(current);
  }
}
