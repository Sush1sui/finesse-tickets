import mongoose, { Document, Model, Schema } from "mongoose";

export interface IServer extends Document {
  serverId: string;
  name: string;
  icon: string | null;
  ticketConfig: {
    ticketNameStyle: "num" | "name";
    ticketTranscript: string | null;
    maxTicketsPerUser: number;
    ticketPermissions: {
      attachments: boolean;
      links: boolean;
      reactions: boolean;
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
    };
    staffs: {
      users: string[];
      roles: string[];
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const ServerSchema = new Schema<IServer>(
  {
    serverId: { type: String, required: true, unique: true, index: true },
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
          title: { type: String, default: "Select a Panel" },
          description: {
            type: String,
            default: "Choose a panel to open a ticket",
          },
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

const Server: Model<IServer> =
  mongoose.models.Server || mongoose.model<IServer>("Server", ServerSchema);

export default Server;
