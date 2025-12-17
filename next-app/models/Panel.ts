import mongoose, { Document, Model, Schema } from "mongoose";

interface WelcomeEmbed {
  color: string;
  title: string | null;
  description: string | null;
  titleImgUrl: string | null;
  largeImgUrl: string | null;
  smallImgUrl: string | null;
  footerText: string | null;
  footerImgUrl: string | null;
}

export interface IPanel extends Document {
  serverId: string;
  channel: string;
  mentionOnOpen: string[];
  ticketCategory: string | null;
  title: string;
  content: string;
  color: string;
  btnColor: "blue" | "green" | "red" | "gray";
  btnText: string;
  btnEmoji: string | null;
  largeImgUrl: string | null;
  smallImgUrl: string | null;
  welcomeEmbed: WelcomeEmbed | null;
  createdAt: Date;
  updatedAt: Date;
}

const PanelSchema = new Schema<IPanel>(
  {
    serverId: { type: String, required: true, index: true },
    channel: { type: String, required: true },
    mentionOnOpen: { type: [String], default: [] },
    ticketCategory: { type: String, default: null },
    title: { type: String, required: true },
    content: { type: String, default: "" },
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
        description: { type: String, default: null },
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

// Delete existing model to force schema refresh
if (mongoose.models.Panel) {
  delete mongoose.models.Panel;
}

const Panel: Model<IPanel> = mongoose.model<IPanel>("Panel", PanelSchema);

export default Panel;
