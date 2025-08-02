import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Calendar, MapPin, Users, ExternalLink, MessageSquare, BarChart3 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CommentThread from "@/components/comments/comment-thread";

interface EventCardProps {
  event: any;
}

export default function EventCard({ event }: EventCardProps) {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

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
      case 'concert':
        return 'bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400';
      default:
        return 'bg-slate-100 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDateRange = () => {
    const startDate = formatDate(event.startDate);
    const endDate = formatDate(event.endDate);
    
    if (startDate === endDate) {
      return startDate;
    }
    return `${startDate} - ${endDate}`;
  };

  const getDaysUntilEvent = () => {
    const eventDate = new Date(event.startDate);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Past event";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    return `${diffDays} days away`;
  };

  const estimatedImpact = () => {
    // Simple estimation based on expected attendees and location
    const attendees = event.expectedAttendees || 0;
    if (attendees > 10000) return { level: "High", percentage: "+25-40%" };
    if (attendees > 5000) return { level: "Medium", percentage: "+15-25%" };
    if (attendees > 1000) return { level: "Low", percentage: "+5-15%" };
    return { level: "Minimal", percentage: "+0-5%" };
  };

  const impact = estimatedImpact();

  return (
    <>
      <Card className="hover:shadow-lg transition-all duration-300 group">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2">{event.name}</h3>
                <Badge className={getCategoryColor(event.category)}>
                  {event.category}
                </Badge>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                {getDaysUntilEvent()}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsCommentsOpen(true)}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Comments
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Impact Analysis
                </DropdownMenuItem>
                {event.sourceUrl && (
                  <DropdownMenuItem asChild>
                    <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Source
                    </a>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {event.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
              {event.description}
            </p>
          )}

          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
              <Calendar className="w-4 h-4" />
              <span>{getDateRange()}</span>
            </div>
            
            {event.location && (
              <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                <MapPin className="w-4 h-4" />
                <span>{event.city ? `${event.city}, ${event.state || event.country}` : event.location}</span>
              </div>
            )}

            {event.expectedAttendees && (
              <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                <Users className="w-4 h-4" />
                <span>{event.expectedAttendees.toLocaleString()} expected attendees</span>
              </div>
            )}
          </div>

          {/* Impact Assessment */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Estimated Impact</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{impact.level}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 dark:text-slate-400">Booking Increase</p>
                <p className={`text-sm font-semibold ${
                  impact.level === 'High' ? 'text-green-600 dark:text-green-400' :
                  impact.level === 'Medium' ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-blue-600 dark:text-blue-400'
                }`}>
                  {impact.percentage}
                </p>
              </div>
            </div>
          </div>

          {/* Event Metadata */}
          {(event.impactRadius || event.scrapedAt) && (
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                {event.impactRadius && (
                  <span>Impact radius: {event.impactRadius}km</span>
                )}
                {event.scrapedAt && (
                  <span>Scraped: {new Date(event.scrapedAt).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments Dialog */}
      <Dialog open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Comments - {event.name}</DialogTitle>
          </DialogHeader>
          <CommentThread entityType="event" entityId={event.id} />
        </DialogContent>
      </Dialog>
    </>
  );
}
