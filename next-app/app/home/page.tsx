"use client";

import { memo, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/ui/spinner";

export default memo(function HomeRoot() {
  // Use real auth context
  const { user, authLoading, login } = useAuth();

  // theme handling
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted ? resolvedTheme === "dark" : false;

  // theme-aware tokens
  const mutedColor = isDark ? "rgba(230,238,248,0.68)" : "rgba(15,23,32,0.6)";
  const iconBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(15,23,32,0.08)";
  const buttonBorder = isDark
    ? "1px solid rgba(255,255,255,0.06)"
    : "1px solid rgba(0, 0, 0, 0.16)";

  return (
    <main
      style={{
        flex: 1,
        width: "100%",
        maxWidth: 768,
        margin: "0 auto",
        padding: "48px 16px",
        textAlign: "center",
        minHeight: "60vh",
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
        Discord Ticket System Bot
      </h1>

      <p style={{ fontSize: 16, color: mutedColor, marginBottom: 24 }}>
        A full-featured Discord ticket bot that centralizes support into private
        ticket channels, provides configurable staff access and customizable
        ticket workflows, and stores searchable transcripts for auditing.
      </p>

      <div
        style={{
          maxWidth: 640,
          margin: "0 auto 32px",
          padding: 16,
          borderRadius: 12,
          background: isDark
            ? "rgba(88,101,242,0.08)"
            : "rgba(88,101,242,0.06)",
          border: isDark
            ? "1px solid rgba(88,101,242,0.2)"
            : "1px solid rgba(88,101,242,0.15)",
        }}
      >
        <p
          style={{
            fontSize: 14,
            color: mutedColor,
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          ⚠️ <strong>Early Stage Project:</strong> This bot is currently in
          active development and is exclusively available on the{" "}
          <a
            href="https://discord.gg/dvUsZ9Gj2m"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: isDark ? "#5865F2" : "#4752C4",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Finesse Discord server
          </a>
          . If you'd like to use this ticket bot for your server, please open a
          ticket on our Discord to contact the Finesse team. For documentation
          and updates, visit our{" "}
          <a
            href="https://github.com/Sush1sui/finesse-tickets"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: isDark ? "#5865F2" : "#4752C4",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            GitHub repository
          </a>
          .
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 16,
          maxWidth: 640,
          margin: "0 auto 32px",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div
            style={{
              flex: "0 0 40px",
              width: 40,
              height: 40,
              borderRadius: 9999,
              background: iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              className="icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              width="18"
              height="18"
            >
              <path d="M21 10V7a2 2 0 0 0-2-2h-3" />
              <path d="M3 14v3a2 2 0 0 0 2 2h3" />
              <path d="M7 7h10v10H7z" />
            </svg>
          </div>
          <div>
            <h3 style={{ fontWeight: 600, margin: 0 }}>Panel with Buttons</h3>
            <p style={{ color: mutedColor, fontSize: 13, marginTop: 6 }}>
              Create private tickets via buttons from panels for quick support
              intake.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div
            style={{
              flex: "0 0 40px",
              width: 40,
              height: 40,
              borderRadius: 9999,
              background: iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              width="18"
              height="18"
            >
              <path d="M12 2l7 4v6c0 5-3.8 9.7-7 10-3.2-.3-7-5-7-10V6l7-4z" />
            </svg>
          </div>
          <div>
            <h3 style={{ fontWeight: 600, margin: 0 }}>Staff Controls</h3>
            <p style={{ color: mutedColor, fontSize: 13, marginTop: 6 }}>
              Grant helpers access to individual tickets and manage visibility
              per-channel.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div
            style={{
              flex: "0 0 40px",
              width: 40,
              height: 40,
              borderRadius: 9999,
              background: iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              width="18"
              height="18"
            >
              <path d="M21 15V6a2 2 0 0 0-2-2H7" />
              <path d="M3 9v11a2 2 0 0 0 2 2h11" />
              <path d="M7 13h8M7 17h5" />
            </svg>
          </div>
          <div>
            <h3 style={{ fontWeight: 600, margin: 0 }}>Transcripts & Logs</h3>
            <p style={{ color: mutedColor, fontSize: 13, marginTop: 6 }}>
              Export searchable transcripts for audits and record-keeping.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        {authLoading ? (
          <Spinner />
        ) : !user ? (
          <Button
            onClick={login}
            variant="outline"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              border: buttonBorder,
              cursor: "pointer",
            }}
          >
            Login with Discord
          </Button>
        ) : (
          <Link
            href="/dashboard"
            style={{
              display: "inline-block",
              padding: "8px 14px",
              borderRadius: 8,
              border: buttonBorder,
              textDecoration: "none",
              color: "inherit",
            }}
            aria-label="Open dashboard"
          >
            Open dashboard
          </Link>
        )}
      </div>
    </main>
  );
});
