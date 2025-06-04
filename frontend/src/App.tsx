import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./pages/layout/Layout";
import Home from "./pages/home/Home";
import Dashboard from "./pages/dashboard/Dashboard";
import DashboardServer from "./pages/dashboard/DashboardServer";
import Sidebar from "./components/custom/Sidebar";

export const BACKEND_URL = "http://localhost:6969";

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="dashboard/:id" element={<Sidebar />}>
              <Route index element={<DashboardServer />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}
