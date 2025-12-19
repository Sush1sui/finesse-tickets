"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useTheme } from "next-themes";
import { useQueryClient } from "@tanstack/react-query";
import GuildSidebar from "@/components/guild-sidebar";
import { Spinner } from "@/components/ui/spinner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/toast";
import {
  usePanels,
  useDeletePanel,
  useSendPanel,
  useGuildInfo,
  useGuildChannels,
  useMultiPanel,
} from "@/hooks/useGuildQueries";

type MultiPanel = {
  channel: string | null;
  panels: string[];
  messageEmbedConfig: {
    title: string;
    description: string;
  };
};

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
  const toast = useToast();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });

  // Loading states for each action
  const [sendingPanelId, setSendingPanelId] = useState<string | null>(null);
  const [deletingPanelId, setDeletingPanelId] = useState<string | null>(null);
  const [sendingMultiPanel, setSendingMultiPanel] = useState(false);
  const [deletingMultiPanel, setDeletingMultiPanel] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;
  const guildId = useMemo(() => params?.guildId as string, [params?.guildId]);

  // Use React Query hooks - ALL data is cached and shared across pages!
  const {
    data: guildData,
    isLoading: guildLoading,
    error: guildError,
  } = useGuildInfo(guildId);
  const { data: channelsData, isLoading: channelsLoading } =
    useGuildChannels(guildId);
  const {
    data: panelsData,
    isLoading: panelsLoading,
    error: panelsError,
  } = usePanels(guildId);
  const deletePanelMutation = useDeletePanel(guildId);
  const sendPanelMutation = useSendPanel(guildId);
  const {
    data: multiPanel,
    isLoading: multiPanelLoading,
    error: multiPanelError,
  } = useMultiPanel(guildId);

  // Extract data from React Query
  const panels = useMemo(() => panelsData || [], [panelsData]);
  const channels = useMemo(() => channelsData || [], [channelsData]);
  const loading = guildLoading || channelsLoading || panelsLoading;
  const error = guildError || panelsError;

  // Helper function to get channel name from channel ID
  const getChannelName = useCallback(
    (channelId: string) => {
      const channel = channels.find((c) => c.channelId === channelId);
      return channel ? channel.channelName : channelId;
    },
    [channels]
  );

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number = 30) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const regularPanels = panels;

  const handleNewPanel = useCallback(() => {
    router.push(`/dashboard/guild/${guildId}/panels/create`);
  }, [guildId, router]);

  const handleNewMultiPanel = useCallback(() => {
    router.push(`/dashboard/guild/${guildId}/panels/multi-create`);
  }, [guildId, router]);

  const handleEditMultiPanel = useCallback(() => {
    router.push(`/dashboard/guild/${guildId}/panels/multi-edit`);
  }, [guildId, router]);

  const handleSendMultiPanel = useCallback(async () => {
    setConfirmDialog({
      isOpen: true,
      title: "Send Multi-Panel",
      message: "Are you sure you want to send this multi-panel to Discord?",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        setSendingMultiPanel(true);
        try {
          const response = await fetch(
            `/api/dashboard/guild/${guildId}/multi-panel/send`,
            {
              method: "POST",
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to send multi-panel");
          }

          toast.success("Multi-panel sent successfully!");
        } catch (error) {
          console.error("Error sending multi-panel:", error);
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to send multi-panel"
          );
        } finally {
          setSendingMultiPanel(false);
        }
      },
    });
  }, [guildId, toast]);

  const handleDeleteMultiPanel = useCallback(async () => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Multi-Panel",
      message:
        "Are you sure you want to delete this multi-panel? This action cannot be undone.",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        setDeletingMultiPanel(true);
        try {
          const response = await fetch(
            `/api/dashboard/guild/${guildId}/multi-panel`,
            {
              method: "DELETE",
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to delete multi-panel");
          }

          // Invalidate multi-panel query to refetch
          queryClient.invalidateQueries({ queryKey: ["multi-panel", guildId] });
          toast.success("Multi-panel deleted successfully");
        } catch (error) {
          console.error("Error deleting multi-panel:", error);
          toast.error("Failed to delete multi-panel");
        } finally {
          setDeletingMultiPanel(false);
        }
      },
    });
  }, [guildId, toast, queryClient]);

  const handleEditPanel = useCallback(
    (panelId: string) => {
      router.push(`/dashboard/guild/${guildId}/panels/${panelId}/edit`);
    },
    [guildId, router]
  );

  const handleDeletePanel = useCallback(
    async (panelId: string) => {
      setConfirmDialog({
        isOpen: true,
        title: "Delete Panel",
        message:
          "Are you sure you want to delete this panel? This action cannot be undone.",
        onConfirm: async () => {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          setDeletingPanelId(panelId);
          try {
            await deletePanelMutation.mutateAsync(panelId);
            toast.success("Panel deleted successfully");
          } catch (error) {
            console.error("Error deleting panel:", error);
            toast.error("Failed to delete panel");
          } finally {
            setDeletingPanelId(null);
          }
        },
      });
    },
    [deletePanelMutation, toast]
  );

  const handleSendPanel = useCallback(
    async (panelId: string) => {
      setConfirmDialog({
        isOpen: true,
        title: "Send Panel",
        message: "Are you sure you want to send this panel to Discord?",
        onConfirm: async () => {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          setSendingPanelId(panelId);
          try {
            await sendPanelMutation.mutateAsync(panelId);
            toast.success("Panel sent successfully!");
          } catch (error) {
            console.error("Error sending panel:", error);
            toast.error(
              error instanceof Error ? error.message : "Failed to send panel"
            );
          } finally {
            setSendingPanelId(null);
          }
        },
      });
    },
    [sendPanelMutation, toast]
  );

  const styles = useMemo(
    () => ({
      container: {
        minHeight: "100vh",
        display: "flex",
        flexDirection: "row",
        gap: "1.5rem",
        padding: "1.5rem",
        maxWidth: "1600px",
        margin: "0 auto",
      } as React.CSSProperties,
      main: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        minWidth: 0,
      } as React.CSSProperties,
      panelSection: {
        background: isDark ? "rgba(255,255,255,0.02)" : "#ffffff",
        border: isDark
          ? "1px solid rgba(255,255,255,0.08)"
          : "1px solid rgba(0,0,0,0.08)",
        borderRadius: "16px",
        padding: "2rem",
        boxShadow: isDark
          ? "0 4px 6px rgba(0,0,0,0.2)"
          : "0 2px 8px rgba(0,0,0,0.04)",
      } as React.CSSProperties,
      header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "2rem",
        gap: "1rem",
        flexWrap: "wrap",
      } as React.CSSProperties,
      title: {
        fontSize: "1.75rem",
        fontWeight: "600",
        letterSpacing: "-0.02em",
        backgroundImage: isDark
          ? "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)"
          : "linear-gradient(135deg, #000 0%, rgba(0,0,0,0.7) 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      } as React.CSSProperties,
      subtitle: {
        fontSize: "0.875rem",
        opacity: 0.6,
        marginBottom: "1.5rem",
        fontWeight: "400",
      } as React.CSSProperties,
      newButton: {
        padding: "0.75rem 1.5rem",
        borderRadius: "10px",
        border: "none",
        background: isDark
          ? "linear-gradient(135deg, #5865F2 0%, #4752C4 100%)"
          : "linear-gradient(135deg, #5865F2 0%, #4752C4 100%)",
        color: "#fff",
        fontSize: "0.875rem",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: "0 2px 8px rgba(88, 101, 242, 0.3)",
      } as React.CSSProperties,
      table: {
        width: "100%",
        borderCollapse: "separate",
        borderSpacing: "0",
      } as React.CSSProperties,
      th: {
        textAlign: "left",
        padding: "1rem",
        fontSize: "0.75rem",
        fontWeight: "600",
        letterSpacing: "0.05em",
        opacity: 0.7,
        borderBottom: isDark
          ? "2px solid rgba(255,255,255,0.08)"
          : "2px solid rgba(0,0,0,0.08)",
      } as React.CSSProperties,
      td: {
        padding: "1.25rem 1rem",
        borderBottom: isDark
          ? "1px solid rgba(255,255,255,0.04)"
          : "1px solid rgba(0,0,0,0.04)",
        fontSize: "0.9375rem",
        fontWeight: "500",
      } as React.CSSProperties,
      actionButtons: {
        display: "flex",
        gap: "0.5rem",
        flexWrap: "wrap",
      } as React.CSSProperties,
      actionButton: {
        padding: "0.5rem 1rem",
        borderRadius: "8px",
        border: "none",
        background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
        color: isDark ? "#fff" : "#000",
        fontSize: "0.8125rem",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s ease",
        whiteSpace: "nowrap",
      } as React.CSSProperties,
      truncate: {
        maxWidth: "250px",
        overflow: "hidden",
        whiteSpace: "nowrap",
      } as React.CSSProperties,
      emptyState: {
        padding: "3rem 1rem",
        textAlign: "center",
        opacity: 0.5,
        fontSize: "0.9375rem",
      } as React.CSSProperties,
    }),
    [isDark]
  );

  if (loading || panelsLoading || !guildData) {
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

  if (error || panelsError) {
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
            Server Not Found
          </h1>
          <p
            style={{
              fontSize: "1rem",
              color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
              maxWidth: "500px",
              margin: 0,
            }}
          >
            The server you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have access to it.
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
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
                  <th style={styles.th}>Panel Title</th>
                  <th style={styles.th}>Channel</th>
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
                      <td
                        style={{ ...styles.td, ...styles.truncate }}
                        title={panel.title}
                      >
                        {truncateText(panel.title)}
                      </td>
                      <td
                        style={{ ...styles.td, ...styles.truncate }}
                        title={getChannelName(panel.channel)}
                      >
                        #{truncateText(getChannelName(panel.channel), 20)}
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actionButtons}>
                          <button
                            style={{
                              ...styles.actionButton,
                              opacity:
                                sendingPanelId ||
                                deletingPanelId ||
                                sendingMultiPanel ||
                                deletingMultiPanel
                                  ? 0.5
                                  : 1,
                              cursor:
                                sendingPanelId ||
                                deletingPanelId ||
                                sendingMultiPanel ||
                                deletingMultiPanel
                                  ? "not-allowed"
                                  : "pointer",
                            }}
                            onClick={() => handleEditPanel(panel._id)}
                            disabled={
                              !!(
                                sendingPanelId ||
                                deletingPanelId ||
                                sendingMultiPanel ||
                                deletingMultiPanel
                              )
                            }
                          >
                            EDIT
                          </button>
                          <button
                            style={{
                              ...styles.actionButton,
                              opacity:
                                sendingPanelId ||
                                deletingPanelId ||
                                sendingMultiPanel ||
                                deletingMultiPanel
                                  ? 0.5
                                  : 1,
                              cursor:
                                sendingPanelId ||
                                deletingPanelId ||
                                sendingMultiPanel ||
                                deletingMultiPanel
                                  ? "not-allowed"
                                  : "pointer",
                            }}
                            onClick={() => handleSendPanel(panel._id)}
                            disabled={
                              !!(
                                sendingPanelId ||
                                deletingPanelId ||
                                sendingMultiPanel ||
                                deletingMultiPanel
                              )
                            }
                          >
                            {sendingPanelId === panel._id
                              ? "SENDING..."
                              : "SEND"}
                          </button>
                          <button
                            style={{
                              ...styles.actionButton,
                              opacity:
                                sendingPanelId ||
                                deletingPanelId ||
                                sendingMultiPanel ||
                                deletingMultiPanel
                                  ? 0.5
                                  : 1,
                              cursor:
                                sendingPanelId ||
                                deletingPanelId ||
                                sendingMultiPanel ||
                                deletingMultiPanel
                                  ? "not-allowed"
                                  : "pointer",
                            }}
                            onClick={() => handleDeletePanel(panel._id)}
                            disabled={
                              !!(
                                sendingPanelId ||
                                deletingPanelId ||
                                sendingMultiPanel ||
                                deletingMultiPanel
                              )
                            }
                          >
                            {deletingPanelId === panel._id
                              ? "DELETING..."
                              : "DELETE"}
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
                  <th style={styles.th}>Panel Title</th>
                  <th style={styles.th}>Channel</th>
                  <th style={styles.th}></th>
                </tr>
              </thead>
              <tbody>
                {!multiPanel || !multiPanel.channel ? (
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
                  <tr>
                    <td
                      style={{ ...styles.td, ...styles.truncate }}
                      title={
                        multiPanel?.messageEmbedConfig?.title ||
                        `Multi-Panel (${multiPanel.panels.length} panels)`
                      }
                    >
                      {truncateText(
                        multiPanel?.messageEmbedConfig?.title ||
                          `Multi-Panel (${multiPanel.panels.length} panels)`
                      )}
                    </td>
                    <td
                      style={{ ...styles.td, ...styles.truncate }}
                      title={getChannelName(multiPanel.channel)}
                    >
                      #{truncateText(getChannelName(multiPanel.channel), 20)}
                    </td>
                    <td style={styles.td}>
                      <div
                        style={styles.actionButtons}
                        className="button-group"
                      >
                        <button
                          style={{
                            ...styles.actionButton,
                            opacity:
                              sendingPanelId ||
                              deletingPanelId ||
                              sendingMultiPanel ||
                              deletingMultiPanel
                                ? 0.5
                                : 1,
                            cursor:
                              sendingPanelId ||
                              deletingPanelId ||
                              sendingMultiPanel ||
                              deletingMultiPanel
                                ? "not-allowed"
                                : "pointer",
                          }}
                          onClick={handleEditMultiPanel}
                          disabled={
                            !!(
                              sendingPanelId ||
                              deletingPanelId ||
                              sendingMultiPanel ||
                              deletingMultiPanel
                            )
                          }
                        >
                          EDIT
                        </button>
                        <button
                          style={{
                            ...styles.actionButton,
                            opacity:
                              sendingPanelId ||
                              deletingPanelId ||
                              sendingMultiPanel ||
                              deletingMultiPanel
                                ? 0.5
                                : 1,
                            cursor:
                              sendingPanelId ||
                              deletingPanelId ||
                              sendingMultiPanel ||
                              deletingMultiPanel
                                ? "not-allowed"
                                : "pointer",
                          }}
                          onClick={handleSendMultiPanel}
                          disabled={
                            !!(
                              sendingPanelId ||
                              deletingPanelId ||
                              sendingMultiPanel ||
                              deletingMultiPanel
                            )
                          }
                        >
                          {sendingMultiPanel ? "SENDING..." : "SEND"}
                        </button>
                        <button
                          style={{
                            ...styles.actionButton,
                            opacity:
                              sendingPanelId ||
                              deletingPanelId ||
                              sendingMultiPanel ||
                              deletingMultiPanel
                                ? 0.5
                                : 1,
                            cursor:
                              sendingPanelId ||
                              deletingPanelId ||
                              sendingMultiPanel ||
                              deletingMultiPanel
                                ? "not-allowed"
                                : "pointer",
                          }}
                          onClick={handleDeleteMultiPanel}
                          disabled={
                            !!(
                              sendingPanelId ||
                              deletingPanelId ||
                              sendingMultiPanel ||
                              deletingMultiPanel
                            )
                          }
                        >
                          {deletingMultiPanel ? "DELETING..." : "DELETE"}
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() =>
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
        }
        confirmText="OK"
        cancelText="Cancel"
        isDark={isDark}
      />

      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  );
}
