import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckSquare, Plus, Calendar } from "lucide-react";
import { format } from "date-fns";
import type { Task } from "@shared/schema";

interface UpcomingTasksProps {
  tasks?: Task[];
  isLoading?: boolean;
}

export default function UpcomingTasks({ tasks, isLoading }: UpcomingTasksProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400";
    }
  };

  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return "No due date";
    
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
    if (diffDays <= 7) return `Due in ${diffDays} days`;
    
    return format(date, "MMM d");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="w-32 h-6 bg-slate-200 dark:bg-slate-700 rounded loading-skeleton"></div>
            <div className="w-20 h-8 bg-slate-200 dark:bg-slate-700 rounded loading-skeleton"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded loading-skeleton"></div>
                <div className="flex-1">
                  <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded loading-skeleton mb-2"></div>
                  <div className="w-32 h-3 bg-slate-200 dark:bg-slate-700 rounded loading-skeleton"></div>
                </div>
                <div className="w-12 h-5 bg-slate-200 dark:bg-slate-700 rounded loading-skeleton"></div>
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
            Upcoming Tasks
          </CardTitle>
          <Button variant="ghost" size="sm">
            Manage Tasks
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {tasks && tasks.length > 0 ? (
          <div className="space-y-4">
            {tasks.slice(0, 6).map((task) => (
              <div 
                key={task.id} 
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  task.status === "completed" 
                    ? "bg-green-50 dark:bg-green-900/10" 
                    : "bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                <Checkbox 
                  checked={task.status === "completed"}
                  className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${
                    task.status === "completed" 
                      ? "text-slate-500 dark:text-slate-400 line-through" 
                      : "text-slate-900 dark:text-white"
                  }`}>
                    {task.title}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDueDate(task.dueDate)}
                    </p>
                    {task.assignedTo && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        • Assigned to User
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getPriorityColor(task.priority || "medium")}>
                    {task.priority || "Medium"}
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(task.status || "pending")}>
                    {task.status?.replace("_", " ") || "Pending"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No tasks yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Create your first task to get started
            </p>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Task
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
