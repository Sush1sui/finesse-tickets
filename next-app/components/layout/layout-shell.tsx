"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { usePathname } from "next/navigation";
import Header from "./header";
import Footer from "./footer";
import { useTheme } from "next-themes";

const pageVariants: Variants = {
  initial: { opacity: 0, y: 8, scale: 0.995 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.36, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.995,
    transition: { duration: 0.22, ease: "easeIn" },
  },
};

const headerFooterVariants: Variants = {
  initial: { opacity: 0, y: -12, scale: 0.995 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};
const footerVariants: Variants = {
  initial: { opacity: 0, y: 12, scale: 0.995 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: "easeOut", delay: 0.05 },
  },
};

export default function LayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  const isDark = mounted ? resolvedTheme === "dark" : false;

  const outerStyle: React.CSSProperties = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "transparent",
    color: "inherit",
  };
  const mainContainerStyle: React.CSSProperties = {
    flex: 1,
    width: "100%",
    maxWidth: 1100,
    margin: "0 auto",
    padding: "28px 20px",
    boxSizing: "border-box",
  };

  const cardStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    /* Removed background and border per design request */
    borderRadius: 12,
    /* outer ring only for subtle elevation */
    boxShadow: isDark
      ? "0 8px 24px rgba(0,0,0,0.6), 0 0 0 2px rgba(255,255,255,0.04)"
      : "0 8px 24px rgba(2,6,23,0.06), 0 0 0 2px rgba(2,6,23,0.04)",
    padding: 20,
    boxSizing: "border-box",
    minHeight: "60vh",
    color: isDark ? "rgba(230,238,248,0.92)" : "inherit",
  };

  return (
    <div style={outerStyle}>
      <motion.div
        aria-hidden
        initial="initial"
        animate={mounted ? "animate" : "initial"}
        variants={headerFooterVariants}
      >
        <Header />
      </motion.div>

      <AnimatePresence mode="wait" initial={true}>
        <motion.main
          key={pathname ?? "/"}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          style={mainContainerStyle}
        >
          <motion.div
            layout
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            style={cardStyle}
          >
            {children}
          </motion.div>
        </motion.main>
      </AnimatePresence>

      <motion.div
        aria-hidden
        initial="initial"
        animate={mounted ? "animate" : "initial"}
        variants={footerVariants}
      >
        <Footer />
      </motion.div>
    </div>
  );
}
