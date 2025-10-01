import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import Header from "./header";
import Footer from "./footer";

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
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

// header/footer mount-only animation
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

// child "slide up" animation for the card content
const childSlideVariants: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.22, ease: "easeIn" },
  },
};

export default function Layout() {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // trigger header/footer animation only after first client render
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased">
      <motion.div
        aria-hidden // purely presentational wrapper
        initial="initial"
        animate={mounted ? "animate" : "initial"}
        variants={headerFooterVariants}
      >
        <Header />
      </motion.div>

      <AnimatePresence mode="wait" initial={true}>
        <motion.main
          key={location.pathname}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          variants={pageVariants}
        >
          <motion.div
            layout
            initial="initial"
            animate="animate"
            exit="exit"
            variants={childSlideVariants}
            className="w-full h-full bg-card/60 dark:bg-card/50 rounded-xl shadow-sm border border-border/40 p-6 backdrop-blur-sm"
          >
            <Outlet />
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
