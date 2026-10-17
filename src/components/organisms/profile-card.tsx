import { Button } from "@/components/atoms/button";
import { Heading } from "@/components/atoms/heading";
import type { Profile } from "@/lib/api";

type ProfileCardProps = {
  profile: Profile;
  onLogout: () => void;
};

export function ProfileCard({ profile, onLogout }: ProfileCardProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <Heading>{profile.email}</Heading>
      <p className="text-sm text-zinc-500">User #{profile.userId}</p>
      <Button variant="secondary" onClick={onLogout}>
        Log out
      </Button>
    </div>
  );
}
