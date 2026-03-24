import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Calendar,
  Target,
  Trophy,
  MapPin,
  Edit2,
  Save,
  X,
  Plus,
  CheckCircle2,
  Clock,
  FileText,
  TrendingUp,
  Award,
  Bike,
  LogOut
} from "lucide-react";
import PointsTracker from "../components/gamification/PointsTracker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";


import {
  Card,
  CardContent,
  CardHeader,
  CardTitle } from
"@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle } from
"@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger } from
"@/components/ui/tabs";

const StatCard = ({ icon: Icon, value, label, color }) => {
  return (
    <div className="bg-[var(--cy-bg-card)] rounded-2xl p-6 border border-[var(--cy-border)]">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-[var(--cy-text)]" />
      </div>
      <div className="text-3xl font-bold text-[var(--cy-text)] mb-1">{value}</div>
      <div className="text-sm text-[var(--cy-text-muted)]">{label}</div>
    </div>);

};

const GoalCard = ({ goal, onUpdate, onDelete }) => {
  return (
    <div className="bg-[var(--cy-bg-card)] rounded-xl p-4 shadow-none border border-[var(--cy-border)]">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-[var(--cy-text)] mb-1">{goal.title}</h4>
          <div className="flex items-center gap-2 text-sm text-[var(--cy-text-muted)]">
            <Calendar className="w-3 h-3" />
            <span>Target: {new Date(goal.target_date).toLocaleDateString()}</span>
          </div>
        </div>
        {goal.completed &&
        <Badge className="bg-[#A4FF4F] text-[var(--cy-text)] border-0">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Complete
          </Badge>
        }
      </div>
      
      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-[var(--cy-text-muted)] mb-1">
          <span>Progress</span>
          <span>{goal.progress}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#ff6b35] rounded-full transition-all duration-500"
            style={{ width: `${goal.progress}%` }} />

        </div>
      </div>
      
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onUpdate(goal)}
          className="flex-1">

          <Edit2 className="w-3 h-3 mr-1" />
          Edit
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete(goal)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50">

          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>);

};

