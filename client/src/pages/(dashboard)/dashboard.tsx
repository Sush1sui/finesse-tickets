import Spinner from "@/components/ui/spinner";
import ServerCard from "../../components/server-card";
import { useAuth } from "@/context/AuthContext";
import { useCallback, useEffect, useState, memo, useMemo } from "react";
import { getDiscordGuildIconUrl, truncateName } from "@/lib/utils";

type ServersType = {
  id: string;
  name: string;
  icon?: string | null;
  owner?: boolean;
  permissions?: string;
}[];

export default memo(function Dashboard() {
  const { user, authLoading } = useAuth();
  const [fetching, setFetching] = useState(false);
  const [servers, setServers] = useState<ServersType>([]);

  const fetchPermittedServers = useCallback(async () => {
    setFetching(true);
    setServers([]);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/dashboard/permitted-servers`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
          credentials: "include",
        }
      );

      const text = await res.text();
      const contentType = res.headers.get("content-type") || "";

      if (!res.ok) {
        console.error("Failed to fetch permitted servers:", res.status, text);
        return;
      }
      if (!contentType.includes("application/json")) {
        console.error("Expected JSON but got:", contentType, text);
        return;
      }

      const data = JSON.parse(text);
      setServers(data.permittedServers || data.servers || []);
    } catch (error) {
      console.error("Error fetching permitted servers:", error);
    } finally {
      setFetching(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchPermittedServers();
  }, [user, fetchPermittedServers]);

  // fallback placeholders when no servers yet
  const display = useMemo(
    () =>
      servers.length
        ? servers
        : Array.from({ length: 4 }).map((_, i) => ({
            id: `placeholder-${i}`,
            name: `Server ${i + 1}`,
            icon: null,
          })),
    [servers]
  );

  if (authLoading || fetching)
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6">
        <h2 className="text-xl font-bold">Fetching Servers Please Wait...</h2>
        <Spinner />
      </div>
    );
  if (!user) return <div>Please log in to access the dashboard.</div>;

  return (
    <div className="p-3">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">Servers</h1>
      </div>

      <div className="bg-card rounded-md border border-border p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 justify-items-center">
          {display.map((s) => (
            <ServerCard
              key={s.id}
              to={`/dashboard/guild/${s.id}`}
              title={truncateName(s.name)}
              icon={
                s.icon ? (
                  <img
                    src={getDiscordGuildIconUrl(s.id, s.icon)}
                    alt={`${s.name} icon`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                )
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
});
