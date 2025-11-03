"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useTheme } from "next-themes";
import GuildSidebar from "@/components/guild-sidebar";

export default function SettingsPage() {
  const params = useParams();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [guildName, setGuildName] = useState("Server Name");

  // Form state
  const [ticketNameStyle, setTicketNameStyle] = useState("number");
  const [transcriptChannel, setTranscriptChannel] = useState("");
  const [maxTickets, setMaxTickets] = useState("");
  const [attachFiles, setAttachFiles] = useState(false);
  const [embedLinks, setEmbedLinks] = useState(false);
  const [addReactions, setAddReactions] = useState(false);
  const [autoCloseEnabled, setAutoCloseEnabled] = useState(false);
  const [closeOnLeave, setCloseOnLeave] = useState(false);
  const [noResponseDays, setNoResponseDays] = useState("");
  const [noResponseHours, setNoResponseHours] = useState("");
  const [noResponseMinutes, setNoResponseMinutes] = useState("");
  const [lastMessageDays, setLastMessageDays] = useState("");
  const [lastMessageHours, setLastMessageHours] = useState("");
  const [lastMessageMinutes, setLastMessageMinutes] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;
  const guildId = params?.guildId as string;

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
    }),
    [isDark]
  );

  const handleSave = () => {
    console.log("Saving settings...");
  };

  return (
    <div style={styles.container} className="guild-layout">
      <GuildSidebar guildId={guildId} guildName={guildName} />

      <main style={styles.main}>
        <div style={styles.settingsCard} className="settings-card">
          <h1 style={styles.title} className="page-title">
            Settings
          </h1>

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
                  value="number"
                  checked={ticketNameStyle === "number"}
                  onChange={(e) => setTicketNameStyle(e.target.value)}
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
                  onChange={(e) => setTicketNameStyle(e.target.value)}
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
                  <option value="">Dropdown...</option>
                  <option value="channel1">Channel 1</option>
                  <option value="channel2">Channel 2</option>
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
                ☑ Enabled
              </label>
              <label style={styles.label}>
                <input
                  type="checkbox"
                  checked={closeOnLeave}
                  onChange={(e) => setCloseOnLeave(e.target.checked)}
                  style={styles.checkbox}
                />
                ☑ Close when user leave
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
          <button onClick={handleSave} style={styles.saveButton}>
            SAVE
          </button>
        </div>
      </main>
    </div>
  );
}
