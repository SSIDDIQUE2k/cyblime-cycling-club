import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import {
  ArrowLeft,
  MapPin,
  TrendingUp,
  Calendar,
  Mountain,
  Download,
  Share2,
  Heart,
  Star,
  MessageCircle,
  User as UserIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export default function RouteDetails() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const urlParams = new URLSearchParams(window.location.search);
  const routeId = urlParams.get('id');
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);

  const { data: route, isLoading } = useQuery({
    queryKey: ['route', routeId],
    queryFn: async () => {
      const routes = await base44.entities.Route.list();
      return routes.find(r => r.id === routeId);
    },
    enabled: !!routeId
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['routeComments', routeId],
    queryFn: () => base44.entities.RouteComment.filter({ route_id: routeId }, '-created_date'),
    enabled: !!routeId
  });

  const addCommentMutation = useMutation({
    mutationFn: (data) => base44.entities.RouteComment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routeComments', routeId] });
      setComment("");
      setRating(5);
      toast({ title: "Review posted!", description: "Thanks for sharing your experience." });
    },
    onError: (error) => {
      console.error("Failed to post review:", error);
      toast({ title: "Failed to post review", description: error?.message || "Please try again.", variant: "destructive" });
    }
  });

  const handleAddComment = (e) => {
    e.preventDefault();
    if (comment.trim() && route) {
      addCommentMutation.mutate({
        route_id: route.id,
        comment: comment,
        rating: rating,
        conditions_date: new Date().toISOString().split('T')[0]
      });
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: route.name,
      text: `Check out this cycling route: ${route.name}`,
      url: window.location.href
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleDownloadGPX = () => {
    if (route.gpx_file_url) {
      window.open(route.gpx_file_url, '_blank');
    }
  };

  const renderDescriptionWithImages = () => {
    if (!route.description) return null;

    const sections = route.description.split('\n\n').filter(p => p.trim());
    const contentImages = route.content_images || [];
    
    const imageMap = {};
    contentImages.forEach(img => {
      if (!imageMap[img.position]) {
        imageMap[img.position] = [];
      }
      imageMap[img.position].push(img);
    });

    const elements = [];
    
    sections.forEach((section, index) => {
      elements.push(
        <p key={`p-${index}`} className="text-[var(--cy-text-muted)] text-lg leading-relaxed mb-6">
          {section}
        </p>
      );
      
      if (imageMap[index]) {
        imageMap[index].forEach((img, imgIndex) => {
          elements.push(
            <figure key={`img-${index}-${imgIndex}`} className="my-8">
              <div className="relative rounded-2xl overflow-hidden shadow-xl shadow-black/20">
                <img
                  src={img.url}
                  alt={img.caption || ''}
                  className="w-full h-auto"
                />
              </div>
              {img.caption && (
                <figcaption className="text-sm text-[#888888] italic mt-3 text-center">
                  {img.caption}
                </figcaption>
              )}
            </figure>
          );
        });
      }
    });

    return elements;
  };

  const difficultyColors = {
    Easy: "bg-[#A4FF4F] text-[var(--cy-text)]",
    Moderate: "bg-yellow-400 text-[var(--cy-text)]",
    Challenging: "bg-orange-500 text-[var(--cy-text)]",
    Expert: "bg-red-600 text-[var(--cy-text)]"
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--cy-bg)] flex items-center justify-center">
        <div className="text-[var(--cy-text-muted)]">Loading route...</div>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="min-h-screen bg-[var(--cy-bg)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[var(--cy-text)] mb-4">Route not found</h2>
          <Link to={createPageUrl("Routes")}>
            <Button className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white">
              Back to Routes
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* Top Navigation */}
      <div className="bg-[var(--cy-bg-card)] border-b border-[var(--cy-border-strong)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to={createPageUrl("Routes")}>
            <Button variant="ghost" className="text-[var(--cy-text-muted)] hover:bg-gray-100">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Routes
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Media */}
      <div className="bg-black">
        <div className="max-w-7xl mx-auto">
          {route.video_url ? (
            <div className="relative" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={route.video_url}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={route.name}
              />
            </div>
          ) : route.map_image_url ? (
            <div className="relative h-[400px] md:h-[600px]">
              <img
                src={route.map_image_url}
                alt={route.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* Route Content */}
      <article className="bg-[var(--cy-bg-card)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Badge className={`${difficultyColors[route.difficulty]} border-0 font-bold mb-4 text-sm px-4 py-1.5`}>
              {route.difficulty}
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--cy-text)] leading-tight mb-4">
              {route.name}
            </h1>
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 fill-[#ff6b35] text-[#ff6b35]" />
              <span className="text-lg font-semibold text-[var(--cy-text)]">{route.rating || "5.0"}</span>
              <span className="text-[#888888]">•</span>
              <span className="text-[#888888]">{route.total_rides || 0} rides</span>
              <span className="text-[#888888]">•</span>
              <span className="text-[#888888]">by {route.created_by?.split('@')[0] || 'Anonymous'}</span>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-gradient-to-br from-[#6BCBFF]/10 to-[#6BCBFF]/5 rounded-2xl p-6">
              <MapPin className="w-8 h-8 text-[#6BCBFF] mb-3" />
              <div className="text-3xl font-bold text-[var(--cy-text)] mb-1">{route.distance}km</div>
              <div className="text-sm text-[var(--cy-text-muted)]">Distance</div>
            </div>
            <div className="bg-gradient-to-br from-[#A4FF4F]/10 to-[#A4FF4F]/5 rounded-2xl p-6">
              <TrendingUp className="w-8 h-8 text-[#8FE640] mb-3" />
              <div className="text-3xl font-bold text-[var(--cy-text)] mb-1">{route.elevation_gain}m</div>
              <div className="text-sm text-[var(--cy-text-muted)]">Elevation Gain</div>
            </div>
            <div className="bg-gradient-to-br from-[#ff6b35]/10 to-[#ff6b35]/5 rounded-2xl p-6">
              <Calendar className="w-8 h-8 text-[#ff6b35] mb-3" />
              <div className="text-3xl font-bold text-[var(--cy-text)] mb-1">{route.estimated_time}h</div>
              <div className="text-sm text-[var(--cy-text-muted)]">Estimated Time</div>
            </div>
            <div className="bg-gradient-to-br from-purple-400/10 to-purple-400/5 rounded-2xl p-6">
              <Mountain className="w-8 h-8 text-purple-600 mb-3" />
              <div className="text-lg font-bold text-[var(--cy-text)] mb-1">{route.surface_type}</div>
              <div className="text-sm text-[var(--cy-text-muted)]">Surface Type</div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-3 mb-12 pb-8 border-b border-[var(--cy-border-strong)]"
          >
            {route.gpx_file_url && (
              <Button onClick={handleDownloadGPX} className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white rounded-full">
                <Download className="w-4 h-4 mr-2" />
                Download GPX
              </Button>
            )}
            <Button onClick={handleShare} variant="outline" className="rounded-full">
              <Share2 className="w-4 h-4 mr-2" />
              Share Route
            </Button>
            <Button variant="outline" className="rounded-full">
              <Heart className="w-4 h-4 mr-2" />
              Save Route
            </Button>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-4xl mb-12"
          >
            <h2 className="text-3xl font-bold text-[var(--cy-text)] mb-6">About This Route</h2>
            <div className="prose prose-lg max-w-none">
              {renderDescriptionWithImages()}
            </div>
          </motion.div>

          {/* Route Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid md:grid-cols-2 gap-6 mb-12 pb-12 border-b border-[var(--cy-border-strong)]"
          >
            <div>
              <h3 className="text-xl font-bold text-[var(--cy-text)] mb-4">Route Details</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-[var(--cy-text-muted)]">Start Location</span>
                  <span className="font-semibold text-[var(--cy-text)]">{route.start_location}</span>
                </div>
                {route.end_location && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-[var(--cy-text-muted)]">End Location</span>
                    <span className="font-semibold text-[var(--cy-text)]">{route.end_location}</span>
                  </div>
                )}
              </div>
            </div>
            
            {route.highlights && route.highlights.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-[var(--cy-text)] mb-4">Highlights</h3>
                <ul className="space-y-2">
                  {route.highlights.map((highlight, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#ff6b35] mt-1">✓</span>
                      <span className="text-[var(--cy-text-muted)]">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>

          {/* Comments Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-8">
              <MessageCircle className="w-6 h-6 text-[#ff6b35]" />
              <h3 className="text-2xl font-bold text-[var(--cy-text)]">
                Rider Reviews ({comments.length})
              </h3>
            </div>

            {/* Add Comment Form */}
            {user ? (
              <form onSubmit={handleAddComment} className="mb-8 p-6 bg-[var(--cy-bg-section)] rounded-2xl">
                <div className="mb-4">
                  <Label className="text-sm font-semibold mb-2 block">Your Rating</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${star <= rating ? 'fill-[#ff6b35] text-[#ff6b35]' : 'text-[var(--cy-text-secondary)]'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this route..."
                  rows={4}
                  className="mb-4 bg-[var(--cy-bg-card)]"
                  required
                />
                <Button 
                  type="submit" 
                  disabled={addCommentMutation.isPending}
                  className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
                >
                  {addCommentMutation.isPending ? 'Posting...' : 'Post Review'}
                </Button>
              </form>
            ) : (
              <div className="mb-8 p-6 bg-[var(--cy-bg-section)] rounded-2xl text-center">
                <p className="text-[var(--cy-text-muted)]">Please sign in to leave a review</p>
              </div>
            )}

            {/* Comments List */}
            {comments.length > 0 ? (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[var(--cy-bg-card)] rounded-2xl p-6 shadow-none border border-[var(--cy-border)]"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff6b35] to-[#e55a2b] flex items-center justify-center text-[var(--cy-text)] font-bold flex-shrink-0">
                        <UserIcon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-semibold text-[var(--cy-text)]">{comment.created_by}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < comment.rating ? 'fill-[#ff6b35] text-[#ff6b35]' : 'text-[var(--cy-text-secondary)]'}`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-[#888888]">
                                {new Date(comment.created_date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-[var(--cy-text-muted)] leading-relaxed">{comment.comment}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-[var(--cy-text-secondary)] mx-auto mb-4" />
                <p className="text-[#888888]">No reviews yet. Be the first to share your experience!</p>
              </div>
            )}
          </motion.div>
        </div>
      </article>
    </div>
  );
}