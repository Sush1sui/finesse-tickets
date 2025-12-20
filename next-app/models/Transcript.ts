import mongoose, { Document, Model, Schema } from "mongoose";

// Message types
export interface TranscriptMessage {
  id: string;
  type:
    | "message"
    | "embed"
    | "attachment"
    | "voice_join"
    | "voice_leave"
    | "system";
  author: {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    bot: boolean;
  };
  content: string | null;
  timestamp: Date;
  embeds?: {
    title: string | null;
    description: string | null;
    url: string | null;
    color: number | null;
    fields: { name: string; value: string; inline: boolean }[];
    image: { url: string } | null;
    thumbnail: { url: string } | null;
    footer: { text: string; iconUrl: string | null } | null;
    author: { name: string; url: string | null; iconUrl: string | null } | null;
  }[];
  attachments?: {
    id: string;
    filename: string;
    url: string;
    proxyUrl: string;
    size: number;
    contentType: string | null;
    width: number | null;
    height: number | null;
  }[];
  edited: boolean;
  editedTimestamp: Date | null;
  reactions?: {
    emoji: string;
    count: number;
  }[];
}

export interface ITranscript extends Document {
  ticketId: string;
  guildId: string;
  channelId: string;
  panelId: string;
  userId: string;
  username: string;
  ticketNumber: number;
  messages: TranscriptMessage[];
  voiceActivity?: {
    userId: string;
    username: string;
    joinedAt: Date;
    leftAt: Date | null;
    duration: number; // in seconds
  }[];
  metadata: {
    ticketOpenedAt: Date;
    ticketClosedAt: Date;
    closedBy: {
      id: string;
      username: string;
    };
    totalMessages: number;
    totalAttachments: number;
    totalEmbeds: number;
    participants: {
      id: string;
      username: string;
      messageCount: number;
    }[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const TranscriptSchema = new Schema<ITranscript>(
  {
    ticketId: { type: String, required: true, index: true },
    guildId: { type: String, required: true, index: true },
    channelId: { type: String, required: true },
    panelId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    username: { type: String, required: true },
    ticketNumber: { type: Number, required: true },
    messages: {
      type: [
        {
          id: { type: String, required: true },
          type: {
            type: String,
            enum: [
              "message",
              "embed",
              "attachment",
              "voice_join",
              "voice_leave",
              "system",
            ],
            required: true,
          },
          author: {
            id: { type: String, required: true },
            username: { type: String, required: true },
            discriminator: { type: String, default: "0" },
            avatar: { type: String, default: null },
            bot: { type: Boolean, default: false },
          },
          content: { type: String, default: null },
          timestamp: { type: Date, required: true },
          embeds: {
            type: [
              {
                title: { type: String, default: null },
                description: { type: String, default: null },
                url: { type: String, default: null },
                color: { type: Number, default: null },
                fields: [
                  {
                    name: { type: String, required: true },
                    value: { type: String, required: true },
                    inline: { type: Boolean, default: false },
                  },
                ],
                image: {
                  type: {
                    url: { type: String, required: true },
                  },
                  default: null,
                },
                thumbnail: {
                  type: {
                    url: { type: String, required: true },
                  },
                  default: null,
                },
                footer: {
                  type: {
                    text: { type: String, required: true },
                    iconUrl: { type: String, default: null },
                  },
                  default: null,
                },
                author: {
                  type: {
                    name: { type: String, required: true },
                    url: { type: String, default: null },
                    iconUrl: { type: String, default: null },
                  },
                  default: null,
                },
              },
            ],
            default: [],
          },
          attachments: {
            type: [
              {
                id: { type: String, required: true },
                filename: { type: String, required: true },
                url: { type: String, required: true },
                proxyUrl: { type: String, required: true },
                size: { type: Number, required: true },
                contentType: { type: String, default: null },
                width: { type: Number, default: null },
                height: { type: Number, default: null },
              },
            ],
            default: [],
          },
          edited: { type: Boolean, default: false },
          editedTimestamp: { type: Date, default: null },
          reactions: {
            type: [
              {
                emoji: { type: String, required: true },
                count: { type: Number, required: true },
              },
            ],
            default: [],
          },
        },
      ],
      default: [],
    },
    voiceActivity: {
      type: [
        {
          userId: { type: String, required: true },
          username: { type: String, required: true },
          joinedAt: { type: Date, required: true },
          leftAt: { type: Date, default: null },
          duration: { type: Number, default: 0 },
        },
      ],
      default: [],
    },
    metadata: {
      ticketOpenedAt: { type: Date, required: true },
      ticketClosedAt: { type: Date, required: true },
      closedBy: {
        id: { type: String, required: true },
        username: { type: String, required: true },
      },
      totalMessages: { type: Number, default: 0 },
      totalAttachments: { type: Number, default: 0 },
      totalEmbeds: { type: Number, default: 0 },
      participants: {
        type: [
          {
            id: { type: String, required: true },
            username: { type: String, required: true },
            messageCount: { type: Number, default: 0 },
          },
        ],
        default: [],
      },
    },
  },
  { timestamps: true }
);

// Compound indexes for efficient queries
TranscriptSchema.index({ guildId: 1, createdAt: -1 });
TranscriptSchema.index({ userId: 1, guildId: 1 });
TranscriptSchema.index({ panelId: 1, guildId: 1 });

// Delete existing model to force schema refresh
if (mongoose.models.Transcript) {
  delete mongoose.models.Transcript;
}

const Transcript: Model<ITranscript> = mongoose.model<ITranscript>(
  "Transcript",
  TranscriptSchema
);

export default Transcript;
