import React from "react";
import { motion } from "framer-motion";
import { 
  Target, 
  Users, 
  Award, 
  Heart,
  CheckCircle2,
  Quote
} from "lucide-react";
import { usePageContent, useTestimonials } from "../hooks/usePageContent";

const ValueCard = ({ icon: Icon, title, description, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="bg-[var(--cy-bg-card)] rounded-2xl p-8 border border-[var(--cy-border)] hover:shadow-lg hover:shadow-black/30 shadow-black/20 transition-all duration-300"
    >
      <div className="w-14 h-14 rounded-2xl bg-[#ff6b35] flex items-center justify-center mb-6">
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-2xl font-bold text-[var(--cy-text)] mb-4">{title}</h3>
      <p className="text-[var(--cy-text-muted)] leading-relaxed">{description}</p>
    </motion.div>
  );
};

const TestimonialCard = ({ quote, author, role, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="bg-[var(--cy-bg-card)] rounded-2xl p-8 border border-[var(--cy-border)]"
    >
      <Quote className="w-10 h-10 text-[#ff6b35] mb-4" />
      <p className="text-[var(--cy-text-secondary)] text-lg mb-6 leading-relaxed">{quote}</p>
      <div>
        <div className="font-semibold text-[var(--cy-text)]">{author}</div>
        <div className="text-sm text-[var(--cy-text-muted)]">{role}</div>
      </div>
    </motion.div>
  );
};

const DEFAULT_ABOUT_CONTENT = {
  hero: {
    heading: "More Than a Club. A Movement.",
    tagline: "At Cyblime, we're building a culture where endurance meets excellence, where every pedal stroke brings you closer to your goals, and where community is at the heart of everything we do."
  },
  story: {
    founded_year: "2019",
    origin_text: "What started as weekend group rides with a handful of friends has grown into a thriving community of over 2,500 active members.",
    member_count: "2,500",
    description: "Today, we're proud to be one of the most inclusive and dynamic cycling clubs in the region, known for our expert-led events, stunning adventure trips, and unwavering commitment to helping every rider reach their full potential.",
    images: ["", "", "", ""]
  },
  benefits_image: "",
  values: [
    { title: "Community First", description: "We believe in the power of connection. Every ride, every event, every interaction is an opportunity to build lasting friendships and support each other's growth." },
    { title: "Excellence in Every Ride", description: "From route planning to safety protocols, we maintain the highest standards. Our expert ride leaders ensure every experience is memorable, safe, and rewarding." },
    { title: "Inclusive & Welcoming", description: "Whether you're a seasoned cyclist or just starting out, you have a place here. We celebrate all skill levels and create opportunities for everyone to thrive." },
    { title: "Growth Mindset", description: "Cycling is a journey, not a destination. We provide the training, workshops, and mentorship to help you reach new heights and discover what you're capable of." }
  ],
  benefits: [
    { title: "150+ Events/Year", description: "Access to 150+ events per year" },
    { title: "Expert-Led Training", description: "Expert-led training and workshops" },
    { title: "Adventure Trips", description: "Exclusive adventure trips to stunning destinations" },
    { title: "Community Support", description: "Supportive community of passionate cyclists" },
    { title: "Professional Ride Leaders", description: "Professional ride leaders and safety support" },
    { title: "Member Discounts", description: "Member discounts on gear and equipment" },
    { title: "Social Events", description: "Social events and networking opportunities" },
    { title: "Personalized Coaching", description: "Personalized coaching and guidance" }
  ]
};

const DEFAULT_TESTIMONIALS = [
  {
    quote: "Cyblime transformed my cycling journey. I went from struggling on 10km rides to completing my first century ride, all thanks to the incredible support and training I received.",
    author: "Sarah Mitchell",
    role: "Member since 2022"
  },
  {
    quote: "The community here is unlike anything I've experienced. Every ride feels like riding with family. The trip to Blue Ridge Mountains was a life-changing experience.",
    author: "Marcus Rodriguez",
    role: "Member since 2021"
  },
  {
    quote: "As a beginner, I was nervous to join. But the welcoming atmosphere and patient ride leaders made me feel at home from day one. Best decision I've made!",
    author: "Emily Chen",
    role: "Member since 2023"
  }
];

const VALUE_ICONS = [Users, Target, Heart, Award];

