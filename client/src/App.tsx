import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Hotels from "@/pages/hotels";
import HotelDetail from "@/pages/hotel-detail";
import Forecasting from "@/pages/forecasting";
import Events from "@/pages/events";
import Tasks from "@/pages/tasks";
import Analytics from "@/pages/analytics";
import AIChat from "@/pages/ai-chat";
import AuthPage from "@/pages/auth-page";
import Landing from "@/pages/landing";

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Switch>
      {user ? (
        // Authenticated routes
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/hotels" component={Hotels} />
          <Route path="/hotels/:id" component={HotelDetail} />
          <Route path="/forecasting" component={Forecasting} />
          <Route path="/events" component={Events} />
          <Route path="/tasks" component={Tasks} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/ai-chat" component={AIChat} />
        </>
      ) : (
        // Unauthenticated routes
        <>
          <Route path="/" component={Landing} />
          <Route path="/auth" component={AuthPage} />
        </>
      )}
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
