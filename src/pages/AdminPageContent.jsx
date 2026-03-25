import React, { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "../components/admin/AdminLayout";
import { Upload } from "lucide-react";
import {
  Save,
  FileText,
  Home,
  Info,
  CreditCard,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  GripVertical,
  Image,
  Type,
  Check,
  AlertCircle,
  RefreshCw,
  Calendar,
  BookOpen,
  Camera,
  Trophy,
  Compass,
  MapPin,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Default content structures for each page
const DEFAULT_HOME_CONTENT = {
  hero_slides: [
    { heading: "Ride Together, Grow Together", subheading: "Join the ultimate cycling community", image_url: "" },
    { heading: "Every Mile Tells a Story", subheading: "Create unforgettable cycling memories", image_url: "" },
    { heading: "Join the Journey", subheading: "From beginners to pros, everyone belongs", image_url: "" }
  ],
  values: [
    { title: "Adventure Awaits", description: "Discover new routes, new challenges, and new horizons with every ride.", icon: "compass" },
    { title: "Community First", description: "We ride together, grow together, and celebrate every milestone as a team.", icon: "users" },
    { title: "All Levels Welcome", description: "Whether you're a weekend warrior or a seasoned pro, there's a place for you.", icon: "heart" }
  ],
  gallery_images: [
    { url: "", alt: "Cycling group ride" },
    { url: "", alt: "Mountain trail" },
    { url: "", alt: "Community event" },
    { url: "", alt: "Scenic route" },
    { url: "", alt: "Training session" }
  ],
  cta: {
    heading: "Ready to Join the Pack?",
    subheading: "Your next adventure starts here",
    button_text: "View Events",
    button_link: "Events"
  },
  instagram_widget_id: "70900cfe-1ff2-4b28-a832-f9790890ec6d",
  show_instagram: true,
  show_recommendations: true
};

const DEFAULT_ABOUT_CONTENT = {
  hero: {
    heading: "More Than a Club. A Movement.",
    tagline: "We're not just about cycling — we're about building a culture of movement, connection, and growth."
  },
  story: {
    founded_year: "2019",
    origin_text: "What started as a small group of weekend riders has grown into a thriving cycling community.",
    member_count: "2,500",
    description: "Today, Cyblime Cycling boasts over 2,500 active members, expert-led events, and adventure trips that take our riders across breathtaking landscapes."
  },
  values: [
    { title: "Community First", description: "We believe cycling is better together. Our community is built on mutual support, shared experiences, and lasting friendships.", icon: "users" },
    { title: "Excellence in Every Ride", description: "From route planning to safety protocols, we maintain the highest standards to ensure every ride is exceptional.", icon: "star" },
    { title: "Inclusive & Welcoming", description: "Whether you're a beginner or a seasoned pro, you'll find your place here. We celebrate diversity in ability and background.", icon: "heart" },
    { title: "Growth Mindset", description: "We push boundaries, set new goals, and support each other in becoming better riders and better people.", icon: "trending-up" }
  ],
  benefits: [
    { title: "150+ Events/Year", description: "From casual group rides to competitive races" },
    { title: "Expert-Led Training", description: "Professional coaches and ride leaders" },
    { title: "Adventure Trips", description: "Annual cycling trips to stunning destinations" },
    { title: "Community Support", description: "24/7 member support and resources" },
    { title: "Professional Ride Leaders", description: "Certified guides for every skill level" },
    { title: "Member Discounts", description: "Exclusive deals with partner brands" },
    { title: "Social Events", description: "Monthly meetups and celebrations" },
    { title: "Personalized Coaching", description: "One-on-one guidance for your goals" }
  ],
  team_images: [
    { url: "", alt: "Team photo 1" },
    { url: "", alt: "Team photo 2" },
    { url: "", alt: "Team photo 3" },
    { url: "", alt: "Team photo 4" }
  ]
};

const DEFAULT_MEMBERSHIP_CONTENT = {
  hero: {
    heading: "Join Cyblime Cycling",
    subheading: "Choose the plan that matches your riding ambitions",
    stats: [
      { value: "2,500+", label: "Active Members" },
      { value: "4.9/5", label: "Member Rating" },
      { value: "50K+", label: "Miles Ridden" }
    ]
  },
  tiers: [
    {
      name: "Starter",
      price: "29",
      period: "month",
      description: "Perfect for casual riders",
      popular: false,
      features: [
        { name: "Weekly group rides", included: true },
        { name: "Community social events", included: true },
        { name: "Newsletter", included: true },
        { name: "10% partner discounts", included: true },
        { name: "Priority registration", included: false },
        { name: "Adventure trips", included: false },
        { name: "Workshops", included: false },
        { name: "Personalized coaching", included: false }
      ]
    },
    {
      name: "Pro Rider",
      price: "49",
      period: "month",
      savings: "$110/year",
      description: "For serious enthusiasts",
      popular: true,
      features: [
        { name: "All Starter features", included: true },
        { name: "15% partner discounts", included: true },
        { name: "Priority registration", included: true },
        { name: "Adventure trip access", included: true },
        { name: "Workshops & training", included: true },
        { name: "Personalized coaching", included: false }
      ]
    },
    {
      name: "Elite",
      price: "89",
      period: "month",
      savings: "$228/year",
      description: "Complete experience",
      popular: false,
      features: [
        { name: "All Pro features", included: true },
        { name: "20% partner discounts", included: true },
        { name: "Personalized coaching", included: true }
      ]
    }
  ],
  benefits: [
    { title: "150+ Annual Events", description: "From casual group rides to competitive races, there's always something happening." },
    { title: "Scenic Route Library", description: "Access our curated collection of the best cycling routes." },
    { title: "Skill Development", description: "Structured training programs for all levels." },
    { title: "Supportive Community", description: "Connect with like-minded cyclists who share your passion." },
    { title: "Expert Guidance", description: "Learn from experienced ride leaders and coaches." },
    { title: "Safety First", description: "Comprehensive safety protocols and first aid support." }
  ],
  faq: [
    { question: "Can I cancel anytime?", answer: "Yes, you can cancel your membership at any time with no cancellation fees." },
    { question: "Is Cyblime perfect for beginners?", answer: "Absolutely! We have rides and events for all skill levels, from complete beginners to advanced riders." },
    { question: "Do I need expensive gear?", answer: "Not at all. A working bicycle and a helmet are all you need to get started." },
    { question: "How many events per month?", answer: "We typically host 12-15 events per month, including group rides, social events, and training sessions." },
    { question: "Is there a trial period?", answer: "Yes! We offer a 7-day money-back guarantee on all membership plans." }
  ],
  contact_email: "info@cyblimecycling.com"
};

const DEFAULT_EVENTS_CONTENT = {
  hero: {
    heading: "Upcoming Events",
    subheading: "From high-energy group rides to immersive workshops, find the perfect event to elevate your cycling journey."
  },
  cta: {
    heading: "Can't Find What You're Looking For?",
    subheading: "We're always adding new events. Let us know what you'd love to see!",
    button_text: "Suggest an Event",
    contact_email: "events@cyblimecycling.com"
  }
};

const DEFAULT_BLOG_CONTENT = {
  hero: {
    heading: "Cyblime Blog",
    subheading: "Stories, tips, and insights from the cycling community."
  }
};

const DEFAULT_GALLERY_CONTENT = {
  hero: {
    heading: "Gallery",
    subheading: "Explore moments from our rides, events, and community adventures"
  },
  cta: {
    heading: "Share Your Moments",
    subheading: "Tag us in your cycling photos and be featured in our gallery.",
    instagram_handle: "@cyblimecycling"
  }
};

const DEFAULT_CHALLENGES_CONTENT = {
  hero: {
    heading: "Challenges & Leaderboards",
    subheading: "Push your limits, compete with fellow riders, and earn rewards for your achievements."
  }
};

const DEFAULT_CYCLINGHUB_CONTENT = {
  hero: {
    heading: "Cycling Hub",
    subheading: "Your central destination for all things cycling at Cyblime."
  },
  cta: {
    heading: "Ready to Join the Ride?",
    subheading: "Discover new routes, connect with riders, and track your progress.",
    button_text: "View Membership",
    button_link: "Membership"
  }
};

const DEFAULT_ROUTES_CONTENT = {
  hero: {
    heading: "Discover Routes",
    subheading: "Explore, share, and ride the best cycling routes curated by the Cyblime community."
  }
};

const DEFAULT_STRAVA_CONTENT = {
  hero: {
    heading: "Cyblime on Strava",
    subheading: "Track your rides, join group activities, compete in challenges, and connect with the Cyblime community — all through Strava."
  },
  stats: [
    { label: "Active Members", value: "2,500+" },
    { label: "Weekly Rides", value: "15+" },
    { label: "Routes Mapped", value: "500+" },
    { label: "Total Distance", value: "1M+ km" }
  ],
  club_url: "https://www.strava.com/clubs/762372",
  cta: {
    heading: "Ready to Ride?",
    subheading: "Join 2,500+ cyclists on Strava and become part of London's most active cycling community."
  }
};

// Reusable section editor for array items
function ArrayEditor({ items, onChange, renderItem, addLabel, defaultItem }) {
  const handleAdd = () => {
    onChange([...items, { ...defaultItem }]);
  };

  const handleRemove = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleUpdate = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="flex gap-3 items-start p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
          <div className="flex-shrink-0 pt-2">
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex-1 space-y-2">
            {renderItem(item, index, handleUpdate)}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRemove(index)}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={handleAdd}
        className="w-full border-dashed"
      >
        <Plus className="w-4 h-4 mr-2" />
        {addLabel}
      </Button>
    </div>
  );
}

