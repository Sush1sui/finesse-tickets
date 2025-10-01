"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Footer() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  const isDark = mounted ? resolvedTheme === "dark" : false;

  const footerStyles: Record<string, React.CSSProperties> = {
    footer: {
      height: 56,
      borderTop: isDark
        ? "1px solid rgba(255,255,255,0.04)"
        : "1px solid rgba(0,0,0,0.04)",
      display: "flex",
      alignItems: "center",
      background: isDark ? "#06070a" : "#ffffff",
      color: isDark ? "rgba(230,238,248,0.65)" : "rgba(15,23,32,0.45)",
    },
    container: {
      maxWidth: 1100,
      width: "100%",
      margin: "0 auto",
      padding: "0 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    muted: {
      color: footerStylesGenericColor(),
      fontSize: 13,
    },
  };

  function footerStylesGenericColor() {
    return isDark ? "rgba(230,238,248,0.65)" : "rgba(15,23,32,0.45)";
  }

  return (
    <motion.footer
      style={footerStyles.footer}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
    >
      <div style={footerStyles.container}>
        <p style={{ color: footerStylesGenericColor(), fontSize: 13 }}>
          © 2025 Do it with Finesse!
        </p>
      </div>
    </motion.footer>
  );
}
