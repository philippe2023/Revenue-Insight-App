import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Event, InsertEvent } from "@shared/schema";
import { 
  Plus, 
  Upload, 
  Download, 
  Search, 
  Calendar, 
  MapPin, 
  Users, 
  Edit, 
  Trash2, 
  FileText,
  ExternalLink,
  Building2
} from "lucide-react";
import Navigation from "@/components/layout/navigation";
import Sidebar from "@/components/layout/sidebar";

export default function EventsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    retry: false,
  });

  const { data: hotels } = useQuery({
    queryKey: ["/api/hotels"],
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: async (eventData: InsertEvent) => {
      return await apiRequest("/api/events", "POST", eventData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setShowCreateDialog(false);
      toast({
        title: "Success",
        description: "Event created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertEvent> }) => {
      return await apiRequest(`/api/events/${id}`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setShowEditDialog(false);
      setSelectedEvent(null);
      toast({
        title: "Success",
        description: "Event updated successfully",
      });
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
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/events/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setShowDeleteDialog(false);
      setSelectedEvent(null);
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const searchMutation = useMutation({
    mutationFn: async (city: string) => {
      return await apiRequest("/api/events/search", "POST", { city });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Search Complete",
        description: `Found ${data.eventsFound} events, saved ${data.eventsSaved} new events`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/events/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      const result = await response.json();
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      
      toast({
        title: "Upload Complete",
        description: `Imported ${result.imported} of ${result.total} events`,
      });

      if (result.errors?.length > 0) {
        toast({
          title: "Import Warnings",
          description: `${result.errors.length} rows had issues`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Upload Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/events/export', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'events-export.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Complete",
        description: "Events exported successfully",
      });
    } catch (error) {
      toast({
        title: "Export Error",
        description: "Failed to export events",
        variant: "destructive",
      });
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/events/template', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Template download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'events-template.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Template Downloaded",
        description: "Excel template downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Download Error",
        description: "Failed to download template",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const eventData: InsertEvent = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      location: formData.get('location') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      country: formData.get('country') as string,
      expectedAttendees: formData.get('expectedAttendees') ? parseInt(formData.get('expectedAttendees') as string) : null,
      impactRadius: formData.get('impactRadius') ? parseFloat(formData.get('impactRadius') as string) : 50,
      sourceUrl: formData.get('sourceUrl') as string,
    };

    if (selectedEvent) {
      updateMutation.mutate({ id: selectedEvent.id, data: eventData });
    } else {
      createMutation.mutate(eventData);
    }
  };

  // Filter events based on search and filters
  const filteredEvents = events?.filter(event => {
    const matchesSearch = !searchTerm || 
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCity = !cityFilter || event.city?.toLowerCase() === cityFilter.toLowerCase();
    const matchesCategory = !categoryFilter || event.category === categoryFilter;
    
    return matchesSearch && matchesCity && matchesCategory;
  }) || [];

  // Get unique cities and categories for filters
  const cities = Array.from(new Set(events?.map(e => e.city).filter(Boolean))) as string[];
  const categories = Array.from(new Set(events?.map(e => e.category).filter(Boolean))) as string[];

  // Get hotel count by city for bidirectional linking
  const getHotelCountByCity = (city: string) => {
    return hotels?.filter(hotel => hotel.city?.toLowerCase() === city.toLowerCase()).length || 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Navigation />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-64"></div>
              <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-48 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                ))}
              </div>
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
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Event Management</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Manage events and their impact on hotel bookings
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={handleDownloadTemplate}>
                  <FileText className="w-4 h-4 mr-2" />
                  Template
                </Button>
                <Button variant="outline" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Event
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Event</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Event Name *</Label>
                          <Input id="name" name="name" required />
                        </div>
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Select name="category">
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="conference">Conference</SelectItem>
                              <SelectItem value="concert">Concert</SelectItem>
                              <SelectItem value="sports">Sports</SelectItem>
                              <SelectItem value="festival">Festival</SelectItem>
                              <SelectItem value="exhibition">Exhibition</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="startDate">Start Date *</Label>
                          <Input id="startDate" name="startDate" type="date" required />
                        </div>
                        <div>
                          <Label htmlFor="endDate">End Date *</Label>
                          <Input id="endDate" name="endDate" type="date" required />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="location">Venue</Label>
                          <Input id="location" name="location" />
                        </div>
                        <div>
                          <Label htmlFor="city">City *</Label>
                          <Input id="city" name="city" required />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="state">State</Label>
                          <Input id="state" name="state" />
                        </div>
                        <div>
                          <Label htmlFor="country">Country</Label>
                          <Input id="country" name="country" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expectedAttendees">Expected Attendees</Label>
                          <Input id="expectedAttendees" name="expectedAttendees" type="number" />
                        </div>
                        <div>
                          <Label htmlFor="impactRadius">Impact Radius (miles)</Label>
                          <Input id="impactRadius" name="impactRadius" type="number" defaultValue="50" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="sourceUrl">Source URL</Label>
                        <Input id="sourceUrl" name="sourceUrl" type="url" />
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createMutation.isPending}>
                          {createMutation.isPending ? "Creating..." : "Create Event"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Filters and Search */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-64">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        placeholder="Search events..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="min-w-48">
                    <Select value={cityFilter} onValueChange={setCityFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Cities</SelectItem>
                        {cities.map(city => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="min-w-48">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (cityFilter) {
                        searchMutation.mutate(cityFilter);
                      } else {
                        toast({
                          title: "Search Required",
                          description: "Please select a city to search for events",
                          variant: "destructive",
                        });
                      }
                    }}
                    disabled={searchMutation.isPending}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    {searchMutation.isPending ? "Searching..." : "Find Events"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{event.name}</CardTitle>
                        <div className="flex flex-wrap gap-2 mb-2">
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
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowEditDialog(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                      </div>
                      {event.city && (
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                          <MapPin className="w-4 h-4 mr-2" />
                          {event.location && `${event.location}, `}{event.city}
                          {event.state && `, ${event.state}`}
                        </div>
                      )}
                      {event.expectedAttendees && (
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                          <Users className="w-4 h-4 mr-2" />
                          {event.expectedAttendees.toLocaleString()} expected attendees
                        </div>
                      )}
                      {event.city && (
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                          <Building2 className="w-4 h-4 mr-2" />
                          {getHotelCountByCity(event.city)} hotels in {event.city}
                        </div>
                      )}
                      {event.sourceUrl && (
                        <a
                          href={event.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Source
                        </a>
                      )}
                      {event.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredEvents.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Calendar className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No Events Found</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    {searchTerm || cityFilter || categoryFilter
                      ? "Try adjusting your search filters"
                      : "Get started by adding your first event or importing events from Excel"}
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Event
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                    <Button variant="outline" onClick={handleDownloadTemplate}>
                      <FileText className="w-4 h-4 mr-2" />
                      Download Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Edit Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Event</DialogTitle>
                </DialogHeader>
                {selectedEvent && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-name">Event Name *</Label>
                        <Input id="edit-name" name="name" defaultValue={selectedEvent.name} required />
                      </div>
                      <div>
                        <Label htmlFor="edit-category">Category</Label>
                        <Select name="category" defaultValue={selectedEvent.category || ""}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="conference">Conference</SelectItem>
                            <SelectItem value="concert">Concert</SelectItem>
                            <SelectItem value="sports">Sports</SelectItem>
                            <SelectItem value="festival">Festival</SelectItem>
                            <SelectItem value="exhibition">Exhibition</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="edit-description">Description</Label>
                      <Textarea id="edit-description" name="description" defaultValue={selectedEvent.description || ""} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-startDate">Start Date *</Label>
                        <Input id="edit-startDate" name="startDate" type="date" defaultValue={selectedEvent.startDate} required />
                      </div>
                      <div>
                        <Label htmlFor="edit-endDate">End Date *</Label>
                        <Input id="edit-endDate" name="endDate" type="date" defaultValue={selectedEvent.endDate} required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-location">Venue</Label>
                        <Input id="edit-location" name="location" defaultValue={selectedEvent.location || ""} />
                      </div>
                      <div>
                        <Label htmlFor="edit-city">City *</Label>
                        <Input id="edit-city" name="city" defaultValue={selectedEvent.city || ""} required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-state">State</Label>
                        <Input id="edit-state" name="state" defaultValue={selectedEvent.state || ""} />
                      </div>
                      <div>
                        <Label htmlFor="edit-country">Country</Label>
                        <Input id="edit-country" name="country" defaultValue={selectedEvent.country || ""} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-expectedAttendees">Expected Attendees</Label>
                        <Input id="edit-expectedAttendees" name="expectedAttendees" type="number" defaultValue={selectedEvent.expectedAttendees || ""} />
                      </div>
                      <div>
                        <Label htmlFor="edit-impactRadius">Impact Radius (miles)</Label>
                        <Input id="edit-impactRadius" name="impactRadius" type="number" defaultValue={selectedEvent.impactRadius || 50} />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="edit-sourceUrl">Source URL</Label>
                      <Input id="edit-sourceUrl" name="sourceUrl" type="url" defaultValue={selectedEvent.sourceUrl || ""} />
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? "Updating..." : "Update Event"}
                      </Button>
                    </DialogFooter>
                  </form>
                )}
              </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Event</DialogTitle>
                </DialogHeader>
                <p className="text-slate-600 dark:text-slate-300">
                  Are you sure you want to delete "{selectedEvent?.name}"? This action cannot be undone.
                </p>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => selectedEvent && deleteMutation.mutate(selectedEvent.id)}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? "Deleting..." : "Delete"}
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