import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, TrendingUp, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LeaderboardCard = ({ rank, user, points, level, badges, metric }) => {
  const getRankIcon = () => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-[var(--cy-text-muted)]" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-700" />;
    return <span className="text-lg font-bold text-[var(--cy-text-muted)]">#{rank}</span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.05 }}
      className={`p-4 rounded-xl ${rank <= 3 ? 'bg-gradient-to-r from-[#ff6b35]/10 to-transparent border-2 border-[#ff6b35]/20' : 'bg-[var(--cy-bg-card)] border border-[var(--cy-border-strong)]'}`}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 flex items-center justify-center">
          {getRankIcon()}
        </div>
        
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff6b35] to-[#e55a2b] flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-lg">
            {user.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || "?"}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[var(--cy-text)] truncate">{user.full_name || user.email?.split('@')[0] || "Anonymous"}</p>
          <div className="flex items-center gap-2 text-sm text-[var(--cy-text-muted)]">
            <Badge variant="outline" className="text-xs">Level {level}</Badge>
            {badges > 0 && (
              <span className="flex items-center gap-1">
                <Award className="w-3 h-3" />
                {badges} badges
              </span>
            )}
          </div>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold text-[#ff6b35]">{metric}</p>
          <p className="text-xs text-[var(--cy-text-muted)]">points</p>
        </div>
      </div>
    </motion.div>
  );
};

export default function Leaderboard() {
  const [timeFrame, setTimeFrame] = useState("all");

  const { data: leaderboardData = [] } = useQuery({
    queryKey: ['leaderboard', timeFrame],
    queryFn: async () => {
      const [userPoints, users, achievements] = await Promise.all([
        base44.entities.UserPoints.list('-total_points', 50),
        base44.entities.User.list(),
        base44.entities.Achievement.list()
      ]);

      return userPoints.map(points => {
        const user = users.find(u => u.email === points.user_email);
        const userBadges = achievements.filter(a => a.user_email === points.user_email);
        return {
          ...points,
          user,
          badgeCount: userBadges.length
        };
      }).filter(item => item.user);
    }
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['activeChallenges'],
    queryFn: async () => {
      const allChallenges = await base44.entities.Challenge.list();
      const now = new Date();
      return allChallenges.filter(c => 
        c.active && 
        new Date(c.start_date) <= now && 
        new Date(c.end_date) >= now
      );
    }
  });

  const filteredLeaderboardData = useMemo(() => {
    if (timeFrame === "all") return leaderboardData;
    const now = new Date();
    const cutoff = new Date();
    if (timeFrame === "week") {
      cutoff.setDate(now.getDate() - 7);
    } else if (timeFrame === "month") {
      cutoff.setDate(now.getDate() - 30);
    }
    return leaderboardData.filter(item => {
      const createdDate = new Date(item.created_date);
      return createdDate >= cutoff;
    });
  }, [leaderboardData, timeFrame]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#ff6b35] to-[#e55a2b] mb-6">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-[var(--cy-text)] mb-4">Leaderboard</h1>
            <p className="text-xl text-[var(--cy-text-muted)]">
              Compete with fellow cyclists and climb to the top!
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Active Challenges */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#ff6b35]" />
                Active Challenges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {challenges.length > 0 ? (
                challenges.map(challenge => (
                  <div key={challenge.id} className="p-3 rounded-lg bg-gradient-to-r from-[#ff6b35]/10 to-transparent border-l-4 border-[#ff6b35]">
                    <p className="font-semibold text-sm text-[var(--cy-text)]">{challenge.title}</p>
                    <p className="text-xs text-[var(--cy-text-muted)] mt-1">{challenge.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline" className="text-xs">{challenge.reward_points} pts</Badge>
                      <span className="text-xs text-[var(--cy-text-muted)]">
                        Ends {new Date(challenge.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--cy-text-muted)] text-center py-4">No active challenges</p>
              )}
            </CardContent>
          </Card>

          {/* Top 3 Podium */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Top Cyclists</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-center gap-4 mb-8">
                {leaderboardData.slice(0, 3).map((item, index) => {
                  const positions = [1, 0, 2];
                  const actualRank = positions[index] + 1;
                  const heights = ['h-32', 'h-40', 'h-24'];
                  const colors = ['bg-gray-300', 'bg-yellow-400', 'bg-amber-700'];
                  
                  return (
                    <motion.div
                      key={item.user.id}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.2 }}
                      className={`flex flex-col items-center ${index === 1 ? 'order-1' : index === 0 ? 'order-2' : 'order-3'}`}
                    >
                      <div className="relative mb-2">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#ff6b35] to-[#e55a2b] flex items-center justify-center border-4 border-white shadow-xl shadow-black/20">
                          <span className="text-white font-bold text-2xl">
                            {item.user.full_name?.charAt(0) || item.user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        {actualRank === 1 && (
                          <Crown className="absolute -top-8 left-1/2 -translate-x-1/2 w-8 h-8 text-yellow-500" />
                        )}
                      </div>
                      <p className="font-semibold text-sm text-center mb-1">
                        {item.user.full_name || item.user.email.split('@')[0]}
                      </p>
                      <div className={`${heights[index]} ${colors[index]} w-24 rounded-t-lg flex items-center justify-center flex-col px-2`}>
                        <p className="text-2xl font-bold text-[var(--cy-text)]">{item.total_points}</p>
                        <p className="text-xs text-[var(--cy-text-secondary)]">points</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Full Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>Full Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={timeFrame} onValueChange={setTimeFrame} className="mb-6">
              <TabsList>
                <TabsTrigger value="all">All Time</TabsTrigger>
                <TabsTrigger value="month">This Month</TabsTrigger>
                <TabsTrigger value="week">This Week</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-3">
              {filteredLeaderboardData.map((item, index) => (
                <LeaderboardCard
                  key={item.id}
                  rank={index + 1}
                  user={item.user}
                  points={item.total_points}
                  level={item.level}
                  badges={item.badgeCount}
                  metric={item.total_points}
                />
              ))}
              
              {leaderboardData.length === 0 && (
                <p className="text-center text-[var(--cy-text-muted)] py-8">No rankings yet. Be the first to earn points!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}