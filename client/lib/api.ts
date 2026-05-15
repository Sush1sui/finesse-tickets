export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8080";

const fetchApi = async <T>(
  endpoint: string,
  options: RequestInit = {},
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
      fetchApi<{
        user: import("./context/auth/types").User | null;
        authorized?: boolean;
      }>("/api/auth/me"),
    servers: () => fetchApi<{ servers: ServerSummary[] }>("/api/auth/servers"),
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

  panels: {
    list: (serverId: string) =>
      fetchApi<PanelConfig[]>(`/api/servers/${serverId}/panels`),
    listMulti: (serverId: string) =>
      fetchApi<MultiPanelConfig[]>(`/api/servers/${serverId}/multi-panels`),
    get: (serverId: string, panelId: string) =>
      fetchApi<PanelDetail>(`/api/servers/${serverId}/panels/${panelId}`),
    create: (serverId: string, payload: CreatePanelPayload) =>
      fetchApi<PanelConfig>(`/api/servers/${serverId}/panels`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: (serverId: string, panelId: string, payload: CreatePanelPayload) =>
      fetchApi<PanelConfig>(`/api/servers/${serverId}/panels/${panelId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    delete: (serverId: string, panelId: string) =>
      fetchApi<{ status: string }>(
        `/api/servers/${serverId}/panels/${panelId}`,
        {
          method: "DELETE",
        },
      ),
  },

  multiPanels: {
    list: (serverId: string) =>
      fetchApi<MultiPanelConfig[]>(`/api/servers/${serverId}/multi-panels`),
    get: (serverId: string, multiPanelId: string) =>
      fetchApi<MultiPanelDetail>(
        `/api/servers/${serverId}/multi-panels/${multiPanelId}`,
      ),
    create: (serverId: string, payload: MultiPanelPayload) =>
      fetchApi<MultiPanelConfig>(`/api/servers/${serverId}/multi-panels`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: (
      serverId: string,
      multiPanelId: string,
      payload: MultiPanelPayload,
    ) =>
      fetchApi<MultiPanelConfig>(
        `/api/servers/${serverId}/multi-panels/${multiPanelId}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        },
      ),
    delete: (serverId: string, multiPanelId: string) =>
      fetchApi<{ status: string }>(
        `/api/servers/${serverId}/multi-panels/${multiPanelId}`,
        {
          method: "DELETE",
        },
      ),
  },

  guildMeta: {
    all: (serverId: string) =>
      fetchApi<GuildMetaResponse>(`/api/servers/${serverId}/meta`),
    roles: (serverId: string) =>
      fetchApi<DiscordRole[]>(`/api/servers/${serverId}/meta/roles`),
    channels: (serverId: string) =>
      fetchApi<DiscordChannel[]>(`/api/servers/${serverId}/meta/channels`),
    categories: (serverId: string) =>
      fetchApi<DiscordChannel[]>(`/api/servers/${serverId}/meta/categories`),
    emojis: (serverId: string) =>
      fetchApi<DiscordEmoji[]>(`/api/servers/${serverId}/meta/emojis`),
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

type ServerConfigResponse =
  | ServerConfig
  | { config: ServerConfig; channels: DiscordChannel[] };

export type DiscordChannel = {
  id: string;
  name: string;
  type: number;
  parent_id: string;
};

export type DiscordRole = {
  id: string;
  name: string;
  color: number;
  position: number;
};

export type DiscordEmoji = {
  id: string;
  name: string;
  animated: boolean;
};

export type GuildMetaResponse = {
  roles: DiscordRole[];
  channels: DiscordChannel[];
  categories: DiscordChannel[];
};

export type PanelConfig = {
  ID: number;
  ServerConfigID: number;
  MentionRolesOnOpen: string[];
  CategoryID: { String: string; Valid: boolean };
  Title: string;
  Content: { String: string; Valid: boolean };
  EmbedColor: number;
  ChannelID: string;
  BtnColor: string;
  BtnTxt: string;
  BtnEmoji: { String: string; Valid: boolean };
  LargeImgUrl: { String: string; Valid: boolean };
  SmallImgUrl: { String: string; Valid: boolean };
};

export type CreatePanelPayload = {
  mentionRolesOnOpen: string[];
  categoryId: string;
  title: string;
  content: string;
  embedColor: number;
  channelId: string;
  btnColor: string;
  btnTxt: string;
  btnEmoji: string;
  largeImgUrl: string;
  smallImgUrl: string;
  questions: string[];
  welcomeMessage: WelcomeMessagePayload;
};

export type PanelDetail = {
  mentionRolesOnOpen: string[];
  categoryId: string;
  title: string;
  content: string;
  embedColor: number;
  channelId: string;
  btnColor: string;
  btnTxt: string;
  btnEmoji: string;
  largeImgUrl: string;
  smallImgUrl: string;
  questions: string[];
  welcomeMessage: WelcomeMessagePayload | null;
};

export type WelcomeMessagePayload = {
  embedColor: number;
  title: string;
  description: string;
  titleUrl: string;
  largeImgUrl: string;
  smallImgUrl: string;
  footerText: string;
  footerIconUrl: string;
};

export type MultiPanelConfig = {
  ID: number;
  ServerConfigID: number;
  Title: string;
  Content: { String: string; Valid: boolean };
  EmbedColor: number;
  ChannelID: string;
  LargeImgUrl: { String: string; Valid: boolean };
  SmallImgUrl: { String: string; Valid: boolean };
  UseDropdown: boolean;
  PanelConfigIds: number[];
  Footer: { String: string; Valid: boolean };
  FootIconUrl: { String: string; Valid: boolean };
};

export type MultiPanelPayload = {
  title: string;
  content: string;
  embedColor: number;
  channelId: string;
  largeImgUrl: string;
  smallImgUrl: string;
  useDropdown: boolean;
  panelConfigIds: number[];
  footer: string;
  footIconUrl: string;
};

export type MultiPanelDetail = {
  title: string;
  content: string;
  embedColor: number;
  channelId: string;
  largeImgUrl: string;
  smallImgUrl: string;
  useDropdown: boolean;
  panelConfigIds: number[];
  footer: string;
  footIconUrl: string;
};
