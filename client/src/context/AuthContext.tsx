import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface User {
  _id: string;
  discordId: string;
  username: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  authLoading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  const checkStatus = useCallback(async () => {
    setAuthLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.status === "ok" && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
      console.error("Error checking auth status:", error);
      alert("Error checking auth status. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const login = useCallback(() => {
    // Redirect to backend Discord OAuth URL
    window.location.href = `${API_BASE}/auth/discord`;
  }, [API_BASE]);

  const logout = useCallback(async () => {
    setAuthLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/logout`, {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        setUser(null);
        window.location.href = "/";
      } else {
        throw new Error("Logout failed.");
      }
    } catch (error) {
      alert("Error during logout. Please try again.");
      console.error("Error during logout:", error);
    } finally {
      setAuthLoading(false);
    }
  }, [API_BASE]);

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
