import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, MapPin, Users, ExternalLink, Eye, MoreVertical, MessageCircle, Edit, Trash2, Building2 } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Event } from "@shared/schema";

interface EventCardProps {
  event: Event;
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: string) => void;
}

export function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [comment, setComment] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const commentMutation = useMutation({
    mutationFn: async (commentText: string) => {
      return await apiRequest('/api/comments', 'POST', {
        entityType: 'event',
        entityId: event.id,
        content: commentText
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
      setComment("");
      setShowCommentDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/comments", "event", event.id] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(event);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(event.id);
  };

  const handleComment = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowCommentDialog(true);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `/events/${event.id}`;
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-300 h-full border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600">
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
            
            {/* Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleViewDetails}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Event
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleComment}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Add Comment
                </DropdownMenuItem>
                {event.sourceUrl && (
                  <DropdownMenuItem onClick={(e) => {
                    e.preventDefault();
                    window.open(event.sourceUrl!, '_blank');
                  }}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Source
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleDelete} className="text-red-600 dark:text-red-400">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Event
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 cursor-pointer" onClick={handleViewDetails}>
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

          {/* Impact Radius & Hotel Count */}
          <div className="flex items-center justify-between">
            {event.impactRadius && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-1">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  {event.impactRadius} mile radius
                </p>
              </div>
            )}
            
            {event.city && (
              <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                <Building2 className="w-3 h-3 mr-1" />
                <Link href={`/hotels?city=${encodeURIComponent(event.city)}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                  View hotels in {event.city}
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comment Dialog */}
      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Comment to "{event.name}"</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter your comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCommentDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => commentMutation.mutate(comment)}
              disabled={!comment.trim() || commentMutation.isPending}
            >
              {commentMutation.isPending ? "Adding..." : "Add Comment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default EventCard;