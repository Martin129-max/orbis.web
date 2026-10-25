import type { Conversation } from "./api";
import { displayName } from "./display-name";

export const MESSAGE_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

export function chatTitle({ name, members }: Conversation) {
  if (name) return name;
  const names = members.map(displayName);
  if (names.length === 0) return "Just you";
  if (names.length <= 3) return names.join(", ");
  return `${names.slice(0, 2).join(", ")} and ${names.length - 2} others`;
}

export function chatPreview(conversation: Conversation, me: number | undefined) {
  const { lastText, lastSenderId, lastSystem, isGroup, members } = conversation;
  const sender = members.find(({ userId }) => userId === lastSenderId);
  const mine = lastSenderId === me;

  if (lastSystem) return `${mine ? "You" : sender ? displayName(sender) : "Someone"} ${lastText}`;
  if (mine) return `You: ${lastText}`;
  if (isGroup && sender) return `${displayName(sender).split(" ")[0]}: ${lastText}`;
  return lastText;
}
