"use client";

import React from "react";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-900 pt-6 text-xs text-zinc-600 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-2">
        <img
          src="/assets/sushi_logo_without_bg.png"
          alt="Sushi Logo"
          className="h-5 w-5 object-contain select-none opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-300"
        />
        <span className="font-black text-zinc-500 uppercase tracking-widest">
          Sushi Tickets
        </span>
      </div>
      <div>
        © {new Date().getFullYear()} Sushi Tickets. Roll support out with
        sushi!
      </div>
    </footer>
  );
}
