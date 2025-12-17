import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { NextAuthProvider } from "@/components/providers/session-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AuthProvider } from "@/context/AuthContext";
import LayoutShell from "@/components/layout/layout-shell";

export const metadata: Metadata = {
  title: "Finesse Tickets",
  description: "Discord Ticket Bot Dashboard",
  icons: {
    icon: "/fns_logo.png",
    apple: "/fns_logo.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // get server session and forward to client SessionProvider so the
  // client is immediately aware of auth state after the OAuth redirect
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <NextAuthProvider session={session}>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <AuthProvider>
                <LayoutShell>{children}</LayoutShell>
              </AuthProvider>
            </ThemeProvider>
          </QueryProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
