"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Settings,
  TicketIcon,
  FileText,
  Users,
} from "lucide-react";

type GuildSidebarProps = {
  guildId: string;
  guildName: string;
  guildIcon?: string;
};

export default function GuildSidebar({
  guildId,
  guildName,
  guildIcon,
}: GuildSidebarProps) {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;

  const navItems = useMemo(
    () => [
      {
        href: `/dashboard`,
        icon: ArrowLeft,
        label: "Back to servers",
        isBack: true,
      },
      {
        href: `/dashboard/guild/${guildId}/panels`,
        icon: TicketIcon,
        label: "Ticket Panels",
      },
      {
        href: `/dashboard/guild/${guildId}/settings`,
        icon: Settings,
        label: "Settings",
      },
      {
        href: `/dashboard/guild/${guildId}/transcripts`,
        icon: FileText,
        label: "Transcripts",
      },
      {
        href: `/dashboard/guild/${guildId}/staff`,
        icon: Users,
        label: "Staff Members",
      },
    ],
    [guildId]
  );

  const styles = useMemo(
    () => ({
      sidebar: {
        width: "260px",
        minWidth: "260px",
        padding: "1.5rem 1rem",
        background: isDark ? "#1e293b" : "#ffffff",
        border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
        borderRadius: "10px",
        height: "fit-content",
        boxShadow: isDark
          ? "0 1px 3px rgba(0,0,0,0.3)"
          : "0 1px 3px rgba(0,0,0,0.08)",
        position: "sticky" as const,
        top: "1.5rem",
      } as React.CSSProperties,
      serverHeader: {
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "1rem",
        marginBottom: "1.5rem",
        background: isDark ? "#0f172a" : "#f8fafb",
        borderRadius: "8px",
        transition: "all 0.3s ease",
      } as React.CSSProperties,
      serverIcon: {
        width: "44px",
        height: "44px",
        minWidth: "44px",
        minHeight: "44px",
        borderRadius: "8px",
        background: "linear-gradient(135deg, #5865f2 0%, #4752d4 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.25rem",
        fontWeight: "700",
        flexShrink: 0,
        color: "white",
        boxShadow: "0 2px 8px rgba(88, 101, 242, 0.3)",
      } as React.CSSProperties,
      serverName: {
        fontSize: "0.9375rem",
        fontWeight: "600",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        flex: 1,
        color: isDark ? "#e2e8f0" : "#0f172a",
      } as React.CSSProperties,
      nav: {
        display: "flex",
        flexDirection: "column",
        gap: "0.375rem",
      } as React.CSSProperties,
      navLink: {
        padding: "0.625rem 0.875rem",
        borderRadius: "7px",
        textDecoration: "none",
        color: isDark ? "#94a3b8" : "#64748b",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        background: "transparent",
        minHeight: "40px",
        fontSize: "0.9375rem",
        fontWeight: "500",
        border: `1px solid transparent`,
      } as React.CSSProperties,
      activeLink: {
        background: "#5865f2",
        color: "#ffffff",
        fontWeight: "600",
        boxShadow: "0 2px 8px rgba(88, 101, 242, 0.3)",
      } as React.CSSProperties,
      backLink: {
        padding: "0.5rem 0.875rem",
        fontSize: "0.85rem",
        color: isDark ? "#cbd5e1" : "#475569",
        marginBottom: "0.5rem",
        borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
        paddingBottom: "0.75rem",
        marginBottom: "0.875rem",
      } as React.CSSProperties,
      navIcon: {
        flexShrink: 0,
        minWidth: "18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      } as React.CSSProperties,
      navLabel: {
        flex: 1,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      } as React.CSSProperties,
    }),
    [isDark]
  );

  return (
    <aside style={styles.sidebar} className="guild-sidebar">
      {/* Server Icon and Name */}
      <div style={styles.serverHeader} className="guild-sidebar-header">
        <div style={styles.serverIcon}>
          {guildIcon ? (
            <Image
              src={guildIcon}
              alt={guildName}
              width={44}
              height={44}
              style={{
                borderRadius: "6px",
                objectFit: "cover",
              }}
            />
          ) : (
            guildName.charAt(0).toUpperCase()
          )}
        </div>
        <span style={styles.serverName}>{guildName}</span>
      </div>

      {/* Navigation Links */}
      <nav style={styles.nav}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const IconComponent = item.icon;

          if (item.isBack) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="guild-sidebar-nav-link"
                style={{ ...styles.navLink, ...styles.backLink }}
              >
                <IconComponent size={16} style={styles.navIcon} />
                <span style={styles.navLabel}>{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="guild-sidebar-nav-link"
              style={{
                ...styles.navLink,
                ...(isActive ? styles.activeLink : {}),
              }}
            >
              <IconComponent
                size={18}
                style={styles.navIcon}
                strokeWidth={2}
              />
              <span style={styles.navLabel}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
