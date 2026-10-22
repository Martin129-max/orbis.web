import {
  ArrowDown,
  ArrowUp,
  Bell,
  CircleCheck,
  Compass,
  FolderOpen,
  Moon,
  Reply,
  ShieldCheck,
  Ticket,
  UserPlus,
  WifiOff,
} from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import * as Atom from "@atom";

const communities = [
  { slug: "seasonal-anime-club", name: "Seasonal Anime Club", members: 8 },
  { slug: "straw-hat-pirates", name: "Straw Hat Pirates", members: 5 },
  { slug: "bebop-lounge", name: "Bebop Lounge", members: 3 },
  { slug: "demon-slayer-corps", name: "Demon Slayer Corps", members: 4 },
  { slug: "jujutsu-high", name: "Jujutsu High", members: 2 },
  { slug: "hidden-leaf-village", name: "Hidden Leaf Village", members: 6 },
];

const library = [
  {
    title: "Sousou no Frieren",
    cover: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-qQTzQnEJJ3oB.jpg",
    status: "Watching",
    progress: 12,
    total: 28,
    unit: "ep",
  },
  {
    title: "ONE PIECE",
    cover: "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx30013-BeslEMqiPhlk.jpg",
    status: "Reading",
    progress: 1100,
    total: null,
    unit: "ch",
  },
  {
    title: "Cowboy Bebop",
    cover: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx1-GCsPm7waJ4kS.png",
    status: "Completed",
    progress: 26,
    total: 26,
    unit: "ep",
  },
];

const extras: { icon: ReactNode; label: string }[] = [
  { icon: <Compass size={18} />, label: "Explore public communities" },
  { icon: <FolderOpen size={18} />, label: "Folders for your communities" },
  { icon: <Moon size={18} />, label: "Light and dark themes" },
  { icon: <WifiOff size={18} />, label: "Appear offline anytime" },
  { icon: <Ticket size={18} />, label: "Feedback with ticket numbers" },
  { icon: <ShieldCheck size={18} />, label: "Owner and admin tools" },
];

function Pixel({
  src,
  className = "",
  sizes = "96px",
}: {
  src: string;
  className?: string;
  sizes?: string;
}) {
  return (
    <span className={`relative block overflow-hidden ${className}`}>
      <Image src={src} alt="" fill sizes={sizes} className="object-cover" />
    </span>
  );
}

function Showcase({
  eyebrow,
  title,
  text,
  visual,
  flip = false,
}: {
  eyebrow: string;
  title: string;
  text: string;
  visual: ReactNode;
  flip?: boolean;
}) {
  return (
    <section className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
      <div className={`flex flex-col gap-4 ${flip ? "lg:order-2" : ""}`}>
        <p className="text-xs font-bold tracking-wide text-accent uppercase">
          {eyebrow}
        </p>
        <h2 className="font-display text-4xl leading-[1.02] font-bold sm:text-5xl">
          {title}
        </h2>
        <p className="max-w-md text-[17px] text-muted">{text}</p>
      </div>
      <div aria-hidden className="relative">
        {visual}
      </div>
    </section>
  );
}

const floating =
  "rounded-lg border border-divider bg-surface shadow-[0_16px_32px_-20px_rgb(0_0_0/0.45)]";

function TalkVisual() {
  return (
    <div className="relative mx-auto max-w-[480px] pt-4 pb-2">
      <div className="absolute inset-x-8 top-0 bottom-8 -rotate-2 rounded-3xl bg-accent-soft" />
      <div className={`relative flex gap-4 p-5 ${floating}`}>
        <div className="flex flex-col items-center gap-1 text-accent">
          <ArrowUp size={16} />
          <span className="text-sm font-bold">128</span>
          <ArrowDown size={16} className="text-muted" />
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <p className="flex items-center gap-2 text-xs text-muted">
            <Pixel src="/images/communities/seasonal-anime-club.webp" className="h-5 w-5 rounded-full" />
            Seasonal Anime Club · Forum
          </p>
          <p className="font-display text-2xl leading-tight font-bold">
            Which opening are you not skipping this season?
          </p>
          <p className="text-xs text-muted">42 comments</p>
        </div>
      </div>
      <div className={`relative -mt-5 ml-12 flex flex-col gap-3 p-4 ${floating}`}>
        <div className="flex items-start gap-2.5">
          <Pixel src="/images/avatars/spike.webp" className="h-7 w-7 shrink-0 rounded-full" />
          <p className="text-[13px]">
            <span className="font-semibold">Spike</span> Anything with a
            saxophone. Fight me.
          </p>
        </div>
        <div className="ml-9 flex items-start gap-2.5">
          <Reply size={14} className="mt-1.5 shrink-0 text-muted" />
          <Pixel src="/images/avatars/nami.webp" className="h-7 w-7 shrink-0 rounded-full" />
          <p className="text-[13px]">
            <span className="font-semibold">Nami</span> Fine, but you’re
            buying the snacks.
          </p>
        </div>
      </div>
    </div>
  );
}

