import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "../components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trophy, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";

export default function AdminChallengeManagement() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "weekly",
    start_date: "",
    end_date: "",
    goal_metric: "distance",
    goal_value: 0,
    reward_points: 100,
    active: true
  });

  const queryClient = useQueryClient();

  const { data: challenges = [] } = useQuery({
    queryKey: ['adminChallenges'],
    queryFn: () => base44.entities.Challenge.list('-start_date')
  });

  const createChallengeMutation = useMutation({
    mutationFn: (data) => base44.entities.Challenge.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminChallenges'] });
      toast.success("Challenge created!");
      resetForm();
    },
    onError: (err) => alert("Failed to create challenge: " + err.message)
  });

  const updateChallengeMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Challenge.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminChallenges'] });
      toast.success("Challenge updated!");
      resetForm();
    },
    onError: (err) => alert("Failed to update challenge: " + err.message)
  });

  const deleteChallengeMutation = useMutation({
    mutationFn: (id) => base44.entities.Challenge.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminChallenges'] });
      toast.success("Challenge deleted!");
    },
    onError: (err) => alert("Failed to delete challenge: " + err.message)
  });

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this challenge?")) {
      deleteChallengeMutation.mutate(id);
    }
  };

  const handleSubmit = () => {
    if (editingChallenge) {
      updateChallengeMutation.mutate({ id: editingChallenge.id, data: formData });
    } else {
      createChallengeMutation.mutate(formData);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "weekly",
      start_date: "",
      end_date: "",
      goal_metric: "distance",
      goal_value: 0,
      reward_points: 100,
      active: true
    });
    setEditingChallenge(null);
    setDialogOpen(false);
  };

  const handleEdit = (challenge) => {
    setEditingChallenge(challenge);
    setFormData({
      title: challenge.title,
      description: challenge.description,
      type: challenge.type,
      start_date: challenge.start_date,
      end_date: challenge.end_date,
      goal_metric: challenge.goal_metric,
      goal_value: challenge.goal_value,
      reward_points: challenge.reward_points,
      active: challenge.active
    });
    setDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Challenge Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Create and manage community challenges</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#c9a227] hover:bg-[#b89123]">
                <Plus className="w-4 h-4 mr-2" />
                New Challenge
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingChallenge ? "Edit Challenge" : "Create Challenge"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="50km This Week"
                  />
                </div>
                
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ride a total of 50km this week"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Goal Metric</Label>
                    <Select value={formData.goal_metric} onValueChange={(value) => setFormData({ ...formData, goal_metric: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="distance">Distance (km)</SelectItem>
                        <SelectItem value="events">Events Attended</SelectItem>
                        <SelectItem value="posts">Forum Posts</SelectItem>
                        <SelectItem value="routes">Routes Uploaded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Goal Value</Label>
                    <Input
                      type="number"
                      value={formData.goal_value}
                      onChange={(e) => setFormData({ ...formData, goal_value: parseInt(e.target.value) })}
                      placeholder="50"
                    />
                  </div>

                  <div>
                    <Label>Reward Points</Label>
                    <Input
                      type="number"
                      value={formData.reward_points}
                      onChange={(e) => setFormData({ ...formData, reward_points: parseInt(e.target.value) })}
                      placeholder="100"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label>Active</Label>
                </div>

                <div className="flex gap-3">
                  <Button onClick={resetForm} variant="outline" className="flex-1">Cancel</Button>
                  <Button onClick={handleSubmit} className="flex-1 bg-[#c9a227] hover:bg-[#b89123]">
                    {editingChallenge ? "Update" : "Create"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {challenges.map((challenge) => (
            <Card key={challenge.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Trophy className="w-5 h-5 text-[#c9a227]" />
                      <h3 className="text-xl font-semibold">{challenge.title}</h3>
                      <Badge className={challenge.active ? "bg-green-500" : "bg-gray-500"}>
                        {challenge.active ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">{challenge.type}</Badge>
                    </div>
                    <p className="text-gray-600 mb-4">{challenge.description}</p>
                    
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Goal</p>
                        <p className="font-semibold">{challenge.goal_value} {challenge.goal_metric}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Reward</p>
                        <p className="font-semibold">{challenge.reward_points} points</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Start Date</p>
                        <p className="font-semibold">{new Date(challenge.start_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">End Date</p>
                        <p className="font-semibold">{new Date(challenge.end_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(challenge)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(challenge.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}