"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import GuildSidebar from "@/components/guild-sidebar";
import { ToastContainer } from "@/components/ui/toast";
import { useToast } from "@/hooks/useToast";
import {
  SearchableSelect,
  SearchableSelectOption,
} from "@/components/ui/searchable-select";
import { useGuildData, usePanels, useGuildInfo } from "@/hooks/useGuildQueries";

type Channel = {
  channelId: string;
  channelName: string;
};

export default function CreateMultiPanelPage() {
  const params = useParams();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { toasts, success, error, removeToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const guildId = params.guildId as string;

  const { data: guildInfo } = useGuildInfo(guildId);
  const { data: guildData, isLoading: guildLoading } = useGuildData(guildId);
  const { data: panels = [] } = usePanels(guildId);

  const channels: Channel[] =
    (guildData?.channels as unknown as Channel[]) || [];

  // Create options arrays for SearchableSelect
  const channelOptions = useMemo<SearchableSelectOption[]>(
    () =>
      channels.map((ch) => ({
        value: ch.channelId,
        label: `#${ch.channelName}`,
      })),
    [channels],
  );
  const panelOptions = useMemo<SearchableSelectOption[]>(
    () => panels.map((panel) => ({ value: panel._id, label: panel.title })),
    [panels],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;

  const [formData, setFormData] = useState({
    channel: "",
    selectedPanels: ["", ""],
    useDropdown: false,
    dropdownPlaceholder: "",
    embedColor: "#5865F2",
    title: "",
    description: "",
    authorName: "",
    authorIconUrl: "",
    authorUrl: "",
    largeImgUrl: "",
    smallImgUrl: "",
    footerText: "",
    footerImgUrl: "",
  });

  const [saving, setSaving] = useState(false);

  const handleAddPanel = () => {
    setFormData({
      ...formData,
      selectedPanels: [...formData.selectedPanels, ""],
    });
  };

  const handleRemovePanel = (index: number) => {
    if (formData.selectedPanels.length > 2) {
      setFormData({
        ...formData,
        selectedPanels: formData.selectedPanels.filter((_, i) => i !== index),
      });
    }
  };

  const handlePanelChange = (index: number, value: string) => {
    const updated = [...formData.selectedPanels];
    updated[index] = value;
    setFormData({ ...formData, selectedPanels: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.channel) {
      error("Please select a channel");
      return;
    }

    const validPanels = formData.selectedPanels.filter((p) => p.trim() !== "");
    if (validPanels.length < 2) {
      error("Please select at least 2 panels");
      return;
    }

    if (!formData.description || formData.description.trim() === "") {
      error("Please enter a description for the embed");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `/api/dashboard/guild/${guildId}/multi-panel`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            selectedPanels: validPanels,
          }),
        },
      );

      if (!response.ok) throw new Error("Failed to create multi-panel");

      success("Multi-panel created successfully!");
      setTimeout(() => {
        router.push(`/dashboard/guild/${guildId}/panels`);
      }, 1000);
    } catch (err) {
      console.error("Error creating multi-panel:", err);
      error("Failed to create multi-panel. Please try again.");
    } finally {
      setSaving(false);
    }
  };

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
      panelRow: {
        display: "flex",
        gap: "0.75rem",
        marginBottom: "0.75rem",
        alignItems: "center",
      } as React.CSSProperties,
      removeBtn: {
        padding: "0.75rem 1rem",
        borderRadius: "8px",
        border: "1px solid #ed4245",
        background: "transparent",
        color: "#ed4245",
        fontSize: "0.875rem",
        cursor: "pointer",
        transition: "all 0.2s ease",
        fontWeight: "500",
      } as React.CSSProperties,
      addBtn: {
        padding: "0.625rem 1.25rem",
        borderRadius: "8px",
        border: "1px solid #5865F2",
        background: "transparent",
        color: "#5865F2",
        fontSize: "0.875rem",
        cursor: "pointer",
        transition: "all 0.2s ease",
        marginTop: "0.5rem",
        fontWeight: "500",
      } as React.CSSProperties,
    }),
    [isDark],
  );

  if (guildLoading) {
    return (
      <div style={styles.container}>
        <GuildSidebar
          guildId={guildId}
          guildName={guildInfo?.name || "Server"}
        />
        <div style={styles.main}>
          <div style={styles.card}>
            <h2
              style={{ color: isDark ? "#fff" : "#000", textAlign: "center" }}
            >
              Loading...
            </h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div style={styles.container}>
        <GuildSidebar
          guildId={guildId}
          guildName={guildInfo?.name || "Server"}
          guildIcon={guildInfo?.icon || undefined}
        />
        <div style={styles.main}>
          <div style={styles.card}>
            <div style={styles.header}>
              <button
                style={styles.backButton}
                onClick={() =>
                  router.push(`/dashboard/guild/${guildId}/panels`)
                }
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateX(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                ← Back
              </button>
              <h1 style={styles.title}>Create Multi-Panel</h1>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Panel Channel */}
              <div style={{ ...styles.formRow, marginBottom: "2rem" }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Panel Channel</label>
                  <SearchableSelect
                    options={channelOptions}
                    value={formData.channel}
                    onChange={(value) =>
                      setFormData({ ...formData, channel: value })
                    }
                    placeholder="Select a channel"
                    isDark={isDark}
                  />
                </div>
              </div>

              {/* Panels Selection */}
              <div style={{ ...styles.formGroup, marginBottom: "2rem" }}>
                <label style={styles.label}>Panels (Minimum 2)</label>
                {formData.selectedPanels.map((panelId, index) => (
                  <div key={index} style={styles.panelRow}>
                    <SearchableSelect
                      options={panelOptions}
                      value={panelId}
                      onChange={(value) => handlePanelChange(index, value)}
                      placeholder="Select Panel"
                      isDark={isDark}
                      style={{ flex: 1 }}
                    />
                    {formData.selectedPanels.length > 2 && (
                      <button
                        type="button"
                        style={styles.removeBtn}
                        onClick={() => handleRemovePanel(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  style={styles.addBtn}
                  onClick={handleAddPanel}
                >
                  + Add Panel
                </button>
              </div>

              {/* Dropdown Menu */}
              <div style={{ ...styles.formGroup, marginBottom: "2rem" }}>
                <div style={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    checked={formData.useDropdown}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        useDropdown: e.target.checked,
                      })
                    }
                  />
                  <label style={{ cursor: "pointer" }}>Use Dropdown Menu</label>
                </div>
                {formData.useDropdown && (
                  <input
                    type="text"
                    style={styles.input}
                    placeholder="Select a topic..."
                    value={formData.dropdownPlaceholder}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dropdownPlaceholder: e.target.value,
                      })
                    }
                  />
                )}
              </div>

              {/* Message Section */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Message</h3>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Embed Color</label>
                    <input
                      type="color"
                      style={styles.colorInput}
                      value={formData.embedColor}
                      onChange={(e) =>
                        setFormData({ ...formData, embedColor: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div style={{ ...styles.formGroup, marginBottom: "1.5rem" }}>
                  <label style={styles.label}>Title</label>
                  <input
                    type="text"
                    style={styles.input}
                    placeholder="Embed title (up to 256 characters)"
                    maxLength={256}
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Description</label>
                  <textarea
                    style={styles.textarea}
                    placeholder="Up to 4096 characters only"
                    maxLength={4096}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Author */}
              <div style={{ ...styles.formRow, marginBottom: "2rem" }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Author Name</label>
                  <input
                    type="text"
                    style={styles.input}
                    placeholder="Finesse Ticketing Bot"
                    value={formData.authorName}
                    onChange={(e) =>
                      setFormData({ ...formData, authorName: e.target.value })
                    }
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Author Icon URL</label>
                  <input
                    type="url"
                    style={styles.input}
                    placeholder="https://example/image.png"
                    value={formData.authorIconUrl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        authorIconUrl: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div style={{ ...styles.formRow, marginBottom: "2rem" }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Author URL</label>
                  <input
                    type="url"
                    style={styles.input}
                    placeholder="https://example.com"
                    value={formData.authorUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, authorUrl: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Images */}
              <div style={{ ...styles.formRow, marginBottom: "2rem" }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Large Image URL</label>
                  <input
                    type="url"
                    style={styles.input}
                    placeholder="https://example/image.png"
                    value={formData.largeImgUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, largeImgUrl: e.target.value })
                    }
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Small Image URL</label>
                  <input
                    type="url"
                    style={styles.input}
                    placeholder="https://example/image.png"
                    value={formData.smallImgUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, smallImgUrl: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Footer */}
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Footer Text</label>
                  <input
                    type="text"
                    style={styles.input}
                    placeholder="Footer Text"
                    value={formData.footerText}
                    onChange={(e) =>
                      setFormData({ ...formData, footerText: e.target.value })
                    }
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Footer Icon URL</label>
                  <input
                    type="url"
                    style={styles.input}
                    placeholder="https://example/image.png"
                    value={formData.footerImgUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, footerImgUrl: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={saving}
                style={{
                  ...styles.createButton,
                  opacity: saving ? 0.6 : 1,
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Creating..." : "CREATE"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
