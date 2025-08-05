import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Event } from "@shared/schema";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Users, 
  Edit, 
  Trash2,
  ExternalLink,
  Building2,
  Globe,
  Clock
} from "lucide-react";
import Navigation from "@/components/layout/navigation";
import Sidebar from "@/components/layout/sidebar";

export default function EventDetail() {
  const [, params] = useRoute("/events/:id");
  const [, setLocation] = useLocation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: event, isLoading, error } = useQuery<Event>({
    queryKey: ["/api/events", params?.id],
    enabled: !!params?.id,
  });

  const { data: hotels } = useQuery({
    queryKey: ["/api/hotels"],
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/events/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
      setLocation("/events-management");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get hotels in the same city
  const getHotelsInCity = (city: string) => {
    return hotels?.filter(hotel => hotel.city?.toLowerCase() === city.toLowerCase()) || [];
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

  if (error || !event) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Navigation />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6 min-w-0 max-w-full overflow-hidden">
            <div className="max-w-4xl mx-auto">
              <Card className="text-center py-12">
                <CardContent>
                  <Calendar className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Event not found</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">The event you're looking for doesn't exist or has been removed.</p>
                  <Link href="/events-management">
                    <Button>Back to Events</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const cityHotels = event.city ? getHotelsInCity(event.city) : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 min-w-0 max-w-full overflow-hidden">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <Link href="/events-management">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Events
                </Button>
              </Link>
              <div className="flex-1" />
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 dark:text-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>

            {/* Event Header */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-3">{event.name}</CardTitle>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline" className="text-sm">
                        {event.category || 'Event'}
                      </Badge>
                      {event.isActive === false && (
                        <Badge variant="destructive" className="text-sm">
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {event.description && (
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{event.description}</p>
                )}
              </CardContent>
            </Card>

            {/* Event Details Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Event Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Event Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Start Date</p>
                        <p className="font-medium">{new Date(event.startDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">End Date</p>
                        <p className="font-medium">{new Date(event.endDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Duration</p>
                        <p className="font-medium">
                          {Math.ceil((new Date(event.endDate).getTime() - new Date(event.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                        </p>
                      </div>
                      {event.expectedAttendees && (
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Expected Attendees</p>
                          <p className="font-medium">{event.expectedAttendees.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Location Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {event.location && (
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Venue</p>
                        <p className="font-medium">{event.location}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Address</p>
                      <p className="font-medium">
                        {event.city}
                        {event.state && `, ${event.state}`}
                        {event.country && `, ${event.country}`}
                      </p>
                    </div>
                    {event.impactRadius && (
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Impact Radius</p>
                        <p className="font-medium">{event.impactRadius} miles</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Hotels in Same City */}
                {event.city && cityHotels.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        Hotels in {event.city} ({cityHotels.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {cityHotels.slice(0, 5).map((hotel) => (
                          <div key={hotel.id} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div className="flex-1">
                              <h4 className="font-medium text-slate-900 dark:text-white">{hotel.name}</h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                {hotel.address && `${hotel.address}, `}{hotel.city}
                                {hotel.state && `, ${hotel.state}`}
                              </p>
                              {hotel.totalRooms && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                  {hotel.totalRooms} rooms
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <Link href={`/hotels/${hotel.id}`}>
                                <Button variant="outline" size="sm">
                                  View Hotel
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                        {cityHotels.length > 5 && (
                          <div className="text-center pt-2">
                            <Link href="/hotels">
                              <Button variant="outline" size="sm">
                                View all {cityHotels.length} hotels in {event.city}
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Event Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Event Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">Created</span>
                      </div>
                      <span className="text-sm">
                        {new Date(event.createdAt!).toLocaleDateString()}
                      </span>
                    </div>
                    {event.updatedAt && event.updatedAt !== event.createdAt && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Edit className="w-4 h-4 text-slate-500" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">Updated</span>
                        </div>
                        <span className="text-sm">
                          {new Date(event.updatedAt).toLocaleDateString()}
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
                    {event.sourceUrl && (
                      <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer" className="block">
                        <Button variant="outline" className="w-full justify-start">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Source
                        </Button>
                      </a>
                    )}
                    {event.city && (
                      <Link href={`/hotels?city=${encodeURIComponent(event.city)}`} className="block">
                        <Button variant="outline" className="w-full justify-start">
                          <Building2 className="w-4 h-4 mr-2" />
                          View Hotels in {event.city}
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Event</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-slate-600 dark:text-slate-400">
                    Are you sure you want to delete "{event.name}"? This action cannot be undone and will remove all associated data.
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      deleteMutation.mutate(event.id);
                      setShowDeleteDialog(false);
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? "Deleting..." : "Delete Event"}
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