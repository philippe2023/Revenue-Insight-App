import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, Users } from "lucide-react";
import { eventApi } from "@/lib/api";

export default function UpcomingEvents() {
  const { data: events, isLoading } = useQuery({
    queryKey: ["/api/events/upcoming", 3],
    queryFn: () => eventApi.getUpcoming(3),
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
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'conference':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
      case 'festival':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400';
      case 'trade-show':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400';
      case 'sports':
        return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
      default:
        return 'bg-slate-100 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400';
    }
  };

  return (
    <Card className="shadow-sm border border-slate-200 dark:border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-900 dark:text-white">Upcoming Events</CardTitle>
          <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400">
            View Calendar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events?.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">No upcoming events</p>
            </div>
          ) : (
            events?.map((event: any) => (
              <div key={event.id} className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-slate-900 dark:text-white">{event.name}</h4>
                  <Badge className={getCategoryColor(event.category)}>
                    {event.category}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400 mb-3">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  {event.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{event.city}</span>
                    </div>
                  )}
                </div>

                {event.expectedAttendees && (
                  <div className="flex items-center space-x-1 text-sm text-slate-600 dark:text-slate-400 mb-3">
                    <Users className="w-4 h-4" />
                    <span>{event.expectedAttendees.toLocaleString()} expected attendees</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Potential Impact:</span>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    High booking opportunity
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
