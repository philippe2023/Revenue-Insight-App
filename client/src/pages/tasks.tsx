import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Filter } from "lucide-react";
import Navigation from "@/components/layout/navigation";
import Sidebar from "@/components/layout/sidebar";
import TaskItem from "@/components/tasks/task-item";
import TaskForm from "@/components/tasks/task-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { taskApi, hotelApi } from "@/lib/api";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Tasks() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedHotel, setSelectedHotel] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const { data: hotels } = useQuery({
    queryKey: ["/api/hotels"],
    queryFn: hotelApi.getAll,
    retry: false,
  });

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["/api/tasks", selectedHotel === "all" ? undefined : selectedHotel, statusFilter === "all" ? undefined : statusFilter],
    queryFn: () => taskApi.getAll(selectedHotel === "all" ? undefined : selectedHotel, statusFilter === "all" ? undefined : statusFilter),
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: taskApi.create,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Task created successfully",
      });
      setIsFormOpen(false);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => taskApi.update(id, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const filteredTasks = tasks?.filter((task: any) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  }) || [];

  const getStatusCount = (status: string) => {
    return tasks?.filter((task: any) => task.status === status).length || 0;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
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
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Tasks</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Manage your team's tasks and track progress
              </p>
            </div>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                </DialogHeader>
                <TaskForm 
                  onSubmit={createMutation.mutate}
                  isLoading={createMutation.isPending}
                  hotels={hotels || []}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedHotel} onValueChange={setSelectedHotel}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by hotel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Hotels</SelectItem>
                {hotels?.map((hotel: any) => (
                  <SelectItem key={hotel.id} value={hotel.id}>{hotel.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">
                All Tasks
                <Badge variant="secondary" className="ml-2">
                  {tasks?.length || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending
                <Badge variant="secondary" className="ml-2">
                  {getStatusCount('pending')}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="in-progress">
                In Progress
                <Badge variant="secondary" className="ml-2">
                  {getStatusCount('in-progress')}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed
                <Badge variant="secondary" className="ml-2">
                  {getStatusCount('completed')}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={statusFilter}>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center space-x-4">
                        <div className="loading-skeleton w-5 h-5 rounded"></div>
                        <div className="flex-1">
                          <div className="loading-skeleton h-5 w-3/4 mb-2"></div>
                          <div className="loading-skeleton h-4 w-1/2"></div>
                        </div>
                        <div className="loading-skeleton h-6 w-16 rounded-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500 dark:text-slate-400 text-lg mb-2">No tasks found</p>
                  <p className="text-slate-400 dark:text-slate-500 mb-4">
                    {searchTerm || priorityFilter !== "all" || selectedHotel !== "all" 
                      ? "Try adjusting your filters" 
                      : "Create your first task to get started"
                    }
                  </p>
                  {!searchTerm && priorityFilter === "all" && selectedHotel === "all" && (
                    <Button onClick={() => setIsFormOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Task
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTasks.map((task: any) => (
                    <TaskItem 
                      key={task.id} 
                      task={task} 
                      onUpdate={(data) => updateMutation.mutate({ id: task.id, data })}
                      isUpdating={updateMutation.isPending}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
