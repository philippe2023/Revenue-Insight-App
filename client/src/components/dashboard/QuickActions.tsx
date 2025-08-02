import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Upload, 
  BarChart3, 
  Calendar, 
  Zap,
  FileText,
  Users,
  Search
} from "lucide-react";

export default function QuickActions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [aiQuery, setAiQuery] = useState("");

  const aiChatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/ai/chat", { message });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "AI Response",
        description: data.response,
      });
      setAiQuery("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to get AI response",
        variant: "destructive",
      });
    },
  });

  const quickActions = [
    {
      title: "Add Hotel",
      description: "Register new property",
      icon: Plus,
      iconBg: "bg-blue-100 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      action: () => {
        // Navigate to hotels page with form open
        window.location.href = "/hotels";
      }
    },
    {
      title: "Upload Data",
      description: "Import actuals/forecasts",
      icon: Upload,
      iconBg: "bg-green-100 dark:bg-green-900/20",
      iconColor: "text-green-600 dark:text-green-400",
      action: () => {
        toast({
          title: "Feature Coming Soon",
          description: "Data upload functionality will be available soon",
        });
      }
    },
    {
      title: "Generate Forecast",
      description: "Create new projection",
      icon: BarChart3,
      iconBg: "bg-purple-100 dark:bg-purple-900/20",
      iconColor: "text-purple-600 dark:text-purple-400",
      action: () => {
        window.location.href = "/forecasting";
      }
    },
    {
      title: "Event Search",
      description: "Find local events",
      icon: Calendar,
      iconBg: "bg-orange-100 dark:bg-orange-900/20",
      iconColor: "text-orange-600 dark:text-orange-400",
      action: () => {
        window.location.href = "/events";
      }
    },
    {
      title: "Generate Report",
      description: "Create analytics report",
      icon: FileText,
      iconBg: "bg-indigo-100 dark:bg-indigo-900/20",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      action: () => {
        window.location.href = "/analytics";
      }
    },
    {
      title: "Team Management",
      description: "Manage users & permissions",
      icon: Users,
      iconBg: "bg-pink-100 dark:bg-pink-900/20",
      iconColor: "text-pink-600 dark:text-pink-400",
      action: () => {
        toast({
          title: "Feature Coming Soon",
          description: "Team management features will be available soon",
        });
      }
    }
  ];

  const handleQuickAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    aiChatMutation.mutate(aiQuery);
  };

  return (
    <Card>
      <CardHeader>
        <div className="mb-6">
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
            Quick Actions
          </CardTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Common tasks and shortcuts
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
              onClick={action.action}
            >
              <div className="w-full">
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`p-2 rounded-lg ${action.iconBg} group-hover:scale-110 transition-transform`}>
                    <action.icon className={`w-5 h-5 ${action.iconColor}`} />
                  </div>
                </div>
                <h4 className="font-medium text-slate-900 dark:text-white text-sm mb-1">
                  {action.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {action.description}
                </p>
              </div>
            </Button>
          ))}
        </div>

        {/* AI Chat Widget */}
        <div className="gradient-card border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 hero-gradient rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white text-sm">
                AI Assistant
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Ask questions about your data
              </p>
            </div>
          </div>
          <form onSubmit={handleQuickAI} className="flex space-x-2">
            <Input
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="e.g., 'Show me top performing hotels this quarter'"
              className="flex-1 text-sm"
              disabled={aiChatMutation.isPending}
            />
            <Button 
              type="submit" 
              size="sm"
              disabled={!aiQuery.trim() || aiChatMutation.isPending}
            >
              <Search className="w-4 h-4" />
            </Button>
          </form>
          <div className="mt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs"
              onClick={() => window.location.href = "/ai-chat"}
            >
              Open full AI chat →
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
