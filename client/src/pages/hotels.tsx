import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertHotelSchema, type Hotel, type InsertHotel } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, MapPin, Edit, Trash2, ExternalLink, Building2 } from "lucide-react";
import { z } from "zod";

const hotelFormSchema = insertHotelSchema.extend({
  name: z.string().min(1, "Hotel name is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  description: z.string().optional(),
  address: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  imageUrl: z.string().optional(),
});

export default function Hotels() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: hotels, isLoading } = useQuery<Hotel[]>({
    queryKey: ["/api/hotels"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertHotel) => {
      return await apiRequest("/api/hotels", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Hotel created successfully",
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
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertHotel> }) => {
      return await apiRequest(`/api/hotels/${id}`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels"] });
      setEditingHotel(null);
      toast({
        title: "Success",
        description: "Hotel updated successfully",
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
      return await apiRequest(`/api/hotels/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels"] });
      toast({
        title: "Success",
        description: "Hotel deleted successfully",
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Hotel Management</h1>
            <p className="text-slate-600 dark:text-slate-400">Manage your hotel properties and their details</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Hotel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Hotel</DialogTitle>
              </DialogHeader>
              <HotelForm 
                onSubmit={(data) => createMutation.mutate(data)}
                isLoading={createMutation.isPending}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Hotels Grid */}
        {hotels?.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="w-16 h-16 mx-auto text-slate-400 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No hotels yet</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">Get started by adding your first hotel property</p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Hotel
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels?.map((hotel) => (
              <HotelCard 
                key={hotel.id} 
                hotel={hotel} 
                onEdit={setEditingHotel}
                onDelete={(id) => deleteMutation.mutate(id)}
                isDeleting={deleteMutation.isPending}
              />
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingHotel} onOpenChange={() => setEditingHotel(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Hotel</DialogTitle>
            </DialogHeader>
            {editingHotel && (
              <HotelForm 
                hotel={editingHotel}
                onSubmit={(data) => updateMutation.mutate({ id: editingHotel.id, data })}
                isLoading={updateMutation.isPending}
                onCancel={() => setEditingHotel(null)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function HotelCard({ hotel, onEdit, onDelete, isDeleting }: {
  hotel: Hotel;
  onEdit: (hotel: Hotel) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Hotel Image */}
      <div className="aspect-video bg-slate-200 dark:bg-slate-700 overflow-hidden">
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
                    <svg class="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                    </svg>
                    <p class="text-sm">Image not available</p>
                  </div>
                </div>
              `;
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-slate-400 text-center">
              <Building2 className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">No image</p>
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* Hotel Info */}
        <div className="mb-3">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-slate-900 dark:text-white truncate mr-2">{hotel.name}</h3>
            <Badge className={(() => {
              const status = hotel.status || 'active';
              switch (status) {
                case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
                case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
                case 'maintenance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
                default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
              }
            })()}>
              {hotel.status || 'active'}
            </Badge>
          </div>
          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 mb-1">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="truncate">{hotel.city}, {hotel.country}</span>
          </div>
          {hotel.starRating && (
            <div className="flex items-center mb-2">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`text-lg ${i < hotel.starRating! ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`}>
                  ★
                </span>
              ))}
            </div>
          )}
          {hotel.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{hotel.description}</p>
          )}
        </div>

        {/* External Links */}
        <div className="flex gap-2 mb-4">
          {hotel.website && (
            <a 
              href={hotel.website.startsWith('http') ? hotel.website : `https://${hotel.website}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Website
            </a>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link href={`/hotels/${hotel.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              View Details
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(hotel)}
            className="text-blue-600 dark:text-blue-400"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onDelete(hotel.id)}
            disabled={isDeleting}
            className="text-red-600 dark:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function HotelForm({ hotel, onSubmit, isLoading, onCancel }: {
  hotel?: Hotel;
  onSubmit: (data: InsertHotel) => void;
  isLoading: boolean;
  onCancel: () => void;
}) {
  const form = useForm<z.infer<typeof hotelFormSchema>>({
    resolver: zodResolver(hotelFormSchema),
    defaultValues: {
      name: hotel?.name || "",
      description: hotel?.description || "",
      address: hotel?.address || "",
      city: hotel?.city || "",
      state: hotel?.state || "",
      country: hotel?.country || "",
      postalCode: hotel?.postalCode || "",
      phone: hotel?.phone || "",
      email: hotel?.email || "",
      website: hotel?.website || "",
      starRating: hotel?.starRating || 3,
      totalRooms: hotel?.totalRooms || 100,
      imageUrl: hotel?.imageUrl || "",
      status: hotel?.status || "active",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hotel Name *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Grand Plaza Hotel" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value || ""} placeholder="Luxury hotel in the heart of the city..." rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="New York" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="United States" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} placeholder="123 Main Street" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State/Province</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} placeholder="NY" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} placeholder="10001" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="starRating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Star Rating</FormLabel>
                <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Rating" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">1 Star</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} placeholder="+1 (555) 123-4567" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} type="email" placeholder="contact@hotel.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="totalRooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Rooms</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} type="number" onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} placeholder="100" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} placeholder="https://hotel.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} placeholder="https://example.com/hotel-image.jpg" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isLoading ? "Saving..." : hotel ? "Update Hotel" : "Create Hotel"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}