"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, ScrollText, Calendar, ShieldAlert, MessagesSquare, Paperclip, AppWindow } from "lucide-react";

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
      <div className="italic text-zinc-400 text-sm font-semibold flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
        {message.content}
      </div>
    );
  }

  if (message.type === "voice_join") {
    return (
      <div className="text-sm text-emerald-400 font-semibold flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        {message.author.username} joined the voice channel
      </div>
    );
  }

  if (message.type === "voice_leave") {
    return (
      <div className="text-sm text-zinc-500 font-semibold flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
        {message.author.username} left the voice channel
      </div>
    );
  }

  return (
    <>
      {message.content && (
        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words text-zinc-100 font-medium">
          {message.content}
        </div>
      )}

      {message.embeds && message.embeds.length > 0 && (
        <div className="mt-2.5 space-y-3">
          {message.embeds.map((embed, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-white/5 border-l-4 bg-zinc-950/40 p-4 text-sm shadow-inner"
              style={{
                borderLeftColor: embed.color
                  ? `#${embed.color.toString(16).padStart(6, "0")}`
                  : "#FF5A36",
              }}
            >
              {embed.author && (
                <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-zinc-300">
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
                      className="text-[#FF5A36] hover:underline"
                    >
                      {embed.author.name}
                    </a>
                  ) : (
                    <span>{embed.author.name}</span>
                  )}
                </div>
              )}
              {embed.title && (
                <div className="mb-1.5 font-extrabold text-zinc-100 tracking-tight">
                  {embed.url ? (
                    <a
                      href={embed.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FF5A36] hover:underline"
                    >
                      {embed.title}
                    </a>
                  ) : (
                    embed.title
                  )}
                </div>
              )}
              {embed.description && (
                <div className="mb-3 whitespace-pre-wrap text-zinc-300 font-medium leading-relaxed">
                  {embed.description}
                </div>
              )}
              {embed.fields && embed.fields.length > 0 && (
                <div
                  className="mb-3 grid gap-3"
                  style={{
                    gridTemplateColumns: embed.fields.some((f) => f.inline)
                      ? "repeat(auto-fill, minmax(180px, 1fr))"
                      : "1fr",
                  }}
                >
                  {embed.fields.map((field, fIdx) => (
                    <div key={fIdx} className="bg-zinc-950/20 p-2.5 rounded-xl border border-white/2">
                      <div className="text-xs font-extrabold text-zinc-300">
                        {field.name}
                      </div>
                      <div className="whitespace-pre-wrap text-zinc-400 font-medium mt-1 leading-relaxed text-xs">
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
                  className="mt-2.5 max-h-72 max-w-full rounded-xl object-contain border border-white/5"
                />
              )}
              {embed.footer && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-zinc-400 font-semibold border-t border-white/2 pt-2">
                  {embed.footer.iconUrl && (
                    <img
                      src={embed.footer.iconUrl}
                      alt=""
                      className="h-4 w-4 rounded-full"
                    />
                  )}
                  <span>{embed.footer.text}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {message.attachments && message.attachments.length > 0 && (
        <div className="mt-2.5 space-y-2.5">
          {message.attachments.map((att) => (
            <div key={att.id}>
              {att.contentType?.startsWith("image/") ? (
                <img
                  src={att.url}
                  alt={att.filename}
                  className="max-h-72 max-w-full rounded-xl object-contain border border-white/5"
                />
              ) : (
                <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-950/40 px-3.5 py-2 text-xs font-bold text-[#FF5A36] hover:bg-zinc-950/60 hover:text-white transition-all shadow-sm"
                >
                  <span className="text-xs">📎</span>
                  {att.filename}
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {message.reactions && message.reactions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {message.reactions.map((reaction, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-zinc-950/40 px-2.5 py-1 text-xs font-bold text-zinc-300"
            >
              <span>{reaction.emoji}</span>
              <span className="text-zinc-400">{reaction.count}</span>
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
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-bold text-zinc-300 hover:text-white transition-all shadow-sm"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="text-base font-extrabold uppercase text-white tracking-tight">Transcript</h1>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="h-6 w-6 rounded-full border-2 border-zinc-700 border-t-[#FF5A36] animate-spin" />
            <p className="text-xs text-zinc-400 font-semibold animate-pulse">Loading transcript...</p>
          </div>
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
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-bold text-zinc-300 hover:text-white transition-all shadow-sm"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="text-base font-extrabold uppercase text-white tracking-tight">Transcript</h1>
        </div>
        <div className="rounded-2xl border border-red-500/20 bg-red-950/20 p-6 text-center shadow-lg">
          <p className="text-sm text-red-400 font-bold">
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
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-bold text-zinc-300 hover:text-white transition-all shadow-sm shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="text-lg font-black text-white uppercase tracking-tight text-glow-sushi/10">
          Ticket {ticketLabel}
        </h1>
      </div>

      {/* Metadata */}
      <section className="rounded-2xl border border-white/5 bg-zinc-900/10 backdrop-blur-md p-5 shadow-xl">
        <h2 className="mb-4 text-xs font-extrabold uppercase tracking-widest text-[#FF5A36] text-glow-sushi/10">
          Ticket Information
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3 md:grid-cols-6">
          <div className="bg-zinc-950/20 p-3 rounded-xl border border-white/2 shadow-inner">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Opened
            </div>
            <div className="font-bold text-zinc-100 mt-1.5 text-xs truncate">
              {formatTimestamp(transcript.openedAt)}
            </div>
          </div>
          <div className="bg-zinc-950/20 p-3 rounded-xl border border-white/2 shadow-inner">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Closed
            </div>
            <div className="font-bold text-zinc-100 mt-1.5 text-xs truncate">
              {formatTimestamp(transcript.closedAt)}
            </div>
          </div>
          <div className="bg-zinc-950/20 p-3 rounded-xl border border-white/2 shadow-inner">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 flex items-center gap-1">
              <ShieldAlert className="h-3 w-3" /> Closed By
            </div>
            <div className="font-bold text-zinc-100 mt-1.5 text-xs truncate">
              {transcript.closedBy}
            </div>
          </div>
          <div className="bg-zinc-950/20 p-3 rounded-xl border border-white/2 shadow-inner">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 flex items-center gap-1">
              <MessagesSquare className="h-3 w-3" /> Messages
            </div>
            <div className="font-bold text-zinc-100 mt-1.5 text-xs">
              {transcript.totalMessages}
            </div>
          </div>
          <div className="bg-zinc-950/20 p-3 rounded-xl border border-white/2 shadow-inner">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 flex items-center gap-1">
              <Paperclip className="h-3 w-3" /> Attachments
            </div>
            <div className="font-bold text-zinc-100 mt-1.5 text-xs">
              {transcript.totalAttachments}
            </div>
          </div>
          <div className="bg-zinc-950/20 p-3 rounded-xl border border-white/2 shadow-inner">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 flex items-center gap-1">
              <AppWindow className="h-3 w-3" /> Embeds
            </div>
            <div className="font-bold text-zinc-100 mt-1.5 text-xs">
              {transcript.totalEmbeds}
            </div>
          </div>
        </div>
      </section>

      {/* Conversation */}
      <section className="rounded-2xl border border-white/5 bg-zinc-900/10 backdrop-blur-md p-6 shadow-xl">
        <h2 className="mb-4 text-xs font-extrabold uppercase tracking-widest text-[#FF5A36] text-glow-sushi/10">
          Conversation Log
        </h2>

        {contentLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="h-6 w-6 rounded-full border-2 border-zinc-700 border-t-[#FF5A36] animate-spin" />
              <p className="text-xs text-zinc-400 font-semibold animate-pulse">Loading messages...</p>
            </div>
          </div>
        )}

        {contentError && (
          <div className="rounded-2xl border border-red-500/20 bg-red-950/20 p-6 text-center shadow-lg">
            <p className="text-sm text-red-400 font-bold leading-relaxed">
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
                className="flex gap-4 rounded-2xl border border-white/5 bg-zinc-950/20 px-4 py-4 shadow-sm transition-all duration-200 hover:bg-zinc-950/40 hover:border-white/10"
              >
                <img
                  src={getAvatarUrl(msg.author)}
                  alt={msg.author.username}
                  className="h-10 w-10 shrink-0 rounded-full border border-white/10 ring-2 ring-white/5 shadow-sm"
                />
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-zinc-100 tracking-tight">
                      {msg.author.username}
                    </span>
                    {msg.author.bot && (
                      <span className="rounded-md bg-[#5865F2] px-1.5 py-0.5 text-[9px] font-black uppercase text-white tracking-wider">
                        Bot
                      </span>
                    )}
                    <span className="text-[11px] font-semibold text-zinc-400">
                      {formatTimestamp(msg.timestamp)}
                    </span>
                    {msg.edited && (
                      <span className="text-[11px] font-medium italic text-zinc-500">
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
