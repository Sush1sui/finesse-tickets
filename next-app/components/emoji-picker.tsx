"use client";

import { useState, useMemo, useEffect } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import dynamic from "next/dynamic";
import type { EmojiClickData, Theme } from "emoji-picker-react";

// Dynamically import EmojiPicker to avoid SSR issues
const Picker = dynamic(() => import("emoji-picker-react"), { ssr: false });

type CustomEmoji = {
  emojiId: string;
  emojiName: string;
  emojiAnimated: boolean;
  emojiUrl: string;
  emojiFormat: string;
};

interface EmojiPickerProps {
  value: string;
  onChange: (value: string) => void;
  customEmojis?: CustomEmoji[];
  useCustom: boolean;
  onToggleCustom: (useCustom: boolean) => void;
}

export default function EmojiPicker({
  value,
  onChange,
  customEmojis = [],
  useCustom,
  onToggleCustom,
}: EmojiPickerProps) {
  const { resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onChange(emojiData.emoji);
    setIsOpen(false);
  };

  const handleCustomEmojiSelect = (emoji: CustomEmoji) => {
    onChange(emoji.emojiFormat);
    setIsOpen(false);
  };

  const styles = useMemo(
    () => ({
      container: {
        position: "relative",
        width: "100%",
      } as React.CSSProperties,
      header: {
        display: "flex",
        gap: "0.5rem",
        alignItems: "center",
        marginBottom: "0.5rem",
      } as React.CSSProperties,
      checkboxGroup: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        fontSize: "0.875rem",
      } as React.CSSProperties,
      input: {
        flex: 1,
        padding: "0.5rem",
        borderRadius: "6px",
        border: isDark
          ? "1px solid rgba(255,255,255,0.2)"
          : "1px solid rgba(0,0,0,0.2)",
        background: isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.9)",
        color: isDark ? "#fff" : "#000",
        cursor: "pointer",
      } as React.CSSProperties,
      dropdown: {
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        marginTop: "0.5rem",
        borderRadius: "8px",
        zIndex: 1000,
        boxShadow: isDark
          ? "0 4px 20px rgba(0,0,0,0.5)"
          : "0 4px 20px rgba(0,0,0,0.2)",
      } as React.CSSProperties,
      customEmojiGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(8, 1fr)",
        gap: "0.5rem",
        padding: "1rem",
        maxHeight: "400px",
        overflowY: "auto",
        borderRadius: "8px",
        border: isDark
          ? "1px solid rgba(255,255,255,0.2)"
          : "1px solid rgba(0,0,0,0.2)",
        background: isDark ? "rgba(20,20,20,0.98)" : "rgba(255,255,255,0.98)",
      } as React.CSSProperties,
      customEmojiButton: {
        padding: "0.5rem",
        borderRadius: "6px",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        transition: "all 0.2s",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        aspectRatio: "1",
        position: "relative",
      } as React.CSSProperties,
    }),
    [isDark]
  );

  const displayValue = useMemo(() => {
    if (!value) return "Select an emoji...";

    // If it's a custom emoji format (<:name:id> or <a:name:id>)
    if (value.startsWith("<") && value.endsWith(">")) {
      const match = value.match(/<a?:(.+?):\d+>/);
      if (match) return `:${match[1]}:`;
    }

    return value;
  }, [value]);

  // Don't render dropdown until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.checkboxGroup}>
            <input
              type="checkbox"
              checked={useCustom}
              onChange={(e) => onToggleCustom(e.target.checked)}
              style={{ cursor: "pointer" }}
            />
            <span>Custom Emoji</span>
          </div>
        </div>

        <input
          type="text"
          value={displayValue}
          readOnly
          style={{
            flex: 1,
            padding: "0.5rem",
            borderRadius: "6px",
            border: "1px solid rgba(128,128,128,0.3)",
            background: "transparent",
            cursor: "pointer",
          }}
          placeholder={useCustom ? "Select custom emoji..." : "Select emoji..."}
        />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.checkboxGroup}>
          <input
            type="checkbox"
            checked={useCustom}
            onChange={(e) => onToggleCustom(e.target.checked)}
            style={{ cursor: "pointer" }}
          />
          <span>Custom Emoji</span>
        </div>
      </div>

      <input
        type="text"
        value={displayValue}
        readOnly
        onClick={() => setIsOpen(!isOpen)}
        style={styles.input}
        placeholder={useCustom ? "Select custom emoji..." : "Select emoji..."}
      />

      {isOpen && (
        <div style={styles.dropdown}>
          {useCustom ? (
            customEmojis.length === 0 ? (
              <div
                style={{
                  ...styles.customEmojiGrid,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0.6,
                }}
              >
                No custom emojis found in this server.
              </div>
            ) : (
              <div style={styles.customEmojiGrid}>
                {customEmojis.map((emoji) => (
                  <button
                    key={emoji.emojiId}
                    onClick={() => handleCustomEmojiSelect(emoji)}
                    style={styles.customEmojiButton}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isDark
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(0,0,0,0.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                    title={`:${emoji.emojiName}:`}
                  >
                    <Image
                      src={emoji.emojiUrl}
                      alt={emoji.emojiName}
                      width={32}
                      height={32}
                      style={{ objectFit: "contain" }}
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            )
          ) : (
            <Picker
              onEmojiClick={handleEmojiClick}
              theme={isDark ? ("dark" as Theme) : ("light" as Theme)}
              searchPlaceHolder="Search emojis"
              width="100%"
              height="400px"
              previewConfig={{ showPreview: false }}
            />
          )}
        </div>
      )}
    </div>
  );
}
