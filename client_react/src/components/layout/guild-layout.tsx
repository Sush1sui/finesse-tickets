import { Outlet, useLocation, useParams } from "react-router-dom";
import Sidebar from "./sidebar";

type LocationState = {
  guildName?: string;
  guildIcon?: string | null;
};

export default function GuildLayout() {
  const params = useParams<{ discordServerId?: string; guildId?: string }>();
  const guildId = params.discordServerId ?? params.guildId ?? "";
  const location = useLocation();
  const state = (location.state as LocationState) || {};

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-[1200px] mx-auto flex gap-6">
        <Sidebar
          guildId={guildId}
          guildName={state.guildName}
          guildIcon={state.guildIcon}
        />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
