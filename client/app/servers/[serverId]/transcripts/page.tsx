"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { useTranscripts } from "../../../../lib/hooks/useTranscripts";
import { ScrollText, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

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

	const { transcripts, pagination, isLoading } = useTranscripts(serverId, page, limit);

	return (
		<div className="space-y-5 pb-6">
			{/* Header */}
			<div className="mb-2">
				<h1 className="text-xl font-black tracking-tight text-white">Transcripts</h1>
				<p className="text-xs text-zinc-500 mt-0.5">
					Saved conversation history from closed tickets.
				</p>
			</div>

			<div className="rounded-xl border border-zinc-800/60 bg-zinc-900/20 backdrop-blur-sm overflow-hidden">
				{/* Table header */}
				<div className="grid grid-cols-[1fr_1.4fr_0.7fr_1.3fr_1fr_auto] gap-3 items-center px-5 py-3 border-b border-zinc-800/60 bg-zinc-900/40">
					<span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Ticket</span>
					<span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">User ID</span>
					<span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Messages</span>
					<span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Closed At</span>
					<span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Closed By</span>
					<span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">View</span>
				</div>

				{/* Rows */}
				{isLoading ? (
					<div className="flex items-center justify-center py-16">
						<div className="flex flex-col items-center gap-3">
							<div className="h-6 w-6 rounded-full border-2 border-zinc-700 border-t-[#FF5A36] animate-spin" />
							<p className="text-xs text-zinc-500">Loading transcripts...</p>
						</div>
					</div>
				) : transcripts.length === 0 ? (
					<div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
						<div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50">
							<ScrollText className="h-5 w-5 text-zinc-600" />
						</div>
						<div>
							<p className="text-sm font-semibold text-zinc-400">No transcripts yet</p>
							<p className="text-xs text-zinc-600 mt-0.5">
								Transcripts appear here when tickets are closed.
							</p>
						</div>
					</div>
				) : (
					<div className="divide-y divide-zinc-800/40">
						{transcripts.map((t) => (
							<div
								key={t.id}
								className="grid grid-cols-[1fr_1.4fr_0.7fr_1.3fr_1fr_auto] gap-3 items-center px-5 py-3.5 hover:bg-zinc-900/30 transition-colors"
							>
								<span className="font-mono text-xs text-zinc-300 font-semibold">
									{t.ticketId || `#${t.id}`}
								</span>
								<span className="font-mono text-xs text-zinc-500 truncate">
									{t.userId || "Unknown"}
								</span>
								<span className="text-xs text-zinc-400">{t.totalMessages}</span>
								<span className="text-xs text-zinc-500">
									{formatTimestamp(t.closedAt)}
								</span>
								<span className="text-xs text-zinc-500 truncate">{t.closedBy}</span>
								<Link
									href={`/servers/${serverId}/transcripts/${t.id}`}
									className="flex items-center gap-1 rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-2.5 py-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all"
								>
									<ExternalLink className="h-3 w-3" />
									View
								</Link>
							</div>
						))}
					</div>
				)}

				{/* Footer: count + pagination */}
				{!isLoading && (
					<div className="flex items-center justify-between px-5 py-3.5 border-t border-zinc-800/50">
						<span className="text-xs text-zinc-600">
							{pagination.total > 0
								? `${pagination.total} transcript${pagination.total > 1 ? "s" : ""}`
								: "No transcripts"}
						</span>

						{pagination.pages > 1 && (
							<div className="flex items-center gap-2">
								<button
									onClick={() => setPage((p) => Math.max(1, p - 1))}
									disabled={page === 1}
									className="flex items-center gap-1 rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-2.5 py-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
								>
									<ChevronLeft className="h-3.5 w-3.5" />
									Prev
								</button>
								<span className="text-xs text-zinc-500 font-mono">
									{page} / {pagination.pages}
								</span>
								<button
									onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
									disabled={page === pagination.pages}
									className="flex items-center gap-1 rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-2.5 py-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
								>
									Next
									<ChevronRight className="h-3.5 w-3.5" />
								</button>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
