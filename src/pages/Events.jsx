import React, { useState } from "react";
import { motion } from "framer-motion";
import { usePageContent } from "../hooks/usePageContent";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import EventDetailsDialog from "../components/events/EventDetailsDialog";
import AdvancedEventFilters from "../components/events/AdvancedEventFilters";

import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ChevronRight,
  Filter,
  Search,
  Bike,
  Mountain,
  Wrench,
  Coffee,
  SlidersHorizontal,
  X } from
"lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
"@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger } from
"@/components/ui/sheet";

const EventCard = ({ event, index, onViewDetails }) => {
  const iconMap = {
    ride: Bike,
    trip: Mountain,
    workshop: Wrench,
    social: Coffee
  };

  const Icon = iconMap[event.type] || Bike;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group bg-[var(--cy-bg-card)] rounded-2xl p-6 border border-[var(--cy-border)] hover:shadow-lg hover:shadow-black/30 transition-all duration-300">

      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-[#A4FF4F]/10 flex items-center justify-center group-hover:bg-[#A4FF4F] transition-colors">
          <Icon className="w-5 h-5 text-[var(--cy-text)]" />
        </div>
        <Badge className={`${(event.current_participants || 0) < (event.max_participants || 999) ? 'bg-[#A4FF4F] text-[var(--cy-text)]' : 'bg-red-100 text-red-800'} border-0`}>
          {(event.current_participants || 0) < (event.max_participants || 999) ? 'Open' : 'Full'}
        </Badge>
      </div>
      
      <h3 className="text-xl font-semibold text-[var(--cy-text)] mb-2">{event.title}</h3>
      <p className="text-[var(--cy-text-muted)] text-sm mb-4">{event.description}</p>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-[var(--cy-text-muted)]">
          <Calendar className="w-4 h-4" />
          <span>{new Date(event.date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--cy-text-muted)]">
          <Clock className="w-4 h-4" />
          <span>{event.time}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--cy-text-muted)]">
          <MapPin className="w-4 h-4" />
          <span>{event.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--cy-text-muted)]">
          <Users className="w-4 h-4" />
          <span>{event.current_participants || 0} / {event.max_participants || '∞'} participants</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Badge variant="outline" className="text-xs">{event.level}</Badge>
        {event.distance && <Badge variant="outline" className="text-xs">{event.distance}</Badge>}
        {event.organizer_name && (
          <Badge variant="outline" className="text-xs bg-[#ff6b35]/10 text-[#ff6b35] border-[#ff6b35]/30">
            By {event.organizer_name}
          </Badge>
        )}
      </div>
      
      <Button
        onClick={() => onViewDetails(event)}
        className="w-full bg-[#ff6b35] hover:bg-[#e55a2b] text-white rounded-xl">

        View Details
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </motion.div>);

};

