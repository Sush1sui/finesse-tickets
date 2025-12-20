"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useTheme } from "next-themes";
import GuildSidebar from "@/components/guild-sidebar";
import { Spinner } from "@/components/ui/spinner";

type Transcript = {
  _id: string;
  ticketId: string;
  ticketNumber: number;
  panelId: string;
  username: string;
  userId: string;
  createdAt: string;
  metadata: {
    ticketOpenedAt: string;
    ticketClosedAt: string;
    totalMessages: number;
    totalAttachments: number;
    closedBy: {
      username: string;
    };
  };
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export default function TranscriptsPage() {
  const params = useParams();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [guildName, setGuildName] = useState("Server Name");
  const [loading, setLoading] = useState(true);

  // Filter state
  const [ticketIdFilter, setTicketIdFilter] = useState("");
  const [usernameFilter, setUsernameFilter] = useState("");
  const [userIdFilter, setUserIdFilter] = useState("");
  const [panelFilter, setPanelFilter] = useState("");

  // Data state
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;
  const guildId = useMemo(() => params?.guildId as string, [params?.guildId]);

  const fetchTranscripts = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (ticketIdFilter) queryParams.set("ticketId", ticketIdFilter);
      if (usernameFilter) queryParams.set("username", usernameFilter);
      if (userIdFilter) queryParams.set("userId", userIdFilter);
      if (panelFilter) queryParams.set("panelId", panelFilter);
      queryParams.set("page", pagination.page.toString());
      queryParams.set("limit", pagination.limit.toString());

      const response = await fetch(
        `/api/dashboard/guild/${guildId}/transcripts?${queryParams.toString()}`
      );

      if (response.ok) {
        const data = await response.json();
        setTranscripts(data.transcripts);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching transcripts:", error);
    } finally {
      setLoading(false);
    }
  }, [
    guildId,
    ticketIdFilter,
    usernameFilter,
    userIdFilter,
    panelFilter,
    pagination.page,
    pagination.limit,
  ]);

  useEffect(() => {
    if (guildId) {
      fetchTranscripts();
    }
  }, [guildId]);

  const handleSearch = useCallback(() => {
    setPagination({ ...pagination, page: 1 });
    fetchTranscripts();
  }, [fetchTranscripts, pagination]);

  const handleViewTranscript = (transcriptId: string) => {
    router.push(`/dashboard/guild/${guildId}/transcripts/${transcriptId}`);
  };

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
      pagination: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "1rem",
        marginTop: "2rem",
      } as React.CSSProperties,
      paginationButton: {
        padding: "0.5rem 1rem",
        borderRadius: "6px",
        border: isDark
          ? "1px solid rgba(255,255,255,0.2)"
          : "1px solid rgba(0,0,0,0.2)",
        background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
        color: isDark ? "#fff" : "#000",
        cursor: "pointer",
        fontSize: "0.875rem",
      } as React.CSSProperties,
      paginationInfo: {
        fontSize: "0.875rem",
        opacity: 0.8,
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
            <label style={styles.label}>PANEL ID</label>
            <input
              type="text"
              value={panelFilter}
              onChange={(e) => setPanelFilter(e.target.value)}
              style={styles.input}
            />
          </div>

          <button style={styles.searchButton} onClick={handleSearch}>
            🔍 Search
          </button>
        </div>

        {/* Transcripts Table */}
        <div style={styles.transcriptsCard} className="transcripts-card">
          <h1 style={styles.title} className="page-title">
            Transcripts
          </h1>

          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "3rem",
              }}
            >
              <Spinner />
            </div>
          ) : (
            <>
              <div className="table-container">
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Ticket ID</th>
                      <th style={styles.th}>Username</th>
                      <th style={styles.th}>Messages</th>
                      <th style={styles.th}>Closed At</th>
                      <th style={styles.th}>Closed By</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transcripts.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          style={{ ...styles.td, textAlign: "center" }}
                        >
                          No transcripts found
                        </td>
                      </tr>
                    ) : (
                      transcripts.map((transcript) => (
                        <tr key={transcript._id}>
                          <td style={styles.td}>{transcript.ticketId}</td>
                          <td style={styles.td}>{transcript.username}</td>
                          <td style={styles.td}>
                            {transcript.metadata.totalMessages}
                          </td>
                          <td style={styles.td}>
                            {new Date(
                              transcript.metadata.ticketClosedAt
                            ).toLocaleDateString()}
                          </td>
                          <td style={styles.td}>
                            {transcript.metadata.closedBy.username}
                          </td>
                          <td style={styles.td}>
                            <button
                              style={styles.viewButton}
                              onClick={() =>
                                handleViewTranscript(transcript._id)
                              }
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div style={styles.pagination}>
                  <button
                    style={{
                      ...styles.paginationButton,
                      opacity: pagination.page === 1 ? 0.5 : 1,
                    }}
                    onClick={() =>
                      setPagination({
                        ...pagination,
                        page: pagination.page - 1,
                      })
                    }
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </button>
                  <span style={styles.paginationInfo}>
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    style={{
                      ...styles.paginationButton,
                      opacity: pagination.page === pagination.pages ? 0.5 : 1,
                    }}
                    onClick={() =>
                      setPagination({
                        ...pagination,
                        page: pagination.page + 1,
                      })
                    }
                    disabled={pagination.page === pagination.pages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
