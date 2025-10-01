import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import { useAuth } from "@/context/AuthContext";
import { memo } from "react";
import { Link } from "react-router-dom";

export default memo(function Root() {
  const { user, login, authLoading } = useAuth();

  return (
    <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-12 text-center h-full">
      <h1 className="text-3xl font-bold mb-4">Discord Ticket System Bot</h1>

      <p className="text-base text-muted-foreground mb-6">
        A full-featured Discord ticket bot that centralizes support into private
        ticket channels, provides configurable staff access and customizable
        ticket workflows, and stores searchable transcripts for auditing.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto mb-8 text-sm text-left">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-foreground/10 text-foreground flex items-center justify-center">
            {/* ticket icon */}
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10V7a2 2 0 0 0-2-2h-3" />
              <path d="M3 14v3a2 2 0 0 0 2 2h3" />
              <path d="M7 7h10v10H7z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold">Panel with Buttons</h3>
            <p className="text-muted-foreground text-sm">
              Create private tickets via buttons from panels for quick support
              intake.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-foreground/10 text-foreground flex items-center justify-center">
            {/* shield icon */}
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2l7 4v6c0 5-3.8 9.7-7 10-3.2-.3-7-5-7-10V6l7-4z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold">Staff Controls</h3>
            <p className="text-muted-foreground text-sm">
              Grant helpers access to individual tickets and manage visibility
              per-channel.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-foreground/10 text-foreground flex items-center justify-center">
            {/* transcript icon */}
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15V6a2 2 0 0 0-2-2H7" />
              <path d="M3 9v11a2 2 0 0 0 2 2h11" />
              <path d="M7 13h8M7 17h5" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold">Transcripts & Logs</h3>
            <p className="text-muted-foreground text-sm">
              Export searchable transcripts for audits and record-keeping.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        {authLoading ? (
          <Spinner />
        ) : !user ? (
          <Button
            onClick={login}
            variant="outline"
            className="hidden sm:inline-flex cursor-pointer transition-colors duration-150 hover:bg-foreground hover:text-background dark:hover:bg-foreground dark:hover:text-background"
          >
            Login with Discord
          </Button>
        ) : (
          <Link
            to="/dashboard"
            className="inline-block px-4 py-2 rounded-md border border-border bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
            aria-label="Open dashboard"
          >
            Open dashboard
          </Link>
        )}
      </div>
    </main>
  );
});
