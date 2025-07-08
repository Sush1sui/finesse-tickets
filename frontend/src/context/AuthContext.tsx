import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react"; // Added useCallback
import type { ReactNode } from "react";
import { BACKEND_URL } from "../App"; // Assuming BACKEND_URL is exported from App.tsx

// Define the user type based on what the backend sends
// You might need to adjust this based on the actual user object structure from your backend
export interface User {
  _id: string; // or id, depending on your backend
  discordId: string;
  username: string;
  avatar?: string;
  // Add other fields your backend might send like roles, email, etc.
}

export interface AdminServer {
  id: string;
  name: string;
  icon: string | null; // Icon can be null
  owner: boolean;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  fetchAdminServers: () => Promise<void>;
  adminServers: AdminServer[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [adminServers, setAdminServers] = useState<AdminServer[]>([]);

  const checkAuthStatus = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = useCallback(() => {
    // Redirect to backend Discord OAuth URL
    window.location.href = `${BACKEND_URL}/auth/discord`;
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/auth/logout`, {
        method: "GET", // Or POST, depending on your backend route setup
        credentials: "include",
      });
      if (response.ok) {
        setUser(null);
        setIsAuthenticated(false);
        setAdminServers([]); // Clear admin servers on logout
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
  }, []);

  const fetchAdminServers = useCallback(async () => {
    if (!isAuthenticated) return; // Prevent fetching if not authenticated

    setIsLoading(true); // Potentially remove or make conditional
    try {
      const response = await fetch(`${BACKEND_URL}/dashboard/admin-servers`, {
        credentials: "include", // Important to send cookies
      });
      if (response.ok) {
        const data = await response.json();
        // console.log(data);
        if (data.status === "success") {
          setAdminServers(data.data);
        } else {
          console.error("Failed to fetch admin servers:", data.message);
        }
      } else {
        console.error("Failed to fetch admin servers:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching admin servers:", error);
    } finally {
      setIsLoading(false); // Only set to false if set to true at the start of this function
    }
  }, [isAuthenticated]); // Add isAuthenticated as a dependency

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        checkAuthStatus,
        fetchAdminServers,
        adminServers,
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
