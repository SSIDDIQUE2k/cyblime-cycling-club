import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { usePageContent } from "../hooks/usePageContent";
import { useAuth } from "@/lib/AuthContext";
import {
  Calendar,
  MapPin,
  ArrowRight,
  Compass,
  Heart,
  Users,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Default content for CMS fallback
const DEFAULT_HOME_CONTENT = {
  hero_slides: [
    { heading: "Ride Together.\nGrow Together.", subheading: "Join London's fastest-growing cycling community.", image_url: "" }
  ],
  values: [
    { title: "Adventure Awaits", description: "New routes, hidden trails, and open roads — every ride is an opportunity for discovery.", icon: "compass" },
    { title: "Community First", description: "Friendships forged on the road. Every rider is valued, every story matters.", icon: "heart" },
    { title: "All Levels Welcome", description: "Whether you're clipping in for the first time or chasing KOMs, you belong here.", icon: "users" }
  ],
  cta: {
    heading: "Ready to Ride?",
    subheading: "Your next adventure starts with a single pedal stroke.",
    button_text: "View Membership",
    button_link: "Membership"
  },
  instagram_widget_id: "70900cfe-1ff2-4b28-a832-f9790890ec6d",
  show_instagram: true,
  show_recommendations: true
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }
  })
};

export default function Home() {
  const { user } = useAuth();
  const { content } = usePageContent("home", DEFAULT_HOME_CONTENT);

  // Load Elfsight for Instagram
  useEffect(() => {
    if (!content.show_instagram) return;
    const script = document.createElement('script');
    script.src = 'https://elfsightcdn.com/platform.js';
    script.async = true;
    document.body.appendChild(script);
    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
  }, [content.show_instagram]);

  const { data: upcomingEvents = [] } = useQuery({
    queryKey: ['upcomingEvents'],
    queryFn: async () => {
      const allEvents = await base44.entities.Event.list('-date', 6);
      return allEvents.filter(e => e.status === 'published' && new Date(e.date) >= new Date()).slice(0, 3);
    }
  });

  const iconMap = { compass: Compass, heart: Heart, users: Users };
  const heroSlide = content.hero_slides?.[0] || DEFAULT_HOME_CONTENT.hero_slides[0];

  return (
    <div className="min-h-screen bg-[var(--cy-bg)]">

      {/* ═══════════════════════════════════════════════
          HERO — Full-screen single image, no slideshow
          ═══════════════════════════════════════════════ */}
      <section className="relative h-screen w-full overflow-hidden -mt-20">
        {/* Background image */}
        <div className="absolute inset-0">
          {heroSlide.image_url ? (
            <img
              src={heroSlide.image_url}
              alt="Cyblime Cycling"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#16213e]" />
          )}
          {/* Gradient overlay — dark at bottom for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Hero content — bottom-aligned, left-justified */}
        <div className="relative z-10 h-full flex items-end pb-24 md:pb-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="max-w-3xl"
            >
              <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold text-white leading-[1.05] tracking-tight whitespace-pre-line">
                {heroSlide.heading}
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mt-6 max-w-xl leading-relaxed">
                {heroSlide.subheading}
              </p>
              <div className="flex flex-wrap gap-4 mt-10">
                <Link to={createPageUrl("Events")}>
                  <Button className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white rounded-full px-8 py-6 text-base font-semibold shadow-xl shadow-[#ff6b35]/20 hover:shadow-[#ff6b35]/30 transition-all">
                    Explore Events
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to={createPageUrl("Membership")}>
                  <button className="rounded-full px-8 py-6 text-base font-semibold border border-white/30 text-white hover:bg-white/10 bg-transparent backdrop-blur-sm transition-colors">
                    Join the Club
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center pt-2"
          >
            <div className="w-1 h-2 bg-white/60 rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          UPCOMING EVENTS — Clean cards on dark bg
          ═══════════════════════════════════════════════ */}
      <section className="py-28 bg-[var(--cy-bg)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-end justify-between mb-14">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <p className="text-[#ff6b35] font-semibold text-sm uppercase tracking-widest mb-3">What's Next</p>
              <h2 className="text-4xl md:text-5xl font-bold text-[var(--cy-text)]">Upcoming Rides</h2>
            </motion.div>
            <Link
              to={createPageUrl("Events")}
              className="hidden md:flex items-center gap-2 text-[var(--cy-text-muted)] hover:text-[#ff6b35] transition-colors font-medium"
            >
              All events
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {upcomingEvents.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  variants={fadeUp}
                >
                  <Link to={createPageUrl("Events")} className="group block">
                    <div className="relative rounded-2xl overflow-hidden bg-[var(--cy-bg-card)] border border-[var(--cy-border)] hover:border-[#ff6b35]/30 transition-all duration-300">
                      {event.banner_image_url && (
                        <div className="h-52 overflow-hidden">
                          <img
                            src={event.banner_image_url}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-4 text-sm text-[var(--cy-text-muted)] mb-3">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" />
                              {event.location}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-[var(--cy-text)] group-hover:text-[#ff6b35] transition-colors">
                          {event.title}
                        </h3>
                        {(event.level || event.distance) && (
                          <div className="flex gap-2 mt-3">
                            {event.level && (
                              <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--cy-hover)] text-[var(--cy-text-muted)]">{event.level}</span>
                            )}
                            {event.distance && (
                              <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--cy-hover)] text-[var(--cy-text-muted)]">{event.distance}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center py-16 rounded-2xl border border-[var(--cy-border)] bg-[var(--cy-bg-card)]">
              <Clock className="w-10 h-10 text-[var(--cy-text-muted)] mx-auto mb-4" />
              <p className="text-[var(--cy-text-muted)] mb-6">No upcoming events right now</p>
              <Link to={createPageUrl("Events")}>
                <Button className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white rounded-full px-6">
                  Browse All Events
                </Button>
              </Link>
            </motion.div>
          )}

          <Link
            to={createPageUrl("Events")}
            className="md:hidden flex items-center justify-center gap-2 text-[var(--cy-text-muted)] hover:text-[#ff6b35] transition-colors font-medium mt-8"
          >
            View all events
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          VALUES — Three pillars, minimal and clean
          ═══════════════════════════════════════════════ */}
      <section className="py-28 bg-[var(--cy-bg-section)] border-y border-[var(--cy-border)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center max-w-2xl mx-auto mb-20"
          >
            <p className="text-[#ff6b35] font-semibold text-sm uppercase tracking-widest mb-3">Our Philosophy</p>
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--cy-text)]">
              What We Stand For
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-16">
            {(content.values || []).map((value, i) => {
              const Icon = iconMap[value.icon] || Compass;
              return (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  variants={fadeUp}
                  className="text-center group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-[#ff6b35]/10 border border-[#ff6b35]/20 flex items-center justify-center mx-auto mb-6 group-hover:bg-[#ff6b35]/20 transition-colors">
                    <Icon className="w-7 h-7 text-[#ff6b35]" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--cy-text)] mb-3">{value.title}</h3>
                  <p className="text-[var(--cy-text-muted)] leading-relaxed">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          INSTAGRAM — Only if enabled
          ═══════════════════════════════════════════════ */}
      {content.show_instagram && (
        <section className="py-28 bg-[var(--cy-bg)]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-center mb-14"
            >
              <p className="text-[#ff6b35] font-semibold text-sm uppercase tracking-widest mb-3">Follow the Journey</p>
              <h2 className="text-4xl md:text-5xl font-bold text-[var(--cy-text)]">
                @cyblimecycling
              </h2>
            </motion.div>

            <style>{`
              .elfsight-app-${content.instagram_widget_id || DEFAULT_HOME_CONTENT.instagram_widget_id} {
                overflow: hidden !important;
              }
              .elfsight-app-${content.instagram_widget_id || DEFAULT_HOME_CONTENT.instagram_widget_id} * {
                scrollbar-width: none !important;
                -ms-overflow-style: none !important;
              }
              .elfsight-app-${content.instagram_widget_id || DEFAULT_HOME_CONTENT.instagram_widget_id} *::-webkit-scrollbar {
                display: none !important;
              }
            `}</style>
            <div className={`elfsight-app-${content.instagram_widget_id || DEFAULT_HOME_CONTENT.instagram_widget_id}`} data-elfsight-app-lazy></div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════
          CTA — Join the club
          ═══════════════════════════════════════════════ */}
      <section className="py-32 bg-[var(--cy-bg)] relative overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ff6b35]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="text-5xl md:text-7xl font-bold text-[var(--cy-text)] mb-6 leading-tight">
              {content.cta?.heading || "Ready to Ride?"}
            </h2>
            <p className="text-lg text-[var(--cy-text-muted)] mb-12 max-w-xl mx-auto leading-relaxed">
              {content.cta?.subheading || "Your next adventure starts with a single pedal stroke."}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={createPageUrl(content.cta?.button_link || "Membership")}>
                <Button className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white rounded-full px-10 py-6 text-lg font-semibold shadow-xl shadow-[#ff6b35]/20">
                  {content.cta?.button_text || "View Membership"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl("About")}>
                <Button variant="ghost" className="text-[var(--cy-text-muted)] hover:text-[var(--cy-text)] rounded-full px-8 py-6 text-lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
