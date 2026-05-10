"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

import { api } from "../../api";
import { AuthContext } from "../../context/auth";
import type { User } from "../../context/auth/types";

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
      const data = await api.auth.me();
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
    api.auth.login();
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
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
