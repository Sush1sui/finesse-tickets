import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { BACKEND_URL } from "../App"; // Assuming BACKEND_URL is exported from App.tsx

// Define the user type based on what the backend sends
// You might need to adjust this based on the actual user object structure from your backend
interface User {
  _id: string; // or id, depending on your backend
  discordId: string;
  username: string;
  avatar?: string;
  // Add other fields your backend might send like roles, email, etc.
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/auth/status`, {
        credentials: "include", // Important to send cookies
      });
      if (response.ok) {
        const data = await response.json();
        if (data.status === "success" && data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Failed to fetch auth status:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = () => {
    // Redirect to backend Discord OAuth URL
    window.location.href = `${BACKEND_URL}/auth/discord`;
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/auth/logout`, {
        method: "GET", // Or POST, depending on your backend route setup
        credentials: "include",
      });
      if (response.ok) {
        setUser(null);
        setIsAuthenticated(false);
        window.location.href = "/";
      } else {
        console.error("Logout failed:", await response.text());
        // Handle logout failure, maybe show a notification
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setIsLoading(false); // Ensure loading state is reset after logout attempt
    }
    // If redirection happens, the finally block's setIsLoading(false) might not be strictly necessary
    // as the page reloads, but it's kept here for robustness in case of future changes
    // where redirection might be conditional. However, for a direct redirect,
    // the new page load will reset isLoading via useEffect.
    // For clarity, if redirect is certain, the final setIsLoading(false) can be removed
    // or only be in error paths.
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
