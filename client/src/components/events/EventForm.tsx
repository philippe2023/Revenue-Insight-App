import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Calendar, MapPin, Users, ExternalLink } from "lucide-react";
import type { Event } from "@shared/schema";

interface EventFormProps {
  event?: Event | null;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export default function EventForm({ event, onSubmit, isLoading }: EventFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "conference" as const,
    startDate: "",
    endDate: "",
    location: "",
    city: "",
    expectedAttendees: "",
    impactRadius: "50",
    sourceUrl: "",
    isVerified: false,
  });

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name || "",
        description: event.description || "",
        type: event.type || "conference",
        startDate: event.startDate || "",
        endDate: event.endDate || "",
        location: event.location || "",
        city: event.city || "",
        expectedAttendees: event.expectedAttendees?.toString() || "",
        impactRadius: event.impactRadius?.toString() || "50",
        sourceUrl: event.sourceUrl || "",
        isVerified: event.isVerified || false,
      });
    }
  }, [event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      expectedAttendees: formData.expectedAttendees ? parseInt(formData.expectedAttendees) : null,
      impactRadius: parseInt(formData.impactRadius),
    });
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Event Information
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">Event Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter event name"
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
                placeholder="Brief description of the event"
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="type">Event Type *</Label>
              <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conference">Conference</SelectItem>
                  <SelectItem value="festival">Festival</SelectItem>
                  <SelectItem value="trade_show">Trade Show</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="concert">Concert</SelectItem>
                  <SelectItem value="wedding">Wedding</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="expectedAttendees">Expected Attendees</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Users className="w-4 h-4 text-slate-400" />
                <Input
                  id="expectedAttendees"
                  type="number"
                  min="0"
                  value={formData.expectedAttendees}
                  onChange={(e) => handleChange("expectedAttendees", e.target.value)}
                  placeholder="e.g., 1000"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="impactRadius">Impact Radius (km)</Label>
              <Input
                id="impactRadius"
                type="number"
                min="1"
                value={formData.impactRadius}
                onChange={(e) => handleChange("impactRadius", e.target.value)}
                placeholder="50"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="sourceUrl">Source URL</Label>
              <div className="flex items-center space-x-2 mt-1">
                <ExternalLink className="w-4 h-4 text-slate-400" />
                <Input
                  id="sourceUrl"
                  type="url"
                  value={formData.sourceUrl}
                  onChange={(e) => handleChange("sourceUrl", e.target.value)}
                  placeholder="https://example.com/event-details"
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
              <Label htmlFor="location">Venue/Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="Enter venue name or location"
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

            <div className="flex items-center space-x-3">
              <Switch
                id="isVerified"
                checked={formData.isVerified}
                onCheckedChange={(checked) => handleChange("isVerified", checked)}
              />
              <Label htmlFor="isVerified" className="text-sm">
                Mark as verified event
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : event ? "Update Event" : "Create Event"}
        </Button>
      </div>
    </form>
  );
}
