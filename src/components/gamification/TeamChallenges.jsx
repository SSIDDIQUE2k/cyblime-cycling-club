import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Users, Trophy, Plus, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function TeamChallenges({ user }) {
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: teamChallenges = [] } = useQuery({
    queryKey: ['teamChallenges'],
    queryFn: () => base44.entities.TeamChallenge.list('-created_date'),
    enabled: !!user
  });

  const { data: myTeams = [] } = useQuery({
    queryKey: ['myTeamChallenges', user?.email],
    queryFn: async () => {
      if (!user) return [];
      const teams = await base44.entities.TeamChallenge.list();
      return teams.filter(t => t.team_members?.includes(user.email));
    },
    enabled: !!user
  });

  const joinTeamMutation = useMutation({
    mutationFn: async (teamId) => {
      const team = teamChallenges.find(t => t.id === teamId);
      const updatedMembers = [...(team.team_members || []), user.email];
      return await base44.entities.TeamChallenge.update(teamId, {
        team_members: updatedMembers
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamChallenges'] });
      queryClient.invalidateQueries({ queryKey: ['myTeamChallenges'] });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--cy-text)]">Team Challenges</h2>
          <p className="text-sm text-[var(--cy-text-muted)]">Join forces with others to achieve goals</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#ff6b35] hover:bg-[#e55a2b]">
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Team Challenge</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-[var(--cy-text-muted)]">Team creation coming soon! Check back later.</p>
          </DialogContent>
        </Dialog>
      </div>

      {/* My Teams */}
      {myTeams.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">My Teams</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {myTeams.map((team, index) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-2 border-[#ff6b35]">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{team.title}</CardTitle>
                        <p className="text-sm text-[var(--cy-text-muted)] mt-1">{team.team_name}</p>
                      </div>
                      <Badge className="bg-[#A4FF4F] text-[var(--cy-text)] border-0">
                        Active
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-[var(--cy-text-muted)]">Progress</span>
                        <span className="font-semibold">
                          {team.current_progress}/{team.goal_value} {team.goal_type}
                        </span>
                      </div>
                      <Progress 
                        value={(team.current_progress / team.goal_value) * 100} 
                        className="h-3"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-[var(--cy-text-muted)]">
                        <Users className="w-4 h-4" />
                        <span>{team.team_members?.length || 0}/{team.max_members} members</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Trophy className="w-4 h-4 text-[#ff6b35]" />
                        <span className="font-semibold">{team.reward_points} pts</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Available Teams */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Available Teams</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamChallenges
            .filter(team => !team.team_members?.includes(user?.email))
            .filter(team => (team.team_members?.length || 0) < team.max_members)
            .map((team, index) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{team.title}</CardTitle>
                    <p className="text-sm text-[var(--cy-text-muted)]">{team.team_name}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-[var(--cy-text-muted)]">{team.description}</p>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[var(--cy-text-muted)]">Goal:</span>
                        <span className="font-semibold">{team.goal_value} {team.goal_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--cy-text-muted)]">Members:</span>
                        <span>{team.team_members?.length || 0}/{team.max_members}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--cy-text-muted)]">Reward:</span>
                        <span className="font-semibold text-[#ff6b35]">{team.reward_points} pts</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => joinTeamMutation.mutate(team.id)}
                      className="w-full bg-[#ff6b35] hover:bg-[#e55a2b]"
                      size="sm"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Join Team
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
}