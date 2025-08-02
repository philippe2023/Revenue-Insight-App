import { useState } from "react";
import { Search, Bell, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/ui/theme-provider";
import { useAuth } from "@/hooks/useAuth";

export default function Navigation() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  return (
    <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Brand Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">HC</span>
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">HotelCast</span>
          </div>
          
          {/* Search Bar */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Search hotels, events, tasks..." 
                className="w-96 pl-10"
              />
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            </div>
          </div>
        </div>
        
        {/* Right Navigation */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
          </Button>
          
          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          
          {/* User Menu */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" className="flex items-center space-x-2">
              <img 
                src={user?.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"} 
                alt="User Avatar" 
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="hidden md:block text-sm font-medium">
                {user?.firstName} {user?.lastName}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
