import { vote, type Votable, type VoteResult } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export async function castVote(
  target: Votable,
  current: VoteResult,
  value: 1 | -1,
  onChange: (result: VoteResult) => void,
) {
  const { token } = useAuthStore.getState();
  if (!token) return;

  const next = current.myVote === value ? 0 : value;
  onChange({ score: current.score - current.myVote + next, myVote: next });

  try {
    onChange(await vote(token, target, next));
  } catch {
    onChange(current);
  }
}
