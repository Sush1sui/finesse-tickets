import React from "react";
import { Link } from "react-router-dom";

type ServerCardProps = {
  to: string;
  title: string;
  icon?: React.ReactNode;
  subtitle?: string;
  className?: string;
};

export default function ServerCard({
  to,
  title,
  icon,
  subtitle,
  className,
}: ServerCardProps) {
  return (
    <Link
      to={to}
      className={`w-20 sm:w-24 flex flex-col items-center gap-2 no-underline ${
        className ?? ""
      }`}
      aria-label={title}
    >
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-md border border-border bg-card flex items-center justify-center text-sm text-foreground overflow-hidden transition-shadow hover:shadow-lg">
        {icon ?? (
          <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-600" />
        )}
      </div>
      <div className="text-xs text-center">{title}</div>
      {subtitle && <div className="text-[10px] text-center">{subtitle}</div>}
    </Link>
  );
}
