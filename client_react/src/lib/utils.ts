import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDiscordGuildIconUrl(
  guildId: string,
  iconHash?: string | null,
  size = 128
) {
  if (!iconHash) return undefined;
  const ext = iconHash.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/icons/${guildId}/${iconHash}.${ext}?size=${size}`;
}

export function truncateName(name: string, maxLen = 25) {
  if (!name) return name;
  if (name.length <= maxLen) return name;
  return name.slice(0, maxLen - 3) + "...";
}
