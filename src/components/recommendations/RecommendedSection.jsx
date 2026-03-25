import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { Sparkles, TrendingUp, Calendar, MessageSquare, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function RecommendedSection({ recommendations, profile }) {
  if (!recommendations) return null;

  return (
    <section className="py-16 bg-gradient-to-br from-[#f5f5f3] to-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-[#ff6b35]" />
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--cy-text)]">
              Recommended for You
            </h2>
          </div>
          <p className="text-[var(--cy-text-muted)] text-lg">
            Personalized picks based on your {profile?.skill_level || "profile"} level and interests
          </p>
        </motion.div>

        {/* Routes */}
        {recommendations.routes?.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[var(--cy-text)] flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-[#6BCBFF]" />
                Routes You'll Love
              </h3>
              <Link to={createPageUrl("Routes")}>
                <Button variant="ghost" className="text-[#ff6b35]">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {recommendations.routes.slice(0, 3).map((route, index) => (
                <motion.div
                  key={route.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[var(--cy-bg-card)] rounded-2xl overflow-hidden border border-[var(--cy-border)] hover:shadow-lg hover:shadow-black/30 shadow-black/20 transition-all"
                >
                  <div className="relative h-40 bg-[var(--cy-bg-elevated)]">
                    {route.map_image_url ? <img
                      src={route.map_image_url}
                      alt={route.name}
                      className="w-full h-full object-cover"
                    /> : <div className="w-full h-full flex items-center justify-center text-[var(--cy-text-muted)] text-sm">No image</div>}
                    <Badge className="absolute top-3 left-3 bg-[#A4FF4F] text-[var(--cy-text)] border-0">
                      {route.difficulty}
                    </Badge>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-[var(--cy-text)] mb-2">{route.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-[var(--cy-text-muted)]">
                      <span>{route.distance}km</span>
                      <span>•</span>
                      <span>{route.elevation_gain}m</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Events */}
        {recommendations.events?.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[var(--cy-text)] flex items-center gap-2">
                <Calendar className="w-6 h-6 text-[#ff6b35]" />
                Events for You
              </h3>
              <Link to={createPageUrl("Events")}>
                <Button variant="ghost" className="text-[#ff6b35]">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {recommendations.events.slice(0, 2).map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[var(--cy-bg-card)] rounded-2xl p-6 border border-[var(--cy-border)] hover:shadow-lg hover:shadow-black/30 shadow-black/20 transition-all"
                >
                  <Badge className="bg-[#ff6b35]/20 text-[#ff6b35] border-0 mb-3">
                    {event.type}
                  </Badge>
                  <h4 className="font-bold text-[var(--cy-text)] text-lg mb-2">{event.title}</h4>
                  <p className="text-[var(--cy-text-muted)] text-sm mb-3">{event.description}</p>
                  <div className="flex items-center gap-4 text-sm text-[var(--cy-text-muted)]">
                    <span>{event.date}</span>
                    <span>•</span>
                    <span>{event.level}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Forum Posts */}
        {recommendations.posts?.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[var(--cy-text)] flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-[#A4FF4F]" />
                Trending Discussions
              </h3>
              <Link to={createPageUrl("Community")}>
                <Button variant="ghost" className="text-[#ff6b35]">
                  Join Conversation <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.posts.slice(0, 3).map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[var(--cy-bg-card)] rounded-xl p-4 shadow-none hover:shadow-md transition-all cursor-pointer"
                >
                  <Badge variant="outline" className="text-xs mb-2">{post.category}</Badge>
                  <h4 className="font-semibold text-[var(--cy-text)] mb-2 line-clamp-2">{post.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-[var(--cy-text-muted)]">
                    <span>{post.reply_count || 0} replies</span>
                    <span>•</span>
                    <span>{post.view_count || 0} views</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}