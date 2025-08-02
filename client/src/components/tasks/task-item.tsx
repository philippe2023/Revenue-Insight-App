import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Calendar, Clock, User, MessageSquare, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import CommentThread from "@/components/comments/comment-thread";
import TaskForm from "./task-form";

interface TaskItemProps {
  task: any;
  onUpdate: (data: any) => void;
  isUpdating?: boolean;
}

export default function TaskItem({ task, onUpdate, isUpdating }: TaskItemProps) {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleStatusChange = (completed: boolean) => {
    const newStatus = completed ? 'completed' : 'pending';
    onUpdate({ status: newStatus });
  };

  const handlePriorityChange = (priority: string) => {
    onUpdate({ priority });
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      // Handle delete logic here - would need to be passed as prop or use mutation
      console.log("Delete task:", task.id);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
      case 'in-progress':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
      case 'cancelled':
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400';
      default:
        return 'bg-slate-100 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400';
    }
  };

  const formatDueDate = (dateString: string | null) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: `${Math.abs(diffDays)} days overdue`, color: "text-red-600 dark:text-red-400" };
    if (diffDays === 0) return { text: "Due today", color: "text-orange-600 dark:text-orange-400" };
    if (diffDays === 1) return { text: "Due tomorrow", color: "text-yellow-600 dark:text-yellow-400" };
    if (diffDays <= 7) return { text: `Due in ${diffDays} days`, color: "text-blue-600 dark:text-blue-400" };
    
    return { 
      text: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
      color: "text-slate-600 dark:text-slate-400" 
    };
  };

  const dueInfo = task.dueDate ? formatDueDate(task.dueDate) : null;

  return (
    <>
      <Card className={cn(
        "transition-all duration-200 hover:shadow-md",
        task.status === 'completed' && "opacity-75"
      )}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              <Checkbox
                checked={task.status === 'completed'}
                onCheckedChange={handleStatusChange}
                disabled={isUpdating}
                className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className={cn(
                    "font-medium text-slate-900 dark:text-white",
                    task.status === 'completed' && "line-through text-slate-500 dark:text-slate-400"
                  )}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 ml-3">
                  <Badge className={getPriorityColor(task.priority || 'low')}>
                    {task.priority}
                  </Badge>
                  <Badge variant="secondary" className={getStatusColor(task.status)}>
                    {task.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setIsCommentsOpen(true)}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Comments
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePriorityChange('urgent')}>
                        <Clock className="w-4 h-4 mr-2" />
                        Mark Urgent
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDelete} className="text-red-600 dark:text-red-400">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                {dueInfo && (
                  <div className={cn("flex items-center space-x-1", dueInfo.color)}>
                    <Calendar className="w-4 h-4" />
                    <span>{dueInfo.text}</span>
                  </div>
                )}

                {task.assignedTo && (
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>Assigned to {task.assignedTo}</span>
                  </div>
                )}

                {task.hotelId && (
                  <div className="flex items-center space-x-1">
                    <span>Hotel: {task.hotelId}</span>
                  </div>
                )}
              </div>

              {task.completedAt && (
                <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                  Completed on {new Date(task.completedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <TaskForm
            task={task}
            onSubmit={(data) => {
              onUpdate(data);
              setIsEditOpen(false);
            }}
            isLoading={isUpdating}
            hotels={[]} // Would need to pass hotels as prop
          />
        </DialogContent>
      </Dialog>

      {/* Comments Dialog */}
      <Dialog open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Comments - {task.title}</DialogTitle>
          </DialogHeader>
          <CommentThread entityType="task" entityId={task.id} />
        </DialogContent>
      </Dialog>
    </>
  );
}
