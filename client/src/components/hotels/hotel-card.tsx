import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2, BarChart3, Users, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import HotelForm from "./hotel-form";
import CommentThread from "@/components/comments/comment-thread";

interface HotelCardProps {
  hotel: any;
}

export default function HotelCard({ hotel }: HotelCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
      case 'inactive':
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400';
      case 'maintenance':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400';
      default:
        return 'bg-slate-100 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400';
    }
  };

  const handleEdit = () => {
    setIsEditOpen(true);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${hotel.name}?`)) {
      // Handle delete logic
      console.log("Delete hotel:", hotel.id);
    }
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-all duration-300 group">
        <div className="relative">
          <img 
            src={hotel.imageUrl || "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=250&fit=crop"} 
            alt={hotel.name}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <div className="absolute top-3 right-3">
            <Badge className={getStatusColor(hotel.status)}>
              {hotel.status}
            </Badge>
          </div>
          <div className="absolute top-3 left-3">
            <div className="flex items-center space-x-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2 py-1 rounded-full">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-medium">{hotel.starRating || 'N/A'}</span>
            </div>
          </div>
        </div>
        
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{hotel.name}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {hotel.city}, {hotel.state} {hotel.country && `• ${hotel.country}`}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsCommentsOpen(true)}>
                  <Users className="w-4 h-4 mr-2" />
                  Comments
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-red-600 dark:text-red-400">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {hotel.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
              {hotel.description}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500 dark:text-slate-400">Total Rooms</p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {hotel.totalRooms || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">Contact</p>
              <p className="font-semibold text-slate-900 dark:text-white truncate">
                {hotel.phone || hotel.email || 'N/A'}
              </p>
            </div>
          </div>

          {hotel.website && (
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <a 
                href={hotel.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Visit Website →
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Hotel</DialogTitle>
          </DialogHeader>
          <HotelForm 
            hotel={hotel}
            onSubmit={(data) => {
              console.log("Update hotel:", data);
              setIsEditOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Comments Dialog */}
      <Dialog open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Comments - {hotel.name}</DialogTitle>
          </DialogHeader>
          <CommentThread entityType="hotel" entityId={hotel.id} />
        </DialogContent>
      </Dialog>
    </>
  );
}
