"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useAuth from "../../../context/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

type Server = { id: string; name: string; iconUrl: string };
type ServersRes = { servers: Server[] };

const navItems = [
  { href: "", label: "Settings" },
  { href: "/panels", label: "Ticket Panels" },
  { href: "/transcripts", label: "Transcripts" },
  { href: "/staffs", label: "Staff Members" },
];

export default function ServerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const { user, authLoading } = useAuth();
  const [server, setServer] = useState<Server | null>(null);
  const [loading, setLoading] = useState(true);

  const serverId = params.serverId as string;

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    const fetchServers = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/servers`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = (await res.json()) as ServersRes;
          const found = data.servers.find((s) => s.id === serverId);
          if (!cancelled) setServer(found ?? null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchServers();
    return () => {
      cancelled = true;
    };
  }, [user, serverId]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    );
  }

  if (!user || !server) {
    router.push("/servers");
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            {server.iconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={server.iconUrl}
                alt={server.name}
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-sm font-medium">
                {server.name[0]?.toUpperCase()}
              </div>
            )}
            <span className="font-medium text-zinc-900">{server.name}</span>
          </div>
          <nav className="flex gap-1">
            {navItems.map((item) => {
              const href = `/servers/${serverId}${item.href}`;
              return (
                <Link
                  key={href}
                  href={href}
                  className="rounded-md px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}