const AdvancedFilters = ({ filters, onFilterChange, onReset }) => {
  return (
    <div className="space-y-6">
      {/* Date Range */}
      <div>
        <Label className="text-sm font-semibold text-[var(--cy-text)] mb-3 block">Date Range</Label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-[var(--cy-text-muted)]">From</Label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => onFilterChange({ ...filters, dateFrom: e.target.value })} />

          </div>
          <div>
            <Label className="text-xs text-[var(--cy-text-muted)]">To</Label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => onFilterChange({ ...filters, dateTo: e.target.value })} />

          </div>
        </div>
      </div>

      {/* Distance Range */}
      <div>
        <Label className="text-sm font-semibold text-[var(--cy-text)] mb-3 block">Distance (km)</Label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-[var(--cy-text-muted)]">Min</Label>
            <Input
              type="number"
              value={filters.distanceMin}
              onChange={(e) => onFilterChange({ ...filters, distanceMin: e.target.value })}
              placeholder="0" />

          </div>
          <div>
            <Label className="text-xs text-[var(--cy-text-muted)]">Max</Label>
            <Input
              type="number"
              value={filters.distanceMax}
              onChange={(e) => onFilterChange({ ...filters, distanceMax: e.target.value })}
              placeholder="100+" />

          </div>
        </div>
      </div>

      {/* Workshop Skills */}
      <div>
        <Label className="text-sm font-semibold text-[var(--cy-text)] mb-3 block">Workshop Skills</Label>
        <div className="space-y-2">
          {['Bike Handling', 'Climbing', 'Nutrition', 'Maintenance', 'Safety', 'Endurance'].map((skill) =>
          <label key={skill} className="flex items-center gap-2 cursor-pointer">
              <input
              type="checkbox"
              checked={filters.skills.includes(skill)}
              onChange={(e) => {
                const newSkills = e.target.checked ?
                [...filters.skills, skill] :
                filters.skills.filter((s) => s !== skill);
                onFilterChange({ ...filters, skills: newSkills });
              }}
              className="w-4 h-4 rounded border-gray-300 text-[#ff6b35] focus:ring-[#ff6b35]" />

              <span className="text-sm text-[var(--cy-text-muted)]">{skill}</span>
            </label>
          )}
        </div>
      </div>

      {/* Location */}
      <div>
        <Label className="text-sm font-semibold text-[var(--cy-text)] mb-3 block">Location</Label>
        <Input
          type="text"
          placeholder="Enter location..."
          value={filters.location}
          onChange={(e) => onFilterChange({ ...filters, location: e.target.value })} />

      </div>

      {/* Reset Button */}
      <Button
        onClick={onReset}
        variant="outline"
        className="w-full">

        <X className="w-4 h-4 mr-2" />
        Reset Filters
      </Button>
    </div>);

};

const DEFAULT_EVENTS_CONTENT = {
  hero: {
    heading: "Upcoming Events",
    subheading: "From high-energy group rides to immersive workshops, find the perfect event to elevate your cycling journey."
  },
  cta: {
    heading: "Can't Find What You're Looking For?",
    subheading: "We're always adding new events. Let us know what you'd love to see!"
  }
};

