"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useTheme } from "next-themes";
import { Spinner } from "@/components/ui/spinner";

export default function GuildDashboard() {
  const params = useParams();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const guildId = useMemo(() => params?.guildId as string, [params?.guildId]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;

  useEffect(() => {
    // Auto-redirect to settings page
    if (guildId) {
      router.push(`/dashboard/guild/${guildId}/settings`);
    }
  }, [guildId, router]);

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
        Redirecting...
      </h2>
      <Spinner />
    </div>
  );
}
