"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import useAuth from "../../../lib/context/auth";
import { useServers } from "../../../lib/hooks/useServers";
import LoadingScreen from "../../../components/LoadingScreen";
import {
	Settings,
	LayoutGrid,
	ScrollText,
	Users,
	ChevronLeft,
} from "lucide-react";

const navItems = [
	{ href: "", label: "Settings", icon: Settings, description: "Ticket configuration" },
	{ href: "/panels", label: "Ticket Panels", icon: LayoutGrid, description: "Manage panels" },
	{ href: "/transcripts", label: "Transcripts", icon: ScrollText, description: "View history" },
	{ href: "/staffs", label: "Staff Members", icon: Users, description: "Access control" },
];

export default function ServerLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const params = useParams();
	const pathname = usePathname();
	const router = useRouter();
	const { user, authLoading, logout } = useAuth();
	const { servers, isLoading: serversLoading } = useServers();

	const serverId = params.serverId as string;
	const server = servers.find((s) => s.id === serverId);

	if (authLoading || serversLoading) {
		return <LoadingScreen />;
	}

	if (!user || !server) {
		router.push("/servers");
		return null;
	}

	return (
		<div className="fixed inset-0 flex bg-[#07090E] text-zinc-100 font-sans selection:bg-[#FF5A36]/30 overflow-hidden">
			{/* Ambient glow */}
			<div className="fixed top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-[#FF5A36]/4 blur-[200px] pointer-events-none z-0" />
			<div className="fixed bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-violet-500/3 blur-[180px] pointer-events-none z-0" />

			{/* ── Sidebar ── */}
				<aside className="relative z-10 h-full w-64 shrink-0 flex flex-col border-r border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl overflow-y-auto">
					{/* Brand */}
					<div className="px-5 py-5 border-b border-zinc-800/50">
						<Link href="/" className="flex items-center gap-2.5 group">
							<span className="text-xl filter drop-shadow-[0_0_8px_rgba(255,90,54,0.5)] select-none group-hover:scale-110 transition-transform">
								🍣
							</span>
							<div className="flex flex-col">
								<span className="text-sm font-black tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent uppercase font-mono leading-none">
									Sushi Tickets
								</span>
								<span className="text-[9px] tracking-widest uppercase font-semibold text-[#FF5A36] leading-none mt-0.5">
									Premium Support
								</span>
							</div>
						</Link>
					</div>

					{/* Back to servers */}
					<div className="px-3 pt-4 pb-2">
						<Link
							href="/servers"
							className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40 transition-all group"
						>
							<ChevronLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
							All Servers
						</Link>
					</div>

					{/* Server identity */}
					<div className="mx-3 mb-4 rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3 flex items-center gap-3">
						{server.iconUrl ? (
							<img
								src={server.iconUrl}
								alt={server.name}
								className="h-9 w-9 rounded-full ring-2 ring-zinc-700/60 shrink-0"
							/>
						) : (
							<div className="h-9 w-9 rounded-full bg-zinc-800 ring-2 ring-zinc-700 flex items-center justify-center text-sm font-black text-zinc-400 select-none shrink-0">
								{server.name[0]?.toUpperCase()}
							</div>
						)}
						<div className="min-w-0">
							<p className="text-sm font-bold text-zinc-100 truncate">{server.name}</p>
							<p className="text-[10px] text-zinc-500 font-mono truncate">{serverId}</p>
						</div>
					</div>

					{/* Nav items */}
					<nav className="flex-1 px-3 space-y-1">
						<p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-3 mb-2">
							Dashboard
						</p>
						{navItems.map((item) => {
							const href = `/servers/${serverId}${item.href}`;
							const isActive =
								item.href === ""
									? pathname === `/servers/${serverId}`
									: pathname.startsWith(href);
							const Icon = item.icon;

							return (
								<Link
									key={href}
									href={href}
									className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
										isActive
											? "bg-[#FF5A36]/10 text-white border border-[#FF5A36]/20"
											: "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/40"
									}`}
								>
									<Icon
										className={`h-4 w-4 shrink-0 ${
											isActive ? "text-[#FF5A36]" : "group-hover:text-zinc-300"
										}`}
									/>
									<div>
										<p className={isActive ? "text-white" : ""}>{item.label}</p>
										<p className="text-[10px] font-normal text-zinc-600 group-hover:text-zinc-500">
											{item.description}
										</p>
									</div>
									{isActive && (
										<div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#FF5A36]" />
									)}
								</Link>
							);
						})}
					</nav>

					{/* User profile at bottom */}
					<div className="p-3 border-t border-zinc-800/50">
						<div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/40">
							{user.image ? (
								<img
									src={user.image}
									alt={user.name}
									className="h-7 w-7 rounded-full ring-1 ring-zinc-700/60 shrink-0"
								/>
							) : (
								<div className="h-7 w-7 rounded-full bg-zinc-800 ring-1 ring-zinc-700 flex items-center justify-center text-xs font-black text-zinc-400 select-none shrink-0">
									{user.name[0]?.toUpperCase()}
								</div>
							)}
							<div className="flex-1 min-w-0">
								<p className="text-xs font-semibold text-zinc-200 truncate">{user.name}</p>
								<p className="text-[10px] text-zinc-500">Discord</p>
							</div>
							<button
								onClick={logout}
								className="text-zinc-600 hover:text-zinc-300 transition-colors p-1 rounded-lg hover:bg-zinc-800/60"
								title="Logout"
							>
								<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
								</svg>
							</button>
						</div>
					</div>
				</aside>

			{/* ── Main Content ── */}
			<div className="relative z-10 flex-1 h-full overflow-y-auto flex flex-col">
				{/* Top bar */}
				<div className="sticky top-0 z-10 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl px-8 py-4 flex items-center justify-between shrink-0">
					<div>
						{(() => {
							const current = navItems.find((item) => {
								const href = `/servers/${serverId}${item.href}`;
								return item.href === ""
									? pathname === `/servers/${serverId}`
									: pathname.startsWith(href);
							});
							return (
								<>
									<h1 className="text-base font-black text-white tracking-tight">
										{current?.label ?? "Dashboard"}
									</h1>
									<p className="text-xs text-zinc-500">{current?.description}</p>
								</>
							);
						})()}
					</div>
				</div>

				{/* Page content */}
				<main className="flex-1 px-8 py-8">
					{children}
				</main>

				{/* Footer */}
				<footer className="px-8 py-5 border-t border-zinc-800/40 shrink-0">
					<p className="text-xs text-zinc-600">
						© 2026 Sushi Tickets. Built with{" "}
						<span className="text-[#FF5A36]">♥</span> using Finesse.
					</p>
				</footer>
			</div>
		</div>
	);
}
