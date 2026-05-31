import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function genId() {
  const webCrypto =
    typeof crypto !== "undefined"
      ? (crypto as Crypto & { randomUUID?: () => string })
      : undefined;

  if (webCrypto && typeof webCrypto.randomUUID === "function")
    return webCrypto.randomUUID();

  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
