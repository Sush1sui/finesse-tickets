"use client";

import { memo, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

const baseStyles: Record<string, React.CSSProperties> = {
  header: {
    width: "100%",
    backdropFilter: "blur(6px)",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
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

  // small client-side auth stub so header works until you wire real auth
  const [user, setUser] = useState<{
    username: string;
    avatar?: string;
  } | null>(null);
  const [authLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;

  const styles = {
    header: {
      ...baseStyles.header,
      background: isDark ? "rgba(10,11,14,0.7)" : "rgba(255,255,255,0.9)",
      borderBottom: isDark
        ? "1px solid rgba(255,255,255,0.04)"
        : baseStyles.header.borderBottom,
      color: isDark ? "#e6eef8" : "#0f1720",
    } as React.CSSProperties,
    inner: baseStyles.inner,
    left: baseStyles.left,
    brandLink: {
      ...baseStyles.brandLink,
      color: isDark ? "#f8fafc" : "#0f1720",
    } as React.CSSProperties,
    nav: baseStyles.nav,
    navLink: {
      ...baseStyles.navLink,
      border: isDark
        ? "1px solid rgba(255,255,255,0.06)"
        : "1px solid rgba(0,0,0,0.06)",
      background: isDark ? "rgba(255,255,255,0.03)" : "transparent",
      color: isDark ? "#e6eef8" : "#0f1720",
    } as React.CSSProperties,
    right: baseStyles.right,
    avatarWrap: baseStyles.avatarWrap,
    avatarBtn: {
      ...baseStyles.avatarBtn,
      background: isDark
        ? "linear-gradient(135deg, rgba(79,70,229,1), rgba(219,39,119,1))"
        : "linear-gradient(135deg, rgba(99,102,241,1), rgba(236,72,153,1))",
      color: "#fff",
      border: isDark
        ? "1px solid rgba(255,255,255,0.06)"
        : "1px solid rgba(0,0,0,0.06)",
    } as React.CSSProperties,
    menu: {
      ...baseStyles.menu,
      background: isDark ? "#0b1220" : "#fff",
      border: isDark
        ? "1px solid rgba(255,255,255,0.04)"
        : "1px solid rgba(0,0,0,0.04)",
      color: isDark ? "#e6eef8" : "#0f1720",
    } as React.CSSProperties,
    menuItem: {
      ...baseStyles.menuItem,
      color: isDark ? "#e6eef8" : "#0f1720",
    } as React.CSSProperties,
    logoImg: baseStyles.logoImg,
  };

  function login() {
    setUser({ username: "nick", avatar: undefined });
  }
  function logout() {
    setUser(null);
    setOpen(false);
  }

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
                style={{ display: "inline-flex", alignItems: "center" }}
              >
                Login
              </Button>
            ) : (
              <div style={styles.avatarWrap}>
                <button
                  aria-haspopup="menu"
                  aria-expanded={open}
                  onClick={() => setOpen((v) => !v)}
                  title="Open profile menu"
                  style={styles.avatarBtn}
                >
                  {user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatar}
                      alt={`${user.username}'s avatar`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: 14 }}>
                      {user.username.charAt(0).toUpperCase()}
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
                      <button style={styles.menuItem} role="menuitem">
                        Dashboard
                      </button>
                      <button
                        style={styles.menuItem}
                        role="menuitem"
                        onClick={logout}
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
                background: "#eee",
              }}
            />
          )}
        </div>
      </div>
    </header>
  );
});
