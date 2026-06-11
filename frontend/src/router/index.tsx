import { createBrowserRouter, Navigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import Dashboard       from "@/pages/Dashboard";
import Backtests       from "@/pages/Backtests";
import Portfolio       from "@/pages/Portfolio";
import Strategies      from "@/pages/Strategies";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      { index: true,        element: <Dashboard />  },
      { path: "backtests",  element: <Backtests />  },
      { path: "portfolio",  element: <Portfolio />  },
      { path: "strategies", element: <Strategies /> },
      { path: "*",          element: <Navigate to="/" replace /> },
    ],
  },
]);
