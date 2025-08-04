import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BarChart3, TrendingUp, DollarSign, Calendar, Upload, FileSpreadsheet } from "lucide-react";
import Navigation from "@/components/layout/navigation";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Bar, BarChart } from "recharts";
import { useState } from "react";
import { hotelApi } from "@/lib/api";

export default function Analytics() {
  const [selectedHotel, setSelectedHotel] = useState<string>("all");
  const [timeRange, setTimeRange] = useState("30d");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: hotels } = useQuery({
    queryKey: ["/api/hotels"],
    queryFn: hotelApi.getAll,
    retry: false,
  });

  const { data: kpis } = useQuery<{
    totalRevenue: number;
    totalBookings: number;
    avgOccupancyRate: number;
    activeHotels: number;
    upcomingEvents: number;
  }>({
    queryKey: ["/api/dashboard/kpis"],
    retry: false,
  });

  const { data: revenueAnalytics } = useQuery<{
    monthly: Array<{ month: string; revenue: number; bookings: number }>;
  }>({
    queryKey: ["/api/dashboard/revenue-analytics", selectedHotel === "all" ? undefined : selectedHotel],
    retry: false,
  });

  const { data: topPerformers } = useQuery<Array<{
    id: string;
    name: string;
    revenue: number;
    occupancyRate: number;
  }>>({
    queryKey: ["/api/dashboard/top-performers", { limit: 10 }],
    retry: false,
  });

  // Transform data for charts
  const chartData = revenueAnalytics?.monthly?.map((item) => ({
    month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short' }),
    revenue: item.revenue,
    occupancy: Math.random() * 100, // Placeholder - would come from actual data
  })) || [];

  const performanceData = topPerformers?.map((hotel) => ({
    name: hotel.name.length > 15 ? hotel.name.substring(0, 15) + '...' : hotel.name,
    revenue: hotel.revenue,
    occupancy: hotel.occupancyRate,
  })) || [];

  // Excel upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/analytics/upload-excel', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Upload successful",
        description: "Hotel performance data has been imported successfully.",
      });
      setIsUploadOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('excel', file);
      if (selectedHotel !== "all") {
        formData.append('hotelId', selectedHotel);
      }
      uploadMutation.mutate(formData);
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
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Analytics</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Deep insights into your hotel performance and trends
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
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 days</SelectItem>
                  <SelectItem value="30d">30 days</SelectItem>
                  <SelectItem value="90d">90 days</SelectItem>
                  <SelectItem value="1y">1 year</SelectItem>
                </SelectContent>
              </Select>
              <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Excel
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Hotel Performance Data</DialogTitle>
                    <DialogDescription>
                      Upload an Excel file with actual hotel performance data (occupancy, ADR, revenue, etc.)
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                      <label htmlFor="excel-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FileSpreadsheet className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Excel files (.xlsx, .xls)</p>
                        </div>
                        <Input
                          id="excel-upload"
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={handleFileUpload}
                          className="hidden"
                          disabled={uploadMutation.isPending}
                        />
                      </label>
                    </div>
                    {uploadMutation.isPending && (
                      <div className="text-center text-sm text-gray-500">
                        Uploading and processing file...
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline">
                Export Report
              </Button>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <Badge variant="secondary" className="text-green-600 dark:text-green-400">
                    +12.3%
                  </Badge>
                </div>
                <div className="mt-4">
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    ${kpis?.totalRevenue?.toLocaleString() || '0'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <Badge variant="secondary" className="text-blue-600 dark:text-blue-400">
                    +5.8%
                  </Badge>
                </div>
                <div className="mt-4">
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Avg Occupancy</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {kpis?.avgOccupancyRate?.toFixed(1) || '0'}%
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <Badge variant="secondary" className="text-purple-600 dark:text-purple-400">
                    +2
                  </Badge>
                </div>
                <div className="mt-4">
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Active Hotels</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {kpis?.activeHotels || '0'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <Badge variant="secondary" className="text-orange-600 dark:text-orange-400">
                    This Week
                  </Badge>
                </div>
                <div className="mt-4">
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Upcoming Events</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {kpis?.upcomingEvents || '0'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Trend</CardTitle>
                    <CardDescription>Monthly revenue performance over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                          <XAxis dataKey="month" className="text-slate-600 dark:text-slate-400" />
                          <YAxis className="text-slate-600 dark:text-slate-400" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                          <Tooltip 
                            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--background))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Hotel Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle>Hotel Performance</CardTitle>
                    <CardDescription>Revenue comparison across properties</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={performanceData.slice(0, 6)}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                          <XAxis dataKey="name" className="text-slate-600 dark:text-slate-400" fontSize={12} />
                          <YAxis className="text-slate-600 dark:text-slate-400" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                          <Tooltip 
                            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--background))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Revenue per Available Room (RevPAR)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                      $127.50
                    </div>
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
                      +8.3% from last month
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Average Daily Rate (ADR)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      $184.20
                    </div>
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
                      +3.2% from last month
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Guest Satisfaction Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                      4.7/5.0
                    </div>
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
                      +0.2 from last month
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="revenue">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Analytics</CardTitle>
                  <CardDescription>Detailed revenue breakdown and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <DollarSign className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">Detailed revenue analytics coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="occupancy">
              <Card>
                <CardHeader>
                  <CardTitle>Occupancy Analytics</CardTitle>
                  <CardDescription>Room occupancy trends and patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">Occupancy analytics coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Hotel Performance Ranking</CardTitle>
                    <CardDescription>Ranked by revenue performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topPerformers?.slice(0, 10).map((hotel: any, index: number) => (
                        <div key={hotel.id} className="flex items-center space-x-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                          <div className="flex items-center justify-center w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full font-semibold text-sm">
                            {index + 1}
                          </div>
                          <img 
                            src={hotel.imageUrl || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=48&h=48&fit=crop"} 
                            alt={hotel.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 dark:text-white">{hotel.name}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{hotel.city}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600 dark:text-green-400">
                              ${(hotel.revenue / 1000).toFixed(0)}K
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {(hotel.occupancyRate || 0).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      ))}
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
