import type { Onboarding } from "./api";

export type Tip = {
  id: string;
  title: string;
  body: string;
  action?: { label: string; href: string };
  used?: keyof Onboarding["used"];
};

export const tips: Tip[] = [
  {
    id: "steam",
    title: "Bring your Steam games into Orbis",
    body: "Connect Steam to add your games, playtime, and achievements to your library. Friends and community members can also see what you’re playing.",
    action: { label: "Connect Steam", href: "/settings?tab=connections" },
    used: "steam",
  },
  {
    id: "search",
    title: "Search everything from anywhere",
    body: "Press ⌘K (Ctrl+K on Windows) or / to search people, communities, posts, titles, and your library without leaving the page.",
  },
  {
    id: "folders",
    title: "Group communities into folders",
    body: "In the rail on the left, drop one community onto another to put them in a folder. Drag them to change the order, too.",
    used: "folders",
  },
  {
    id: "connections",
    title: "Log in with Discord or Twitch",
    body: "Connect Discord or Twitch to log in with one click. With Twitch connected, friends can see when you’re live.",
    action: { label: "Connect an account", href: "/settings?tab=connections" },
    used: "connections",
  },
  {
    id: "status",
    title: "Let friends know if you’re around",
    body: "Click your picture in the top right to set yourself as Online, Idle, or Busy, or to appear offline.",
  },
  {
    id: "feed-view",
    title: "Make the feed yours",
    body: "Use Filter feed to show or hide posts, threads, and library updates, and switch to Compact view to see more at a glance.",
  },
  {
    id: "library-dock",
    title: "Update your library from any page",
    body: "Pull up the bar at the bottom of the screen to change what you’re watching, reading, or playing without leaving the page.",
  },
];
