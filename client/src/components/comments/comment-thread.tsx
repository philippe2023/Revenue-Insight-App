import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCommentSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Reply, Edit, Trash2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { commentApi } from "@/lib/api";
import { isUnauthorizedError } from "@/lib/authUtils";
import { cn } from "@/lib/utils";

interface CommentThreadProps {
  entityType: string;
  entityId: string;
}

interface CommentItemProps {
  comment: any;
  onReply: (parentId: string) => void;
  onEdit: (comment: any) => void;
  onResolve: (commentId: string) => void;
  currentUserId?: string;
  level?: number;
}

function CommentItem({ comment, onReply, onEdit, onResolve, currentUserId, level = 0 }: CommentItemProps) {
  const maxLevel = 3; // Maximum nesting level
  const canReply = level < maxLevel;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isOwner = currentUserId === comment.authorId;

  return (
    <div className={cn("space-y-3", level > 0 && "ml-6 pl-4 border-l-2 border-slate-200 dark:border-slate-700")}>
      <div className="flex items-start space-x-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={comment.author?.profileImageUrl} />
          <AvatarFallback className="text-xs">
            {getInitials(comment.author?.firstName || comment.author?.email || 'U')}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              {comment.author?.firstName} {comment.author?.lastName}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {formatDate(comment.createdAt)}
            </span>
            {comment.isResolved && (
              <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                <CheckCircle className="w-3 h-3 mr-1" />
                Resolved
              </Badge>
            )}
          </div>

          <div className="text-sm text-slate-700 dark:text-slate-300 mb-2 whitespace-pre-wrap">
            {comment.content}
          </div>

          <div className="flex items-center space-x-2">
            {canReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReply(comment.id)}
                className="h-7 px-2 text-xs"
              >
                <Reply className="w-3 h-3 mr-1" />
                Reply
              </Button>
            )}

            {!comment.isResolved && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onResolve(comment.id)}
                className="h-7 px-2 text-xs"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Resolve
              </Button>
            )}

            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <MoreVertical className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(comment)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600 dark:text-red-400">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies?.map((reply: any) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          onReply={onReply}
          onEdit={onEdit}
          onResolve={onResolve}
          currentUserId={currentUserId}
          level={level + 1}
        />
      ))}
    </div>
  );
}

export default function CommentThread({ entityType, entityId }: CommentThreadProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: comments, isLoading } = useQuery({
    queryKey: ["/api/comments", entityType, entityId],
    queryFn: () => commentApi.getAll(entityType, entityId),
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: commentApi.create,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
      form.reset();
      setReplyingTo(null);
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
        description: "Failed to add comment",
        variant: "destructive",
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(insertCommentSchema),
    defaultValues: {
      content: "",
      entityType,
      entityId,
      parentId: "",
    },
  });

  const onSubmit = (data: any) => {
    const submitData = {
      ...data,
      parentId: replyingTo || undefined,
    };
    createMutation.mutate(submitData);
  };

  const handleReply = (parentId: string) => {
    setReplyingTo(parentId);
    setEditingComment(null);
  };

  const handleEdit = (comment: any) => {
    setEditingComment(comment);
    setReplyingTo(null);
    form.setValue('content', comment.content);
  };

  const handleResolve = (commentId: string) => {
    // Handle resolve logic - would need API endpoint
    console.log("Resolve comment:", commentId);
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setEditingComment(null);
    form.reset();
  };

  // Organize comments into threads
  const organizeComments = (comments: any[]) => {
    const commentMap = new Map();
    const rootComments: any[] = [];

    // First pass: create a map of all comments
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: organize into threads
    comments.forEach(comment => {
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies.push(commentMap.get(comment.id));
        }
      } else {
        rootComments.push(commentMap.get(comment.id));
      }
    });

    return rootComments;
  };

  const threadedComments = comments ? organizeComments(comments) : [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
              <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {replyingTo && (
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Replying to comment...
            </div>
          )}
          {editingComment && (
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Editing comment...
            </div>
          )}

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between">
            <div>
              {(replyingTo || editingComment) && (
                <Button type="button" variant="outline" size="sm" onClick={cancelReply}>
                  Cancel
                </Button>
              )}
            </div>
            <Button type="submit" size="sm" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Posting..." : editingComment ? "Update" : "Comment"}
            </Button>
          </div>
        </form>
      </Form>

      {/* Comments List */}
      <div className="space-y-6">
        {threadedComments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400">No comments yet.</p>
            <p className="text-sm text-slate-400 dark:text-slate-500">Be the first to start a discussion!</p>
          </div>
        ) : (
          threadedComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onEdit={handleEdit}
              onResolve={handleResolve}
              currentUserId={user?.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
