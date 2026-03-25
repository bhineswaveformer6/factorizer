import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SpeedInsights } from "@vercel/speed-insights/react";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import AnalyzePage from "@/pages/analyze";
import RealityLensPage from "@/pages/reality-lens";
import WidgetPage from "@/pages/widget";

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/analyze" component={AnalyzePage} />
      <Route path="/reality-lens" component={RealityLensPage} />
      <Route path="/widget" component={WidgetPage} />
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
        <SpeedInsights />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
