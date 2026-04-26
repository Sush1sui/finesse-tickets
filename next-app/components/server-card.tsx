"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useState, useEffect, useMemo, useCallback } from "react";
import { ChevronRight } from "lucide-react";

type ServerCardProps = {
  href: string;
  title: string;
  icon?: React.ReactNode;
  subtitle?: string;
  className?: string;
};

export default function ServerCard({
  href,
  title,
  icon,
  subtitle,
  className,
}: ServerCardProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Wait for component to mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;

  // Memoize style calculation
  const cardStyles = useMemo(() => {
    const baseStyles = {
      borderWidth: "1px",
      borderStyle: "solid" as const,
      borderColor: isDark ? "#334155" : "#e2e8f0",
      backgroundColor: isDark ? "#1e293b" : "#ffffff",
      color: isDark ? "#e2e8f0" : "#0f172a",
      boxShadow: isDark
        ? "0 1px 3px rgba(0,0,0,0.3)"
        : "0 1px 3px rgba(0,0,0,0.08)",
      transform: "translateY(0) scale(1)",
      transition:
        "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
      padding: "1.5rem",
      minHeight: "140px",
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      justifyContent: "center",
      gap: "1rem",
      borderRadius: "10px",
      position: "relative" as const,
      overflow: "hidden",
    };

    if (isHovered) {
      return {
        ...baseStyles,
        transform: "translateY(-4px) scale(1.02)",
        boxShadow: isDark
          ? "0 12px 24px rgba(0,0,0,0.4), 0 0 0 1px #334155"
          : "0 12px 24px rgba(0,0,0,0.12), 0 0 0 1px #e2e8f0",
        borderColor: "#5865f2",
        backgroundColor: isDark ? "#263449" : "#f0f4ff",
      };
    }

    return baseStyles;
  }, [isDark, isHovered]);

  // Memoize other styles
  const titleStyle = useMemo(
    () => ({
      color: isDark ? "#e2e8f0" : "#0f172a",
      maxWidth: "100%",
      fontWeight: isHovered ? 700 : 600,
      fontSize: "1rem",
      textAlign: "center" as const,
      transition: "all 300ms ease",
    }),
    [isDark, isHovered]
  );

  const subtitleStyle = useMemo(
    () => ({
      color: isDark ? "#94a3b8" : "#64748b",
      maxWidth: "100%",
      fontSize: "0.875rem",
      textAlign: "center" as const,
    }),
    [isDark]
  );

  const iconContainerStyle = useMemo(
    () => ({
      width: "60px",
      height: "60px",
      borderRadius: "12px",
      background: "linear-gradient(135deg, #5865f2 0%, #4752d4 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.5rem",
      boxShadow: "0 4px 12px rgba(88, 101, 242, 0.3)",
      transform: isHovered ? "scale(1.1) rotate(5deg)" : "scale(1)",
      transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
    }),
    [isHovered]
  );

  // Memoize event handlers
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  return (
    <Link
      href={href}
      className={`group no-underline ${className ?? ""}`}
      style={{ width: "100%", textDecoration: "none" }}
      aria-label={title}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div style={cardStyles}>
        {icon ? (
          <div style={iconContainerStyle}>
            {icon}
          </div>
        ) : (
          <div style={iconContainerStyle}>
            <span style={{ fontSize: "28px" }}>📦</span>
          </div>
        )}
        <div className="flex flex-col items-center gap-1 flex-1">
          <div style={titleStyle}>
            {title}
          </div>
          {subtitle && (
            <div style={subtitleStyle}>
              {subtitle}
            </div>
          )}
        </div>
        <div
          style={{
            position: "absolute",
            right: "1.5rem",
            top: "50%",
            transform: "translateY(-50%)",
            opacity: isHovered ? 1 : 0,
            transition: "all 300ms ease",
          }}
        >
          <ChevronRight
            size={20}
            color="#5865f2"
            strokeWidth={2}
          />
        </div>
      </div>
    </Link>
  );
}
