import * as Atom from "@atom";
import type { Profile } from "@/lib/api";

type ProfileCardProps = {
  profile: Profile;
  onLogout: () => void;
};

export function ProfileCard({ profile, onLogout }: ProfileCardProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <Atom.Heading>{profile.email}</Atom.Heading>
      <p className="text-sm text-muted">User #{profile.userId}</p>
      <Atom.Button variant="secondary" onClick={onLogout}>
        Log out
      </Atom.Button>
    </div>
  );
}
