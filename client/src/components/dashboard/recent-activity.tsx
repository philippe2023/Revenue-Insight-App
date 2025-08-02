import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, CheckCircle, MessageSquare, Plus } from "lucide-react";

export default function RecentActivity() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["/api/dashboard/recent-activity", { limit: 5 }],
    retry: false,
  });

  if (isLoading) {
    return (
      <Card className="shadow-sm border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'upload':
        return <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'create':
        return <Plus className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'update':
        return <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      default:
        return <MessageSquare className="w-4 h-4 text-orange-600 dark:text-orange-400" />;
    }
  };

  const getActivityBg = (action: string) => {
    switch (action) {
      case 'upload':
        return 'bg-blue-100 dark:bg-blue-900/20';
      case 'create':
        return 'bg-green-100 dark:bg-green-900/20';
      case 'update':
        return 'bg-purple-100 dark:bg-purple-900/20';
      default:
        return 'bg-orange-100 dark:bg-orange-900/20';
    }
  };

  const formatActivity = (activity: any) => {
    const entityName = activity.metadata?.hotelName || activity.metadata?.eventName || activity.metadata?.taskTitle || 'item';
    
    switch (activity.action) {
      case 'upload':
        return `Uploaded ${activity.metadata?.count || 'data'} records for ${entityName}`;
      case 'create':
        return `Created ${activity.entityType} "${entityName}"`;
      case 'update':
        return `Updated ${activity.entityType} "${entityName}"`;
      default:
        return `${activity.action} ${activity.entityType}`;
    }
  };

  return (
    <Card className="shadow-sm border border-slate-200 dark:border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-900 dark:text-white">Recent Activity</CardTitle>
          <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities?.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`flex-shrink-0 w-8 h-8 ${getActivityBg(activity.action)} rounded-full flex items-center justify-center`}>
                {getActivityIcon(activity.action)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-900 dark:text-white">
                  {formatActivity(activity)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {new Date(activity.createdAt).toRelative()}
                </p>
              </div>
            </div>
          ))}
          
          {/* Fallback for empty activities */}
          {!activities?.length && (
            <div className="text-center py-8">
              <p className="text-slate-500 dark:text-slate-400">No recent activity</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