function LibraryVisual() {
  return (
    <div className="relative mx-auto max-w-[480px] pb-12">
      <div className="absolute -inset-x-2 top-6 bottom-0 rotate-2 rounded-3xl bg-rail-item" />
      <ul className={`relative flex flex-col divide-y divide-divider px-4 ${floating}`}>
        {library.map((item) => (
          <li key={item.title} className="flex items-center gap-3 py-3">
            <span className="relative aspect-[2/3] w-11 shrink-0 overflow-hidden rounded-md border border-divider">
              <Image src={item.cover} alt="" fill unoptimized className="object-cover" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="truncate text-sm font-semibold">{item.title}</span>
              <span className="h-1.5 w-full overflow-hidden rounded-full bg-rail-item">
                <span
                  className="block h-full rounded-full bg-accent"
                  style={{ width: `${item.total ? (item.progress / item.total) * 100 : 70}%` }}
                />
              </span>
            </span>
            <span className="flex w-24 shrink-0 flex-col items-end gap-0.5">
              <span className="text-xs font-semibold">{item.status}</span>
              <span className="text-[11px] text-muted">
                {item.progress} / {item.total ?? "?"} {item.unit}
              </span>
            </span>
          </li>
        ))}
      </ul>
      <div className={`absolute -bottom-2 left-6 flex items-center gap-2.5 py-2 pr-4 pl-2 sm:left-[-1.5rem] ${floating}`}>
        <Pixel src="/images/avatars/anya.webp" className="h-8 w-8 rounded-full" />
        <span className="text-[13px]">
          <span className="font-semibold">Anya</span> watched episodes 3–5
          of <span className="font-semibold">SPY×FAMILY</span>
        </span>
      </div>
    </div>
  );
}

