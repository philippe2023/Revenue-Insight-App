import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Star, MapPin, Users, MoreVertical, Edit, Trash2, Eye, Building2 } from "lucide-react";
import type { Hotel } from "@shared/schema";

interface HotelCardProps {
  hotel: Hotel;
  onEdit: (hotel: Hotel) => void;
  onDelete: (id: string) => void;
}

export default function HotelCard({ hotel, onEdit, onDelete }: HotelCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 animate-fade-in overflow-hidden">
      <div className="relative">
        <img
          src={hotel.imageUrl || `https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=250&fit=crop&crop=center`}
          alt={hotel.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <Badge className={getStatusColor(hotel.status || "active")}>
            {hotel.status || "Active"}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(hotel)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Hotel
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(hotel.id)}
                className="text-red-600 dark:text-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Hotel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-lg truncate">
              {hotel.name}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {hotel.city}, {hotel.state || hotel.country}
              </span>
              {hotel.rating && (
                <div className="flex items-center space-x-1 ml-auto">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {hotel.rating}
                  </span>
                </div>
              )}
            </div>
          </div>

          {hotel.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
              {hotel.description}
            </p>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-1">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {hotel.totalRooms} rooms
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Capacity: {hotel.totalRooms * 2}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Address</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 truncate">
              {hotel.address}
            </p>
          </div>

          <div className="flex space-x-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(hotel)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Eye className="w-4 h-4 mr-2" />
              View
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
