import useSWR from "swr";
import { API_BASE, type MultiPanelConfig, type PanelConfig } from "../api";

const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(`${API_BASE}${url}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

export function usePanels(serverId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    serverId ? `/api/servers/${serverId}/panels` : null,
    fetcher<PanelConfig[]>,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    },
  );

  return {
    panels: data ?? [],
    isLoading,
    isError: !!error,
    refresh: mutate,
  };
}

export function useMultiPanels(serverId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    serverId ? `/api/servers/${serverId}/multi-panels` : null,
    fetcher<MultiPanelConfig[]>,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    },
  );

  return {
    multiPanels: data ?? [],
    isLoading,
    isError: !!error,
    refresh: mutate,
  };
}
