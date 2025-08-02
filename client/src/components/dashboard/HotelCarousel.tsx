import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus, Building2 } from "lucide-react";
import { useRef } from "react";
import type { Hotel } from "@shared/schema";

export default function HotelCarousel() {
  const { isAuthenticated } = useAuth();
  const carouselRef = useRef<HTMLDivElement>(null);

  const { data: hotels, isLoading } = useQuery({
    queryKey: ["/api/hotels"],
    enabled: isAuthenticated,
  });

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500 text-white";
      case "maintenance":
        return "bg-yellow-500 text-white";
      case "inactive":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="w-32 h-6 bg-slate-200 dark:bg-slate-700 rounded loading-skeleton mb-2"></div>
              <div className="w-48 h-4 bg-slate-200 dark:bg-slate-700 rounded loading-skeleton"></div>
            </div>
            <div className="w-24 h-10 bg-slate-200 dark:bg-slate-700 rounded loading-skeleton"></div>
          </div>
          
          <div className="flex space-x-4 overflow-hidden">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-72 bg-slate-50 dark:bg-slate-700/50 rounded-lg overflow-hidden">
                <div className="h-48 bg-slate-200 dark:bg-slate-700 loading-skeleton"></div>
                <div className="p-4 space-y-3">
                  <div className="w-32 h-5 bg-slate-200 dark:bg-slate-700 rounded loading-skeleton"></div>
                  <div className="w-24 h-4 bg-slate-200 dark:bg-slate-700 rounded loading-skeleton"></div>
                  <div className="flex justify-between">
                    <div className="w-16 h-4 bg-slate-200 dark:bg-slate-700 rounded loading-skeleton"></div>
                    <div className="w-16 h-4 bg-slate-200 dark:bg-slate-700 rounded loading-skeleton"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Your Hotels
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Browse and manage your hotel portfolio
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              Filter
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Hotel
            </Button>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div 
            ref={carouselRef}
            className="flex space-x-4 overflow-x-auto carousel-scroll pb-4"
          >
            {hotels && hotels.length > 0 ? (
              hotels.map((hotel: Hotel) => (
                <div 
                  key={hotel.id} 
                  className="flex-shrink-0 w-72 bg-slate-50 dark:bg-slate-700/50 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
                >
                  <div className="relative">
                    <img
                      src={hotel.imageUrl || `https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=300&h=200&fit=crop&crop=center`}
                      alt={hotel.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge className={getStatusColor(hotel.status || "active")}>
                        {hotel.status || "Active"}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-1 truncate">
                      {hotel.name}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      {hotel.city}, {hotel.state || hotel.country} • {hotel.rating}★
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Rooms</p>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {hotel.totalRooms}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Status</p>
                        <p className="font-semibold text-slate-900 dark:text-white capitalize">
                          {hotel.status || "Active"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex items-center justify-center py-12">
                <div className="text-center">
                  <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                    No hotels yet
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Get started by adding your first hotel
                  </p>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Hotel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Carousel Navigation */}
          {hotels && hotels.length > 2 && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white dark:bg-slate-800 shadow-lg rounded-full p-2 z-10"
                onClick={scrollLeft}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white dark:bg-slate-800 shadow-lg rounded-full p-2 z-10"
                onClick={scrollRight}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