// Reusable image upload field — pick file from computer, uploads to Supabase Storage
function ImageUploadField({ value, onChange, placeholder = "Image URL" }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onChange(file_url);
    } catch (err) {
      alert("Upload failed: " + (err.message || err));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="dark:bg-gray-900 dark:border-white/10 flex-1"
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="flex-shrink-0 gap-1"
        >
          <Upload className="w-4 h-4" />
          {uploading ? "Uploading..." : "Upload"}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange("")}
            className="text-red-500 hover:text-red-600 flex-shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
      {value && (
        <img src={value} alt="Preview" className="h-24 w-auto rounded-lg object-cover border border-gray-200 dark:border-white/10" />
      )}
    </div>
  );
}

function PageEditor({ pageKey, content, onSave, saving }) {
  const [localContent, setLocalContent] = useState(content);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateField = (path, value) => {
    const updated = { ...localContent };
    const keys = path.split(".");
    let obj = updated;
    for (let i = 0; i < keys.length - 1; i++) {
      if (typeof obj[keys[i]] !== "object") obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    setLocalContent(updated);
  };

  const SectionHeader = ({ title, sectionKey, icon: Icon }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-[#c9a227]" />
        <span className="font-semibold text-gray-900 dark:text-white">{title}</span>
      </div>
      {expandedSections[sectionKey] ? (
        <ChevronDown className="w-5 h-5 text-gray-400" />
      ) : (
        <ChevronRight className="w-5 h-5 text-gray-400" />
      )}
    </button>
  );

  if (pageKey === "home") {
    return (
      <div className="space-y-4">
        {/* Hero Slides */}
        <Card className="dark:bg-gray-800/50 dark:border-white/5">
          <SectionHeader title="Hero Slideshow" sectionKey="hero" icon={Image} />
          {expandedSections.hero && (
            <CardContent className="pt-0">
              <ArrayEditor
                items={localContent.hero_slides || []}
                onChange={(slides) => setLocalContent({ ...localContent, hero_slides: slides })}
                addLabel="Add Slide"
                defaultItem={{ heading: "", subheading: "", image_url: "" }}
                renderItem={(item, index, update) => (
                  <>
                    <Input
                      value={item.heading}
                      onChange={(e) => update(index, "heading", e.target.value)}
                      placeholder="Slide heading"
                      className="dark:bg-gray-900 dark:border-white/10"
                    />
                    <Input
                      value={item.subheading}
                      onChange={(e) => update(index, "subheading", e.target.value)}
                      placeholder="Slide subheading"
                      className="dark:bg-gray-900 dark:border-white/10"
                    />
                    <ImageUploadField
                      value={item.image_url}
                      onChange={(url) => update(index, "image_url", url)}
                      placeholder="Background image (upload or paste URL)"
                    />
                  </>
                )}
              />
            </CardContent>
          )}
        </Card>

        {/* Values */}
        <Card className="dark:bg-gray-800/50 dark:border-white/5">
          <SectionHeader title="Club Values" sectionKey="values" icon={Type} />
          {expandedSections.values && (
            <CardContent className="pt-0">
              <ArrayEditor
                items={localContent.values || []}
                onChange={(values) => setLocalContent({ ...localContent, values })}
                addLabel="Add Value"
                defaultItem={{ title: "", description: "", icon: "star" }}
                renderItem={(item, index, update) => (
                  <>
                    <Input
                      value={item.title}
                      onChange={(e) => update(index, "title", e.target.value)}
                      placeholder="Value title"
                      className="dark:bg-gray-900 dark:border-white/10"
                    />
                    <Textarea
                      value={item.description}
                      onChange={(e) => update(index, "description", e.target.value)}
                      placeholder="Value description"
                      rows={2}
                      className="dark:bg-gray-900 dark:border-white/10"
                    />
                  </>
                )}
              />
            </CardContent>
          )}
        </Card>

        {/* Gallery Images */}
        <Card className="dark:bg-gray-800/50 dark:border-white/5">
          <SectionHeader title="Photo Gallery" sectionKey="gallery" icon={Image} />
          {expandedSections.gallery && (
            <CardContent className="pt-0">
              <ArrayEditor
                items={localContent.gallery_images || []}
                onChange={(images) => setLocalContent({ ...localContent, gallery_images: images })}
                addLabel="Add Image"
                defaultItem={{ url: "", alt: "" }}
                renderItem={(item, index, update) => (
                  <>
                    <ImageUploadField
                      value={item.url}
                      onChange={(url) => update(index, "url", url)}
                      placeholder="Upload gallery image"
                    />
                    <Input
                      value={item.alt}
                      onChange={(e) => update(index, "alt", e.target.value)}
                      placeholder="Alt text"
                      className="dark:bg-gray-900 dark:border-white/10"
                    />
                  </>
                )}
              />
            </CardContent>
          )}
        </Card>

        {/* CTA */}
        <Card className="dark:bg-gray-800/50 dark:border-white/5">
          <SectionHeader title="Call to Action" sectionKey="cta" icon={Type} />
          {expandedSections.cta && (
            <CardContent className="pt-0 space-y-3">
              <div>
                <Label className="dark:text-gray-300">Heading</Label>
                <Input
                  value={localContent.cta?.heading || ""}
                  onChange={(e) => updateField("cta.heading", e.target.value)}
                  className="dark:bg-gray-900 dark:border-white/10"
                />
              </div>
              <div>
                <Label className="dark:text-gray-300">Subheading</Label>
                <Input
                  value={localContent.cta?.subheading || ""}
                  onChange={(e) => updateField("cta.subheading", e.target.value)}
                  className="dark:bg-gray-900 dark:border-white/10"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="dark:text-gray-300">Button Text</Label>
                  <Input
                    value={localContent.cta?.button_text || ""}
                    onChange={(e) => updateField("cta.button_text", e.target.value)}
                    className="dark:bg-gray-900 dark:border-white/10"
                  />
                </div>
                <div>
                  <Label className="dark:text-gray-300">Button Link (page name)</Label>
                  <Input
                    value={localContent.cta?.button_link || ""}
                    onChange={(e) => updateField("cta.button_link", e.target.value)}
                    className="dark:bg-gray-900 dark:border-white/10"
                  />
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Settings */}
        <Card className="dark:bg-gray-800/50 dark:border-white/5">
          <CardHeader>
            <CardTitle className="dark:text-white text-base">Page Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="dark:text-gray-300">Instagram Widget ID</Label>
              <Input
                value={localContent.instagram_widget_id || ""}
                onChange={(e) => setLocalContent({ ...localContent, instagram_widget_id: e.target.value })}
                placeholder="Elfsight widget ID"
                className="dark:bg-gray-900 dark:border-white/10"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={localContent.show_instagram ?? true}
                onCheckedChange={(checked) => setLocalContent({ ...localContent, show_instagram: checked })}
              />
              <Label className="dark:text-gray-300">Show Instagram Section</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={localContent.show_recommendations ?? true}
                onCheckedChange={(checked) => setLocalContent({ ...localContent, show_recommendations: checked })}
              />
              <Label className="dark:text-gray-300">Show Personalized Recommendations</Label>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={() => onSave(localContent)}
          disabled={saving}
          className="w-full bg-gradient-to-r from-[#c9a227] to-[#b89123] hover:from-[#b89123] hover:to-[#a78020] text-white"
          size="lg"
        >
          {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Home Page
        </Button>
      </div>
    );
  }

  if (pageKey === "about") {
    return (
      <div className="space-y-4">
        {/* Hero */}
        <Card className="dark:bg-gray-800/50 dark:border-white/5">
          <SectionHeader title="Hero Section" sectionKey="hero" icon={Type} />
          {expandedSections.hero && (
            <CardContent className="pt-0 space-y-3">
              <div>
                <Label className="dark:text-gray-300">Heading</Label>
                <Input
                  value={localContent.hero?.heading || ""}
                  onChange={(e) => updateField("hero.heading", e.target.value)}
                  className="dark:bg-gray-900 dark:border-white/10"
                />
              </div>
              <div>
                <Label className="dark:text-gray-300">Tagline</Label>
                <Textarea
                  value={localContent.hero?.tagline || ""}
                  onChange={(e) => updateField("hero.tagline", e.target.value)}
                  rows={2}
                  className="dark:bg-gray-900 dark:border-white/10"
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Our Story */}
        <Card className="dark:bg-gray-800/50 dark:border-white/5">
          <SectionHeader title="Our Story" sectionKey="story" icon={FileText} />
          {expandedSections.story && (
            <CardContent className="pt-0 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="dark:text-gray-300">Founded Year</Label>
                  <Input
                    value={localContent.story?.founded_year || ""}
                    onChange={(e) => updateField("story.founded_year", e.target.value)}
                    className="dark:bg-gray-900 dark:border-white/10"
                  />
                </div>
                <div>
                  <Label className="dark:text-gray-300">Member Count</Label>
                  <Input
                    value={localContent.story?.member_count || ""}
                    onChange={(e) => updateField("story.member_count", e.target.value)}
                    className="dark:bg-gray-900 dark:border-white/10"
                  />
                </div>
              </div>
              <div>
                <Label className="dark:text-gray-300">Origin Text</Label>
                <Textarea
                  value={localContent.story?.origin_text || ""}
                  onChange={(e) => updateField("story.origin_text", e.target.value)}
                  rows={2}
                  className="dark:bg-gray-900 dark:border-white/10"
                />
              </div>
              <div>
                <Label className="dark:text-gray-300">Full Description</Label>
                <Textarea
                  value={localContent.story?.description || ""}
                  onChange={(e) => updateField("story.description", e.target.value)}
                  rows={3}
                  className="dark:bg-gray-900 dark:border-white/10"
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Values */}
        <Card className="dark:bg-gray-800/50 dark:border-white/5">
          <SectionHeader title="Our Values" sectionKey="values" icon={Type} />
          {expandedSections.values && (
            <CardContent className="pt-0">
              <ArrayEditor
                items={localContent.values || []}
                onChange={(values) => setLocalContent({ ...localContent, values })}
                addLabel="Add Value"
                defaultItem={{ title: "", description: "", icon: "star" }}
                renderItem={(item, index, update) => (
                  <>
                    <Input
                      value={item.title}
                      onChange={(e) => update(index, "title", e.target.value)}
                      placeholder="Value title"
                      className="dark:bg-gray-900 dark:border-white/10"
                    />
                    <Textarea
                      value={item.description}
                      onChange={(e) => update(index, "description", e.target.value)}
                      placeholder="Value description"
                      rows={2}
                      className="dark:bg-gray-900 dark:border-white/10"
                    />
                  </>
                )}
              />
            </CardContent>
          )}
        </Card>

        {/* Benefits */}
        <Card className="dark:bg-gray-800/50 dark:border-white/5">
          <SectionHeader title="Member Benefits" sectionKey="benefits" icon={Check} />
          {expandedSections.benefits && (
            <CardContent className="pt-0">
              <ArrayEditor
                items={localContent.benefits || []}
                onChange={(benefits) => setLocalContent({ ...localContent, benefits })}
                addLabel="Add Benefit"
                defaultItem={{ title: "", description: "" }}
                renderItem={(item, index, update) => (
                  <>
                    <Input
                      value={item.title}
                      onChange={(e) => update(index, "title", e.target.value)}
                      placeholder="Benefit title"
                      className="dark:bg-gray-900 dark:border-white/10"
                    />
                    <Input
                      value={item.description}
                      onChange={(e) => update(index, "description", e.target.value)}
                      placeholder="Benefit description"
                      className="dark:bg-gray-900 dark:border-white/10"
                    />
                  </>
                )}
              />
            </CardContent>
          )}
        </Card>

        {/* Team Images */}
        <Card className="dark:bg-gray-800/50 dark:border-white/5">
          <SectionHeader title="Team Photos" sectionKey="team" icon={Image} />
          {expandedSections.team && (
            <CardContent className="pt-0">
              <ArrayEditor
                items={localContent.team_images || []}
                onChange={(images) => setLocalContent({ ...localContent, team_images: images })}
                addLabel="Add Photo"
                defaultItem={{ url: "", alt: "" }}
                renderItem={(item, index, update) => (
                  <>
                    <ImageUploadField
                      value={item.url}
                      onChange={(url) => update(index, "url", url)}
                      placeholder="Upload team photo"
                    />
                    <Input
                      value={item.alt}
                      onChange={(e) => update(index, "alt", e.target.value)}
                      placeholder="Alt text"
                      className="dark:bg-gray-900 dark:border-white/10"
                    />
                  </>
                )}
              />
            </CardContent>
          )}
        </Card>

        <Button
          onClick={() => onSave(localContent)}
          disabled={saving}
          className="w-full bg-gradient-to-r from-[#c9a227] to-[#b89123] hover:from-[#b89123] hover:to-[#a78020] text-white"
          size="lg"
        >
          {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save About Page
        </Button>
      </div>
    );
  }

  if (pageKey === "membership") {
    return (
      <div className="space-y-4">
        {/* Hero */}
        <Card className="dark:bg-gray-800/50 dark:border-white/5">
          <SectionHeader title="Hero Section" sectionKey="hero" icon={Type} />
          {expandedSections.hero && (
            <CardContent className="pt-0 space-y-3">
              <div>
                <Label className="dark:text-gray-300">Heading</Label>
                <Input
                  value={localContent.hero?.heading || ""}
                  onChange={(e) => updateField("hero.heading", e.target.value)}
                  className="dark:bg-gray-900 dark:border-white/10"
                />
              </div>
              <div>
                <Label className="dark:text-gray-300">Subheading</Label>
                <Input
                  value={localContent.hero?.subheading || ""}
                  onChange={(e) => updateField("hero.subheading", e.target.value)}
                  className="dark:bg-gray-900 dark:border-white/10"
                />
              </div>
              <div>
                <Label className="dark:text-gray-300 mb-2 block">Stats</Label>
                <ArrayEditor
                  items={localContent.hero?.stats || []}
                  onChange={(stats) => updateField("hero.stats", stats)}
                  addLabel="Add Stat"
                  defaultItem={{ value: "", label: "" }}
                  renderItem={(item, index, update) => (
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={item.value}
                        onChange={(e) => update(index, "value", e.target.value)}
                        placeholder="e.g. 2,500+"
                        className="dark:bg-gray-900 dark:border-white/10"
                      />
                      <Input
                        value={item.label}
                        onChange={(e) => update(index, "label", e.target.value)}
                        placeholder="e.g. Active Members"
                        className="dark:bg-gray-900 dark:border-white/10"
                      />
                    </div>
                  )}
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Pricing Tiers */}
        <Card className="dark:bg-gray-800/50 dark:border-white/5">
          <SectionHeader title="Pricing Tiers" sectionKey="tiers" icon={CreditCard} />
          {expandedSections.tiers && (
            <CardContent className="pt-0 space-y-6">
              {(localContent.tiers || []).map((tier, tierIndex) => (
                <div key={tierIndex} className="p-4 rounded-xl border-2 border-gray-200 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-900 dark:text-white">Tier {tierIndex + 1}</h4>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={tier.popular || false}
                        onCheckedChange={(checked) => {
                          const updated = [...localContent.tiers];
                          updated[tierIndex] = { ...updated[tierIndex], popular: checked };
                          setLocalContent({ ...localContent, tiers: updated });
                        }}
                      />
                      <Label className="text-sm dark:text-gray-300">Most Popular</Label>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="dark:text-gray-300">Name</Label>
                      <Input
                        value={tier.name}
                        onChange={(e) => {
                          const updated = [...localContent.tiers];
                          updated[tierIndex] = { ...updated[tierIndex], name: e.target.value };
                          setLocalContent({ ...localContent, tiers: updated });
                        }}
                        className="dark:bg-gray-900 dark:border-white/10"
                      />
                    </div>
                    <div>
                      <Label className="dark:text-gray-300">Price ($/month)</Label>
                      <Input
                        value={tier.price}
                        onChange={(e) => {
                          const updated = [...localContent.tiers];
                          updated[tierIndex] = { ...updated[tierIndex], price: e.target.value };
                          setLocalContent({ ...localContent, tiers: updated });
                        }}
                        className="dark:bg-gray-900 dark:border-white/10"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="dark:text-gray-300">Description</Label>
                      <Input
                        value={tier.description}
                        onChange={(e) => {
                          const updated = [...localContent.tiers];
                          updated[tierIndex] = { ...updated[tierIndex], description: e.target.value };
                          setLocalContent({ ...localContent, tiers: updated });
                        }}
                        className="dark:bg-gray-900 dark:border-white/10"
                      />
                    </div>
                    <div>
                      <Label className="dark:text-gray-300">Savings</Label>
                      <Input
                        value={tier.savings || ""}
                        onChange={(e) => {
                          const updated = [...localContent.tiers];
                          updated[tierIndex] = { ...updated[tierIndex], savings: e.target.value };
                          setLocalContent({ ...localContent, tiers: updated });
                        }}
                        placeholder="e.g. $110/year"
                        className="dark:bg-gray-900 dark:border-white/10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="dark:text-gray-300 mb-2 block">Features</Label>
                    <ArrayEditor
                      items={tier.features || []}
                      onChange={(features) => {
                        const updated = [...localContent.tiers];
                        updated[tierIndex] = { ...updated[tierIndex], features };
                        setLocalContent({ ...localContent, tiers: updated });
                      }}
                      addLabel="Add Feature"
                      defaultItem={{ name: "", included: true }}
                      renderItem={(item, index, update) => (
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={item.included}
                            onCheckedChange={(checked) => update(index, "included", checked)}
                          />
                          <Input
                            value={item.name}
                            onChange={(e) => update(index, "name", e.target.value)}
                            placeholder="Feature name"
                            className="dark:bg-gray-900 dark:border-white/10"
                          />
                        </div>
                      )}
                    />
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  setLocalContent({
                    ...localContent,
                    tiers: [...(localContent.tiers || []), {
                      name: "New Tier",
                      price: "0",
                      period: "month",
                      description: "",
                      popular: false,
                      features: []
                    }]
                  });
                }}
                className="w-full border-dashed"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Pricing Tier
              </Button>
            </CardContent>
          )}
        </Card>

        {/* Benefits */}
        <Card className="dark:bg-gray-800/50 dark:border-white/5">
          <SectionHeader title="Member Benefits" sectionKey="benefits" icon={Check} />
          {expandedSections.benefits && (
            <CardContent className="pt-0">
              <ArrayEditor
                items={localContent.benefits || []}
                onChange={(benefits) => setLocalContent({ ...localContent, benefits })}
                addLabel="Add Benefit"
                defaultItem={{ title: "", description: "" }}
                renderItem={(item, index, update) => (
                  <>
                    <Input
                      value={item.title}
                      onChange={(e) => update(index, "title", e.target.value)}
                      placeholder="Benefit title"
                      className="dark:bg-gray-900 dark:border-white/10"
                    />
                    <Input
                      value={item.description}
                      onChange={(e) => update(index, "description", e.target.value)}
                      placeholder="Benefit description"
                      className="dark:bg-gray-900 dark:border-white/10"
                    />
                  </>
                )}
              />
            </CardContent>
          )}
        </Card>

        {/* FAQ */}
        <Card className="dark:bg-gray-800/50 dark:border-white/5">
          <SectionHeader title="FAQ" sectionKey="faq" icon={AlertCircle} />
          {expandedSections.faq && (
            <CardContent className="pt-0">
              <ArrayEditor
                items={localContent.faq || []}
                onChange={(faq) => setLocalContent({ ...localContent, faq })}
                addLabel="Add FAQ"
                defaultItem={{ question: "", answer: "" }}
                renderItem={(item, index, update) => (
                  <>
                    <Input
                      value={item.question}
                      onChange={(e) => update(index, "question", e.target.value)}
                      placeholder="Question"
                      className="dark:bg-gray-900 dark:border-white/10"
                    />
                    <Textarea
                      value={item.answer}
                      onChange={(e) => update(index, "answer", e.target.value)}
                      placeholder="Answer"
                      rows={2}
                      className="dark:bg-gray-900 dark:border-white/10"
                    />
                  </>
                )}
              />
            </CardContent>
          )}
        </Card>

        {/* Contact */}
        <Card className="dark:bg-gray-800/50 dark:border-white/5">
          <CardHeader>
            <CardTitle className="dark:text-white text-base">Contact Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <Label className="dark:text-gray-300">Contact Email</Label>
            <Input
              value={localContent.contact_email || ""}
              onChange={(e) => setLocalContent({ ...localContent, contact_email: e.target.value })}
              placeholder="info@cyblimecycling.com"
              className="dark:bg-gray-900 dark:border-white/10"
            />
          </CardContent>
        </Card>

        <Button
          onClick={() => onSave(localContent)}
          disabled={saving}
          className="w-full bg-gradient-to-r from-[#c9a227] to-[#b89123] hover:from-[#b89123] hover:to-[#a78020] text-white"
          size="lg"
        >
          {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Membership Page
        </Button>
      </div>
    );
  }

  // === GENERIC SIMPLE PAGE EDITORS ===
  // Events, Blog, Gallery, Challenges, CyclingHub, Routes, Strava

  const simplePages = ["events", "blog", "gallery", "challenges", "cyclinghub", "routes", "strava"];
  if (simplePages.includes(pageKey)) {
    const pageDefaults = {
      events: DEFAULT_EVENTS_CONTENT,
      blog: DEFAULT_BLOG_CONTENT,
      gallery: DEFAULT_GALLERY_CONTENT,
      challenges: DEFAULT_CHALLENGES_CONTENT,
      cyclinghub: DEFAULT_CYCLINGHUB_CONTENT,
      routes: DEFAULT_ROUTES_CONTENT,
      strava: DEFAULT_STRAVA_CONTENT
    };
    const defaults = pageDefaults[pageKey];
    const pageLabel = {
      events: "Events", blog: "Blog", gallery: "Gallery",
      challenges: "Challenges", cyclinghub: "Cycling Hub",
      routes: "Routes", strava: "Strava Club"
    }[pageKey];

    return (
      <div className="space-y-4">
        {/* Hero Section */}
        <Card className="dark:bg-gray-800/50 dark:border-white/5">
          <SectionHeader title="Hero Section" sectionKey="hero" icon={Image} />
          {expandedSections.hero && (
            <CardContent className="pt-0 space-y-4">
              <div>
                <Label className="dark:text-gray-300">Page Heading</Label>
                <Input
                  value={localContent.hero?.heading ?? defaults.hero?.heading ?? ""}
                  onChange={(e) => updateField("hero.heading", e.target.value)}
                  placeholder="Page heading"
                  className="dark:bg-gray-900 dark:border-white/10"
                />
              </div>
              <div>
                <Label className="dark:text-gray-300">Subtitle</Label>
                <Textarea
                  value={localContent.hero?.subheading ?? defaults.hero?.subheading ?? ""}
                  onChange={(e) => updateField("hero.subheading", e.target.value)}
                  placeholder="Page subtitle / description"
                  className="dark:bg-gray-900 dark:border-white/10"
                  rows={3}
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* CTA Section (if page has one) */}
        {(defaults.cta) && (
          <Card className="dark:bg-gray-800/50 dark:border-white/5">
            <SectionHeader title="Call to Action" sectionKey="cta" icon={Type} />
            {expandedSections.cta && (
              <CardContent className="pt-0 space-y-4">
                <div>
                  <Label className="dark:text-gray-300">CTA Heading</Label>
                  <Input
                    value={localContent.cta?.heading ?? defaults.cta?.heading ?? ""}
                    onChange={(e) => updateField("cta.heading", e.target.value)}
                    placeholder="Call to action heading"
                    className="dark:bg-gray-900 dark:border-white/10"
                  />
                </div>
                <div>
                  <Label className="dark:text-gray-300">CTA Subtitle</Label>
                  <Textarea
                    value={localContent.cta?.subheading ?? defaults.cta?.subheading ?? ""}
                    onChange={(e) => updateField("cta.subheading", e.target.value)}
                    placeholder="Call to action description"
                    className="dark:bg-gray-900 dark:border-white/10"
                    rows={2}
                  />
                </div>
                {defaults.cta?.button_text !== undefined && (
                  <div>
                    <Label className="dark:text-gray-300">Button Text</Label>
                    <Input
                      value={localContent.cta?.button_text ?? defaults.cta?.button_text ?? ""}
                      onChange={(e) => updateField("cta.button_text", e.target.value)}
                      placeholder="Button label"
                      className="dark:bg-gray-900 dark:border-white/10"
                    />
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        )}

        {/* Strava-specific: Stats + Club URL */}
        {pageKey === "strava" && (
          <>
            <Card className="dark:bg-gray-800/50 dark:border-white/5">
              <SectionHeader title="Club Stats" sectionKey="stats" icon={FileText} />
              {expandedSections.stats && (
                <CardContent className="pt-0">
                  <ArrayEditor
                    items={localContent.stats || defaults.stats || []}
                    onChange={(stats) => setLocalContent({ ...localContent, stats })}
                    addLabel="Add Stat"
                    defaultItem={{ label: "", value: "" }}
                    renderItem={(item, index, update) => (
                      <>
                        <Input
                          value={item.label}
                          onChange={(e) => update(index, "label", e.target.value)}
                          placeholder="Stat label (e.g. Active Members)"
                          className="dark:bg-gray-900 dark:border-white/10"
                        />
                        <Input
                          value={item.value}
                          onChange={(e) => update(index, "value", e.target.value)}
                          placeholder="Stat value (e.g. 2,500+)"
                          className="dark:bg-gray-900 dark:border-white/10"
                        />
                      </>
                    )}
                  />
                </CardContent>
              )}
            </Card>
            <Card className="dark:bg-gray-800/50 dark:border-white/5">
              <CardHeader>
                <CardTitle className="dark:text-white text-base">Strava Club URL</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  value={localContent.club_url || defaults.club_url || ""}
                  onChange={(e) => setLocalContent({ ...localContent, club_url: e.target.value })}
                  placeholder="https://www.strava.com/clubs/..."
                  className="dark:bg-gray-900 dark:border-white/10"
                />
              </CardContent>
            </Card>
          </>
        )}

        <Button
          onClick={() => onSave(localContent)}
          disabled={saving}
          className="w-full bg-gradient-to-r from-[#c9a227] to-[#b89123] hover:from-[#b89123] hover:to-[#a78020] text-white"
          size="lg"
        >
          {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save {pageLabel} Page
        </Button>
      </div>
    );
  }

  return null;
}

export default function AdminPageContent() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("home");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { data: pageContents = [], isLoading } = useQuery({
    queryKey: ["pageContent"],
    queryFn: () => base44.entities.PageContent.list()
  });

  const getPageContent = (pageKey) => {
    const existing = pageContents.find(p => p.page_key === pageKey);
    if (existing) return existing.content;

    // Return defaults
    const defaults = {
      home: DEFAULT_HOME_CONTENT,
      about: DEFAULT_ABOUT_CONTENT,
      membership: DEFAULT_MEMBERSHIP_CONTENT,
      events: DEFAULT_EVENTS_CONTENT,
      blog: DEFAULT_BLOG_CONTENT,
      gallery: DEFAULT_GALLERY_CONTENT,
      challenges: DEFAULT_CHALLENGES_CONTENT,
      cyclinghub: DEFAULT_CYCLINGHUB_CONTENT,
      routes: DEFAULT_ROUTES_CONTENT,
      strava: DEFAULT_STRAVA_CONTENT
    };
    return defaults[pageKey] || {};
  };

  const handleSave = async (pageKey, content) => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const existing = pageContents.find(p => p.page_key === pageKey);
      if (existing) {
        await base44.entities.PageContent.update(existing.id, {
          content: content,
          updated_date: new Date().toISOString()
        });
      } else {
        await base44.entities.PageContent.create({
          page_key: pageKey,
          page_name: pageKey.charAt(0).toUpperCase() + pageKey.slice(1),
          content: content,
          created_date: new Date().toISOString(),
          updated_date: new Date().toISOString()
        });
      }
      queryClient.invalidateQueries({ queryKey: ["pageContent"] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Page Content</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Edit the content displayed on your website pages</p>
          </div>
          {saveSuccess && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl">
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">Saved successfully!</span>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-6 h-6 animate-spin text-[#c9a227]" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full flex flex-wrap gap-1 mb-6 h-auto p-1">
              {[
                { key: "home", label: "Home", icon: Home },
                { key: "about", label: "About", icon: Info },
                { key: "membership", label: "Membership", icon: CreditCard },
                { key: "events", label: "Events", icon: Calendar },
                { key: "blog", label: "Blog", icon: BookOpen },
                { key: "gallery", label: "Gallery", icon: Camera },
                { key: "challenges", label: "Challenges", icon: Trophy },
                { key: "cyclinghub", label: "Cycling Hub", icon: Compass },
                { key: "routes", label: "Routes", icon: MapPin },
                { key: "strava", label: "Strava", icon: Activity }
              ].map(({ key, label, icon: Icon }) => (
                <TabsTrigger key={key} value={key} className="flex items-center gap-1.5 px-3 py-1.5 text-xs">
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            {["home", "about", "membership", "events", "blog", "gallery", "challenges", "cyclinghub", "routes", "strava"].map((pageKey) => (
              <TabsContent key={pageKey} value={pageKey}>
                <PageEditor
                  pageKey={pageKey}
                  content={getPageContent(pageKey)}
                  onSave={(content) => handleSave(pageKey, content)}
                  saving={saving}
                />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </AdminLayout>
  );
}