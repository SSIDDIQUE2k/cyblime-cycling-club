import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Share2,
  Check,
  Mail
} from "lucide-react";
import { EventMessaging } from "./EventMessaging";
import { awardPoints } from "../gamification/PointsTracker";

export default function EventDetailsDialog({ event, open, onOpenChange }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchUser();
  }, []);

  const { data: rsvps = [] } = useQuery({
    queryKey: ['eventRsvps', event?.id],
    queryFn: async () => {
      if (!event?.id) return [];
      return await base44.entities.EventRSVP.filter({ event_id: String(event.id) });
    },
    enabled: !!event
  });

  const { data: userRsvp } = useQuery({
    queryKey: ['userRsvp', event?.id, user?.email],
    queryFn: async () => {
      if (!event?.id || !user?.email) return null;
      const rsvps = await base44.entities.EventRSVP.filter({ 
        event_id: String(event.id), 
        created_by: user.email 
      });
      return rsvps[0] || null;
    },
    enabled: !!event && !!user
  });

  const rsvpMutation = useMutation({
    mutationFn: async (status) => {
      if (!user) {
        alert('Please log in to RSVP');
        return;
      }
      if (userRsvp) {
        return await base44.entities.EventRSVP.update(userRsvp.id, { status });
      }
      return await base44.entities.EventRSVP.create({
        event_id: String(event.id),
        event_name: event.title,
        event_date: event.dateValue ? event.dateValue.toISOString().split('T')[0] : event.date,
        status
      });
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['eventRsvps'] });
      queryClient.invalidateQueries({ queryKey: ['userRsvp'] });
      alert('RSVP updated!');
      
      if (user && !userRsvp) {
        await awardPoints(user.email, 'EVENT_PARTICIPATION');
      }
    },
    onError: (error) => {
      console.error('RSVP error:', error);
      alert('Failed to update RSVP');
    }
  });

  const sendReminderMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        alert('Please log in to send reminders');
        return;
      }
      return await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: `Reminder: ${event.title}`,
        body: `Don't forget! You're registered for ${event.title} on ${event.date}. Location: ${event.location}`
      });
    },
    onSuccess: () => {
      alert('Reminder sent to your email!');
    },
    onError: (error) => {
      console.error('Email error:', error);
      alert('Failed to send reminder');
    }
  });

  const handleShare = async () => {
    const shareData = {
      title: event.title,
      text: `Join me at ${event.title} - ${event.date}`,
      url: window.location.href
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleCalendarExport = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
DTSTART:${event.dateValue.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${event.dateValue.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
END:VEVENT
END:VCALENDAR`;
    
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/\s+/g, '-')}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const sendConfirmationEmail = async () => {
    if (!user) {
      alert('Please log in to send confirmation');
      return;
    }
    try {
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: `Registration Confirmed: ${event.title}`,
        body: `Thank you for registering for ${event.title}!\n\nDate: ${event.date}\nTime: ${event.time}\nLocation: ${event.location}\n\nWe look forward to seeing you there!\n\n- Cymblime Team`
      });
      alert('Confirmation email sent!');
    } catch (error) {
      console.error('Email error:', error);
      alert('Failed to send confirmation email');
    }
  };

  if (!event) return null;

  const goingCount = rsvps.filter(r => r.status === 'going').length;
  const maybeCount = rsvps.filter(r => r.status === 'maybe').length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[var(--cy-text)]">{event.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Calendar className="w-5 h-5 text-[#6BCBFF]" />
              <div>
                <div className="text-xs text-[var(--cy-text-muted)]">Date</div>
                <div className="font-semibold text-[var(--cy-text)]">{event.date}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Clock className="w-5 h-5 text-[#6BCBFF]" />
              <div>
                <div className="text-xs text-[var(--cy-text-muted)]">Time</div>
                <div className="font-semibold text-[var(--cy-text)]">{event.time}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl col-span-2">
              <MapPin className="w-5 h-5 text-[#6BCBFF]" />
              <div>
                <div className="text-xs text-[var(--cy-text-muted)]">Location</div>
                <div className="font-semibold text-[var(--cy-text)]">{event.location}</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-[var(--cy-text)] mb-2">About</h3>
            <p className="text-[var(--cy-text-muted)]">{event.description}</p>
          </div>

          {/* RSVP Button */}
          <div>
            <Button
              onClick={() => rsvpMutation.mutate('going')}
              className={`w-full ${userRsvp?.status === 'going' ? 'bg-[#A4FF4F] text-[var(--cy-text)] font-bold' : 'bg-[#ff6b35] hover:bg-[#e55a2b] text-white'}`}
            >
              <Check className="w-4 h-4 mr-2" />
              {userRsvp?.status === 'going' ? `Going (${goingCount})` : 'RSVP Going'}
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => sendReminderMutation.mutate()}
              variant="outline"
              disabled={!userRsvp}
            >
              <Mail className="w-4 h-4 mr-2" />
              Reminder
            </Button>
            <Button
              onClick={handleShare}
              variant="outline"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              onClick={handleCalendarExport}
              variant="outline"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={sendConfirmationEmail}
              variant="outline"
              disabled={!userRsvp}
            >
              <Mail className="w-4 h-4 mr-2" />
              Confirm
            </Button>
          </div>

          {/* Attendee List */}
          <div>
            <h3 className="font-semibold text-[var(--cy-text)] mb-3 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Attendees ({goingCount})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {rsvps.filter(r => r.status === 'going').slice(0, 9).map((rsvp) => (
                <div key={rsvp.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-[#ff6b35] flex items-center justify-center text-white text-sm font-semibold">
                    {rsvp.created_by.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-[var(--cy-text-muted)] truncate">{rsvp.created_by.split('@')[0]}</span>
                </div>
              ))}
            </div>
            {goingCount > 9 && (
              <p className="text-sm text-[var(--cy-text-muted)] mt-2">+ {goingCount - 9} more</p>
            )}
          </div>

          {/* Event Organizer Tools */}
          {user && event.organizer_email === user.email && (
            <div className="mt-6">
              <EventMessaging event={event} isOrganizer={true} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}