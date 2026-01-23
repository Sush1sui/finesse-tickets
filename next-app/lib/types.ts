export type CustomEmoji = {
  emojiId: string;
  emojiName: string;
  emojiAnimated: boolean;
  emojiUrl: string;
  emojiFormat: string;
};

export type Role = {
  roleId: string;
  roleName: string;
};

export type Category = {
  categoryId: string;
  categoryName: string;
};

export type Channel = {
  channelId: string;
  channelName: string;
};

export type GuildData = {
  roles: Role[];
  categories: Category[];
  channels: Channel[];
  guild?: {
    id: string;
    name: string;
    icon: string;
  };
};
