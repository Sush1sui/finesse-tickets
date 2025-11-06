"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useTheme } from "next-themes";
import GuildSidebar from "@/components/guild-sidebar";

type Transcript = {
  id: string;
  ticketId: string;
  panel: string;
  username: string;
  createdAt: string;
};

export default function TranscriptsPage() {
  const params = useParams();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [guildName, setGuildName] = useState("Server Name");

  // Filter state
  const [ticketIdFilter, setTicketIdFilter] = useState("");
  const [usernameFilter, setUsernameFilter] = useState("");
  const [userIdFilter, setUserIdFilter] = useState("");
  const [panelFilter, setPanelFilter] = useState("");

  // Mock data
  const [transcripts] = useState<Transcript[]>([
    {
      id: "1",
      ticketId: "0",
      panel: "Panel Name",
      username: "Sush1sui",
      createdAt: "2025-11-03",
    },
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;
  const guildId = useMemo(() => params?.guildId as string, [params?.guildId]);

  const handleSearch = useCallback(() => {
    // TODO: Implement search functionality
    console.log("Searching with filters:", {
      ticketIdFilter,
      usernameFilter,
      userIdFilter,
      panelFilter,
    });
  }, [ticketIdFilter, usernameFilter, userIdFilter, panelFilter]);

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
      } as React.CSSProperties,
      filterCard: {
        padding: "1.5rem",
        border: isDark
          ? "2px solid rgba(255,255,255,0.1)"
          : "2px solid rgba(0,0,0,0.1)",
        borderRadius: "12px",
        marginBottom: "2rem",
        display: "flex",
        alignItems: "flex-end",
        gap: "1rem",
        flexWrap: "wrap",
      } as React.CSSProperties,
      filterTitle: {
        fontSize: "1.25rem",
        fontWeight: "600",
        marginBottom: "1rem",
        width: "100%",
      } as React.CSSProperties,
      filterGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        flex: 1,
        minWidth: "150px",
      } as React.CSSProperties,
      label: {
        fontSize: "0.75rem",
        fontWeight: "600",
        textTransform: "uppercase",
        opacity: 0.7,
      } as React.CSSProperties,
      input: {
        padding: "0.5rem",
        borderRadius: "6px",
        border: isDark
          ? "1px solid rgba(255,255,255,0.2)"
          : "1px solid rgba(0,0,0,0.2)",
        background: isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.9)",
        color: isDark ? "#fff" : "#000",
      } as React.CSSProperties,
      select: {
        padding: "0.5rem",
        borderRadius: "6px",
        border: isDark
          ? "1px solid rgba(255,255,255,0.2)"
          : "1px solid rgba(0,0,0,0.2)",
        background: isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.9)",
        color: isDark ? "#fff" : "#000",
        cursor: "pointer",
      } as React.CSSProperties,
      searchButton: {
        padding: "0.5rem 1.5rem",
        borderRadius: "6px",
        border: isDark
          ? "2px solid rgba(255,255,255,0.2)"
          : "2px solid rgba(0,0,0,0.2)",
        background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
        color: isDark ? "#fff" : "#000",
        fontSize: "0.875rem",
        fontWeight: "600",
        cursor: "pointer",
        height: "fit-content",
      } as React.CSSProperties,
      transcriptsCard: {
        padding: "2rem",
        border: isDark
          ? "2px solid rgba(255,255,255,0.1)"
          : "2px solid rgba(0,0,0,0.1)",
        borderRadius: "12px",
        minHeight: "400px",
      } as React.CSSProperties,
      title: {
        fontSize: "1.875rem",
        fontWeight: "700",
        marginBottom: "2rem",
      } as React.CSSProperties,
      table: {
        width: "100%",
        borderCollapse: "collapse",
      } as React.CSSProperties,
      th: {
        textAlign: "left",
        padding: "1rem",
        borderBottom: isDark
          ? "1px solid rgba(255,255,255,0.1)"
          : "1px solid rgba(0,0,0,0.1)",
        fontSize: "0.875rem",
        fontWeight: "600",
      } as React.CSSProperties,
      td: {
        padding: "1rem",
        borderBottom: isDark
          ? "1px solid rgba(255,255,255,0.05)"
          : "1px solid rgba(0,0,0,0.05)",
      } as React.CSSProperties,
      viewButton: {
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

      <main style={styles.main}>
        {/* Filter Section */}
        <div style={styles.filterCard} className="filter-card">
          <h2 style={styles.filterTitle} className="section-title">
            🔽 Filter
          </h2>

          <div style={styles.filterGroup}>
            <label style={styles.label}>TICKET ID</label>
            <input
              type="text"
              value={ticketIdFilter}
              onChange={(e) => setTicketIdFilter(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.label}>USERNAME</label>
            <input
              type="text"
              value={usernameFilter}
              onChange={(e) => setUsernameFilter(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.label}>USER ID</label>
            <input
              type="text"
              value={userIdFilter}
              onChange={(e) => setUserIdFilter(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.label}>PANEL</label>
            <select
              value={panelFilter}
              onChange={(e) => setPanelFilter(e.target.value)}
              style={styles.select}
            >
              <option value="">All</option>
              <option value="panel1">Panel 1</option>
              <option value="panel2">Panel 2</option>
            </select>
          </div>

          <button style={styles.searchButton} onClick={handleSearch}>
            🔍
          </button>
        </div>

        {/* Transcripts Table */}
        <div style={styles.transcriptsCard} className="transcripts-card">
          <h1 style={styles.title} className="page-title">
            Transcripts
          </h1>

          <div className="table-container">
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Ticket ID</th>
                  <th style={styles.th}>Panel</th>
                  <th style={styles.th}>Username</th>
                  <th style={styles.th}>Transcripts</th>
                </tr>
              </thead>
              <tbody>
                {transcripts.map((transcript) => (
                  <tr key={transcript.id}>
                    <td style={styles.td}>{transcript.ticketId}</td>
                    <td style={styles.td}>{transcript.panel}</td>
                    <td style={styles.td}>{transcript.username}</td>
                    <td style={styles.td}>
                      <button style={styles.viewButton}>view</button>
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
