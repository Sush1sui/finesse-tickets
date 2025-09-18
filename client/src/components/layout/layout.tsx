import React, { memo } from "react";
import Header from "./header";
import Footer from "./footer";

type Props = { children: React.ReactNode };

export default memo(function Layout({ children }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
});
