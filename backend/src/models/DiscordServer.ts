import mongoose, { Schema, Document, Model } from "mongoose";

export interface DiscordServerType {
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
}

export interface DiscordServerDocument extends Document, DiscordServerType {}
export interface DiscordServerModel extends Model<DiscordServerDocument> {}

const DiscordServerSchema: Schema = new Schema({
  name: { type: String, required: true },
  guildId: { type: String, required: true, unique: true },
  icon: { type: String },
  ticketNameStyle: { type: String, default: "number" },
  ticketTranscriptChannelId: { type: String },
  maxTicketsPerUser: { type: Number, default: 5 },
  tickerPermissions: { type: [String], default: [] },
  autoCloseTicket: {
    enabled: { type: Boolean, default: false },
    closeWhenUserLeaves: { type: Boolean, default: false },
    sinceOpenWithNoResponse: { type: Number, default: 0 },
    sinceLastMessageWithNoResponse: { type: Number, default: 0 },
  },
});

export default mongoose.model<DiscordServerDocument, DiscordServerModel>(
  "DiscordServer",
  DiscordServerSchema
);
