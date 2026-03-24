import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Trophy,
  Star,
  MapPin,
  Award,
  Target,
  Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AchievementCard = ({ achievement, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="bg-gradient-to-br from-[#ff6b35] to-[#e55a2b] rounded-2xl p-6 text-[var(--cy-text)] relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--cy-bg-card)]/10 rounded-full -mr-16 -mt-16" />
      <div className="relative">
        <Trophy className="w-12 h-12 mb-3" />
        <h3 className="text-xl font-bold mb-2">{achievement.title}</h3>
        <p className="text-[var(--cy-text)]/90 text-sm mb-3">{achievement.description}</p>
        <div className="flex items-center gap-2">
          <Badge className="bg-[var(--cy-bg-card)]/20 text-[var(--cy-text)] border-0">
            +{achievement.points_awarded} pts
          </Badge>
          <span className="text-xs text-[var(--cy-text)]/80">
            {new Date(achievement.created_date).toLocaleDateString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default function MyProgress() {
  const [user, setUser] = useState(null);

  useEffect(() => {
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

  const { data: userPoints } = useQuery({
    queryKey: ['userPoints', user?.email],
    queryFn: async () => {
      if (!user) return null;
      const points = await base44.entities.UserPoints.filter({ user_email: user.email });
      return points[0] || {
        total_points: 0,
        level: 1,
        routes_completed: 0,
        routes_uploaded: 0,
        reviews_left: 0,
        total_distance: 0,
        total_elevation: 0
      };
    },
    enabled: !!user
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Achievement.filter({ user_email: user.email }, '-created_date');
    },
    enabled: !!user
  });

  const pointsToNextLevel = ((userPoints?.level || 1) * 1000) - (userPoints?.total_points || 0);
  const levelProgress = ((userPoints?.total_points || 0) % 1000) / 10;

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--cy-bg)] flex items-center justify-center">
        <div className="text-[var(--cy-text-muted)]">Loading progress...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--cy-bg)]">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#ff6b35] to-[#e55a2b] py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[var(--cy-bg-card)] blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-24 h-24 rounded-full bg-[var(--cy-bg-card)]/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-12 h-12 text-[var(--cy-text)]" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-[var(--cy-text)] mb-4">
              My Progress
            </h1>
            <div className="flex items-center justify-center gap-6 text-[var(--cy-text)]">
              <div>
                <div className="text-4xl font-bold">{userPoints?.level || 1}</div>
                <div className="text-sm opacity-90">Level</div>
              </div>
              <div className="w-px h-12 bg-[var(--cy-bg-card)]/30" />
              <div>
                <div className="text-4xl font-bold">{userPoints?.total_points || 0}</div>
                <div className="text-sm opacity-90">Total Points</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Progress Bar */}
      <section className="py-8 bg-[var(--cy-bg-card)] border-b border-[var(--cy-border-strong)]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-[var(--cy-text-muted)]">Level {userPoints?.level}</span>
            <span className="text-[var(--cy-text-muted)]">{pointsToNextLevel} pts to next level</span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${levelProgress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-[#ff6b35] to-[#e55a2b]"
            />
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[var(--cy-text)] mb-8">Your Statistics</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-[var(--cy-bg-card)] rounded-2xl p-6 border border-[var(--cy-border)]">
              <MapPin className="w-8 h-8 text-[#6BCBFF] mb-3" />
              <div className="text-3xl font-bold text-[var(--cy-text)] mb-1">
                {userPoints?.routes_completed || 0}
              </div>
              <div className="text-sm text-[var(--cy-text-muted)]">Routes Completed</div>
            </div>
            
            <div className="bg-[var(--cy-bg-card)] rounded-2xl p-6 border border-[var(--cy-border)]">
              <Target className="w-8 h-8 text-[#A4FF4F] mb-3" />
              <div className="text-3xl font-bold text-[var(--cy-text)] mb-1">
                {userPoints?.routes_uploaded || 0}
              </div>
              <div className="text-sm text-[var(--cy-text-muted)]">Routes Uploaded</div>
            </div>
            
            <div className="bg-[var(--cy-bg-card)] rounded-2xl p-6 border border-[var(--cy-border)]">
              <Star className="w-8 h-8 text-[#ff6b35] mb-3" />
              <div className="text-3xl font-bold text-[var(--cy-text)] mb-1">
                {userPoints?.reviews_left || 0}
              </div>
              <div className="text-sm text-[var(--cy-text-muted)]">Reviews Written</div>
            </div>
            
            <div className="bg-[var(--cy-bg-card)] rounded-2xl p-6 border border-[var(--cy-border)]">
              <Zap className="w-8 h-8 text-[#FC4C02] mb-3" />
              <div className="text-3xl font-bold text-[var(--cy-text)] mb-1">
                {userPoints?.total_distance || 0}km
              </div>
              <div className="text-sm text-[var(--cy-text-muted)]">Total Distance</div>
            </div>
          </div>

          {/* Achievements */}
          <h2 className="text-3xl font-bold text-[var(--cy-text)] mb-8">
            <Award className="w-8 h-8 inline mr-3 text-[#ff6b35]" />
            Achievements ({achievements.length})
          </h2>
          
          {achievements.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement, index) => (
                <AchievementCard key={achievement.id} achievement={achievement} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-[var(--cy-bg-card)] rounded-2xl">
              <Trophy className="w-16 h-16 text-[var(--cy-text-secondary)] mx-auto mb-4" />
              <p className="text-[var(--cy-text-muted)] mb-4">No achievements yet</p>
              <p className="text-sm text-[#888888]">
                Complete routes, upload routes, and leave reviews to earn achievements!
              </p>
            </div>
          )}

          {/* How to Earn Points */}
          <div className="mt-12 bg-gradient-to-br from-[#FC4C02] to-[#FF7A00] rounded-3xl p-8 text-[var(--cy-text)]">
            <h3 className="text-2xl font-bold mb-6">How to Earn Points</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--cy-bg-card)]/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold mb-1">Complete a Route</div>
                  <div className="text-sm text-[var(--cy-text)]/80">+50 points</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--cy-bg-card)]/20 flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold mb-1">Upload New Route</div>
                  <div className="text-sm text-[var(--cy-text)]/80">+100 points</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--cy-bg-card)]/20 flex items-center justify-center flex-shrink-0">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold mb-1">Leave a Review</div>
                  <div className="text-sm text-[var(--cy-text)]/80">+25 points</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--cy-bg-card)]/20 flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold mb-1">Unlock Achievement</div>
                  <div className="text-sm text-[var(--cy-text)]/80">+200 points</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}