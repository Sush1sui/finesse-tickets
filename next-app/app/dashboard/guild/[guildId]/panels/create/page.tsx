"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useTheme } from "next-themes";
import GuildSidebar from "@/components/guild-sidebar";
import EmojiPicker from "@/components/emoji-picker";
import { ToastContainer } from "@/components/ui/toast";
import { useToast } from "@/hooks/useToast";

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
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [guildName, setGuildName] = useState("Server Name");
  const [customEmojis, setCustomEmojis] = useState<CustomEmoji[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);

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

  // Fetch guild data (roles, categories, channels, emojis)
  useEffect(() => {
    if (!guildId) return;

    const fetchGuildData = async () => {
      try {
        setLoading(true);

        // Fetch combined data (roles, categories, channels) in a single request
        const [dataResponse, emojisResponse] = await Promise.all([
          fetch(`/api/dashboard/guild/${guildId}/data`),
          fetch(`/api/dashboard/guild/${guildId}/emojis`),
        ]);

        // Parse JSON in parallel
        const [guildData, emojisData] = await Promise.all([
          dataResponse.ok
            ? dataResponse.json()
            : { roles: [], categories: [], channels: [] },
          emojisResponse.ok ? emojisResponse.json() : [],
        ]);

        // Update state all at once
        setRoles(guildData.roles || []);
        setCategories(guildData.categories || []);
        setChannels(guildData.channels || []);
        setCustomEmojis(emojisData);
      } catch (error) {
        console.error("Error fetching guild data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGuildData();
  }, [guildId]);

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

        // Welcome embed config
        welcomeEmbed: {
          color: welcomeEmbedColor,
          title: welcomeTitle || null,
          titleImgUrl: welcomeTitleUrl || null,
          largeImgUrl: welcomeLargeImage || null,
          smallImgUrl: welcomeSmallImage || null,
          footerText: welcomeFooter || null,
          footerImgUrl: welcomeFooterIcon || null,
        },
      };

      const response = await fetch(`/api/dashboard/guild/${guildId}/panels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(panelData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create panel");
      }

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

  // Show loading spinner while fetching data
  if (loading) {
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
          <h1 style={styles.title} className="page-title">
            Create Panel
          </h1>

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
