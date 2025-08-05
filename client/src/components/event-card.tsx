import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, ExternalLink, Eye } from "lucide-react";
import { Link } from "wouter";
import type { Event } from "@shared/schema";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer h-full border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                {event.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {event.category || 'Event'}
                </Badge>
                {event.isActive === false && (
                  <Badge variant="destructive" className="text-xs">
                    Inactive
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Description */}
          {event.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
              {event.description}
            </p>
          )}

          {/* Event Details */}
          <div className="space-y-2">
            {/* Date Range */}
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
              <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>
                {formatDate(event.startDate)}
                {event.startDate !== event.endDate && (
                  <span> - {formatDate(event.endDate)} ({getDuration(event.startDate, event.endDate)} days)</span>
                )}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">
                {event.location && `${event.location}, `}
                {event.city}
                {event.state && `, ${event.state}`}
                {event.country && `, ${event.country}`}
              </span>
            </div>

            {/* Attendees */}
            {event.expectedAttendees && (
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{event.expectedAttendees.toLocaleString()} expected attendees</span>
              </div>
            )}
          </div>

          {/* Impact Radius */}
          {event.impactRadius && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Impact radius: {event.impactRadius} miles
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Navigate handled by Link wrapper
                }}
              >
                <Eye className="w-4 h-4 mr-1" />
                View Details
              </Button>
            </div>
            
            {event.sourceUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(event.sourceUrl!, '_blank');
                }}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default EventCard;