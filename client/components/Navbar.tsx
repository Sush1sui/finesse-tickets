"use client";

import React from "react";
import useAuth from "../lib/context/auth";
import { LogOut } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-zinc-800/40 pb-5">
      <Link href="/">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(255,90,54,0.4)] select-none animate-bounce">
            🍣
          </span>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent uppercase font-mono">
              Sushi Tickets
            </span>
            <span className="text-[10px] tracking-widest uppercase font-semibold text-[#FF5A36] -mt-1">
              Premium Support
            </span>
          </div>
        </div>
      </Link>
      <div>
        {user && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-zinc-800/60 bg-zinc-900/30 px-3 py-1.5">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="h-5 w-5 rounded-full shrink-0 ring-1 ring-zinc-700/50"
                />
              ) : (
                <div className="h-5 w-5 rounded-full shrink-0 bg-zinc-800 ring-1 ring-zinc-700 flex items-center justify-center text-[10px] font-black text-zinc-400 select-none">
                  {user.name[0]?.toUpperCase()}
                </div>
              )}
              <span className="text-xs font-semibold text-zinc-300">
                {user.name}
              </span>
            </div>

            <div className="h-4 w-[1px] bg-zinc-800/60" />

            <button
              onClick={logout}
              className="group flex items-center gap-1.5 rounded-lg border border-zinc-800/80 bg-zinc-900/40 px-3.5 py-1.5 text-xs font-semibold text-zinc-400 hover:border-[#FF5A36]/40 hover:bg-[#FF5A36]/5 hover:text-white transition-all duration-300 active:scale-95"
            >
              <LogOut className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform text-zinc-500 group-hover:text-[#FF5A36]" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
