"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useTheme } from "next-themes";
import GuildSidebar from "@/components/guild-sidebar";
import EmojiPicker from "@/components/emoji-picker";
import { ToastContainer } from "@/components/ui/toast";
import { useToast } from "@/hooks/useToast";
import {
  useGuildData,
  useGuildEmojis,
  useCreatePanel,
} from "@/hooks/useGuildQueries";

type CustomEmoji = {
  emojiId: string;
  emojiName: string;
  emojiAnimated: boolean;
  emojiUrl: string;
  emojiFormat: string;
};

type Role = {
  roleId: string;
  roleName: string;
};

type Category = {
  categoryId: string;
  categoryName: string;
};

type Channel = {
  channelId: string;
  channelName: string;
};

export default function CreatePanelPage() {
  const params = useParams();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { toasts, success, error, removeToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [creating, setCreating] = useState(false);
  const [guildName, setGuildName] = useState("Server Name");

  // Form state
  const [mentionOnOpen, setMentionOnOpen] = useState<string[]>([]);
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
  const [welcomeDescription, setWelcomeDescription] = useState("");
  const [welcomeTitleUrl, setWelcomeTitleUrl] = useState("");
  const [welcomeLargeImage, setWelcomeLargeImage] = useState("");
  const [welcomeSmallImage, setWelcomeSmallImage] = useState("");
  const [welcomeFooter, setWelcomeFooter] = useState("");
  const [welcomeFooterIcon, setWelcomeFooterIcon] = useState("");

  // Transcript
  const [enableTranscripts, setEnableTranscripts] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;
  const guildId = params?.guildId as string;

  // Use React Query hooks - data is cached and shared across pages!
  const { data: guildData, isLoading: guildDataLoading } =
    useGuildData(guildId);
  const { data: emojisData, isLoading: emojisLoading } =
    useGuildEmojis(guildId);
  const createPanelMutation = useCreatePanel(guildId);

  // Extract data from React Query
  const roles = useMemo(() => guildData?.roles || [], [guildData]);
  const categories = useMemo(() => guildData?.categories || [], [guildData]);
  const channels = useMemo(() => guildData?.channels || [], [guildData]);
  const customEmojis = useMemo(() => emojisData || [], [emojisData]);

  // Update guild name when guildData loads
  useEffect(() => {
    if (guildData?.guild?.name) {
      setGuildName(guildData.guild.name);
    }
  }, [guildData]);

  const loading = guildDataLoading || emojisLoading;

  const styles = useMemo(
    () => ({
      container: {
        minHeight: "60vh",
        display: "flex",
        gap: "2rem",
        padding: "2rem",
        maxWidth: "1600px",
        margin: "0 auto",
      } as React.CSSProperties,
      main: {
        flex: 1,
      } as React.CSSProperties,
      card: {
        padding: "2.5rem",
        border: isDark
          ? "1px solid rgba(255,255,255,0.08)"
          : "1px solid rgba(0,0,0,0.08)",
        borderRadius: "16px",
        background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
        boxShadow: isDark
          ? "0 4px 16px rgba(0,0,0,0.3)"
          : "0 4px 16px rgba(0,0,0,0.08)",
      } as React.CSSProperties,
      header: {
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        marginBottom: "2.5rem",
        paddingBottom: "1.5rem",
        borderBottom: isDark
          ? "1px solid rgba(255,255,255,0.1)"
          : "1px solid rgba(0,0,0,0.1)",
      } as React.CSSProperties,
      backButton: {
        padding: "0.625rem 1.25rem",
        borderRadius: "8px",
        border: "none",
        background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
        color: isDark ? "#fff" : "#000",
        fontSize: "0.875rem",
        fontWeight: "500",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        transition: "all 0.2s ease",
        boxShadow: isDark
          ? "0 2px 8px rgba(0,0,0,0.2)"
          : "0 2px 8px rgba(0,0,0,0.05)",
      } as React.CSSProperties,
      title: {
        fontSize: "2rem",
        fontWeight: "700",
        flex: 1,
        color: "#fff",
        letterSpacing: "-0.02em",
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
        gap: "0.625rem",
      } as React.CSSProperties,
      label: {
        fontSize: "0.75rem",
        fontWeight: "600",
        textTransform: "uppercase",
        opacity: 0.75,
        letterSpacing: "0.05em",
      } as React.CSSProperties,
      input: {
        padding: "0.75rem 1rem",
        borderRadius: "8px",
        border: isDark
          ? "1px solid rgba(255,255,255,0.12)"
          : "1px solid rgba(0,0,0,0.12)",
        background: isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.8)",
        color: isDark ? "#fff" : "#000",
        fontSize: "0.9375rem",
        transition: "all 0.2s ease",
        boxShadow: isDark
          ? "0 1px 3px rgba(0,0,0,0.2)"
          : "0 1px 3px rgba(0,0,0,0.05)",
      } as React.CSSProperties,
      textarea: {
        padding: "0.75rem 1rem",
        borderRadius: "8px",
        border: isDark
          ? "1px solid rgba(255,255,255,0.12)"
          : "1px solid rgba(0,0,0,0.12)",
        background: isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.8)",
        color: isDark ? "#fff" : "#000",
        minHeight: "100px",
        resize: "vertical",
        fontFamily: "inherit",
        fontSize: "0.9375rem",
        transition: "all 0.2s ease",
        boxShadow: isDark
          ? "0 1px 3px rgba(0,0,0,0.2)"
          : "0 1px 3px rgba(0,0,0,0.05)",
      } as React.CSSProperties,
      select: {
        padding: "0.75rem 1rem",
        borderRadius: "8px",
        border: isDark
          ? "1px solid rgba(255,255,255,0.12)"
          : "1px solid rgba(0,0,0,0.12)",
        background: isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.8)",
        color: isDark ? "#fff" : "#000",
        cursor: "pointer",
        fontSize: "0.9375rem",
        transition: "all 0.2s ease",
        boxShadow: isDark
          ? "0 1px 3px rgba(0,0,0,0.2)"
          : "0 1px 3px rgba(0,0,0,0.05)",
      } as React.CSSProperties,
      colorInput: {
        padding: "0.5rem",
        borderRadius: "8px",
        border: isDark
          ? "1px solid rgba(255,255,255,0.12)"
          : "1px solid rgba(0,0,0,0.12)",
        background: isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.8)",
        cursor: "pointer",
        height: "48px",
        width: "100%",
        transition: "all 0.2s ease",
      } as React.CSSProperties,
      checkboxGroup: {
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.75rem",
        borderRadius: "8px",
        background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
      } as React.CSSProperties,
      section: {
        marginTop: "2.5rem",
        marginBottom: "1.5rem",
      } as React.CSSProperties,
      sectionTitle: {
        fontSize: "1.125rem",
        fontWeight: "600",
        marginBottom: "1.5rem",
        paddingBottom: "0.75rem",
        borderBottom: isDark
          ? "2px solid rgba(255,255,255,0.12)"
          : "2px solid rgba(0,0,0,0.08)",
        letterSpacing: "0.02em",
      } as React.CSSProperties,
      createButton: {
        padding: "1rem 2rem",
        borderRadius: "10px",
        border: "none",
        background: "linear-gradient(135deg, #5865F2 0%, #4752C4 100%)",
        color: "#fff",
        fontSize: "1rem",
        fontWeight: "600",
        cursor: "pointer",
        width: "100%",
        marginTop: "2.5rem",
        transition: "all 0.2s ease",
        boxShadow: "0 4px 12px rgba(88, 101, 242, 0.4)",
        letterSpacing: "0.02em",
      } as React.CSSProperties,
    }),
    [isDark]
  );

  const handleCreate = async () => {
    // Validate required fields
    if (!panelTitle.trim()) {
      error("Panel title is required");
      return;
    }
    if (!buttonText.trim()) {
      error("Button text is required");
      return;
    }
    if (!panelChannel) {
      error("Please select a panel channel");
      return;
    }

    try {
      setCreating(true);

      const panelData = {
        // Panel config
        channel: panelChannel,
        title: panelTitle,
        content: panelContent,
        color: panelColor,
        largeImgUrl: largeImageUrl || null,
        smallImgUrl: smallImageUrl || null,

        // Button config
        btnText: buttonText,
        btnColor: buttonColor,
        btnEmoji: emojiValue || null,

        // Ticket config
        mentionOnOpen: mentionOnOpen,
        ticketCategory: ticketCategory || null,
        enableTranscripts: enableTranscripts,

        // Welcome embed config
        welcomeEmbed: {
          color: welcomeEmbedColor,
          title: welcomeTitle || null,
          description: welcomeDescription || null,
          titleImgUrl: welcomeTitleUrl || null,
          largeImgUrl: welcomeLargeImage || null,
          smallImgUrl: welcomeSmallImage || null,
          footerText: welcomeFooter || null,
          footerImgUrl: welcomeFooterIcon || null,
        },
      };

      // Use React Query mutation - automatically invalidates cache
      await createPanelMutation.mutateAsync(panelData);

      // Success - show toast and redirect
      success("Panel created successfully!");
      setTimeout(() => {
        router.push(`/dashboard/guild/${guildId}/panels`);
      }, 1000);
    } catch (err) {
      console.error("Error creating panel:", err);
      error(err instanceof Error ? err.message : "Failed to create panel");
    } finally {
      setCreating(false);
    }
  };

  // Show loading spinner while fetching data or theme not mounted
  if (loading || !mounted) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-8">
        <h2
          className={`text-xl font-bold ${
            isDark ? "text-white" : "text-black"
          }`}
        >
          Loading Panel Data...
        </h2>
        <div
          className="rounded-full"
          style={{
            width: "40px",
            height: "40px",
            border: `4px solid ${
              isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
            }`,
            borderTop: `4px solid ${isDark ? "#fff" : "#000"}`,
            animation: "spin 1s linear infinite",
          }}
        />
      </div>
    );
  }

  return (
    <div style={styles.container} className="guild-layout">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <GuildSidebar guildId={guildId} guildName={guildName} />

      <main style={styles.main}>
        <div style={styles.card} className="panel-card">
          <div style={styles.header}>
            <button
              style={styles.backButton}
              onClick={() => router.push(`/dashboard/guild/${guildId}/panels`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              ← Back
            </button>
            <h1 style={styles.title} className="page-title">
              Create Panel
            </h1>
          </div>

          {/* First Row */}
          <div style={styles.formRow} className="form-row">
            <div style={styles.formGroup}>
              <label style={styles.label}>MENTION ON OPEN</label>

              {/* Selected Role Chips - Display Above */}
              {mentionOnOpen.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  {mentionOnOpen.map((roleId) => {
                    const role = roles.find((r) => r.roleId === roleId);
                    return (
                      <div
                        key={roleId}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.375rem",
                          padding: "0.25rem 0.625rem",
                          background: isDark
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(0, 0, 0, 0.1)",
                          border: isDark
                            ? "1px solid rgba(255, 255, 255, 0.2)"
                            : "1px solid rgba(0, 0, 0, 0.2)",
                          borderRadius: "6px",
                          fontSize: "0.8125rem",
                          fontWeight: "500",
                          color: isDark ? "#fff" : "#000",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-1px)";
                          e.currentTarget.style.background = isDark
                            ? "rgba(255, 255, 255, 0.15)"
                            : "rgba(0, 0, 0, 0.15)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.background = isDark
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(0, 0, 0, 0.1)";
                        }}
                      >
                        <span>@{role?.roleName || roleId}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMentionOnOpen(
                              mentionOnOpen.filter((id) => id !== roleId)
                            );
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: isDark ? "#f87171" : "#ef4444",
                            cursor: "pointer",
                            fontSize: "1rem",
                            lineHeight: "1",
                            padding: "0",
                            display: "flex",
                            alignItems: "center",
                            transition: "transform 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.2)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Dropdown Select */}
              <select
                value=""
                onChange={(e) => {
                  const roleId = e.target.value;
                  if (roleId && !mentionOnOpen.includes(roleId)) {
                    setMentionOnOpen([...mentionOnOpen, roleId]);
                  }
                }}
                style={{
                  ...styles.select,
                  colorScheme: isDark ? "dark" : "light",
                }}
              >
                <option
                  value=""
                  style={{ background: isDark ? "#1f1f1f" : "#fff" }}
                >
                  {mentionOnOpen.length > 0
                    ? "Add more roles..."
                    : "Select roles..."}
                </option>
                {roles.map((role) => (
                  <option
                    key={role.roleId}
                    value={role.roleId}
                    style={{ background: isDark ? "#1f1f1f" : "#fff" }}
                  >
                    @{role.roleName}
                  </option>
                ))}
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
                {categories.map((category) => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Transcript Toggle */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={styles.checkboxGroup}>
              <input
                type="checkbox"
                checked={enableTranscripts}
                onChange={(e) => setEnableTranscripts(e.target.checked)}
                style={{ width: "18px", height: "18px", cursor: "pointer" }}
              />
              <span style={{ fontWeight: 500 }}>
                📝 Enable transcripts for this panel (saves full ticket
                conversation history)
              </span>
            </label>
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
                style={{
                  ...styles.textarea,
                  colorScheme: isDark ? "dark" : "light",
                }}
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
                {channels.map((channel) => (
                  <option key={channel.channelId} value={channel.channelId}>
                    #{channel.channelName}
                  </option>
                ))}
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
          <div style={styles.formGroup}>
            <label style={styles.label}>BUTTON EMOJI</label>
            <EmojiPicker
              value={emojiValue}
              onChange={setEmojiValue}
              customEmojis={customEmojis}
              useCustom={customEmoji}
              onToggleCustom={setCustomEmoji}
            />
          </div>

          {/* Image URLs */}
          <div style={styles.formRow} className="mt-6">
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
                  placeholder="Please wait here while a staff member assists you."
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>DESCRIPTION</label>
              <textarea
                value={welcomeDescription}
                onChange={(e) => setWelcomeDescription(e.target.value)}
                style={{
                  ...styles.input,
                  minHeight: "100px",
                  resize: "vertical",
                }}
                placeholder="Enter your description here..."
              />
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
          <button
            onClick={handleCreate}
            style={{
              ...styles.createButton,
              opacity: creating ? 0.6 : 1,
              cursor: creating ? "not-allowed" : "pointer",
            }}
            disabled={creating}
          >
            {creating ? "CREATING..." : "CREATE"}
          </button>
        </div>
      </main>
    </div>
  );
}
