import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Calendar, MapPin, Eye, ExternalLink } from "lucide-react";
import Navigation from "@/components/layout/navigation";
import Sidebar from "@/components/layout/sidebar";
import EventCard from "@/components/event-card";
import EventForm from "@/components/events/event-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { eventApi } from "@/lib/api";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Events() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchCity, setSearchCity] = useState("");
  const [searchStartDate, setSearchStartDate] = useState("");
  const [searchEndDate, setSearchEndDate] = useState("");
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const { toast } = useToast();

  const { data: events, isLoading } = useQuery({
    queryKey: ["/api/events"],
    queryFn: eventApi.getAll,
    retry: false,
  });

  const { data: upcomingEvents } = useQuery({
    queryKey: ["/api/events/upcoming", 10],
    queryFn: () => eventApi.getUpcoming(10),
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: eventApi.create,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Event created successfully",
      });
      setIsFormOpen(false);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
    },
  });

  const searchMutation = useMutation({
    mutationFn: ({ city }: { city: string }) => eventApi.search(city),
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to search events",
        variant: "destructive",
      });
    },
  });

  const externalSearchMutation = useMutation({
    mutationFn: eventApi.externalSearch,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "External events found successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "External search failed",
        description: "Failed to search external events. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredEvents = events?.filter((event: any) => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || event.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }) || [];

  const handleSearch = () => {
    if (searchCity.trim()) {
      searchMutation.mutate({ city: searchCity.trim() });
    }
  };

  const handleExternalSearch = () => {
    if (!searchCity.trim() || !searchStartDate || !searchEndDate) {
      toast({
        title: "Missing information",
        description: "Please enter location, start date, and end date.",
        variant: "destructive",
      });
      return;
    }

    const searchData = {
      location: searchCity.trim(),
      startDate: searchStartDate,
      endDate: searchEndDate,
      eventTypes: selectedEventTypes.length > 0 ? selectedEventTypes : undefined,
      searchName: `${searchCity} Events`
    };

    externalSearchMutation.mutate(searchData);
  };

  const toggleEventType = (type: string) => {
    setSelectedEventTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Helper function to get event type specific image
  const getEventTypeImage = (eventType?: string) => {
    const eventImages: Record<string, string> = {
      'sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      'concerts': 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      'music': 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      'fairs': 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      'culture': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      'art': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      'community': 'https://images.unsplash.com/photo-1531058020387-3be344556be6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      'business': 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      'tech': 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      'conference': 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      'default': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
    };

    const normalizedType = eventType?.toLowerCase();
    return eventImages[normalizedType || 'default'] || eventImages.default;
  };

  // Handle event details modal/dialog
  const handleEventDetails = (event: any) => {
    toast({
      title: "Event Details",
      description: `Opening details for: ${event.event_name || event.name}`,
    });
    // Could open a detailed modal here
  };

  // Handle importing event to internal system
  const handleImportEvent = async (externalEvent: any) => {
    try {
      // Map external event data to match the database schema
      const eventData = {
        name: externalEvent.eventName || externalEvent.name || 'Imported Event',
        description: externalEvent.description || 'Imported from external event search',
        category: externalEvent.eventType || 'community',
        startDate: externalEvent.eventDate ? new Date(externalEvent.eventDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: externalEvent.endDate ? new Date(externalEvent.endDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        location: externalEvent.venueAddress || externalEvent.venueName || searchCity,
        city: externalEvent.city || searchCity,
        expectedAttendees: externalEvent.expectedAttendees ? parseInt(externalEvent.expectedAttendees) : null,
        impactRadius: 5.0, // Default 5km radius
        sourceUrl: externalEvent.sourceUrl || null
      };

      await createMutation.mutateAsync(eventData);
      toast({
        title: "Event Imported Successfully",
        description: `"${eventData.name}" has been added to your events.`,
      });
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error?.message || "Failed to import event. Please check the event data and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Events</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Discover events and analyze their impact on hotel performance
              </p>
            </div>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Event</DialogTitle>
                </DialogHeader>
                <EventForm 
                  onSubmit={createMutation.mutate}
                  isLoading={createMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All Events</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="search">Event Search</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {/* Filters */}
              <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="conference">Conference</SelectItem>
                    <SelectItem value="festival">Festival</SelectItem>
                    <SelectItem value="trade-show">Trade Show</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="concert">Concert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Events Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                      <div className="loading-skeleton h-6 w-3/4 mb-2"></div>
                      <div className="loading-skeleton h-4 w-1/2 mb-4"></div>
                      <div className="loading-skeleton h-16 w-full mb-4"></div>
                      <div className="loading-skeleton h-4 w-full"></div>
                    </div>
                  ))}
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400 text-lg mb-2">No events found</p>
                  <p className="text-slate-400 dark:text-slate-500 mb-4">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((event: any) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents?.map((event: any) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="search" className="space-y-6">
              <div className="max-w-4xl">
                {/* Enhanced Search Form */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Search External Events</h3>
                  <div className="space-y-4">
                    {/* Location */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        Location *
                      </label>
                      <Input
                        placeholder="Enter city, postal code, or address (e.g., New York, NY)"
                        value={searchCity}
                        onChange={(e) => setSearchCity(e.target.value)}
                      />
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          Start Date *
                        </label>
                        <Input
                          type="date"
                          value={searchStartDate}
                          onChange={(e) => setSearchStartDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          End Date *
                        </label>
                        <Input
                          type="date"
                          value={searchEndDate}
                          onChange={(e) => setSearchEndDate(e.target.value)}
                          min={searchStartDate || new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>

                    {/* Event Types */}
                    <div>
                      <label className="block text-sm font-medium mb-3 text-slate-700 dark:text-slate-300">
                        Event Types (optional)
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          { value: 'sports', label: 'Sports', icon: '⚽' },
                          { value: 'concerts', label: 'Concerts & Music', icon: '🎵' },
                          { value: 'fairs', label: 'Fairs & Expos', icon: '🏪' },
                          { value: 'culture', label: 'Art & Culture', icon: '🎭' },
                          { value: 'community', label: 'Community Events', icon: '👥' },
                          { value: 'business', label: 'Business & Tech', icon: '💼' },
                        ].map((type) => (
                          <Button
                            key={type.value}
                            type="button"
                            variant={selectedEventTypes.includes(type.value) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleEventType(type.value)}
                            className="justify-start"
                          >
                            <span className="mr-2">{type.icon}</span>
                            {type.label}
                          </Button>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 mt-2">Select one or more event types (leave blank for all types)</p>
                    </div>

                    {/* Search Button */}
                    <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                      <Button 
                        onClick={handleExternalSearch}
                        disabled={externalSearchMutation.isPending || !searchCity.trim() || !searchStartDate || !searchEndDate}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        {externalSearchMutation.isPending ? "Searching..." : "Search External Events"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* External Search Results */}
                {externalSearchMutation.data && (
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        External Events Found ({externalSearchMutation.data.resultsCount || 0})
                      </h3>
                      <p className="text-sm text-slate-500">
                        {externalSearchMutation.data.searchParams?.location} • {externalSearchMutation.data.timestamp && new Date(externalSearchMutation.data.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {externalSearchMutation.data.events?.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {externalSearchMutation.data.events.map((event: any, index: number) => (
                          <div key={index} className="group">
                            {/* Event Image */}
                            <div className="relative overflow-hidden rounded-lg">
                              <img 
                                className="object-cover object-center w-full h-64 rounded-lg lg:h-80 group-hover:scale-105 transition-transform duration-300" 
                                src={event.image_url || getEventTypeImage(event.event_type)} 
                                alt={event.event_name || event.name}
                                onError={(e) => {
                                  e.currentTarget.src = getEventTypeImage(event.event_type);
                                }}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300 rounded-lg"></div>
                            </div>

                            {/* Event Content */}
                            <div className="mt-6">
                              {/* Event Type Badge */}
                              <span className="text-blue-500 dark:text-blue-400 uppercase text-sm font-medium">
                                {event.event_type || 'Event'}
                              </span>

                              {/* Event Title */}
                              <h1 className="mt-4 text-xl font-semibold text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300 cursor-pointer line-clamp-2">
                                {event.event_name || event.name}
                              </h1>

                              {/* Event Description */}
                              <p className="mt-2 text-gray-500 dark:text-gray-400 line-clamp-3">
                                {event.description || 'Join us for this exciting event. More details available on the event page.'}
                              </p>

                              {/* Event Details & Actions */}
                              <div className="flex items-center justify-between mt-6">
                                <div className="space-y-1">
                                  {/* Date */}
                                  {event.event_date && (
                                    <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                      <Calendar className="w-4 h-4 mr-2" />
                                      {new Date(event.event_date).toLocaleDateString('en-US', { 
                                        weekday: 'short', 
                                        year: 'numeric', 
                                        month: 'short', 
                                        day: 'numeric' 
                                      })}
                                      {event.event_time && (
                                        <span className="ml-2 text-gray-500">
                                          {event.event_time}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  {/* Venue */}
                                  {event.venue_name && (
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                      <MapPin className="w-4 h-4 mr-2" />
                                      {event.venue_name}
                                    </div>
                                  )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEventDetails(event)}
                                    className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    Details
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleImportEvent(event)}
                                    className="hover:bg-green-50 dark:hover:bg-green-900/20"
                                  >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Import
                                  </Button>
                                  {event.source_url && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => window.open(event.source_url, '_blank')}
                                      className="hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                    >
                                      <ExternalLink className="w-4 h-4 mr-1" />
                                      Source
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-500 dark:text-slate-400">
                          No external events found for "{externalSearchMutation.data.searchParams?.location}"
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Try adjusting your search criteria or date range
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Internal Search Results */}
                {searchMutation.data && (
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Internal Events</h3>
                    {searchMutation.data?.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {searchMutation.data.map((event: any) => (
                          <EventCard key={event.id} event={event} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-500 dark:text-slate-400">No internal events found in {searchCity}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
