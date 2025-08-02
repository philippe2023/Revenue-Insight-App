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

export default function Dashboard() {

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
                  Here's what's happening with your hotels today.
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
