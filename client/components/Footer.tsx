"use client";

import React from "react";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-900 pt-6 text-xs text-zinc-600 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="select-none">🍣</span>
        <span className="font-black text-zinc-500 uppercase tracking-widest">
          Sushi Tickets
        </span>
      </div>
      <div>
        © {new Date().getFullYear()} Sushi Tickets. Roll support out with
        Finesse.
      </div>
    </footer>
  );
}
