import { BACKEND_URL } from "../App";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useParams } from "react-router-dom";

export interface DiscordServer {
  _id: string;
  name: string;
  guildId: string;
  icon?: string;
  ticketNameStyle?: string;
  ticketTranscriptChannelId?: string;
  maxTicketsPerUser: number;
  tickerPermissions: string[];
  autoCloseTicket: {
    enabled: boolean;
    closeWhenUserLeaves: boolean;
    sinceOpenWithNoResponse: number;
    sinceLastMessageWithNoResponse: number;
  };
  channels: { id: string; name: string }[];
  roles: { id: string; name: string }[];
}

interface DiscordServerContextType {
  server: DiscordServer | null;
  isLoading: boolean;
  fetchServer: (serverId: string) => Promise<void>;
}

const DiscordServerContext = createContext<
  DiscordServerContextType | undefined
>(undefined);

export const DiscordServerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [server, setServer] = useState<DiscordServer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchServer(id);
      return;
    }
    setIsLoading(false);
  }, [id]);

  const fetchServer = useCallback(async (serverId: string) => {
    setIsLoading(true);
    setServer(null);
    try {
      const response = await fetch(`${BACKEND_URL}/server/${serverId}`, {
        credentials: "include", // Important to send cookies
      });
      if (response.ok) {
        const data = await response.json();
        setServer(data.data);
      } else {
        console.error("Failed to fetch server:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching server:", error);
    }
    setIsLoading(false);
  }, []);

  return (
    <DiscordServerContext.Provider value={{ server, isLoading, fetchServer }}>
      {children}
    </DiscordServerContext.Provider>
  );
};

export const useDiscordServer = () => {
  const context = useContext(DiscordServerContext);
  if (context === undefined) {
    throw new Error(
      "useDiscordServer must be used within a DiscordServerProvider"
    );
  }
  return context;
};
