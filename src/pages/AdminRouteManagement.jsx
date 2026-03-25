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

export default function AdminRouteManagement() {
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    distance: "",
    elevation_gain: "",
    difficulty: "Moderate",
    surface_type: "Paved",
    start_location: "",
    end_location: "",
    map_image_url: "",
    video_url: "",
    gpx_file_url: "",
    estimated_time: "",
    is_public: true
  });

  const { data: routes = [] } = useQuery({
    queryKey: ['adminRoutes'],
    queryFn: () => base44.entities.Route.list('-created_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Route.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRoutes'] });
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      setEditDialogOpen(false);
      resetForm();
    },
    onError: (err) => alert("Failed to create route: " + err.message)
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Route.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRoutes'] });
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      setEditDialogOpen(false);
      resetForm();
    },
    onError: (err) => alert("Failed to update route: " + err.message)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Route.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRoutes'] });
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
    onError: (err) => alert("Failed to delete route: " + err.message)
  });

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this route?")) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      distance: "",
      elevation_gain: "",
      difficulty: "Moderate",
      surface_type: "Paved",
      start_location: "",
      end_location: "",
      map_image_url: "",
      video_url: "",
      gpx_file_url: "",
      estimated_time: "",
      is_public: true
    });
    setEditingRoute(null);
  };

  const handleEdit = (route) => {
    setEditingRoute(route);
    setFormData(route);
    setEditDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      distance: parseFloat(formData.distance) || 0,
      elevation_gain: parseFloat(formData.elevation_gain) || 0,
      estimated_time: parseFloat(formData.estimated_time) || 0,
    };

    if (editingRoute) {
      updateMutation.mutate({ id: editingRoute.id, data });
    } else {
      // Only set defaults on create
      data.rating = 5.0;
      data.total_rides = 0;
      createMutation.mutate(data);
    }
  };

  const handleImageUpload = async (e, type = 'map') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      if (type === 'map') {
        setFormData({ ...formData, map_image_url: file_url });
      } else if (type === 'gpx') {
        setFormData({ ...formData, gpx_file_url: file_url });
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("File upload failed. Please try again.");
    }
    setUploadingImage(false);
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Routes</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage cycling routes</p>
        </div>

        <Card className="admin-card dark:bg-gray-800/50 dark:border-white/5">
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
            <CardTitle className="dark:text-white">All Routes</CardTitle>
            <Button
              onClick={() => {
                resetForm();
                setEditDialogOpen(true);
              }}
              className="bg-[#c9a227] hover:bg-[#b89123] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Route
            </Button>
          </CardHeader>
        </Card>

        <div className="grid gap-4">
          {routes.map((route, index) => (
            <motion.div
              key={route.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="admin-card dark:bg-gray-800/50 dark:border-white/5 hover:shadow-lg transition-all">
                <CardContent className="px-3 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{route.name}</h3>
                        <Badge className="bg-[#c9a227] text-white border-0">{route.difficulty}</Badge>
                        <Badge variant="outline" className="dark:border-white/10 dark:text-gray-400">
                          {route.surface_type}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {route.distance}km • {route.elevation_gain}m elevation
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(route)} className="dark:bg-white/5 dark:border-white/10">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(route.id)} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
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
          <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRoute ? 'Edit Route' : 'Create Route'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Route Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                  />
                </div>

                <div className="col-span-2">
                  <Label>Map Image / Hero Photo</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'map')}
                    disabled={uploadingImage}
                  />
                  {formData.map_image_url && (
                    <img src={formData.map_image_url} alt="Map" className="mt-2 h-32 rounded-lg" />
                  )}
                </div>

                <div className="col-span-2">
                  <Label>Video URL (Optional)</Label>
                  <Input
                    value={formData.video_url}
                    onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                    placeholder="YouTube or Vimeo embed URL"
                  />
                </div>

                <div className="col-span-2">
                  <Label>GPX File</Label>
                  <Input
                    type="file"
                    accept=".gpx"
                    onChange={(e) => handleImageUpload(e, 'gpx')}
                    disabled={uploadingImage}
                  />
                </div>

                <div>
                  <Label>Distance (km)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.distance}
                    onChange={(e) => setFormData({...formData, distance: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label>Elevation Gain (m)</Label>
                  <Input
                    type="number"
                    value={formData.elevation_gain}
                    onChange={(e) => setFormData({...formData, elevation_gain: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label>Difficulty</Label>
                  <Select value={formData.difficulty} onValueChange={(val) => setFormData({...formData, difficulty: val})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Moderate">Moderate</SelectItem>
                      <SelectItem value="Challenging">Challenging</SelectItem>
                      <SelectItem value="Expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Surface Type</Label>
                  <Select value={formData.surface_type} onValueChange={(val) => setFormData({...formData, surface_type: val})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Paved">Paved</SelectItem>
                      <SelectItem value="Gravel">Gravel</SelectItem>
                      <SelectItem value="Mixed">Mixed</SelectItem>
                      <SelectItem value="Mountain Trail">Mountain Trail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Start Location</Label>
                  <Input
                    value={formData.start_location}
                    onChange={(e) => setFormData({...formData, start_location: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label>End Location</Label>
                  <Input
                    value={formData.end_location}
                    onChange={(e) => setFormData({...formData, end_location: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Estimated Time (hours)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={formData.estimated_time}
                    onChange={(e) => setFormData({...formData, estimated_time: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#c9a227] hover:bg-[#b89123] text-white">
                  {editingRoute ? 'Update' : 'Create'} Route
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}