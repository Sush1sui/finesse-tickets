"use client";

import { memo, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";

const baseStyles: Record<string, React.CSSProperties> = {
  header: {
    width: "100%",
    backdropFilter: "blur(6px)",
    borderBottom: "none",
    overflow: "visible",
  },
  inner: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "0 16px",
    height: 64,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  left: { display: "flex", alignItems: "center", gap: 12 },
  brandLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    textDecoration: "none",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    fontSize: 16,
    textTransform: "uppercase",
  },
  nav: { display: "flex", alignItems: "center", gap: 8 },
  navLink: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: 8,
    fontSize: 13,
    textDecoration: "none",
  },
  right: { display: "flex", alignItems: "center", gap: 8 },
  avatarWrap: { position: "relative", zIndex: 9999 },
  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    cursor: "pointer",
  },
  menu: {
    position: "absolute",
    right: 0,
    marginTop: 8,
    width: 176,
    listStyle: "none",
    padding: 6,
    borderRadius: 8,
    boxShadow: "0 10px 30px rgba(2,6,23,0.08)",
  },
  menuItem: {
    display: "block",
    width: "100%",
    padding: "8px 12px",
    background: "transparent",
    border: "none",
    textAlign: "left",
    cursor: "pointer",
    fontSize: 14,
  },
  logoImg: { width: 36, height: 36, objectFit: "cover", borderRadius: 6 },
};

export default memo(function Header() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Use real auth context
  const { user, authLoading, login, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menu when clicking outside or pressing Escape
  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: PointerEvent) {
      const target = e.target as Node | null;
      if (avatarRef.current && target && !avatarRef.current.contains(target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const isDark = mounted ? resolvedTheme === "dark" : false;

  const styles = {
    header: {
      ...baseStyles.header,
      background: isDark ? "rgba(10,11,14,0.7)" : "rgba(255,255,255,0.9)",
      borderBottom: "none",
      color: isDark ? "#fff" : "#000",
    } as React.CSSProperties,
    inner: baseStyles.inner,
    left: baseStyles.left,
    brandLink: {
      ...baseStyles.brandLink,
      color: isDark ? "#fff" : "#000",
    } as React.CSSProperties,
    nav: baseStyles.nav,
    navLink: {
      ...baseStyles.navLink,
      border: isDark
        ? "1px solid rgba(255,255,255,0.06)"
        : "1px solid rgba(0,0,0,0.06)",
      background: "transparent",
      color: isDark ? "#fff" : "#000",
    } as React.CSSProperties,
    right: baseStyles.right,
    avatarWrap: baseStyles.avatarWrap,
    avatarBtn: {
      ...baseStyles.avatarBtn,
      // Improve contrast in light mode: use a subtle gray background + slight shadow
      background: isDark ? "#000" : "rgba(0,0,0,0.03)",
      color: isDark ? "#fff" : "#000",
      border: isDark
        ? "1px solid rgba(255,255,255,0.06)"
        : "1px solid rgba(0,0,0,0.06)",
      boxShadow: isDark ? undefined : "0 1px 2px rgba(0,0,0,0.04)",
    } as React.CSSProperties,
    menu: {
      ...baseStyles.menu,
      background: isDark ? "#000" : "#fff",
      border: isDark
        ? "1px solid rgba(255,255,255,0.15)"
        : "1px solid rgba(0,0,0,0.15)",
      color: isDark ? "#fff" : "#000",
    } as React.CSSProperties,
    menuItem: {
      ...baseStyles.menuItem,
      color: isDark ? "#fff" : "#000",
      borderRadius: "4px",
    } as React.CSSProperties,
    menuItemHover: {
      background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    } as React.CSSProperties,
    logoImg: baseStyles.logoImg,
  };

  return (
    <header style={styles.header}>
      <div style={styles.inner}>
        <div style={styles.left}>
          <Link href="/" style={styles.brandLink} aria-label="Finesse Tickets">
            <Image
              src="/fns_logo.png"
              alt="Finesse Tickets Logo"
              width={40}
              height={40}
              style={styles.logoImg}
            />
            FINESSE TICKETS
          </Link>

          <nav style={styles.nav} aria-label="Primary navigation">
            <Link href="/" style={styles.navLink}>
              Home
            </Link>
            {user && (
              <Link href="/dashboard" style={styles.navLink}>
                Dashboard
              </Link>
            )}
          </nav>
        </div>

        <div style={styles.right}>
          <ModeToggle />

          {!authLoading ? (
            !user ? (
              <Button
                variant="outline"
                onClick={login}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                Login
              </Button>
            ) : (
              <div style={styles.avatarWrap} ref={avatarRef}>
                <button
                  aria-haspopup="menu"
                  aria-expanded={open}
                  onClick={() => setOpen((v) => !v)}
                  title="Open profile menu"
                  className="avatar-btn"
                  style={{ ...styles.avatarBtn }}
                >
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.image}
                      alt={`${user.name}'s avatar`}
                      className="avatar-img"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "50%",
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: 14 }}>
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.14 }}
                      style={styles.menu}
                      role="menu"
                    >
                      <Link
                        href="/dashboard"
                        style={{ textDecoration: "none" }}
                      >
                        <button
                          style={styles.menuItem}
                          role="menuitem"
                          onMouseEnter={(e) =>
                            Object.assign(
                              e.currentTarget.style,
                              styles.menuItemHover
                            )
                          }
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                          }}
                        >
                          Dashboard
                        </button>
                      </Link>
                      <button
                        style={styles.menuItem}
                        role="menuitem"
                        onClick={logout}
                        onMouseEnter={(e) =>
                          Object.assign(
                            e.currentTarget.style,
                            styles.menuItemHover
                          )
                        }
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          ) : (
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: isDark ? "#000" : "rgba(0,0,0,0.04)",
              }}
            />
          )}
        </div>
      </div>
    </header>
  );
});
