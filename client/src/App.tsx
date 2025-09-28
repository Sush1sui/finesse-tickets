// libraries
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { memo } from "react";

// context providers
import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider } from "./context/AuthContext";

// components
import Layout from "./components/layout/layout";
import GuildLayout from "./components/layout/guild-layout";

// pages
import Root from "./pages/(root)/root";
import Dashboard from "./pages/(dashboard)/dashboard";
import Settings from "./pages/(dashboard)/(server)/settings";

function App() {
  return (
    <BrowserRouter>
      {/* AuthProvider */}
      <AuthProvider>
        {/* ThemeProvider */}
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <Routes>
            {/* top-level layout */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Root />} />

              {/* Dashboard list page */}
              <Route path="dashboard" element={<Dashboard />} />

              {/* Guild-specific layout */}
              <Route path="dashboard/:guildId*" element={<GuildLayout />}>
                <Route index element={<Settings />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default memo(App);