export default function Events() {
  const { content: pageContent } = usePageContent("events", DEFAULT_EVENTS_CONTENT);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { user } = useAuth();
  const [advancedFilters, setAdvancedFilters] = useState({
    dateFrom: "",
    dateTo: "",
    type: "all",
    distanceMin: "",
    distanceMax: "",
    skills: [],
    location: "",
    level: "all"
  });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.filter({ status: 'published' }, '-date', 100)
  });

  const filteredEvents = events.
  filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || event.type === filterType;
    const matchesLevel = filterLevel === "all" || event.level === filterLevel;

    const eventDate = new Date(event.date);
    const matchesDateFrom = !advancedFilters.dateFrom || eventDate >= new Date(advancedFilters.dateFrom);
    const matchesDateTo = !advancedFilters.dateTo || eventDate <= new Date(advancedFilters.dateTo);

    const matchesLocation = !advancedFilters.location ||
      event.location.toLowerCase().includes(advancedFilters.location.toLowerCase());

    return matchesSearch && matchesType && matchesLevel &&
      matchesDateFrom && matchesDateTo && matchesLocation;
  }).
  sort((a, b) => {
    if (sortBy === "date") return new Date(a.date) - new Date(b.date);
    return 0;
  });

  const resetFilters = () => {
    setAdvancedFilters({
      dateFrom: "",
      dateTo: "",
      distanceMin: "",
      distanceMax: "",
      skills: [],
      location: ""
    });
  };

  return (
    <div className="min-h-screen bg-[var(--cy-bg)]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[var(--cy-gradient-from)] to-[var(--cy-gradient-to)] py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[#A4FF4F]/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-[#6BCBFF]/10 blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto">

            <h1 className="text-5xl md:text-6xl font-bold text-[var(--cy-text)] tracking-tight mb-6">
              {pageContent.hero.heading}
            </h1>
            <p className="text-xl text-[var(--cy-text-muted)] mb-8">
              {pageContent.hero.subheading}
            </p>
            
            {user && (
              <Link to={createPageUrl("MyEvents")}>
                <Button className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white rounded-full px-8 py-4">
                  Create Your Own Event
                </Button>
              </Link>
            )}
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div>
                <div className="text-3xl font-bold text-[#A4FF4F] mb-1">{events.length}</div>
                <div className="text-sm text-[var(--cy-text-muted)] uppercase tracking-wider">Events</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#A4FF4F] mb-1">4</div>
                <div className="text-sm text-[var(--cy-text-muted)] uppercase tracking-wider">Types</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#A4FF4F] mb-1">Weekly</div>
                <div className="text-sm text-[var(--cy-text-muted)] uppercase tracking-wider">New Events</div>
              </div>
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
                placeholder="Search events by name, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 rounded-xl" />
            </div>
            
            <div className="flex gap-3 flex-wrap">
              <AdvancedEventFilters 
                filters={advancedFilters}
                onFiltersChange={setAdvancedFilters}
                onReset={() => setAdvancedFilters({
                  dateFrom: '',
                  dateTo: '',
                  type: 'all',
                  location: '',
                  level: 'all',
                  distanceMin: '',
                  distanceMax: ''
                })}
              />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[160px] h-11 rounded-xl">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="ride">Group Rides</SelectItem>
                  <SelectItem value="trip">Adventure Trips</SelectItem>
                  <SelectItem value="workshop">Workshops</SelectItem>
                  <SelectItem value="social">Social Events</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger className="w-[160px] h-11 rounded-xl">
                  <SelectValue placeholder="Skill Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                  <SelectItem value="All Levels">All Levels</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px] h-11 rounded-xl">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Upcoming Date</SelectItem>
                  <SelectItem value="popularity">Most Popular</SelectItem>
                  <SelectItem value="distance">Distance</SelectItem>
                </SelectContent>
              </Select>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="h-11 rounded-xl">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    More Filters
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle className="text-[var(--cy-text)]">Advanced Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <AdvancedFilters
                      filters={advancedFilters}
                      onFilterChange={setAdvancedFilters}
                      onReset={resetFilters} />

                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-4">
            <Filter className="w-4 h-4 text-[var(--cy-text-muted)]" />
            <span className="text-sm text-[var(--cy-text-muted)]">
              Showing {filteredEvents.length} of {events.length} events
            </span>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {isLoading ? (
            <div className="text-center py-20">
              <p className="text-[var(--cy-text-muted)]">Loading events...</p>
            </div>
          ) : user && filteredEvents.length > 0 ?
          <>
            {user && filteredEvents.length > 0 &&
          <div className="mb-8 p-6 bg-gradient-to-r from-[#ff6b35]/10 to-transparent rounded-2xl border-l-4 border-[#ff6b35]">
              <h3 className="text-lg font-bold text-[var(--cy-text)] mb-2">🎯 Recommended for You</h3>
              <p className="text-sm text-[var(--cy-text-muted)]">
                Based on your interests, we think you'll enjoy these upcoming events
              </p>
            </div>
          }
          
          {filteredEvents.length > 0 ?
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event, index) =>
            <EventCard key={event.id} event={event} index={index} onViewDetails={setSelectedEvent} />
            )}
            </div> :

          <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-[var(--cy-text-muted)]" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--cy-text)] mb-2">No events found</h3>
              <p className="text-[var(--cy-text-muted)] mb-4">Try adjusting your filters or search query</p>
              <Button onClick={resetFilters} variant="outline">
                Reset All Filters
              </Button>
            </div>
          }
          </> : null}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-amber-600 py-20 from-[#A4FF4F] to-[#8FE640]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--cy-text)] mb-6">
            {pageContent.cta?.heading || "Can't Find What You're Looking For?"}
          </h2>
          <p className="text-lg text-[var(--cy-text)]/80">
            {pageContent.cta?.subheading || "We're constantly adding new events. Check back regularly for new rides and exclusive events."}
          </p>
        </div>
      </section>

      {/* Event Details Dialog */}
      <EventDetailsDialog
        event={selectedEvent}
        open={!!selectedEvent}
        onOpenChange={() => setSelectedEvent(null)} />

    </div>);

}