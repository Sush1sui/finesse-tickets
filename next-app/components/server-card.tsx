"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useState, useEffect, useMemo, useCallback } from "react";

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
  const [isActive, setIsActive] = useState(false);

  // Wait for component to mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;

  // Memoize style calculation
  const cardStyles = useMemo(() => {
    const baseStyles = {
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)",
      backgroundColor: isDark ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.9)",
      color: isDark ? "#fff" : "#000",
      boxShadow: isDark
        ? "0 2px 8px rgba(0,0,0,0.4)"
        : "0 2px 8px rgba(0,0,0,0.08)",
      transform: "translateY(0) scale(1)",
      transition:
        "transform 300ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1), border-color 300ms ease, background-color 300ms ease",
    };

    if (isActive) {
      return {
        ...baseStyles,
        transform: "translateY(-3px) scale(0.98)",
        boxShadow: isDark
          ? "0 8px 24px rgba(0,0,0,0.6)"
          : "0 8px 24px rgba(0,0,0,0.12)",
        borderColor: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)",
        backgroundColor: isDark ? "rgba(10,10,10,0.75)" : "rgba(245,245,245,1)",
      };
    }

    if (isHovered) {
      return {
        ...baseStyles,
        transform: "translateY(-8px) scale(1.05)",
        boxShadow: isDark
          ? "0 20px 50px rgba(0,0,0,0.7), 0 0 0 2px rgba(255,255,255,0.1)"
          : "0 20px 50px rgba(0,0,0,0.18), 0 0 0 2px rgba(0,0,0,0.08)",
        borderColor: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)",
        backgroundColor: isDark ? "rgba(20,20,20,0.85)" : "rgba(255,255,255,1)",
      };
    }

    return baseStyles;
  }, [isDark, isHovered, isActive]);

  // Memoize other styles
  const titleStyle = useMemo(
    () => ({
      color: isDark ? "#fff" : "#000",
      maxWidth: "100%",
      overflow: "hidden" as const,
      textOverflow: "ellipsis" as const,
      fontWeight: isHovered ? 600 : 500,
    }),
    [isDark, isHovered]
  );

  const subtitleStyle = useMemo(
    () => ({
      color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
      maxWidth: "100%",
      overflow: "hidden" as const,
      textOverflow: "ellipsis" as const,
    }),
    [isDark]
  );

  const placeholderStyle = useMemo(
    () => ({
      background: isDark
        ? "linear-gradient(135deg, #1a1a1a 0%, #000 100%)"
        : "linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)",
    }),
    [isDark]
  );

  // Memoize event handlers
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setIsActive(false);
  }, []);
  const handleMouseDown = useCallback(() => setIsActive(true), []);
  const handleMouseUp = useCallback(() => setIsActive(false), []);

  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-2 no-underline ${
        className ?? ""
      }`}
      style={{ width: "100%", maxWidth: "120px" }}
      aria-label={title}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div
        className="w-24 h-24 rounded-lg flex items-center justify-center text-sm overflow-hidden"
        style={cardStyles}
      >
        {icon ?? (
          <div
            className="w-full h-full flex items-center justify-center"
            style={placeholderStyle}
          />
        )}
      </div>
      <div
        className="text-sm text-center transition-all duration-300"
        style={titleStyle}
      >
        {title}
      </div>
      {subtitle && (
        <div className="text-xs text-center" style={subtitleStyle}>
          {subtitle}
        </div>
      )}
    </Link>
  );
}
