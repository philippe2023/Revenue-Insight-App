import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  CheckCircle, 
  MessageSquare, 
  Plus,
  Upload,
  User,
  Activity
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ActivityLog } from "@shared/schema";

interface RecentActivityProps {
  activities?: ActivityLog[];
  isLoading?: boolean;
}

export default function RecentActivity({ activities, isLoading }: RecentActivityProps) {
  const getActivityIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case "created":
        return <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case "updated":
        return <BarChart3 className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case "uploaded":
        return <Upload className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case "commented":
        return <MessageSquare className="w-4 h-4 text-orange-600 dark:text-orange-400" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
      default:
        return <Activity className="w-4 h-4 text-slate-600 dark:text-slate-400" />;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "created":
        return "bg-blue-100 dark:bg-blue-900/20";
      case "updated":
        return "bg-green-100 dark:bg-green-900/20";
      case "uploaded":
        return "bg-purple-100 dark:bg-purple-900/20";
      case "commented":
        return "bg-orange-100 dark:bg-orange-900/20";
      case "completed":
        return "bg-green-100 dark:bg-green-900/20";
      default:
        return "bg-slate-100 dark:bg-slate-700";
    }
  };

  const formatActivityText = (activity: ActivityLog) => {
    const entityName = activity.details?.name || activity.entityType;
    switch (activity.action.toLowerCase()) {
      case "created":
        return `created ${activity.entityType.replace('_', ' ')} "${entityName}"`;
      case "updated":
        return `updated ${activity.entityType.replace('_', ' ')} "${entityName}"`;
      case "uploaded":
        return `uploaded data for ${activity.entityType.replace('_', ' ')}`;
      case "commented":
        return `commented on ${activity.entityType.replace('_', ' ')}`;
      case "completed":
        return `completed task "${entityName}"`;
      default:
        return `${activity.action} ${activity.entityType.replace('_', ' ')}`;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="w-32 h-6 bg-slate-200 dark:bg-slate-700 rounded loading-skeleton"></div>
            <div className="w-16 h-8 bg-slate-200 dark:bg-slate-700 rounded loading-skeleton"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full loading-skeleton"></div>
                <div className="flex-1">
                  <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded loading-skeleton mb-2"></div>
                  <div className="w-24 h-3 bg-slate-200 dark:bg-slate-700 rounded loading-skeleton"></div>
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
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
            Recent Activity
          </CardTitle>
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {activities && activities.length > 0 ? (
          <div className="space-y-4">
            {activities.slice(0, 6).map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-8 h-8 ${getActivityColor(activity.action)} rounded-full flex items-center justify-center`}>
                  {getActivityIcon(activity.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900 dark:text-white">
                    <span className="font-medium">User</span> {formatActivityText(activity)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {formatDistanceToNow(new Date(activity.createdAt))} ago
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {activity.entityType.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No recent activity
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Activity from your team will appear here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
