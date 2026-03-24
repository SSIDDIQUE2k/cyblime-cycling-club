import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Trophy, Star, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const POINTS_CONFIG = {
  EVENT_CREATION: 50,
  EVENT_PARTICIPATION: 20,
  ROUTE_UPLOAD: 30,
  ROUTE_REVIEW: 10,
  FORUM_POST: 15,
  FORUM_REPLY: 5,
  CHALLENGE_COMPLETE: 100
};

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 3500, 5000, 7500, 10000];

export const awardPoints = async (userEmail, activity, metadata = {}) => {
  try {
    const points = POINTS_CONFIG[activity] || 0;
    if (points === 0) return;

    const existingPoints = await base44.entities.UserPoints.filter({ user_email: userEmail });
    
    if (existingPoints.length > 0) {
      const current = existingPoints[0];
      const newTotal = (current.total_points || 0) + points;
      const newLevel = LEVEL_THRESHOLDS.findIndex(threshold => newTotal < threshold);
      
      await base44.entities.UserPoints.update(current.id, {
        total_points: newTotal,
        level: newLevel === -1 ? LEVEL_THRESHOLDS.length : newLevel,
        ...metadata
      });
    } else {
      await base44.entities.UserPoints.create({
        user_email: userEmail,
        total_points: points,
        level: 1,
        ...metadata
      });
    }

    await checkAndAwardBadges(userEmail);
  } catch (error) {
    console.error("Error awarding points:", error);
  }
};

const checkAndAwardBadges = async (userEmail) => {
  try {
    const points = await base44.entities.UserPoints.filter({ user_email: userEmail });
    if (points.length === 0) return;

    const userPoints = points[0];
    const existingBadges = await base44.entities.Achievement.filter({ user_email: userEmail });
    const badgeTypes = existingBadges.map(b => b.badge_type);

    const badgesToAward = [];

    if (userPoints.routes_uploaded >= 1 && !badgeTypes.includes('first_route')) {
      badgesToAward.push({
        badge_type: 'first_route',
        title: 'Route Pioneer',
        description: 'Uploaded your first route',
        icon: 'Map',
        points_awarded: 25
      });
    }

    if ((userPoints.total_elevation || 0) >= 100000 && !badgeTypes.includes('100km_climbed')) {
      badgesToAward.push({
        badge_type: '100km_climbed',
        title: 'Mountain Goat',
        description: 'Climbed 100km of elevation',
        icon: 'Mountain',
        points_awarded: 100
      });
    }

    if (userPoints.reviews_left >= 10 && !badgeTypes.includes('community_reviewer')) {
      badgesToAward.push({
        badge_type: 'community_reviewer',
        title: 'Community Reviewer',
        description: 'Left 10 helpful reviews',
        icon: 'MessageCircle',
        points_awarded: 50
      });
    }

    if (userPoints.routes_uploaded >= 10 && !badgeTypes.includes('route_master')) {
      badgesToAward.push({
        badge_type: 'route_master',
        title: 'Route Master',
        description: 'Uploaded 10 amazing routes',
        icon: 'Award',
        points_awarded: 100
      });
    }

    for (const badge of badgesToAward) {
      await base44.entities.Achievement.create({
        user_email: userEmail,
        ...badge
      });
    }
  } catch (error) {
    console.error("Error checking badges:", error);
  }
};

export default function PointsTracker({ userEmail }) {
  const { data: userPoints } = useQuery({
    queryKey: ['userPoints', userEmail],
    queryFn: async () => {
      const points = await base44.entities.UserPoints.filter({ user_email: userEmail });
      return points[0] || { total_points: 0, level: 1 };
    },
    enabled: !!userEmail
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements', userEmail],
    queryFn: () => base44.entities.Achievement.filter({ user_email: userEmail }),
    enabled: !!userEmail
  });

  if (!userPoints) return null;

  const currentLevel = userPoints.level || 1;
  const nextLevelThreshold = LEVEL_THRESHOLDS[currentLevel] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const prevLevelThreshold = LEVEL_THRESHOLDS[currentLevel - 1] || 0;
  const progressToNextLevel = ((userPoints.total_points - prevLevelThreshold) / (nextLevelThreshold - prevLevelThreshold)) * 100;

  return (
    <Card className="bg-gradient-to-br from-[#ff6b35]/10 to-transparent border-[#ff6b35]/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#ff6b35]" />
          Your Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--cy-text-muted)]">Level {currentLevel}</p>
            <p className="text-3xl font-bold text-[#ff6b35]">{userPoints.total_points} pts</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ff6b35] to-[#e55a2b] flex items-center justify-center">
            <Star className="w-8 h-8 text-[var(--cy-text)]" />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[var(--cy-text-muted)]">Progress to Level {currentLevel + 1}</span>
            <span className="font-semibold">{Math.round(progressToNextLevel)}%</span>
          </div>
          <Progress value={progressToNextLevel} className="h-2" />
          <p className="text-xs text-[var(--cy-text-muted)] mt-1">
            {nextLevelThreshold - userPoints.total_points} points to next level
          </p>
        </div>

        {achievements.length > 0 && (
          <div>
            <p className="text-sm font-semibold mb-2">Recent Achievements</p>
            <div className="flex gap-2 flex-wrap">
              {achievements.slice(0, 3).map((achievement) => (
                <Badge key={achievement.id} className="bg-[#ff6b35] text-white">
                  <Award className="w-3 h-3 mr-1" />
                  {achievement.title}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}