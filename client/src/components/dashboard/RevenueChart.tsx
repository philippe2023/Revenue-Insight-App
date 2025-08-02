import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, BarChart3 } from "lucide-react";
import { useEffect, useRef } from "react";

export default function RevenueChart() {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Mock data for demonstration
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Simple gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');

    // Clear canvas
    ctx.clearRect(0, 0, chartRef.current.width, chartRef.current.height);
    
    // Draw gradient background
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, chartRef.current.width, chartRef.current.height);

    // Mock chart data points
    const dataPoints = [
      { month: 'Jan', value: 120000 },
      { month: 'Feb', value: 190000 },
      { month: 'Mar', value: 150000 },
      { month: 'Apr', value: 220000 },
      { month: 'May', value: 180000 },
      { month: 'Jun', value: 250000 },
    ];

    const maxValue = Math.max(...dataPoints.map(d => d.value));
    const width = chartRef.current.width;
    const height = chartRef.current.height;
    const padding = 40;

    // Draw line chart
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 3;
    ctx.beginPath();

    dataPoints.forEach((point, index) => {
      const x = padding + (index * (width - 2 * padding)) / (dataPoints.length - 1);
      const y = height - padding - ((point.value / maxValue) * (height - 2 * padding));
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      // Draw data points
      ctx.fillStyle = '#3B82F6';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    ctx.stroke();
  }, []);

  return (
    <Card className="chart-animation">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              Revenue Analytics
            </CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Monthly performance across all properties
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="secondary" size="sm" className="text-xs">
              Direct
            </Button>
            <Button variant="ghost" size="sm" className="text-xs">
              Indirect
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative h-64 w-full">
          <canvas 
            ref={chartRef}
            className="w-full h-full"
            width={600}
            height={256}
          />
          {/* Fallback content */}
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 dark:text-slate-400 pointer-events-none">
            <div className="text-center opacity-20">
              <BarChart3 className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">Revenue trend visualization</p>
            </div>
          </div>
        </div>
        
        {/* Chart Legend/Summary */}
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-slate-600 dark:text-slate-400">Revenue</span>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
            <TrendingUp className="w-4 h-4" />
            <span className="font-medium">+12.3% growth</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
