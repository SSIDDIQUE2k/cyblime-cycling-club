import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Upload,
  X,
  Bike,
  Mountain,
  Wrench,
  Coffee,
  Trophy
} from "lucide-react";
import { awardPoints } from "../components/gamification/PointsTracker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

export default function MyEvents() {
  const [user, setUser] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "ride",
    date: "",
    time: "",
    location: "",
    level: "All Levels",
    distance: "",
    max_participants: 50,
    banner_image_url: ""
  });

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.log("Not authenticated");
      }
    };
    fetchUser();
  }, []);

  const { data: myEvents = [], isLoading } = useQuery({
    queryKey: ['myEvents', user?.email],
    queryFn: () => base44.entities.Event.filter({ created_by: user.email }),
    enabled: !!user
  });

  const createEventMutation = useMutation({
    mutationFn: (eventData) => base44.entities.Event.create({
      ...eventData,
      organizer_email: user.email,
      organizer_name: user.full_name || user.email?.split('@')[0] || "User"
    }),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['myEvents'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setCreateDialogOpen(false);
      resetForm();
      
      if (user) {
        await awardPoints(user.email, 'EVENT_CREATION');
      }
    },
    onError: (err) => alert("Failed to create event: " + (err?.message || "Please try again."))
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Event.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myEvents'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setEditingEvent(null);
      setCreateDialogOpen(false);
      resetForm();
    },
    onError: (err) => alert("Failed to update event: " + (err?.message || "Please try again."))
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id) => base44.entities.Event.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myEvents'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (err) => alert("Failed to delete event: " + (err?.message || "Please try again."))
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, banner_image_url: result.file_url });
      setBannerFile(file);
    } catch (error) {
      console.error("Upload failed:", error);
    }
    setUploadingImage(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingEvent) {
      updateEventMutation.mutate({ id: editingEvent.id, data: formData });
    } else {
      createEventMutation.mutate(formData);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      type: event.type,
      date: event.date,
      time: event.time,
      location: event.location,
      level: event.level,
      distance: event.distance || "",
      max_participants: event.max_participants || 50,
      banner_image_url: event.banner_image_url || ""
    });
    setCreateDialogOpen(true);
  };

  const handleDelete = (eventId) => {
    if (confirm("Are you sure you want to delete this event?")) {
      deleteEventMutation.mutate(eventId);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "ride",
      date: "",
      time: "",
      location: "",
      level: "All Levels",
      distance: "",
      max_participants: 50,
      banner_image_url: ""
    });
    setBannerFile(null);
    setEditingEvent(null);
  };

  const iconMap = {
    ride: Bike,
    trip: Mountain,
    workshop: Wrench,
    social: Coffee,
    race: Trophy
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--cy-bg)] flex items-center justify-center">
        <p className="text-[var(--cy-text-muted)]">Please sign in to manage your events</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--cy-bg)]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[var(--cy-gradient-from)] to-[var(--cy-gradient-to)] py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold text-[var(--cy-text)] mb-4">My Events</h1>
            <p className="text-xl text-[var(--cy-text-muted)] mb-8">
              Create and manage your cycling events
            </p>
            <Button
              onClick={() => {
                resetForm();
                setCreateDialogOpen(true);
              }}
              className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white rounded-full px-8 py-6 text-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Event
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Events List */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {isLoading ? (
            <div className="text-center py-20">
              <p className="text-[var(--cy-text-muted)]">Loading your events...</p>
            </div>
          ) : myEvents.length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="w-16 h-16 text-[var(--cy-text-secondary)] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[var(--cy-text)] mb-2">No events yet</h3>
              <p className="text-[var(--cy-text-muted)] mb-6">Create your first event to get started!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myEvents.map((event, index) => {
                const Icon = iconMap[event.type] || Bike;
                const isFull = event.current_participants >= event.max_participants;
                
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden hover:shadow-lg hover:shadow-black/30 transition-all">
                      {event.banner_image_url && (
                        <div className="h-48 overflow-hidden">
                          <img
                            src={event.banner_image_url}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 rounded-xl bg-[#A4FF4F]/10 flex items-center justify-center">
                            <Icon className="w-6 h-6 text-[var(--cy-text)]" />
                          </div>
                          <div className="flex gap-2">
                            <Badge className={event.status === 'published' ? 'bg-green-500 text-[var(--cy-text)] border-0' : 'bg-gray-400 text-[var(--cy-text)] border-0'}>
                              {event.status}
                            </Badge>
                            {isFull && (
                              <Badge className="bg-red-500 text-[var(--cy-text)] border-0">Full</Badge>
                            )}
                          </div>
                        </div>

                        <h3 className="text-xl font-bold text-[var(--cy-text)] mb-2">{event.title}</h3>
                        <p className="text-sm text-[var(--cy-text-muted)] mb-4 line-clamp-2">{event.description}</p>

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

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEdit(event)}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDelete(event.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Create/Edit Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={(open) => {
        setCreateDialogOpen(open);
        if (!open) {
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Banner Image Upload */}
            <div>
              <Label>Event Banner (Optional)</Label>
              <div className="mt-2">
                {formData.banner_image_url ? (
                  <div className="relative">
                    <img
                      src={formData.banner_image_url}
                      alt="Banner preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData({ ...formData, banner_image_url: "" })}
                      className="absolute top-2 right-2 bg-[var(--cy-bg-card)]/90 hover:bg-[var(--cy-bg-card)]"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <Upload className="w-8 h-8 text-[var(--cy-text-muted)] mb-2" />
                    <span className="text-sm text-[var(--cy-text-muted)]">Click to upload banner image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Saturday Morning Group Ride"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your event..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Event Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ride">Group Ride</SelectItem>
                    <SelectItem value="trip">Adventure Trip</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="social">Social Event</SelectItem>
                    <SelectItem value="race">Race/Competition</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="level">Skill Level *</Label>
                <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="All Levels">All Levels</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Central Park Meeting Point"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="distance">Distance (Optional)</Label>
                <Input
                  id="distance"
                  value={formData.distance}
                  onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                  placeholder="e.g., 30km"
                />
              </div>

              <div>
                <Label htmlFor="max_participants">Max Participants *</Label>
                <Input
                  id="max_participants"
                  type="number"
                  min="1"
                  value={formData.max_participants}
                  onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCreateDialogOpen(false);
                  resetForm();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createEventMutation.isPending || updateEventMutation.isPending || uploadingImage}
                className="flex-1 bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
              >
                {editingEvent ? 'Update Event' : 'Create Event'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}