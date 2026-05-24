"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import useAuth from "../../lib/context/auth";
import { useServers } from "../../lib/hooks/useServers";
import LoadingScreen from "../../components/LoadingScreen";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { ServerSummary } from "../../lib/api";
import { ChevronRight, ServerCrash, Settings } from "lucide-react";

function ServerCard({ server }: { server: ServerSummary }) {
	const router = useRouter();

	return (
		<button
			onClick={() => router.push(`/servers/${server.id}`)}
			className="group relative flex items-center gap-4 rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4 text-left backdrop-blur-sm hover:border-[#FF5A36]/40 hover:bg-zinc-900/80 transition-all duration-200 active:scale-[0.98] w-full"
		>
			{/* Server Icon */}
			{server.iconUrl ? (
				<img
					src={server.iconUrl}
					alt={server.name}
					className="h-12 w-12 rounded-full shrink-0 ring-2 ring-zinc-800 group-hover:ring-[#FF5A36]/30 transition-all"
				/>
			) : (
				<div className="h-12 w-12 rounded-full shrink-0 bg-zinc-800 ring-2 ring-zinc-700 group-hover:ring-[#FF5A36]/30 flex items-center justify-center text-lg font-black text-zinc-300 transition-all select-none">
					{server.name[0]?.toUpperCase()}
				</div>
			)}

			{/* Server Info */}
			<div className="flex-1 min-w-0">
				<p className="font-semibold text-zinc-100 text-sm truncate group-hover:text-white transition-colors">
					{server.name}
				</p>
				<p className="text-xs text-zinc-600 font-mono truncate mt-0.5">
					{server.id}
				</p>
			</div>

			{/* Arrow Icon */}
			<div className="flex items-center gap-1.5 shrink-0">
				<Settings className="h-3.5 w-3.5 text-zinc-600 group-hover:text-[#FF5A36] transition-colors" />
				<ChevronRight className="h-4 w-4 text-zinc-700 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
			</div>

			{/* Hover glow edge */}
			<div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ring-1 ring-inset ring-[#FF5A36]/10" />
		</button>
	);
}

export default function ServersPage() {
	const { user, authLoading } = useAuth();
	const { servers, isLoading } = useServers();

	if (authLoading || isLoading) {
		return <LoadingScreen />;
	}

	if (!user) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#07090E] text-zinc-100 font-sans">
				<span className="text-4xl select-none">🍣</span>
				<p className="text-zinc-400 text-sm">You need to log in first.</p>
				<Link
					href="/"
					className="rounded-lg bg-[#FF5A36] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#FF6B4A] transition-colors active:scale-95"
				>
					Go to Home
				</Link>
			</div>
		);
	}

	return (
		<div className="relative min-h-screen overflow-hidden bg-[#07090E] text-zinc-100 font-sans selection:bg-[#FF5A36]/30">
			{/* Background glow effects */}
			<div className="absolute top-[-10%] left-[-15%] h-[500px] w-[500px] rounded-full bg-[#FF5A36]/6 blur-[180px] pointer-events-none" />
			<div className="absolute bottom-[-10%] right-[-15%] h-[500px] w-[500px] rounded-full bg-emerald-500/3 blur-[180px] pointer-events-none" />

			<div className="relative mx-auto max-w-5xl px-6 py-8 md:py-16 flex flex-col min-h-screen justify-between gap-12">
				{/* Header */}
				<Navbar />

				{/* Page Content */}
				<main className="flex-1">
					{/* Page Title */}
					<div className="mb-10">
						<h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
							Your Servers
						</h1>
						<p className="text-zinc-500 text-sm mt-2">
							Select a server to manage its ticket settings.
						</p>
					</div>

					{/* Server Grid */}
					{servers.length === 0 ? (
						<div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
							<div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50">
								<ServerCrash className="h-7 w-7 text-zinc-600" />
							</div>
							<div>
								<p className="text-zinc-300 font-semibold text-sm">No servers found</p>
								<p className="text-zinc-600 text-xs mt-1">
									Make sure Sushi Tickets bot is added to at least one server.
								</p>
							</div>
							<a
								href="https://discord.com/oauth2/authorize"
								target="_blank"
								rel="noopener noreferrer"
								className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-xs font-semibold text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 transition-all"
							>
								Add Bot to Server
							</a>
						</div>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							{servers.map((server) => (
								<ServerCard key={server.id} server={server} />
							))}
						</div>
					)}
				</main>

				{/* Footer */}
				<Footer />
			</div>
		</div>
	);
}