export default function About() {
  const { content } = usePageContent("about", DEFAULT_ABOUT_CONTENT);
  const { testimonials: cmsTestimonials } = useTestimonials();

  const values = (content.values || DEFAULT_ABOUT_CONTENT.values).map((v, i) => ({
    icon: VALUE_ICONS[i] || VALUE_ICONS[0],
    title: v.title,
    description: v.description
  }));

  const benefits = (content.benefits || DEFAULT_ABOUT_CONTENT.benefits).map(b =>
    typeof b === "string" ? b : (b.description || b.title)
  );

  const testimonials = cmsTestimonials?.length > 0
    ? cmsTestimonials.map(t => ({
        quote: t.quote || t.text,
        author: t.author || t.name,
        role: t.role || t.subtitle || ""
      }))
    : DEFAULT_TESTIMONIALS;

  return (
    <div className="min-h-screen bg-[var(--cy-bg)]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[var(--cy-gradient-to)] to-[var(--cy-gradient-from)] py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[#ff6b35]/10 blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-[var(--cy-text)] tracking-tight mb-6">
              {(content.hero?.heading || DEFAULT_ABOUT_CONTENT.hero.heading).split(".").filter(Boolean).map((part, i, arr) => (
                <React.Fragment key={i}>
                  {i === 0 ? <>{part.trim()}.<br /></> : <span className="text-[#ff6b35]">{part.trim()}.{i < arr.length - 1 ? " " : ""}</span>}
                </React.Fragment>
              ))}
            </h1>
            <p className="text-xl text-[var(--cy-text-secondary)] leading-relaxed">
              {content.hero?.tagline || DEFAULT_ABOUT_CONTENT.hero.tagline}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 bg-[var(--cy-bg-card)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block text-xs font-semibold tracking-widest text-[#ff6b35] uppercase mb-4">Our Story</span>
              <h2 className="text-4xl md:text-5xl font-bold text-[var(--cy-text)] mb-6">
                Founded by Cyclists,
                <br />
                For Cyclists
              </h2>
              <div className="space-y-4 text-[var(--cy-text-muted)] leading-relaxed">
                <p>
                  Cyblime began in {content.story?.founded_year || DEFAULT_ABOUT_CONTENT.story.founded_year} with a simple vision: create a cycling community that welcomes everyone, challenges the status quo, and makes every ride an adventure worth remembering.
                </p>
                <p>
                  {content.story?.origin_text || DEFAULT_ABOUT_CONTENT.story.origin_text} We've organized hundreds of events, explored countless miles of trails, and created friendships that extend far beyond the bike.
                </p>
                <p>
                  {content.story?.description || DEFAULT_ABOUT_CONTENT.story.description}
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-2 gap-4"
            >
              {(() => {
                const imgs = content.story?.images || [];
                const placeholders = [
                  { alt: "Cycling", h: "h-48" },
                  { alt: "Group ride", h: "h-64" },
                  { alt: "Adventure", h: "h-64" },
                  { alt: "Cyclist", h: "h-48" },
                ];
                return (
                  <>
                    <div className="space-y-4">
                      {[0, 1].map(i => imgs[i] ? (
                        <img key={i} src={imgs[i]} alt={placeholders[i].alt} className={`w-full ${placeholders[i].h} object-cover rounded-2xl`} />
                      ) : (
                        <div key={i} className={`w-full ${placeholders[i].h} rounded-2xl bg-[var(--cy-bg-elevated)] border border-[var(--cy-border)] flex items-center justify-center`}>
                          <span className="text-[var(--cy-text-muted)] text-sm">Add image in Page Editor</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4 mt-8">
                      {[2, 3].map(i => imgs[i] ? (
                        <img key={i} src={imgs[i]} alt={placeholders[i].alt} className={`w-full ${placeholders[i].h} object-cover rounded-2xl`} />
                      ) : (
                        <div key={i} className={`w-full ${placeholders[i].h} rounded-2xl bg-[var(--cy-bg-elevated)] border border-[var(--cy-border)] flex items-center justify-center`}>
                          <span className="text-[var(--cy-text-muted)] text-sm">Add image in Page Editor</span>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-[var(--cy-bg)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="inline-block text-xs font-semibold tracking-widest text-[#ff6b35] uppercase mb-4">Our Values</span>
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--cy-text)] mb-6">
              What We Stand For
            </h2>
            <p className="text-lg text-[var(--cy-text-muted)]">
              These core principles guide everything we do and shape the Cyblime experience.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <ValueCard key={index} {...value} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-[var(--cy-bg-card)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block text-xs font-semibold tracking-widest text-[#ff6b35] uppercase mb-4">Member Benefits</span>
              <h2 className="text-4xl md:text-5xl font-bold text-[var(--cy-text)] mb-6">
                Why Ride With Cyblime?
              </h2>
              <p className="text-lg text-[var(--cy-text-muted)] mb-8">
                When you join Cyblime, you're not just signing up for events — you're gaining access to a complete cycling ecosystem designed to support your journey.
              </p>
              
              <div className="grid gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#ff6b35] flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[var(--cy-text-secondary)]">{benefit}</span>
                  </motion.div>
                ))}
              </div>
              

            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              {content.benefits_image ? (
                <img
                  src={content.benefits_image}
                  alt="Cyclists celebrating"
                  className="w-full h-[600px] object-cover rounded-3xl shadow-2xl"
                />
              ) : (
                <div className="w-full h-[600px] rounded-3xl bg-[var(--cy-bg-elevated)] border border-[var(--cy-border)] flex items-center justify-center">
                  <span className="text-[var(--cy-text-muted)]">Add image in Page Editor</span>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-[var(--cy-bg)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="inline-block text-xs font-semibold tracking-widest text-[#ff6b35] uppercase mb-4">Testimonials</span>
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--cy-text)] mb-6">
              What Our Members Say
            </h2>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-[var(--cy-gradient-to)] to-[var(--cy-gradient-from)]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--cy-text)] mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-[var(--cy-text-muted)]">
              Join a community that will support, challenge, and inspire you every mile of the way.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}