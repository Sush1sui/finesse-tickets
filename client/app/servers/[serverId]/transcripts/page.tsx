"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { useTranscripts } from "../../../../lib/hooks/useTranscripts";

function formatTimestamp(ts: number): string {
  if (!ts) return "—";
  return new Date(ts * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function TranscriptsPage() {
  const params = useParams();
  const serverId = params.serverId as string;
  const [page, setPage] = useState(1);
  const limit = 20;

  const { transcripts, pagination, isLoading } = useTranscripts(
    serverId,
    page,
    limit,
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href={`/servers/${serverId}`}
            className="text-zinc-500 hover:text-zinc-700"
          >
            ← Back
          </Link>
          <h1 className="text-lg font-semibold text-zinc-900">Transcripts</h1>
        </div>
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-zinc-500">Loading transcripts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/servers/${serverId}`}
          className="text-zinc-500 hover:text-zinc-700"
        >
          ← Back
        </Link>
        <h1 className="text-lg font-semibold text-zinc-900">Transcripts</h1>
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between text-sm text-zinc-500">
          <span>
            {pagination.total > 0
              ? `${pagination.total} transcript${pagination.total > 1 ? "s" : ""}`
              : "No transcripts"}
          </span>
          {pagination.pages > 1 && (
            <span>
              Page {pagination.page} of {pagination.pages}
            </span>
          )}
        </div>

        <div className="mb-2 grid grid-cols-[1fr_1.5fr_1fr_1fr_1fr_0.75fr] gap-3 text-sm font-medium text-zinc-600">
          <span>Ticket</span>
          <span>User ID</span>
          <span>Messages</span>
          <span>Closed At</span>
          <span>Closed By</span>
          <span>Actions</span>
        </div>

        <div className="space-y-2">
          {transcripts.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">
              No transcripts found.
            </p>
          ) : (
            transcripts.map((t) => (
              <div
                key={t.id}
                className="grid grid-cols-[1fr_1.5fr_1fr_1fr_1fr_0.75fr] items-center gap-3 rounded-md border border-zinc-100 px-3 py-2 text-sm"
              >
                <span className="font-mono text-xs text-zinc-700">
                  {t.ticketId || `#${t.id}`}
                </span>
                <span className="font-mono text-xs text-zinc-900">
                  {t.userId || "Unknown"}
                </span>
                <span className="text-zinc-600">{t.totalMessages}</span>
                <span className="text-zinc-600">
                  {formatTimestamp(t.closedAt)}
                </span>
                <span className="truncate text-zinc-600">{t.closedBy}</span>
                <span>
                  <Link
                    href={`/servers/${serverId}/transcripts/${t.id}`}
                    className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-50"
                  >
                    View
                  </Link>
                </span>
              </div>
            ))
          )}
        </div>

        {pagination.pages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-zinc-500">
              {page} / {pagination.pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
