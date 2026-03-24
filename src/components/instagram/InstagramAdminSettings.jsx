import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Instagram, Save, RefreshCw, Eye, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function InstagramAdminSettings() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    access_token: "",
    grid_columns: 4,
    theme: "light",
    max_posts: 24,
    enabled: true
  });
  const [settingsId, setSettingsId] = useState(null);
  const [testStatus, setTestStatus] = useState(null);

  const { data: settings } = useQuery({
    queryKey: ['instagramSettings'],
    queryFn: async () => {
      const list = await base44.entities.InstagramSettings.list();
      if (list.length > 0) {
        setFormData(list[0]);
        setSettingsId(list[0].id);
        return list[0];
      }
      return null;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (settingsId) {
        return base44.entities.InstagramSettings.update(settingsId, data);
      } else {
        return base44.entities.InstagramSettings.create(data);
      }
    },
    onSuccess: (result) => {
      if (!settingsId) {
        setSettingsId(result.id);
      }
      queryClient.invalidateQueries({ queryKey: ['instagramSettings'] });
      // Clear cache to force refresh
      localStorage.removeItem('instagram_media_cache');
      localStorage.removeItem('instagram_media_cache_time');
      alert("Settings saved successfully!");
    }
  });

  const testConnection = async () => {
    setTestStatus('testing');
    try {
      const response = await fetch(
        `https://graph.instagram.com/v17.0/me?fields=id,username&access_token=${formData.access_token}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setTestStatus('success');
        alert(`Connected successfully! Account: @${data.username}`);
      } else {
        setTestStatus('error');
        alert('Connection failed. Please check your access token.');
      }
    } catch (error) {
      setTestStatus('error');
      alert('Connection failed. Please check your access token.');
    }
    
    setTimeout(() => setTestStatus(null), 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Instagram className="w-6 h-6 text-[var(--cy-text)]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[var(--cy-text)]">Instagram Gallery Settings</h2>
              <p className="text-[var(--cy-text)]/80 text-sm">Configure your Instagram feed display</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <Label className="text-base font-semibold">Enable Instagram Gallery</Label>
              <p className="text-sm text-[#555555] mt-1">Show Instagram feed on your website</p>
            </div>
            <Switch
              checked={formData.enabled}
              onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
            />
          </div>

          {/* Access Token */}
          <div>
            <Label htmlFor="token">Instagram Access Token *</Label>
            <p className="text-xs text-[#555555] mb-2">
              Get your token from{" "}
              <a
                href="https://developers.facebook.com/docs/instagram-basic-display-api/getting-started"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#c9a227] hover:underline"
              >
                Facebook Developer Console
              </a>
            </p>
            <div className="flex gap-2">
              <Input
                id="token"
                type="password"
                value={formData.access_token}
                onChange={(e) => setFormData({ ...formData, access_token: e.target.value })}
                placeholder="Enter your Instagram Graph API token"
                className="flex-1"
              />
              <Button
                type="button"
                onClick={testConnection}
                disabled={!formData.access_token || testStatus === 'testing'}
                variant="outline"
                className="flex-shrink-0"
              >
                {testStatus === 'testing' && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                {testStatus === 'success' && <CheckCircle className="w-4 h-4 mr-2 text-green-600" />}
                {!testStatus && <Eye className="w-4 h-4 mr-2" />}
                Test
              </Button>
            </div>
          </div>

          {/* Grid Columns */}
          <div>
            <Label htmlFor="columns">Grid Columns</Label>
            <p className="text-xs text-[#555555] mb-2">Number of columns in the gallery grid</p>
            <Select
              value={formData.grid_columns.toString()}
              onValueChange={(value) => setFormData({ ...formData, grid_columns: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 Columns</SelectItem>
                <SelectItem value="4">4 Columns (Recommended)</SelectItem>
                <SelectItem value="5">5 Columns</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Theme */}
          <div>
            <Label htmlFor="theme">Gallery Theme</Label>
            <p className="text-xs text-[#555555] mb-2">Choose light or dark background</p>
            <Select
              value={formData.theme}
              onValueChange={(value) => setFormData({ ...formData, theme: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light Theme</SelectItem>
                <SelectItem value="dark">Dark Theme</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Max Posts */}
          <div>
            <Label htmlFor="maxPosts">Maximum Posts</Label>
            <p className="text-xs text-[#555555] mb-2">Number of posts to display (6-50)</p>
            <Input
              id="maxPosts"
              type="number"
              min="6"
              max="50"
              value={formData.max_posts}
              onChange={(e) => setFormData({ ...formData, max_posts: parseInt(e.target.value) })}
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-semibold text-[#2A2A2A] mb-2 flex items-center gap-2">
              <Instagram className="w-4 h-4 text-blue-600" />
              How to get an Access Token:
            </h4>
            <ol className="text-sm text-[#555555] space-y-1 ml-6 list-decimal">
              <li>Go to Facebook Developers Console</li>
              <li>Create an app with Instagram Basic Display</li>
              <li>Add Instagram test users</li>
              <li>Generate a long-lived access token</li>
              <li>Paste the token above</li>
            </ol>
            <Badge className="mt-3 bg-blue-600 text-[var(--cy-text)] border-0">
              Token expires in 60 days - renew regularly
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={saveMutation.isPending || !formData.access_token}
              className="bg-[#c9a227] hover:bg-[#b89123] text-[var(--cy-text)] flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveMutation.isPending ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}