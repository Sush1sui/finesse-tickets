"use client";

import { useEffect, useState } from "react";
import useAuth from "../context/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

type ServerSummary = {
  id: string;
  name: string;
  iconUrl: string;
};

type ServersResponse = {
  servers: ServerSummary[];
};

export default function Home() {
  const { user, authLoading, login, logout } = useAuth();
  const [servers, setServers] = useState<ServerSummary[]>([]);
  const [serversLoading, setServersLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setServers([]);
      return;
    }

    let cancelled = false;
    const loadServers = async () => {
      setServersLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/auth/servers`, {
          credentials: "include",
        });
        if (!res.ok) {
          if (!cancelled) {
            setServers([]);
          }
          return;
        }
        const data = (await res.json()) as ServersResponse;
        if (!cancelled) {
          setServers(data.servers ?? []);
        }
      } finally {
        if (!cancelled) {
          setServersLoading(false);
        }
      }
    };

    void loadServers();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
        <h1 className="text-2xl font-semibold">Discord Auth</h1>

        {authLoading ? (
          <p className="text-sm text-zinc-600">Loading session...</p>
        ) : user ? (
          <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4">
            <div>
              <p className="text-sm text-zinc-500">Signed in</p>
              <p className="text-base font-medium">{user.name}</p>
            </div>
            <button
              className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm text-white"
            onClick={login}
          >
            Login with Discord
          </button>
        )}

        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Permitted servers</h2>
            {serversLoading && (
              <span className="text-xs text-zinc-500">Loading...</span>
            )}
          </div>
          {user ? (
            <ul className="mt-3 space-y-2">
              {servers.length === 0 ? (
                <li className="text-sm text-zinc-500">No servers found.</li>
              ) : (
                servers.map((server) => (
                  <li
                    key={server.id}
                    className="flex items-center gap-3 rounded-md border border-zinc-100 px-3 py-2"
                  >
                    {server.iconUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={server.iconUrl}
                        alt={server.name}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-xs">
                        {server.name.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">{server.name}</p>
                      <p className="text-xs text-zinc-500">{server.id}</p>
                    </div>
                  </li>
                ))
              )}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-zinc-500">Login to view servers.</p>
          )}
        </section>
      </main>
    </div>
  );
}
