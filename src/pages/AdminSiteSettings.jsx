import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "../components/admin/AdminLayout";
import {
  Save,
  Globe,
  Mail,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Palette,
  Check,
  RefreshCw,
  ExternalLink,
  Shield
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const DEFAULT_SETTINGS = {
  // Branding
  site_name: "Cyblime Cycling",
  tagline: "Ride Together, Grow Together",
  logo_url: "",
  favicon_url: "",

  // Contact
  contact_email: "info@cyblimecycling.com",
  contact_phone: "",
  contact_address: "",

  // Social Media
  social_facebook: "",
  social_instagram: "",
  social_twitter: "",
  social_youtube: "",
  social_strava: "https://www.strava.com/clubs/762372",

  // Theme Colors
  primary_color: "#c9a227",
  secondary_color: "#ff6b35",
  accent_color: "#b89123",

  // SEO
  meta_title: "Cyblime Cycling Club",
  meta_description: "Join Cyblime Cycling - the ultimate cycling community. Group rides, events, routes, and more.",

  // Footer
  footer_text: "Ride Together, Grow Together",
  show_newsletter_signup: true,

  // Maintenance
  maintenance_mode: false,
  maintenance_message: "We're making some improvements. Check back soon!"
};

export default function AdminSiteSettings() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { data: siteSettings = [], isLoading } = useQuery({
    queryKey: ["siteSettings"],
    queryFn: () => base44.entities.SiteSettings.list()
  });

  useEffect(() => {
    if (siteSettings.length > 0) {
      // Merge saved settings with defaults
      const saved = siteSettings[0].settings || {};
      setSettings(prev => ({ ...prev, ...saved }));
    }
  }, [siteSettings]);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      if (siteSettings.length > 0) {
        await base44.entities.SiteSettings.update(siteSettings[0].id, {
          settings: settings,
          updated_date: new Date().toISOString()
        });
      } else {
        await base44.entities.SiteSettings.create({
          settings_key: "global",
          settings: settings,
          created_date: new Date().toISOString(),
          updated_date: new Date().toISOString()
        });
      }
      queryClient.invalidateQueries({ queryKey: ["siteSettings"] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-6 h-6 animate-spin text-[#c9a227]" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Site Settings</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Configure global settings for your website</p>
          </div>
          <div className="flex items-center gap-3">
            {saveSuccess && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">Saved!</span>
              </div>
            )}
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-[#c9a227] to-[#b89123] hover:from-[#b89123] hover:to-[#a78020] text-white"
            >
              {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Settings
            </Button>
          </div>
        </div>

        {/* Branding */}
        <Card className="dark:bg-gray-800/50 dark:border-white/5">
          <CardHeader>
            <CardTitle className="dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#c9a227]" />
              Branding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="dark:text-gray-300">Site Name</Label>
                <Input
                  value={settings.site_name}
                  onChange={(e) => updateSetting("site_name", e.target.value)}
                  className="dark:bg-gray-900 dark:border-white/10"
                />
              </div>
              <div>
                <Label className="dark:text-gray-300">Tagline</Label>
                <Input
                  value={settings.tagline}
                  onChange={(e) => updateSetting("tagline", e.target.value)}
                  className="dark:bg-gray-900 dark:border-white/10"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="dark:text-gray-300">Logo URL</Label>
                <Input
                  value={settings.logo_url}
                  onChange={(e) => updateSetting("logo_url", e.target.value)}
                  placeholder="https://..."
                  className="dark:bg-gray-900 dark:border-white/10"
                />
              </div>
              <div>
                <Label className="dark:text-gray-300">Favicon URL</Label>
                <Input
                  value={settings.favicon_url}
                  onChange={(e) => updateSetting("favicon_url", e.target.value)}
                  placeholder="https://..."
                  className="dark:bg-gray-900 dark:border-white/10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="dark:bg-gray-800/50 dark:border-white/5">
          <CardHeader>
            <CardTitle className="dark:text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#c9a227]" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="dark:text-gray-300">Email</Label>
              <Input
                value={settings.contact_email}
                onChange={(e) => updateSetting("contact_email", e.target.value)}
                type="email"
                className="dark:bg-gray-900 dark:border-white/10"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="dark:text-gray-300">Phone</Label>
                <Input
                  value={settings.contact_phone}
                  onChange={(e) => updateSetting("contact_phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="dark:bg-gray-900 dark:border-white/10"
                />
              </div>
              <div>
                <Label className="dark:text-gray-300">Address</Label>
                <Input
                  value={settings.contact_address}
                  onChange={(e) => updateSetting("contact_address", e.target.value)}
                  placeholder="City, State"
                  className="dark:bg-gray-900 dark:border-white/10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card className="dark:bg-gray-800/50 dark:border-white/5">
          <CardHeader>
            <CardTitle className="dark:text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#c9a227]" />
              Social Media Links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Facebook className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <Input
                value={settings.social_facebook}
                onChange={(e) => updateSetting("social_facebook", e.target.value)}
                placeholder="https://facebook.com/..."
                className="dark:bg-gray-900 dark:border-white/10"
              />
            </div>
            <div className="flex items-center gap-3">
              <Instagram className="w-5 h-5 text-pink-500 flex-shrink-0" />
              <Input
                value={settings.social_instagram}
                onChange={(e) => updateSetting("social_instagram", e.target.value)}
                placeholder="https://instagram.com/..."
                className="dark:bg-gray-900 dark:border-white/10"
              />
            </div>
            <div className="flex items-center gap-3">
              <Twitter className="w-5 h-5 text-sky-500 flex-shrink-0" />
              <Input
                value={settings.social_twitter}
                onChange={(e) => updateSetting("social_twitter", e.target.value)}
                placeholder="https://twitter.com/..."
                className="dark:bg-gray-900 dark:border-white/10"
              />
            </div>
            <div className="flex items-center gap-3">
              <Youtube className="w-5 h-5 text-red-500 flex-shrink-0" />
              <Input
                value={settings.social_youtube}
                onChange={(e) => updateSetting("social_youtube", e.target.value)}
                placeholder="https://youtube.com/..."
                className="dark:bg-gray-900 dark:border-white/10"
              />
            </div>
            <div className="flex items-center gap-3">
              <ExternalLink className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <Input
                value={settings.social_strava}
                onChange={(e) => updateSetting("social_strava", e.target.value)}
                placeholder="https://strava.com/clubs/..."
                className="dark:bg-gray-900 dark:border-white/10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Theme Colors */}
        <Card className="dark:bg-gray-800/50 dark:border-white/5">
          <CardHeader>
            <CardTitle className="dark:text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-[#c9a227]" />
              Theme Colors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="dark:text-gray-300">Primary Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={settings.primary_color}
                    onChange={(e) => updateSetting("primary_color", e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border-0"
                  />
                  <Input
                    value={settings.primary_color}
                    onChange={(e) => updateSetting("primary_color", e.target.value)}
                    className="dark:bg-gray-900 dark:border-white/10"
                  />
                </div>
              </div>
              <div>
                <Label className="dark:text-gray-300">Secondary Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={settings.secondary_color}
                    onChange={(e) => updateSetting("secondary_color", e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border-0"
                  />
                  <Input
                    value={settings.secondary_color}
                    onChange={(e) => updateSetting("secondary_color", e.target.value)}
                    className="dark:bg-gray-900 dark:border-white/10"
                  />
                </div>
              </div>
              <div>
                <Label className="dark:text-gray-300">Accent Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={settings.accent_color}
                    onChange={(e) => updateSetting("accent_color", e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border-0"
                  />
                  <Input
                    value={settings.accent_color}
                    onChange={(e) => updateSetting("accent_color", e.target.value)}
                    className="dark:bg-gray-900 dark:border-white/10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SEO */}
        <Card className="dark:bg-gray-800/50 dark:border-white/5">
          <CardHeader>
            <CardTitle className="dark:text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#c9a227]" />
              SEO & Meta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="dark:text-gray-300">Meta Title</Label>
              <Input
                value={settings.meta_title}
                onChange={(e) => updateSetting("meta_title", e.target.value)}
                className="dark:bg-gray-900 dark:border-white/10"
              />
            </div>
            <div>
              <Label className="dark:text-gray-300">Meta Description</Label>
              <Textarea
                value={settings.meta_description}
                onChange={(e) => updateSetting("meta_description", e.target.value)}
                rows={3}
                className="dark:bg-gray-900 dark:border-white/10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <Card className="dark:bg-gray-800/50 dark:border-white/5">
          <CardHeader>
            <CardTitle className="dark:text-white">Footer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="dark:text-gray-300">Footer Text</Label>
              <Input
                value={settings.footer_text}
                onChange={(e) => updateSetting("footer_text", e.target.value)}
                className="dark:bg-gray-900 dark:border-white/10"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={settings.show_newsletter_signup}
                onCheckedChange={(checked) => updateSetting("show_newsletter_signup", checked)}
              />
              <Label className="dark:text-gray-300">Show Newsletter Signup</Label>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Mode */}
        <Card className="dark:bg-gray-800/50 dark:border-white/5 border-red-200 dark:border-red-900/30">
          <CardHeader>
            <CardTitle className="dark:text-white text-red-600 dark:text-red-400">Maintenance Mode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Switch
                checked={settings.maintenance_mode}
                onCheckedChange={(checked) => updateSetting("maintenance_mode", checked)}
              />
              <Label className="dark:text-gray-300">Enable Maintenance Mode</Label>
            </div>
            {settings.maintenance_mode && (
              <div>
                <Label className="dark:text-gray-300">Maintenance Message</Label>
                <Textarea
                  value={settings.maintenance_message}
                  onChange={(e) => updateSetting("maintenance_message", e.target.value)}
                  rows={2}
                  className="dark:bg-gray-900 dark:border-white/10"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-[#c9a227] to-[#b89123] hover:from-[#b89123] hover:to-[#a78020] text-white"
          size="lg"
        >
          {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save All Settings
        </Button>
      </div>
    </AdminLayout>
  );
}