const AchievementBadge = ({ achievement }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-[#ff6b35] to-[#e55a2b] rounded-xl p-4 text-[var(--cy-text)]">

      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-[var(--cy-bg-card)]/20 flex items-center justify-center flex-shrink-0">
          <Trophy className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold mb-1">{achievement.title}</h4>
          <p className="text-sm text-[var(--cy-text)]/90 mb-2">{achievement.description}</p>
          <div className="flex items-center gap-1 text-xs text-[var(--cy-text)]/80">
            <Calendar className="w-3 h-3" />
            <span>{new Date(achievement.date_achieved).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </motion.div>);

};

const AddGoalDialog = ({ open, onOpenChange, onSave, editingGoal }) => {
  const [goalData, setGoalData] = useState(editingGoal || {
    title: "",
    target_date: "",
    progress: 0,
    completed: false
  });

  useEffect(() => {
    if (editingGoal) {
      setGoalData(editingGoal);
    } else {
      setGoalData({
        title: "",
        target_date: "",
        progress: 0,
        completed: false
      });
    }
  }, [editingGoal, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(goalData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[var(--cy-text)]">
            {editingGoal ? 'Edit Goal' : 'Add New Goal'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Goal Title</Label>
            <Input
              id="title"
              value={goalData.title}
              onChange={(e) => setGoalData({ ...goalData, title: e.target.value })}
              placeholder="e.g., Complete a century ride"
              required />

          </div>
          
          <div>
            <Label htmlFor="target_date">Target Date</Label>
            <Input
              id="target_date"
              type="date"
              value={goalData.target_date}
              onChange={(e) => setGoalData({ ...goalData, target_date: e.target.value })}
              required />

          </div>
          
          <div>
            <Label htmlFor="progress">Progress (%)</Label>
            <Input
              id="progress"
              type="number"
              min="0"
              max="100"
              value={goalData.progress}
              onChange={(e) => setGoalData({ ...goalData, progress: parseInt(e.target.value) })} />

          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="completed"
              checked={goalData.completed}
              onChange={(e) => setGoalData({ ...goalData, completed: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-[#ff6b35] focus:ring-[#ff6b35]" />

            <Label htmlFor="completed" className="cursor-pointer">Mark as completed</Label>
          </div>
          
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white">
              <Save className="w-4 h-4 mr-2" />
              Save Goal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>);

};

export default function Profile() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile', user?.email],
    queryFn: async () => {
      if (!user) return null;
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      return profiles[0] || null;
    },
    enabled: !!user
  });

  // Fetch user points
  const { data: userPoints } = useQuery({
    queryKey: ['userPoints', user?.email],
    queryFn: async () => {
      if (!user) return null;
      const points = await base44.entities.UserPoints.filter({ user_email: user.email });
      return points[0] || { total_points: 0, weekly_points: 0, monthly_points: 0, level: 1 };
    },
    enabled: !!user
  });

  // Fetch user badges
  const { data: userBadges = [] } = useQuery({
    queryKey: ['userBadges', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Badge.filter({ created_by: user.email }, '-earned_at');
    },
    enabled: !!user
  });

  // Fetch event registrations
  const { data: registrations = [] } = useQuery({
    queryKey: ['eventRegistrations', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.EventRegistration.filter({ created_by: user.email }, '-created_date');
    },
    enabled: !!user
  });

  // Fetch user tickets
  const { data: userTickets = [] } = useQuery({
    queryKey: ['userTickets', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Ticket.filter({ created_by: user.email }, '-created_date');
    },
    enabled: !!user
  });

  // Fetch saved routes
  const { data: savedRoutes = [] } = useQuery({
    queryKey: ['savedRoutes', profile?.saved_routes],
    queryFn: async () => {
      if (!profile?.saved_routes || profile.saved_routes.length === 0) return [];
      // Fetch routes by IDs
      const routes = await base44.entities.Route.list();
      return routes.filter((route) => profile.saved_routes.includes(route.id));
    },
    enabled: !!profile && profile.saved_routes?.length > 0
  });

  // Fetch user's created events
  const { data: myCreatedEvents = [] } = useQuery({
    queryKey: ['myCreatedEvents', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Event.filter({ organizer_email: user.email });
    },
    enabled: !!user
  });

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: (data) => {
      if (profile) {
        return base44.entities.UserProfile.update(profile.id, data);
      } else {
        return base44.entities.UserProfile.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      setIsEditingProfile(false);
    }
  });

  const handleSaveGoal = (goalData) => {
    const goals = profile?.goals || [];

    if (editingGoal) {
      const updatedGoals = goals.map((g) =>
      g.title === editingGoal.title ? goalData : g
      );
      updateProfileMutation.mutate({ goals: updatedGoals });
    } else {
      updateProfileMutation.mutate({ goals: [...goals, goalData] });
    }

    setEditingGoal(null);
  };

  const handleDeleteGoal = (goal) => {
    const updatedGoals = (profile?.goals || []).filter((g) => g.title !== goal.title);
    updateProfileMutation.mutate({ goals: updatedGoals });
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setGoalDialogOpen(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--cy-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[var(--cy-text-muted)] mb-4">Loading profile...</div>
        </div>
      </div>);

  }

  const upcomingEvents = registrations.filter((r) =>
  r.status === 'registered' && new Date(r.event_date) >= new Date()
  );

  const pastEvents = registrations.filter((r) =>
  r.status === 'attended' || r.status === 'registered' && new Date(r.event_date) < new Date()
  );

  return (
    <div className="min-h-screen bg-[var(--cy-bg)]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[var(--cy-gradient-from)] to-[var(--cy-gradient-to)] py-16 md:py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[#A4FF4F] blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Profile Picture */}
            <div className="bg-orange-400 text-[var(--cy-text)] text-4xl font-bold rounded-2xl w-32 h-32 from-[#ff6b35] to-[#e55a2b] flex items-center justify-center flex-shrink-0">
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : <User className="w-16 h-16" />}
            </div>
            
            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-[var(--cy-text)] mb-2">
                {user.full_name || 'Cyclist'}
              </h1>
              <p className="text-[var(--cy-text-muted)] mb-4">{user.email}</p>
              
              {profile &&
              <div className="flex flex-wrap gap-3 mb-4">
                  {profile.skill_level &&
                <Badge className="bg-[#A4FF4F] text-[var(--cy-text)] border-0">
                      {profile.skill_level}
                    </Badge>
                }
                  {profile.favorite_discipline &&
                <Badge variant="outline" className="border-[var(--cy-border-strong)] text-[var(--cy-text)]">
                      {profile.favorite_discipline}
                    </Badge>
                }
                  {profile.cycling_since &&
                <Badge variant="outline" className="border-[var(--cy-border-strong)] text-[var(--cy-text)]">
                      Cycling since {new Date(profile.cycling_since).getFullYear()}
                    </Badge>
                }
                </div>
              }
              
              {profile?.bio &&
              <p className="text-[var(--cy-text-secondary)] mb-4">{profile.bio}</p>
              }

              {/* Badges Preview */}
              {profile?.achievements && profile.achievements.length > 0 &&
              <div className="flex gap-2 mb-4">
                  {profile.achievements.slice(0, 3).map((achievement, i) =>
                <div key={i} className="w-10 h-10 rounded-full bg-[#ff6b35] flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                )}
                  {profile.achievements.length > 3 &&
                <div className="w-10 h-10 rounded-full bg-[var(--cy-bg-card)]/20 flex items-center justify-center text-[var(--cy-text)] text-sm font-semibold">
                      +{profile.achievements.length - 3}
                    </div>
                }
                </div>
              }
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  variant="outline" className="bg-orange-400 text-[var(--cy-text)] px-4 py-2 text-sm font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border shadow-none hover:text-accent-foreground h-9 border-[var(--cy-border-strong)] hover:bg-[var(--cy-hover)]">


                  <Edit2 className="w-4 h-4 mr-2" />
                  {isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}
                </Button>
                
                <Button
                  onClick={() => base44.auth.logout()}
                  variant="outline"
                  className="border-red-400/30 text-red-400 hover:bg-red-400/10">

                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-[var(--cy-bg-card)] border-b border-[var(--cy-border)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Points Tracker */}
          <div className="mb-8">
            <PointsTracker userEmail={user.email} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard
              icon={Bike}
              value={profile?.total_rides || 0}
              label="Total Rides"
              color="bg-[#ff6b35]" />

            <StatCard
              icon={TrendingUp}
              value={`${profile?.total_distance || 0}km`}
              label="Distance Covered"
              color="bg-[#6BCBFF]" />

            <StatCard
              icon={Trophy}
              value={userBadges.length}
              label="Badges Earned"
              color="bg-[#A4FF4F]" />

            <StatCard
              icon={Target}
              value={profile?.goals?.filter((g) => !g.completed).length || 0}
              label="Active Goals"
              color="bg-[var(--cy-bg-elevated)]" />

            <div className="bg-orange-400 text-[var(--cy-text)] p-6 rounded-2xl from-[#ff6b35] to-[#e55a2b] shadow-none">
              <div className="text-sm mb-1 opacity-90">Level {userPoints?.level || 1}</div>
              <div className="text-3xl font-bold mb-1">{userPoints?.total_points || 0}</div>
              <div className="text-sm opacity-90">Total Points</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Tabs defaultValue="events" className="space-y-8">
            <TabsList className="bg-[var(--cy-bg-card)] p-1 rounded-xl shadow-none">
              <TabsTrigger value="events" className="bg-transparent px-3 py-1 text-sm font-medium rounded-lg inline-flex items-center justify-center whitespace-nowrap ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white">
                <Calendar className="w-4 h-4 mr-2" />
                My Events
              </TabsTrigger>
              <TabsTrigger value="goals" className="rounded-lg data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white">
                <Target className="w-4 h-4 mr-2" />
                Goals
              </TabsTrigger>
              <TabsTrigger value="achievements" className="rounded-lg data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white">
                <Award className="w-4 h-4 mr-2" />
                Achievements
              </TabsTrigger>
              <TabsTrigger value="routes" className="rounded-lg data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white">
                <MapPin className="w-4 h-4 mr-2" />
                Saved Routes
              </TabsTrigger>
              <TabsTrigger value="notes" className="rounded-lg data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white">
                <FileText className="w-4 h-4 mr-2" />
                Private Notes
              </TabsTrigger>
            </TabsList>

            {/* Events Tab */}
            <TabsContent value="events" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-[var(--cy-text)]">My Created Events ({myCreatedEvents.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {myCreatedEvents.length > 0 ?
                  <div className="space-y-3">
                      {myCreatedEvents.map((event) =>
                    <div key={event.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-[#ff6b35]/10 to-transparent rounded-xl border-l-4 border-[#ff6b35]">
                          <div className="flex-1">
                            <h4 className="font-semibold text-[var(--cy-text)] mb-1">{event.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-[var(--cy-text-muted)]">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(event.date).toLocaleDateString()}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">{event.type}</Badge>
                              <span>{event.current_participants || 0} participants</span>
                            </div>
                          </div>
                        </div>
                    )}
                    </div> :

                  <p className="text-center text-[var(--cy-text-muted)] py-8">No events created yet</p>
                  }
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-[var(--cy-text)]">My Tickets ({userTickets.filter((t) => t.payment_status === 'completed').length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {userTickets.filter((t) => t.payment_status === 'completed').length > 0 ?
                  <div className="grid md:grid-cols-2 gap-4">
                      {userTickets.filter((t) => t.payment_status === 'completed').map((ticket) =>
                    <div key={ticket.id} className="p-4 border-2 border-[#ff6b35] rounded-xl bg-gradient-to-br from-[#ff6b35]/5 to-transparent">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-[var(--cy-text)] mb-1">{ticket.event_name}</h4>
                              <Badge className="bg-[#A4FF4F] text-[var(--cy-text)] border-0 text-xs">
                                {ticket.ticket_type}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-[#ff6b35]">${ticket.price}</div>
                            </div>
                          </div>
                          <div className="text-xs text-[var(--cy-text-muted)] font-mono bg-gray-50 p-2 rounded">
                            Ticket ID: {ticket.ticket_id}
                          </div>
                        </div>
                    )}
                    </div> :

                  <p className="text-center text-[var(--cy-text-muted)] py-8">No tickets purchased yet</p>
                  }
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-[var(--cy-text)]">Upcoming Events ({upcomingEvents.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingEvents.length > 0 ?
                  <div className="space-y-3">
                      {upcomingEvents.map((reg) =>
                    <div key={reg.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex-1">
                            <h4 className="font-semibold text-[var(--cy-text)] mb-1">{reg.event_name}</h4>
                            <div className="flex items-center gap-4 text-sm text-[var(--cy-text-muted)]">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(reg.event_date).toLocaleDateString()}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">{reg.event_type}</Badge>
                            </div>
                          </div>
                          <Button size="sm" className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white">
                            View Details
                          </Button>
                        </div>
                    )}
                    </div> :

                  <p className="text-center text-[var(--cy-text-muted)] py-8">No upcoming events registered</p>
                  }
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-[var(--cy-text)]">Past Events ({pastEvents.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {pastEvents.length > 0 ?
                  <div className="space-y-3">
                      {pastEvents.slice(0, 5).map((reg) =>
                    <div key={reg.id} className="flex items-center justify-between p-4 border border-[var(--cy-border-strong)] rounded-xl">
                          <div className="flex-1">
                            <h4 className="font-semibold text-[var(--cy-text)] mb-1">{reg.event_name}</h4>
                            <div className="flex items-center gap-4 text-sm text-[var(--cy-text-muted)]">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{new Date(reg.event_date).toLocaleDateString()}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">{reg.event_type}</Badge>
                            </div>
                          </div>
                          {reg.status === 'attended' &&
                      <Badge className="bg-[#A4FF4F] text-[var(--cy-text)] border-0 font-bold">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Attended
                            </Badge>
                      }
                        </div>
                    )}
                    </div> :

                  <p className="text-center text-[var(--cy-text-muted)] py-8">No past events</p>
                  }
                </CardContent>
              </Card>
            </TabsContent>

            {/* Goals Tab */}
            <TabsContent value="goals">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-[var(--cy-text)]">Cycling Goals</CardTitle>
                  <Button
                    onClick={() => {
                      setEditingGoal(null);
                      setGoalDialogOpen(true);
                    }}
                    size="sm"
                    className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white">

                    <Plus className="w-4 h-4 mr-2" />
                    Add Goal
                  </Button>
                </CardHeader>
                <CardContent>
                  {profile?.goals && profile.goals.length > 0 ?
                  <div className="grid md:grid-cols-2 gap-4">
                      {profile.goals.map((goal, index) =>
                    <GoalCard
                      key={index}
                      goal={goal}
                      onUpdate={handleEditGoal}
                      onDelete={handleDeleteGoal} />

                    )}
                    </div> :

                  <p className="text-center text-[var(--cy-text-muted)] py-8">
                      No goals yet. Set your first cycling goal!
                    </p>
                  }
                </CardContent>
              </Card>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-[var(--cy-text)]">Badges ({userBadges.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {userBadges.length > 0 ?
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {userBadges.map((badge) =>
                    <div key={badge.id} className="bg-gradient-to-br from-[#ff6b35] to-[#e55a2b] rounded-xl p-4 text-[var(--cy-text)]">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-full bg-[var(--cy-bg-card)]/20 flex items-center justify-center flex-shrink-0">
                              <Trophy className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold mb-1">{badge.title}</h4>
                              <p className="text-sm text-[var(--cy-text)]/90 mb-2">{badge.description}</p>
                              <div className="text-xs text-[var(--cy-text)]/80">
                                {new Date(badge.earned_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                    )}
                    </div> :

                  <p className="text-center text-[var(--cy-text-muted)] py-8">
                      No badges yet. Complete challenges to earn your first badge!
                    </p>
                  }
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-[var(--cy-text)]">Points Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gradient-to-br from-[#ff6b35]/10 to-[#ff6b35]/5 rounded-xl">
                      <div className="text-3xl font-bold text-[var(--cy-text)] mb-1">{userPoints?.total_points || 0}</div>
                      <div className="text-sm text-[var(--cy-text-muted)]">Total Points</div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-[#6BCBFF]/10 to-[#6BCBFF]/5 rounded-xl">
                      <div className="text-3xl font-bold text-[var(--cy-text)] mb-1">{userPoints?.weekly_points || 0}</div>
                      <div className="text-sm text-[var(--cy-text-muted)]">This Week</div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-[#A4FF4F]/10 to-[#A4FF4F]/5 rounded-xl">
                      <div className="text-3xl font-bold text-[var(--cy-text)] mb-1">{userPoints?.monthly_points || 0}</div>
                      <div className="text-sm text-[var(--cy-text-muted)]">This Month</div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-semibold text-[var(--cy-text)] mb-3">How to Earn Points</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-[var(--cy-text-muted)]">Post in Community Forum</span>
                        <span className="font-semibold text-[#ff6b35]">+10 pts</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-[var(--cy-text-muted)]">Attend an Event</span>
                        <span className="font-semibold text-[#ff6b35]">+25 pts</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-[var(--cy-text-muted)]">Upload a Route</span>
                        <span className="font-semibold text-[#ff6b35]">+50 pts</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-[var(--cy-text-muted)]">Complete Challenge</span>
                        <span className="font-semibold text-[#ff6b35]">+100 pts</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Saved Routes Tab */}
            <TabsContent value="routes">
              <Card>
                <CardHeader>
                  <CardTitle className="text-[var(--cy-text)]">Saved Routes ({savedRoutes.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {savedRoutes.length > 0 ?
                  <div className="grid md:grid-cols-2 gap-4">
                      {savedRoutes.map((route) =>
                    <div key={route.id} className="p-4 border border-[var(--cy-border-strong)] rounded-xl hover:shadow-md transition-shadow">
                          <h4 className="font-semibold text-[var(--cy-text)] mb-2">{route.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-[var(--cy-text-muted)] mb-3">
                            <span>{route.distance}km</span>
                            <span>•</span>
                            <span>{route.difficulty}</span>
                          </div>
                          <Button size="sm" variant="outline" className="w-full">
                            View Route
                          </Button>
                        </div>
                    )}
                    </div> :

                  <p className="text-center text-[var(--cy-text-muted)] py-8">
                      No saved routes yet. Explore and save your favorites!
                    </p>
                  }
                </CardContent>
              </Card>
            </TabsContent>

            {/* Private Notes Tab */}
            <TabsContent value="notes">
              <Card>
                <CardHeader>
                  <CardTitle className="text-[var(--cy-text)]">Private Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={profile?.private_notes || ""}
                    onChange={(e) => {
                      updateProfileMutation.mutate({ private_notes: e.target.value });
                    }}
                    placeholder="Keep track of your cycling journey, training insights, or personal reflections..."
                    rows={12}
                    className="resize-none" />

                  <p className="text-xs text-[var(--cy-text-muted)] mt-2">
                    These notes are private and only visible to you.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Add/Edit Goal Dialog */}
      <AddGoalDialog
        open={goalDialogOpen}
        onOpenChange={setGoalDialogOpen}
        onSave={handleSaveGoal}
        editingGoal={editingGoal} />

    </div>);

}