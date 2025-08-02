import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, MapPin, Star, Image } from "lucide-react";
import type { Hotel } from "@shared/schema";

interface HotelFormProps {
  hotel?: Hotel | null;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export default function HotelForm({ hotel, onSubmit, isLoading }: HotelFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    rating: "",
    totalRooms: "",
    imageUrl: "",
    status: "active" as const,
  });

  useEffect(() => {
    if (hotel) {
      setFormData({
        name: hotel.name || "",
        description: hotel.description || "",
        address: hotel.address || "",
        city: hotel.city || "",
        state: hotel.state || "",
        country: hotel.country || "",
        postalCode: hotel.postalCode || "",
        rating: hotel.rating?.toString() || "",
        totalRooms: hotel.totalRooms?.toString() || "",
        imageUrl: hotel.imageUrl || "",
        status: hotel.status || "active",
      });
    }
  }, [hotel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      rating: formData.rating ? parseFloat(formData.rating) : null,
      totalRooms: parseInt(formData.totalRooms),
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Basic Information
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">Hotel Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter hotel name"
                required
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Brief description of the hotel"
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="totalRooms">Total Rooms *</Label>
              <Input
                id="totalRooms"
                type="number"
                min="1"
                value={formData.totalRooms}
                onChange={(e) => handleChange("totalRooms", e.target.value)}
                placeholder="e.g., 150"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="rating">Rating</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <Input
                  id="rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => handleChange("rating", e.target.value)}
                  placeholder="e.g., 4.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Under Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Image className="w-4 h-4 text-slate-400" />
                <Input
                  id="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => handleChange("imageUrl", e.target.value)}
                  placeholder="https://example.com/hotel-image.jpg"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Location Details
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Enter full street address"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                placeholder="Enter city"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleChange("state", e.target.value)}
                placeholder="Enter state or province"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleChange("country", e.target.value)}
                placeholder="Enter country"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="postalCode">Postal/Zip Code</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => handleChange("postalCode", e.target.value)}
                placeholder="Enter postal or zip code"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : hotel ? "Update Hotel" : "Create Hotel"}
        </Button>
      </div>
    </form>
  );
}
