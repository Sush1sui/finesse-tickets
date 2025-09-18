// libraries
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { memo } from "react";

// components
import Layout from "./components/layout/layout";

// pages
import Root from "./pages/(root)/root";
import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <BrowserRouter>
      {/* AuthProvider */}
      <AuthProvider>
        {/* ThemeProvider */}
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <Routes>
            {/* Routes */}
            <Route
              path="/"
              element={
                <Layout>
                  <Root />
                </Layout>
              }
            ></Route>
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default memo(App);
