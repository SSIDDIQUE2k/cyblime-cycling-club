import React, { useState } from "react";
import { motion } from "framer-motion";
import { usePageContent } from "../hooks/usePageContent";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import LeaderboardCard from "../components/gamification/LeaderboardCard";

import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { 
  Search, 
  Filter,
  TrendingUp,
  MapPin,
  Calendar,
  Mountain,
  Upload,
  Heart,
  Share2,
  Download,
  MessageCircle,
  Star,
  ChevronRight,
  Plus,
  X,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const RouteCard = ({ route, index }) => {
  const difficultyColors = {
    Easy: "bg-[#A4FF4F] text-[var(--cy-text)]",
    Moderate: "bg-yellow-400 text-[var(--cy-text)]",
    Challenging: "bg-orange-500 text-[var(--cy-text)]",
    Expert: "bg-red-600 text-[var(--cy-text)]"
  };

  const surfaceIcons = {
    Paved: "🚴",
    Gravel: "🏔️",
    Mixed: "🌄",
    "Mountain Trail": "⛰️"
  };

  return (
    <Link to={createPageUrl("RouteDetails") + `?id=${route.id}`} className="block">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="bg-[var(--cy-bg-card)] rounded-2xl overflow-hidden border border-[var(--cy-border)] hover:shadow-lg hover:shadow-black/30 transition-all duration-300 group cursor-pointer"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={route.map_image_url || "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=600&q=80"}
          alt={route.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <Badge className={`absolute top-4 left-4 ${difficultyColors[route.difficulty]} border-0 font-semibold`}>
          {route.difficulty}
        </Badge>
        <div className="absolute top-4 right-4 flex gap-2" onClick={(e) => e.preventDefault()}>
          <button className="w-8 h-8 rounded-full bg-[var(--cy-bg-card)]/90 backdrop-blur-sm flex items-center justify-center hover:bg-[var(--cy-bg-card)] transition-colors">
            <Heart className="w-4 h-4 text-[var(--cy-text-muted)]" />
          </button>
          <button className="w-8 h-8 rounded-full bg-[var(--cy-bg-card)]/90 backdrop-blur-sm flex items-center justify-center hover:bg-[var(--cy-bg-card)] transition-colors">
            <Share2 className="w-4 h-4 text-[var(--cy-text-muted)]" />
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-[var(--cy-text)] flex-1">{route.name}</h3>
          <div className="flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 fill-[#ff6b35] text-[#ff6b35]" />
            <span className="font-semibold">{route.rating || "5.0"}</span>
          </div>
        </div>
        
        <p className="text-sm text-[var(--cy-text-muted)] mb-4 line-clamp-2">{route.description}</p>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-[#6BCBFF]" />
            <span className="text-[var(--cy-text-muted)]">{route.distance}km</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-[#6BCBFF]" />
            <span className="text-[var(--cy-text-muted)]">{route.elevation_gain}m</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mountain className="w-4 h-4 text-[#6BCBFF]" />
            <span className="text-[var(--cy-text-muted)]">{route.surface_type}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-[#6BCBFF]" />
            <span className="text-[var(--cy-text-muted)]">{route.estimated_time}h</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-[var(--cy-border)]">
          <div className="flex items-center gap-2 text-sm text-[var(--cy-text-muted)]">
            <span>{route.total_rides || 0} rides</span>
            <span>•</span>
            <span>by {route.created_by}</span>
          </div>
          <span className="text-[#ff6b35] font-medium flex items-center">
            View Route
            <ChevronRight className="w-4 h-4 ml-1" />
          </span>
        </div>
      </div>
    </motion.div>
    </Link>
  );
};

const UploadRouteDialog = ({ open, onOpenChange }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    distance: "",
    elevation_gain: "",
    difficulty: "Moderate",
    surface_type: "Paved",
    start_location: "",
    end_location: "",
    estimated_time: "",
    highlights: [],
    is_public: true
  });

  const createRouteMutation = useMutation({
    mutationFn: (data) => base44.entities.Route.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      onOpenChange(false);
      setFormData({
        name: "",
        description: "",
        distance: "",
        elevation_gain: "",
        difficulty: "Moderate",
        surface_type: "Paved",
        start_location: "",
        end_location: "",
        estimated_time: "",
        highlights: [],
        is_public: true
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createRouteMutation.mutate({
      ...formData,
      distance: parseFloat(formData.distance),
      elevation_gain: parseFloat(formData.elevation_gain),
      estimated_time: parseFloat(formData.estimated_time),
      rating: 5.0,
      total_rides: 0
    });
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[var(--cy-text)]">Upload New Route</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Route Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Sunset Mountain Loop"
                required
              />
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe the route, scenery, and key points..."
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="distance">Distance (km) *</Label>
              <Input
                id="distance"
                type="number"
                step="0.1"
                value={formData.distance}
                onChange={(e) => setFormData({...formData, distance: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="elevation">Elevation Gain (m) *</Label>
              <Input
                id="elevation"
                type="number"
                value={formData.elevation_gain}
                onChange={(e) => setFormData({...formData, elevation_gain: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="difficulty">Difficulty *</Label>
              <Select value={formData.difficulty} onValueChange={(value) => setFormData({...formData, difficulty: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="Challenging">Challenging</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="surface">Surface Type *</Label>
              <Select value={formData.surface_type} onValueChange={(value) => setFormData({...formData, surface_type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paved">Paved</SelectItem>
                  <SelectItem value="Gravel">Gravel</SelectItem>
                  <SelectItem value="Mixed">Mixed</SelectItem>
                  <SelectItem value="Mountain Trail">Mountain Trail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="start">Start Location *</Label>
              <Input
                id="start"
                value={formData.start_location}
                onChange={(e) => setFormData({...formData, start_location: e.target.value})}
                placeholder="Starting point"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="end">End Location</Label>
              <Input
                id="end"
                value={formData.end_location}
                onChange={(e) => setFormData({...formData, end_location: e.target.value})}
                placeholder="Ending point (or same as start)"
              />
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="time">Estimated Time (hours)</Label>
              <Input
                id="time"
                type="number"
                step="0.5"
                value={formData.estimated_time}
                onChange={(e) => setFormData({...formData, estimated_time: e.target.value})}
                placeholder="e.g., 2.5"
              />
            </div>
          </div>
          
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white">
              Upload Route
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};



const DEFAULT_ROUTES_CONTENT = {
  hero: {
    heading: "Discover Routes",
    subheading: "Explore, share, and ride the best cycling routes curated by the Cyblime community."
  }
};

export default function Routes() {
  const { content: pageContent } = usePageContent("routes", DEFAULT_ROUTES_CONTENT);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [filterSurface, setFilterSurface] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.log("Not authenticated");
      }
    };
    fetchUser();
  }, []);

  const { data: routes = [], isLoading, refetch: refetchRoutes } = useQuery({
    queryKey: ['routes'],
    queryFn: () => base44.entities.Route.list('-created_date'),
    initialData: []
  });

  const filteredRoutes = routes
    .filter(route => {
      const matchesSearch = route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           route.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDifficulty = filterDifficulty === "all" || route.difficulty === filterDifficulty;
      const matchesSurface = filterSurface === "all" || route.surface_type === filterSurface;
      
      return matchesSearch && matchesDifficulty && matchesSurface;
    })
    .sort((a, b) => {
      if (sortBy === "popular") return (b.total_rides || 0) - (a.total_rides || 0);
      if (sortBy === "distance") return b.distance - a.distance;
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      return 0; // recent is default from API
    });

  return (
    <div className="min-h-screen bg-[var(--cy-bg)]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[var(--cy-gradient-from)] to-[var(--cy-gradient-to)] py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[#A4FF4F] blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-[var(--cy-text)] tracking-tight mb-6">
              {pageContent.hero.heading}
            </h1>
            <p className="text-xl text-[var(--cy-text-muted)] mb-8">
              {pageContent.hero.subheading}
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                onClick={() => setUploadDialogOpen(true)}
                className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white rounded-full px-8 py-6 text-lg font-semibold"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload Your Route
              </Button>
              <Link to={createPageUrl("StravaClub")}>
                <Button
                  className="bg-[var(--cy-bg-card)] text-[var(--cy-text)] hover:bg-gray-100 rounded-full px-8 py-6 text-lg font-semibold border-2 border-white"
                >
                  <Activity className="w-5 h-5 mr-2" />
                  Strava Club
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="sticky top-20 z-40 bg-[var(--cy-bg-card)] border-b border-[var(--cy-border-strong)] shadow-none">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--cy-text-muted)]" />
              <Input
                type="text"
                placeholder="Search routes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 rounded-xl"
              />
            </div>
            
            <div className="flex gap-3 flex-wrap">
              <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                <SelectTrigger className="w-[160px] h-11 rounded-xl">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="Challenging">Challenging</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterSurface} onValueChange={setFilterSurface}>
                <SelectTrigger className="w-[160px] h-11 rounded-xl">
                  <SelectValue placeholder="Surface" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Surfaces</SelectItem>
                  <SelectItem value="Paved">Paved</SelectItem>
                  <SelectItem value="Gravel">Gravel</SelectItem>
                  <SelectItem value="Mixed">Mixed</SelectItem>
                  <SelectItem value="Mountain Trail">Mountain Trail</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px] h-11 rounded-xl">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="distance">Longest Distance</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-4">
            <Filter className="w-4 h-4 text-[var(--cy-text-muted)]" />
            <span className="text-sm text-[var(--cy-text-muted)]">
              Showing {filteredRoutes.length} of {routes.length} routes
            </span>
          </div>
        </div>
      </section>

      {/* Leaderboards */}
      <section className="py-8 bg-[var(--cy-bg-card)] border-b border-[var(--cy-border)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <LeaderboardCard
              title="Top Route Creators"
              type="routes"
              leaders={[
                { name: "Sarah M.", stat: "12 routes", value: "12" },
                { name: "Mike R.", stat: "8 routes", value: "8" },
                { name: "Emma K.", stat: "6 routes", value: "6" }
              ]}
            />
            <LeaderboardCard
              title="Most Active Riders"
              type="distance"
              leaders={[
                { name: "John D.", stat: "2,450 km", value: "2450km" },
                { name: "Lisa T.", stat: "1,890 km", value: "1890km" },
                { name: "Chris P.", stat: "1,650 km", value: "1650km" }
              ]}
            />
            <LeaderboardCard
              title="Popular Routes"
              type="events"
              leaders={[
                { name: "Mountain Loop", stat: "156 rides", value: "156" },
                { name: "Coastal Path", stat: "142 rides", value: "142" },
                { name: "City Circuit", stat: "98 rides", value: "98" }
              ]}
            />
          </div>
        </div>
      </section>

      {/* Routes Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {user && filteredRoutes.length > 0 && (
            <div className="mb-8 p-6 bg-gradient-to-r from-[#6BCBFF]/10 to-transparent rounded-2xl border-l-4 border-[#6BCBFF]">
              <h3 className="text-lg font-bold text-[var(--cy-text)] mb-2">✨ Perfect Routes for Your Level</h3>
              <p className="text-sm text-[var(--cy-text-muted)]">
                These routes match your skill level and riding preferences
              </p>
            </div>
          )}
          {isLoading ? (
            <div className="text-center py-20">
              <div className="text-[var(--cy-text-muted)]">Loading routes...</div>
            </div>
          ) : filteredRoutes.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRoutes.map((route, index) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-[var(--cy-text-muted)]" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--cy-text)] mb-2">No routes found</h3>
              <p className="text-[var(--cy-text-muted)]">Try adjusting your filters or upload a new route</p>
            </div>
          )}
        </div>
      </section>

      {/* Upload Dialog */}
      <UploadRouteDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
      />
    </div>
  );
}