"use client";

import Link from "next/link";
import useAuth from "../context/auth";

export default function Home() {
  const { user, authLoading, login, logout } = useAuth();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50 px-4">
      <h1 className="text-3xl font-semibold text-zinc-900">FNS Tickets</h1>
      <p className="text-zinc-600">Discord ticket management bot</p>

      {user ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-zinc-700">Welcome, {user.name}</p>
          <div className="flex gap-3">
            <Link
              href="/servers"
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white"
            >
              My Servers
            </Link>
            <button
              onClick={logout}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={login}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white"
        >
          Login with Discord
        </button>
      )}
    </div>
  );
}
