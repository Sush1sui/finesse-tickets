import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./pages/layout/Layout";
import Home from "./pages/home/Home";
import Dashboard from "./pages/dashboard/Dashboard";
import DashboardServer from "./pages/dashboard/DashboardServer";
import { DiscordServerProvider } from "./context/DiscordServerContext";

export const BACKEND_URL = "http://localhost:6969";

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <DiscordServerProvider>
                <Layout />
              </DiscordServerProvider>
            }
          >
            <Route index element={<Home />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="dashboard/:id" element={<DashboardServer />}></Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}
