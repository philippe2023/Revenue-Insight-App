import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Calendar, MapPin } from "lucide-react";
import Navigation from "@/components/layout/navigation";
import Sidebar from "@/components/layout/sidebar";
import EventCard from "@/components/events/event-card";
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
              <div className="max-w-2xl">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-1">
                    <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <Input
                      placeholder="Enter city name..."
                      value={searchCity}
                      onChange={(e) => setSearchCity(e.target.value)}
                      className="pl-10"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <Button 
                    onClick={handleSearch}
                    disabled={searchMutation.isPending || !searchCity.trim()}
                  >
                    {searchMutation.isPending ? "Searching..." : "Search Events"}
                  </Button>
                </div>

                {searchMutation.data && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchMutation.data.map((event: any) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                )}

                {searchMutation.data?.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">No events found in {searchCity}</p>
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
