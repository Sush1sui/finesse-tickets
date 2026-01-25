export interface Role {
  roleId: string;
  roleName: string;
  color?: number;
}

export interface Category {
  categoryId: string;
  categoryName: string;
}

export interface Channel {
  channelId: string;
  channelName: string;
  type?: number;
  parentId?: string | null;
}

export interface Emoji {
  emojiId: string;
  emojiName: string;
  emojiAnimated: boolean;
  emojiUrl: string;
  emojiFormat: string;
}

export interface Panel {
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
  enableTranscripts?: boolean;
  askQuestions?: boolean;
  questions?: { id?: string; prompt: string }[];
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

export interface PermittedServer {
  id: string;
  name: string;
  icon: string | null;
}

export interface MultiPanel {
  channel: string | null;
  panels: string[];
  dropdownConfig: {
    use: boolean;
    placeholder: string | null;
  };
  messageEmbedConfig: {
    color: string;
    title: string;
    description: string;
    authorName: string | null;
    authorUrl: string | null;
    authorImgUrl: string | null;
    largeImgUrl: string | null;
    smallImgUrl: string | null;
    footerText: string | null;
    footerImgUrl: string | null;
  };
}

export interface GuildMember {
  userId: string;
  username: string;
  discriminator: string;
  displayName: string;
  avatar: string;
  bot: boolean;
}

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
  duration?: number;
}

// API response panel shape (from server)
export type ApiPanel = {
  _id: string;
  serverId?: string;
  guild?: string;
  channel: string;
  title: string;
  content?: string | null;
  color: string;
  largeImgUrl?: string | null;
  smallImgUrl?: string | null;
  btnText: string;
  btnColor: string;
  btnEmoji?: string | null;
  mentionOnOpen?: string[];
  ticketCategory?: string | null;
  category?: string | null;
  ticketChannel?: string | null;
  supportRole?: string | null;
  enableTranscripts?: boolean;
  askQuestions?: boolean;
  questions?: { id?: string; prompt: string }[];
  welcomeEmbed?: {
    color: string;
    title?: string | null;
    description?: string | null;
    titleImgUrl?: string | null;
    largeImgUrl?: string | null;
    smallImgUrl?: string | null;
    footerText?: string | null;
    footerImgUrl?: string | null;
  } | null;
};
