"use client";

import Link from "next/link";
import { useTheme } from "next-themes";

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
  const isDark = resolvedTheme === "dark";

  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-2 no-underline group ${
        className ?? ""
      }`}
      style={{ width: "100%", maxWidth: "120px" }}
      aria-label={title}
    >
      <div
        className="w-24 h-24 rounded-lg flex items-center justify-center text-sm overflow-hidden transition-all duration-200 ease-out"
        style={{
          border: `1px solid ${
            isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"
          }`,
          backgroundColor: isDark ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.9)",
          color: isDark ? "#fff" : "#000",
          boxShadow: isDark
            ? "0 2px 8px rgba(0,0,0,0.4)"
            : "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        {icon ?? (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: isDark
                ? "linear-gradient(135deg, #1a1a1a 0%, #000 100%)"
                : "linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)",
            }}
          />
        )}
      </div>
      <div
        className="text-sm text-center font-medium transition-colors duration-200"
        style={{
          color: isDark ? "#fff" : "#000",
          maxWidth: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          className="text-xs text-center"
          style={{
            color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
            maxWidth: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {subtitle}
        </div>
      )}
      <style jsx>{`
        .group:hover > div:first-of-type {
          transform: translateY(-4px);
          box-shadow: ${isDark
            ? "0 8px 24px rgba(0,0,0,0.6)"
            : "0 8px 24px rgba(0,0,0,0.12)"};
          border-color: ${isDark
            ? "rgba(255,255,255,0.25)"
            : "rgba(0,0,0,0.25)"};
        }
      `}</style>
    </Link>
  );
}
