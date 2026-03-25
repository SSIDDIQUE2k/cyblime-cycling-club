import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { usePageContent } from "../hooks/usePageContent";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import {
  MapPin,
  TrendingUp,
  Mountain,
  Star,
  Activity,
  Trophy,
  Users,
  Calendar,
  ChevronRight,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PremiumLoader from "../components/cycling/PremiumLoader";

const RouteCard = ({ route, index }) => {
  const difficultyColors = {
    Easy: "bg-[#A4FF4F] text-[var(--cy-text)]",
    Moderate: "bg-yellow-400 text-[var(--cy-text)]",
    Challenging: "bg-orange-500 text-[var(--cy-text)]",
    Expert: "bg-red-600 text-[var(--cy-text)]"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-[var(--cy-bg-card)] rounded-2xl overflow-hidden border border-[var(--cy-border)] hover:shadow-lg hover:shadow-black/30 transition-all duration-300 group"
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

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-[#FC4C02]" />
            <span className="text-[var(--cy-text-muted)]">{route.distance}km</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-[#FC4C02]" />
            <span className="text-[var(--cy-text-muted)]">{route.elevation_gain}m</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mountain className="w-4 h-4 text-[#FC4C02]" />
            <span className="text-[var(--cy-text-muted)]">{route.surface_type}</span>
          </div>
        </div>

        <Link to={createPageUrl("RouteDetails") + `?id=${route.id}`}>
          <Button className="w-full bg-[#FC4C02] hover:bg-[#E34402] text-[var(--cy-text)] rounded-xl">
            View Route
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};

const DEFAULT_CYCLINGHUB_CONTENT = {
  hero: {
    heading: "Cycling Hub",
    subheading: "Your central destination for all things cycling at Cyblime."
  },
  cta: {
    heading: "Ready to Join the Ride?",
    subheading: "Discover new routes, connect with riders, and track your progress."
  }
};

export default function CyclingHub() {
  const { content: pageContent } = usePageContent("cyclinghub", DEFAULT_CYCLINGHUB_CONTENT);
  const [activeTab, setActiveTab] = useState("routes");
  const [isLoadingTab, setIsLoadingTab] = useState(false);

  const { data: routes = [], isLoading: routesLoading } = useQuery({
    queryKey: ['routes'],
    queryFn: () => base44.entities.Route.list('-created_date'),

  });

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['hubEvents'],
    queryFn: () => base44.entities.Event.list('-date'),

  });

  const handleTabChange = (value) => {
    setIsLoadingTab(true);
    setActiveTab(value);
    setTimeout(() => setIsLoadingTab(false), 1000);
  };

  const featuredRoutes = routes.slice(0, 6);

  // Compute real club stats from route and event data
  const clubStats = useMemo(() => {
    const totalDistance = routes.reduce((sum, r) => sum + (r.distance || 0), 0);
    const totalElevation = routes.reduce((sum, r) => sum + (r.elevation_gain || 0), 0);
    const avgDistance = routes.length > 0 ? Math.round(totalDistance / routes.length) : 0;

    const difficultyCounts = {};
    routes.forEach(r => {
      const d = r.difficulty || "Unknown";
      difficultyCounts[d] = (difficultyCounts[d] || 0) + 1;
    });

    const surfaceCounts = {};
    routes.forEach(r => {
      const s = r.surface_type || "Unknown";
      surfaceCounts[s] = (surfaceCounts[s] || 0) + 1;
    });

    const upcomingEvents = events.filter(e => new Date(e.date) >= new Date());
    const pastEvents = events.filter(e => new Date(e.date) < new Date());

    return {
      totalDistance,
      totalElevation,
      avgDistance,
      difficultyCounts,
      surfaceCounts,
      upcomingEvents: upcomingEvents.length,
      pastEvents: pastEvents.length,
      totalEvents: events.length,
      totalRoutes: routes.length
    };
  }, [routes, events]);

  return (
    <div className="min-h-screen bg-[var(--cy-bg)]">
      <PremiumLoader isLoading={routesLoading || eventsLoading || isLoadingTab} />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#FC4C02] to-[#FF7A00] py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[var(--cy-bg-card)] blur-3xl" />
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
            <p className="text-xl text-[var(--cy-text)]/90 mb-8">
              {pageContent.hero.subheading}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 bg-[var(--cy-bg-card)] border-b border-[var(--cy-border-strong)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#FC4C02] mb-1">{routes.length}</div>
              <div className="text-sm text-[var(--cy-text-muted)]">Routes Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#FC4C02] mb-1">{events.length}</div>
              <div className="text-sm text-[var(--cy-text-muted)]">Total Events</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#FC4C02] mb-1">{clubStats.totalDistance.toLocaleString()}</div>
              <div className="text-sm text-[var(--cy-text-muted)]">Total km in Routes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#FC4C02] mb-1">{clubStats.totalElevation.toLocaleString()}</div>
              <div className="text-sm text-[var(--cy-text-muted)]">Total Elevation (m)</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - Tabs */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-8 bg-[var(--cy-bg-card)] p-2 rounded-2xl shadow-none">
              <TabsTrigger
                value="routes"
                className="rounded-xl data-[state=active]:bg-[#FC4C02] data-[state=active]:text-[var(--cy-text)] px-6 py-3"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Featured Routes
              </TabsTrigger>
              <TabsTrigger
                value="strava"
                className="rounded-xl data-[state=active]:bg-[#FC4C02] data-[state=active]:text-[var(--cy-text)] px-6 py-3"
              >
                <Activity className="w-4 h-4 mr-2" />
                Strava Club
              </TabsTrigger>
              <TabsTrigger
                value="stats"
                className="rounded-xl data-[state=active]:bg-[#FC4C02] data-[state=active]:text-[var(--cy-text)] px-6 py-3"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Club Stats
              </TabsTrigger>
            </TabsList>

            {/* Routes Tab */}
            <TabsContent value="routes" className="space-y-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-[var(--cy-text)]">Featured Routes</h2>
                <Link to={createPageUrl("Routes")}>
                  <Button variant="outline" className="rounded-full">
                    View All Routes
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredRoutes.map((route, index) => (
                  <RouteCard key={route.id} route={route} index={index} />
                ))}
              </div>
            </TabsContent>

            {/* Strava Club Tab - single embed */}
            <TabsContent value="strava" className="h-[calc(100vh-250px)]">
              <div className="bg-[var(--cy-bg-card)] rounded-2xl overflow-hidden border border-[var(--cy-border)] h-full flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--cy-border)]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FC4C02] flex items-center justify-center">
                      <Activity className="w-5 h-5 text-[var(--cy-text)]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--cy-text)]">CYBLIME on Strava</h3>
                      <p className="text-sm text-[var(--cy-text-muted)]">Club feed, activities, leaderboard & events</p>
                    </div>
                  </div>
                  <a href="https://www.strava.com/clubs/762372" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="rounded-full text-sm">
                      Open in Strava
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </a>
                </div>
                <iframe
                  src="https://www.strava.com/clubs/762372?oq=cy"
                  className="w-full flex-1 border-0"
                  title="Strava Club"
                />
              </div>
            </TabsContent>

            {/* Club Stats Tab - real data from Route & Event entities */}
            <TabsContent value="stats" className="space-y-8">
              <h2 className="text-3xl font-bold text-[var(--cy-text)]">Club Stats</h2>

              {/* Summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-[var(--cy-bg-card)] rounded-2xl p-6 shadow-none text-center">
                  <MapPin className="w-8 h-8 text-[#FC4C02] mx-auto mb-3" />
                  <div className="text-3xl font-bold text-[var(--cy-text)]">{clubStats.totalRoutes}</div>
                  <div className="text-sm text-[var(--cy-text-muted)] mt-1">Total Routes</div>
                </div>
                <div className="bg-[var(--cy-bg-card)] rounded-2xl p-6 shadow-none text-center">
                  <TrendingUp className="w-8 h-8 text-[#FC4C02] mx-auto mb-3" />
                  <div className="text-3xl font-bold text-[var(--cy-text)]">{clubStats.avgDistance}</div>
                  <div className="text-sm text-[var(--cy-text-muted)] mt-1">Avg Distance (km)</div>
                </div>
                <div className="bg-[var(--cy-bg-card)] rounded-2xl p-6 shadow-none text-center">
                  <Mountain className="w-8 h-8 text-[#FC4C02] mx-auto mb-3" />
                  <div className="text-3xl font-bold text-[var(--cy-text)]">{clubStats.totalElevation.toLocaleString()}</div>
                  <div className="text-sm text-[var(--cy-text-muted)] mt-1">Total Elevation (m)</div>
                </div>
                <div className="bg-[var(--cy-bg-card)] rounded-2xl p-6 shadow-none text-center">
                  <Calendar className="w-8 h-8 text-[#FC4C02] mx-auto mb-3" />
                  <div className="text-3xl font-bold text-[var(--cy-text)]">{clubStats.upcomingEvents}</div>
                  <div className="text-sm text-[var(--cy-text-muted)] mt-1">Upcoming Events</div>
                </div>
              </div>

              {/* Route difficulty breakdown */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[var(--cy-bg-card)] rounded-2xl p-6 border border-[var(--cy-border)]">
                  <h3 className="text-lg font-bold text-[var(--cy-text)] mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-[#FC4C02]" />
                    Routes by Difficulty
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(clubStats.difficultyCounts).map(([difficulty, count]) => {
                      const colors = {
                        Easy: "bg-[#A4FF4F]",
                        Moderate: "bg-yellow-400",
                        Challenging: "bg-orange-500",
                        Expert: "bg-red-600",
                        Unknown: "bg-gray-400"
                      };
                      const pct = clubStats.totalRoutes > 0 ? Math.round((count / clubStats.totalRoutes) * 100) : 0;
                      return (
                        <div key={difficulty}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-[var(--cy-text)]">{difficulty}</span>
                            <span className="text-[var(--cy-text-muted)]">{count} ({pct}%)</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full ${colors[difficulty] || colors.Unknown}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                    {Object.keys(clubStats.difficultyCounts).length === 0 && (
                      <p className="text-sm text-[var(--cy-text-muted)]">No routes yet.</p>
                    )}
                  </div>
                </div>

                <div className="bg-[var(--cy-bg-card)] rounded-2xl p-6 border border-[var(--cy-border)]">
                  <h3 className="text-lg font-bold text-[var(--cy-text)] mb-4 flex items-center gap-2">
                    <Mountain className="w-5 h-5 text-[#FC4C02]" />
                    Routes by Surface
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(clubStats.surfaceCounts).map(([surface, count]) => {
                      const pct = clubStats.totalRoutes > 0 ? Math.round((count / clubStats.totalRoutes) * 100) : 0;
                      return (
                        <div key={surface}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-[var(--cy-text)]">{surface}</span>
                            <span className="text-[var(--cy-text-muted)]">{count} ({pct}%)</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2.5">
                            <div
                              className="h-2.5 rounded-full bg-[#FC4C02]"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                    {Object.keys(clubStats.surfaceCounts).length === 0 && (
                      <p className="text-sm text-[var(--cy-text-muted)]">No routes yet.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Upcoming events list */}
              <div className="bg-[var(--cy-bg-card)] rounded-2xl p-6 border border-[var(--cy-border)]">
                <h3 className="text-lg font-bold text-[var(--cy-text)] mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#FC4C02]" />
                  Upcoming Events
                </h3>
                <div className="space-y-3">
                  {events
                    .filter(e => new Date(e.date) >= new Date())
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .slice(0, 5)
                    .map(event => (
                      <div key={event.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FC4C02] to-[#FF7A00] flex items-center justify-center text-[var(--cy-text)] text-xs font-bold flex-shrink-0">
                          {new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[var(--cy-text)] truncate">{event.title || event.name}</p>
                          <p className="text-sm text-[var(--cy-text-muted)] truncate">{event.location || "Location TBD"}</p>
                        </div>
                      </div>
                    ))}
                  {events.filter(e => new Date(e.date) >= new Date()).length === 0 && (
                    <p className="text-sm text-[var(--cy-text-muted)]">No upcoming events scheduled.</p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-[var(--cy-gradient-from)] to-[var(--cy-gradient-to)]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--cy-text)] mb-6">
              {pageContent.cta?.heading || "Ready to Join the Ride?"}
            </h2>
            <p className="text-xl text-[var(--cy-text-muted)] mb-8">
              {pageContent.cta?.subheading || "Discover new routes, connect with riders, and track your progress."}
            </p>
            <div className="flex gap-4 justify-center">
              <Link to={createPageUrl("Routes")}>
                <Button className="bg-[#FC4C02] hover:bg-[#E34402] text-[var(--cy-text)] rounded-full px-8 py-6 text-lg">
                  Explore Routes
                </Button>
              </Link>
              <a href="https://www.strava.com/clubs/762372" target="_blank" rel="noopener noreferrer">
                <Button className="bg-[var(--cy-bg-card)] text-[var(--cy-text)] hover:bg-gray-100 border-2 border-white rounded-full px-8 py-6 text-lg font-semibold">
                  <Users className="w-5 h-5 mr-2" />
                  Join Club
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
