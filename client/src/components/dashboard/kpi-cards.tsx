import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Hotel, Calendar, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function KPICards() {
  const { data: kpis, isLoading } = useQuery({
    queryKey: ["/api/dashboard/kpis"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-12 w-12 rounded-lg mb-4" />
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Revenue",
      value: `$${kpis?.totalRevenue?.toLocaleString() || '0'}`,
      change: "+12.3%",
      changeType: "positive" as const,
      icon: DollarSign,
      iconBg: "bg-green-100 dark:bg-green-900/20",
      iconColor: "text-green-600 dark:text-green-400"
    },
    {
      title: "Avg Occupancy Rate",
      value: `${kpis?.avgOccupancyRate?.toFixed(1) || '0'}%`,
      change: "+5.8%",
      changeType: "positive" as const,
      icon: TrendingUp,
      iconBg: "bg-blue-100 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    {
      title: "Active Hotels",
      value: kpis?.activeHotels?.toString() || '0',
      change: "+2",
      changeType: "positive" as const,
      icon: Hotel,
      iconBg: "bg-purple-100 dark:bg-purple-900/20",
      iconColor: "text-purple-600 dark:text-purple-400"
    },
    {
      title: "Upcoming Events",
      value: kpis?.upcomingEvents?.toString() || '0',
      change: "This Week",
      changeType: "neutral" as const,
      icon: Calendar,
      iconBg: "bg-orange-100 dark:bg-orange-900/20",
      iconColor: "text-orange-600 dark:text-orange-400"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <Card key={index} className="shadow-sm border border-slate-200 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 ${card.iconBg} rounded-lg`}>
                <card.icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                card.changeType === 'positive' 
                  ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20'
                  : card.changeType === 'negative'
                  ? 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20'
                  : 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20'
              }`}>
                {card.change}
              </span>
            </div>
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">{card.title}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{card.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {card.changeType === 'neutral' ? 'requiring attention' : 'vs last month'}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
