import { createBrowserRouter, Navigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import Dashboard       from "@/pages/Dashboard";
import Backtests       from "@/pages/Backtests";
import Portfolio       from "@/pages/Portfolio";
import Strategies      from "@/pages/Strategies";
import PaperTrading    from "@/pages/PaperTrading";
import Analytics       from "@/pages/Analytics";
import AIInsights      from "@/pages/AIInsights";
import Settings        from "@/pages/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      { index: true,           element: <Dashboard />    },
      { path: "portfolio",     element: <Portfolio />    },
      { path: "strategies",    element: <Strategies />   },
      { path: "backtests",     element: <Backtests />    },
      { path: "paper-trading", element: <PaperTrading /> },
      { path: "analytics",     element: <Analytics />    },
      { path: "ai-insights",   element: <AIInsights />   },
      { path: "settings",      element: <Settings />     },
      { path: "*",             element: <Navigate to="/" replace /> },
    ],
  },
]);
