import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Calendar, MapPin, Users, MoreVertical, Edit, Trash2, Eye, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import type { Event } from "@shared/schema";

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
  getTypeColor: (type: string) => string;
}

export default function EventCard({ event, onEdit, onDelete, getTypeColor }: EventCardProps) {
  const isUpcoming = new Date(event.startDate) > new Date();
  const isPast = new Date(event.endDate) < new Date();

  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 animate-fade-in overflow-hidden ${
      isPast ? "opacity-75" : ""
    }`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge className={getTypeColor(event.type)}>
                {event.type.replace("_", " ")}
              </Badge>
              {isUpcoming && (
                <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-300">
                  Upcoming
                </Badge>
              )}
              {isPast && (
                <Badge variant="outline" className="text-slate-500 dark:text-slate-400">
                  Past
                </Badge>
              )}
              {event.isVerified && (
                <Badge variant="outline" className="text-blue-600 dark:text-blue-400 border-blue-300">
                  Verified
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-1">
              {event.name}
            </h3>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(event)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Event
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              {event.sourceUrl && (
                <DropdownMenuItem onClick={() => window.open(event.sourceUrl, '_blank')}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Source
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => onDelete(event.id)}
                className="text-red-600 dark:text-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Event
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-3">
          {event.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
              {event.description}
            </p>
          )}

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
              <Calendar className="w-4 h-4" />
              <span>
                {format(new Date(event.startDate), "MMM d")} - {format(new Date(event.endDate), "MMM d, yyyy")}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{event.location}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
              <span className="font-medium">City:</span>
              <span>{event.city}</span>
            </div>

            {event.expectedAttendees && (
              <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                <Users className="w-4 h-4" />
                <span>{event.expectedAttendees.toLocaleString()} expected attendees</span>
              </div>
            )}
          </div>

          {event.impactRadius && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Impact Radius:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {event.impactRadius} km
                </span>
              </div>
            </div>
          )}

          <div className="flex space-x-2 pt-3">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(event)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Eye className="w-4 h-4 mr-2" />
              Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
