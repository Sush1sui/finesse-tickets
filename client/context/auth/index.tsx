"use client";

import { createContext, useContext } from "react";
import type { AuthContext as AuthContextType } from "./types";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export default function useAuth() {
  const context = useContext(AuthContext);
  if (!context || context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
