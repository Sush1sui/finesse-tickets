"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useTheme } from "next-themes";
import GuildSidebar from "@/components/guild-sidebar";
import { Spinner } from "@/components/ui/spinner";

type TranscriptAuthor = {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  bot: boolean;
};

type TranscriptMessage = {
  id: string;
  type: string;
  author: TranscriptAuthor;
  content: string | null;
  timestamp: string;
  embeds?: {
    title?: string;
    description?: string;
    [key: string]: unknown;
  }[];
  attachments?: {
    id: string;
    url: string;
    filename: string;
    contentType?: string;
  }[];
  edited: boolean;
  reactions?: { emoji: string; count: number }[];
};

type Transcript = {
  _id: string;
  ticketId: string;
  ticketNumber: number;
  username: string;
  userId: string;
  messages: TranscriptMessage[];
  metadata: {
    ticketOpenedAt: string;
    ticketClosedAt: string;
    totalMessages: number;
    totalAttachments: number;
    totalEmbeds: number;
    closedBy: {
      username: string;
    };
    participants: {
      id: string;
      username: string;
      messageCount: number;
    }[];
  };
};

export default function TranscriptViewerPage() {
  const params = useParams();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [guildName, setGuildName] = useState("Server Name");

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;
  const guildId = useMemo(() => params?.guildId as string, [params?.guildId]);
  const transcriptId = useMemo(
    () => params?.transcriptId as string,
    [params?.transcriptId]
  );

  useEffect(() => {
    const fetchTranscript = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/transcripts/${transcriptId}`);
        if (response.ok) {
          const data = await response.json();
          setTranscript(data);
        }
      } catch (error) {
        console.error("Error fetching transcript:", error);
      } finally {
        setLoading(false);
      }
    };

    if (transcriptId) {
      fetchTranscript();
    }
  }, [transcriptId]);

  const getAvatarUrl = (author: TranscriptAuthor) => {
    if (!author.avatar) {
      return `https://cdn.discordapp.com/embed/avatars/${
        parseInt(author.discriminator) % 5
      }.png`;
    }
    return `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.png`;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const styles = useMemo(
    () => ({
      container: {
        minHeight: "60vh",
        display: "flex",
        gap: "2rem",
        padding: "1rem",
      } as React.CSSProperties,
      main: {
        flex: 1,
      } as React.CSSProperties,
      header: {
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        marginBottom: "1.5rem",
        paddingBottom: "1rem",
        borderBottom: isDark
          ? "1px solid rgba(255,255,255,0.1)"
          : "1px solid rgba(0,0,0,0.1)",
      } as React.CSSProperties,
      backButton: {
        padding: "0.5rem 1rem",
        borderRadius: "6px",
        border: isDark
          ? "1px solid rgba(255,255,255,0.2)"
          : "1px solid rgba(0,0,0,0.2)",
        background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
        color: isDark ? "#fff" : "#000",
        cursor: "pointer",
        fontSize: "0.875rem",
      } as React.CSSProperties,
      title: {
        fontSize: "1.5rem",
        fontWeight: "600",
      } as React.CSSProperties,
      card: {
        padding: "1.5rem",
        border: isDark
          ? "1px solid rgba(255,255,255,0.1)"
          : "1px solid rgba(0,0,0,0.1)",
        borderRadius: "12px",
        marginBottom: "1.5rem",
      } as React.CSSProperties,
      metadataGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
      } as React.CSSProperties,
      metadataItem: {
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
      } as React.CSSProperties,
      metadataLabel: {
        fontSize: "0.75rem",
        textTransform: "uppercase",
        opacity: 0.6,
        fontWeight: 600,
      } as React.CSSProperties,
      metadataValue: {
        fontSize: "0.9375rem",
        fontWeight: 500,
      } as React.CSSProperties,
      messagesContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      } as React.CSSProperties,
      message: {
        display: "flex",
        gap: "1rem",
        padding: "1rem",
        background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
        borderRadius: "8px",
        border: isDark
          ? "1px solid rgba(255,255,255,0.05)"
          : "1px solid rgba(0,0,0,0.05)",
      } as React.CSSProperties,
      avatar: {
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        flexShrink: 0,
      } as React.CSSProperties,
      messageContent: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      } as React.CSSProperties,
      messageHeader: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
      } as React.CSSProperties,
      username: {
        fontWeight: 600,
        fontSize: "0.9375rem",
      } as React.CSSProperties,
      bot: {
        background: "#5865F2",
        color: "#fff",
        padding: "0.125rem 0.375rem",
        borderRadius: "4px",
        fontSize: "0.625rem",
        fontWeight: 600,
        textTransform: "uppercase",
      } as React.CSSProperties,
      timestamp: {
        fontSize: "0.75rem",
        opacity: 0.6,
      } as React.CSSProperties,
      messageText: {
        fontSize: "0.9375rem",
        lineHeight: 1.5,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      } as React.CSSProperties,
      attachment: {
        marginTop: "0.5rem",
        padding: "0.75rem",
        background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
        borderRadius: "6px",
        fontSize: "0.875rem",
      } as React.CSSProperties,
      attachmentLink: {
        color: "#5865F2",
        textDecoration: "none",
      } as React.CSSProperties,
      image: {
        maxWidth: "400px",
        maxHeight: "300px",
        borderRadius: "8px",
        marginTop: "0.5rem",
      } as React.CSSProperties,
      embed: {
        marginTop: "0.5rem",
        padding: "1rem",
        borderLeft: "4px solid #5865F2",
        background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
        borderRadius: "4px",
      } as React.CSSProperties,
      reactions: {
        display: "flex",
        gap: "0.5rem",
        flexWrap: "wrap",
        marginTop: "0.5rem",
      } as React.CSSProperties,
      reaction: {
        padding: "0.25rem 0.5rem",
        background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
        borderRadius: "4px",
        fontSize: "0.875rem",
        display: "flex",
        alignItems: "center",
        gap: "0.25rem",
      } as React.CSSProperties,
    }),
    [isDark]
  );

  if (loading) {
    return (
      <div style={styles.container}>
        <GuildSidebar guildId={guildId} guildName={guildName} />
        <main style={styles.main}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "3rem",
            }}
          >
            <Spinner />
          </div>
        </main>
      </div>
    );
  }

  if (!transcript) {
    return (
      <div style={styles.container}>
        <GuildSidebar guildId={guildId} guildName={guildName} />
        <main style={styles.main}>
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <h2>Transcript not found</h2>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={styles.container} className="guild-layout">
      <GuildSidebar guildId={guildId} guildName={guildName} />

      <main style={styles.main}>
        <div style={styles.header}>
          <button
            style={styles.backButton}
            onClick={() =>
              router.push(`/dashboard/guild/${guildId}/transcripts`)
            }
          >
            ← Back
          </button>
          <h1 style={styles.title}>
            Ticket #{transcript.ticketNumber} - {transcript.username}
          </h1>
        </div>

        {/* Metadata Card */}
        <div style={styles.card}>
          <h2
            style={{
              fontSize: "1.125rem",
              fontWeight: 600,
              marginBottom: "1rem",
            }}
          >
            Ticket Information
          </h2>
          <div style={styles.metadataGrid}>
            <div style={styles.metadataItem}>
              <span style={styles.metadataLabel}>Opened At</span>
              <span style={styles.metadataValue}>
                {formatTime(transcript.metadata.ticketOpenedAt)}
              </span>
            </div>
            <div style={styles.metadataItem}>
              <span style={styles.metadataLabel}>Closed At</span>
              <span style={styles.metadataValue}>
                {formatTime(transcript.metadata.ticketClosedAt)}
              </span>
            </div>
            <div style={styles.metadataItem}>
              <span style={styles.metadataLabel}>Closed By</span>
              <span style={styles.metadataValue}>
                {transcript.metadata.closedBy.username}
              </span>
            </div>
            <div style={styles.metadataItem}>
              <span style={styles.metadataLabel}>Total Messages</span>
              <span style={styles.metadataValue}>
                {transcript.metadata.totalMessages}
              </span>
            </div>
            <div style={styles.metadataItem}>
              <span style={styles.metadataLabel}>Attachments</span>
              <span style={styles.metadataValue}>
                {transcript.metadata.totalAttachments}
              </span>
            </div>
            <div style={styles.metadataItem}>
              <span style={styles.metadataLabel}>Participants</span>
              <span style={styles.metadataValue}>
                {transcript.metadata.participants.length}
              </span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={styles.card}>
          <h2
            style={{
              fontSize: "1.125rem",
              fontWeight: 600,
              marginBottom: "1rem",
            }}
          >
            Conversation
          </h2>
          <div style={styles.messagesContainer}>
            {transcript.messages.map((message, index) => (
              <div key={`${message.id}-${index}`} style={styles.message}>
                <img
                  src={getAvatarUrl(message.author)}
                  alt={message.author.username}
                  style={styles.avatar}
                />
                <div style={styles.messageContent}>
                  <div style={styles.messageHeader}>
                    <span style={styles.username}>
                      {message.author.username}
                    </span>
                    {message.author.bot && <span style={styles.bot}>BOT</span>}
                    <span style={styles.timestamp}>
                      {formatTime(message.timestamp)}
                    </span>
                    {message.edited && (
                      <span
                        style={{ ...styles.timestamp, fontStyle: "italic" }}
                      >
                        (edited)
                      </span>
                    )}
                  </div>
                  {message.content && (
                    <div style={styles.messageText}>{message.content}</div>
                  )}
                  {message.embeds && message.embeds.length > 0 && (
                    <div>
                      {message.embeds.map((embed, idx) => (
                        <div key={idx} style={styles.embed}>
                          {embed.title && (
                            <div
                              style={{
                                fontWeight: 600,
                                marginBottom: "0.5rem",
                              }}
                            >
                              {embed.title}
                            </div>
                          )}
                          {embed.description && <div>{embed.description}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                  {message.attachments && message.attachments.length > 0 && (
                    <div>
                      {message.attachments.map((att) => (
                        <div key={att.id} style={styles.attachment}>
                          📎{" "}
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={styles.attachmentLink}
                          >
                            {att.filename}
                          </a>
                          {att.contentType?.startsWith("image/") && (
                            <div>
                              <img
                                src={att.url}
                                alt={att.filename}
                                style={styles.image}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {message.reactions && message.reactions.length > 0 && (
                    <div style={styles.reactions}>
                      {message.reactions.map((reaction, idx) => (
                        <div key={idx} style={styles.reaction}>
                          <span>{reaction.emoji}</span>
                          <span>{reaction.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
