import { NavLink, Link } from "react-router-dom";

type SidebarProps = {
  guildId: string;
  guildName?: string;
  guildIcon?: string | null;
  basePath?: string; // defaults to `/dashboard/guild/${guildId}`
  className?: string;
};

function getDiscordGuildIconUrl(
  guildId: string,
  iconHash?: string | null,
  size = 64
) {
  if (!iconHash) return undefined;
  const ext = iconHash.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/icons/${guildId}/${iconHash}.${ext}?size=${size}`;
}

export default function Sidebar({
  guildId,
  guildName,
  guildIcon,
  basePath,
  className,
}: SidebarProps) {
  const base = basePath ?? `/dashboard/guild/${guildId}`;
  const letter = (guildName?.[0] ?? "?").toUpperCase();

  const items = [
    { to: `${base}`, label: "Back to servers", exact: true },
    { to: `${base}/settings`, label: "Settings" },
    { to: `${base}/transcripts`, label: "Transcripts" },
    { to: `${base}/panels`, label: "Ticket Panels" },
    { to: `${base}/staff`, label: "Staff Members" },
  ];

  return (
    <aside
      className={`w-48 p-4 rounded-md border border-border bg-card flex-shrink-0 ${
        className ?? ""
      }`}
      aria-label="server sidebar"
    >
      <div className="flex items-center gap-3 mb-4">
        <Link to="/dashboard" className="inline-block">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-border flex items-center justify-center bg-slate-700 text-white">
            {guildIcon ? (
              <img
                src={getDiscordGuildIconUrl(guildId, guildIcon, 64)}
                alt={`${guildName ?? "Server"} icon`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-lg font-semibold">{letter}</span>
            )}
          </div>
        </Link>
        <div className="flex-1">
          <div className="text-sm font-semibold truncate">
            {guildName ?? "Server"}
          </div>
          <div className="text-[11px] text-muted-foreground">Server</div>
        </div>
      </div>

      <nav className="space-y-1">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.exact}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-md text-sm no-underline ${
                isActive
                  ? "bg-indigo-500/10 border border-indigo-400"
                  : "hover:bg-slate-100"
              }`
            }
          >
            <span className="w-4 text-center text-xs">•</span>
            <span className="truncate">{it.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
