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
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const hasFetched = useRef(false);

  // Wait for component to mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;

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
    // Verify server session before redirecting to avoid false client-side redirects.
    // Use a short timeout + single retry to handle transient network issues.
    let isActive = true;

    async function tryFetchWithTimeout(url: string, timeoutMs = 2000) {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url, {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        return res;
      } finally {
        clearTimeout(id);
      }
    }

    async function verifyAndRedirect() {
      if (!authLoading && !user) {
        try {
          let res;
          try {
            res = await tryFetchWithTimeout("/api/auth/me", 2000);
          } catch (err) {
            // first attempt failed (timeout/network). Retry once.
            console.warn("First /api/auth/me attempt failed, retrying...", err);
            try {
              res = await tryFetchWithTimeout("/api/auth/me", 2000);
            } catch (err2) {
              // both attempts failed — don't redirect on transient network failures
              console.error("/api/auth/me verification failed twice:", err2);
              return;
            }
          }

          if (!isActive) return;

          if (res.status === 401) {
            // Server explicitly says there's no session — safe to redirect
            router.push("/");
          } else if (!res.ok) {
            // unexpected server error — log and avoid redirecting
            console.error("Unexpected response from /api/auth/me:", res.status);
          } else {
            // server has a session — do nothing and allow next-auth to sync client state
          }
        } catch (err) {
          console.error("Unexpected error verifying auth on server:", err);
        }
      }
    }

    verifyAndRedirect();

    return () => {
      isActive = false;
    };
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
