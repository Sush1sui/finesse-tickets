import mongoose, { Document } from "mongoose";

interface WelcomeEmbed {
  color: string; // hex color
  title: string | null;
  titleImgUrl: string | null;
  largeImgUrl: string | null;
  smallImgUrl: string | null;
  footerText: string | null;
  footerImgUrl: string | null;
}

export interface IPanel extends Document {
  serverId: string;
  channel: string; // channel ID for panel
  mentionOnOpen: boolean;
  ticketCategory: string | null; // channel ID for ticket category
  title: string;
  color: string; // hex color
  btnColor: "blue" | "green" | "red" | "gray";
  btnText: string;
  btnEmoji: string | null;
  largeImgUrl: string | null;
  smallImgUrl: string | null;
  welcomeEmbed: WelcomeEmbed | null;
}

const PanelSchema = new mongoose.Schema(
  {
    serverId: { type: String, required: true },
    channel: { type: String, required: true },
    mentionOnOpen: { type: Boolean, default: false },
    ticketCategory: { type: String, default: null },
    title: { type: String, required: true },
    color: { type: String, required: true },
    btnColor: {
      type: String,
      enum: ["blue", "green", "red", "gray"],
      required: true,
    },
    btnText: { type: String, required: true },
    btnEmoji: { type: String, default: null },
    largeImgUrl: { type: String, default: null },
    smallImgUrl: { type: String, default: null },
    welcomeEmbed: {
      type: {
        color: { type: String, required: true },
        title: { type: String, default: null },
        titleImgUrl: { type: String, default: null },
        largeImgUrl: { type: String, default: null },
        smallImgUrl: { type: String, default: null },
        footerText: { type: String, default: null },
        footerImgUrl: { type: String, default: null },
      },
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IPanel>("Panel", PanelSchema);
