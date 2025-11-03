"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
  useCallback,
} from "react";
import { useSession, signIn, signOut } from "next-auth/react";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  discordId: string;
}

interface AuthContextType {
  user: User | null;
  authLoading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        discordId: session.user.discordId,
      });
    } else {
      setUser(null);
    }
  }, [session]);

  // Memoize callback functions to prevent re-creating them on every render
  const login = useCallback(() => {
    signIn("discord", { callbackUrl: "/" });
  }, []);

  const logout = useCallback(() => {
    signOut({ callbackUrl: "/" });
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      user,
      authLoading: status === "loading",
      login,
      logout,
    }),
    [user, status, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
