"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useTheme } from "next-themes";
import GuildSidebar from "@/components/guild-sidebar";
import { Spinner } from "@/components/ui/spinner";
import { useGuildInfo, useGuildChannels } from "@/hooks/useGuildQueries";
import { useQueryClient } from "@tanstack/react-query";

type GuildData = {
  serverId: string;
  name: string;
  icon: string | null;
  ticketConfig: {
    ticketNameStyle: "num" | "name";
    ticketTranscript: string | null;
    maxTicketsPerUser: number;
    ticketPermissions: {
      attachments: boolean;
      links: boolean;
      reactions: boolean;
    };
    autoClose: {
      enabled: boolean;
      closeWhenUserLeaves: boolean;
      sinceOpenWithoutResponse: {
        Days: number;
        Hours: number;
        Minutes: number;
      };
      sinceLastResponse: {
        Days: number;
        Hours: number;
        Minutes: number;
      };
    };
  };
};

type Channel = {
  channelId: string;
  channelName: string;
};

export default function SettingsPage() {
  const params = useParams();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state - initialize as null/undefined to wait for server data
  const [ticketNameStyle, setTicketNameStyle] = useState<"num" | "name">("num");
  const [transcriptChannel, setTranscriptChannel] = useState("");
  const [maxTickets, setMaxTickets] = useState("1");
  const [attachFiles, setAttachFiles] = useState(false);
  const [embedLinks, setEmbedLinks] = useState(false);
  const [addReactions, setAddReactions] = useState(false);
  const [autoCloseEnabled, setAutoCloseEnabled] = useState(false);
  const [closeOnLeave, setCloseOnLeave] = useState(false);
  const [noResponseDays, setNoResponseDays] = useState("0");
  const [noResponseHours, setNoResponseHours] = useState("0");
  const [noResponseMinutes, setNoResponseMinutes] = useState("0");
  const [lastMessageDays, setLastMessageDays] = useState("0");
  const [lastMessageHours, setLastMessageHours] = useState("0");
  const [lastMessageMinutes, setLastMessageMinutes] = useState("0");

  const guildId = useMemo(() => params?.guildId as string, [params?.guildId]);

  // Use React Query hooks - data is cached!
  const queryClient = useQueryClient();
  const {
    data: guildData,
    isLoading: guildLoading,
    error: guildError,
  } = useGuildInfo(guildId);
  const { data: channelsData, isLoading: channelsLoading } =
    useGuildChannels(guildId);

  const channels = useMemo(() => channelsData || [], [channelsData]);
  const loading = guildLoading || channelsLoading;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load form state from guild data when it arrives
  useEffect(() => {
    if (!guildData) return;

    const guild = guildData as GuildData;

    // Load form state from guild data
    setTicketNameStyle(guild.ticketConfig.ticketNameStyle);
    setTranscriptChannel(guild.ticketConfig.ticketTranscript || "");
    setMaxTickets(guild.ticketConfig.maxTicketsPerUser.toString());
    setAttachFiles(guild.ticketConfig.ticketPermissions.attachments);
    setEmbedLinks(guild.ticketConfig.ticketPermissions.links);
    setAddReactions(guild.ticketConfig.ticketPermissions.reactions);
    setAutoCloseEnabled(guild.ticketConfig.autoClose.enabled);
    setCloseOnLeave(guild.ticketConfig.autoClose.closeWhenUserLeaves);
    setNoResponseDays(
      guild.ticketConfig.autoClose.sinceOpenWithoutResponse.Days.toString()
    );
    setNoResponseHours(
      guild.ticketConfig.autoClose.sinceOpenWithoutResponse.Hours.toString()
    );
    setNoResponseMinutes(
      guild.ticketConfig.autoClose.sinceOpenWithoutResponse.Minutes.toString()
    );
    setLastMessageDays(
      guild.ticketConfig.autoClose.sinceLastResponse.Days.toString()
    );
    setLastMessageHours(
      guild.ticketConfig.autoClose.sinceLastResponse.Hours.toString()
    );
    setLastMessageMinutes(
      guild.ticketConfig.autoClose.sinceLastResponse.Minutes.toString()
    );
  }, [guildData]);

  // Handle guild error
  useEffect(() => {
    if (guildError) {
      setError((guildError as Error)?.message || "Failed to load guild data");
    }
  }, [guildError]);

  const isDark = mounted ? resolvedTheme === "dark" : false;

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
      settingsCard: {
        padding: "2rem",
        border: isDark
          ? "2px solid rgba(255,255,255,0.1)"
          : "2px solid rgba(0,0,0,0.1)",
        borderRadius: "12px",
      } as React.CSSProperties,
      title: {
        fontSize: "1.875rem",
        fontWeight: "700",
        marginBottom: "2rem",
      } as React.CSSProperties,
      section: {
        marginBottom: "2rem",
      } as React.CSSProperties,
      sectionTitle: {
        fontSize: "1rem",
        fontWeight: "600",
        marginBottom: "1rem",
      } as React.CSSProperties,
      formGroup: {
        display: "flex",
        gap: "1rem",
        marginBottom: "1rem",
        alignItems: "center",
      } as React.CSSProperties,
      radioGroup: {
        display: "flex",
        gap: "1.5rem",
        alignItems: "center",
      } as React.CSSProperties,
      label: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        cursor: "pointer",
      } as React.CSSProperties,
      input: {
        padding: "0.5rem",
        borderRadius: "6px",
        border: isDark
          ? "1px solid rgba(255,255,255,0.2)"
          : "1px solid rgba(0,0,0,0.2)",
        background: isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.9)",
        color: isDark ? "#fff" : "#000",
        width: "100%",
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
      checkbox: {
        cursor: "pointer",
      } as React.CSSProperties,
      timeInputGroup: {
        display: "flex",
        gap: "0.5rem",
        alignItems: "center",
      } as React.CSSProperties,
      timeInput: {
        padding: "0.5rem",
        borderRadius: "6px",
        border: isDark
          ? "1px solid rgba(255,255,255,0.2)"
          : "1px solid rgba(0,0,0,0.2)",
        background: isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.9)",
        color: isDark ? "#fff" : "#000",
        width: "60px",
        textAlign: "center",
      } as React.CSSProperties,
      saveButton: {
        padding: "1rem 2rem",
        borderRadius: "8px",
        border: isDark
          ? "2px solid rgba(255,255,255,0.2)"
          : "2px solid rgba(0,0,0,0.2)",
        background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
        color: isDark ? "#fff" : "#000",
        fontSize: "1rem",
        fontWeight: "600",
        cursor: "pointer",
        width: "100%",
        transition: "all 0.2s",
      } as React.CSSProperties,
      successMessage: {
        padding: "1rem",
        borderRadius: "8px",
        background: isDark
          ? "rgba(34, 197, 94, 0.2)"
          : "rgba(34, 197, 94, 0.1)",
        border: isDark
          ? "2px solid rgba(34, 197, 94, 0.5)"
          : "2px solid rgba(34, 197, 94, 0.3)",
        color: isDark ? "#86efac" : "#15803d",
        marginBottom: "2rem",
        fontWeight: "500",
      } as React.CSSProperties,
      errorMessage: {
        padding: "1rem",
        borderRadius: "8px",
        background: isDark
          ? "rgba(239, 68, 68, 0.2)"
          : "rgba(239, 68, 68, 0.1)",
        border: isDark
          ? "2px solid rgba(239, 68, 68, 0.5)"
          : "2px solid rgba(239, 68, 68, 0.3)",
        color: isDark ? "#fca5a5" : "#991b1b",
        marginBottom: "2rem",
        fontWeight: "500",
      } as React.CSSProperties,
    }),
    [isDark]
  );

  const handleSave = useCallback(async () => {
    if (!guildId) return;

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/dashboard/guild/${guildId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketConfig: {
            ticketNameStyle: ticketNameStyle,
            ticketTranscript: transcriptChannel || null,
            maxTicketsPerUser: parseInt(maxTickets) || 0,
            ticketPermissions: {
              attachments: attachFiles,
              links: embedLinks,
              reactions: addReactions,
            },
            autoClose: {
              enabled: autoCloseEnabled,
              closeWhenUserLeaves: closeOnLeave,
              sinceOpenWithoutResponse: {
                Days: parseInt(noResponseDays) || 0,
                Hours: parseInt(noResponseHours) || 0,
                Minutes: parseInt(noResponseMinutes) || 0,
              },
              sinceLastResponse: {
                Days: parseInt(lastMessageDays) || 0,
                Hours: parseInt(lastMessageHours) || 0,
                Minutes: parseInt(lastMessageMinutes) || 0,
              },
            },
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save settings");
      }

      const data = await response.json();
      setSuccessMessage("Settings saved successfully!");

      // Invalidate guild data cache to refetch updated settings
      queryClient.invalidateQueries({ queryKey: ["guild-info", guildId] });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setError(
        error instanceof Error ? error.message : "Failed to save settings"
      );
    } finally {
      setSaving(false);
    }
  }, [
    guildId,
    ticketNameStyle,
    transcriptChannel,
    maxTickets,
    attachFiles,
    embedLinks,
    addReactions,
    autoCloseEnabled,
    closeOnLeave,
    noResponseDays,
    noResponseHours,
    noResponseMinutes,
    lastMessageDays,
    lastMessageHours,
    lastMessageMinutes,
  ]);

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
          Loading Settings Please Wait...
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

  if (!guildData) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p>No guild data found</p>
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

      <main style={styles.main}>
        <div style={styles.settingsCard} className="settings-card">
          <h1 style={styles.title} className="page-title">
            Settings
          </h1>

          {/* Success Message */}
          {successMessage && (
            <div style={styles.successMessage}>✓ {successMessage}</div>
          )}

          {/* Error Message */}
          {error && !loading && (
            <div style={styles.errorMessage}>✗ {error}</div>
          )}

          {/* Ticket Name Style */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle} className="section-title">
              Ticket Name Style
            </h2>
            <div style={styles.radioGroup}>
              <label style={styles.label}>
                <input
                  type="radio"
                  name="ticketNameStyle"
                  value="num"
                  checked={ticketNameStyle === "num"}
                  onChange={(e) =>
                    setTicketNameStyle(e.target.value as "num" | "name")
                  }
                  style={styles.checkbox}
                />
                By Number ( #ticket-0 )
              </label>
              <label style={styles.label}>
                <input
                  type="radio"
                  name="ticketNameStyle"
                  value="name"
                  checked={ticketNameStyle === "name"}
                  onChange={(e) =>
                    setTicketNameStyle(e.target.value as "num" | "name")
                  }
                  style={styles.checkbox}
                />
                By Name ( #ticket-sush1sui )
              </label>
            </div>
          </div>

          {/* Ticket Transcripts & Max Tickets */}
          <div style={styles.section}>
            <div style={styles.formGroup}>
              <div style={{ flex: 1 }}>
                <h2 style={styles.sectionTitle}>Ticket Transcripts</h2>
                <select
                  value={transcriptChannel}
                  onChange={(e) => setTranscriptChannel(e.target.value)}
                  style={styles.select}
                >
                  <option value="">None</option>
                  {channels.map((channel) => (
                    <option key={channel.channelId} value={channel.channelId}>
                      #{channel.channelName}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={styles.sectionTitle}>Max tickets per user</h2>
                <input
                  type="number"
                  value={maxTickets}
                  onChange={(e) => setMaxTickets(e.target.value)}
                  style={styles.input}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Ticket Permissions */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Ticket Permissions</h2>
            <div style={styles.radioGroup}>
              <label style={styles.label}>
                <input
                  type="checkbox"
                  checked={attachFiles}
                  onChange={(e) => setAttachFiles(e.target.checked)}
                  style={styles.checkbox}
                />
                🔗 Attach Files
              </label>
              <label style={styles.label}>
                <input
                  type="checkbox"
                  checked={embedLinks}
                  onChange={(e) => setEmbedLinks(e.target.checked)}
                  style={styles.checkbox}
                />
                👁️ Embed Links
              </label>
              <label style={styles.label}>
                <input
                  type="checkbox"
                  checked={addReactions}
                  onChange={(e) => setAddReactions(e.target.checked)}
                  style={styles.checkbox}
                />
                👥 Add Reactions
              </label>
            </div>
          </div>

          {/* Auto Close */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Auto Close</h2>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <input
                  type="checkbox"
                  checked={autoCloseEnabled}
                  onChange={(e) => setAutoCloseEnabled(e.target.checked)}
                  style={styles.checkbox}
                />
                Enabled
              </label>
              <label style={styles.label}>
                <input
                  type="checkbox"
                  checked={closeOnLeave}
                  onChange={(e) => setCloseOnLeave(e.target.checked)}
                  style={styles.checkbox}
                />
                Close when user leave
              </label>
            </div>

            <div style={styles.formGroup} className="form-row">
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                  Since open with no response
                </p>
                <div style={styles.timeInputGroup}>
                  <input
                    type="number"
                    value={noResponseDays}
                    onChange={(e) => setNoResponseDays(e.target.value)}
                    style={styles.timeInput}
                    placeholder="0"
                  />
                  <span>days</span>
                  <input
                    type="number"
                    value={noResponseHours}
                    onChange={(e) => setNoResponseHours(e.target.value)}
                    style={styles.timeInput}
                    placeholder="0"
                  />
                  <span>hours</span>
                  <input
                    type="number"
                    value={noResponseMinutes}
                    onChange={(e) => setNoResponseMinutes(e.target.value)}
                    style={styles.timeInput}
                    placeholder="0"
                  />
                  <span>min</span>
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                  Since last message
                </p>
                <div style={styles.timeInputGroup}>
                  <input
                    type="number"
                    value={lastMessageDays}
                    onChange={(e) => setLastMessageDays(e.target.value)}
                    style={styles.timeInput}
                    placeholder="0"
                  />
                  <span>days</span>
                  <input
                    type="number"
                    value={lastMessageHours}
                    onChange={(e) => setLastMessageHours(e.target.value)}
                    style={styles.timeInput}
                    placeholder="0"
                  />
                  <span>hours</span>
                  <input
                    type="number"
                    value={lastMessageMinutes}
                    onChange={(e) => setLastMessageMinutes(e.target.value)}
                    style={styles.timeInput}
                    placeholder="0"
                  />
                  <span>min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            style={{
              ...styles.saveButton,
              opacity: saving ? 0.6 : 1,
              cursor: saving ? "not-allowed" : "pointer",
            }}
            disabled={saving}
          >
            {saving ? "SAVING..." : "SAVE"}
          </button>
        </div>
      </main>
    </div>
  );
}
