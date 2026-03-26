import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import AnalyzePage from "@/pages/analyze";
import RealityLensPage from "@/pages/reality-lens";
import WidgetPage from "@/pages/widget";
import AdminSignalsPage from "@/pages/admin-signals";

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/analyze" component={AnalyzePage} />
      <Route path="/reality-lens" component={RealityLensPage} />
      <Route path="/widget" component={WidgetPage} />
      <Route path="/admin/signals" component={AdminSignalsPage} />
      <Route path="/reports" component={AnalyzePage} />
      <Route path="/settings" component={AnalyzePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router hook={useHashLocation}>
          <AppRouter />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
