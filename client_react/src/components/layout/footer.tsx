import { memo } from "react";

export default memo(function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="text-center sm:text-left">
          <div className="text-base font-medium text-foreground">
            Finesse Tickets
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Simple, beautiful ticketing management.
          </p>
        </div>

        <div className="mt-4 border-t border-border/50 pt-3 text-xs text-muted-foreground flex flex-col sm:flex-row sm:justify-between items-center gap-2">
          <div>
            © {new Date().getFullYear()} Finesse Tickets. All rights reserved.
          </div>
          <div>Built with care — Do it with Finesse!</div>
        </div>
      </div>
    </footer>
  );
});
