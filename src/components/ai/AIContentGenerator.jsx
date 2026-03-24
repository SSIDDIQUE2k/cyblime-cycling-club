import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function AIBlogGenerator({ open, onOpenChange, onGenerate }) {
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);

  const generateBlog = async () => {
    if (!topic) return;
    
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a cycling blog post about: ${topic}. Keywords: ${keywords}. Include a catchy title, engaging content (500-800 words), and a short excerpt (2-3 sentences). Format as JSON with keys: title, content, excerpt, tags (array of 3-5 relevant tags).`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            content: { type: "string" },
            excerpt: { type: "string" },
            tags: { type: "array", items: { type: "string" } }
          }
        }
      });
      
      onGenerate(result);
      onOpenChange(false);
      setTopic("");
      setKeywords("");
    } catch (error) {
      console.error("AI generation error:", error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#ff6b35]" />
            AI Blog Generator
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Topic</label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Best climbing techniques for beginners"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Keywords (optional)</label>
            <Input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g., climbing, training, endurance"
            />
          </div>
          <Button
            onClick={generateBlog}
            disabled={loading || !topic}
            className="w-full bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Blog Post
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export async function generateRouteDescription(routeData) {
  try {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate an engaging description for a cycling route with these details: Distance: ${routeData.distance}km, Elevation: ${routeData.elevation_gain}m, Difficulty: ${routeData.difficulty}, Surface: ${routeData.surface_type}, Start: ${routeData.start_location}. Make it 2-3 sentences, highlighting key features.`
    });
    return result;
  } catch (error) {
    console.error("AI error:", error);
    return "";
  }
}

export async function suggestForumCategory(postContent) {
  try {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Based on this forum post content, suggest the most appropriate category from: general, routes, gear, training, maintenance, events. Post: "${postContent}". Return only the category name.`
    });
    return result.toLowerCase();
  } catch (error) {
    return "general";
  }
}

export async function generateForumReply(postContent, context) {
  try {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a helpful, friendly reply to this cycling forum post: "${postContent}". Context: ${context}. Keep it conversational and supportive, 2-3 sentences.`
    });
    return result;
  } catch (error) {
    return "";
  }
}