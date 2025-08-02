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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/auth">
        {user ? <Redirect to="/" /> : <AuthPage />}
      </Route>
      <Route path="/" component={() => user ? <Dashboard /> : <Redirect to="/auth" />} />
      <Route path="/hotels" component={() => user ? <Hotels /> : <Redirect to="/auth" />} />
      <Route path="/forecasting" component={() => user ? <Forecasting /> : <Redirect to="/auth" />} />
      <Route path="/events" component={() => user ? <Events /> : <Redirect to="/auth" />} />
      <Route path="/tasks" component={() => user ? <Tasks /> : <Redirect to="/auth" />} />
      <Route path="/analytics" component={() => user ? <Analytics /> : <Redirect to="/auth" />} />
      <Route path="/ai-chat" component={() => user ? <AIChat /> : <Redirect to="/auth" />} />
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
