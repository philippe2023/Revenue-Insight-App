import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

export default function UpcomingTasks() {
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["/api/tasks/upcoming", { limit: 4 }],
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
              <div key={i} className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <Skeleton className="w-4 h-4" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-48 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
      case 'urgent':
        return 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400';
      case 'medium':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400';
      default:
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
    }
  };

  return (
    <Card className="shadow-sm border border-slate-200 dark:border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-900 dark:text-white">Upcoming Tasks</CardTitle>
          <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400">
            Manage Tasks
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks?.map((task) => (
            <div key={task.id} className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <Checkbox 
                checked={task.status === 'completed'}
                disabled={task.status === 'completed'}
              />
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  task.status === 'completed' 
                    ? 'text-slate-500 dark:text-slate-400 line-through' 
                    : 'text-slate-900 dark:text-white'
                }`}>
                  {task.title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Due: {new Date(task.dueDate || '').toLocaleDateString()} • {task.assignedTo || 'Unassigned'}
                </p>
              </div>
              <Badge variant="secondary" className={getPriorityColor(task.priority || 'low')}>
                {task.priority}
              </Badge>
            </div>
          ))}
          
          {/* Fallback for empty tasks */}
          {!tasks?.length && (
            <div className="text-center py-8">
              <p className="text-slate-500 dark:text-slate-400">No upcoming tasks</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
