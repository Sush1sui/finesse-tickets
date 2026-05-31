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
				<h1 className="text-xl font-black tracking-tight text-white uppercase text-glow-sushi/10">Transcripts</h1>
				<p className="text-xs text-zinc-300 font-semibold mt-0.5">
					Saved conversation history from closed tickets.
				</p>
			</div>

			<div className="rounded-2xl border border-white/5 bg-zinc-900/10 backdrop-blur-md overflow-hidden shadow-2xl shadow-zinc-950/20">
				{/* Table header */}
				<div className="grid grid-cols-[1fr_1.4fr_0.7fr_1.3fr_1fr_auto] gap-3 items-center px-6 py-4 border-b border-white/5 bg-white/5">
					<span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">Ticket</span>
					<span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">User ID</span>
					<span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">Messages</span>
					<span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">Closed At</span>
					<span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">Closed By</span>
					<span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 text-center">Action</span>
				</div>

				{/* Rows */}
				{isLoading ? (
					<div className="flex items-center justify-center py-20">
						<div className="flex flex-col items-center gap-3">
							<div className="h-6 w-6 rounded-full border-2 border-zinc-700 border-t-[#FF5A36] animate-spin" />
							<p className="text-xs text-zinc-400 font-medium animate-pulse">Loading transcripts...</p>
						</div>
					</div>
				) : transcripts.length === 0 ? (
					<div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
						<div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/5 bg-zinc-950/40">
							<ScrollText className="h-5 w-5 text-zinc-500" />
						</div>
						<div>
							<p className="text-sm font-bold text-zinc-300">No transcripts yet</p>
							<p className="text-xs text-zinc-400 mt-1 font-medium leading-relaxed">
								Transcripts appear here when tickets are closed.
							</p>
						</div>
					</div>
				) : (
					<div className="divide-y divide-white/5">
						{transcripts.map((t) => (
							<div
								key={t.id}
								className="grid grid-cols-[1fr_1.4fr_0.7fr_1.3fr_1fr_auto] gap-3 items-center px-6 py-4.5 hover:bg-white/5 transition-all duration-200"
							>
								<span className="font-mono text-xs text-zinc-100 font-bold tracking-tight">
									{t.ticketId || `#${t.id}`}
								</span>
								<span className="font-mono text-xs text-zinc-400 font-bold truncate">
									{t.userId || "Unknown"}
								</span>
								<span className="text-xs text-zinc-200 font-bold pl-3">{t.totalMessages}</span>
								<span className="text-xs text-zinc-300 font-medium">
									{formatTimestamp(t.closedAt)}
								</span>
								<span className="text-xs text-zinc-300 font-semibold truncate">{t.closedBy}</span>
								<Link
									href={`/servers/${serverId}/transcripts/${t.id}`}
									className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all shadow-sm shrink-0"
								>
									<ExternalLink className="h-3.5 w-3.5" />
									View
								</Link>
							</div>
						))}
					</div>
				)}

				{/* Footer: count + pagination */}
				{!isLoading && (
					<div className="flex items-center justify-between px-6 py-4.5 border-t border-white/5 bg-white/2">
						<span className="text-xs text-zinc-400 font-bold">
							{pagination.total > 0
								? `${pagination.total} transcript${pagination.total > 1 ? "s" : ""}`
								: "No transcripts"}
						</span>

						{pagination.pages > 1 && (
							<div className="flex items-center gap-3.5">
								<button
									onClick={() => setPage((p) => Math.max(1, p - 1))}
									disabled={page === 1}
									className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
								>
									<ChevronLeft className="h-4 w-4" />
									Prev
								</button>
								<span className="text-xs text-zinc-300 font-bold font-mono">
									{page} / {pagination.pages}
								</span>
								<button
									onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
									disabled={page === pagination.pages}
									className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
								>
									Next
									<ChevronRight className="h-4 w-4" />
								</button>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
