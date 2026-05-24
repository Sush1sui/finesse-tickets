"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import {
  useTranscript,
  useTranscriptContent,
} from "../../../../../lib/hooks/useTranscripts";
import type { TranscriptMessage } from "../../../../../lib/api";

function formatTimestamp(ts: string | number): string {
  if (!ts) return "—";
  const date = typeof ts === "number" ? new Date(ts * 1000) : new Date(ts);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getAvatarUrl(author: TranscriptMessage["author"]): string {
  if (author.avatar) {
    return `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.png`;
  }
  const discrim = parseInt(author.discriminator || "0", 10);
  return `https://cdn.discordapp.com/embed/avatars/${discrim % 5}.png`;
}

function MessageContent({ message }: { message: TranscriptMessage }) {
  if (message.type === "system") {
    return (
      <div className="italic text-zinc-500 text-sm">{message.content}</div>
    );
  }

  if (message.type === "voice_join") {
    return (
      <div className="text-sm text-zinc-500">
        {message.author.username} joined the voice channel
      </div>
    );
  }

  if (message.type === "voice_leave") {
    return (
      <div className="text-sm text-zinc-500">
        {message.author.username} left the voice channel
      </div>
    );
  }

  return (
    <>
      {message.content && (
        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words text-zinc-900">
          {message.content}
        </div>
      )}

      {message.embeds && message.embeds.length > 0 && (
        <div className="mt-2 space-y-2">
          {message.embeds.map((embed, idx) => (
            <div
              key={idx}
              className="rounded border-l-4 border-indigo-500 bg-zinc-50 p-3 text-sm"
              style={{
                borderLeftColor: embed.color
                  ? `#${embed.color.toString(16).padStart(6, "0")}`
                  : undefined,
              }}
            >
              {embed.author && (
                <div className="mb-1 flex items-center gap-1 text-xs font-medium text-zinc-700">
                  {embed.author.iconUrl && (
                    <img
                      src={embed.author.iconUrl}
                      alt=""
                      className="h-4 w-4 rounded-full"
                    />
                  )}
                  {embed.author.url ? (
                    <a
                      href={embed.author.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline"
                    >
                      {embed.author.name}
                    </a>
                  ) : (
                    <span>{embed.author.name}</span>
                  )}
                </div>
              )}
              {embed.title && (
                <div className="mb-1 font-semibold text-zinc-900">
                  {embed.url ? (
                    <a
                      href={embed.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline"
                    >
                      {embed.title}
                    </a>
                  ) : (
                    embed.title
                  )}
                </div>
              )}
              {embed.description && (
                <div className="mb-2 whitespace-pre-wrap text-zinc-700">
                  {embed.description}
                </div>
              )}
              {embed.fields && embed.fields.length > 0 && (
                <div
                  className="mb-2 grid gap-2"
                  style={{
                    gridTemplateColumns: embed.fields.some((f) => f.inline)
                      ? "repeat(auto-fill, minmax(200px, 1fr))"
                      : "1fr",
                  }}
                >
                  {embed.fields.map((field, fIdx) => (
                    <div key={fIdx}>
                      <div className="text-xs font-semibold text-zinc-800">
                        {field.name}
                      </div>
                      <div className="whitespace-pre-wrap text-zinc-700">
                        {field.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {embed.image && (
                <img
                  src={embed.image.url}
                  alt=""
                  className="mt-2 max-h-72 max-w-full rounded-lg object-contain"
                />
              )}
              {embed.footer && (
                <div className="mt-2 flex items-center gap-1 text-xs text-zinc-500">
                  {embed.footer.iconUrl && (
                    <img
                      src={embed.footer.iconUrl}
                      alt=""
                      className="h-4 w-4 rounded-full"
                    />
                  )}
                  {embed.footer.text}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {message.attachments && message.attachments.length > 0 && (
        <div className="mt-2 space-y-2">
          {message.attachments.map((att) => (
            <div key={att.id}>
              {att.contentType?.startsWith("image/") ? (
                <img
                  src={att.url}
                  alt={att.filename}
                  className="max-h-72 max-w-full rounded-lg object-contain"
                />
              ) : (
                <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs text-indigo-600 hover:underline"
                >
                  <span>📎</span>
                  {att.filename}
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {message.reactions && message.reactions.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {message.reactions.map((reaction, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-0.5 rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-xs"
            >
              {reaction.emoji}
              <span className="text-zinc-500">{reaction.count}</span>
            </span>
          ))}
        </div>
      )}
    </>
  );
}

export default function TranscriptViewerPage() {
  const params = useParams();
  const serverId = params.serverId as string;
  const transcriptId = params.transcriptId as string;

  const {
    transcript,
    isLoading: metaLoading,
    isError: metaError,
  } = useTranscript(serverId, transcriptId);

  const {
    content,
    isLoading: contentLoading,
    isError: contentError,
  } = useTranscriptContent(serverId, transcriptId);

  if (metaLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href={`/servers/${serverId}/transcripts`}
            className="text-zinc-500 hover:text-zinc-700"
          >
            ← Back
          </Link>
          <h1 className="text-lg font-semibold text-zinc-900">Transcript</h1>
        </div>
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-zinc-500">Loading transcript...</p>
        </div>
      </div>
    );
  }

  if (metaError || !transcript) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href={`/servers/${serverId}/transcripts`}
            className="text-zinc-500 hover:text-zinc-700"
          >
            ← Back
          </Link>
          <h1 className="text-lg font-semibold text-zinc-900">Transcript</h1>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-600">
            Failed to load transcript. It may not exist.
          </p>
        </div>
      </div>
    );
  }

  const ticketLabel = transcript.ticketId || `#${transcript.id}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/servers/${serverId}/transcripts`}
          className="text-zinc-500 hover:text-zinc-700"
        >
          ← Back
        </Link>
        <h1 className="text-lg font-semibold text-zinc-900">
          Ticket {ticketLabel}
        </h1>
      </div>

      {/* Metadata */}
      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900">
          Ticket Information
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3 md:grid-cols-6">
          <div>
            <div className="text-xs uppercase text-zinc-500">Opened</div>
            <div className="font-medium text-zinc-900">
              {formatTimestamp(transcript.openedAt)}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase text-zinc-500">Closed</div>
            <div className="font-medium text-zinc-900">
              {formatTimestamp(transcript.closedAt)}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase text-zinc-500">Closed By</div>
            <div className="font-medium text-zinc-900">
              {transcript.closedBy}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase text-zinc-500">Messages</div>
            <div className="font-medium text-zinc-900">
              {transcript.totalMessages}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase text-zinc-500">Attachments</div>
            <div className="font-medium text-zinc-900">
              {transcript.totalAttachments}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase text-zinc-500">Embeds</div>
            <div className="font-medium text-zinc-900">
              {transcript.totalEmbeds}
            </div>
          </div>
        </div>
      </section>

      {/* Conversation */}
      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900">
          Conversation
        </h2>

        {contentLoading && (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-zinc-500">Loading messages...</p>
          </div>
        )}

        {contentError && (
          <div className="rounded border border-red-200 bg-red-50 p-4 text-center">
            <p className="text-sm text-red-600">
              Failed to load message content. The stored transcript may be
              unavailable.
            </p>
          </div>
        )}

        {content && (
          <div className="space-y-4">
            {content.messages.map((msg, idx) => (
              <div
                key={`${msg.id}-${idx}`}
                className="flex gap-3 rounded-lg border border-zinc-100 p-3"
              >
                <img
                  src={getAvatarUrl(msg.author)}
                  alt={msg.author.username}
                  className="h-10 w-10 flex-shrink-0 rounded-full"
                />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-zinc-900">
                      {msg.author.username}
                    </span>
                    {msg.author.bot && (
                      <span className="rounded bg-indigo-500 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                        Bot
                      </span>
                    )}
                    <span className="text-xs text-zinc-400">
                      {formatTimestamp(msg.timestamp)}
                    </span>
                    {msg.edited && (
                      <span className="text-xs italic text-zinc-400">
                        (edited)
                      </span>
                    )}
                  </div>
                  <MessageContent message={msg} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
