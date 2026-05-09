"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

import { AuthContext } from "../../context/auth";
import type { User } from "../../context/auth/types";

// Keep dev working even if env name drifts.
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8080";

type AuthMeResponse = {
  user: User | null;
  authorized?: boolean;
};

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const loadUser = useCallback(async () => {
    setAuthLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        credentials: "include",
      });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = (await res.json()) as AuthMeResponse;
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  const login = useCallback(() => {
    // API handles OAuth and sets HttpOnly cookie.
    window.location.href = `${API_BASE}/api/auth/login`;
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, authLoading, login, logout }),
    [user, authLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
