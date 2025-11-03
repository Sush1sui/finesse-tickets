"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GuildDashboard() {
  const params = useParams();
  const router = useRouter();
  const guildId = params?.guildId as string;

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
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <p style={{ fontSize: "1rem", opacity: 0.7 }}>Redirecting...</p>
    </div>
  );
}
