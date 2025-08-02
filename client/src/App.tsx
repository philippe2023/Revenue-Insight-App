import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Hotels from "@/pages/hotels";
import Forecasting from "@/pages/forecasting";
import Events from "@/pages/events";
import Tasks from "@/pages/tasks";
import Analytics from "@/pages/analytics";
import AIChat from "@/pages/ai-chat";

function Router() {
  const { user, isLoading } = useAuth();

  // Redirect authenticated users away from auth page
  if (user) {
    return (
      <Switch>
        <Route path="/auth">
          <Redirect to="/" />
        </Route>
        <ProtectedRoute path="/" component={Dashboard} />
        <ProtectedRoute path="/hotels" component={Hotels} />
        <ProtectedRoute path="/forecasting" component={Forecasting} />
        <ProtectedRoute path="/events" component={Events} />
        <ProtectedRoute path="/tasks" component={Tasks} />
        <ProtectedRoute path="/analytics" component={Analytics} />
        <ProtectedRoute path="/ai-chat" component={AIChat} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/">
        <Redirect to="/auth" />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="hotelcast-theme">
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Router />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
