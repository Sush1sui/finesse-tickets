"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";

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
        icon: "←",
        label: "Back to servers",
        isBack: true,
      },
      {
        href: `/dashboard/guild/${guildId}/settings`,
        icon: "⚙️",
        label: "Settings",
      },
      {
        href: `/dashboard/guild/${guildId}/panels`,
        icon: "🎫",
        label: "Ticket Panels",
      },
      {
        href: `/dashboard/guild/${guildId}/transcripts`,
        icon: "📋",
        label: "Transcripts",
      },
      {
        href: `/dashboard/guild/${guildId}/staff`,
        icon: "👥",
        label: "Staff Members",
      },
    ],
    [guildId]
  );

  const styles = useMemo(
    () => ({
      sidebar: {
        width: "280px",
        minWidth: "280px",
        padding: "1.5rem",
        border: isDark
          ? "2px solid rgba(255,255,255,0.1)"
          : "2px solid rgba(0,0,0,0.1)",
        borderRadius: "12px",
        height: "fit-content",
      } as React.CSSProperties,
      serverHeader: {
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.75rem",
        marginBottom: "1.5rem",
        border: isDark
          ? "2px solid rgba(255,255,255,0.1)"
          : "2px solid rgba(0,0,0,0.1)",
        borderRadius: "12px",
      } as React.CSSProperties,
      serverIcon: {
        width: "48px",
        height: "48px",
        minWidth: "48px",
        minHeight: "48px",
        borderRadius: "50%",
        background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.5rem",
        fontWeight: "700",
        flexShrink: 0,
      } as React.CSSProperties,
      serverName: {
        fontSize: "1.125rem",
        fontWeight: "600",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        flex: 1,
      } as React.CSSProperties,
      nav: {
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      } as React.CSSProperties,
      navLink: {
        padding: "0.75rem 1rem",
        borderRadius: "8px",
        textDecoration: "none",
        color: "inherit",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        transition: "background 0.2s",
        background: "transparent",
        minHeight: "44px",
      } as React.CSSProperties,
      activeLink: {
        background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
        fontWeight: "600",
      } as React.CSSProperties,
      navIcon: {
        fontSize: "1.25rem",
        flexShrink: 0,
        minWidth: "24px",
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
              width={48}
              height={48}
              style={{
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            guildName.charAt(0)
          )}
        </div>
        <span style={styles.serverName}>{guildName}</span>
      </div>

      {/* Navigation Links */}
      <nav style={styles.nav}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="guild-sidebar-nav-link"
              style={{
                ...styles.navLink,
                ...(isActive && !item.isBack ? styles.activeLink : {}),
              }}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              <span
                style={{
                  ...styles.navLabel,
                  fontSize: item.isBack ? "0.875rem" : "1rem",
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
