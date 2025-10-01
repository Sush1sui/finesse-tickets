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
        method: "POST", // prefer POST for state-changing ops; server can still accept GET if needed
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      // If server issued a redirect (browser navigation), follow it after clearing client state
      if (response.redirected) {
        setUser(null);
        window.location.href = response.url;
        return;
      }

      if (!response.ok) {
        // try to read error body for debugging
        const text = await response.text().catch(() => "");
        console.error("Logout failed:", response.status, text);
        throw new Error("Logout failed.");
      }

      const data = await response.json();

      if (!data || data.message !== "Logged out") {
        console.error("Unexpected logout response:", data);
        throw new Error("Unexpected logout response.");
      }

      setUser(null);
      window.location.href = "/";
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
