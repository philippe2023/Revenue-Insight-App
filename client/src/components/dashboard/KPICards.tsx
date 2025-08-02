import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Building2, Calendar, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPIData {
  totalRevenue: number;
  avgOccupancy: number;
  activeHotels: number;
  upcomingEvents: number;
}

interface KPICardsProps {
  data?: KPIData;
  isLoading?: boolean;
}

export default function KPICards({ data, isLoading }: KPICardsProps) {
  const kpis = [
    {
      title: "Total Revenue",
      value: data ? `$${data.totalRevenue.toLocaleString()}` : "$0",
      change: "+12.3%",
      changeType: "positive" as const,
      icon: DollarSign,
      iconBg: "bg-green-100 dark:bg-green-900/20",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "Avg Occupancy Rate",
      value: data ? `${data.avgOccupancy.toFixed(1)}%` : "0.0%",
      change: "+5.8%",
      changeType: "positive" as const,
      icon: Building2,
      iconBg: "bg-blue-100 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Active Hotels",
      value: data ? data.activeHotels.toString() : "0",
      change: "+2",
      changeType: "positive" as const,
      icon: Building2,
      iconBg: "bg-purple-100 dark:bg-purple-900/20",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Upcoming Events",
      value: data ? data.upcomingEvents.toString() : "0",
      change: "This Week",
      changeType: "neutral" as const,
      icon: Calendar,
      iconBg: "bg-orange-100 dark:bg-orange-900/20",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg loading-skeleton"></div>
                <div className="w-16 h-6 bg-slate-200 dark:bg-slate-700 rounded loading-skeleton"></div>
              </div>
              <div className="space-y-2">
                <div className="w-24 h-4 bg-slate-200 dark:bg-slate-700 rounded loading-skeleton"></div>
                <div className="w-32 h-8 bg-slate-200 dark:bg-slate-700 rounded loading-skeleton"></div>
                <div className="w-28 h-4 bg-slate-200 dark:bg-slate-700 rounded loading-skeleton"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow duration-300 chart-animation" style={{ animationDelay: `${index * 0.1}s` }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2 rounded-lg", kpi.iconBg)}>
                <kpi.icon className={cn("w-6 h-6", kpi.iconColor)} />
              </div>
              <span className={cn(
                "text-sm font-medium px-2 py-1 rounded-full",
                kpi.changeType === "positive" 
                  ? "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400" 
                  : kpi.changeType === "negative"
                  ? "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
              )}>
                {kpi.changeType === "positive" && <TrendingUp className="w-3 h-3 inline mr-1" />}
                {kpi.changeType === "negative" && <TrendingDown className="w-3 h-3 inline mr-1" />}
                {kpi.change}
              </span>
            </div>
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-1">
                {kpi.title}
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {kpi.value}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {kpi.changeType === "neutral" ? "requiring attention" : "vs last month"}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
