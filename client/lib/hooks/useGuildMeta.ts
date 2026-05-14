import useSWR from "swr";
import { API_BASE, type DiscordEmoji, type GuildMetaResponse } from "../api";

const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(`${API_BASE}${url}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

export function useGuildMeta(serverId: string) {
  const meta = useSWR(
    serverId ? `/api/servers/${serverId}/meta` : null,
    fetcher<GuildMetaResponse>,
    { revalidateOnFocus: false, dedupingInterval: 30000 },
  );

  return {
    roles: meta.data?.roles ?? [],
    channels: meta.data?.channels ?? [],
    categories: meta.data?.categories ?? [],
    isLoading: meta.isLoading,
  };
}

export function useGuildEmojis(serverId: string, enabled: boolean) {
  const emojis = useSWR(
    enabled && serverId ? `/api/servers/${serverId}/meta/emojis` : null,
    fetcher<DiscordEmoji[]>,
    { revalidateOnFocus: false, dedupingInterval: 30000 },
  );

  return {
    emojis: emojis.data ?? [],
    isLoading: emojis.isLoading,
  };
}
