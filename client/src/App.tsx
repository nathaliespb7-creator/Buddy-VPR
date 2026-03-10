import { Router, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { SettingsProvider } from "@/context/SettingsContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";

const AppContent = () => {
  const [location] = useLocation();
  if (location === "/" || location.startsWith("/")) {
    return <Home />;
  }
  return <NotFound />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SettingsProvider>
      <TooltipProvider delayDuration={0}>
        <Router base="/">
          <AppContent />
        </Router>
      </TooltipProvider>
    </SettingsProvider>
  </QueryClientProvider>
);

export default App;
