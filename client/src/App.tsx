// libraries
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { memo } from "react";

// context providers
import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider } from "./context/AuthContext";

// components
import Layout from "./components/layout/layout";

// pages
import Root from "./pages/(root)/root";
import Dashboard from "./pages/(dashboard)/dashboard";

function App() {
  return (
    <BrowserRouter>
      {/* AuthProvider */}
      <AuthProvider>
        {/* ThemeProvider */}
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <Routes>
            {/* Routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Root />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default memo(App);
