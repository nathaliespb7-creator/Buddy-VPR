import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsProvider } from "@/context/SettingsContext";
import { ErrorBoundary } from "@/ErrorBoundary";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import ParentDashboardPage from "@/pages/ParentDashboardPage";
import ClassSubjectSelector from "@/pages/ClassSubjectSelector";

function RootRedirect() {
  const [, setLocation] = useLocation();
  // При первом заходе на корень сразу переводим на выбор класса.
  setLocation("/class-selector");
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={RootRedirect} />
      <Route path="/parent" component={ParentDashboardPage} />
      <Route path="/class-selector" component={ClassSubjectSelector} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SettingsProvider>
            <Toaster />
            <Router />
          </SettingsProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
