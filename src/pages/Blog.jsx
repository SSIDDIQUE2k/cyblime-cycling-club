import React, { useState } from "react";
import { motion } from "framer-motion";
import { usePageContent } from "../hooks/usePageContent";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Calendar, User, Eye, ArrowRight, Search, TrendingUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";

const DEFAULT_BLOG_CONTENT = {
  hero: {
    heading: "Cyblime Blog",
    subheading: "Stories, tips, and insights from the cycling community."
  }
};

export default function Blog() {
  const { content: pageContent } = usePageContent("blog", DEFAULT_BLOG_CONTENT);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent"); // "recent" or "popular"
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 9;

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blogPosts'],
    queryFn: () => base44.entities.BlogPost.filter({ published: true }, '-created_date'),
    initialData: []
  });

  const categories = ["news", "tips", "stories", "gear", "training"];
  
  const toggleCategory = (cat) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSearchQuery("");
    setSortBy("recent");
  };

  // Filter and search posts
  let filteredPosts = posts;
  
  // Category filter
  if (selectedCategories.length > 0) {
    filteredPosts = filteredPosts.filter(p => selectedCategories.includes(p.category));
  }
  
  // Search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredPosts = filteredPosts.filter(p =>
      (p.title || "").toLowerCase().includes(query) ||
      (p.excerpt && p.excerpt.toLowerCase().includes(query)) ||
      (p.tags && p.tags.some(tag => (tag || "").toLowerCase().includes(query)))
    );
  }
  
  // Sort posts
  if (sortBy === "popular") {
    filteredPosts = [...filteredPosts].sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
  }

  // Get featured posts (top 3 by views)
  const featuredPosts = [...posts]
    .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
    .slice(0, 3);

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-[var(--cy-bg)]">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[var(--cy-gradient-from)] to-[var(--cy-gradient-to)] py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#A4FF4F] blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-[var(--cy-text)] mb-6">
              {pageContent.hero.heading}
            </h1>
            <p className="text-xl text-[var(--cy-text-muted)]">
              {pageContent.hero.subheading}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-[var(--cy-bg-card)] border-b border-[var(--cy-border-strong)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--cy-text-muted)]" />
            <Input
              type="text"
              placeholder="Search posts by title, excerpt, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-full border-[var(--cy-border-strong)]"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Sort Buttons */}
            <div className="flex gap-2 mr-4">
              <button
                onClick={() => setSortBy("recent")}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                  sortBy === "recent"
                    ? 'bg-[#ff6b35] text-white'
                    : 'bg-gray-100 text-[var(--cy-text-muted)] hover:bg-gray-200'
                }`}
              >
                Recent
              </button>
              <button
                onClick={() => setSortBy("popular")}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all flex items-center gap-1 ${
                  sortBy === "popular"
                    ? 'bg-[#ff6b35] text-white'
                    : 'bg-gray-100 text-[var(--cy-text-muted)] hover:bg-gray-200'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Popular
              </button>
            </div>

            {/* Category Filter Chips */}
            <div className="flex-1 flex flex-wrap items-center gap-2">
              <span className="text-sm text-[var(--cy-text-muted)] font-medium">Categories:</span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                    selectedCategories.includes(cat)
                      ? 'bg-[#ff6b35] text-white'
                      : 'bg-gray-100 text-[var(--cy-text-muted)] hover:bg-gray-200'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>

            {/* Clear Filters */}
            {(selectedCategories.length > 0 || searchQuery || sortBy === "popular") && (
              <Button
                onClick={clearFilters}
                variant="ghost"
                size="sm"
                className="text-[var(--cy-text-muted)] hover:text-[var(--cy-text)]"
              >
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          {/* Active Filters Summary */}
          {(selectedCategories.length > 0 || searchQuery) && (
            <div className="text-sm text-[var(--cy-text-muted)]">
              Showing {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''}
              {selectedCategories.length > 0 && ` in ${selectedCategories.join(', ')}`}
              {searchQuery && ` matching "${searchQuery}"`}
            </div>
          )}
        </div>
      </section>

      {/* Featured Posts Carousel */}
      {featuredPosts.length > 0 && (
        <section className="py-16 bg-[var(--cy-bg-card)]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-[var(--cy-text)]">Featured Articles</h2>
              <Badge className="bg-[#ff6b35] text-white border-0">
                <TrendingUp className="w-3 h-3 mr-1" />
                Trending
              </Badge>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {featuredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={post.featured_image || "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=600&q=80"}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-[#ff6b35] text-white px-3 py-1 rounded-full text-xs font-bold">
                      #{index + 1} Trending
                    </div>
                  </div>
                  <div className="p-6">
                    <Badge className="bg-[#6BCBFF]/20 text-[#6BCBFF] border-0 mb-3">
                      {post.category}
                    </Badge>
                    <h3 className="text-xl font-bold text-[var(--cy-text)] mb-3 line-clamp-2">{post.title}</h3>
                    <p className="text-[var(--cy-text-muted)] mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-[var(--cy-text-muted)] mb-4">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        <span className="font-semibold">{post.view_count || 0} views</span>
                      </div>
                      <Link 
                        to={createPageUrl("AuthorPosts") + `?author=${encodeURIComponent(post.created_by)}`}
                        className="flex items-center gap-1 hover:text-[#ff6b35] transition-colors"
                      >
                        <User className="w-3 h-3" />
                        <span>{(post.created_by || "Anonymous").split('@')[0]}</span>
                      </Link>
                    </div>
                    <Link to={createPageUrl("BlogPost") + `?id=${post.id}`}>
                      <Button className="w-full bg-[#ff6b35] hover:bg-[#e55a2b] text-white">
                        Read Article
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Blog Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[var(--cy-text)] mb-8">All Articles</h2>
          
          {paginatedPosts.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {paginatedPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-[var(--cy-bg-card)] rounded-2xl overflow-hidden border border-[var(--cy-border)] hover:shadow-lg hover:shadow-black/30 transition-all"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.featured_image || "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=600&q=80"}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
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
                  <Link 
                    to={createPageUrl("AuthorPosts") + `?author=${encodeURIComponent(post.created_by)}`}
                    className="flex items-center gap-2 text-xs text-[var(--cy-text-muted)] hover:text-[#ff6b35] transition-colors mb-4"
                  >
                    <User className="w-3 h-3" />
                    <span>By {(post.created_by || "Anonymous").split('@')[0]}</span>
                  </Link>
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    className="px-4"
                  >
                    Previous
                  </Button>
                  
                  <div className="flex gap-2">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-full font-medium transition-all ${
                          currentPage === i + 1
                            ? 'bg-[#ff6b35] text-white'
                            : 'bg-gray-100 text-[var(--cy-text-muted)] hover:bg-gray-200'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    className="px-4"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-[var(--cy-text-muted)] text-lg">No posts found matching your criteria.</p>
              <Button onClick={clearFilters} className="mt-4 bg-[#ff6b35] hover:bg-[#e55a2b] text-white">
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}