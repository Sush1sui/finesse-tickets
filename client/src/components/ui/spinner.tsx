import { memo } from "react";

type Size = "sm" | "md" | "lg" | "xl" | number;

type Props = {
  size?: Size;
  className?: string;
  label?: string; // accessible label for screen readers
  inline?: boolean;
};

const sizeMap: Record<Exclude<Size, number>, string> = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-10 h-10",
};

export default memo(function Spinner({
  size = "md",
  className = "",
  label = "Loading...",
  inline = false,
}: Props) {
  const isNumber = typeof size === "number";
  const baseClasses = `${
    inline ? "inline-block" : "block mx-auto"
  } animate-spin text-foreground/80 ${className}`;
  const sizeClasses = isNumber ? "" : sizeMap[size];

  const style = isNumber ? { width: size, height: size } : undefined;

  return (
    <span
      role="status"
      className={baseClasses + (sizeClasses ? ` ${sizeClasses}` : "")}
      style={style}
      aria-live="polite"
    >
      <svg
        aria-hidden="true"
        className="w-full h-full"
        viewBox="0 0 50 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          stroke="currentColor"
          strokeWidth="5"
          strokeOpacity="0.25"
        />
        <path
          d="M45 25a20 20 0 00-4.5-12.5"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
});
