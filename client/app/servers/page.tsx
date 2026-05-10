"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, type ServerSummary } from "../../lib/api";
import useAuth from "../../lib/context/auth";

export default function ServersPage() {
  const router = useRouter();
  const { user, authLoading, logout } = useAuth();
  const [servers, setServers] = useState<ServerSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    const fetchServers = async () => {
      try {
        const data = await api.auth.servers();
        if (!cancelled) setServers(data.servers ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchServers();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-zinc-600">Please login first</p>
        <Link href="/" className="text-sm text-indigo-600">
          Go to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">My Servers</h1>
          <p className="text-sm text-zinc-500">{user.name}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          >
            Home
          </Link>
          <button
            onClick={logout}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading servers...</p>
      ) : servers.length === 0 ? (
        <p className="text-sm text-zinc-500">No servers found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {servers.map((server) => (
            <button
              key={server.id}
              onClick={() => router.push(`/servers/${server.id}`)}
              className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-4 text-left hover:border-zinc-400"
            >
              {server.iconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={server.iconUrl}
                  alt={server.name}
                  className="h-12 w-12 rounded-full"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-lg font-medium">
                  {server.name[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-medium text-zinc-900">{server.name}</p>
                <p className="text-xs text-zinc-500">{server.id}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
