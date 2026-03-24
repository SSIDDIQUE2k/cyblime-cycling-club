import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MessageSquare,
  Plus,
  Search,
  TrendingUp,
  Eye,
  MessageCircle,
  Pin,
  Filter,
  Send,
  Flag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const categoryColors = {
  general: "bg-gray-100 text-gray-800",
  routes: "bg-[#6BCBFF]/20 text-[#6BCBFF]",
  gear: "bg-purple-100 text-purple-800",
  training: "bg-[#A4FF4F]/20 text-[var(--cy-text)]",
  maintenance: "bg-orange-100 text-orange-800",
  events: "bg-[#ff6b35]/20 text-[#ff6b35]"
};

export default function Community() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [reportReason, setReportReason] = useState("spam");
  const [reportDescription, setReportDescription] = useState("");

  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "general"
  });

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['forumPosts'],
    queryFn: () => base44.entities.ForumPost.list('-created_date'),
    initialData: []
  });

  const { data: replies = [] } = useQuery({
    queryKey: ['forumReplies', selectedPost?.id],
    queryFn: () => base44.entities.ForumReply.filter({ post_id: selectedPost.id }, '-created_date'),
    enabled: !!selectedPost
  });

  const createPostMutation = useMutation({
    mutationFn: (data) => base44.entities.ForumPost.create({
      ...data,
      last_activity: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumPosts'] });
      setCreateDialogOpen(false);
      setNewPost({ title: "", content: "", category: "general" });
    }
  });

  const createReplyMutation = useMutation({
    mutationFn: (data) => base44.entities.ForumReply.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumReplies'] });
      base44.entities.ForumPost.update(selectedPost.id, {
        reply_count: (selectedPost.reply_count || 0) + 1,
        last_activity: new Date().toISOString()
      });
      setReplyContent("");
    }
  });

  const reportMutation = useMutation({
    mutationFn: (data) => base44.entities.Report.create(data),
    onSuccess: () => {
      setReportDialogOpen(false);
      setReportTarget(null);
      setReportReason("spam");
      setReportDescription("");
    }
  });

  const handleReport = (contentType, contentId) => {
    setReportTarget({ contentType, contentId });
    setReportDialogOpen(true);
  };

  const submitReport = () => {
    if (!reportTarget) return;
    reportMutation.mutate({
      content_type: reportTarget.contentType,
      content_id: reportTarget.contentId,
      reason: reportReason,
      description: reportDescription
    });
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || post.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreatePost = (e) => {
    e.preventDefault();
    createPostMutation.mutate(newPost);
  };

  const handleReply = (e) => {
    e.preventDefault();
    if (replyContent.trim()) {
      createReplyMutation.mutate({
        post_id: selectedPost.id,
        content: replyContent
      });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--cy-bg)]">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[var(--cy-gradient-from)] to-[var(--cy-gradient-to)] py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[#A4FF4F] blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-[var(--cy-text)] mb-6">
              Community Forum
            </h1>
            <p className="text-xl text-[var(--cy-text-muted)] mb-8">
              Connect with fellow cyclists, share tips, and grow together.
            </p>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white rounded-full px-8 py-6 text-lg font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Start Discussion
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-20 z-40 bg-[var(--cy-bg-card)] border-b border-[var(--cy-border-strong)] shadow-none">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--cy-text-muted)]" />
              <Input
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 rounded-xl"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[200px] h-11 rounded-xl">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="routes">Routes</SelectItem>
                <SelectItem value="gear">Gear</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="events">Events</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Posts List */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="space-y-4">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedPost(post)}
                className="bg-[var(--cy-bg-card)] rounded-2xl p-6 border border-[var(--cy-border)] hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#ff6b35] flex items-center justify-center text-white font-bold flex-shrink-0">
                    {(post.created_by || "?").charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {post.is_pinned && <Pin className="w-4 h-4 text-[#ff6b35]" />}
                        <h3 className="text-xl font-semibold text-[var(--cy-text)]">{post.title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${categoryColors[post.category]} border-0 flex-shrink-0`}>
                          {post.category}
                        </Badge>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReport('forum_post', post.id);
                          }}
                          className="text-[var(--cy-text-muted)] hover:text-red-600"
                        >
                          <Flag className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-[var(--cy-text-muted)] mb-3 line-clamp-2">{post.content}</p>
                    
                    <div className="flex items-center gap-6 text-sm text-[var(--cy-text-muted)]">
                      <span>by {(post.created_by || "Anonymous").split('@')[0]}</span>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.reply_count || 0} replies</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{post.view_count || 0} views</span>
                      </div>
                      <span>{new Date(post.created_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Create Post Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[var(--cy-text)]">Start New Discussion</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={newPost.title}
                onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                placeholder="What's on your mind?"
                required
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={newPost.category} onValueChange={(val) => setNewPost({...newPost, category: val})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="routes">Routes</SelectItem>
                  <SelectItem value="gear">Gear</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="events">Events</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Content</Label>
              <Textarea
                value={newPost.content}
                onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                placeholder="Share your thoughts..."
                rows={6}
                required
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white">
                Post
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Post Detail Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedPost && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <DialogTitle className="text-2xl font-bold text-[var(--cy-text)]">
                    {selectedPost.title}
                  </DialogTitle>
                  <Badge className={`${categoryColors[selectedPost.category]} border-0`}>
                    {selectedPost.category}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-3 text-sm text-[var(--cy-text-muted)]">
                    <span className="font-semibold text-[var(--cy-text)]">{(selectedPost.created_by || "Anonymous").split('@')[0]}</span>
                    <span>•</span>
                    <span>{new Date(selectedPost.created_date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-[var(--cy-text-muted)]">{selectedPost.content}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-[var(--cy-text)] mb-4">
                    Replies ({replies.length})
                  </h3>
                  <div className="space-y-3 mb-4">
                    {replies.map((reply) => (
                      <div key={reply.id} className="p-4 border border-[var(--cy-border-strong)] rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-semibold text-[var(--cy-text)]">{(reply.created_by || "Anonymous").split('@')[0]}</span>
                            <span className="text-[var(--cy-text-muted)]">•</span>
                            <span className="text-[var(--cy-text-muted)]">{new Date(reply.created_date).toLocaleDateString()}</span>
                          </div>
                          <button
                            onClick={() => handleReport('forum_reply', reply.id)}
                            className="text-[var(--cy-text-muted)] hover:text-red-600"
                          >
                            <Flag className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-[var(--cy-text-muted)]">{reply.content}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleReply} className="space-y-3">
                    <Textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write a reply..."
                      rows={3}
                    />
                    <Button type="submit" className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white">
                      <Send className="w-4 h-4 mr-2" />
                      Reply
                    </Button>
                  </form>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="max-w-md bg-[var(--cy-bg-elevated)] border-[var(--cy-border-strong)] text-[var(--cy-text)]">
          <DialogHeader>
            <DialogTitle>Report Content</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-[var(--cy-text-secondary)]">Reason</Label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger className="bg-[var(--cy-bg-elevated)] border-[var(--cy-border-strong)] text-[var(--cy-text)] mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="inappropriate">Inappropriate Content</SelectItem>
                  <SelectItem value="harassment">Harassment</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[var(--cy-text-secondary)]">Additional details (optional)</Label>
              <Textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Describe the issue..."
                className="bg-[var(--cy-bg-elevated)] border-[var(--cy-border-strong)] text-[var(--cy-text)] mt-1"
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setReportDialogOpen(false)} className="border-[var(--cy-border-strong)] text-[var(--cy-text-secondary)]">
                Cancel
              </Button>
              <Button onClick={submitReport} disabled={reportMutation.isPending} className="bg-red-600 hover:bg-red-700 text-[var(--cy-text)]">
                <Flag className="w-4 h-4 mr-2" />
                {reportMutation.isPending ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
            {reportMutation.isSuccess && (
              <p className="text-green-400 text-sm text-center">Report submitted. Thank you for keeping our community safe.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}