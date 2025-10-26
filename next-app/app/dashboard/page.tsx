"use client";

import { useAuth } from "@/context/AuthContext";
import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { getDiscordGuildIconUrl, truncateName } from "@/lib/utils";
import ServerCard from "@/components/server-card";
import { Spinner } from "@/components/ui/spinner";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import Image from "next/image";

type ServersType = {
  id: string;
  name: string;
  icon?: string | null;
  owner?: boolean;
  permissions?: string;
}[];

export default function Dashboard() {
  const { user, authLoading } = useAuth();
  const [fetching, setFetching] = useState(false);
  const [servers, setServers] = useState<ServersType>([]);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const router = useRouter();
  const hasFetched = useRef(false);

  const fetchPermittedServers = useCallback(async () => {
    setFetching(true);
    setServers([]);
    try {
      const res = await fetch("/api/dashboard/permitted-servers", {
        method: "GET",
        headers: { Accept: "application/json" },
        credentials: "include",
      });

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
  }, []); // Remove 'user' from dependencies since it's not used in the function

  useEffect(() => {
    if (user && !hasFetched.current) {
      hasFetched.current = true;
      fetchPermittedServers();
    }
  }, [user, fetchPermittedServers]);

  // Redirect to home if not authenticated after loading
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [authLoading, user, router]);

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
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "2rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            color: isDark ? "#fff" : "#000",
          }}
        >
          Fetching Servers Please Wait...
        </h2>
        <Spinner />
      </div>
    );

  if (!user)
    return (
      <div style={{ padding: "1.5rem", color: isDark ? "#fff" : "#000" }}>
        Please log in to access the dashboard.
      </div>
    );

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "2rem 1rem",
      }}
    >
      <div
        style={{
          marginBottom: "2rem",
        }}
      >
        <h1
          style={{
            fontSize: "1.875rem",
            fontWeight: 700,
            color: isDark ? "#fff" : "#000",
          }}
        >
          Servers
        </h1>
      </div>

      <div
        style={{
          borderRadius: "0.5rem",
          border: `1px solid ${
            isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"
          }`,
          backgroundColor: isDark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.6)",
          padding: "2rem",
          boxShadow: isDark
            ? "0 4px 20px rgba(0,0,0,0.4)"
            : "0 2px 10px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gap: "2rem",
            justifyItems: "center",
          }}
        >
          {display.map((s) => (
            <ServerCard
              key={s.id}
              href={`/dashboard/guild/${s.id}`}
              title={truncateName(s.name)}
              icon={
                s.icon ? (
                  <Image
                    src={getDiscordGuildIconUrl(s.id, s.icon)!}
                    alt={`${s.name} icon`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-2xl"
                    style={{ color: isDark ? "#fff" : "#000" }}
                  >
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
}
