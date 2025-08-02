import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarViewProps {
  forecasts: any[];
}

export default function CalendarView({ forecasts }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getForecastsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return forecasts.filter(forecast => forecast.forecastDate === dateStr);
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      default:
        return 'bg-red-500';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'event-based':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
      case 'monthly':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400';
      case 'annual':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400';
      default:
        return 'bg-slate-100 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400';
    }
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const monthYear = currentDate.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="shadow-sm border border-slate-200 dark:border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5" />
            <span>Forecast Calendar</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-lg font-semibold min-w-[200px] text-center">
              {monthYear}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {/* Week day headers */}
          {weekDays.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-slate-600 dark:text-slate-400">
              {day}
            </div>
          ))}

          {/* Empty cells for days before month starts */}
          {emptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="h-24 p-1"></div>
          ))}

          {/* Calendar days */}
          {days.map((day) => {
            const dayForecasts = getForecastsForDate(day);
            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

            return (
              <div
                key={day}
                className={cn(
                  "h-24 p-1 border border-slate-200 dark:border-slate-700 rounded-lg",
                  isToday && "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                )}
              >
                <div className={cn(
                  "text-sm font-medium mb-1",
                  isToday ? "text-blue-600 dark:text-blue-400" : "text-slate-900 dark:text-white"
                )}>
                  {day}
                </div>
                <div className="space-y-1">
                  {dayForecasts.slice(0, 2).map((forecast, index) => (
                    <div
                      key={forecast.id}
                      className="relative group cursor-pointer"
                    >
                      <div className={cn(
                        "text-xs p-1 rounded text-center truncate",
                        getTypeColor(forecast.forecastType)
                      )}>
                        {forecast.forecastType}
                      </div>
                      <div className={cn(
                        "absolute -top-1 -right-1 w-2 h-2 rounded-full",
                        getConfidenceColor(forecast.confidence)
                      )}></div>
                      
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
                        <div className="bg-slate-900 dark:bg-slate-700 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                          <div>Revenue: ${forecast.revenue?.toLocaleString()}</div>
                          <div>Occupancy: {forecast.occupancyRate}%</div>
                          <div className="capitalize">Confidence: {forecast.confidence}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {dayForecasts.length > 2 && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                      +{dayForecasts.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-3">Legend</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Forecast Types</p>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">event-based</Badge>
                  <span className="text-xs text-slate-600 dark:text-slate-400">Event-based forecasts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">monthly</Badge>
                  <span className="text-xs text-slate-600 dark:text-slate-400">Monthly forecasts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">annual</Badge>
                  <span className="text-xs text-slate-600 dark:text-slate-400">Annual forecasts</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Confidence Levels</p>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-slate-600 dark:text-slate-400">High confidence</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-xs text-slate-600 dark:text-slate-400">Medium confidence</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-slate-600 dark:text-slate-400">Low confidence</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
