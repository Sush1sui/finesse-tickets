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
  const {
    data: servers = [],
    isLoading: fetching,
    error,
  } = usePermittedServers();

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

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "2rem",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "8rem",
            fontWeight: "bold",
            background: isDark
              ? "linear-gradient(135deg, #5865F2 0%, #4752C4 100%)"
              : "linear-gradient(135deg, #5865F2 0%, #4752C4 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            lineHeight: 1,
          }}
        >
          404
        </div>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "600",
              color: isDark ? "#fff" : "#000",
              margin: 0,
            }}
          >
            Unable to Load Servers
          </h1>
          <p
            style={{
              fontSize: "1rem",
              color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
              maxWidth: "500px",
              margin: 0,
            }}
          >
            We couldn&apos;t connect to the server. Please try again later.
          </p>
        </div>
        <button
          onClick={() => router.push("/")}
          style={{
            padding: "0.875rem 2rem",
            borderRadius: "10px",
            border: "none",
            background: isDark
              ? "linear-gradient(135deg, #5865F2 0%, #4752C4 100%)"
              : "linear-gradient(135deg, #5865F2 0%, #4752C4 100%)",
            color: "#fff",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: "0 4px 12px rgba(88, 101, 242, 0.3)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 6px 16px rgba(88, 101, 242, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(88, 101, 242, 0.3)";
          }}
        >
          Back to Home
        </button>
      </div>
    );
  }

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

      {servers.length === 0 && !fetching ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "4rem 2rem",
            textAlign: "center",
            gap: "1.5rem",
          }}
        >
          <div
            style={{
              fontSize: "4rem",
              opacity: 0.5,
            }}
          >
            🤖
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 600,
                color: isDark ? "#fff" : "#000",
                margin: 0,
              }}
            >
              No Servers Available
            </h2>
            <p
              style={{
                fontSize: "1rem",
                color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
                maxWidth: "500px",
                margin: 0,
              }}
            >
              The bot might be offline or you don&apos;t have any servers where
              the bot is present.
              <br />
              Please make sure the bot is running and invited to your server.
            </p>
          </div>
        </div>
      ) : (
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
      )}
    </div>
  );
}
