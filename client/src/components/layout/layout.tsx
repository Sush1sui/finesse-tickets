import React from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./header";
import Footer from "./footer";

type Props = { children: React.ReactNode };

const pageVariants = {
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

export default function Layout({ children }: Props) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased">
      <Header />

      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={location.pathname}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          <motion.div
            layout
            className="w-full h-full bg-card/60 dark:bg-card/50 rounded-xl shadow-sm border border-border/40 p-6 backdrop-blur-sm"
          >
            {children}
          </motion.div>
        </motion.main>
      </AnimatePresence>

      <Footer />
    </div>
  );
}
