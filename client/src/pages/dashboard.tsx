import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/layout/navigation";
import Sidebar from "@/components/layout/sidebar";
import KPICards from "@/components/dashboard/kpi-cards";
import RevenueChart from "@/components/dashboard/revenue-chart";
import HotelCarousel from "@/components/dashboard/hotel-carousel";
import TopPerformers from "@/components/dashboard/top-performers";
import RecentActivity from "@/components/dashboard/recent-activity";
import UpcomingTasks from "@/components/dashboard/upcoming-tasks";
import UpcomingEvents from "@/components/dashboard/upcoming-events";
import QuickActions from "@/components/dashboard/quick-actions";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-sm">HC</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {/* Dashboard Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Welcome back, {user?.firstName || 'there'}! Here's what's happening with your hotels today.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <select className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm">
                  <option>Last 30 days</option>
                  <option>Last 7 days</option>
                  <option>Last 90 days</option>
                </select>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                  Generate Report
                </button>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <KPICards />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Revenue Chart */}
            <div className="lg:col-span-2">
              <RevenueChart />
            </div>
            {/* Top Performers */}
            <TopPerformers />
          </div>

          {/* Hotel Browser */}
          <HotelCarousel />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Activity */}
            <RecentActivity />
            {/* Upcoming Tasks */}
            <UpcomingTasks />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Events */}
            <UpcomingEvents />
            {/* Quick Actions */}
            <QuickActions />
          </div>
        </main>
      </div>
    </div>
  );
}
