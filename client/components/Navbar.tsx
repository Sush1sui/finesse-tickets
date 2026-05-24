"use client";

import React from "react";
import useAuth from "../lib/context/auth";
import { LogOut } from "lucide-react";

export default function Navbar() {
	const { user, logout } = useAuth();

	return (
		<header className="flex items-center justify-between border-b border-zinc-800/40 pb-5">
			<div className="flex items-center gap-2.5">
				<span className="text-2xl filter drop-shadow-[0_0_8px_rgba(255,90,54,0.4)] select-none animate-bounce">
					🍣
				</span>
				<div className="flex flex-col">
					<span className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent uppercase font-mono">
						Sushi Tickets
					</span>
					<span className="text-[10px] tracking-widest uppercase font-semibold text-[#FF5A36] -mt-1">
						Chef-Curated
					</span>
				</div>
			</div>
			<div>
				{user && (
					<button
						onClick={logout}
						className="group flex items-center gap-1.5 rounded-lg border border-zinc-800/80 bg-zinc-900/40 px-3.5 py-1.5 text-xs font-semibold text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition-all duration-300 active:scale-95"
					>
						<LogOut className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
						Logout
					</button>
				)}
			</div>
		</header>
	);
}
