"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState, useMemo } from "react";

export default function Footer() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  const isDark = mounted ? resolvedTheme === "dark" : false;

  // Memoize styles to prevent re-creating them on every render
  const footerStyles = useMemo(
    () => ({
      footer: {
        height: 56,
        borderTop: isDark
          ? "1px solid rgba(255,255,255,0.06)"
          : "1px solid rgba(0,0,0,0.06)",
        display: "flex",
        alignItems: "center",
        background: isDark ? "#06070a" : "#ffffff",
        color: isDark ? "rgba(230,238,248,0.65)" : "rgba(15,23,32,0.45)",
        /* use an outer ring only — remove inset/internal stroke */
        boxShadow: isDark
          ? "0 -6px 12px rgba(0,0,0,0.04), 0 0 0 2px rgba(255,255,255,0.03)"
          : "0 -6px 12px rgba(2,6,23,0.04), 0 0 0 2px rgba(0,0,0,0.03)",
      } as React.CSSProperties,
      container: {
        maxWidth: 1100,
        width: "100%",
        margin: "0 auto",
        padding: "0 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      } as React.CSSProperties,
      text: {
        color: isDark ? "rgba(230,238,248,0.65)" : "rgba(15,23,32,0.45)",
        fontSize: 13,
      } as React.CSSProperties,
    }),
    [isDark]
  );

  return (
    <motion.footer
      style={footerStyles.footer}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
    >
      <div style={footerStyles.container}>
        <p style={footerStyles.text}>© 2025 Do it with Finesse!</p>
      </div>
    </motion.footer>
  );
}
