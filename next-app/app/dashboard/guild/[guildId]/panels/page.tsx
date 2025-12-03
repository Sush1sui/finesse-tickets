"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useTheme } from "next-themes";
import GuildSidebar from "@/components/guild-sidebar";
import { Spinner } from "@/components/ui/spinner";

type Panel = {
  _id: string;
  channel: string;
  title: string;
  btnText: string;
  btnColor: string;
  btnEmoji: string | null;
};

type Channel = {
  channelId: string;
  channelName: string;
};

type GuildData = {
  serverId: string;
  name: string;
  icon: string | null;
};

export default function PanelsPage() {
  const params = useParams();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [guildData, setGuildData] = useState<GuildData | null>(null);
  const [panels, setPanels] = useState<Panel[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;
  const guildId = useMemo(() => params?.guildId as string, [params?.guildId]);

  useEffect(() => {
    if (!guildId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel for better performance
        const [guildResponse, channelsResponse, panelsResponse] =
          await Promise.all([
            fetch(`/api/dashboard/guild/${guildId}`),
            fetch(`/api/dashboard/guild/${guildId}/channels`),
            fetch(`/api/dashboard/guild/${guildId}/panels`),
          ]);

        if (!guildResponse.ok) {
          throw new Error("Failed to fetch guild data");
        }

        const [guild, channelsData, panelsData] = await Promise.all([
          guildResponse.json(),
          channelsResponse.ok ? channelsResponse.json() : [],
          panelsResponse.ok ? panelsResponse.json() : { panels: [] },
        ]);

        setGuildData(guild);
        setChannels(channelsData);
        setPanels(panelsData.panels || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [guildId]);

  // Helper function to get channel name from channel ID
  const getChannelName = useCallback(
    (channelId: string) => {
      const channel = channels.find((c) => c.channelId === channelId);
      return channel ? channel.channelName : channelId;
    },
    [channels]
  );

  const regularPanels = useMemo(
    () => panels.filter((p) => !p.btnText.includes("Multi")),
    [panels]
  );

  const multiPanels = useMemo(
    () => panels.filter((p) => p.btnText.includes("Multi")),
    [panels]
  );

  const handleNewPanel = useCallback(() => {
    router.push(`/dashboard/guild/${guildId}/panels/create`);
  }, [guildId, router]);

  const handleNewMultiPanel = useCallback(() => {
    router.push(`/dashboard/guild/${guildId}/panels/create-multi`);
  }, [guildId, router]);

  const handleEditPanel = useCallback(
    (panelId: string) => {
      router.push(`/dashboard/guild/${guildId}/panels/${panelId}/edit`);
    },
    [guildId, router]
  );

  const handleDeletePanel = useCallback(
    async (panelId: string) => {
      if (!confirm("Are you sure you want to delete this panel?")) return;

      try {
        const response = await fetch(
          `/api/dashboard/guild/${guildId}/panels/${panelId}`,
          { method: "DELETE" }
        );

        if (!response.ok) {
          throw new Error("Failed to delete panel");
        }

        // Remove from local state
        setPanels((prev) => prev.filter((p) => p._id !== panelId));
      } catch (error) {
        console.error("Error deleting panel:", error);
        alert("Failed to delete panel");
      }
    },
    [guildId]
  );

  const styles = useMemo(
    () => ({
      container: {
        minHeight: "60vh",
        display: "flex",
        gap: "2rem",
        padding: "1rem",
      } as React.CSSProperties,
      main: {
        flex: 1,
        display: "flex",
        gap: "2rem",
      } as React.CSSProperties,
      panelSection: {
        flex: 1,
        padding: "2rem",
        border: isDark
          ? "2px solid rgba(255,255,255,0.1)"
          : "2px solid rgba(0,0,0,0.1)",
        borderRadius: "12px",
      } as React.CSSProperties,
      header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1.5rem",
      } as React.CSSProperties,
      title: {
        fontSize: "1.5rem",
        fontWeight: "700",
      } as React.CSSProperties,
      subtitle: {
        fontSize: "0.875rem",
        opacity: 0.7,
        marginBottom: "1.5rem",
      } as React.CSSProperties,
      newButton: {
        padding: "0.5rem 1rem",
        borderRadius: "6px",
        border: isDark
          ? "2px solid rgba(255,255,255,0.2)"
          : "2px solid rgba(0,0,0,0.2)",
        background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
        color: isDark ? "#fff" : "#000",
        fontSize: "0.875rem",
        fontWeight: "600",
        cursor: "pointer",
      } as React.CSSProperties,
      table: {
        width: "100%",
        borderCollapse: "collapse",
      } as React.CSSProperties,
      th: {
        textAlign: "left",
        padding: "0.75rem",
        borderBottom: isDark
          ? "1px solid rgba(255,255,255,0.1)"
          : "1px solid rgba(0,0,0,0.1)",
        fontSize: "0.875rem",
        fontWeight: "600",
      } as React.CSSProperties,
      td: {
        padding: "0.75rem",
        borderBottom: isDark
          ? "1px solid rgba(255,255,255,0.05)"
          : "1px solid rgba(0,0,0,0.05)",
      } as React.CSSProperties,
      actionButtons: {
        display: "flex",
        gap: "0.5rem",
      } as React.CSSProperties,
      actionButton: {
        padding: "0.25rem 0.75rem",
        borderRadius: "4px",
        border: isDark
          ? "1px solid rgba(255,255,255,0.2)"
          : "1px solid rgba(0,0,0,0.2)",
        background: "transparent",
        color: isDark ? "#fff" : "#000",
        fontSize: "0.75rem",
        cursor: "pointer",
      } as React.CSSProperties,
    }),
    [isDark]
  );

  if (loading || !guildData) {
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
          Loading Panels Please Wait...
        </h2>
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
        }}
      >
        <p style={{ color: "red" }}>Error: {error}</p>
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container} className="guild-layout">
      <GuildSidebar
        guildId={guildId}
        guildName={guildData.name}
        guildIcon={guildData.icon || undefined}
      />

      <main style={styles.main} className="panels-grid">
        {/* Ticket Panels */}
        <div style={styles.panelSection} className="panel-card">
          <div style={styles.header} className="section-header">
            <h1 style={styles.title} className="page-title">
              Ticket Panels
            </h1>
            <button style={styles.newButton} onClick={handleNewPanel}>
              + New Panel
            </button>
          </div>
          <p style={styles.subtitle}>Your Panels: {regularPanels.length}/3</p>

          <div className="table-container">
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Channel</th>
                  <th style={styles.th}>Panel Title</th>
                  <th style={styles.th}></th>
                </tr>
              </thead>
              <tbody>
                {regularPanels.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      style={{
                        ...styles.td,
                        textAlign: "center",
                        opacity: 0.6,
                      }}
                    >
                      No panels created yet. Click &quot;+ New Panel&quot; to
                      create one.
                    </td>
                  </tr>
                ) : (
                  regularPanels.map((panel) => (
                    <tr key={panel._id}>
                      <td style={styles.td}>
                        #{getChannelName(panel.channel)}
                      </td>
                      <td style={styles.td}>{panel.title}</td>
                      <td style={styles.td}>
                        <div style={styles.actionButtons}>
                          <button
                            style={styles.actionButton}
                            onClick={() => handleEditPanel(panel._id)}
                          >
                            EDIT
                          </button>
                          <button style={styles.actionButton}>VIEW</button>
                          <button
                            style={styles.actionButton}
                            onClick={() => handleDeletePanel(panel._id)}
                          >
                            DELETE
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Multi-Panels */}
        <div style={styles.panelSection} className="panel-card">
          <div style={styles.header} className="section-header">
            <h1 style={styles.title} className="page-title">
              Multi-Panels
            </h1>
            <button style={styles.newButton} onClick={handleNewMultiPanel}>
              + New Multi Panel
            </button>
          </div>

          <div className="table-container">
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Channel</th>
                  <th style={styles.th}>Panel Title</th>
                  <th style={styles.th}></th>
                </tr>
              </thead>
              <tbody>
                {multiPanels.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      style={{
                        ...styles.td,
                        textAlign: "center",
                        opacity: 0.6,
                      }}
                    >
                      No multi-panels created yet.
                    </td>
                  </tr>
                ) : (
                  multiPanels.map((panel) => (
                    <tr key={panel._id}>
                      <td style={styles.td}>
                        #{getChannelName(panel.channel)}
                      </td>
                      <td style={styles.td}>{panel.title}</td>
                      <td style={styles.td}>
                        <div
                          style={styles.actionButtons}
                          className="button-group"
                        >
                          <button style={styles.actionButton}>ADDON</button>
                          <button style={styles.actionButton}>VIEW</button>
                          <button
                            style={styles.actionButton}
                            onClick={() => handleDeletePanel(panel._id)}
                          >
                            DELETE
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
