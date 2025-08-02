import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Upload, BarChart3, Calendar, Zap } from "lucide-react";

export default function QuickActions() {
  const [aiQuery, setAiQuery] = useState("");

  const quickActions = [
    {
      icon: <Plus className="w-5 h-5" />,
      title: "Add Hotel",
      description: "Register new property",
      color: "blue",
      action: () => console.log("Add hotel")
    },
    {
      icon: <Upload className="w-5 h-5" />,
      title: "Upload Data",
      description: "Import actuals/forecasts",
      color: "green",
      action: () => console.log("Upload data")
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: "Generate Forecast",
      description: "Create new projection",
      color: "purple",
      action: () => console.log("Generate forecast")
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      title: "Event Search",
      description: "Find local events",
      color: "orange",
      action: () => console.log("Event search")
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-100 dark:bg-blue-900/20',
          text: 'text-blue-600 dark:text-blue-400',
          hover: 'group-hover:bg-blue-200 dark:group-hover:bg-blue-900/40'
        };
      case 'green':
        return {
          bg: 'bg-green-100 dark:bg-green-900/20',
          text: 'text-green-600 dark:text-green-400',
          hover: 'group-hover:bg-green-200 dark:group-hover:bg-green-900/40'
        };
      case 'purple':
        return {
          bg: 'bg-purple-100 dark:bg-purple-900/20',
          text: 'text-purple-600 dark:text-purple-400',
          hover: 'group-hover:bg-purple-200 dark:group-hover:bg-purple-900/40'
        };
      case 'orange':
        return {
          bg: 'bg-orange-100 dark:bg-orange-900/20',
          text: 'text-orange-600 dark:text-orange-400',
          hover: 'group-hover:bg-orange-200 dark:group-hover:bg-orange-900/40'
        };
      default:
        return {
          bg: 'bg-slate-100 dark:bg-slate-900/20',
          text: 'text-slate-600 dark:text-slate-400',
          hover: 'group-hover:bg-slate-200 dark:group-hover:bg-slate-900/40'
        };
    }
  };

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (aiQuery.trim()) {
      console.log("AI Query:", aiQuery);
      setAiQuery("");
    }
  };

  return (
    <Card className="shadow-sm border border-slate-200 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="text-slate-900 dark:text-white">Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {quickActions.map((action, index) => {
            const colors = getColorClasses(action.color);
            return (
              <button
                key={index}
                onClick={action.action}
                className="group p-4 text-left border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`p-2 ${colors.bg} ${colors.hover} rounded-lg transition-colors`}>
                    <div className={colors.text}>
                      {action.icon}
                    </div>
                  </div>
                </div>
                <h4 className="font-medium text-slate-900 dark:text-white text-sm">{action.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{action.description}</p>
              </button>
            );
          })}
        </div>

        {/* AI Chat Widget */}
        <div className="p-4 gradient-card border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white text-sm">AI Assistant</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">Ask questions about your data</p>
            </div>
          </div>
          <form onSubmit={handleAiSubmit}>
            <Input
              type="text"
              placeholder="e.g., 'Show me top performing hotels this quarter'"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              className="text-sm"
            />
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
