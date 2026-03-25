import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "../components/admin/AdminLayout";
import { Trash2, MessageCircle, Pin, PinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function AdminForumManagement() {
  const queryClient = useQueryClient();

  const { data: posts = [] } = useQuery({
    queryKey: ['adminForumPosts'],
    queryFn: () => base44.entities.ForumPost.list('-created_date')
  });

  const { data: replies = [] } = useQuery({
    queryKey: ['adminForumReplies'],
    queryFn: () => base44.entities.ForumReply.list('-created_date')
  });

  const togglePinMutation = useMutation({
    mutationFn: ({ id, isPinned }) => base44.entities.ForumPost.update(id, { is_pinned: !isPinned }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminForumPosts'] });
    },
    onError: (err) => alert("Failed to update post: " + err.message)
  });

  const deletePostMutation = useMutation({
    mutationFn: (id) => base44.entities.ForumPost.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminForumPosts'] });
    },
    onError: (err) => alert("Failed to delete post: " + err.message)
  });

  const deleteReplyMutation = useMutation({
    mutationFn: (id) => base44.entities.ForumReply.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminForumReplies'] });
    },
    onError: (err) => alert("Failed to delete reply: " + err.message)
  });

  const handleDeletePost = (id) => {
    if (window.confirm("Delete this forum post?")) deletePostMutation.mutate(id);
  };

  const handleDeleteReply = (id) => {
    if (window.confirm("Delete this reply?")) deleteReplyMutation.mutate(id);
  };

  const categoryColors = {
    general: "bg-gray-500",
    routes: "bg-blue-500",
    gear: "bg-purple-500",
    training: "bg-green-500",
    maintenance: "bg-orange-500",
    events: "bg-pink-500"
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Forum Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Moderate forum posts and replies</p>
        </div>

        <Card className="admin-card dark:bg-gray-800/50 dark:border-white/5">
          <CardHeader>
            <CardTitle className="dark:text-white">Forum Posts ({posts.length})</CardTitle>
          </CardHeader>
        </Card>

        <div className="grid gap-4">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="admin-card dark:bg-gray-800/50 dark:border-white/5 hover:shadow-lg transition-all">
                <CardContent className="px-3 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{post.title}</h3>
                        {post.is_pinned && (
                          <Badge className="bg-yellow-500 text-white border-0">
                            <Pin className="w-3 h-3 mr-1" />
                            Pinned
                          </Badge>
                        )}
                        <Badge className={`${categoryColors[post.category]} text-white border-0`}>
                          {post.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{post.content}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {post.reply_count || 0} replies
                        </span>
                        <span>•</span>
                        <span>{post.view_count || 0} views</span>
                        <span>•</span>
                        <span>by {post.created_by}</span>
                        <span>•</span>
                        <span>{new Date(post.created_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => togglePinMutation.mutate({ id: post.id, isPinned: post.is_pinned })}
                        className="dark:bg-white/5 dark:border-white/10"
                      >
                        {post.is_pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeletePost(post.id)}
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="admin-card dark:bg-gray-800/50 dark:border-white/5 mt-12">
          <CardHeader>
            <CardTitle className="dark:text-white">Recent Replies ({replies.length})</CardTitle>
          </CardHeader>
        </Card>

        <div className="grid gap-4">
          {replies.map((reply, index) => (
            <motion.div
              key={reply.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="admin-card dark:bg-gray-800/50 dark:border-white/5 hover:shadow-lg transition-all">
                <CardContent className="px-3 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{reply.content}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                        <span>❤️ {reply.likes || 0} likes</span>
                        <span>•</span>
                        <span>by {reply.created_by}</span>
                        <span>•</span>
                        <span>{new Date(reply.created_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteReply(reply.id)}
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}