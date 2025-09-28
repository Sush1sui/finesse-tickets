import mongoose, { Document } from "mongoose";

export interface IServer extends Document {
  serverId: string;
  name: string;
  icon: string | null;
  ticketConfig: {
    ticketNameStyle: "num" | "name";
    ticketTranscript: string | null; // channel ID for transcripts
    maxTicketsPerUser: number; // 0 for unlimited
    ticketPermissions: {
      attachments: boolean; // attach files
      links: boolean; // embed links
      reactions: boolean; // add reactions
    };
    autoClose: {
      enabled: boolean;
      closeWhenUserLeaves: boolean;
      sinceOpenWithoutResponse: {
        Days: number;
        Hours: number;
        Minutes: number;
      };
      sinceLastResponse: {
        Days: number;
        Hours: number;
        Minutes: number;
      };
    };
    multiPanels: {
      channel: string | null; // channel ID for multi panel
      panels: string[]; // array of panel IDs
      dropdownConfig: {
        use: boolean;
        placeholder: string | null;
      };
      messageEmbedConfig: {
        color: string; // hex color
        description: string | null;
        authorName: string | null;
        authorUrl: string | null;
        authorImgUrl: string | null;
        largeImgUrl: string | null;
        smallImgUrl: string | null;
        footerText: string | null;
        footerImgUrl: string | null;
      };
    };
    staffs: {
      users: string[]; // array of user IDs
      roles: string[]; // array of role IDs
    };
  };
}

const ServerSchema = new mongoose.Schema(
  {
    serverId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    icon: { type: String, default: null },
    ticketConfig: {
      ticketNameStyle: { type: String, enum: ["num", "name"], default: "num" },
      ticketTranscript: { type: String, default: null },
      maxTicketsPerUser: { type: Number, default: 0 },
      ticketPermissions: {
        attachments: { type: Boolean, default: false },
        links: { type: Boolean, default: false },
        reactions: { type: Boolean, default: false },
      },
      autoClose: {
        enabled: { type: Boolean, default: false },
        closeWhenUserLeaves: { type: Boolean, default: false },
        sinceOpenWithoutResponse: {
          Days: { type: Number, default: 0 },
          Hours: { type: Number, default: 0 },
          Minutes: { type: Number, default: 0 },
        },
        sinceLastResponse: {
          Days: { type: Number, default: 0 },
          Hours: { type: Number, default: 0 },
          Minutes: { type: Number, default: 0 },
        },
      },
      multiPanels: {
        channel: { type: String, default: null },
        panels: { type: [String], default: [] },
        dropdownConfig: {
          use: { type: Boolean, default: false },
          placeholder: { type: String, default: null },
        },
        messageEmbedConfig: {
          color: { type: String, default: "#000000" },
          description: { type: String, default: null },
          authorName: { type: String, default: null },
          authorUrl: { type: String, default: null },
          authorImgUrl: { type: String, default: null },
          largeImgUrl: { type: String, default: null },
          smallImgUrl: { type: String, default: null },
          footerText: { type: String, default: null },
          footerImgUrl: { type: String, default: null },
        },
      },
      staffs: {
        users: { type: [String], default: [] },
        roles: { type: [String], default: [] },
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IServer>("Server", ServerSchema);
