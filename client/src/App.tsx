import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { TooltipProvider } from "./components/ui/tooltip";
import Index from "./pages/index.tsx";
import AppLayout from "./pages/AppLayout.tsx";
import MonitoringPage from "./pages/MonitoringPage.tsx";
import DataDashboard from "./pages/DataDashboard.tsx";
import AnalysisMapView from "./pages/AnalysisMapView.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />

          {/* Tactical App Shell */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Navigate to="detect" replace />} />
            <Route path="detect" element={<MonitoringPage />} />
            <Route path="analysis" element={<AnalysisMapView />} />
            <Route path="dashboard" element={<DataDashboard />} />
            {/* Kept incident placeholder if needed, removed dashboard route as it is now integrated */}
            <Route
              path="incidents"
              element={
                <div className="text-primary font-mono p-4 text-xs tracking-widest animate-pulse">
                  &gt; SECURE LOG [SYSTEM OFFLINE]
                </div>
              }
            />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
