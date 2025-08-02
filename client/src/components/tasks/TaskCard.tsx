import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Calendar, Building2, CalendarDays, MoreVertical, Edit, Trash2, Eye, User } from "lucide-react";
import { format } from "date-fns";
import type { Task, Hotel, Event } from "@shared/schema";

interface TaskCardProps {
  task: Task;
  hotels: Hotel[];
  events: Event[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (task: Task) => void;
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
}

export default function TaskCard({ 
  task, 
  hotels, 
  events, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  getStatusColor,
  getPriorityColor 
}: TaskCardProps) {
  const hotel = hotels.find(h => h.id === task.hotelId);
  const event = events.find(e => e.id === task.eventId);
  
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "completed";
  const isCompleted = task.status === "completed";

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
    
    return format(date, "MMM d, yyyy");
  };

  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 animate-fade-in ${
      isCompleted ? "bg-green-50 dark:bg-green-900/10" : isOverdue ? "bg-red-50 dark:bg-red-900/10" : ""
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Checkbox 
            checked={isCompleted}
            onCheckedChange={() => onToggleStatus(task)}
            className="mt-1 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className={`font-semibold text-lg ${
                isCompleted 
                  ? "text-slate-500 dark:text-slate-400 line-through" 
                  : "text-slate-900 dark:text-white"
              }`}>
                {task.title}
              </h3>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(task)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Task
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(task.id)}
                    className="text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {task.description && (
              <p className={`text-sm mb-3 ${
                isCompleted 
                  ? "text-slate-400 dark:text-slate-500" 
                  : "text-slate-600 dark:text-slate-400"
              }`}>
                {task.description}
              </p>
            )}

            <div className="space-y-2 mb-3">
              {task.dueDate && (
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className={`w-4 h-4 ${isOverdue ? "text-red-500" : "text-slate-400"}`} />
                  <span className={isOverdue ? "text-red-600 dark:text-red-400 font-medium" : "text-slate-600 dark:text-slate-400"}>
                    {formatDueDate(task.dueDate)}
                  </span>
                </div>
              )}

              {task.assignedTo && (
                <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                  <User className="w-4 h-4" />
                  <span>Assigned to User</span>
                </div>
              )}

              {hotel && (
                <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                  <Building2 className="w-4 h-4" />
                  <span>{hotel.name}</span>
                </div>
              )}

              {event && (
                <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                  <CalendarDays className="w-4 h-4" />
                  <span>{event.name}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge className={getPriorityColor(task.priority || "medium")}>
                  {task.priority || "Medium"}
                </Badge>
                <Badge className={getStatusColor(task.status || "pending")}>
                  {task.status?.replace("_", " ") || "Pending"}
                </Badge>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(task)}>
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