function ProfileVisual() {
  return (
    <div className="relative mx-auto max-w-[480px] pb-20">
      <div className={`relative overflow-hidden ${floating}`}>
        <Pixel src="/images/user-covers/naruto.webp" className="h-28" sizes="480px" />
        <div className="flex items-end gap-4 px-5 pb-5">
          <Pixel
            src="/images/avatars/naruto.webp"
            className="-mt-10 h-20 w-20 shrink-0 rounded-full border-4 border-surface"
          />
          <div className="flex min-w-0 flex-col pb-1">
            <span className="font-display text-2xl leading-tight font-bold">
              Naruto Uzumaki
            </span>
            <span className="text-xs text-muted">@naruto · 5 friends</span>
          </div>
        </div>
      </div>
      <div className={`absolute right-0 -bottom-2 w-[78%] overflow-hidden ${floating}`}>
        <div className="relative">
          <Pixel src="/images/covers/hidden-leaf-village.webp" className="h-20" sizes="400px" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute inset-x-3 bottom-2.5 flex items-center gap-2.5">
            <Pixel
              src="/images/communities/hidden-leaf-village.webp"
              className="h-9 w-9 rounded-full border-2 border-white/80"
            />
            <span className="font-display text-lg font-bold text-white">
              Hidden Leaf Village
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationsVisual() {
  const rows = [
    { avatar: "sakura", icon: <Reply size={11} />, text: "replied to your comment", time: "2m" },
    { avatar: "gojo", icon: <UserPlus size={11} />, text: "sent you a friend request", time: "1h" },
    { avatar: "admin", icon: <CircleCheck size={11} />, text: "moved your report #0042 to Done", time: "3h" },
  ];

  return (
    <div className="relative mx-auto max-w-[480px] pt-10">
      <div className="absolute inset-x-10 top-0 bottom-6 -rotate-2 rounded-3xl bg-accent-soft" />
      <div className={`relative flex flex-col gap-1 p-3 ${floating}`}>
        <p className="flex items-center gap-2 px-2 pt-1 pb-2 font-display text-xl font-bold">
          <Bell size={18} className="text-accent" />
          Notifications
        </p>
        {rows.map((row, index) => (
          <div
            key={row.text}
            className={`flex items-center gap-3 rounded-md p-2 ${index === 0 ? "bg-accent-soft" : ""}`}
          >
            <span className="relative shrink-0">
              <Pixel src={`/images/avatars/${row.avatar}.webp`} className="h-9 w-9 rounded-full" />
              <span className="absolute -right-1 -bottom-1 flex h-4.5 w-4.5 items-center justify-center rounded-full border border-divider bg-surface">
                {row.icon}
              </span>
            </span>
            <span className="min-w-0 flex-1 text-[13px]">
              <span className="font-semibold capitalize">{row.avatar}</span> {row.text}
            </span>
            <span className="text-[11px] text-muted">{row.time}</span>
          </div>
        ))}
      </div>
      <div className={`absolute -top-1 right-2 flex items-center gap-2 rounded-full py-1.5 pr-3.5 pl-1.5 text-xs ${floating}`}>
        <span className="flex -space-x-2">
          {["levi", "goku", "luffy"].map((name) => (
            <span key={name} className="relative">
              <Pixel src={`/images/avatars/${name}.webp`} className="h-7 w-7 rounded-full border-2 border-surface" />
              <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-online" />
            </span>
          ))}
        </span>
        3 friends online
      </div>
    </div>
  );
}

export function LandingCommunities() {
  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <p className="text-xs font-bold tracking-wide text-accent uppercase">
          Communities
        </p>
        <h2 className="font-display text-4xl leading-[1.02] font-bold sm:text-5xl">
          Find your corner.
        </h2>
        <p className="max-w-xl text-[17px] text-muted">
          Join a public club or start your own, with its own icon, cover, and
          background.
        </p>
      </div>
      <ul
        aria-label="Example communities"
        className="-mx-4 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-8 sm:scroll-px-8 sm:px-8"
      >
        {communities.map((community) => (
          <li
            key={community.slug}
            className="w-64 shrink-0 snap-start overflow-hidden rounded-lg border border-divider bg-surface"
          >
            <Pixel src={`/images/covers/${community.slug}.webp`} className="h-24" sizes="256px" />
            <div className="flex items-end gap-3 px-4 pb-4">
              <Pixel
                src={`/images/communities/${community.slug}.webp`}
                className="-mt-6 h-12 w-12 shrink-0 rounded-full border-4 border-surface"
              />
              <span className="flex min-w-0 flex-col pb-0.5">
                <span className="truncate text-sm font-semibold">{community.name}</span>
                <span className="text-xs text-muted">
                  {community.members} members
                </span>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function LandingShowcase() {
  return (
    <>
      <Showcase
        eyebrow="Feed and forum"
        title="Talk it out."
        text="Share quick updates in the feed, or start a thread, vote on the best takes, and reply in conversations that stay put."
        visual={<TalkVisual />}
      />
      <Showcase
        flip
        eyebrow="Library"
        title="Track what you love."
        text="Keep a list of the anime, manga, and games you’re watching, reading, and playing, and see what your communities are into."
        visual={<LibraryVisual />}
      />
      <Showcase
        eyebrow="Profiles"
        title="Make it yours."
        text="Pick a picture, cover, and wallpaper, leave posts on your friends’ walls, and see everyone’s communities, friends, and what they’re watching."
        visual={<ProfileVisual />}
      />
      <Showcase
        flip
        eyebrow="Friends and notifications"
        title="Stay in the loop."
        text="See who’s online, and get a heads-up when someone replies, adds you, or updates your report."
        visual={<NotificationsVisual />}
      />
    </>
  );
}

export function LandingExtras() {
  return (
    <section aria-label="Also in Orbis" className="flex flex-col gap-5">
      <p className="text-xs font-bold tracking-wide text-muted uppercase">
        Also in Orbis
      </p>
      <ul className="flex flex-wrap gap-x-8 gap-y-4">
        {extras.map((extra) => (
          <li key={extra.label} className="flex items-center gap-2 text-sm font-semibold">
            <span className="text-accent">{extra.icon}</span>
            {extra.label}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function LandingCallToAction() {
  return (
    <section className="flex flex-col items-center gap-6 py-6 text-center">
      <span aria-hidden className="flex -space-x-3">
        {["sakura", "luffy", "anya", "spike", "tanjiro", "gojo"].map((name) => (
          <Pixel
            key={name}
            src={`/images/avatars/${name}.webp`}
            className="h-12 w-12 rounded-full border-4 border-background"
          />
        ))}
      </span>
      <h2 className="font-display text-5xl leading-[1.02] font-bold sm:text-6xl">
        Pull up a chair.
      </h2>
      <p className="max-w-md text-[17px] text-muted">
        Your next favourite community is one sign-up away.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Atom.ButtonLink href="/register" size="large">
          Create your account
        </Atom.ButtonLink>
        <Atom.ButtonLink href="/login" size="large" variant="secondary">
          Log in
        </Atom.ButtonLink>
      </div>
    </section>
  );
}
