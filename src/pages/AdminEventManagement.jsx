import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "../components/admin/AdminLayout";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";

export default function AdminEventManagement() {
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
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
    price: 0,
    status: "published"
  });

  const { data: events = [] } = useQuery({
    queryKey: ['adminEvents'],
    queryFn: () => base44.entities.Event.list('-created_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Event.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminEvents'] });
      setEditDialogOpen(false);
      resetForm();
    },
    onError: (err) => alert("Failed to create event: " + err.message)
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Event.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminEvents'] });
      setEditDialogOpen(false);
      resetForm();
    },
    onError: (err) => alert("Failed to update event: " + err.message)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Event.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminEvents'] });
    },
    onError: (err) => alert("Failed to delete event: " + err.message)
  });

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      deleteMutation.mutate(id);
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
      price: 0,
      status: "published"
    });
    setEditingEvent(null);
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData(event);
    setEditDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Events</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage club events and activities</p>
        </div>

        <Card className="admin-card dark:bg-gray-800/50 dark:border-white/5">
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
            <CardTitle className="dark:text-white">All Events</CardTitle>
            <Button
              onClick={() => {
                resetForm();
                setEditDialogOpen(true);
              }}
              className="bg-[#c9a227] hover:bg-[#b89123] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </CardHeader>
        </Card>

        <div className="grid gap-4">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="admin-card dark:bg-gray-800/50 dark:border-white/5 hover:shadow-lg transition-all">
                <CardContent className="px-3 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                        <Badge className={event.status === 'published' ? 'bg-green-500 text-white border-0' : 'bg-gray-400 text-white border-0'}>
                          {event.status}
                        </Badge>
                        <Badge variant="outline" className="dark:border-white/10 dark:text-gray-400">
                          {event.type}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {event.date} • {event.location}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(event)} className="dark:bg-white/5 dark:border-white/10">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(event.id)} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEvent ? 'Edit Event' : 'Create Event'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    required
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ride">Group Ride</SelectItem>
                      <SelectItem value="trip">Adventure Trip</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="social">Social Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Level</Label>
                  <Select value={formData.level} onValueChange={(val) => setFormData({...formData, level: val})}>
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
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>Time</Label>
                  <Input
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    placeholder="e.g., 7:00 AM - 10:00 AM"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label>Location</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>Distance</Label>
                  <Input
                    value={formData.distance}
                    onChange={(e) => setFormData({...formData, distance: e.target.value})}
                    placeholder="e.g., 30km"
                  />
                </div>
                <div>
                  <Label>Max Participants</Label>
                  <Input
                    type="number"
                    value={formData.max_participants}
                    onChange={(e) => setFormData({...formData, max_participants: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Price ($)</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#c9a227] hover:bg-[#b89123] text-white">
                  {editingEvent ? 'Update' : 'Create'} Event
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}