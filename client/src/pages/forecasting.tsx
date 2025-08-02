import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, BarChart3, Plus, TrendingUp } from "lucide-react";
import Navigation from "@/components/layout/navigation";
import Sidebar from "@/components/layout/sidebar";
import ForecastForm from "@/components/forecasting/forecast-form";
import CalendarView from "@/components/forecasting/calendar-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { forecastApi, hotelApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

export default function Forecasting() {
  const [selectedHotel, setSelectedHotel] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: hotels } = useQuery({
    queryKey: ["/api/hotels"],
    queryFn: hotelApi.getAll,
    retry: false,
  });

  const { data: forecasts, isLoading } = useQuery({
    queryKey: ["/api/forecasts", selectedHotel === "all" ? undefined : selectedHotel],
    queryFn: () => forecastApi.getAll(selectedHotel === "all" ? undefined : selectedHotel),
    retry: false,
  });

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400';
      default:
        return 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400';
    }
  };

  const getMethodologyIcon = (methodology: string) => {
    switch (methodology) {
      case 'ai-generated':
        return <TrendingUp className="w-4 h-4" />;
      case 'historical':
        return <BarChart3 className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
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
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Forecasting</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Create and manage revenue forecasts with AI-powered insights
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Select value={selectedHotel} onValueChange={setSelectedHotel}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select hotel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Hotels</SelectItem>
                  {hotels?.map((hotel: any) => (
                    <SelectItem key={hotel.id} value={hotel.id}>{hotel.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    New Forecast
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Forecast</DialogTitle>
                  </DialogHeader>
                  <ForecastForm onClose={() => setIsFormOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Tabs defaultValue="list" className="space-y-6">
            <TabsList>
              <TabsTrigger value="list">Forecast List</TabsTrigger>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-6">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <div className="loading-skeleton h-6 w-3/4 mb-2"></div>
                        <div className="loading-skeleton h-4 w-1/2"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="loading-skeleton h-20 w-full"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : forecasts?.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400 text-lg mb-2">No forecasts yet</p>
                  <p className="text-slate-400 dark:text-slate-500 mb-4">Create your first forecast to get started</p>
                  <Button onClick={() => setIsFormOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Forecast
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {forecasts?.map((forecast: any) => (
                    <Card key={forecast.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getMethodologyIcon(forecast.methodology)}
                            <CardTitle className="text-lg">{forecast.forecastType}</CardTitle>
                          </div>
                          <Badge className={getConfidenceColor(forecast.confidence)}>
                            {forecast.confidence}
                          </Badge>
                        </div>
                        <CardDescription>
                          {new Date(forecast.forecastDate).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Revenue</span>
                            <span className="font-semibold text-green-600 dark:text-green-400">
                              ${forecast.revenue?.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Occupancy</span>
                            <span className="font-semibold">
                              {forecast.occupancyRate}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600 dark:text-slate-400">ADR</span>
                            <span className="font-semibold">
                              ${forecast.averageDailyRate}
                            </span>
                          </div>
                          {forecast.notes && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                              {forecast.notes}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="calendar">
              <CalendarView forecasts={forecasts || []} />
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Forecast Accuracy</CardTitle>
                    <CardDescription>Historical performance of forecast models</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <TrendingUp className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500 dark:text-slate-400">Analytics coming soon</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Trends</CardTitle>
                    <CardDescription>Projected vs actual revenue comparison</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <BarChart3 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500 dark:text-slate-400">Analytics coming soon</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
