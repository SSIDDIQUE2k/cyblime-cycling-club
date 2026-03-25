import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, User, Eye, Tag, ArrowLeft, MessageCircle, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Link, useSearchParams } from "react-router-dom";
import { createPageUrl } from "../utils";

export default function BlogPost() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const postId = searchParams.get('id');
  const [commentText, setCommentText] = useState("");
  const { user } = useAuth();

  const { data: post, isLoading } = useQuery({
    queryKey: ['blogPost', postId],
    queryFn: () => base44.entities.BlogPost.get(postId),
    enabled: !!postId
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['blogComments', postId],
    queryFn: () => base44.entities.BlogComment.filter({ post_id: postId }, '-created_date'),
    enabled: !!postId
  });

  const incrementViewMutation = useMutation({
    mutationFn: () => base44.entities.BlogPost.update(post.id, {
      view_count: (post.view_count || 0) + 1
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogPost', postId] });
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
    },
    onError: (err) => console.error("Failed to increment view:", err)
  });

  const createCommentMutation = useMutation({
    mutationFn: (commentData) => base44.entities.BlogComment.create(commentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogComments', postId] });
      setCommentText("");
    },
    onError: (err) => alert("Failed to post comment: " + (err?.message || "Please try again."))
  });

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    createCommentMutation.mutate({
      post_id: postId,
      comment_text: commentText,
      user_name: user?.full_name || user?.email?.split('@')[0] || 'Anonymous',
      user_email: user?.email || ''
    });
  };

  useEffect(() => {
    if (post?.id) {
      const viewedKey = `blog_viewed_${post.id}`;
      if (!sessionStorage.getItem(viewedKey)) {
        sessionStorage.setItem(viewedKey, 'true');
        incrementViewMutation.mutate();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.id]);

  // Render blog content — supports both HTML (from Quill/TinyMCE) and plain text
  const renderContent = () => {
    if (!post?.content) return null;

    const content = post.content;

    // Check if content is HTML (contains tags)
    const isHtml = /<[a-z][\s\S]*>/i.test(content);

    if (isHtml) {
      // Render as HTML — content from Quill/TinyMCE rich text editor
      return (
        <div
          className="prose prose-lg max-w-none text-[var(--cy-text)]
            prose-headings:text-[var(--cy-text)] prose-p:text-[var(--cy-text)]
            prose-strong:text-[var(--cy-text)] prose-a:text-[#ff6b35]
            prose-img:rounded-xl prose-img:shadow-lg prose-img:max-w-full"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }

    // Fallback: plain text — split by double newlines
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    return paragraphs.map((paragraph, index) => (
      <p key={`p-${index}`} className="text-[var(--cy-text)] text-lg leading-relaxed mb-6">
        {paragraph}
      </p>
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--cy-bg)] flex items-center justify-center">
        <div className="text-[var(--cy-text-muted)]">Loading article...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[var(--cy-bg)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[var(--cy-text)] mb-4">Article not found</h2>
          <Link to={createPageUrl("Blog")}>
            <Button className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white">
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* Top Navigation Bar */}
      <div className="bg-[var(--cy-bg-card)] border-b border-[var(--cy-border-strong)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to={createPageUrl("Blog")}>
            <Button variant="ghost" className="text-[var(--cy-text-muted)] hover:bg-gray-100">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Media Area */}
      <div className="bg-black">
        <div className="max-w-7xl mx-auto">
          {post.video_url ? (
            // Video Player
            <div className="relative" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={post.video_url}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={post.title}
              />
            </div>
          ) : post.featured_image ? (
            // Featured Image
            <div className="relative h-[400px] md:h-[600px]">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* Article Content */}
      <article className="bg-[var(--cy-bg-card)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Category Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-4"
          >
            <Badge className="bg-[#ff6b35] text-white border-0 uppercase tracking-wide text-xs font-bold px-3 py-1">
              {post.category}
            </Badge>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--cy-text)] leading-tight mb-6"
          >
            {post.title}
          </motion.h1>

          {/* Excerpt */}
          {post.excerpt && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-xl md:text-2xl text-[var(--cy-text-muted)] leading-relaxed mb-8 font-light"
            >
              {post.excerpt}
            </motion.p>
          )}

          {/* Meta Information */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex items-center gap-4 text-sm text-[#888888] pb-8 mb-8 border-b border-[var(--cy-border-strong)]"
          >
            <Link 
              to={createPageUrl("AuthorPosts") + `?author=${encodeURIComponent(post.created_by)}`}
              className="flex items-center gap-2 hover:text-[#ff6b35] transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="font-medium">{post.created_by?.split('@')[0] || 'Author'}</span>
            </Link>
            <span className="text-[var(--cy-text-secondary)]">|</span>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(post.created_date).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}</span>
            </div>
            <span className="text-[var(--cy-text-secondary)]">|</span>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>{post.view_count || 0} views</span>
            </div>
          </motion.div>

          {/* Article Body */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="article-content"
          >
            <div className="max-w-3xl">
              {renderContent()}
            </div>
          </motion.div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="mt-12 pt-8 border-t border-[var(--cy-border-strong)]"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="w-4 h-4 text-[var(--cy-text-muted)]" />
                <span className="text-sm font-semibold text-[var(--cy-text-muted)] mr-2">Tags:</span>
                {post.tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-xs font-medium px-3 py-1 rounded-full"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </article>

      {/* Comments Section */}
      <section className="py-16 bg-[#f8f8f8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[var(--cy-bg-card)] rounded-2xl p-8 border border-[var(--cy-border)]">
            <div className="flex items-center gap-2 mb-8">
              <MessageCircle className="w-6 h-6 text-[#ff6b35]" />
              <h3 className="text-2xl font-bold text-[var(--cy-text)]">
                Comments ({comments.length})
              </h3>
            </div>

            {/* Comment Form */}
            {user ? (
              <form onSubmit={handleSubmitComment} className="mb-8 pb-8 border-b border-[var(--cy-border-strong)]">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff6b35] to-[#e55a2b] flex items-center justify-center text-[var(--cy-text)] font-bold flex-shrink-0">
                    {(user.full_name || user.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <Textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Share your thoughts..."
                      rows={3}
                      className="mb-3 resize-none"
                      required
                    />
                    <Button 
                      type="submit" 
                      disabled={!commentText.trim() || createCommentMutation.isPending}
                      className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {createCommentMutation.isPending ? 'Posting...' : 'Post Comment'}
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="mb-8 pb-8 border-b border-[var(--cy-border-strong)] text-center">
                <p className="text-[var(--cy-text-muted)] mb-4">Please sign in to leave a comment</p>
              </div>
            )}

            {/* Comments List */}
            {comments.length > 0 ? (
              <div className="space-y-6">
                {comments.map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-[var(--cy-text)] font-bold flex-shrink-0">
                      {comment.user_name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[var(--cy-text)]">
                          {comment.user_name || 'Anonymous'}
                        </span>
                        <span className="text-sm text-[#888888]">
                          {new Date(comment.created_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-[var(--cy-text-muted)] leading-relaxed">{comment.comment_text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-[var(--cy-text-secondary)] mx-auto mb-3" />
                <p className="text-[#888888]">No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Back to Blog CTA */}
      <section className="py-12 bg-[#f8f8f8] border-t border-[var(--cy-border-strong)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold text-[var(--cy-text)] mb-6">
            Explore More Stories
          </h3>
          <Link to={createPageUrl("Blog")}>
            <Button className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white rounded-full px-8 py-3 text-base font-semibold">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </section>

      <style>{`
        .article-content {
          font-family: Georgia, 'Times New Roman', serif;
        }
        .article-content p {
          line-height: 1.8;
        }
      `}</style>
    </div>
  );
}