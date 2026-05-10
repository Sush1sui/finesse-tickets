import useSWR from "swr";
import * as api from "../api";

const API_BASE = api.API_BASE;

const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(`${API_BASE}${url}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

export function useServers() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/auth/servers",
    fetcher<{ servers: api.ServerSummary[] }>,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    },
  );

  return {
    servers: data?.servers ?? [],
    isLoading,
    isError: !!error,
    refresh: mutate,
  };
}

export function useServerConfig(serverId: string, showChannels = false) {
  const endpoint = showChannels
    ? `/api/config/${serverId}?show_channels=true`
    : `/api/config/${serverId}`;

  const { data, error, isLoading, mutate } = useSWR(
    serverId ? endpoint : null,
    fetcher<
      | api.ServerConfig
      | { config: api.ServerConfig; channels: api.DiscordChannel[] }
    >,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    },
  );

  const config = data && "config" in data ? data.config : (data ?? null);
  const channels = data && "channels" in data ? data.channels : [];

  return {
    config,
    channels: channels as api.DiscordChannel[],
    isLoading,
    isError: !!error,
    refresh: mutate,
  };
}
