import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, Calendar, MapPin, Users, ExternalLink, Edit, Trash2, MessageCircle, Building2 } from "lucide-react";
import Navigation from "@/components/layout/navigation";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Event, Hotel } from "@shared/schema";

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [comment, setComment] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: event, isLoading } = useQuery({
    queryKey: ["/api/events", id],
    queryFn: async () => {
      const response = await apiRequest(`/api/events/${id}`, 'GET');
      return response as unknown as Event;
    },
  });

  const { data: cityHotels } = useQuery({
    queryKey: ["/api/hotels", "city", event?.city],
    queryFn: async () => {
      if (!event?.city) return [];
      const response = await apiRequest(`/api/hotels?city=${encodeURIComponent(event.city)}`, 'GET');
      return response as unknown as Hotel[];
    },
    enabled: !!event?.city,
  });

  const { data: comments } = useQuery({
    queryKey: ["/api/comments", "event", id],
    queryFn: async () => {
      const response = await apiRequest(`/api/comments?entityType=event&entityId=${id}`, 'GET');
      return response as unknown as any[];
    },
    enabled: !!id,
  });

  const commentMutation = useMutation({
    mutationFn: async (commentText: string) => {
      return await apiRequest('/api/comments', 'POST', {
        entityType: 'event',
        entityId: id,
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
      queryClient.invalidateQueries({ queryKey: ["/api/comments", "event", id] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/events/${id}`, 'DELETE');
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
      setLocation("/events");
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Navigation />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
              <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Navigation />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Event Not Found</h1>
              <p className="text-slate-600 dark:text-slate-400 mb-4">The event you're looking for doesn't exist.</p>
              <Button onClick={() => setLocation("/events")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Events
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Navigation />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <Button 
                variant="ghost" 
                onClick={() => setLocation("/events")}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Events
              </Button>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCommentDialog(true)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Add Comment
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLocation(`/events/${id}/edit`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>

            {/* Event Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Event Info */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl mb-2">{event.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {event.category || 'Event'}
                          </Badge>
                          {event.isActive === false && (
                            <Badge variant="destructive">
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {event.description && (
                      <div>
                        <h3 className="font-semibold mb-2">Description</h3>
                        <p className="text-slate-600 dark:text-slate-400">{event.description}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Date Range */}
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                        <div>
                          <p className="font-medium">Duration</p>
                          <p className="text-slate-600 dark:text-slate-400">
                            {formatDate(event.startDate)}
                            {event.startDate !== event.endDate && (
                              <span> - {formatDate(event.endDate)} ({getDuration(event.startDate, event.endDate)} days)</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-green-600" />
                        <div>
                          <p className="font-medium">Location</p>
                          <p className="text-slate-600 dark:text-slate-400">
                            {event.location && `${event.location}, `}
                            {event.city}
                            {event.state && `, ${event.state}`}
                            {event.country && `, ${event.country}`}
                          </p>
                        </div>
                      </div>

                      {/* Attendees */}
                      {event.expectedAttendees && (
                        <div className="flex items-center text-sm">
                          <Users className="w-4 h-4 mr-2 text-purple-600" />
                          <div>
                            <p className="font-medium">Expected Attendees</p>
                            <p className="text-slate-600 dark:text-slate-400">
                              {event.expectedAttendees.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Impact Radius */}
                      {event.impactRadius && (
                        <div className="flex items-center text-sm">
                          <div className="w-4 h-4 mr-2 bg-orange-600 rounded-full"></div>
                          <div>
                            <p className="font-medium">Impact Radius</p>
                            <p className="text-slate-600 dark:text-slate-400">
                              {event.impactRadius} miles
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {event.sourceUrl && (
                      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Button
                          variant="outline"
                          onClick={() => window.open(event.sourceUrl!, '_blank')}
                          className="w-full justify-center"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Original Source
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Comments Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Comments ({comments?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {comments && comments.length > 0 ? (
                      <div className="space-y-4">
                        {comments.map((comment: any) => (
                          <div key={comment.id} className="border-l-2 border-blue-200 dark:border-blue-800 pl-4">
                            <p className="text-slate-700 dark:text-slate-300">{comment.content}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 dark:text-slate-400 text-center py-4">
                        No comments yet. Be the first to add one!
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Related Hotels */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building2 className="w-5 h-5 mr-2" />
                      Hotels in {event.city}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {cityHotels && cityHotels.length > 0 ? (
                      <div className="space-y-2">
                        {cityHotels.slice(0, 5).map((hotel: Hotel) => (
                          <div 
                            key={hotel.id}
                            className="p-2 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                            onClick={() => setLocation(`/hotels/${hotel.id}`)}
                          >
                            <p className="font-medium text-sm">{hotel.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {hotel.address}
                            </p>
                          </div>
                        ))}
                        {cityHotels.length > 5 && (
                          <Button 
                            variant="link" 
                            size="sm"
                            onClick={() => setLocation(`/hotels?city=${encodeURIComponent(event.city || '')}`)}
                            className="w-full mt-2"
                          >
                            View all {cityHotels.length} hotels
                          </Button>
                        )}
                      </div>
                    ) : (
                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                        No hotels found in {event.city}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>

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