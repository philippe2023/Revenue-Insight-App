import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  BarChart3,
  Hotel,
  Calendar,
  CheckSquare,
  TrendingUp,
  MessageSquare,
  Users
} from "lucide-react";

const navigationItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: BarChart3,
  },
  {
    title: "Hotels",
    href: "/hotels",
    icon: Hotel,
    badge: "24"
  },
  {
    title: "Forecasting",
    href: "/forecasting",
    icon: TrendingUp,
  },
  {
    title: "Events",
    href: "/events",
    icon: Calendar,
  },
  {
    title: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
    badge: "7"
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "AI Assistant",
    href: "/ai-chat",
    icon: MessageSquare,
    indicator: true
  },
];

const teamMembers = [
  {
    name: "Emma Wilson",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b1bd?w=24&h=24&fit=crop&crop=face",
    status: "online"
  },
  {
    name: "David Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=24&h=24&fit=crop&crop=face",
    status: "away"
  }
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white dark:bg-slate-800 min-h-screen border-r border-slate-200 dark:border-slate-700">
      <div className="p-4">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer",
                  isActive 
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                )}>
                  <item.icon className="w-5 h-5" />
                  <span>{item.title}</span>
                  {item.badge && (
                    <span className="ml-auto bg-slate-200 dark:bg-slate-600 text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {item.indicator && (
                    <span className="w-2 h-2 bg-green-500 rounded-full ml-auto"></span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
        
        {/* Team Section */}
        <div className="mt-8">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
            Team
          </h3>
          <div className="space-y-1">
            {teamMembers.map((member, index) => (
              <div key={index} className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                <img 
                  src={member.avatar} 
                  alt={member.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span className="text-sm text-slate-600 dark:text-slate-300">{member.name}</span>
                <span className={cn(
                  "w-2 h-2 rounded-full ml-auto",
                  member.status === "online" ? "bg-green-500" : "bg-yellow-500"
                )}></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
