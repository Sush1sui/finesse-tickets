"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useTheme } from "next-themes";
import GuildSidebar from "@/components/guild-sidebar";

type Panel = {
  id: string;
  channel: string;
  title: string;
};

type MultiPanel = {
  id: string;
  channel: string;
  title: string;
};

export default function PanelsPage() {
  const params = useParams();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [guildName, setGuildName] = useState("Server Name");

  // Mock data
  const [panels] = useState<Panel[]>([
    { id: "1", channel: "#・┊create-a-ticket", title: "SERVER CONCERNS" },
    { id: "2", channel: "#・┊create-a-ticket", title: "PRIZE CLAIM" },
  ]);

  const [multiPanels] = useState<MultiPanel[]>([
    {
      id: "1",
      channel: "#・┊create-a-ticket",
      title: "Open ticket for staff support.",
    },
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;
  const guildId = useMemo(() => params?.guildId as string, [params?.guildId]);

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

  return (
    <div style={styles.container} className="guild-layout">
      <GuildSidebar guildId={guildId} guildName={guildName} />

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
          <p style={styles.subtitle}>Your Panels: {panels.length}/3</p>

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
                {panels.map((panel) => (
                  <tr key={panel.id}>
                    <td style={styles.td}>{panel.channel}</td>
                    <td style={styles.td}>{panel.title}</td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button
                          style={styles.actionButton}
                          onClick={() => handleEditPanel(panel.id)}
                        >
                          EDIT
                        </button>
                        <button style={styles.actionButton}>VIEW</button>
                        <button style={styles.actionButton}>DELETE</button>
                      </div>
                    </td>
                  </tr>
                ))}
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
                {multiPanels.map((panel) => (
                  <tr key={panel.id}>
                    <td style={styles.td}>{panel.channel}</td>
                    <td style={styles.td}>{panel.title}</td>
                    <td style={styles.td}>
                      <div
                        style={styles.actionButtons}
                        className="button-group"
                      >
                        <button style={styles.actionButton}>ADDON</button>
                        <button style={styles.actionButton}>VIEW</button>
                        <button style={styles.actionButton}>DELETE</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
