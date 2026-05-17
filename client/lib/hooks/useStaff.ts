import useSWR from "swr";
import { API_BASE, type StaffConfig } from "../api";

const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(`${API_BASE}${url}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

export function useStaff(serverId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    serverId ? `/api/servers/${serverId}/staff` : null,
    fetcher<StaffConfig>,
    { revalidateOnFocus: false, dedupingInterval: 30000 },
  );

  return {
    members: data?.members ?? [],
    roles: data?.roles ?? [],
    authorizedMemberIds: data?.authorizedMemberIds ?? [],
    authorizedRoleIds: data?.authorizedRoleIds ?? [],
    isLoading,
    isError: !!error,
    refresh: mutate,
  };
}
