import React, { useState } from "react";
import { motion } from "framer-motion";
import { usePageContent } from "../hooks/usePageContent";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Calendar, User, ArrowRight, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";

const DEFAULT_BLOG_CONTENT = {
  hero: {
    heading: "Cyblime Blog",
    subheading: "Stories, tips, and insights from the cycling community."
  }
};

const DEFAULT_IMAGE = "";

// Strip HTML tags for excerpt display
function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").slice(0, 160);
}

export default function Blog() {
  const { content: pageContent } = usePageContent("blog", DEFAULT_BLOG_CONTENT);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ['blogPosts'],
    queryFn: async () => {
      const result = await base44.entities.BlogPost.filter({ published: true }, '-created_date');
      return result;
    },
    retry: 2,
  });

  const categories = ["news", "tips", "stories", "gear", "training", "events", "routes"];

  // Filter posts
  let filteredPosts = posts;
  if (selectedCategory) {
    filteredPosts = filteredPosts.filter(p => p.category === selectedCategory);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredPosts = filteredPosts.filter(p =>
      (p.title || "").toLowerCase().includes(q) ||
      (p.excerpt || "").toLowerCase().includes(q) ||
      (p.tags && p.tags.some(tag => (tag || "").toLowerCase().includes(q)))
    );
  }

  // Split: first post is hero, rest go in the grid
  const heroPost = filteredPosts[0] || null;
  const gridPosts = filteredPosts.slice(1);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    });
  };

  const getAuthor = (post) => {
    return (post.created_by || "Anonymous").split('@')[0];
  };

  const getExcerpt = (post) => {
    if (post.excerpt) return post.excerpt;
    return stripHtml(post.content);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 pt-16 pb-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
          >
            {pageContent.hero.heading}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-500 max-w-2xl mx-auto"
          >
            {pageContent.hero.subheading}
          </motion.p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-full border-gray-200 bg-gray-50 text-sm"
              />
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  !selectedCategory
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${
                    selectedCategory === cat
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {(selectedCategory || searchQuery) && (
              <button
                onClick={() => { setSelectedCategory(null); setSearchQuery(""); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Loading */}
      {isLoading && (
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="w-8 h-8 border-3 border-gray-200 border-t-gray-800 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading articles...</p>
        </div>
      )}

      {/* Query Error */}
      {error && (
        <div className="max-w-5xl mx-auto px-6 py-8 text-center">
          <p className="text-red-500 text-sm">Failed to load posts. Please refresh the page.</p>
        </div>
      )}

      {/* Hero Featured Post */}
      {heroPost && !isLoading && (
        <section className="max-w-5xl mx-auto px-6 lg:px-8 py-12">
          <Link to={createPageUrl("BlogPost") + `?id=${heroPost.id}`}>
            <motion.article
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="group grid md:grid-cols-2 gap-8 items-center cursor-pointer"
            >
              {/* Text side */}
              <div className="order-2 md:order-1">
                <h2
                  className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-[#ff6b35] transition-colors"
                  style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                >
                  {heroPost.title}
                </h2>
                <p className="text-gray-500 text-lg leading-relaxed mb-6 line-clamp-3">
                  {getExcerpt(heroPost)}
                </p>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <span>{formatDate(heroPost.created_date)}</span>
                  <span>•</span>
                  <span>{getAuthor(heroPost)}</span>
                </div>
              </div>

              {/* Image side */}
              <div className="order-1 md:order-2">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  {(heroPost.featured_image || DEFAULT_IMAGE) && <img
                    src={heroPost.featured_image || DEFAULT_IMAGE}
                    alt={heroPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />}
                </div>
              </div>
            </motion.article>
          </Link>
        </section>
      )}

      {/* Divider */}
      {heroPost && gridPosts.length > 0 && (
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <hr className="border-gray-100" />
        </div>
      )}

      {/* 3-Column Card Grid */}
      {gridPosts.length > 0 && !isLoading && (
        <section className="max-w-5xl mx-auto px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {gridPosts.map((post, index) => (
              <Link key={post.id} to={createPageUrl("BlogPost") + `?id=${post.id}`}>
                <motion.article
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="group cursor-pointer h-full"
                >
                  {/* Image with overlay text */}
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-gray-700 to-gray-900">
                    {(post.featured_image || DEFAULT_IMAGE) && <img
                      src={post.featured_image || DEFAULT_IMAGE}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />}
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    {/* Text on image */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3
                        className="text-white font-bold text-lg leading-snug mb-2 line-clamp-2"
                        style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                      >
                        {post.title}
                      </h3>
                      <p className="text-gray-300 text-sm line-clamp-2 mb-3">
                        {getExcerpt(post)}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{formatDate(post.created_date)}</span>
                        <span>•</span>
                        <span>{getAuthor(post)}</span>
                      </div>
                    </div>
                  </div>
                </motion.article>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {!isLoading && filteredPosts.length === 0 && (
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <p className="text-gray-400 text-lg mb-4">No articles found.</p>
          {(selectedCategory || searchQuery) && (
            <Button
              onClick={() => { setSelectedCategory(null); setSearchQuery(""); }}
              variant="outline"
              className="rounded-full"
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Bottom CTA */}
      {posts.length > 0 && (
        <section className="bg-gray-50 border-t border-gray-100">
          <div className="max-w-5xl mx-auto px-6 lg:px-8 py-16 text-center">
            <p className="text-gray-400 text-sm uppercase tracking-widest mb-2">Cyblime Cycling Club</p>
            <p className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
              Ride together. Read together.
            </p>
            <p className="text-gray-500">
              Follow our journey on the road and off it.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
