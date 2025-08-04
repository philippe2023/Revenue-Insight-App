import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function TopPerformers() {
  const { data: topPerformers, isLoading } = useQuery({
    queryKey: ["/api/dashboard/top-performers", { limit: 4 }],
    retry: false,
  });

  if (isLoading) {
    return (
      <Card className="shadow-sm border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-12 mb-1" />
                  <Skeleton className="h-3 w-8" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border border-slate-200 dark:border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-900 dark:text-white">Top Performers</CardTitle>
          <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topPerformers?.map((hotel) => (
            <div key={hotel.id} className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <img 
                  src={hotel.imageUrl || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=48&h=48&fit=crop"} 
                  alt={hotel.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{hotel.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{hotel.city}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                  ${(() => {
                    const revenue = typeof hotel.revenue === 'number' ? hotel.revenue : 0;
                    return (revenue / 1000).toFixed(0);
                  })()}K
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {(() => {
                    const occupancy = typeof hotel.occupancyRate === 'number' ? hotel.occupancyRate : 0;
                    return occupancy.toFixed(0);
                  })()}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
