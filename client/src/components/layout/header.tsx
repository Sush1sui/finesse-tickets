import { memo, useState } from "react";
import { Button } from "../ui/button";
import { ModeToggle } from "../mode-toggle";
import { useAuth } from "@/context/AuthContext";

export default memo(function Header() {
  const { user, authLoading, logout, login } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full bg-background/90 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="text-lg font-extrabold tracking-tight text-foreground"
            >
              FINESSE TICKETS
            </a>

            <nav className="hidden sm:flex items-center gap-3 text-sm text-muted-foreground">
              <a href="/" className="px-2 py-1 rounded-md hover:bg-accent/40">
                Home
              </a>
              <a
                href="/dashboard"
                className="px-2 py-1 rounded-md hover:bg-accent/40"
              >
                Dashboard
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <ModeToggle />
            {/* Login Button */}
            {!authLoading ? (
              !user ? (
                <Button
                  variant="outline"
                  className="hidden sm:inline-flex"
                  onClick={login}
                >
                  Login
                </Button>
              ) : (
                <div className="relative">
                  {/* Profile dropdown */}
                  <button
                    aria-haspopup="menu"
                    aria-expanded={open}
                    onClick={() => setOpen((v) => !v)}
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-rose-500 text-white flex items-center justify-center text-sm font-semibold ring-1 ring-border overflow-hidden cursor-pointer"
                    title="Open profile menu"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={`${user.username ?? "User"}'s avatar`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="block text-sm font-semibold">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </button>

                  {open && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-2 w-44 bg-card border border-border rounded-md shadow-sm z-30 py-1"
                    >
                      <button
                        role="menuitem"
                        onClick={logout}
                        className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-accent/30 cursor-pointer"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )
            ) : (
              "Loading..."
            )}
          </div>
        </div>
      </div>
    </header>
  );
});
