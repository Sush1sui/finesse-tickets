import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Types
interface Role {
  roleId: string;
  roleName: string;
  color?: number;
}

interface Category {
  categoryId: string;
  categoryName: string;
}

interface Channel {
  channelId: string;
  channelName: string;
  type?: number;
  parentId?: string | null;
}

interface Emoji {
  emojiId: string;
  emojiName: string;
  emojiAnimated: boolean;
  emojiUrl: string;
  emojiFormat: string;
}

interface Panel {
  _id: string;
  guild: string;
  channel: string;
  title: string;
  content: string | null;
  color: string;
  largeImgUrl: string | null;
  smallImgUrl: string | null;
  btnText: string;
  btnColor: string;
  btnEmoji: string | null;
  mentionOnOpen?: string[];
  ticketCategory?: string | null;
  category?: string | null;
  ticketChannel?: string | null;
  supportRole?: string | null;
  welcomeEmbed: {
    color: string;
    title: string | null;
    description: string | null;
    titleImgUrl: string | null;
    largeImgUrl: string | null;
    smallImgUrl: string | null;
    footerText: string | null;
    footerImgUrl: string | null;
  };
}

// Fetch Functions
async function fetchGuildData(guildId: string) {
  const response = await fetch(`/api/dashboard/guild/${guildId}/data`);
  if (!response.ok) throw new Error("Failed to fetch guild data");
  return response.json() as Promise<{
    roles: Role[];
    categories: Category[];
    channels: Channel[];
  }>;
}

async function fetchGuildEmojis(guildId: string) {
  const response = await fetch(`/api/dashboard/guild/${guildId}/emojis`);
  if (!response.ok) throw new Error("Failed to fetch emojis");
  return response.json() as Promise<Emoji[]>;
}

async function fetchGuildInfo(guildId: string) {
  const response = await fetch(`/api/dashboard/guild/${guildId}`);
  if (!response.ok) throw new Error("Failed to fetch guild info");
  return response.json() as Promise<{
    serverId: string;
    name: string;
    icon: string | null;
  }>;
}

async function fetchGuildChannels(guildId: string) {
  const response = await fetch(`/api/dashboard/guild/${guildId}/channels`);
  if (!response.ok) throw new Error("Failed to fetch channels");
  return response.json() as Promise<Channel[]>;
}

async function fetchPanels(guildId: string) {
  const response = await fetch(`/api/dashboard/guild/${guildId}/panels`);
  if (!response.ok) throw new Error("Failed to fetch panels");
  const data = await response.json();
  return (data.panels || []) as Panel[];
}

async function fetchPanel(panelId: string) {
  const response = await fetch(`/api/panels/${panelId}`);
  if (!response.ok) throw new Error("Failed to fetch panel");
  const data = await response.json();
  if (!data.panel) throw new Error("Panel not found");
  return data.panel as Panel;
}

// Custom Hooks

/**
 * Fetch and cache guild data (roles, categories, channels)
 * Data is shared across all pages for the same guild
 */
