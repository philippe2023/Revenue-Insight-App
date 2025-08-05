import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Hotel, 
  Calendar, 
  Filter,
  RotateCcw,
  Users,
  ExternalLink,
  Building2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import Navigation from "@/components/layout/navigation";
import Sidebar from "@/components/layout/sidebar";
import type { Hotel as HotelType, Event } from "@shared/schema";

// Custom marker icons
const createCustomIcon = (color: string, symbol: string) => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${symbol}</div>`,
    className: 'custom-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

const hotelIcon = createCustomIcon('#3b82f6', '🏨');
const eventIcons = {
  conference: createCustomIcon('#8b5cf6', '📊'),
  festival: createCustomIcon('#f59e0b', '🎉'),
  'trade-show': createCustomIcon('#10b981', '🏢'),
  sports: createCustomIcon('#ef4444', '⚽'),
  concert: createCustomIcon('#ec4899', '🎵'),
  default: createCustomIcon('#6b7280', '📅')
};

// Component to handle map centering
function MapController({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
}

export default function MapPage() {
  const [, setLocation] = useLocation();
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [mapCenter, setMapCenter] = useState<[number, number]>([50.1109, 8.6821]); // Default: Frankfurt, Germany
  const [mapZoom, setMapZoom] = useState(5);

  // Fetch hotels with coordinates
  const { data: hotels, isLoading: hotelsLoading } = useQuery<HotelType[]>({
    queryKey: ["/api/hotels"],
  });

  // Fetch events with coordinates  
  const { data: events, isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  // Filter data based on selected country/city
  const filteredHotels = useMemo(() => {
    if (!hotels) return [];
    let filtered = hotels.filter(hotel => hotel.latitude && hotel.longitude);
    
    if (selectedCountry) {
      filtered = filtered.filter(hotel => hotel.country === selectedCountry);
    }
    if (selectedCity) {
      filtered = filtered.filter(hotel => hotel.city === selectedCity);
    }
    
    return filtered;
  }, [hotels, selectedCountry, selectedCity]);

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    let filtered = events.filter(event => event.latitude && event.longitude);
    
    if (selectedCountry) {
      filtered = filtered.filter(event => event.country === selectedCountry);
    }
    if (selectedCity) {
      filtered = filtered.filter(event => event.city === selectedCity);
    }
    
    return filtered;
  }, [events, selectedCountry, selectedCity]);

  // Get unique countries and cities for filter dropdowns
  const countries = useMemo(() => {
    const hotelCountries = hotels?.map(h => h.country).filter(Boolean) || [];
    const eventCountries = events?.map(e => e.country).filter(Boolean) || [];
    return Array.from(new Set([...hotelCountries, ...eventCountries])).sort();
  }, [hotels, events]);

  const cities = useMemo(() => {
    const hotelCities = hotels?.filter(h => !selectedCountry || h.country === selectedCountry)
      .map(h => h.city).filter(Boolean) || [];
    const eventCities = events?.filter(e => !selectedCountry || e.country === selectedCountry)
      .map(e => e.city).filter(Boolean) || [];
    return Array.from(new Set([...hotelCities, ...eventCities])).sort();
  }, [hotels, events, selectedCountry]);

  // Handle country/city changes and update map center
  useEffect(() => {
    if (selectedCity) {
      // Find coordinates for selected city
      const hotelInCity = filteredHotels.find(h => h.city === selectedCity);
      const eventInCity = filteredEvents.find(e => e.city === selectedCity);
      
      if (hotelInCity && hotelInCity.latitude && hotelInCity.longitude) {
        setMapCenter([parseFloat(hotelInCity.latitude), parseFloat(hotelInCity.longitude)]);
        setMapZoom(12);
      } else if (eventInCity && eventInCity.latitude && eventInCity.longitude) {
        setMapCenter([parseFloat(eventInCity.latitude), parseFloat(eventInCity.longitude)]);
        setMapZoom(12);
      }
    } else if (selectedCountry) {
      // Find coordinates for selected country (first hotel/event)
      const hotelInCountry = filteredHotels.find(h => h.country === selectedCountry);
      const eventInCountry = filteredEvents.find(e => e.country === selectedCountry);
      
      if (hotelInCountry && hotelInCountry.latitude && hotelInCountry.longitude) {
        setMapCenter([parseFloat(hotelInCountry.latitude), parseFloat(hotelInCountry.longitude)]);
        setMapZoom(7);
      } else if (eventInCountry && eventInCountry.latitude && eventInCountry.longitude) {
        setMapCenter([parseFloat(eventInCountry.latitude), parseFloat(eventInCountry.longitude)]);
        setMapZoom(7);
      }
    } else {
      // Reset to default view
      setMapCenter([50.1109, 8.6821]);
      setMapZoom(5);
    }
  }, [selectedCountry, selectedCity, filteredHotels, filteredEvents]);

  const handleReset = () => {
    setSelectedCountry('');
    setSelectedCity('');
  };

  const isLoading = hotelsLoading || eventsLoading;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 min-w-0 max-w-full overflow-hidden">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Interactive Map
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Explore hotels and events on an interactive map with filtering options
              </p>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="min-w-48">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                      Country
                    </label>
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="min-w-48">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                      City
                    </label>
                    <Select 
                      value={selectedCity} 
                      onValueChange={setSelectedCity}
                      disabled={!selectedCountry}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    variant="outline" 
                    onClick={handleReset}
                    disabled={!selectedCountry && !selectedCity}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>

                {/* Stats */}
                <div className="flex gap-6 mt-4 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span>{filteredHotels.length} hotels</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{filteredEvents.length} events</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="h-96 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-slate-600 dark:text-slate-400">Loading map data...</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-96 md:h-[600px]">
                    <MapContainer
                      center={mapCenter}
                      zoom={mapZoom}
                      style={{ height: '100%', width: '100%' }}
                      className="rounded-lg"
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      
                      <MapController center={mapCenter} zoom={mapZoom} />

                      {/* Hotel Markers */}
                      {filteredHotels.map((hotel) => (
                        <Marker
                          key={`hotel-${hotel.id}`}
                          position={[parseFloat(hotel.latitude || '0'), parseFloat(hotel.longitude || '0')]}
                          icon={hotelIcon}
                        >
                          <Popup>
                            <div className="min-w-64">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-lg text-slate-900">{hotel.name}</h3>
                                <Badge variant="secondary" className="ml-2">Hotel</Badge>
                              </div>
                              
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-slate-500" />
                                  <span className="text-slate-600">
                                    {[hotel.city, hotel.country].filter(Boolean).join(', ')}
                                  </span>
                                </div>
                                
                                {hotel.starRating && (
                                  <div className="flex items-center gap-2">
                                    <div className="flex">
                                      {[...Array(5)].map((_, i) => (
                                        <span
                                          key={i}
                                          className={`text-sm ${i < hotel.starRating! ? 'text-yellow-400' : 'text-slate-300'}`}
                                        >
                                          ★
                                        </span>
                                      ))}
                                    </div>
                                    <span className="text-slate-600">{hotel.starRating} stars</span>
                                  </div>
                                )}

                                {hotel.totalRooms && (
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-slate-500" />
                                    <span className="text-slate-600">{hotel.totalRooms} rooms</span>
                                  </div>
                                )}
                              </div>

                              <div className="mt-3 pt-3 border-t">
                                <Button
                                  size="sm"
                                  onClick={() => setLocation(`/hotels/${hotel.id}`)}
                                  className="w-full"
                                >
                                  View Details
                                  <ExternalLink className="w-3 h-3 ml-2" />
                                </Button>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      ))}

                      {/* Event Markers */}
                      {filteredEvents.map((event) => (
                        <Marker
                          key={`event-${event.id}`}
                          position={[parseFloat(event.latitude || '0'), parseFloat(event.longitude || '0')]}
                          icon={eventIcons[event.category as keyof typeof eventIcons] || eventIcons.default}
                        >
                          <Popup>
                            <div className="min-w-64">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-lg text-slate-900">{event.name}</h3>
                                <Badge variant="outline" className="ml-2 capitalize">
                                  {event.category || 'Event'}
                                </Badge>
                              </div>
                              
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-slate-500" />
                                  <span className="text-slate-600">
                                    {[event.city, event.country].filter(Boolean).join(', ')}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-slate-500" />
                                  <span className="text-slate-600">
                                    {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                                  </span>
                                </div>

                                {event.expectedAttendees && (
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-slate-500" />
                                    <span className="text-slate-600">
                                      {event.expectedAttendees.toLocaleString()} expected attendees
                                    </span>
                                  </div>
                                )}
                              </div>

                              {event.description && (
                                <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                                  {event.description}
                                </p>
                              )}

                              <div className="mt-3 pt-3 border-t">
                                <Button
                                  size="sm"
                                  onClick={() => setLocation(`/events/${event.id}`)}
                                  className="w-full"
                                >
                                  View Details
                                  <ExternalLink className="w-3 h-3 ml-2" />
                                </Button>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Legend */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Map Legend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                      🏨
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">Hotels</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs">
                      📊
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">Conferences</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs">
                      🎉
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">Festivals</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs">
                      🏢
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">Trade Shows</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                      ⚽
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">Sports</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs">
                      🎵
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">Concerts</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-slate-500 rounded-full flex items-center justify-center text-white text-xs">
                      📅
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">Other Events</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}