import React from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Eye, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";

export default function AuthorPosts() {
  const urlParams = new URLSearchParams(window.location.search);
  const authorEmail = urlParams.get('author');

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['authorPosts', authorEmail],
    queryFn: async () => {
      if (!authorEmail) return [];
      return await base44.entities.BlogPost.filter({ 
        created_by: authorEmail, 
        published: true 
      }, '-created_date');
    },
    enabled: !!authorEmail
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--cy-bg)] flex items-center justify-center">
        <div className="text-[var(--cy-text-muted)]">Loading author posts...</div>
      </div>
    );
  }

  if (!authorEmail || posts.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--cy-bg)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[var(--cy-text)] mb-4">No posts found</h2>
          <Link to={createPageUrl("Blog")}>
            <Button className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const authorName = authorEmail.split('@')[0];
  const totalViews = posts.reduce((sum, post) => sum + (post.view_count || 0), 0);

  return (
    <div className="min-h-screen bg-[var(--cy-bg)]">
      {/* Top Navigation */}
      <div className="bg-[var(--cy-bg-card)] border-b border-[var(--cy-border-strong)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <Link to={createPageUrl("Blog")}>
            <Button variant="ghost" className="text-[var(--cy-text-muted)] hover:bg-gray-100">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>

      {/* Author Header */}
      <section className="bg-gradient-to-br from-[var(--cy-gradient-from)] to-[var(--cy-gradient-to)] py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ff6b35] to-[#e55a2b] flex items-center justify-center text-[var(--cy-text)] text-3xl font-bold mx-auto mb-6">
              {authorName.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--cy-text)] mb-4">
              {authorName}
            </h1>
            <p className="text-lg text-[var(--cy-text-muted)] mb-8">{authorEmail}</p>
            
            <div className="flex items-center justify-center gap-8 text-[var(--cy-text)]">
              <div>
                <div className="text-3xl font-bold text-[#A4FF4F]">{posts.length}</div>
                <div className="text-sm text-[var(--cy-text-muted)]">Articles</div>
              </div>
              <div className="w-px h-12 bg-[var(--cy-bg-card)]/20" />
              <div>
                <div className="text-3xl font-bold text-[#A4FF4F]">{totalViews.toLocaleString()}</div>
                <div className="text-sm text-[var(--cy-text-muted)]">Total Views</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Author's Posts */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[var(--cy-text)] mb-8">
            All Articles by {authorName}
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[var(--cy-bg-card)] rounded-2xl overflow-hidden border border-[var(--cy-border)] hover:shadow-lg hover:shadow-black/30 transition-all"
              >
                <div className="relative h-48 overflow-hidden bg-[var(--cy-bg-elevated)]">
                  {post.featured_image ? <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  /> : <div className="w-full h-full flex items-center justify-center text-[var(--cy-text-muted)] text-sm">No image</div>}
                </div>
                <div className="p-6">
                  <Badge className="bg-[#6BCBFF]/20 text-[#6BCBFF] border-0 mb-3">
                    {post.category}
                  </Badge>
                  <h3 className="text-xl font-bold text-[var(--cy-text)] mb-3">{post.title}</h3>
                  <p className="text-[var(--cy-text-muted)] mb-4 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-[var(--cy-text-muted)] mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(post.created_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span>{post.view_count || 0}</span>
                    </div>
                  </div>
                  <Link to={createPageUrl("BlogPost") + `?id=${post.id}`}>
                    <Button variant="ghost" className="w-full text-[#ff6b35] hover:text-[#e55a2b]">
                      Read Article
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}