import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  BarChart3, 
  Building2, 
  TrendingUp, 
  Calendar, 
  CheckSquare, 
  MessageSquare, 
  Users,
  LayoutDashboard,
  Settings,
  HelpCircle
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    current: true,
  },
  {
    name: "Hotels",
    href: "/hotels",
    icon: Building2,
    current: false,
    badge: "24"
  },
  {
    name: "Forecasting",
    href: "/forecasting",
    icon: TrendingUp,
    current: false,
  },
  {
    name: "Events",
    href: "/events",
    icon: Calendar,
    current: false,
  },
  {
    name: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
    current: false,
    badge: "7"
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    current: false,
  },
  {
    name: "AI Assistant",
    href: "/ai-chat",
    icon: MessageSquare,
    current: false,
    isNew: true
  },
];

const teamMembers = [
  {
    name: "Emma Wilson",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b192?w=32&h=32&fit=crop&crop=face",
    status: "online"
  },
  {
    name: "David Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
    status: "away"
  },
  {
    name: "Sarah Johnson",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face",
    status: "online"
  }
];

export default function Sidebar() {
  const [location, navigate] = useLocation();
  
  return (
    <aside className="fixed left-0 top-16 z-40 w-72 h-[calc(100vh-4rem)] bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 overflow-y-auto">
      <div className="flex flex-col h-full">
        {/* Navigation */}
        <div className="flex-1 px-4 py-6">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={cn(
                    "group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {item.badge}
                    </Badge>
                  )}
                  {item.isNew && (
                    <Badge className="ml-auto bg-green-500 text-white text-xs">
                      New
                    </Badge>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Team Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Team
              </h3>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Users className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="space-y-2">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                >
                  <div className="relative">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback className="text-xs">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800",
                      member.status === "online" ? "bg-green-500" : "bg-yellow-500"
                    )} />
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-300 truncate">
                    {member.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-4">
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start h-9">
              <Settings className="mr-3 h-4 w-4" />
              Settings
            </Button>
            <Button variant="ghost" className="w-full justify-start h-9">
              <HelpCircle className="mr-3 h-4 w-4" />
              Help & Support
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