export function useGuildData(guildId: string) {
  return useQuery({
    queryKey: ["guild-data", guildId],
    queryFn: () => fetchGuildData(guildId),
    enabled: !!guildId,
    staleTime: 0, // Always fetch fresh
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

/**
 * Fetch and cache guild emojis
 */
export function useGuildEmojis(guildId: string) {
  return useQuery({
    queryKey: ["guild-emojis", guildId],
    queryFn: () => fetchGuildEmojis(guildId),
    enabled: !!guildId,
    staleTime: 0, // Always fetch fresh
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

/**
 * Fetch and cache guild info (name, icon, id)
 */
export function useGuildInfo(guildId: string) {
  return useQuery({
    queryKey: ["guild-info", guildId],
    queryFn: () => fetchGuildInfo(guildId),
    enabled: !!guildId,
  });
}

/**
 * Fetch and cache guild channels
 */
export function useGuildChannels(guildId: string) {
  return useQuery({
    queryKey: ["guild-channels", guildId],
    queryFn: () => fetchGuildChannels(guildId),
    enabled: !!guildId,
    staleTime: 0, // Always fetch fresh
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

/**
 * Fetch and cache panels for a guild
 */
export function usePanels(guildId: string) {
  return useQuery({
    queryKey: ["panels", guildId],
    queryFn: () => fetchPanels(guildId),
    enabled: !!guildId,
  });
}

/**
 * Fetch a single panel by ID
 */
export function usePanel(panelId: string) {
  return useQuery({
    queryKey: ["panel", panelId],
    queryFn: () => fetchPanel(panelId),
    enabled: !!panelId,
  });
}

/**
 * Create a new panel
 */
export function useCreatePanel(guildId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (panelData: any) => {
      const response = await fetch(`/api/dashboard/guild/${guildId}/panels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(panelData),
      });
      if (!response.ok) throw new Error("Failed to create panel");
      return response.json();
    },
    onSuccess: () => {
      // Invalidate panels cache to refetch the list
      queryClient.invalidateQueries({ queryKey: ["panels", guildId] });
    },
  });
}

/**
 * Update an existing panel
 */
export function useUpdatePanel(guildId: string, panelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (panelData: any) => {
      const response = await fetch(`/api/panels/${panelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(panelData),
      });
      if (!response.ok) throw new Error("Failed to update panel");
      return response.json();
    },
    onSuccess: () => {
      // Invalidate both the specific panel and the panels list
      queryClient.invalidateQueries({ queryKey: ["panel", panelId] });
      queryClient.invalidateQueries({ queryKey: ["panels", guildId] });
    },
  });
}

/**
 * Delete a panel
 */
export function useDeletePanel(guildId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (panelId: string) => {
      const response = await fetch(
        `/api/dashboard/guild/${guildId}/panels/${panelId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Failed to delete panel");
      return response.json();
    },
    onSuccess: () => {
      // Invalidate panels list
      queryClient.invalidateQueries({ queryKey: ["panels", guildId] });
    },
  });
}

/**
 * Send panel to Discord channel
 */
export function useSendPanel(guildId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (panelId: string) => {
      const response = await fetch(
        `/api/dashboard/guild/${guildId}/panels/${panelId}/send`,
        {
          method: "POST",
        }
      );
      if (!response.ok) throw new Error("Failed to send panel");
      return response.json();
    },
    onSuccess: () => {
      // Optionally refetch panels to update any status
      queryClient.invalidateQueries({ queryKey: ["panels", guildId] });
    },
  });
}

/**
 * Fetch and cache permitted servers list
 */
interface PermittedServer {
  id: string;
  name: string;
  icon: string | null;
}

async function fetchPermittedServers() {
  const response = await fetch("/api/dashboard/permitted-servers");
  if (!response.ok) throw new Error("Failed to fetch permitted servers");
  const data = await response.json();
  return (data.permittedServers || []) as PermittedServer[];
}

export function usePermittedServers() {
  return useQuery({
    queryKey: ["permitted-servers"],
    queryFn: fetchPermittedServers,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch and cache multi-panel configuration
 */
interface MultiPanel {
  channel: string | null;
  panels: string[];
  dropdownConfig: {
    use: boolean;
    placeholder: string | null;
  };
  messageEmbedConfig: {
    color: string;
    description: string | null;
    authorName: string | null;
    authorUrl: string | null;
    authorImgUrl: string | null;
    largeImgUrl: string | null;
    smallImgUrl: string | null;
    footerText: string | null;
    footerImgUrl: string | null;
  };
}

async function fetchMultiPanel(guildId: string) {
  const response = await fetch(`/api/dashboard/guild/${guildId}/multi-panel`, {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache",
    },
  });
  if (!response.ok) throw new Error("Failed to fetch multi-panel");
  const data = await response.json();
  return data.multiPanel as MultiPanel | null;
}

export function useMultiPanel(guildId: string) {
  return useQuery({
    queryKey: ["multi-panel", guildId],
    queryFn: () => fetchMultiPanel(guildId),
    enabled: !!guildId,
  });
}
