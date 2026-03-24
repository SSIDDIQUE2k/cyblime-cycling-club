import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Users, Share2, BarChart3 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EventMessaging({ event, isOrganizer }) {
  const [message, setMessage] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  const { data: participants = [] } = useQuery({
    queryKey: ['eventParticipants', event.id],
    queryFn: async () => {
      const rsvps = await base44.entities.EventRSVP.filter({ 
        event_id: event.id,
        status: 'going'
      });
      return rsvps;
    }
  });

  const sendMessageToParticipants = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setSendingEmail(true);
    try {
      const emailPromises = participants.map(participant =>
        base44.integrations.Core.SendEmail({
          to: participant.created_by,
          subject: `Update: ${event.title}`,
          body: `
            <h2>Update for ${event.title}</h2>
            <p>${message}</p>
            <hr/>
            <p><strong>Event Details:</strong></p>
            <p>Date: ${new Date(event.date).toLocaleDateString()}</p>
            <p>Time: ${event.time}</p>
            <p>Location: ${event.location}</p>
          `
        })
      );

      await Promise.all(emailPromises);
      
      toast.success(`Message sent to ${participants.length} participants!`);
      setMessage("");
    } catch (error) {
      toast.error("Failed to send messages");
      console.error(error);
    } finally {
      setSendingEmail(false);
    }
  };

  const shareOnSocial = (platform) => {
    const text = `Join me for ${event.title}!\n${event.description}`;
    const url = window.location.href;

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    };

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  if (!isOrganizer) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Organizer Tools
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Message Participants */}
          <div>
            <label className="text-sm font-semibold mb-2 block">Message Participants</label>
            <Textarea
              placeholder="Send an update to all registered participants..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="mb-2"
            />
            <Button 
              onClick={sendMessageToParticipants}
              disabled={sendingEmail || participants.length === 0}
              className="w-full bg-[#ff6b35] hover:bg-[#e55a2b]"
            >
              <Mail className="w-4 h-4 mr-2" />
              {sendingEmail ? "Sending..." : `Send to ${participants.length} Participants`}
            </Button>
          </div>

          {/* Social Share */}
          <div>
            <label className="text-sm font-semibold mb-2 block">Promote Event</label>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => shareOnSocial('twitter')}
                className="flex-1"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Twitter
              </Button>
              <Button 
                variant="outline" 
                onClick={() => shareOnSocial('facebook')}
                className="flex-1"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Facebook
              </Button>
              <Button 
                variant="outline" 
                onClick={() => shareOnSocial('linkedin')}
                className="flex-1"
              >
                <Share2 className="w-4 h-4 mr-2" />
                LinkedIn
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Event Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-[#ff6b35]">{participants.length}</p>
              <p className="text-sm text-[var(--cy-text-muted)]">Registered</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-[#ff6b35]">
                {event.max_participants ? `${Math.round((participants.length / event.max_participants) * 100)}%` : 'N/A'}
              </p>
              <p className="text-sm text-[var(--cy-text-muted)]">Capacity</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}