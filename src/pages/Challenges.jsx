import React, { useState } from "react";
import { motion } from "framer-motion";
import { usePageContent } from "../hooks/usePageContent";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Trophy,
  Target,
  Calendar,
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  Users,
  Flame,
  Medal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const ChallengeCard = ({ challenge, userProgress, onJoin, isJoined, isJoining }) => {
  const progress = userProgress || 0;
  const isCompleted = progress >= challenge.goal_value;
  const progressPercent = Math.min((progress / challenge.goal_value) * 100, 100);

  const getMetricIcon = (metric) => {
    const icons = {
      distance: TrendingUp,
      events: Calendar,
      posts: Users,
      routes: Target
    };
    return icons[metric] || Target;
  };

  const Icon = getMetricIcon(challenge.goal_metric);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--cy-bg-card)] rounded-2xl p-6 border border-[var(--cy-border)] hover:shadow-lg hover:shadow-black/30 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff6b35] to-[#ff4500] flex items-center justify-center">
          <Icon className="w-6 h-6 text-[var(--cy-text)]" />
        </div>
        <Badge className={`${isCompleted ? 'bg-[#A4FF4F] text-[var(--cy-text)]' : 'bg-[#ff6b35] text-white'} border-0`}>
          {challenge.type === 'weekly' ? 'Weekly' : 'Monthly'}
        </Badge>
      </div>

      <h3 className="text-xl font-bold text-[var(--cy-text)] mb-2">{challenge.title}</h3>
      <p className="text-[var(--cy-text-muted)] text-sm mb-4">{challenge.description}</p>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--cy-text-muted)]">Progress</span>
          <span className="font-bold text-[var(--cy-text)]">{progress} / {challenge.goal_value}</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[var(--cy-border)]">
        <div className="flex items-center gap-2 text-sm text-[var(--cy-text-muted)]">
          <Trophy className="w-4 h-4 text-[#ff6b35]" />
          <span>{challenge.reward_points} points</span>
        </div>
        {isCompleted ? (
          <Badge className="bg-[#A4FF4F] text-[var(--cy-text)] border-0">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        ) : isJoined ? (
          <Badge className="bg-[#A4FF4F] text-[var(--cy-text)] border-0">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Joined
          </Badge>
        ) : (
          <Button
            size="sm"
            onClick={() => onJoin(challenge)}
            disabled={isJoining}
            className="bg-[#ff6b35] hover:bg-[#ff4500] text-white"
          >
            {isJoining ? 'Joining...' : 'Join Challenge'}
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-[var(--cy-text-muted)] mt-3">
        <Clock className="w-3 h-3" />
        <span>Ends: {new Date(challenge.end_date).toLocaleDateString()}</span>
      </div>
    </motion.div>
  );
};

const LeaderboardRow = ({ user, rank }) => {
  const getRankColor = (rank) => {
    if (rank === 1) return "bg-gradient-to-br from-[#FFD700] to-[#FFA500]";
    if (rank === 2) return "bg-gradient-to-br from-[#C0C0C0] to-[#808080]";
    if (rank === 3) return "bg-gradient-to-br from-[#CD7F32] to-[#8B4513]";
    return "bg-gray-100";
  };

  const getRankIcon = (rank) => {
    if (rank <= 3) return <Medal className="w-5 h-5 text-[var(--cy-text)]" />;
    return <span className="font-bold text-[var(--cy-text-muted)]">#{rank}</span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05 }}
      className="flex items-center gap-4 p-4 bg-[var(--cy-bg-card)] rounded-xl hover:shadow-md transition-shadow"
    >
      <div className={`w-10 h-10 rounded-full ${getRankColor(rank)} flex items-center justify-center flex-shrink-0`}>
        {getRankIcon(rank)}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-[var(--cy-text)]">{user.name}</h4>
        <p className="text-xs text-[var(--cy-text-muted)]">{user.stat}</p>
      </div>
      <div className="text-right">
        <div className="text-xl font-bold text-[#ff6b35]">{user.value}</div>
        <div className="text-xs text-[var(--cy-text-muted)]">points</div>
      </div>
    </motion.div>
  );
};

const DEFAULT_CHALLENGES_CONTENT = {
  hero: {
    heading: "Challenges & Leaderboards",
    subheading: "Push your limits, compete with fellow riders, and earn rewards for your achievements."
  }
};

