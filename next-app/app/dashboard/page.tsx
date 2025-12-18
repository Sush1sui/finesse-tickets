"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useMemo } from "react";
import { getDiscordGuildIconUrl, truncateName } from "@/lib/utils";
import ServerCard from "@/components/server-card";
import { Spinner } from "@/components/ui/spinner";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { usePermittedServers } from "@/hooks/useGuildQueries";

export default function Dashboard() {
  const { user, authLoading } = useAuth();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Use React Query hook for permitted servers
  const { data: servers = [], isLoading: fetching } = usePermittedServers();

  // Wait for component to mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;

  // Redirect to home if not authenticated after loading
  useEffect(() => {
    if (!authLoading && !user) {
      // Simple redirect without complex retry logic
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

      <div>
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
                    width={120}
                    height={120}
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
