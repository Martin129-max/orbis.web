import { LogOut } from "lucide-react";
import type { ReactNode } from "react";
import * as Atom from "@atom";
import type { Profile } from "@/lib/api";
import { AppearOfflineSwitch } from "./appear-offline-switch";
import { ThemeToggle } from "./theme-toggle";

type ProfileCardProps = {
  profile: Profile;
  onLogout: () => void;
};

function Setting({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-muted">{description}</span>
      </div>
      {children}
    </div>
  );
}

export function ProfileCard({ profile, onLogout }: ProfileCardProps) {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex items-center gap-4">
        <Atom.Avatar label={profile.username} seed={profile.userId} size="lg" />
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="truncate text-xl font-semibold">@{profile.username}</h2>
          <p className="truncate text-sm text-muted">
            {profile.email}
            <span className="hidden sm:inline"> · Only you can see your email</span>
          </p>
        </div>
      </section>

      <section aria-labelledby="preferences" className="flex flex-col">
        <h2 id="preferences" className="pb-1 text-xs font-semibold tracking-wide text-muted uppercase">
          Preferences
        </h2>
        <div className="divide-y divide-black/10 dark:divide-white/10">
          <Setting label="Theme" description="Saved to your account on every device.">
            <ThemeToggle />
          </Setting>
          <Setting
            label="Appear offline"
            description="Your friends will see you as offline."
          >
            <AppearOfflineSwitch />
          </Setting>
        </div>
      </section>

      <section className="border-t border-black/10 pt-6 dark:border-white/10">
        <Atom.Button
          variant="secondary"
          danger
          icon={<LogOut size={16} />}
          onClick={onLogout}
        >
          Log out
        </Atom.Button>
      </section>
    </div>
  );
}