export default function Challenges() {
  const { content: pageContent } = usePageContent("challenges", DEFAULT_CHALLENGES_CONTENT);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [joinedChallenges, setJoinedChallenges] = useState(new Set());

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.filter({ active: true }, '-start_date')
  });

  const { data: userPoints } = useQuery({
    queryKey: ['userPoints', user?.email],
    queryFn: async () => {
      if (!user) return null;
      const points = await base44.entities.UserPoints.filter({ user_email: user.email });
      return points[0] || { total_points: 0, weekly_points: 0, monthly_points: 0, level: 1 };
    },
    enabled: !!user
  });

  const { data: allUserPoints = [] } = useQuery({
    queryKey: ['allUserPoints'],
    queryFn: () => base44.entities.UserPoints.list('-total_points', 50)
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['userBadges', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Badge.filter({ created_by: user.email }, '-earned_at');
    },
    enabled: !!user
  });

  const joinChallengeMutation = useMutation({
    mutationFn: async (challenge) => {
      if (challenge.participant_count !== undefined) {
        await base44.entities.Challenge.update(challenge.id, {
          participant_count: (challenge.participant_count || 0) + 1
        });
      }
      return challenge;
    },
    onSuccess: (challenge) => {
      setJoinedChallenges(prev => new Set([...prev, challenge.id]));
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    }
  });

  const weeklyLeaderboard = allUserPoints.slice(0, 10).map((up, idx) => ({
    name: up.user_email?.split('@')[0] || 'User',
    stat: `Level ${up.level}`,
    value: up.weekly_points
  }));

  const monthlyLeaderboard = allUserPoints.slice(0, 10).map((up, idx) => ({
    name: up.user_email?.split('@')[0] || 'User',
    stat: `Level ${up.level}`,
    value: up.monthly_points
  }));

  const allTimeLeaderboard = allUserPoints.slice(0, 10).map((up, idx) => ({
    name: up.user_email?.split('@')[0] || 'User',
    stat: `Level ${up.level}`,
    value: up.total_points
  }));

  const activeChallenges = challenges.filter(c => new Date(c.end_date) >= new Date());
  const weeklyChallenges = activeChallenges.filter(c => c.type === 'weekly');
  const monthlyChallenges = activeChallenges.filter(c => c.type === 'monthly');

  return (
    <div className="min-h-screen bg-[var(--cy-bg)]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[var(--cy-gradient-from)] to-[var(--cy-gradient-to)] py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[#ff6b35]/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-[#ff6b35]/20 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <Flame className="w-12 h-12 text-[#ff6b35]" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-[var(--cy-text)] tracking-tight mb-6">
              {pageContent.hero.heading}
            </h1>
            <p className="text-xl text-[var(--cy-text-muted)] mb-8">
              {pageContent.hero.subheading}
            </p>

            {userPoints && (
              <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
                <div className="bg-[var(--cy-bg-card)]/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-3xl font-bold text-[#ff6b35] mb-1">{userPoints.total_points}</div>
                  <div className="text-sm text-[var(--cy-text-secondary)]">Total Points</div>
                </div>
                <div className="bg-[var(--cy-bg-card)]/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-3xl font-bold text-[#ff6b35] mb-1">{userPoints.level}</div>
                  <div className="text-sm text-[var(--cy-text-secondary)]">Level</div>
                </div>
                <div className="bg-[var(--cy-bg-card)]/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-3xl font-bold text-[#A4FF4F] mb-1">{badges.length}</div>
                  <div className="text-sm text-[var(--cy-text-secondary)]">Badges</div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Challenges Section */}
      <section className="py-16 bg-[var(--cy-bg)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Tabs defaultValue="weekly" className="space-y-8">
            <TabsList className="bg-[var(--cy-bg-card)] p-1 rounded-xl shadow-none">
              <TabsTrigger value="weekly" className="rounded-lg data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white">
                <Calendar className="w-4 h-4 mr-2" />
                Weekly Challenges
              </TabsTrigger>
              <TabsTrigger value="monthly" className="rounded-lg data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white">
                <Target className="w-4 h-4 mr-2" />
                Monthly Challenges
              </TabsTrigger>
            </TabsList>

            <TabsContent value="weekly">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {weeklyChallenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    userProgress={0}
                    onJoin={joinChallengeMutation.mutate}
                    isJoined={joinedChallenges.has(challenge.id)}
                    isJoining={joinChallengeMutation.isPending}
                  />
                ))}
              </div>
              {weeklyChallenges.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-[var(--cy-text-muted)]">No active weekly challenges at the moment.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="monthly">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {monthlyChallenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    userProgress={0}
                    onJoin={joinChallengeMutation.mutate}
                    isJoined={joinedChallenges.has(challenge.id)}
                    isJoining={joinChallengeMutation.isPending}
                  />
                ))}
              </div>
              {monthlyChallenges.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-[var(--cy-text-muted)]">No active monthly challenges at the moment.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Leaderboards Section */}
      <section className="py-16 bg-[var(--cy-bg-card)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-[var(--cy-text)] mb-12 text-center">Leaderboards</h2>

          <Tabs defaultValue="weekly" className="space-y-8">
            <TabsList className="bg-gray-100 p-1 rounded-xl w-full md:w-auto">
              <TabsTrigger value="weekly" className="rounded-lg data-[state=active]:bg-[var(--cy-bg-card)]">
                This Week
              </TabsTrigger>
              <TabsTrigger value="monthly" className="rounded-lg data-[state=active]:bg-[var(--cy-bg-card)]">
                This Month
              </TabsTrigger>
              <TabsTrigger value="alltime" className="rounded-lg data-[state=active]:bg-[var(--cy-bg-card)]">
                All Time
              </TabsTrigger>
            </TabsList>

            <TabsContent value="weekly">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[var(--cy-text)] flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-[#ff6b35]" />
                      Top Riders
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {weeklyLeaderboard.slice(0, 5).map((user, idx) => (
                      <LeaderboardRow key={idx} user={user} rank={idx + 1} />
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="monthly">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[var(--cy-text)] flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-[#ff6b35]" />
                      Top Riders
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {monthlyLeaderboard.slice(0, 5).map((user, idx) => (
                      <LeaderboardRow key={idx} user={user} rank={idx + 1} />
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="alltime">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[var(--cy-text)] flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-[#ff6b35]" />
                      Top Riders
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {allTimeLeaderboard.slice(0, 10).map((user, idx) => (
                      <LeaderboardRow key={idx} user={user} rank={idx + 1} />
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}