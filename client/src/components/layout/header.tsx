import { memo, useState } from "react";
import { Button } from "../ui/button";
import { ModeToggle } from "../mode-toggle";
import { useAuth } from "@/context/AuthContext";
import Spinner from "../ui/spinner";
import { Link } from "react-router-dom";
import fns_logo from "../../assets/FNS_logo.gif";

export default memo(function Header() {
  const { user, authLoading, logout, login } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full bg-background/90 backdrop-blur-sm border-b border-border overflow-visible">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-lg font-extrabold tracking-tight text-foreground flex items-center gap-1"
            >
              <img
                src={fns_logo}
                alt="Finesse Tickets Logo"
                className="w-10 h-10"
              />
              FINESSE TICKETS
            </Link>

            <nav className="hidden sm:flex items-center gap-3 text-sm text-muted-foreground">
              <Link
                to="/"
                className="inline-block px-4 py-2 rounded-md border border-border bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
              >
                Home
              </Link>
              {user && (
                <Link
                  to="/dashboard"
                  className="inline-block px-4 py-2 rounded-md border border-border bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
                >
                  Dashboard
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <ModeToggle />
            {/* Login Button */}
            {!authLoading ? (
              !user ? (
                <Button
                  variant="outline"
                  className="hidden sm:inline-flex cursor-pointer transition-colors duration-150 hover:bg-foreground hover:text-background dark:hover:bg-foreground dark:hover:text-background"
                  onClick={login}
                >
                  Login
                </Button>
              ) : (
                <div className="relative z-99999 overflow-visible">
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
                      className="absolute right-0 mt-2 w-44 bg-card border border-border rounded-md shadow-sm z-[9999] py-1"
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
              <Spinner />
            )}
          </div>
        </div>
      </div>
    </header>
  );
});
