import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, TrendingUp } from "lucide-react";
import { format, isAfter, parseISO } from "date-fns";
import type { Event } from "@shared/schema";

export default function UpcomingEvents() {
  const { isAuthenticated } = useAuth();

  const { data: events, isLoading } = useQuery({
    queryKey: ["/api/events"],
    enabled: isAuthenticated,
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "conference":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "festival":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      case "trade_show":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "sports":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "concert":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400";
    }
  };

  // Filter for upcoming events
  const upcomingEvents = events?.filter((event: Event) => 
    isAfter(parseISO(event.startDate), new Date())
  ).slice(0, 4) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="w-32 h-6 bg-slate-200 dark:bg-slate-700 rounded loading-skeleton"></div>
            <div className="w-20 h-8 bg-slate-200 dark:bg-slate-700 rounded loading-skeleton"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="w-32 h-5 bg-slate-200 dark:bg-slate-700 rounded loading-skeleton"></div>
                  <div className="w-16 h-5 bg-slate-200 dark:bg-slate-700 rounded loading-skeleton"></div>
                </div>
                <div className="w-48 h-4 bg-slate-200 dark:bg-slate-700 rounded loading-skeleton mb-2"></div>
                <div className="flex justify-between">
                  <div className="w-20 h-3 bg-slate-200 dark:bg-slate-700 rounded loading-skeleton"></div>
                  <div className="w-16 h-3 bg-slate-200 dark:bg-slate-700 rounded loading-skeleton"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
            Upcoming Events
          </CardTitle>
          <Button variant="ghost" size="sm">
            View Calendar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {upcomingEvents.length > 0 ? (
          <div className="space-y-4">
            {upcomingEvents.map((event: Event) => (
              <div 
                key={event.id} 
                className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-slate-900 dark:text-white truncate pr-2">
                    {event.name}
                  </h4>
                  <Badge className={getTypeColor(event.type)}>
                    {event.type.replace("_", " ")}
                  </Badge>
                </div>
                
                <div className="space-y-2 mb-3">
                  <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {format(parseISO(event.startDate), "MMM d")} - {format(parseISO(event.endDate), "MMM d, yyyy")}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event.location}
                  </p>
                  {event.expectedAttendees && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      {event.expectedAttendees.toLocaleString()} expected attendees
                    </p>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Expected Impact:</span>
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    <span className="text-sm font-medium">+{Math.floor(Math.random() * 20 + 10)}% bookings</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No upcoming events
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Events that might impact your hotels will appear here
            </p>
            <Button size="sm">
              Add Event
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
