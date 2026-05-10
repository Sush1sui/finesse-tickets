export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8080";

const fetchApi = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json() as Promise<T>;
};

export const api = {
  auth: {
    me: () =>
      fetchApi<{ user: import("./context/auth/types").User | null; authorized?: boolean }>(
        "/api/auth/me"
      ),
    servers: () =>
      fetchApi<{ servers: ServerSummary[] }>("/api/auth/servers"),
    login: () => {
      window.location.href = `${API_BASE}/api/auth/login`;
    },
    logout: async () => {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    },
  },

  config: {
    get: (serverId: string, showChannels = false) => {
      const query = showChannels ? "?show_channels=true" : "";
      return fetchApi<ServerConfigResponse>(`/api/config/${serverId}${query}`);
    },
    update: (serverId: string, data: Partial<ServerConfig>) =>
      fetchApi<ServerConfig>(`/api/config/${serverId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },
};

export type ServerSummary = {
  id: string;
  name: string;
  iconUrl: string;
};

export type ServerConfig = {
  ID: number;
  TicketNameStyle: string;
  TicketTranscripts: string;
  MaxTicketsPerUser: number;
  TicketPermissionsAttachFiles: boolean;
  TicketPermissionsEmbedLinks: boolean;
  TicketPermissionsAddReactions: boolean;
  AutoClose: boolean;
  AutoCloseOnUserLeave: boolean;
  AutoCloseNoResponseDays: number;
  AutoCloseNoResponseHours: number;
  AutoCloseNoResponseMins: number;
  AutoCloseSinceLastMessageDays: number;
  AutoCloseSinceLastMessageHours: number;
  AutoCloseSinceLastMessageMins: number;
};

type ServerConfigResponse = ServerConfig | { config: ServerConfig; channels: DiscordChannel[] };

export type DiscordChannel = {
  id: string;
  name: string;
  type: number;
  parent_id: string;
};