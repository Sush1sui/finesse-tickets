"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useTheme } from "next-themes";
import GuildSidebar from "@/components/guild-sidebar";

export default function CreatePanelPage() {
  const params = useParams();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [guildName, setGuildName] = useState("Server Name");

  // Form state
  const [mentionOnOpen, setMentionOnOpen] = useState("");
  const [ticketCategory, setTicketCategory] = useState("");
  const [panelTitle, setPanelTitle] = useState("");
  const [panelContent, setPanelContent] = useState("");
  const [panelColor, setPanelColor] = useState("#00ff00");
  const [panelChannel, setPanelChannel] = useState("");
  const [buttonColor, setButtonColor] = useState("blue");
  const [buttonText, setButtonText] = useState("");
  const [customEmoji, setCustomEmoji] = useState(false);
  const [emojiValue, setEmojiValue] = useState("");
  const [largeImageUrl, setLargeImageUrl] = useState("");
  const [smallImageUrl, setSmallImageUrl] = useState("");

  // Welcome Message
  const [welcomeEmbedColor, setWelcomeEmbedColor] = useState("#00ff00");
  const [welcomeTitle, setWelcomeTitle] = useState("");
  const [welcomeTitleUrl, setWelcomeTitleUrl] = useState("");
  const [welcomeLargeImage, setWelcomeLargeImage] = useState("");
  const [welcomeSmallImage, setWelcomeSmallImage] = useState("");
  const [welcomeFooter, setWelcomeFooter] = useState("");
  const [welcomeFooterIcon, setWelcomeFooterIcon] = useState("");

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
      card: {
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
      formRow: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1.5rem",
        marginBottom: "1.5rem",
      } as React.CSSProperties,
      formGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
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
      textarea: {
        padding: "0.5rem",
        borderRadius: "6px",
        border: isDark
          ? "1px solid rgba(255,255,255,0.2)"
          : "1px solid rgba(0,0,0,0.2)",
        background: isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.9)",
        color: isDark ? "#fff" : "#000",
        minHeight: "100px",
        resize: "vertical",
        fontFamily: "inherit",
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
      colorInput: {
        padding: "0.5rem",
        borderRadius: "6px",
        border: isDark
          ? "1px solid rgba(255,255,255,0.2)"
          : "1px solid rgba(0,0,0,0.2)",
        background: isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.9)",
        cursor: "pointer",
        height: "40px",
      } as React.CSSProperties,
      checkboxGroup: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
      } as React.CSSProperties,
      section: {
        marginTop: "2rem",
        marginBottom: "1.5rem",
      } as React.CSSProperties,
      sectionTitle: {
        fontSize: "1rem",
        fontWeight: "600",
        marginBottom: "1rem",
        paddingBottom: "0.5rem",
        borderBottom: isDark
          ? "1px solid rgba(255,255,255,0.1)"
          : "1px solid rgba(0,0,0,0.1)",
      } as React.CSSProperties,
      createButton: {
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
        marginTop: "2rem",
      } as React.CSSProperties,
    }),
    [isDark]
  );

  const handleCreate = () => {
    console.log("Creating panel...");
    router.push(`/dashboard/guild/${guildId}/panels`);
  };

  return (
    <div style={styles.container} className="guild-layout">
      <GuildSidebar guildId={guildId} guildName={guildName} />

      <main style={styles.main}>
        <div style={styles.card} className="panel-card">
          <h1 style={styles.title} className="page-title">
            Create Panel
          </h1>

          {/* First Row */}
          <div style={styles.formRow} className="form-row">
            <div style={styles.formGroup}>
              <label style={styles.label}>MENTION ON OPEN</label>
              <select
                value={mentionOnOpen}
                onChange={(e) => setMentionOnOpen(e.target.value)}
                style={styles.select}
              >
                <option value="">Select roles...</option>
                <option value="role1">Role 1</option>
                <option value="role2">Role 2</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>TICKET CATEGORY</label>
              <select
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value)}
                style={styles.select}
              >
                <option value="">CATEGORY...</option>
                <option value="cat1">Category 1</option>
                <option value="cat2">Category 2</option>
              </select>
            </div>
          </div>

          {/* Second Row */}
          <div style={styles.formRow} className="form-row">
            <div style={styles.formGroup}>
              <label style={styles.label}>PANEL TITLE</label>
              <input
                type="text"
                value={panelTitle}
                onChange={(e) => setPanelTitle(e.target.value)}
                style={styles.input}
                placeholder="Open a ticket!"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>PANEL CONTENT</label>
              <textarea
                value={panelContent}
                onChange={(e) => setPanelContent(e.target.value)}
                style={styles.textarea}
                placeholder="By clicking a button, a ticket will be opened for you..."
              />
            </div>
          </div>

          {/* Third Row */}
          <div style={styles.formRow} className="form-row">
            <div style={styles.formGroup}>
              <label style={styles.label}>PANEL COLOR</label>
              <input
                type="color"
                value={panelColor}
                onChange={(e) => setPanelColor(e.target.value)}
                style={styles.colorInput}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>PANEL CHANNEL</label>
              <select
                value={panelChannel}
                onChange={(e) => setPanelChannel(e.target.value)}
                style={styles.select}
              >
                <option value="">ex: create-a-ticket</option>
                <option value="channel1">Channel 1</option>
                <option value="channel2">Channel 2</option>
              </select>
            </div>
          </div>

          {/* Fourth Row */}
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>BUTTON COLOR</label>
              <select
                value={buttonColor}
                onChange={(e) => setButtonColor(e.target.value)}
                style={styles.select}
              >
                <option value="blue">Blue</option>
                <option value="green">Green</option>
                <option value="red">Red</option>
                <option value="gray">Gray</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>BUTTON TEXT</label>
              <input
                type="text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                style={styles.input}
                placeholder="Open a ticket"
              />
            </div>
          </div>

          {/* Button Emoji */}
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>BUTTON EMOJI</label>
              <div style={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  checked={customEmoji}
                  onChange={(e) => setCustomEmoji(e.target.checked)}
                  style={{ cursor: "pointer" }}
                />
                <span>Custom Emoji</span>
                <input
                  type="text"
                  value={emojiValue}
                  onChange={(e) => setEmojiValue(e.target.value)}
                  style={{ ...styles.input, flex: 1 }}
                  placeholder="🎫"
                />
              </div>
            </div>
          </div>

          {/* Image URLs */}
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>LARGE IMAGE URL</label>
              <input
                type="text"
                value={largeImageUrl}
                onChange={(e) => setLargeImageUrl(e.target.value)}
                style={styles.input}
                placeholder="https://example/image.png"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>SMALL IMAGE URL</label>
              <input
                type="text"
                value={smallImageUrl}
                onChange={(e) => setSmallImageUrl(e.target.value)}
                style={styles.input}
                placeholder="https://example/image.png"
              />
            </div>
          </div>

          {/* Welcome Message Section */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>— Welcome Message —</h2>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>EMBED COLOR</label>
                <input
                  type="color"
                  value={welcomeEmbedColor}
                  onChange={(e) => setWelcomeEmbedColor(e.target.value)}
                  style={styles.colorInput}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>TITLE</label>
                <input
                  type="text"
                  value={welcomeTitle}
                  onChange={(e) => setWelcomeTitle(e.target.value)}
                  style={styles.input}
                  placeholder="Embed title"
                />
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>TITLE URL</label>
                <input
                  type="text"
                  value={welcomeTitleUrl}
                  onChange={(e) => setWelcomeTitleUrl(e.target.value)}
                  style={styles.input}
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>LARGE IMAGE URL</label>
                <input
                  type="text"
                  value={welcomeLargeImage}
                  onChange={(e) => setWelcomeLargeImage(e.target.value)}
                  style={styles.input}
                  placeholder="https://example/image.png"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>SMALL IMAGE URL</label>
                <input
                  type="text"
                  value={welcomeSmallImage}
                  onChange={(e) => setWelcomeSmallImage(e.target.value)}
                  style={styles.input}
                  placeholder="https://example/image.png"
                />
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>FOOTER TEXT</label>
                <input
                  type="text"
                  value={welcomeFooter}
                  onChange={(e) => setWelcomeFooter(e.target.value)}
                  style={styles.input}
                  placeholder="Footer Text"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>FOOTER ICON URL</label>
                <input
                  type="text"
                  value={welcomeFooterIcon}
                  onChange={(e) => setWelcomeFooterIcon(e.target.value)}
                  style={styles.input}
                  placeholder="https://example/image.png"
                />
              </div>
            </div>
          </div>

          {/* Create Button */}
          <button onClick={handleCreate} style={styles.createButton}>
            CREATE
          </button>
        </div>
      </main>
    </div>
  );
}
