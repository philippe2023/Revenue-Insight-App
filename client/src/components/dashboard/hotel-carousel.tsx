import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Plus, Filter } from "lucide-react";
import { useRef } from "react";
import { useLocation } from "wouter";
import { hotelApi } from "@/lib/api";

export default function HotelCarousel() {
  const { data: hotels, isLoading } = useQuery({
    queryKey: ["/api/hotels"],
    queryFn: hotelApi.getAll,
    retry: false,
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm border border-slate-200 dark:border-slate-700 mb-8">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="flex-shrink-0 w-72 h-64 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border border-slate-200 dark:border-slate-700 mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-slate-900 dark:text-white">Your Hotels</CardTitle>
            <CardDescription>Browse and manage your hotel portfolio</CardDescription>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button size="sm" onClick={() => setLocation("/hotels")}>
              <Plus className="w-4 h-4 mr-2" />
              Add Hotel
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div 
            ref={scrollRef}
            className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4 max-w-full"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {hotels?.map((hotel: any) => (
              <div 
                key={hotel.id}
                className="flex-shrink-0 w-72 bg-slate-50 dark:bg-slate-700/50 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <div className="relative">
                  <img 
                    src={hotel.imageUrl || "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=300&h=200&fit=crop"} 
                    alt={hotel.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant={hotel.status === 'active' ? 'default' : 'secondary'}>
                      {hotel.status}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">{hotel.name}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    {hotel.city}, {hotel.state} • {hotel.starRating}★
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Status</p>
                      <p className="font-semibold text-slate-900 dark:text-white capitalize">{hotel.status}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Rooms</p>
                      <p className="font-semibold text-green-600 dark:text-green-400">{hotel.totalRooms}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Add New Hotel Card */}
            <div 
              className="flex-shrink-0 w-72 bg-slate-50 dark:bg-slate-700/50 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors"
              onClick={() => setLocation("/hotels")}
            >
              <div className="text-center">
                <Plus className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-600 dark:text-slate-400 font-medium">Add New Hotel</p>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="sm"
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white dark:bg-slate-800 shadow-lg"
            onClick={scrollLeft}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white dark:bg-slate-800 shadow-lg"
            onClick={scrollRight}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
