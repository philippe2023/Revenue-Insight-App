import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Building2, 
  Users, 
  Star, 
  Edit, 
  Trash2,
  ExternalLink,
  Calendar,
  Shield,
  MessageCircle,
  Send
} from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/layout/navigation";
import Sidebar from "@/components/layout/sidebar";

export default function HotelDetail() {
  const [, params] = useRoute("/hotels/:id");
  const [, setLocation] = useLocation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [comment, setComment] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: hotel, isLoading, error } = useQuery({
    queryKey: ["/api/hotels", params?.id],
    enabled: !!params?.id,
  });

  const { data: cityEvents } = useQuery({
    queryKey: ["/api/events", "city", hotel?.city],
    queryFn: async () => {
      if (!hotel?.city) return [];
      const response = await apiRequest('/api/events', 'GET');
      return (response as unknown as any[])?.filter((event: any) => event.city === hotel.city) || [];
    },
    enabled: !!hotel?.city,
    retry: false,
  });

  const { data: comments } = useQuery({
    queryKey: ["/api/comments", "hotel", params?.id],
    queryFn: async () => {
      if (!params?.id) return [];
      const response = await apiRequest(`/api/comments?entityType=hotel&entityId=${params.id}`, 'GET');
      return response as unknown as any[];
    },
    enabled: !!params?.id,
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/hotels/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels"] });
      toast({
        title: "Success",
        description: "Hotel deleted successfully",
      });
      setLocation("/hotels");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (commentText: string) => {
      return await apiRequest('/api/comments', 'POST', {
        entityType: 'hotel',
        entityId: params?.id,
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
      queryClient.invalidateQueries({ queryKey: ["/api/comments", "hotel", params?.id] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Navigation />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6 min-w-0 max-w-full overflow-hidden">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
                <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Navigation />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6 min-w-0 max-w-full overflow-hidden">
            <div className="max-w-4xl mx-auto">
              <Card className="text-center py-12">
                <CardContent>
                  <Building2 className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Hotel not found</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">The hotel you're looking for doesn't exist or has been removed.</p>
                  <Link href="/hotels">
                    <Button>Back to Hotels</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 min-w-0 max-w-full overflow-hidden">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <Link href="/hotels">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Hotels
                </Button>
              </Link>
              <div className="flex-1" />
              <Link href={`/hotels/${hotel.id}/edit`}>
                <Button variant="outline" className="text-blue-600 dark:text-blue-400">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 dark:text-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>

            {/* Hotel Image */}
            <Card className="overflow-hidden mb-6">
              <div className="aspect-[21/9] bg-slate-200 dark:bg-slate-700">
                {hotel.imageUrl ? (
                  <img 
                    src={hotel.imageUrl} 
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center">
                          <div class="text-slate-400 text-center">
                            <svg class="w-20 h-20 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                            </svg>
                            <p class="text-lg">Image not available</p>
                          </div>
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-slate-400 text-center">
                      <Building2 className="w-20 h-20 mx-auto mb-4" />
                      <p className="text-lg">No image available</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Hotel Information */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Info */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl mb-2">{hotel.name}</CardTitle>
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-slate-500" />
                          <span className="text-slate-600 dark:text-slate-400">
                            {[hotel.address, hotel.city, hotel.state, hotel.country].filter(Boolean).join(", ")}
                          </span>
                        </div>
                        {hotel.starRating && (
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < hotel.starRating! ? 'text-yellow-400 fill-current' : 'text-slate-300 dark:text-slate-600'}`}
                              />
                            ))}
                            <span className="text-sm text-slate-600 dark:text-slate-400 ml-1">
                              {hotel.starRating} Star{hotel.starRating !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                      <Badge className={getStatusColor(hotel.status || 'active')}>
                        {hotel.status || 'active'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {hotel.description && (
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">{hotel.description}</p>
                    )}
                    
                    {/* Hotel Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {hotel.totalRooms && (
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-slate-500" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {hotel.totalRooms} total rooms
                          </span>
                        </div>
                      )}
                      
                      {hotel.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-slate-500" />
                          <a href={`tel:${hotel.phone}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                            {hotel.phone}
                          </a>
                        </div>
                      )}
                      
                      {hotel.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-slate-500" />
                          <a href={`mailto:${hotel.email}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                            {hotel.email}
                          </a>
                        </div>
                      )}
                      
                      {hotel.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-slate-500" />
                          <a href={hotel.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                            Visit website
                            <ExternalLink className="w-3 h-3 ml-1 inline" />
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Comments Section */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        Comments ({comments?.length || 0})
                      </CardTitle>
                      <Button onClick={() => setShowCommentDialog(true)} size="sm">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Add Comment
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {comments && comments.length > 0 ? (
                      <div className="space-y-4">
                        {comments.map((comment: any) => (
                          <div key={comment.id} className="border-l-2 border-blue-200 dark:border-blue-800 pl-4 py-2">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm text-slate-900 dark:text-white">
                                {comment.authorName || 'Anonymous'}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300">{comment.content}</p>
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
                {/* Property Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      Property Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {hotel.totalRooms && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-500" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">Total Rooms</span>
                        </div>
                        <span className="font-semibold">{hotel.totalRooms}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">Created</span>
                      </div>
                      <span className="text-sm">
                        {new Date(hotel.createdAt!).toLocaleDateString()}
                      </span>
                    </div>
                    {hotel.updatedAt && hotel.updatedAt !== hotel.createdAt && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-slate-500" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">Updated</span>
                        </div>
                        <span className="text-sm">
                          {new Date(hotel.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setShowCommentDialog(true)}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Add Comment
                    </Button>
                    <Link href={`/forecasts?hotel=${hotel.id}`} className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <Building2 className="w-4 h-4 mr-2" />
                        View Forecasts
                      </Button>
                    </Link>
                    <Link href={`/analytics?hotel=${hotel.id}`} className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <Shield className="w-4 h-4 mr-2" />
                        View Analytics
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Events in Same City */}
                {hotel.city && cityEvents && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          Events in {hotel.city}
                        </CardTitle>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {cityEvents.length} event{cityEvents.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {cityEvents.length === 0 ? (
                        <p className="text-slate-500 dark:text-slate-400 text-center py-4">
                          No events found in {hotel.city}
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {cityEvents.slice(0, 5).map((event: any) => (
                            <button
                              key={event.id}
                              onClick={() => setLocation(`/events/${event.id}`)}
                              className="w-full text-left p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-slate-900 dark:text-white line-clamp-1">{event.name}</h4>
                                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                    {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                                  </p>
                                  {event.expectedAttendees && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                      Expected: {event.expectedAttendees.toLocaleString()} attendees
                                    </p>
                                  )}
                                </div>
                                <div className="text-right ml-2">
                                  <Badge variant="outline" className="text-xs">
                                    {event.category || 'Event'}
                                  </Badge>
                                </div>
                              </div>
                            </button>
                          ))}
                          {cityEvents.length > 5 && (
                            <Button 
                              variant="link" 
                              size="sm"
                              onClick={() => setLocation(`/events?city=${encodeURIComponent(hotel.city || '')}`)}
                              className="w-full mt-2"
                            >
                              View all {cityEvents.length} events in {hotel.city}
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Hotel</DialogTitle>
                </DialogHeader>
                <p className="text-slate-600 dark:text-slate-400">
                  Are you sure you want to delete "{hotel.name}"? This action cannot be undone.
                </p>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      deleteMutation.mutate(hotel.id);
                      setShowDeleteDialog(false);
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? "Deleting..." : "Delete Hotel"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Comment Dialog */}
            <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Comment to "{hotel.name}"</DialogTitle>
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
          </div>
        </main>
      </div>
    </div>
  );
}